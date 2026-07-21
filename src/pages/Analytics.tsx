import { useState } from 'react'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'
import { StatCard } from '../components/dashboard/StatCard'
import { Sparkline } from '../components/ui/Sparkline'
import { formatCents } from '../lib/formatTime'
import type { AnalyticsRange } from '../lib/api/types'

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-sky-500',
  cancelled: 'bg-faint',
  no_show: 'bg-rose-500',
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">new</span>
  if (pct === 0) return <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">flat</span>
  const positive = pct > 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-0.5 font-mono text-[11px] font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
      <Icon size={12} strokeWidth={2.2} />
      {positive ? '+' : ''}
      {pct}%
    </span>
  )
}

function PerformanceList({
  rows,
  currency,
  emptyLabel,
}: {
  rows: Array<{ name: string; bookings: number; revenueCents: number }>
  currency: string
  emptyLabel: string
}) {
  const max = Math.max(...rows.map((r) => r.revenueCents), 1)
  if (rows.length === 0) {
    return <p className="text-body text-muted py-6 text-center">{emptyLabel}</p>
  }
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <div key={r.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body font-medium text-ink truncate">{r.name}</span>
            <span className="text-[12px] text-muted shrink-0">
              {formatCents(r.revenueCents, currency)} · {r.bookings} booking{r.bookings === 1 ? '' : 's'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${(r.revenueCents / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Analytics() {
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const { data, isLoading } = useAnalytics(range)

  const currency = data?.currency ?? 'USD'
  const summary = data?.summary
  const trend = data?.revenueTrend ?? []
  const statusCounts = data?.bookingsByStatus ?? {}
  const retention = data?.clientRetention

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Analytics</h1>
          <p className="text-body text-muted mt-0.5">Revenue trends, service performance, and client retention.</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={[
                'rounded-btn px-3 py-1.5 text-label font-medium transition',
                range === opt.value ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total revenue"
          value={isLoading ? '—' : formatCents(summary?.totalRevenueCents ?? 0, currency)}
          badge={!isLoading && <ChangeBadge pct={summary?.revenueChangePct ?? null} />}
        />
        <StatCard
          label="Bookings"
          value={isLoading ? '—' : String(summary?.totalBookings ?? 0)}
          badge={!isLoading && <ChangeBadge pct={summary?.bookingsChangePct ?? null} />}
        />
        <StatCard label="Avg. booking value" value={isLoading ? '—' : formatCents(summary?.avgBookingValueCents ?? 0, currency)} />
        <StatCard
          label="New clients"
          value={isLoading ? '—' : String(summary?.newClients ?? 0)}
          badge={!isLoading && <ChangeBadge pct={summary?.newClientsChangePct ?? null} />}
        />
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base2 font-bold text-ink">Revenue trend</h2>
          {data && (
            <span className="font-mono text-[11px] text-faint">
              {data.range.start} – {data.range.end}
            </span>
          )}
        </div>
        {isLoading && <p className="text-body text-muted py-8 text-center">Loading…</p>}
        {!isLoading && trend.every((t) => t.revenueCents === 0) && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 size={24} strokeWidth={1.5} className="text-faint mb-2" />
            <p className="text-body text-muted">No revenue in this period yet.</p>
          </div>
        )}
        {!isLoading && !trend.every((t) => t.revenueCents === 0) && (
          <Sparkline data={trend.map((t) => t.revenueCents / 100)} className="h-24 w-full text-gold" strokeWidth={2} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <h2 className="text-base2 font-bold text-ink mb-4">Service performance</h2>
          {isLoading ? (
            <p className="text-body text-muted py-6 text-center">Loading…</p>
          ) : (
            <PerformanceList rows={data?.servicePerformance.map((s) => ({ name: s.name, bookings: s.bookings, revenueCents: s.revenueCents })) ?? []} currency={currency} emptyLabel="No completed or confirmed bookings yet." />
          )}
        </div>

        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <h2 className="text-base2 font-bold text-ink mb-4">Staff performance</h2>
          {isLoading ? (
            <p className="text-body text-muted py-6 text-center">Loading…</p>
          ) : (
            <PerformanceList rows={data?.staffPerformance.map((s) => ({ name: s.name, bookings: s.bookings, revenueCents: s.revenueCents })) ?? []} currency={currency} emptyLabel="No completed or confirmed bookings yet." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <h2 className="text-base2 font-bold text-ink mb-4">Bookings by status</h2>
          {isLoading ? (
            <p className="text-body text-muted py-6 text-center">Loading…</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2.5">
                  <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
                  <span className="text-body text-ink flex-1">{STATUS_LABELS[status] ?? status}</span>
                  <span className="text-body font-semibold text-ink">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <h2 className="text-base2 font-bold text-ink mb-4">Client retention</h2>
          {isLoading ? (
            <p className="text-body text-muted py-6 text-center">Loading…</p>
          ) : retention && retention.totalActiveClients > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="h-2.5 w-full rounded-full bg-border overflow-hidden flex">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${(retention.returningClients / retention.totalActiveClients) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gold shrink-0" />
                  <span className="text-body text-ink">Returning</span>
                </div>
                <span className="text-body font-semibold text-ink">{retention.returningClients}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-border-2 shrink-0" />
                  <span className="text-body text-ink">New</span>
                </div>
                <span className="text-body font-semibold text-ink">{retention.newClients}</span>
              </div>
            </div>
          ) : (
            <p className="text-body text-muted py-6 text-center">No client activity in this period yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
