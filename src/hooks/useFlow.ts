import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFlow, putFlow } from '../lib/api/flow'
import type { FlowStep } from '../lib/api/types'
import { useAuth } from '../context/AuthContext'

export function useFlow() {
  const { isAuthenticated } = useAuth()
  return useQuery({ queryKey: ['flow'], queryFn: getFlow, enabled: isAuthenticated })
}

export function useUpdateFlow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (steps: Array<Omit<FlowStep, 'id'>>) => putFlow(steps),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flow'] }),
  })
}
