import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useCreateStaff, useStaff } from '../hooks/useStaff'
import { initialsOf } from '../lib/formatTime'
import { Modal } from '../components/ui/Modal'

export function Staff() {
  const { data, isLoading } = useStaff()
  const createStaff = useCreateStaff()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const staff = data?.staff ?? []

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createStaff.mutateAsync({ name })
      setModalOpen(false)
      setName('')
    } catch {
      setError('Could not add team member. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Staff</h1>
          <p className="text-body text-muted mt-0.5">Chauffeurs and crew who get assigned to bookings.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          Invite team member
        </button>
      </div>

      {isLoading && <p className="text-body text-muted">Loading staff…</p>}
      {!isLoading && staff.length === 0 && <p className="text-body text-muted">No staff yet — add your team.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {staff.map((s) => {
          const services = (s.services ?? []).map((x) => x.service.name)
          const role = services.length > 0 ? services.slice(0, 2).join(', ') : 'No services assigned'
          return (
            <div key={s.id} className="rounded-card bg-surface border border-border p-4 sm:p-5 flex items-center gap-3.5 animate-scrIn">
              <div
                className="size-11 shrink-0 rounded-avatar flex items-center justify-center text-[12px] font-bold text-white"
                style={{ backgroundColor: s.color }}
              >
                {initialsOf(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body font-semibold text-ink truncate">{s.name}</div>
                <div className="text-[12px] text-muted truncate">{role}</div>
                <span
                  className={[
                    'inline-block mt-1.5 rounded-chip px-2 py-0.5 text-[10.5px] font-mono font-semibold',
                    s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-canvas text-muted',
                  ].join(' ')}
                >
                  {s.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <Modal title="Invite team member" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jordan Blake"
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <p className="text-[12px] text-muted -mt-1">
              You can assign services and set working hours after adding them.
            </p>
            {error && <p className="text-[12.5px] text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={createStaff.isPending}
              className="mt-1 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-60"
            >
              {createStaff.isPending ? 'Adding…' : 'Add team member'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
