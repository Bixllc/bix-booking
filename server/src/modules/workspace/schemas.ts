import { z } from 'zod'

export const setupStateSchema = z.object({
  service: z.boolean().optional(),
  flow: z.boolean().optional(),
  hours: z.boolean().optional(),
  pay: z.boolean().optional(),
  team: z.boolean().optional(),
  share: z.boolean().optional(),
})
export type SetupStateInput = z.infer<typeof setupStateSchema>

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  timezone: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  supportEmail: z.string().email().optional(),
  phone: z.string().max(40).optional(),
})
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
