const ACCESS_KEY = 'bix.accessToken'
const REFRESH_KEY = 'bix.refreshToken'
const SLUG_KEY = 'bix.workspaceSlug'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function getWorkspaceSlug(): string | null {
  return localStorage.getItem(SLUG_KEY)
}

export function setTokens(accessToken: string, refreshToken: string, workspaceSlug: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(SLUG_KEY, workspaceSlug)
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(SLUG_KEY)
}
