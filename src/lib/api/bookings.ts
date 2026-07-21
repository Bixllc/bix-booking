import { api } from '../apiClient'
import { MOCK_BOOKINGS } from '../mockData'
import type { Booking, BookingStatus } from './types'

export interface ListBookingsParams {
  from?: string
  to?: string
  staffId?: string
  status?: BookingStatus
}

export async function listBookings(params: ListBookingsParams = {}): Promise<{ bookings: Booking[] }> {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.staffId) search.set('staffId', params.staffId)
  if (params.status) search.set('status', params.status)
  const qs = search.toString()
  try {
    return await api.get<{ bookings: Booking[] }>(`/bookings${qs ? `?${qs}` : ''}`)
  } catch (err) {
    if (import.meta.env.DEV) return { bookings: MOCK_BOOKINGS }
    throw err
  }
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  return api.patch<{ booking: Booking }>(`/bookings/${id}/status`, { status })
}

export function cancelBooking(id: string, reason?: string) {
  return api.post<{ booking: Booking }>(`/bookings/${id}/cancel`, { reason })
}

export function rescheduleBooking(id: string, input: { startAt: string; staffId?: string }) {
  return api.post<{ booking: Booking }>(`/bookings/${id}/reschedule`, input)
}
