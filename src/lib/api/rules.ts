import { api } from '../apiClient'
import type { AvailabilityRule, CancellationPolicy, PaymentPolicy } from './types'

export function getPaymentPolicy() {
  return api.get<{ paymentPolicy: PaymentPolicy | null }>('/payment-policy')
}

export function putPaymentPolicy(input: Omit<PaymentPolicy, 'id'>) {
  return api.put<{ paymentPolicy: PaymentPolicy }>('/payment-policy', input)
}

export function getCancellationPolicy() {
  return api.get<{ cancellationPolicy: CancellationPolicy | null }>('/cancellation-policy')
}

export function putCancellationPolicy(input: Omit<CancellationPolicy, 'id'>) {
  return api.put<{ cancellationPolicy: CancellationPolicy }>('/cancellation-policy', input)
}

export function getAvailabilityRule() {
  return api.get<{ availabilityRule: AvailabilityRule | null }>('/availability-rules')
}

export function putAvailabilityRule(input: Omit<AvailabilityRule, 'id'>) {
  return api.put<{ availabilityRule: AvailabilityRule }>('/availability-rules', input)
}
