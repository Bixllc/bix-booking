import type { FastifyInstance } from 'fastify'
import { parseOrThrow } from '../../lib/validate.js'
import { dashboardStatsQuerySchema } from './schemas.js'
import { getDashboardStats } from './service.js'

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/dashboard/stats', async (request, reply) => {
    const query = parseOrThrow(dashboardStatsQuerySchema, request.query)
    const stats = await getDashboardStats(request.user!.workspaceId, query.date)
    reply.send(stats)
  })
}
