import { AsyncLocalStorage } from 'node:async_hooks'

interface TenantStore {
  workspaceId: string
}

const als = new AsyncLocalStorage<TenantStore>()

/** Binds the current async execution chain to a tenant. Called once per request
 *  (after auth, or after a public route resolves a workspace by slug) so every
 *  Prisma call made downstream is scoped automatically — see prisma.ts. */
export function setTenantId(workspaceId: string) {
  als.enterWith({ workspaceId })
}

export function getTenantId(): string | undefined {
  return als.getStore()?.workspaceId
}
