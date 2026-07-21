import type { FastifyInstance } from 'fastify'
import { parseOrThrow } from '../../lib/validate.js'
import { analyticsOverviewQuerySchema } from './schemas.js'
import { getAnalyticsOverview } from './service.js'

export default async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/analytics/overview', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const query = parseOrThrow(analyticsOverviewQuerySchema, request.query)
    const overview = await getAnalyticsOverview(request.user!.workspaceId, query.range)
    reply.send(overview)
  })
}
