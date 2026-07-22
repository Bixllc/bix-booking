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
        const dotOverflow = dayBookings.length - 4
        const dayNum = Number(cell.date.slice(-2))
        const isToday = cell.date === todayKey

        return (
          <div
            key={cell.date}
            className={['bg-surface min-h-[64px] sm:min-h-[104px]', cell.inMonth ? '' : 'opacity-40'].join(' ')}
          >
            {/* Mobile: compact tap target — day number + status dots, tap to see the day's list */}
            <button
              type="button"
              onClick={() => onSeeMore(cell.date)}
              className="sm:hidden flex h-full w-full flex-col items-center gap-1 p-1.5 hover:bg-canvas transition"
            >
              <span
                className={[
                  'text-[11px] font-mono',
                  isToday ? 'size-5 flex items-center justify-center rounded-full bg-ink text-white' : 'text-muted',
                ].join(' ')}
              >
                {dayNum}
              </span>
              {dayBookings.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {dayBookings.slice(0, 4).map((b) => (
                    <span key={b.id} className="size-1.5 rounded-full" style={{ backgroundColor: b.staff.color }} />
                  ))}
                  {dotOverflow > 0 && <span className="text-[9px] font-mono text-faint">+{dotOverflow}</span>}
                </div>
              )}
            </button>

            {/* Desktop: full chip list */}
            <div className="hidden sm:flex flex-col gap-1 p-2 h-full">
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
          </div>
        )
      })}
    </div>
  )
}
