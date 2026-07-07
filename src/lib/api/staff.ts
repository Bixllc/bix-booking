import { api } from '../apiClient'
import type { Staff } from './types'

export function listStaff() {
  return api.get<{ staff: Staff[] }>('/staff')
}

export interface CreateStaffInput {
  name: string
  color?: string
  active?: boolean
  serviceIds?: string[]
}

export function createStaff(input: CreateStaffInput) {
  return api.post<{ staff: Staff }>('/staff', input)
}

export function updateStaff(id: string, input: Partial<CreateStaffInput>) {
  return api.patch<{ staff: Staff }>(`/staff/${id}`, input)
}

export function deleteStaff(id: string) {
  return api.delete<void>(`/staff/${id}`)
}
