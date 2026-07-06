import { z } from 'zod'

export const flowStepTypeSchema = z.enum([
  'service_select',
  'date_time',
  'customer_info',
  'add_ons',
  'payment',
  'custom_field',
])

export const updateFlowSchema = z.object({
  steps: z.array(
    z.object({
      type: flowStepTypeSchema,
      position: z.number().int().nonnegative(),
      required: z.boolean().default(true),
      enabled: z.boolean().default(true),
      config: z.record(z.string(), z.unknown()).default({}),
    }),
  ),
})
export type UpdateFlowInput = z.infer<typeof updateFlowSchema>
