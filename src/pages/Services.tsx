import { useState, type FormEvent } from 'react'
import { Car, Ship, Sparkles, Clock3, Plus, MoreHorizontal } from 'lucide-react'
import { useCreateService, useServices, useUpdateService } from '../hooks/useServices'
import { formatCents } from '../lib/formatTime'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'

function iconFor(category: string) {
  const c = category.toLowerCase()
  if (c.includes('yacht')) return Ship
  if (c.includes('chauffeur') || c.includes('airport')) return Car
  return Sparkles
}

export function Services() {
  const { data, isLoading } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const { workspace } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('60')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const services = data?.services ?? []

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createService.mutateAsync({
        name,
        category,
        durationMinutes: Number(duration),
        priceCents: Math.round(Number(price) * 100),
      })
      setModalOpen(false)
      setName('')
      setCategory('')
      setDuration('60')
      setPrice('')
    } catch {
      setError('Could not create service. Check the fields and try again.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Services</h1>
          <p className="text-body text-muted mt-0.5">What clients can book, priced and ready to go.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          Add service
        </button>
      </div>

      {isLoading && <p className="text-body text-muted">Loading services…</p>}
      {!isLoading && services.length === 0 && (
        <p className="text-body text-muted">No services yet — add your first one to start taking bookings.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {services.map((s) => {
          const Icon = iconFor(s.category)
          return (
            <div key={s.id} className="rounded-card bg-surface border border-border p-5 flex flex-col gap-4 animate-scrIn">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.7} className="text-gold" />
                </div>
                <button type="button" className="text-faint hover:text-muted transition" aria-label="More options">
                  <MoreHorizontal size={18} strokeWidth={1.7} />
                </button>
              </div>

              <div>
                <h3 className="text-base2 font-bold text-ink">{s.name}</h3>
                <p className="text-[12px] text-muted mt-0.5">{s.category}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-[12px] text-muted">
                  <Clock3 size={13} strokeWidth={1.7} />
                  {s.durationMinutes} min
                </div>
                <span className="text-body font-bold text-ink">{formatCents(s.priceCents, workspace?.currency)}</span>
              </div>

              <button
                type="button"
                onClick={() => updateService.mutate({ id: s.id, input: { active: !s.active } })}
                className={[
                  'self-start rounded-chip px-2 py-0.5 text-[11px] font-mono font-semibold transition',
                  s.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-canvas text-muted hover:bg-border',
                ].join(' ')}
              >
                {s.active ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <Modal title="Add service" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Airport Transfer"
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="Airport transfer"
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Duration (min)</span>
                <input
                  type="number"
                  min={5}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Price (USD)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="140"
                  className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
                />
              </label>
            </div>
            {error && <p className="text-[12.5px] text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={createService.isPending}
              className="mt-1 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-60"
            >
              {createService.isPending ? 'Adding…' : 'Add service'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
