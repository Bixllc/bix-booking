import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  listBookings,
  rescheduleBooking,
  updateBookingStatus,
  type ListBookingsParams,
} from '../lib/api/bookings'
import type { BookingStatus } from '../lib/api/types'
import { useAuth } from '../context/AuthContext'

export function useBookings(params: ListBookingsParams = {}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => listBookings(params),
    enabled: isAuthenticated,
  })
}

function useInvalidateBookings() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  }
}

export function useUpdateBookingStatus() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(id, status),
    onSuccess: invalidate,
  })
}

export function useCancelBooking() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: invalidate,
  })
}

export function useRescheduleBooking() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: ({ id, startAt, staffId }: { id: string; startAt: string; staffId?: string }) =>
      rescheduleBooking(id, { startAt, staffId }),
    onSuccess: invalidate,
  })
}
