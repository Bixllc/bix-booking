import { z } from 'zod'

export const analyticsOverviewQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d']).default('30d'),
})
export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>
