import { intersectIntervals, subtractIntervals, overlaps, type Interval } from './intervals.js'
import { enumerateDates, localToUtc, weekdayOf } from './timezone.js'

export type WeekdayHours = Record<number, Array<[string, string]>>

export interface ExistingBooking {
  startAt: Date
  endAt: Date
  bufferBeforeMin: number
  bufferAfterMin: number
}

export interface StaffAvailabilityInput {
  staffId: string
  weekdayHours: WeekdayHours
  timeOff: Array<{ startAt: Date; endAt: Date }>
  existingBookings: ExistingBooking[]
}

export interface AvailabilityQuery {
  timezone: string
  fromDate: string // 'YYYY-MM-DD', inclusive, workspace-local
  toDate: string // 'YYYY-MM-DD', inclusive, workspace-local
  slotGranularityMin: number
  minLeadMinutes: number
  maxAdvanceDays: number
  travelBufferMin: number
  blackoutDates: string[] // 'YYYY-MM-DD'
  workspaceWeekdayHours: WeekdayHours
  service: {
    durationMinutes: number
    bufferBeforeMin: number
    bufferAfterMin: number
  }
  staff: StaffAvailabilityInput[]
  /** Injectable for deterministic tests; defaults to the real current time. */
  now?: Date
}

export interface AvailabilitySlot {
  staffId: string
  startAt: Date
  endAt: Date
}

function windowsForDate(
  dateStr: string,
  weekdayHours: WeekdayHours,
  timezone: string,
): Interval[] {
  const dow = weekdayOf(dateStr)
  const ranges = weekdayHours[dow] ?? []
  return ranges.map(([start, end]) => ({
    start: localToUtc(dateStr, start, timezone).getTime(),
    end: localToUtc(dateStr, end, timezone).getTime(),
  }))
}

function bookingBlockedInterval(booking: ExistingBooking, travelBufferMin: number): Interval {
  return {
    start: booking.startAt.getTime() - (booking.bufferBeforeMin + travelBufferMin) * 60_000,
    end: booking.endAt.getTime() + (booking.bufferAfterMin + travelBufferMin) * 60_000,
  }
}

export function computeAvailability(query: AvailabilityQuery): AvailabilitySlot[] {
  const now = query.now ?? new Date()
  const leadCutoff = now.getTime() + query.minLeadMinutes * 60_000
  const advanceCutoff = now.getTime() + query.maxAdvanceDays * 24 * 60 * 60_000
  const blackout = new Set(query.blackoutDates)
  const durationMs = query.service.durationMinutes * 60_000
  const stepMs = query.slotGranularityMin * 60_000

  const slots: AvailabilitySlot[] = []
  const dates = enumerateDates(query.fromDate, query.toDate)

  for (const staff of query.staff) {
    const staffBlocked = staff.existingBookings.map((b) => bookingBlockedInterval(b, query.travelBufferMin))

    for (const dateStr of dates) {
      if (blackout.has(dateStr)) continue

      const workspaceWindows = windowsForDate(dateStr, query.workspaceWeekdayHours, query.timezone)
      const staffWindows = windowsForDate(dateStr, staff.weekdayHours, query.timezone)
      let windows = intersectIntervals(workspaceWindows, staffWindows)
      if (windows.length === 0) continue

      const timeOffToday: Interval[] = staff.timeOff.map((t) => ({
        start: t.startAt.getTime(),
        end: t.endAt.getTime(),
      }))
      windows = subtractIntervals(windows, timeOffToday)

      for (const window of windows) {
        for (let start = window.start; start + durationMs <= window.end; start += stepMs) {
          if (start < leadCutoff) continue
          if (start > advanceCutoff) continue

          const end = start + durationMs
          const candidateBlocked: Interval = {
            start: start - (query.service.bufferBeforeMin + query.travelBufferMin) * 60_000,
            end: end + (query.service.bufferAfterMin + query.travelBufferMin) * 60_000,
          }

          const conflict = staffBlocked.some((b) => overlaps(b, candidateBlocked))
          if (conflict) continue

          slots.push({ staffId: staff.staffId, startAt: new Date(start), endAt: new Date(end) })
        }
      }
    }
  }

  return slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
}
