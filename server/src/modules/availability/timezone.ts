/** Offset (in minutes) to ADD to a UTC instant to get local wall-clock time in `timeZone`, at that instant. */
function offsetMinutesAt(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(instant)
  const map: Record<string, string> = {}
  for (const part of parts) map[part.type] = part.value

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour === '24' ? '0' : map.hour),
    Number(map.minute),
    Number(map.second),
  )
  return (asUtc - instant.getTime()) / 60_000
}

/**
 * Converts a local wall-clock time on a given calendar date, in `timeZone`, to the
 * correct UTC instant — correctly handling DST by re-deriving the offset once the
 * first guess is close, rather than assuming a fixed offset.
 */
export function localToUtc(dateStr: string, time: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)

  const naiveUtcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const offset1 = offsetMinutesAt(naiveUtcGuess, timeZone)
  let candidate = new Date(naiveUtcGuess.getTime() - offset1 * 60_000)

  const offset2 = offsetMinutesAt(candidate, timeZone)
  if (offset2 !== offset1) {
    candidate = new Date(naiveUtcGuess.getTime() - offset2 * 60_000)
  }

  return candidate
}

/** Adds `days` calendar days to a 'YYYY-MM-DD' string, returning a 'YYYY-MM-DD' string. */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day + days))
  return d.toISOString().slice(0, 10)
}

/** ISO weekday-independent day-of-week for a 'YYYY-MM-DD' string: 0 (Sun) .. 6 (Sat). */
export function weekdayOf(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** Inclusive list of 'YYYY-MM-DD' strings from `fromDate` to `toDate`. */
export function enumerateDates(fromDate: string, toDate: string): string[] {
  const dates: string[] = []
  let cursor = fromDate
  // Guard against runaway ranges — availability queries are meant to be short-range.
  for (let i = 0; i < 370 && cursor <= toDate; i++) {
    dates.push(cursor)
    cursor = addDaysToDateString(cursor, 1)
  }
  return dates
}
