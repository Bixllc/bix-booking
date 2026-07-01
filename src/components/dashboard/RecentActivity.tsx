import { activity } from '../../lib/mock'

export function RecentActivity() {
  return (
    <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
      <h2 className="text-base2 font-bold text-ink mb-4">Recent activity</h2>
      <div className="flex flex-col gap-3.5">
        {activity.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${a.dot}`} />
            <div className="min-w-0">
              <p className="text-body text-ink leading-snug">
                <span className="font-semibold">{a.actor}</span> {a.text}
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-wide text-faint mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
