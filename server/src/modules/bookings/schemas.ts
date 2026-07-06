import { z } from 'zod'

export const publicCreateBookingSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAt: z.string().datetime(),
  addOnIds: z.array(z.string().min(1)).default([]),
  customer: z.object({
    name: z.string().min(1).max(160),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
  }),
  answers: z.record(z.string(), z.unknown()).default({}),
})
export type PublicCreateBookingInput = z.infer<typeof publicCreateBookingSchema>

export const internalCreateBookingSchema = z
  .object({
    serviceId: z.string().min(1),
    staffId: z.string().min(1),
    startAt: z.string().datetime(),
    addOnIds: z.array(z.string().min(1)).default([]),
    clientId: z.string().min(1).optional(),
    customer: z
      .object({
        name: z.string().min(1).max(160),
        email: z.string().email(),
        phone: z.string().max(40).optional(),
      })
      .optional(),
  })
  .refine((v) => v.clientId ?? v.customer, { message: 'clientId or customer is required' })
export type InternalCreateBookingInput = z.infer<typeof internalCreateBookingSchema>

export const listBookingsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  staffId: z.string().min(1).optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
})
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
})
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
})
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>

export const rescheduleBookingSchema = z.object({
  startAt: z.string().datetime(),
  staffId: z.string().min(1).optional(),
})
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>
