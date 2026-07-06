import { z } from 'zod'

export const createAddOnSchema = z.object({
  name: z.string().min(1).max(160),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().default(true),
  serviceIds: z.array(z.string().min(1)).optional(),
})
export type CreateAddOnInput = z.infer<typeof createAddOnSchema>

export const updateAddOnSchema = createAddOnSchema.partial()
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>
