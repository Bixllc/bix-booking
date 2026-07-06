import type { FastifyInstance } from 'fastify'
import { rawPrisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { setTenantId } from '../../lib/tenantContext.js'
import { availabilityQuerySchema } from './schemas.js'
import { getAvailability } from './service.js'

function serializeSlots(slots: Array<{ staffId: string; startAt: Date; endAt: Date }>) {
  return slots.map((s) => ({ staffId: s.staffId, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() }))
}

export default async function availabilityRoutes(fastify: FastifyInstance) {
  // Tenant-scoped: workspace comes from the authenticated user.
  fastify.get('/availability', { preHandler: fastify.authenticate }, async (request, reply) => {
    const query = parseOrThrow(availabilityQuerySchema, request.query)
    const slots = await getAvailability({ workspaceId: request.user!.workspaceId, ...query, fromDate: query.from, toDate: query.to })
    reply.send({ slots: serializeSlots(slots) })
  })

  // Public: workspace resolved by slug, no auth required.
  fastify.get(
    '/public/:slug/availability',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { slug } = request.params as { slug: string }
      const query = parseOrThrow(availabilityQuerySchema, request.query)

      const workspace = await rawPrisma.workspace.findUnique({ where: { slug } })
      if (!workspace) throw AppError.notFound('Workspace not found')
      setTenantId(workspace.id)

      const slots = await getAvailability({
        workspaceId: workspace.id,
        ...query,
        fromDate: query.from,
        toDate: query.to,
      })
      reply.send({ slots: serializeSlots(slots) })
    },
  )
}
