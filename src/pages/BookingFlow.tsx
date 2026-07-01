import { GripVertical, Layers, CalendarDays, Sparkles, UserRound, CreditCard, CheckCircle2 } from 'lucide-react'

const steps = [
  { id: '1', title: 'Select service', description: 'Client chooses chauffeur or yacht service', icon: Layers, enabled: true },
  { id: '2', title: 'Date & time', description: 'Pick from available slots on the calendar', icon: CalendarDays, enabled: true },
  { id: '3', title: 'Add-ons', description: 'Optional extras — champagne, decor, extra hours', icon: Sparkles, enabled: true },
  { id: '4', title: 'Client details', description: 'Name, contact, and special requests', icon: UserRound, enabled: true },
  { id: '5', title: 'Payment', description: 'Deposit or full payment via card', icon: CreditCard, enabled: true },
  { id: '6', title: 'Confirmation', description: 'Booking summary and calendar invite sent', icon: CheckCircle2, enabled: true },
]

export function BookingFlow() {
  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 flex flex-col gap-5 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-ink">Booking flow</h1>
          <p className="text-body text-muted mt-0.5">The steps a client walks through to complete a booking.</p>
        </div>

        <div className="rounded-card bg-surface border border-border p-2 animate-scrIn">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={[
                  'flex items-center gap-3 px-3 py-3.5 rounded-btn hover:bg-canvas transition',
                  i !== steps.length - 1 ? 'border-b border-border' : '',
                ].join(' ')}
              >
                <GripVertical size={16} strokeWidth={1.7} className="text-faint cursor-grab shrink-0" />
                <span className="font-mono text-[11px] text-faint w-4 shrink-0">{i + 1}</span>
                <div className="size-9 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.7} className="text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-body font-semibold text-ink">{step.title}</div>
                  <div className="text-[12px] text-muted truncate">{step.description}</div>
                </div>
                <label className="relative inline-flex items-center shrink-0 cursor-pointer">
                  <input type="checkbox" defaultChecked={step.enabled} className="peer sr-only" />
                  <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-ink transition-colors" />
                  <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-80 shrink-0">
        <div className="rounded-card bg-ink-grad p-6 h-full flex flex-col animate-scrIn">
          <span className="font-mono text-meta uppercase text-gold-soft">Live preview</span>
          <div className="mt-4 rounded-field bg-white/5 border border-white/10 p-4 flex-1">
            <p className="text-white text-body font-semibold mb-1">Sunset Yacht Tour</p>
            <p className="text-white/50 text-[12px] mb-4">Step 2 of 6 · Date & time</p>
            <div className="grid grid-cols-3 gap-2">
              {['Sat 11', 'Sat 14', 'Sun 10'].map((slot) => (
                <div key={slot} className="rounded-chip bg-white/10 text-white text-[11px] font-mono text-center py-2">
                  {slot}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
