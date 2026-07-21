export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day + days))
  return d.toISOString().slice(0, 10)
}

/** 0 (Sun) .. 6 (Sat) for a 'YYYY-MM-DD' string, independent of browser timezone. */
export function weekdayOfDateString(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** Number of days in the given 1-indexed month. */
export function daysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate()
}

/** Noon-UTC Date for a 'YYYY-MM-DD' string — safe to format with a fixed timeZone without DST-boundary drift. */
export function dateStringToNoonUtc(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`)
}
