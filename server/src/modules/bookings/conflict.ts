import { prisma } from '../../lib/prisma.js'
import { overlaps } from '../availability/intervals.js'

const BLOCKING_STATUSES = ['pending', 'confirmed', 'completed'] as const

// Derived from the tenant-scoped client itself, since its $extends-wrapped
// transaction client type isn't structurally assignable to the generated
// Prisma.TransactionClient type.
type TenantScopedTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export interface ConflictCheckInput {
  staffId: string
  startAt: Date
  endAt: Date
  bufferBeforeMin: number
  bufferAfterMin: number
  travelBufferMin: number
  /** Exclude this booking's own row — used when rescheduling. */
  excludeBookingId?: string
}

/**
 * Must be called inside a transaction that has already taken a row lock on the
 * staff record (`SELECT ... FOR UPDATE`), so two concurrent requests for the
 * same staff member can't both pass this check for overlapping times.
 */
export async function hasConflict(tx: TenantScopedTransactionClient, input: ConflictCheckInput): Promise<boolean> {
  const candidateBlocked = {
    start: input.startAt.getTime() - (input.bufferBeforeMin + input.travelBufferMin) * 60_000,
    end: input.endAt.getTime() + (input.bufferAfterMin + input.travelBufferMin) * 60_000,
  }

  // Widen the DB query window generously; buffers are minutes, not days.
  const queryStart = new Date(candidateBlocked.start - 24 * 60 * 60_000)
  const queryEnd = new Date(candidateBlocked.end + 24 * 60 * 60_000)

  const existing = await tx.booking.findMany({
    where: {
      staffId: input.staffId,
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: queryEnd },
      endAt: { gt: queryStart },
      ...(input.excludeBookingId ? { id: { not: input.excludeBookingId } } : {}),
    },
    include: { service: { select: { bufferBeforeMin: true, bufferAfterMin: true } } },
  })

  return existing.some((booking) => {
    const blocked = {
      start: booking.startAt.getTime() - (booking.service.bufferBeforeMin + input.travelBufferMin) * 60_000,
      end: booking.endAt.getTime() + (booking.service.bufferAfterMin + input.travelBufferMin) * 60_000,
    }
    return overlaps(blocked, candidateBlocked)
  })
}
