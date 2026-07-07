import { api } from '../apiClient'
import type { SetupState, Workspace } from './types'

export function getWorkspace() {
  return api.get<{ workspace: Workspace }>('/workspace')
}

export interface UpdateWorkspaceInput {
  name?: string
  timezone?: string
  currency?: string
  supportEmail?: string
  phone?: string
}

export function updateWorkspace(input: UpdateWorkspaceInput) {
  return api.patch<{ workspace: Workspace }>('/workspace', input)
}

export function getSetupState() {
  return api.get<{ setupState: SetupState }>('/workspace/setup-state')
}

export function patchSetupState(input: Partial<SetupState>) {
  return api.patch<{ setupState: SetupState }>('/workspace/setup-state', input)
}
