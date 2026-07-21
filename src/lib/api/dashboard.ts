import { api } from '../apiClient'
import { MOCK_DASHBOARD_STATS } from '../mockData'
import type { DashboardStats } from './types'

export async function getDashboardStats(date?: string): Promise<DashboardStats> {
  const qs = date ? `?date=${date}` : ''
  try {
    return await api.get<DashboardStats>(`/dashboard/stats${qs}`)
  } catch (err) {
    if (import.meta.env.DEV) return MOCK_DASHBOARD_STATS
    throw err
  }
}
