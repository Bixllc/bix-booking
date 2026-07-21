import type { Booking } from '../../lib/api/types'
import { localDateKeyOf, splitTimeInZone } from '../../lib/formatTime'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE = 3

interface MonthViewProps {
  cells: Array<{ date: string; inMonth: boolean }>
  bookings: Booking[]
  timezone: string
  todayKey: string
  onSelectBooking: (booking: Booking) => void
  onSeeMore: (date: string) => void
}

export function MonthView({ cells, bookings, timezone, todayKey, onSelectBooking, onSeeMore }: MonthViewProps) {
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
    <div className="rounded-card border border-border bg-border overflow-hidden grid grid-cols-7 gap-px animate-scrIn">
      {WEEKDAY_LABELS.map((label) => (
        <div key={label} className="bg-surface px-2 py-2 text-center text-[10.5px] font-mono uppercase tracking-wide text-faint">
          {label}
        </div>
      ))}
      {cells.map((cell) => {
        const dayBookings = byDate.get(cell.date) ?? []
        const visible = dayBookings.slice(0, MAX_VISIBLE)
        const overflow = dayBookings.length - visible.length
        const dayNum = Number(cell.date.slice(-2))
        const isToday = cell.date === todayKey

        return (
          <div
            key={cell.date}
            className={[
              'bg-surface min-h-[104px] p-1.5 sm:p-2 flex flex-col gap-1',
              cell.inMonth ? '' : 'opacity-40',
            ].join(' ')}
          >
            <div className="flex items-center justify-between px-0.5">
              <span
                className={[
                  'text-[11px] font-mono',
                  isToday ? 'size-5 flex items-center justify-center rounded-full bg-ink text-white' : 'text-muted',
                ].join(' ')}
              >
                {dayNum}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {visible.map((b) => {
                const { time } = splitTimeInZone(b.startAt, timezone)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBooking(b)}
                    className="text-left rounded-chip px-1.5 py-1 text-[10.5px] leading-tight text-white truncate hover:brightness-110 transition"
                    style={{ backgroundColor: b.staff.color }}
                    title={`${time} · ${b.client.name}`}
                  >
                    {time} {b.client.name}
                  </button>
                )
              })}
              {overflow > 0 && (
                <button
                  type="button"
                  onClick={() => onSeeMore(cell.date)}
                  className="text-left px-1.5 text-[10px] font-medium text-muted hover:text-ink transition"
                >
                  +{overflow} more
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
