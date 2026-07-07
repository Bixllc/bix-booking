import { useState } from 'react'
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

interface TodaysScheduleProps {
  bookings: Booking[]
  timezone: string
  currency: string
  isLoading: boolean
}

export function TodaysSchedule({ bookings, timezone, currency, isLoading }: TodaysScheduleProps) {
  const [staffFilter, setStaffFilter] = useState<'all' | 'mine'>('all')

  return (
    <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <h2 className="text-base2 font-bold text-ink">Today's schedule</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStaffFilter('all')}
            className={[
              'rounded-btn px-3 py-1.5 text-label font-medium transition',
              staffFilter === 'all' ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
            ].join(' ')}
          >
            All staff
          </button>
          <button type="button" className="rounded-btn border border-border px-3 py-1.5 text-label font-medium text-ink hover:bg-canvas transition">
            Open calendar
          </button>
        </div>
      </div>

      {isLoading && <p className="text-body text-muted py-6 text-center">Loading schedule…</p>}
      {!isLoading && bookings.length === 0 && (
        <p className="text-body text-muted py-6 text-center">No appointments today.</p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {bookings.map((item) => {
          const { time, meridiem } = splitTimeInZone(item.startAt, timezone)
          return (
            <div key={item.id} className="flex items-center gap-2.5 sm:gap-4 py-3.5">
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
