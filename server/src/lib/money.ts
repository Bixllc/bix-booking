export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function percentOfCents(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100)
}
