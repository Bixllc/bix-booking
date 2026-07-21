import { api } from '../apiClient'
import type { AnalyticsOverview, AnalyticsRange } from './types'

export function getAnalyticsOverview(range: AnalyticsRange = '30d') {
  return api.get<AnalyticsOverview>(`/analytics/overview?range=${range}`)
}
