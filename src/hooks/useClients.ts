import { useQuery } from '@tanstack/react-query'
import { listClients } from '../lib/api/clients'
import { useAuth } from '../context/AuthContext'

export function useClients(q?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['clients', q ?? ''],
    queryFn: () => listClients(q),
    enabled: isAuthenticated,
  })
}
