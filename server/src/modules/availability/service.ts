import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { computeAvailability, type StaffAvailabilityInput, type WeekdayHours } from './engine.js'
import { addDaysToDateString, localToUtc } from './timezone.js'

export interface GetAvailabilityParams {
  workspaceId: string
  serviceId: string
  staffId?: string
  fromDate: string
  toDate: string
}

function toWeekdayHours(rows: Array<{ weekday: number; startTime: string; endTime: string }>): WeekdayHours {
  const hours: WeekdayHours = {}
  for (const row of rows) {
    if (!hours[row.weekday]) hours[row.weekday] = []
    hours[row.weekday].push([row.startTime, row.endTime])
  }
  return hours
}

const BLOCKING_STATUSES = ['pending', 'confirmed', 'completed'] as const

export async function getAvailability(params: GetAvailabilityParams) {
  const { workspaceId, serviceId, staffId, fromDate, toDate } = params

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw AppError.notFound('Workspace not found')

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service || !service.active) throw AppError.notFound('Service not found')

  const rule = await prisma.availabilityRule.findUnique({ where: { workspaceId } })
  if (!rule) throw AppError.badRequest('Workspace has not configured availability yet')

  const staffRows = await prisma.staff.findMany({
    where: {
      workspaceId,
      active: true,
      services: { some: { serviceId } },
      ...(staffId ? { id: staffId } : {}),
    },
    include: { workingHours: true, timeOff: true },
  })

  if (staffRows.length === 0) {
    if (staffId) throw AppError.notFound('Staff member does not offer this service')
    return []
  }

  const rangeStart = localToUtc(fromDate, '00:00', workspace.timezone)
  const rangeEnd = localToUtc(addDaysToDateString(toDate, 1), '00:00', workspace.timezone)

  const bookings = await prisma.booking.findMany({
    where: {
      workspaceId,
      staffId: { in: staffRows.map((s) => s.id) },
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: rangeEnd },
      endAt: { gt: rangeStart },
    },
    include: { service: { select: { bufferBeforeMin: true, bufferAfterMin: true } } },
  })

  const bookingsByStaff = new Map<string, typeof bookings>()
  for (const booking of bookings) {
    const list = bookingsByStaff.get(booking.staffId) ?? []
    list.push(booking)
    bookingsByStaff.set(booking.staffId, list)
  }

  const staffInput: StaffAvailabilityInput[] = staffRows.map((staff) => ({
    staffId: staff.id,
    weekdayHours: toWeekdayHours(staff.workingHours),
    timeOff: staff.timeOff.map((t) => ({ startAt: t.startAt, endAt: t.endAt })),
    existingBookings: (bookingsByStaff.get(staff.id) ?? []).map((b) => ({
      startAt: b.startAt,
      endAt: b.endAt,
      bufferBeforeMin: b.service.bufferBeforeMin,
      bufferAfterMin: b.service.bufferAfterMin,
    })),
  }))

  const blackoutDates = Array.isArray(rule.blackoutDates) ? (rule.blackoutDates as string[]) : []

  return computeAvailability({
    timezone: workspace.timezone,
    fromDate,
    toDate,
    slotGranularityMin: rule.slotGranularity,
    minLeadMinutes: rule.minLeadMinutes,
    maxAdvanceDays: rule.maxAdvanceDays,
    travelBufferMin: rule.travelBufferMin,
    blackoutDates,
    workspaceWeekdayHours: rule.weekdayHours as WeekdayHours,
    service: {
      durationMinutes: service.durationMinutes,
      bufferBeforeMin: service.bufferBeforeMin,
      bufferAfterMin: service.bufferAfterMin,
    },
    staff: staffInput,
  })
}
