import type { Booking } from '../../lib/api/types'
import { relativeTime } from '../../lib/formatTime'

const statusText: Record<string, string> = {
  pending: 'requested',
  confirmed: 'booked',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'was a no-show for',
}

const statusDot: Record<string, string> = {
  pending: 'bg-gold',
  confirmed: 'bg-emerald-500',
  completed: 'bg-sky-500',
  cancelled: 'bg-faint',
  no_show: 'bg-rose-500',
}

interface RecentActivityProps {
  bookings: Booking[]
  isLoading: boolean
}

export function RecentActivity({ bookings, isLoading }: RecentActivityProps) {
  const recent = [...bookings]
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, 4)

  return (
    <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
      <h2 className="text-base2 font-bold text-ink mb-4">Recent activity</h2>

      {isLoading && <p className="text-body text-muted py-4 text-center">Loading…</p>}
      {!isLoading && recent.length === 0 && <p className="text-body text-muted py-4 text-center">No activity yet.</p>}

      <div className="flex flex-col gap-3.5">
        {recent.map((b) => (
          <div key={b.id} className="flex items-start gap-3">
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${statusDot[b.status]}`} />
            <div className="min-w-0">
              <p className="text-body text-ink leading-snug">
                <span className="font-semibold">{b.client.name}</span> {statusText[b.status]} {b.service.name}
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-wide text-faint mt-0.5">
                {relativeTime(b.startAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
