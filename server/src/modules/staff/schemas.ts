import { z } from 'zod'

export const createStaffSchema = z.object({
  name: z.string().min(1).max(160),
  color: z.string().min(1).max(20).default('#bf9a42'),
  active: z.boolean().default(true),
  userId: z.string().min(1).optional(),
  serviceIds: z.array(z.string().min(1)).optional(),
})
export type CreateStaffInput = z.infer<typeof createStaffSchema>

export const updateStaffSchema = createStaffSchema.partial()
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:mm 24-hour time')

export const workingHoursSchema = z.object({
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startTime: timeString,
        endTime: timeString,
      }),
    )
    .refine((hours) => hours.every((h) => h.startTime < h.endTime), {
      message: 'Each range must have startTime before endTime',
    }),
})
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>

export const timeOffSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
})
export type TimeOffInput = z.infer<typeof timeOffSchema>
