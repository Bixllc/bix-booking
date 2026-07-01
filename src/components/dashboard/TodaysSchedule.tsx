import { useState } from 'react'
import { schedule } from '../../lib/mock'

const statusStyles: Record<string, string> = {
  Confirmed: 'text-emerald-600',
  'Checked in': 'text-sky-600',
  'In progress': 'text-amber-600',
}

export function TodaysSchedule() {
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

      <div className="flex flex-col divide-y divide-border">
        {schedule.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 sm:gap-4 py-3.5">
            <div className="w-14 shrink-0 text-label text-muted leading-tight">
              <div className="font-semibold text-ink">{item.time}</div>
              <div className="font-mono text-[10px] uppercase">{item.meridiem}</div>
            </div>
            <span className={`w-1 self-stretch rounded-full ${item.accent}`} />
            <div className="size-9 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center text-[11px] font-bold text-ink">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-body font-semibold text-ink truncate">{item.client}</div>
              <div className="text-[12px] text-muted truncate">
                {item.service} · {item.detail} · w/ {item.staff}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {item.price && <div className="text-body font-semibold text-ink">{item.price}</div>}
              <div className={`text-[12px] font-medium ${statusStyles[item.status]}`}>{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
