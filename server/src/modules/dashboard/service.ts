import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { addDaysToDateString, localToUtc } from '../availability/timezone.js'

const REVENUE_STATUSES = ['confirmed', 'completed'] as const
const SPARKLINE_DAYS = 12

export async function getDashboardStats(workspaceId: string, dateStr?: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw AppError.notFound('Workspace not found')

  const today = dateStr ?? new Date().toISOString().slice(0, 10)
  const dayStart = localToUtc(today, '00:00', workspace.timezone)
  const dayEnd = localToUtc(addDaysToDateString(today, 1), '00:00', workspace.timezone)

  const [todaysBookings, newClientsCount] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: dayStart, lt: dayEnd }, status: { not: 'cancelled' } },
    }),
    prisma.client.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
  ])

  const revenueCents = todaysBookings
    .filter((b) => (REVENUE_STATUSES as readonly string[]).includes(b.status))
    .reduce((sum, b) => sum + b.priceCents, 0)

  const totalAppointments = todaysBookings.length
  const completedAppointments = todaysBookings.filter((b) => b.status === 'completed').length

  const sparklineStart = addDaysToDateString(today, -(SPARKLINE_DAYS - 1))
  const sparklineRangeStart = localToUtc(sparklineStart, '00:00', workspace.timezone)
  const sparklineBookings = await prisma.booking.findMany({
    where: {
      startAt: { gte: sparklineRangeStart, lt: dayEnd },
      status: { in: [...REVENUE_STATUSES] },
    },
    select: { startAt: true, priceCents: true },
  })

  const sparkline: number[] = []
  for (let i = 0; i < SPARKLINE_DAYS; i++) {
    const day = addDaysToDateString(sparklineStart, i)
    const dStart = localToUtc(day, '00:00', workspace.timezone)
    const dEnd = localToUtc(addDaysToDateString(day, 1), '00:00', workspace.timezone)
    const total = sparklineBookings
      .filter((b) => b.startAt >= dStart && b.startAt < dEnd)
      .reduce((sum, b) => sum + b.priceCents, 0)
    sparkline.push(Math.round(total / 100))
  }

  return {
    date: today,
    todaysRevenueCents: revenueCents,
    appointments: { total: totalAppointments, completed: completedAppointments },
    newClients: newClientsCount,
    revenueSparkline: sparkline,
    currency: workspace.currency,
  }
}
