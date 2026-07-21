import { useState, type FormEvent } from 'react'
import { CalendarClock, Mail, Phone } from 'lucide-react'
import type { Booking } from '../../lib/api/types'
import { formatCents, initialsOf, splitTimeInZone } from '../../lib/formatTime'
import { Modal } from '../ui/Modal'
import { useCancelBooking, useRescheduleBooking, useUpdateBookingStatus } from '../../hooks/useBookings'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-sky-50 text-sky-600',
  pending: 'bg-amber-50 text-amber-600',
  cancelled: 'bg-canvas text-faint',
  no_show: 'bg-rose-50 text-rose-600',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  completed: 'Completed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

interface BookingDetailModalProps {
  booking: Booking
  timezone: string
  currency: string
  onClose: () => void
}

export function BookingDetailModal({ booking, timezone, currency, onClose }: BookingDetailModalProps) {
  const [reschedOpen, setReschedOpen] = useState(false)
  const [reschedValue, setReschedValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const updateStatus = useUpdateBookingStatus()
  const cancel = useCancelBooking()
  const reschedule = useRescheduleBooking()

  const busy = updateStatus.isPending || cancel.isPending || reschedule.isPending
  const { time, meridiem } = splitTimeInZone(booking.startAt, timezone)
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(booking.startAt))

  async function run(action: Promise<unknown>) {
    setError(null)
    try {
      await action
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  async function submitReschedule(e: FormEvent) {
    e.preventDefault()
    if (!reschedValue) return
    setError(null)
    try {
      await reschedule.mutateAsync({ id: booking.id, startAt: new Date(reschedValue).toISOString() })
      onClose()
    } catch {
      setError('Could not reschedule. That time may no longer be available.')
    }
  }

  return (
    <Modal title="Booking details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`size-11 shrink-0 rounded-avatar flex items-center justify-center text-[12px] font-bold text-white`} style={{ backgroundColor: booking.staff.color }}>
            {initialsOf(booking.client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-body font-semibold text-ink truncate">{booking.client.name}</div>
            <div className="text-[12px] text-muted truncate">{booking.service.name} · w/ {booking.staff.name}</div>
          </div>
          <span className={`shrink-0 rounded-chip px-2 py-0.5 text-[11px] font-mono font-semibold ${statusStyles[booking.status]}`}>
            {statusLabels[booking.status]}
          </span>
        </div>

        <div className="rounded-field bg-canvas p-3.5 flex flex-col gap-2 text-[13px]">
          <div className="flex items-center gap-2 text-ink">
            <CalendarClock size={14} strokeWidth={1.8} className="text-muted shrink-0" />
            {dateLabel} · {time} {meridiem}
          </div>
          {booking.client.email && (
            <div className="flex items-center gap-2 text-ink">
              <Mail size={14} strokeWidth={1.8} className="text-muted shrink-0" />
              {booking.client.email}
            </div>
          )}
          {booking.client.phone && (
            <div className="flex items-center gap-2 text-ink">
              <Phone size={14} strokeWidth={1.8} className="text-muted shrink-0" />
              {booking.client.phone}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border-2">
            <span className="text-muted">Total</span>
            <span className="font-semibold text-ink">{formatCents(booking.priceCents, currency)}</span>
          </div>
        </div>

        {error && <p className="text-[12.5px] text-rose-600">{error}</p>}

        {reschedOpen ? (
          <form onSubmit={submitReschedule} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">New date & time</span>
              <input
                type="datetime-local"
                value={reschedValue}
                onChange={(e) => setReschedValue(e.target.value)}
                required
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReschedOpen(false)}
                className="flex-1 rounded-btn border border-border py-2.5 text-label font-medium text-ink hover:bg-canvas transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-btn bg-ink-grad py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
              >
                {reschedule.isPending ? 'Saving…' : 'Save new time'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(updateStatus.mutateAsync({ id: booking.id, status: 'confirmed' }))}
                  className="flex-1 rounded-btn bg-ink-grad py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(cancel.mutateAsync({ id: booking.id, reason: 'Declined by staff' }))}
                  className="flex-1 rounded-btn border border-border py-2.5 text-label font-medium text-ink hover:bg-canvas transition disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(updateStatus.mutateAsync({ id: booking.id, status: 'completed' }))}
                    className="flex-1 rounded-btn bg-ink-grad py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
                  >
                    Mark completed
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setReschedOpen(true)}
                    className="flex-1 rounded-btn border border-border py-2.5 text-label font-medium text-ink hover:bg-canvas transition disabled:opacity-60"
                  >
                    Reschedule
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(updateStatus.mutateAsync({ id: booking.id, status: 'no_show' }))}
                    className="flex-1 rounded-btn border border-border py-2.5 text-label font-medium text-ink hover:bg-canvas transition disabled:opacity-60"
                  >
                    Mark no-show
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(cancel.mutateAsync({ id: booking.id }))}
                    className="flex-1 rounded-btn border border-border py-2.5 text-label font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-60"
                  >
                    Cancel booking
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
