import { api } from '../apiClient'
import type { AvailabilitySlot, PublicService } from './types'

export interface PublicWorkspace {
  name: string
  slug: string
  timezone: string
  currency: string
}

export function getPublicWorkspace(slug: string) {
  return api.get<{ workspace: PublicWorkspace }>(`/public/${slug}/workspace`, { auth: false })
}

export function getPublicServices(slug: string) {
  return api.get<{ services: PublicService[] }>(`/public/${slug}/services`, { auth: false })
}

export function getPublicAvailability(
  slug: string,
  params: { serviceId: string; staffId?: string; from: string; to: string },
) {
  const search = new URLSearchParams({ serviceId: params.serviceId, from: params.from, to: params.to })
  if (params.staffId) search.set('staffId', params.staffId)
  return api.get<{ slots: AvailabilitySlot[] }>(`/public/${slug}/availability?${search.toString()}`, { auth: false })
}

export interface CreatePublicBookingInput {
  serviceId: string
  staffId: string
  startAt: string
  addOnIds?: string[]
  customer: { name: string; email: string; phone?: string }
  answers?: Record<string, unknown>
}

export function createPublicBooking(slug: string, input: CreatePublicBookingInput) {
  return api.post<{ booking: { id: string; status: string }; clientSecret: string | null }>(
    `/public/${slug}/bookings`,
    input,
    { auth: false },
  )
}
