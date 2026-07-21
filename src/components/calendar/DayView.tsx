import { CalendarX2 } from 'lucide-react'
import type { Booking } from '../../lib/api/types'
import { formatCents, initialsOf, splitTimeInZone } from '../../lib/formatTime'

const statusStyles: Record<string, string> = {
  confirmed: 'text-emerald-600',
  completed: 'text-sky-600',
  pending: 'text-amber-600',
  cancelled: 'text-faint',
  no_show: 'text-rose-600',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  completed: 'Completed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

interface DayViewProps {
  bookings: Booking[]
  timezone: string
  currency: string
  onSelectBooking: (booking: Booking) => void
}

export function DayView({ bookings, timezone, currency, onSelectBooking }: DayViewProps) {
  const sorted = [...bookings].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  if (sorted.length === 0) {
    return (
      <div className="rounded-card bg-surface border border-border animate-scrIn flex flex-col items-center justify-center py-16 text-center">
        <CalendarX2 size={26} strokeWidth={1.5} className="text-faint mb-3" />
        <p className="text-body text-muted">Nothing on the books for this day.</p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-surface border border-border animate-scrIn overflow-hidden">
      <div className="flex flex-col divide-y divide-border">
        {sorted.map((item) => {
          const { time, meridiem } = splitTimeInZone(item.startAt, timezone)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectBooking(item)}
              className="flex items-center gap-2.5 sm:gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-canvas transition"
            >
              <div className="w-14 shrink-0 text-label text-muted leading-tight">
                <div className="font-semibold text-ink">{time}</div>
                <div className="font-mono text-[10px] uppercase">{meridiem}</div>
              </div>
              <span className="w-1 self-stretch rounded-full" style={{ backgroundColor: item.staff.color }} />
              <div className="size-9 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center text-[11px] font-bold text-ink">
                {initialsOf(item.client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body font-semibold text-ink truncate">{item.client.name}</div>
                <div className="text-[12px] text-muted truncate">
                  {item.service.name} · w/ {item.staff.name}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-body font-semibold text-ink">{formatCents(item.priceCents, currency)}</div>
                <div className={`text-[12px] font-medium ${statusStyles[item.status]}`}>{statusLabels[item.status]}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
