import { Check, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, updateBookingStatus } from '../../lib/api/bookings'
import type { Booking } from '../../lib/api/types'
import { colorForId } from '../../lib/colors'
import { initialsOf, splitTimeInZone } from '../../lib/formatTime'

interface PendingConfirmationsProps {
  bookings: Booking[]
  timezone: string
  isLoading: boolean
}

export function PendingConfirmations({ bookings, timezone, isLoading }: PendingConfirmationsProps) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  }

  const confirmMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'confirmed'),
    onSuccess: invalidate,
  })
  const declineMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id, 'Declined by staff'),
    onSuccess: invalidate,
  })

  return (
    <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base2 font-bold text-ink">Pending confirmations</h2>
        <span className="rounded-chip bg-gold-soft/40 px-2 py-0.5 text-[11px] font-mono font-semibold text-gold">
          {bookings.length}
        </span>
      </div>

      {isLoading && <p className="text-body text-muted py-6 text-center">Loading…</p>}
      {!isLoading && bookings.length === 0 && (
        <p className="text-body text-muted py-6 text-center">Nothing waiting on you.</p>
      )}

      <div className="flex flex-col divide-y divide-border">
        {bookings.map((c) => {
          const { time, meridiem } = splitTimeInZone(c.startAt, timezone)
          const busy = confirmMutation.isPending || declineMutation.isPending
          return (
            <div key={c.id} className="flex items-center gap-3 py-3">
              <div className={`size-8 shrink-0 rounded-avatar flex items-center justify-center text-[11px] font-bold ${colorForId(c.client.id)}`}>
                {initialsOf(c.client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body font-semibold text-ink truncate">{c.client.name}</div>
                <div className="text-[11.5px] text-muted truncate">
                  {c.service.name} · {time} {meridiem}
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmMutation.mutate(c.id)}
                className="shrink-0 size-7 rounded-btn bg-ink text-white flex items-center justify-center hover:brightness-110 transition disabled:opacity-50"
                aria-label="Confirm"
              >
                <Check size={14} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => declineMutation.mutate(c.id)}
                className="shrink-0 size-7 rounded-btn border border-border text-muted flex items-center justify-center hover:bg-canvas transition disabled:opacity-50"
                aria-label="Decline"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
