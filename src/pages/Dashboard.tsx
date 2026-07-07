import { StatCard } from '../components/dashboard/StatCard'
import { Sparkline } from '../components/ui/Sparkline'
import { TodaysSchedule } from '../components/dashboard/TodaysSchedule'
import { PendingConfirmations } from '../components/dashboard/PendingConfirmations'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { useAuth } from '../context/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useBookings } from '../hooks/useBookings'
import { formatCents, isSameLocalDate } from '../lib/formatTime'

export function Dashboard() {
  const { workspace } = useAuth()
  const timezone = workspace?.timezone ?? 'UTC'
  const currency = workspace?.currency ?? 'USD'

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings()

  const allBookings = bookingsData?.bookings ?? []
  const todaysBookings = allBookings
    .filter((b) => isSameLocalDate(b.startAt, timezone) && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  const pendingBookings = allBookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  const total = stats?.appointments.total ?? 0
  const completed = stats?.appointments.completed ?? 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard label="Today's revenue" value={statsLoading ? '—' : formatCents(stats?.todaysRevenueCents ?? 0, currency)}>
          <Sparkline data={stats?.revenueSparkline ?? []} className="h-8 w-full text-gold" />
        </StatCard>

        <StatCard
          label="Appointments"
          value={statsLoading ? '—' : String(total)}
          badge={<span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">today</span>}
          footer={<p className="text-[12px] text-muted -mt-1">{completed} completed · {Math.max(total - completed, 0)} to go</p>}
        >
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </StatCard>

        <StatCard label="New clients" value={statsLoading ? '—' : String(stats?.newClients ?? 0)}>
          <p className="text-[12px] text-muted">Signed up today</p>
        </StatCard>

        <StatCard
          label="Pending confirmations"
          value={bookingsLoading ? '—' : String(pendingBookings.length)}
          accent
          badge={<span className="size-2 rounded-full bg-gold" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        <div className="lg:col-span-2">
          <TodaysSchedule bookings={todaysBookings} timezone={timezone} currency={currency} isLoading={bookingsLoading} />
        </div>
        <div className="flex flex-col gap-4 sm:gap-5">
          <PendingConfirmations bookings={pendingBookings} timezone={timezone} isLoading={bookingsLoading} />
          <RecentActivity bookings={allBookings} isLoading={bookingsLoading} />
        </div>
      </div>
    </div>
  )
}
