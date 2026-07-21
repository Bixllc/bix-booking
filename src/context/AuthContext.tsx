import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest, me as meRequest } from '../lib/api/auth'
import type { AuthUser, AuthWorkspace } from '../lib/api/types'
import { clearTokens, getAccessToken, setTokens } from '../lib/tokens'
import { DEMO_USER, DEMO_WORKSPACE } from '../lib/mockData'

interface AuthContextValue {
  user: AuthUser | null
  workspace: AuthWorkspace | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (slug: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [workspace, setWorkspace] = useState<AuthWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setWorkspace(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getAccessToken()) {
        // No API to log into locally — drop into a demo session so the app is browsable.
        if (import.meta.env.DEV && !cancelled) {
          setUser(DEMO_USER)
          setWorkspace(DEMO_WORKSPACE)
        }
        setIsLoading(false)
        return
      }
      try {
        const data = await meRequest()
        if (!cancelled) {
          setUser(data.user)
          setWorkspace(data.workspace)
        }
      } catch {
        if (!cancelled) {
          clearTokens()
          if (import.meta.env.DEV) {
            setUser(DEMO_USER)
            setWorkspace(DEMO_WORKSPACE)
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener('bix:unauthorized', onUnauthorized)
    return () => window.removeEventListener('bix:unauthorized', onUnauthorized)
  }, [logout])

  const login = useCallback(async (slug: string, email: string, password: string) => {
    const data = await loginRequest(slug, email, password)
    setTokens(data.accessToken, data.refreshToken, data.workspace.slug)
    setUser(data.user)
    setWorkspace(data.workspace)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, workspace, isAuthenticated: !!user, isLoading, login, logout }),
    [user, workspace, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
