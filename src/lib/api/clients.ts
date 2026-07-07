import { api } from '../apiClient'
import type { Client } from './types'

export function listClients(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return api.get<{ clients: Client[] }>(`/clients${qs}`)
}
