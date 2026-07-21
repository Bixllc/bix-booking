import type { Booking } from '../../lib/api/types'
import { dateStringToNoonUtc } from '../../lib/dates'
import { formatCents, localDateKeyOf, splitTimeInZone } from '../../lib/formatTime'

interface WeekViewProps {
  days: string[]
  bookings: Booking[]
  timezone: string
  currency: string
  todayKey: string
  onSelectBooking: (booking: Booking) => void
}

export function WeekView({ days, bookings, timezone, currency, todayKey, onSelectBooking }: WeekViewProps) {
  const byDate = new Map<string, Booking[]>()
  for (const b of bookings) {
    const key = localDateKeyOf(b.startAt, timezone)
    const list = byDate.get(key) ?? []
    list.push(b)
    byDate.set(key, list)
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-2.5 animate-scrIn">
      {days.map((day) => {
        const dayBookings = byDate.get(day) ?? []
        const isToday = day === todayKey
        const label = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(dateStringToNoonUtc(day))
        const dayNum = Number(day.slice(-2))

        return (
          <div key={day} className="rounded-card bg-surface border border-border p-2.5 flex flex-col gap-2 min-h-[140px]">
            <div className="flex items-center gap-1.5 px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wide text-faint">{label}</span>
              <span
                className={[
                  'text-[11.5px] font-mono',
                  isToday ? 'size-5 flex items-center justify-center rounded-full bg-ink text-white' : 'text-ink',
                ].join(' ')}
              >
                {dayNum}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {dayBookings.length === 0 && <p className="text-[11.5px] text-faint px-0.5">No bookings</p>}
              {dayBookings.map((b) => {
                const { time } = splitTimeInZone(b.startAt, timezone)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBooking(b)}
                    className="text-left rounded-field border border-border p-2 hover:border-gold transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: b.staff.color }} />
                      <span className="text-[10.5px] font-mono text-muted">{time}</span>
                    </div>
                    <div className="text-[12px] font-semibold text-ink truncate mt-0.5">{b.client.name}</div>
                    <div className="text-[11px] text-muted truncate">{b.service.name}</div>
                    <div className="text-[11px] font-medium text-ink mt-0.5">{formatCents(b.priceCents, currency)}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
