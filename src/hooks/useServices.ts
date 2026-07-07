import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createService, listServices, updateService, type CreateServiceInput } from '../lib/api/services'
import { useAuth } from '../context/AuthContext'

export function useServices() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['services'],
    queryFn: listServices,
    enabled: isAuthenticated,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateServiceInput> }) => updateService(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}
