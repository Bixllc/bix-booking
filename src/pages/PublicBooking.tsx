import { useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Car, CheckCircle2, ChevronLeft, Clock3, Ship, Sparkles } from 'lucide-react'
import { getPublicWorkspace, getPublicServices, getPublicAvailability, createPublicBooking } from '../lib/api/public'
import type { PublicService, AvailabilitySlot } from '../lib/api/types'
import { ApiError } from '../lib/apiClient'
import { formatCents } from '../lib/formatTime'
import { addDaysToDateString } from '../lib/dates'
import { BixMark } from '../components/ui/BixMark'

type Step = 'service' | 'slot' | 'addons' | 'details' | 'review' | 'done'

function iconFor(category: string) {
  const c = category.toLowerCase()
  if (c.includes('yacht')) return Ship
  if (c.includes('chauffeur') || c.includes('airport')) return Car
  return Sparkles
}

function dedupeByStartAt(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const seen = new Map<string, AvailabilitySlot>()
  for (const s of slots) {
    if (!seen.has(s.startAt)) seen.set(s.startAt, s)
  }
  return [...seen.values()].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
}

const DAYS_AHEAD = 14

export function PublicBooking() {
  const { slug = '' } = useParams()
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState<PublicService | null>(null)
  const [dayOffset, setDayOffset] = useState(0)
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null)
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['public-workspace', slug],
    queryFn: () => getPublicWorkspace(slug),
    enabled: !!slug,
  })
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services', slug],
    queryFn: () => getPublicServices(slug),
    enabled: !!slug,
  })

  const timezone = wsData?.workspace.timezone ?? 'UTC'
  const currency = wsData?.workspace.currency ?? 'USD'

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const fromDate = addDaysToDateString(todayStr, 0)
  const toDate = addDaysToDateString(todayStr, DAYS_AHEAD)

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['public-availability', slug, service?.id, fromDate, toDate],
    queryFn: () => getPublicAvailability(slug, { serviceId: service!.id, from: fromDate, to: toDate }),
    enabled: !!slug && !!service,
  })

  const bookingMutation = useMutation({
    mutationFn: () =>
      createPublicBooking(slug, {
        serviceId: service!.id,
        staffId: slot!.staffId,
        startAt: slot!.startAt,
        addOnIds,
        customer: { name, email, phone: phone || undefined },
      }),
  })

  const allSlots = availabilityData?.slots ?? []
  const dayStr = addDaysToDateString(todayStr, dayOffset)
  const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const slotsForDay = dedupeByStartAt(allSlots).filter((s) => dayFmt.format(new Date(s.startAt)) === dayStr)

  const selectedAddOns = (service?.addOns ?? []).filter((a) => addOnIds.includes(a.id))
  const totalCents = (service?.priceCents ?? 0) + selectedAddOns.reduce((sum, a) => sum + a.priceCents, 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    try {
      await bookingMutation.mutateAsync()
      setStep('done')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (wsLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-canvas text-muted text-body">Loading…</div>
  }

  if (!wsData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas text-muted text-body">
        This booking page doesn't exist.
      </div>
    )
  }

  const stepIndex = { service: 0, slot: 1, addons: 2, details: 3, review: 4, done: 5 }[step]
  const totalSteps = 5

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col items-center px-4 py-10">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-indigo-500">
          <BixMark size={22} />
        </span>
        <span className="text-lead text-ink">{wsData.workspace.name}</span>
      </div>
      <p className="text-body text-muted mb-8">Book your appointment</p>

      {step !== 'done' && (
        <div className="w-full max-w-lg flex items-center gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-gold' : 'bg-border'}`} />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg rounded-card bg-surface border border-border p-6 sm:p-7 animate-scrIn">
        {step === 'service' && (
          <div className="flex flex-col gap-4">
            <h1 className="text-lead text-ink">Choose a service</h1>
            {servicesLoading && <p className="text-body text-muted">Loading services…</p>}
            <div className="flex flex-col gap-3">
              {(servicesData?.services ?? []).map((s) => {
                const Icon = iconFor(s.category)
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setService(s)
                      setDayOffset(0)
                      setSlot(null)
                      setStep('slot')
                    }}
                    className="flex items-center gap-3.5 rounded-field border border-border p-4 text-left hover:border-gold transition"
                  >
                    <div className="size-10 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.7} className="text-gold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-body font-semibold text-ink">{s.name}</div>
                      <div className="text-[12px] text-muted flex items-center gap-1.5 mt-0.5">
                        <Clock3 size={12} strokeWidth={1.7} />
                        {s.durationMinutes} min
                      </div>
                    </div>
                    <span className="text-body font-bold text-ink shrink-0">{formatCents(s.priceCents, currency)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 'slot' && service && (
          <div className="flex flex-col gap-4">
            <button type="button" onClick={() => setStep('service')} className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition self-start">
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
            <h1 className="text-lead text-ink">Pick a date & time</h1>
            <p className="text-[12.5px] text-muted -mt-2">{service.name}</p>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {Array.from({ length: DAYS_AHEAD }).map((_, i) => {
                const d = addDaysToDateString(todayStr, i)
                const label = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', day: 'numeric' }).format(
                  new Date(`${d}T12:00:00Z`),
                )
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDayOffset(i)
                      setSlot(null)
                    }}
                    className={[
                      'shrink-0 rounded-btn px-3 py-2 text-[12px] font-medium font-mono transition',
                      dayOffset === i ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {availabilityLoading && <p className="text-body text-muted">Loading availability…</p>}
            {!availabilityLoading && slotsForDay.length === 0 && (
              <p className="text-body text-muted py-4 text-center">No openings this day — try another date.</p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {slotsForDay.map((s) => {
                const label = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(
                  new Date(s.startAt),
                )
                const isSelected = slot?.startAt === s.startAt
                return (
                  <button
                    key={s.startAt}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={[
                      'rounded-chip px-2 py-2.5 text-[12.5px] font-mono text-center transition',
                      isSelected ? 'bg-ink text-white' : 'border border-border text-ink hover:border-gold',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={!slot}
              onClick={() => setStep(service.addOns.length > 0 ? 'addons' : 'details')}
              className="mt-2 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'addons' && service && (
          <div className="flex flex-col gap-4">
            <button type="button" onClick={() => setStep('slot')} className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition self-start">
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
            <h1 className="text-lead text-ink">Add anything extra?</h1>
            <div className="flex flex-col gap-2.5">
              {service.addOns.map((a) => {
                const checked = addOnIds.includes(a.id)
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 rounded-field border border-border p-3.5 cursor-pointer hover:border-gold transition"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setAddOnIds((prev) => (checked ? prev.filter((id) => id !== a.id) : [...prev, a.id]))
                      }
                      className="size-4 accent-ink"
                    />
                    <span className="flex-1 text-body text-ink">{a.name}</span>
                    <span className="text-body font-semibold text-ink">{formatCents(a.priceCents, currency)}</span>
                  </label>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="mt-2 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep(service && service.addOns.length > 0 ? 'addons' : 'slot')}
              className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition self-start"
            >
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
            <h1 className="text-lead text-ink">Your details</h1>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Phone (optional)</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <button
              type="button"
              disabled={!name || !email}
              onClick={() => setStep('review')}
              className="mt-2 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'review' && service && slot && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <button type="button" onClick={() => setStep('details')} className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink transition self-start">
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
            <h1 className="text-lead text-ink">Review & confirm</h1>

            <div className="rounded-field bg-canvas p-4 flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between"><span className="text-muted">Service</span><span className="text-ink font-medium">{service.name}</span></div>
              <div className="flex justify-between">
                <span className="text-muted">When</span>
                <span className="text-ink font-medium">
                  {new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(slot.startAt))}
                </span>
              </div>
              {selectedAddOns.map((a) => (
                <div key={a.id} className="flex justify-between"><span className="text-muted">{a.name}</span><span className="text-ink font-medium">{formatCents(a.priceCents, currency)}</span></div>
              ))}
              <div className="flex justify-between pt-2 border-t border-border-2">
                <span className="text-ink font-semibold">Total</span>
                <span className="text-ink font-bold">{formatCents(totalCents, currency)}</span>
              </div>
            </div>

            {submitError && (
              <p className="text-[12.5px] text-rose-600 bg-rose-50 border border-rose-100 rounded-field px-3 py-2">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={bookingMutation.isPending}
              className="w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-60"
            >
              {bookingMutation.isPending ? 'Booking…' : 'Confirm booking'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 size={40} strokeWidth={1.5} className="text-emerald-500" />
            <h1 className="text-lead text-ink">
              {bookingMutation.data?.clientSecret ? 'Almost there!' : "You're booked!"}
            </h1>
            <p className="text-body text-muted max-w-xs">
              {bookingMutation.data?.clientSecret
                ? `We've held your slot. A secure payment link to complete your deposit will be sent to ${email}.`
                : `A confirmation has been sent to ${email}. We look forward to seeing you.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
