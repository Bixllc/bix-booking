import { Check, X } from 'lucide-react'
import { confirmations } from '../../lib/mock'

export function PendingConfirmations() {
  return (
    <div className="rounded-card bg-surface border border-border p-5 animate-scrIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base2 font-bold text-ink">Pending confirmations</h2>
        <span className="rounded-chip bg-gold-soft/40 px-2 py-0.5 text-[11px] font-mono font-semibold text-gold">
          {confirmations.length}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {confirmations.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-3">
            <div className={`size-8 shrink-0 rounded-avatar flex items-center justify-center text-[11px] font-bold ${c.color}`}>
              {c.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-body font-semibold text-ink truncate">{c.name}</div>
              <div className="text-[11.5px] text-muted truncate">{c.detail}</div>
            </div>
            <button
              type="button"
              className="shrink-0 size-7 rounded-btn bg-ink text-white flex items-center justify-center hover:brightness-110 transition"
              aria-label="Confirm"
            >
              <Check size={14} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="shrink-0 size-7 rounded-btn border border-border text-muted flex items-center justify-center hover:bg-canvas transition"
              aria-label="Decline"
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
