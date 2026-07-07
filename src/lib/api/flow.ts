import { api } from '../apiClient'
import type { BookingFlow, FlowStep } from './types'

export function getFlow() {
  return api.get<{ flow: BookingFlow | null }>('/flow')
}

export function putFlow(steps: Array<Omit<FlowStep, 'id'>>) {
  return api.put<{ flow: BookingFlow }>('/flow', { steps })
}
