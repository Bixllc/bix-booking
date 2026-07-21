import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { addDaysToDateString, localToUtc } from '../availability/timezone.js'
import type { AnalyticsOverviewQuery } from './schemas.js'

const REVENUE_STATUSES = ['confirmed', 'completed'] as const
const RANGE_DAYS: Record<AnalyticsOverviewQuery['range'], number> = { '7d': 7, '30d': 30, '90d': 90 }

function isRevenueStatus(status: string): boolean {
  return (REVENUE_STATUSES as readonly string[]).includes(status)
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null
  return Math.round(((curr - prev) / prev) * 100)
}

export async function getAnalyticsOverview(workspaceId: string, range: AnalyticsOverviewQuery['range']) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw AppError.notFound('Workspace not found')

  const days = RANGE_DAYS[range]
  const today = new Date().toISOString().slice(0, 10)
  const periodStart = addDaysToDateString(today, -(days - 1))
  const periodEndExclusive = addDaysToDateString(today, 1)
  const prevStart = addDaysToDateString(periodStart, -days)
  const prevEndExclusive = periodStart

  const rangeStartUtc = localToUtc(periodStart, '00:00', workspace.timezone)
  const rangeEndUtc = localToUtc(periodEndExclusive, '00:00', workspace.timezone)
  const prevStartUtc = localToUtc(prevStart, '00:00', workspace.timezone)
  const prevEndUtc = localToUtc(prevEndExclusive, '00:00', workspace.timezone)

  const [currentBookings, previousBookings, newClientsCount, previousNewClientsCount] = await Promise.all([
    prisma.booking.findMany({
      where: { workspaceId, startAt: { gte: rangeStartUtc, lt: rangeEndUtc } },
      include: { service: true, staff: true },
    }),
    prisma.booking.findMany({
      where: { workspaceId, startAt: { gte: prevStartUtc, lt: prevEndUtc } },
      select: { status: true, priceCents: true },
    }),
    prisma.client.count({ where: { workspaceId, createdAt: { gte: rangeStartUtc, lt: rangeEndUtc } } }),
    prisma.client.count({ where: { workspaceId, createdAt: { gte: prevStartUtc, lt: prevEndUtc } } }),
  ])

  const revenueBookings = currentBookings.filter((b) => isRevenueStatus(b.status))
  const totalRevenueCents = revenueBookings.reduce((sum, b) => sum + b.priceCents, 0)
  const totalBookings = currentBookings.filter((b) => b.status !== 'cancelled').length

  const previousRevenueCents = previousBookings
    .filter((b) => isRevenueStatus(b.status))
    .reduce((sum, b) => sum + b.priceCents, 0)
  const previousTotalBookings = previousBookings.filter((b) => b.status !== 'cancelled').length

  const revenueTrend: Array<{ date: string; revenueCents: number }> = []
  for (let i = 0; i < days; i++) {
    const day = addDaysToDateString(periodStart, i)
    const dayStartUtc = localToUtc(day, '00:00', workspace.timezone)
    const dayEndUtc = localToUtc(addDaysToDateString(day, 1), '00:00', workspace.timezone)
    const dayRevenue = revenueBookings
      .filter((b) => b.startAt >= dayStartUtc && b.startAt < dayEndUtc)
      .reduce((sum, b) => sum + b.priceCents, 0)
    revenueTrend.push({ date: day, revenueCents: dayRevenue })
  }

  const bookingsByStatus: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  }
  for (const b of currentBookings) bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1

  const serviceMap = new Map<string, { serviceId: string; name: string; bookings: number; revenueCents: number }>()
  for (const b of revenueBookings) {
    const entry = serviceMap.get(b.serviceId) ?? { serviceId: b.serviceId, name: b.service.name, bookings: 0, revenueCents: 0 }
    entry.bookings += 1
    entry.revenueCents += b.priceCents
    serviceMap.set(b.serviceId, entry)
  }
  const servicePerformance = [...serviceMap.values()].sort((a, b) => b.revenueCents - a.revenueCents)

  const staffMap = new Map<string, { staffId: string; name: string; bookings: number; revenueCents: number }>()
  for (const b of revenueBookings) {
    const entry = staffMap.get(b.staffId) ?? { staffId: b.staffId, name: b.staff.name, bookings: 0, revenueCents: 0 }
    entry.bookings += 1
    entry.revenueCents += b.priceCents
    staffMap.set(b.staffId, entry)
  }
  const staffPerformance = [...staffMap.values()].sort((a, b) => b.revenueCents - a.revenueCents)

  const activeClientIds = [...new Set(currentBookings.filter((b) => b.status !== 'cancelled').map((b) => b.clientId))]
  let newClients = 0
  let returningClients = 0
  if (activeClientIds.length > 0) {
    const clients = await prisma.client.findMany({
      where: { id: { in: activeClientIds } },
      select: { id: true, createdAt: true },
    })
    for (const c of clients) {
      if (c.createdAt >= rangeStartUtc) newClients += 1
      else returningClients += 1
    }
  }

  return {
    range: { start: periodStart, end: today, days },
    summary: {
      totalRevenueCents,
      totalBookings,
      avgBookingValueCents: totalBookings > 0 ? Math.round(totalRevenueCents / totalBookings) : 0,
      newClients: newClientsCount,
      revenueChangePct: pctChange(totalRevenueCents, previousRevenueCents),
      bookingsChangePct: pctChange(totalBookings, previousTotalBookings),
      newClientsChangePct: pctChange(newClientsCount, previousNewClientsCount),
    },
    revenueTrend,
    bookingsByStatus,
    servicePerformance,
    staffPerformance,
    clientRetention: { newClients, returningClients, totalActiveClients: activeClientIds.length },
    currency: workspace.currency,
  }
}
