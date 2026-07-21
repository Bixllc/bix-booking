import { useQuery } from '@tanstack/react-query'
import { getAnalyticsOverview } from '../lib/api/analytics'
import type { AnalyticsRange } from '../lib/api/types'
import { useAuth } from '../context/AuthContext'

export function useAnalytics(range: AnalyticsRange) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['analytics-overview', range],
    queryFn: () => getAnalyticsOverview(range),
    enabled: isAuthenticated,
  })
}
