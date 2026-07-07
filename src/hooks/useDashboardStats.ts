import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../lib/api/dashboard'
import { useAuth } from '../context/AuthContext'

export function useDashboardStats(date?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['dashboard-stats', date ?? 'today'],
    queryFn: () => getDashboardStats(date),
    enabled: isAuthenticated,
  })
}
