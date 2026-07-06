import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import {
  cancelBookingSchema,
  internalCreateBookingSchema,
  listBookingsQuerySchema,
  publicCreateBookingSchema,
  rescheduleBookingSchema,
  updateStatusSchema,
} from './schemas.js'
import {
  cancelBooking,
  createInternalBooking,
  createPublicBooking,
  rescheduleBooking,
  updateBookingStatus,
} from './service.js'

const bookingInclude = {
  service: true,
  staff: true,
  client: true,
  addOns: { include: { addOn: true } },
  payments: true,
} as const

export default async function bookingsRoutes(fastify: FastifyInstance) {
  // ---- tenant-scoped ----
  fastify.register(async (scoped) => {
    scoped.addHook('preHandler', scoped.authenticate)

    scoped.get('/bookings', async (request, reply) => {
      const query = parseOrThrow(listBookingsQuerySchema, request.query)
      const user = request.user!

      let staffFilter = query.staffId
      if (user.role === 'staff') {
        const ownStaff = await prisma.staff.findFirst({ where: { userId: user.sub } })
        staffFilter = ownStaff?.id ?? '__none__'
      }

      const bookings = await prisma.booking.findMany({
        where: {
          ...(staffFilter ? { staffId: staffFilter } : {}),
          ...(query.status ? { status: query.status } : {}),
          ...(query.from || query.to
            ? {
                startAt: {
                  ...(query.from ? { gte: new Date(query.from) } : {}),
                  ...(query.to ? { lte: new Date(query.to) } : {}),
                },
              }
            : {}),
        },
        include: bookingInclude,
        orderBy: { startAt: 'asc' },
      })
      reply.send({ bookings })
    })

    scoped.get('/bookings/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude })
      if (!booking) throw AppError.notFound('Booking not found')

      if (request.user!.role === 'staff') {
        const ownStaff = await prisma.staff.findFirst({ where: { userId: request.user!.sub } })
        if (!ownStaff || booking.staffId !== ownStaff.id) throw AppError.forbidden()
      }

      reply.send({ booking })
    })

    scoped.post('/bookings', { preHandler: scoped.requireRole('owner', 'admin') }, async (request, reply) => {
      const input = parseOrThrow(internalCreateBookingSchema, request.body)
      const booking = await createInternalBooking(request.user!.workspaceId, input)
      reply.code(201).send({ booking })
    })

    scoped.patch(
      '/bookings/:id/status',
      { preHandler: scoped.requireRole('owner', 'admin') },
      async (request, reply) => {
        const { id } = request.params as { id: string }
        const input = parseOrThrow(updateStatusSchema, request.body)
        const booking = await updateBookingStatus(id, input.status as 'pending' | 'confirmed' | 'completed' | 'no_show')
        reply.send({ booking })
      },
    )

    scoped.post('/bookings/:id/cancel', async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(cancelBookingSchema, request.body ?? {})

      if (request.user!.role === 'staff') {
        const ownStaff = await prisma.staff.findFirst({ where: { userId: request.user!.sub } })
        const booking = await prisma.booking.findUnique({ where: { id } })
        if (!booking || !ownStaff || booking.staffId !== ownStaff.id) throw AppError.forbidden()
      }

      const booking = await cancelBooking(id, input)
      reply.send({ booking })
    })

    scoped.post('/bookings/:id/reschedule', async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(rescheduleBookingSchema, request.body)

      if (request.user!.role === 'staff') {
        const ownStaff = await prisma.staff.findFirst({ where: { userId: request.user!.sub } })
        const booking = await prisma.booking.findUnique({ where: { id } })
        if (!booking || !ownStaff || booking.staffId !== ownStaff.id) throw AppError.forbidden()
      }

      const booking = await rescheduleBooking(id, input)
      reply.send({ booking })
    })
  })

  // ---- public ----
  fastify.post(
    '/public/:slug/bookings',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { slug } = request.params as { slug: string }
      const input = parseOrThrow(publicCreateBookingSchema, request.body)
      const result = await createPublicBooking(slug, input)
      reply.code(201).send({ booking: result.booking, clientSecret: result.clientSecret })
    },
  )
}
