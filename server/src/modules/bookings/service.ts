import type { Prisma } from '../../../generated/prisma/client.js'
import { prisma, rawPrisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { percentOfCents } from '../../lib/money.js'
import { stripe } from '../../lib/stripe.js'
import { setTenantId } from '../../lib/tenantContext.js'
import { BookingEvents, domainEvents } from '../../lib/events.js'
import { findOrCreateClient } from '../clients/service.js'
import { hasConflict } from './conflict.js'
import { validateAgainstFlow } from './flowValidation.js'
import type { InternalCreateBookingInput, PublicCreateBookingInput } from './schemas.js'

export async function createPublicBooking(workspaceSlug: string, input: PublicCreateBookingInput) {
  const workspace = await rawPrisma.workspace.findUnique({ where: { slug: workspaceSlug } })
  if (!workspace) throw AppError.notFound('Workspace not found')
  setTenantId(workspace.id)

  const [service, staff, addOns, flow, rule, paymentPolicy] = await Promise.all([
    prisma.service.findUnique({ where: { id: input.serviceId } }),
    prisma.staff.findFirst({
      where: { id: input.staffId, active: true, services: { some: { serviceId: input.serviceId } } },
    }),
    input.addOnIds.length > 0 ? prisma.addOn.findMany({ where: { id: { in: input.addOnIds } } }) : Promise.resolve([]),
    prisma.bookingFlow.findUnique({ where: { workspaceId: workspace.id }, include: { steps: true } }),
    prisma.availabilityRule.findUnique({ where: { workspaceId: workspace.id } }),
    prisma.paymentPolicy.findUnique({ where: { workspaceId: workspace.id } }),
  ])

  if (!service || !service.active) throw AppError.notFound('Service not found')
  if (!staff) throw AppError.notFound('Selected staff member does not offer this service')
  if (addOns.length !== input.addOnIds.length) throw AppError.badRequest('One or more add-ons are invalid')

  if (flow?.steps?.length) {
    validateAgainstFlow(flow.steps, input)
  }

  const startAt = new Date(input.startAt)
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000)
  const now = new Date()

  if (rule) {
    if (startAt.getTime() < now.getTime() + rule.minLeadMinutes * 60_000) {
      throw AppError.badRequest('Selected time no longer meets the minimum lead time')
    }
    if (startAt.getTime() > now.getTime() + rule.maxAdvanceDays * 24 * 60 * 60_000) {
      throw AppError.badRequest('Selected time is beyond the maximum advance booking window')
    }
  }

  const addOnTotalCents = addOns.reduce((sum, a) => sum + a.priceCents, 0)
  const priceCents = service.priceCents + addOnTotalCents

  const client = await findOrCreateClient({
    workspaceId: workspace.id,
    name: input.customer.name,
    email: input.customer.email,
    phone: input.customer.phone,
  })

  const travelBufferMin = rule?.travelBufferMin ?? 0

  const booking = await prisma.$transaction(async (tx) => {
    // Serializes concurrent booking attempts for this staff member so two
    // requests can't both pass the conflict check for overlapping times.
    await tx.$queryRaw`SELECT id FROM staff WHERE id = ${staff.id} FOR UPDATE`

    const conflict = await hasConflict(tx, {
      staffId: staff.id,
      startAt,
      endAt,
      bufferBeforeMin: service.bufferBeforeMin,
      bufferAfterMin: service.bufferAfterMin,
      travelBufferMin,
    })
    if (conflict) {
      throw AppError.conflict('This time slot was just booked — please choose another.')
    }

    return tx.booking.create({
      data: {
        workspaceId: workspace.id,
        serviceId: service.id,
        staffId: staff.id,
        clientId: client.id,
        startAt,
        endAt,
        status: 'pending',
        priceCents,
        currency: workspace.currency,
        answers: input.answers as Prisma.InputJsonValue,
        addOns:
          addOns.length > 0
            ? { create: addOns.map((a) => ({ addOnId: a.id, priceCents: a.priceCents })) }
            : undefined,
      },
    })
  })

  domainEvents.emit(BookingEvents.created, {
    bookingId: booking.id,
    workspaceId: workspace.id,
    clientEmail: client.email,
    clientName: client.name,
    serviceName: service.name,
    startAt,
  })

  if (!paymentPolicy || paymentPolicy.mode === 'none') {
    const confirmed = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'confirmed' } })
    domainEvents.emit(BookingEvents.confirmed, {
      bookingId: booking.id,
      workspaceId: workspace.id,
      clientEmail: client.email,
      clientName: client.name,
      serviceName: service.name,
      startAt,
    })
    return { booking: confirmed, clientSecret: null }
  }

  const amountCents =
    paymentPolicy.mode === 'deposit'
      ? (paymentPolicy.depositCents ?? percentOfCents(priceCents, paymentPolicy.depositPercent ?? 100))
      : priceCents

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: workspace.currency.toLowerCase(),
    metadata: { bookingId: booking.id, workspaceId: workspace.id },
  })

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      intentId: intent.id,
      amountCents,
      currency: workspace.currency,
      type: paymentPolicy.mode === 'deposit' ? 'deposit' : 'full',
      status: 'requires_payment',
    },
  })

  return { booking, clientSecret: intent.client_secret }
}

/** Staff/admin creating a booking directly (e.g. over the phone) — skips the public
 *  flow wizard validation and confirms immediately rather than opening a Stripe intent. */
export async function createInternalBooking(workspaceId: string, input: InternalCreateBookingInput) {
  const [workspace, service, staff, addOns, rule] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    prisma.service.findUnique({ where: { id: input.serviceId } }),
    prisma.staff.findFirst({
      where: { id: input.staffId, active: true, services: { some: { serviceId: input.serviceId } } },
    }),
    input.addOnIds.length > 0 ? prisma.addOn.findMany({ where: { id: { in: input.addOnIds } } }) : Promise.resolve([]),
    prisma.availabilityRule.findUnique({ where: { workspaceId } }),
  ])

  if (!workspace) throw AppError.notFound('Workspace not found')
  if (!service || !service.active) throw AppError.notFound('Service not found')
  if (!staff) throw AppError.notFound('Staff member does not offer this service')
  if (addOns.length !== input.addOnIds.length) throw AppError.badRequest('One or more add-ons are invalid')

  const client = input.clientId
    ? await prisma.client.findUnique({ where: { id: input.clientId } })
    : await findOrCreateClient({ workspaceId, ...input.customer! })
  if (!client) throw AppError.notFound('Client not found')

  const startAt = new Date(input.startAt)
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000)
  const addOnTotalCents = addOns.reduce((sum, a) => sum + a.priceCents, 0)
  const priceCents = service.priceCents + addOnTotalCents
  const travelBufferMin = rule?.travelBufferMin ?? 0

  const booking = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM staff WHERE id = ${staff.id} FOR UPDATE`

    const conflict = await hasConflict(tx, {
      staffId: staff.id,
      startAt,
      endAt,
      bufferBeforeMin: service.bufferBeforeMin,
      bufferAfterMin: service.bufferAfterMin,
      travelBufferMin,
    })
    if (conflict) throw AppError.conflict('This time slot is already booked')

    return tx.booking.create({
      data: {
        workspaceId,
        serviceId: service.id,
        staffId: staff.id,
        clientId: client.id,
        startAt,
        endAt,
        status: 'confirmed',
        priceCents,
        currency: workspace.currency,
        addOns:
          addOns.length > 0
            ? { create: addOns.map((a) => ({ addOnId: a.id, priceCents: a.priceCents })) }
            : undefined,
      },
    })
  })

  domainEvents.emit(BookingEvents.created, {
    bookingId: booking.id,
    workspaceId,
    clientEmail: client.email,
    clientName: client.name,
    serviceName: service.name,
    startAt,
  })
  domainEvents.emit(BookingEvents.confirmed, {
    bookingId: booking.id,
    workspaceId,
    clientEmail: client.email,
    clientName: client.name,
    serviceName: service.name,
    startAt,
  })

  return booking
}

/** Called from the Stripe webhook — runs with no tenant context, so it uses rawPrisma throughout. */
export async function confirmBookingFromPaymentIntent(intentId: string) {
  const payment = await rawPrisma.payment.findUnique({
    where: { intentId },
    include: { booking: { include: { service: true, client: true } } },
  })
  if (!payment) return
  if (payment.status === 'succeeded') return // idempotent on webhook retries

  await rawPrisma.$transaction([
    rawPrisma.payment.update({ where: { id: payment.id }, data: { status: 'succeeded' } }),
    rawPrisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'confirmed' } }),
  ])

  domainEvents.emit(BookingEvents.confirmed, {
    bookingId: payment.booking.id,
    workspaceId: payment.booking.workspaceId,
    clientEmail: payment.booking.client.email,
    clientName: payment.booking.client.name,
    serviceName: payment.booking.service.name,
    startAt: payment.booking.startAt,
  })
}

export async function cancelBooking(bookingId: string, input: { reason?: string }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, client: true },
  })
  if (!booking) throw AppError.notFound('Booking not found')
  if (booking.status === 'cancelled') throw AppError.conflict('Booking is already cancelled')
  if (booking.status === 'completed') throw AppError.conflict('Cannot cancel a completed booking')

  const policy = await prisma.cancellationPolicy.findUnique({ where: { workspaceId: booking.workspaceId } })
  const freeCancelHours = policy?.freeCancelHours ?? 24
  const lateFeePercent = policy?.lateFeePercent ?? 0

  const hoursUntilStart = (booking.startAt.getTime() - Date.now()) / 3_600_000
  const feeCents = hoursUntilStart >= freeCancelHours ? 0 : percentOfCents(booking.priceCents, lateFeePercent)

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled', cancelledAt: new Date(), cancelFeeCents: feeCents, cancelReason: input.reason },
  })

  domainEvents.emit(BookingEvents.cancelled, {
    bookingId: booking.id,
    workspaceId: booking.workspaceId,
    clientEmail: booking.client.email,
    clientName: booking.client.name,
    serviceName: booking.service.name,
    startAt: booking.startAt,
    feeCents,
  })

  return updated
}

export async function rescheduleBooking(bookingId: string, input: { startAt: string; staffId?: string }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } })
  if (!booking) throw AppError.notFound('Booking not found')
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw AppError.conflict('Cannot reschedule a cancelled or completed booking')
  }

  const staffId = input.staffId ?? booking.staffId
  const startAt = new Date(input.startAt)
  const endAt = new Date(startAt.getTime() + booking.service.durationMinutes * 60_000)
  const rule = await prisma.availabilityRule.findUnique({ where: { workspaceId: booking.workspaceId } })

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM staff WHERE id = ${staffId} FOR UPDATE`

    const conflict = await hasConflict(tx, {
      staffId,
      startAt,
      endAt,
      bufferBeforeMin: booking.service.bufferBeforeMin,
      bufferAfterMin: booking.service.bufferAfterMin,
      travelBufferMin: rule?.travelBufferMin ?? 0,
      excludeBookingId: booking.id,
    })
    if (conflict) throw AppError.conflict('That time is no longer available')

    return tx.booking.update({ where: { id: bookingId }, data: { startAt, endAt, staffId } })
  })
}

export async function updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'no_show') {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw AppError.notFound('Booking not found')

  const data: Prisma.BookingUpdateInput = { status }

  if (status === 'no_show') {
    const policy = await prisma.cancellationPolicy.findUnique({ where: { workspaceId: booking.workspaceId } })
    data.cancelFeeCents = percentOfCents(booking.priceCents, policy?.noShowFeePercent ?? 100)
  }

  return prisma.booking.update({ where: { id: bookingId }, data })
}
