import { api } from '../apiClient'
import type { AuthUser, AuthWorkspace } from './types'

export interface LoginResponse {
  workspace: AuthWorkspace
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export function login(slug: string, email: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { slug, email, password }, { auth: false })
}

export function me() {
  return api.get<{ user: AuthUser; workspace: AuthWorkspace }>('/auth/me')
}
