import { z } from 'zod'

export const registerSchema = z.object({
  workspaceName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
  ownerName: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginSchema>

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
export type RefreshInput = z.infer<typeof refreshSchema>
