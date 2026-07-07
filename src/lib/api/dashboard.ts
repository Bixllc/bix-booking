import { api } from '../apiClient'
import type { DashboardStats } from './types'

export function getDashboardStats(date?: string) {
  const qs = date ? `?date=${date}` : ''
  return api.get<DashboardStats>(`/dashboard/stats${qs}`)
}
