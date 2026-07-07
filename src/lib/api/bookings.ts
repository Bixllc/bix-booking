import { api } from '../apiClient'
import type { Booking, BookingStatus } from './types'

export interface ListBookingsParams {
  from?: string
  to?: string
  staffId?: string
  status?: BookingStatus
}

export function listBookings(params: ListBookingsParams = {}) {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.staffId) search.set('staffId', params.staffId)
  if (params.status) search.set('status', params.status)
  const qs = search.toString()
  return api.get<{ bookings: Booking[] }>(`/bookings${qs ? `?${qs}` : ''}`)
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  return api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status })
}

export function cancelBooking(id: string, reason?: string) {
  return api.post<{ booking: Booking }>(`/bookings/${id}/cancel`, { reason })
}
