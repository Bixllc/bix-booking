import { describe, expect, it } from 'vitest'
import { computeAvailability, type AvailabilityQuery, type WeekdayHours } from '../src/modules/availability/engine.js'
import { localToUtc } from '../src/modules/availability/timezone.js'

const TZ = 'America/New_York'

function dailyHours(start: string, end: string): WeekdayHours {
  const hours: WeekdayHours = {}
  for (let d = 0; d <= 6; d++) hours[d] = [[start, end]]
  return hours
}

function baseQuery(overrides: Partial<AvailabilityQuery> = {}): AvailabilityQuery {
  return {
    timezone: TZ,
    fromDate: '2026-06-08', // a Monday
    toDate: '2026-06-08',
    slotGranularityMin: 30,
    minLeadMinutes: 0,
    maxAdvanceDays: 60,
    travelBufferMin: 0,
    blackoutDates: [],
    workspaceWeekdayHours: dailyHours('09:00', '17:00'),
    service: { durationMinutes: 60, bufferBeforeMin: 0, bufferAfterMin: 0 },
    staff: [
      {
        staffId: 'staff-1',
        weekdayHours: dailyHours('09:00', '17:00'),
        timeOff: [],
        existingBookings: [],
      },
    ],
    now: localToUtc('2026-06-01', '00:00', TZ),
    ...overrides,
  }
}

describe('computeAvailability', () => {
  it('returns evenly spaced slots across an open window with no bookings', () => {
    const slots = computeAvailability(baseQuery())
    // 09:00-17:00 window, 60 min service, 30 min granularity -> last start is 16:00
    expect(slots.length).toBe(15)
    expect(slots[0].startAt).toEqual(localToUtc('2026-06-08', '09:00', TZ))
    expect(slots[slots.length - 1].startAt).toEqual(localToUtc('2026-06-08', '16:00', TZ))
  })

  it('allows exactly back-to-back bookings when buffers are zero', () => {
    const existingStart = localToUtc('2026-06-08', '10:00', TZ)
    const existingEnd = localToUtc('2026-06-08', '11:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        staff: [
          {
            staffId: 'staff-1',
            weekdayHours: dailyHours('09:00', '17:00'),
            timeOff: [],
            existingBookings: [{ startAt: existingStart, endAt: existingEnd, bufferBeforeMin: 0, bufferAfterMin: 0 }],
          },
        ],
      }),
    )

    const startTimes = slots.map((s) => s.startAt.getTime())
    // The 10:00 slot must be gone (it would overlap the existing booking)...
    expect(startTimes).not.toContain(existingStart.getTime())
    // ...but 11:00 (immediately after, zero gap) must be available.
    expect(startTimes).toContain(existingEnd.getTime())
  })

  it('excludes slots that would overlap an existing booking once buffers are applied', () => {
    const existingStart = localToUtc('2026-06-08', '10:00', TZ)
    const existingEnd = localToUtc('2026-06-08', '11:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        service: { durationMinutes: 60, bufferBeforeMin: 15, bufferAfterMin: 0 },
        staff: [
          {
            staffId: 'staff-1',
            weekdayHours: dailyHours('09:00', '17:00'),
            timeOff: [],
            existingBookings: [
              { startAt: existingStart, endAt: existingEnd, bufferBeforeMin: 0, bufferAfterMin: 15 },
            ],
          },
        ],
      }),
    )

    const startTimes = slots.map((s) => s.startAt.getTime())
    // Existing booking blocks until 11:00 + its own 15min after-buffer = 11:15.
    // A new booking needs 15min before-buffer, so the earliest it can start is 11:30.
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '11:00', TZ).getTime())
    expect(startTimes).toContain(localToUtc('2026-06-08', '11:30', TZ).getTime())
  })

  it('applies the global travel buffer on top of service buffers', () => {
    const existingStart = localToUtc('2026-06-08', '10:00', TZ)
    const existingEnd = localToUtc('2026-06-08', '11:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        travelBufferMin: 15,
        staff: [
          {
            staffId: 'staff-1',
            weekdayHours: dailyHours('09:00', '17:00'),
            timeOff: [],
            existingBookings: [{ startAt: existingStart, endAt: existingEnd, bufferBeforeMin: 0, bufferAfterMin: 0 }],
          },
        ],
      }),
    )

    const startTimes = slots.map((s) => s.startAt.getTime())
    // 15 min travel buffer on both sides -> next slot can't start until 11:15,
    // and granularity is 30 min from window start (09:00 grid), so 11:30 is the next grid point.
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '11:00', TZ).getTime())
    expect(startTimes).toContain(localToUtc('2026-06-08', '11:30', TZ).getTime())
  })

  it('excludes time-off ranges from a staff member availability', () => {
    const slots = computeAvailability(
      baseQuery({
        staff: [
          {
            staffId: 'staff-1',
            weekdayHours: dailyHours('09:00', '17:00'),
            timeOff: [
              { startAt: localToUtc('2026-06-08', '12:00', TZ), endAt: localToUtc('2026-06-08', '14:00', TZ) },
            ],
            existingBookings: [],
          },
        ],
      }),
    )

    const startTimes = slots.map((s) => s.startAt.getTime())
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '12:00', TZ).getTime())
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '13:00', TZ).getTime())
    // A 60 min service starting at 11:00 would run into the 12:00 time-off block.
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '11:30', TZ).getTime())
    expect(startTimes).toContain(localToUtc('2026-06-08', '14:00', TZ).getTime())
  })

  it('skips blackout dates entirely', () => {
    const slots = computeAvailability(baseQuery({ blackoutDates: ['2026-06-08'] }))
    expect(slots).toHaveLength(0)
  })

  it('enforces the minimum lead time from "now"', () => {
    const nowLocal = localToUtc('2026-06-08', '09:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        minLeadMinutes: 60,
        now: nowLocal,
      }),
    )

    const startTimes = slots.map((s) => s.startAt.getTime())
    // 09:30 is within the 60-minute lead window from 09:00 "now" — must be excluded.
    expect(startTimes).not.toContain(localToUtc('2026-06-08', '09:30', TZ).getTime())
    // 10:00 is exactly at the cutoff — must be included.
    expect(startTimes).toContain(localToUtc('2026-06-08', '10:00', TZ).getTime())
  })

  it('enforces the maximum advance-booking window', () => {
    const nowLocal = localToUtc('2026-06-01', '09:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        fromDate: '2026-06-08',
        toDate: '2026-06-08',
        maxAdvanceDays: 5, // cutoff lands mid-week, before June 8
        now: nowLocal,
      }),
    )

    expect(slots).toHaveLength(0)
  })

  it('honors slot granularity when stepping through a window', () => {
    const slots15 = computeAvailability(baseQuery({ slotGranularityMin: 15 }))
    const slots60 = computeAvailability(baseQuery({ slotGranularityMin: 60 }))

    expect(slots15.length).toBeGreaterThan(slots60.length)
    expect(slots60.map((s) => s.startAt.getTime())).toEqual([
      localToUtc('2026-06-08', '09:00', TZ).getTime(),
      localToUtc('2026-06-08', '10:00', TZ).getTime(),
      localToUtc('2026-06-08', '11:00', TZ).getTime(),
      localToUtc('2026-06-08', '12:00', TZ).getTime(),
      localToUtc('2026-06-08', '13:00', TZ).getTime(),
      localToUtc('2026-06-08', '14:00', TZ).getTime(),
      localToUtc('2026-06-08', '15:00', TZ).getTime(),
      localToUtc('2026-06-08', '16:00', TZ).getTime(),
    ])
  })

  describe('DST boundaries (America/New_York, spring-forward on 2026-03-08)', () => {
    it('converts local wall-clock time to the correct UTC offset on each side of the transition', () => {
      // Before DST: EST is UTC-5, so 09:00 local == 14:00 UTC.
      const beforeDst = localToUtc('2026-03-07', '09:00', TZ)
      expect(beforeDst.getUTCHours()).toBe(14)

      // After DST: EDT is UTC-4, so 09:00 local == 13:00 UTC.
      const afterDst = localToUtc('2026-03-08', '09:00', TZ)
      expect(afterDst.getUTCHours()).toBe(13)
    })

    it('produces correctly shifted slot times across the spring-forward date', () => {
      const before = computeAvailability(
        baseQuery({
          fromDate: '2026-03-07',
          toDate: '2026-03-07',
          now: localToUtc('2026-03-01', '00:00', TZ),
        }),
      )
      const after = computeAvailability(
        baseQuery({
          fromDate: '2026-03-08',
          toDate: '2026-03-08',
          now: localToUtc('2026-03-01', '00:00', TZ),
        }),
      )

      expect(before[0].startAt).toEqual(localToUtc('2026-03-07', '09:00', TZ))
      expect(after[0].startAt).toEqual(localToUtc('2026-03-08', '09:00', TZ))
      // Same local wall-clock start, but the UTC instant is one hour earlier post-DST.
      expect(after[0].startAt.getTime() - before[0].startAt.getTime()).toBe(23 * 60 * 60_000)
    })
  })

  it('never returns overlapping slots for the same staff member across the whole computed set', () => {
    const existingStart = localToUtc('2026-06-08', '10:00', TZ)
    const existingEnd = localToUtc('2026-06-08', '11:00', TZ)

    const slots = computeAvailability(
      baseQuery({
        slotGranularityMin: 15,
        staff: [
          {
            staffId: 'staff-1',
            weekdayHours: dailyHours('09:00', '17:00'),
            timeOff: [],
            existingBookings: [{ startAt: existingStart, endAt: existingEnd, bufferBeforeMin: 0, bufferAfterMin: 0 }],
          },
        ],
      }),
    )

    for (const slot of slots) {
      const overlapsExisting = slot.startAt.getTime() < existingEnd.getTime() && existingStart.getTime() < slot.endAt.getTime()
      expect(overlapsExisting).toBe(false)
    }
  })

  it('only offers a requested staff member, excluding others who also offer the service', () => {
    const slots = computeAvailability(
      baseQuery({
        staff: [
          { staffId: 'staff-1', weekdayHours: dailyHours('09:00', '17:00'), timeOff: [], existingBookings: [] },
          { staffId: 'staff-2', weekdayHours: dailyHours('09:00', '17:00'), timeOff: [], existingBookings: [] },
        ],
      }),
    )

    const staffIds = new Set(slots.map((s) => s.staffId))
    expect(staffIds).toEqual(new Set(['staff-1', 'staff-2']))
  })
})
