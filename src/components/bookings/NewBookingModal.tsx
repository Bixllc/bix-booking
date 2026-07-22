import { useMemo, useState, type FormEvent } from 'react'
import { useServices } from '../../hooks/useServices'
import { useStaff } from '../../hooks/useStaff'
import { useClients } from '../../hooks/useClients'
import { useCreateBooking } from '../../hooks/useBookings'
import { ApiError } from '../../lib/apiClient'
import { Modal } from '../ui/Modal'

interface NewBookingModalProps {
  onClose: () => void
  onCreated?: () => void
}

export function NewBookingModal({ onClose, onCreated }: NewBookingModalProps) {
  const { data: servicesData } = useServices()
  const { data: staffData } = useStaff()
  const { data: clientsData } = useClients()
  const createBooking = useCreateBooking()

  const services = (servicesData?.services ?? []).filter((s) => s.active)
  const clients = clientsData?.clients ?? []

  const [serviceId, setServiceId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [startAt, setStartAt] = useState('')
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')
  const [clientId, setClientId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const eligibleStaff = useMemo(() => {
    const staff = staffData?.staff ?? []
    if (!serviceId) return staff.filter((s) => s.active)
    return staff.filter((s) => s.active && (s.services ?? []).some((x) => x.service.id === serviceId))
  }, [staffData, serviceId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!serviceId || !staffId || !startAt) {
      setError('Fill in a service, staff member, and time.')
      return
    }
    if (clientMode === 'existing' && !clientId) {
      setError('Select a client, or switch to "New client".')
      return
    }
    if (clientMode === 'new' && (!name || !email)) {
      setError('Enter the new client\'s name and email.')
      return
    }

    try {
      await createBooking.mutateAsync({
        serviceId,
        staffId,
        startAt: new Date(startAt).toISOString(),
        ...(clientMode === 'existing' ? { clientId } : { customer: { name, email, phone: phone || undefined } }),
      })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the booking. Please try again.')
    }
  }

  return (
    <Modal title="New booking" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Service</span>
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value)
              setStaffId('')
            }}
            required
            className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
          >
            <option value="" disabled>
              Select a service…
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Staff</span>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            required
            disabled={!serviceId}
            className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition disabled:opacity-50"
          >
            <option value="" disabled>
              {serviceId ? 'Select a staff member…' : 'Pick a service first'}
            </option>
            {eligibleStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {serviceId && eligibleStaff.length === 0 && (
            <span className="text-[11.5px] text-amber-600">No staff are assigned to this service yet.</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Date & time</span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted">Client</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setClientMode('existing')}
              className={[
                'flex-1 rounded-btn px-3 py-2 text-label font-medium transition',
                clientMode === 'existing' ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
              ].join(' ')}
            >
              Existing client
            </button>
            <button
              type="button"
              onClick={() => setClientMode('new')}
              className={[
                'flex-1 rounded-btn px-3 py-2 text-label font-medium transition',
                clientMode === 'new' ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
              ].join(' ')}
            >
              New client
            </button>
          </div>
        </div>

        {clientMode === 'existing' ? (
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
          >
            <option value="" disabled>
              {clients.length === 0 ? 'No clients yet — add a new one below' : 'Select a client…'}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.email}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex flex-col gap-3">
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
          </div>
        )}

        {error && <p className="text-[12.5px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={createBooking.isPending}
          className="mt-1 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-60"
        >
          {createBooking.isPending ? 'Creating…' : 'Create booking'}
        </button>
      </form>
    </Modal>
  )
}
