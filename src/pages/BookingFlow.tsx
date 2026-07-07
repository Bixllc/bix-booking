import { GripVertical, Layers, CalendarDays, Sparkles, UserRound, CreditCard, FileQuestion, CheckCircle2 } from 'lucide-react'
import { useFlow, useUpdateFlow } from '../hooks/useFlow'
import { useServices } from '../hooks/useServices'
import type { FlowStepType } from '../lib/api/types'

const STEP_META: Record<FlowStepType, { title: string; description: string; icon: typeof Layers }> = {
  service_select: { title: 'Select service', description: 'Client chooses a service to book', icon: Layers },
  date_time: { title: 'Date & time', description: 'Pick from available slots on the calendar', icon: CalendarDays },
  add_ons: { title: 'Add-ons', description: 'Optional extras clients can add to their booking', icon: Sparkles },
  customer_info: { title: 'Client details', description: 'Name, contact, and special requests', icon: UserRound },
  payment: { title: 'Payment', description: 'Deposit or full payment via card', icon: CreditCard },
  custom_field: { title: 'Custom field', description: 'A workspace-defined question', icon: FileQuestion },
}

export function BookingFlow() {
  const { data, isLoading } = useFlow()
  const updateFlow = useUpdateFlow()
  const { data: servicesData } = useServices()

  const steps = [...(data?.flow?.steps ?? [])].sort((a, b) => a.position - b.position)
  const previewService = servicesData?.services[0]

  function toggleStep(stepId: string) {
    const next = steps.map((s) => (s.id === stepId ? { ...s, enabled: !s.enabled } : s))
    updateFlow.mutate(next.map(({ type, position, required, enabled, config }) => ({ type, position, required, enabled, config })))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:h-full">
      <div className="flex-1 flex flex-col gap-5 lg:max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-ink">Booking flow</h1>
          <p className="text-body text-muted mt-0.5">The steps a client walks through to complete a booking.</p>
        </div>

        {isLoading && <p className="text-body text-muted">Loading…</p>}

        {!isLoading && (
          <div className="rounded-card bg-surface border border-border p-2 animate-scrIn">
            {steps.map((step, i) => {
              const meta = STEP_META[step.type]
              const Icon = meta.icon
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
                    <div className="text-body font-semibold text-ink">{meta.title}</div>
                    <div className="text-[12px] text-muted truncate">{meta.description}</div>
                  </div>
                  <label className="relative inline-flex items-center shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={() => toggleStep(step.id)}
                      className="peer sr-only"
                    />
                    <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-ink transition-colors" />
                    <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                  </label>
                </div>
              )
            })}
            <div className="flex items-center gap-3 px-3 py-3.5">
              <span className="w-[16px] shrink-0" />
              <span className="font-mono text-[11px] text-faint w-4 shrink-0">{steps.length + 1}</span>
              <div className="size-9 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                <CheckCircle2 size={16} strokeWidth={1.7} className="text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body font-semibold text-ink">Confirmation</div>
                <div className="text-[12px] text-muted truncate">Booking summary shown automatically</div>
              </div>
              <span className="font-mono text-[10px] uppercase text-faint shrink-0">Always on</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="rounded-card bg-ink-grad p-5 sm:p-6 lg:h-full flex flex-col animate-scrIn">
          <span className="font-mono text-meta uppercase text-gold-soft">Live preview</span>
          <div className="mt-4 rounded-field bg-white/5 border border-white/10 p-4 flex-1">
            <p className="text-white text-body font-semibold mb-1">{previewService?.name ?? 'Your service'}</p>
            <p className="text-white/50 text-[12px] mb-4">Step 2 of {steps.length + 1} · Date & time</p>
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
