import { z } from 'zod'

export const upsertClientSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  notes: z.string().max(4000).optional(),
  tags: z.array(z.string().max(40)).default([]),
})
export type UpsertClientInput = z.infer<typeof upsertClientSchema>

export const updateClientSchema = upsertClientSchema.partial()
export type UpdateClientInput = z.infer<typeof updateClientSchema>
