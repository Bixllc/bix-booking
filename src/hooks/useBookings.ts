import { useQuery } from '@tanstack/react-query'
import { listBookings, type ListBookingsParams } from '../lib/api/bookings'
import { useAuth } from '../context/AuthContext'

export function useBookings(params: ListBookingsParams = {}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => listBookings(params),
    enabled: isAuthenticated,
  })
}
