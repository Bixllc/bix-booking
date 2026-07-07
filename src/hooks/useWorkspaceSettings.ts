import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWorkspace, updateWorkspace, type UpdateWorkspaceInput } from '../lib/api/workspace'
import { getCancellationPolicy, getPaymentPolicy, putCancellationPolicy, putPaymentPolicy } from '../lib/api/rules'
import type { CancellationPolicy, PaymentPolicy } from '../lib/api/types'
import { useAuth } from '../context/AuthContext'

export function useWorkspace() {
  const { isAuthenticated } = useAuth()
  return useQuery({ queryKey: ['workspace'], queryFn: getWorkspace, enabled: isAuthenticated })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) => updateWorkspace(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace'] }),
  })
}

export function useCancellationPolicy() {
  const { isAuthenticated } = useAuth()
  return useQuery({ queryKey: ['cancellation-policy'], queryFn: getCancellationPolicy, enabled: isAuthenticated })
}

export function useUpdateCancellationPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<CancellationPolicy, 'id'>) => putCancellationPolicy(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cancellation-policy'] }),
  })
}

export function usePaymentPolicy() {
  const { isAuthenticated } = useAuth()
  return useQuery({ queryKey: ['payment-policy'], queryFn: getPaymentPolicy, enabled: isAuthenticated })
}

export function useUpdatePaymentPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<PaymentPolicy, 'id'>) => putPaymentPolicy(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-policy'] }),
  })
}
