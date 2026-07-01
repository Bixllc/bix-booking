import { StatCard } from '../components/dashboard/StatCard'
import { Sparkline } from '../components/ui/Sparkline'
import { TodaysSchedule } from '../components/dashboard/TodaysSchedule'
import { PendingConfirmations } from '../components/dashboard/PendingConfirmations'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { newClients, revenueSparkline } from '../lib/mock'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="Today's revenue"
          value="$4,280"
          badge={
            <span className="rounded-chip bg-emerald-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-600">
              +12.4%
            </span>
          }
        >
          <Sparkline data={revenueSparkline} className="h-8 w-full text-gold" />
        </StatCard>

        <StatCard
          label="Appointments"
          value="18"
          badge={<span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">today</span>}
          footer={<p className="text-[12px] text-muted -mt-1">6 completed · 12 to go</p>}
        >
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-gold" style={{ width: '33%' }} />
          </div>
        </StatCard>

        <StatCard
          label="New clients"
          value="34"
          badge={
            <span className="rounded-chip bg-emerald-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-600">
              +8
            </span>
          }
        >
          <div className="flex items-center">
            {newClients.map((c, i) => (
              <div
                key={i}
                style={{ marginLeft: i === 0 ? 0 : -8 }}
                className={`size-7 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold ${c.color}`}
              >
                {c.initials}
              </div>
            ))}
            <span className="ml-2 text-[12px] text-muted">+31</span>
          </div>
        </StatCard>

        <StatCard
          label="Pending confirmations"
          value="5"
          accent
          badge={<span className="size-2 rounded-full bg-gold" />}
          footer={
            <button
              type="button"
              className="w-full rounded-btn bg-surface border border-gold-soft py-2 text-label font-semibold text-ink hover:brightness-[.97] transition"
            >
              Review now
            </button>
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-2">
          <TodaysSchedule />
        </div>
        <div className="flex flex-col gap-5">
          <PendingConfirmations />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
