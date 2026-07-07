import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStaff, listStaff, type CreateStaffInput } from '../lib/api/staff'
import { useAuth } from '../context/AuthContext'

export function useStaff() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['staff'],
    queryFn: listStaff,
    enabled: isAuthenticated,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}
