import type { ZodType } from 'zod'
import { AppError } from './errors.js'

export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw AppError.badRequest('Validation failed', result.error.flatten())
  }
  return result.data
}
