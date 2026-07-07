import { api } from '../apiClient'
import type { Service } from './types'

export function listServices() {
  return api.get<{ services: Service[] }>('/services')
}

export interface CreateServiceInput {
  name: string
  description?: string
  durationMinutes: number
  priceCents: number
  category: string
  bufferBeforeMin?: number
  bufferAfterMin?: number
  active?: boolean
}

export function createService(input: CreateServiceInput) {
  return api.post<{ service: Service }>('/services', input)
}

export function updateService(id: string, input: Partial<CreateServiceInput>) {
  return api.patch<{ service: Service }>(`/services/${id}`, input)
}

export function deleteService(id: string) {
  return api.delete<void>(`/services/${id}`)
}

export function getServiceStaff(id: string) {
  return api.get<{ staff: Array<{ id: string; name: string }> }>(`/services/${id}/staff`)
}

export function setServiceStaff(id: string, staffIds: string[]) {
  return api.put<{ staff: Array<{ id: string; name: string }> }>(`/services/${id}/staff`, { staffIds })
}
