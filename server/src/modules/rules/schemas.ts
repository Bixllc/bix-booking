import { z } from 'zod'

const timeString = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:mm 24-hour time')
const timeRange = z.tuple([timeString, timeString])

export const availabilityRuleSchema = z.object({
  weekdayHours: z.record(z.string().regex(/^[0-6]$/), z.array(timeRange)),
  blackoutDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
  minLeadMinutes: z.number().int().nonnegative().default(60),
  maxAdvanceDays: z.number().int().positive().default(60),
  slotGranularity: z.number().int().positive().default(30),
  travelBufferMin: z.number().int().nonnegative().default(0),
})
export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>

export const paymentPolicySchema = z
  .object({
    mode: z.enum(['deposit', 'full', 'none']),
    depositPercent: z.number().int().min(1).max(100).nullish(),
    depositCents: z.number().int().positive().nullish(),
    chargeTiming: z.enum(['at_booking', 'before_start']).default('at_booking'),
    currency: z.string().length(3).default('USD'),
  })
  .refine((v) => v.mode !== 'deposit' || v.depositPercent != null || v.depositCents != null, {
    message: 'deposit mode requires depositPercent or depositCents',
  })
export type PaymentPolicyInput = z.infer<typeof paymentPolicySchema>

export const cancellationPolicySchema = z.object({
  freeCancelHours: z.number().int().nonnegative().default(24),
  lateFeePercent: z.number().int().min(0).max(100).default(0),
  noShowFeePercent: z.number().int().min(0).max(100).default(100),
})
export type CancellationPolicyInput = z.infer<typeof cancellationPolicySchema>
