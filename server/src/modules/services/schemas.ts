import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  category: z.string().min(1).max(80),
  bufferBeforeMin: z.number().int().nonnegative().default(0),
  bufferAfterMin: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
})
export type CreateServiceInput = z.infer<typeof createServiceSchema>

export const updateServiceSchema = createServiceSchema.partial()
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export const staffAssignmentSchema = z.object({
  staffIds: z.array(z.string().min(1)),
})
export type StaffAssignmentInput = z.infer<typeof staffAssignmentSchema>
