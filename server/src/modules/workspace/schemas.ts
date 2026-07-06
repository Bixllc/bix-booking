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
