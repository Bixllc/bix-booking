import type { FastifyInstance } from 'fastify'
import type { Prisma } from '../../../generated/prisma/client.js'
import { prisma, rawPrisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { setupStateSchema, updateWorkspaceSchema } from './schemas.js'

const DEFAULT_SETUP_STATE = {
  service: false,
  flow: false,
  hours: false,
  pay: false,
  team: false,
  share: false,
}

export default async function workspaceRoutes(fastify: FastifyInstance) {
  // Public: minimal info the booking page needs (name + timezone), no auth.
  fastify.get(
    '/public/:slug/workspace',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { slug } = request.params as { slug: string }
      const workspace = await rawPrisma.workspace.findUnique({ where: { slug } })
      if (!workspace) throw AppError.notFound('Workspace not found')
      reply.send({
        workspace: { name: workspace.name, slug: workspace.slug, timezone: workspace.timezone, currency: workspace.currency },
      })
    },
  )

  // ---- tenant-scoped (encapsulated so the authenticate hook doesn't leak to the public route above) ----
  fastify.register(async (scoped) => {
    scoped.addHook('preHandler', scoped.authenticate)

    scoped.get('/workspace', async (request, reply) => {
      const workspace = await prisma.workspace.findUnique({ where: { id: request.user!.workspaceId } })
      if (!workspace) throw AppError.notFound('Workspace not found')
      reply.send({
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          timezone: workspace.timezone,
          currency: workspace.currency,
          supportEmail: workspace.supportEmail,
          phone: workspace.phone,
        },
      })
    })

    scoped.patch('/workspace', { preHandler: scoped.requireRole('owner', 'admin') }, async (request, reply) => {
      const input = parseOrThrow(updateWorkspaceSchema, request.body)
      const workspace = await prisma.workspace.update({
        where: { id: request.user!.workspaceId },
        data: input,
      })
      reply.send({
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          timezone: workspace.timezone,
          currency: workspace.currency,
          supportEmail: workspace.supportEmail,
          phone: workspace.phone,
        },
      })
    })

    scoped.get('/workspace/setup-state', async (request, reply) => {
      const workspace = await prisma.workspace.findUnique({ where: { id: request.user!.workspaceId } })
      if (!workspace) throw AppError.notFound('Workspace not found')
      reply.send({ setupState: { ...DEFAULT_SETUP_STATE, ...(workspace.setupState as object) } })
    })

    scoped.patch(
      '/workspace/setup-state',
      { preHandler: scoped.requireRole('owner', 'admin') },
      async (request, reply) => {
        const input = parseOrThrow(setupStateSchema, request.body)
        const workspaceId = request.user!.workspaceId

        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
        if (!workspace) throw AppError.notFound('Workspace not found')

        const merged = { ...DEFAULT_SETUP_STATE, ...(workspace.setupState as object), ...input }

        const updated = await prisma.workspace.update({
          where: { id: workspaceId },
          data: { setupState: merged as Prisma.InputJsonValue },
        })

        reply.send({ setupState: updated.setupState })
      },
    )
  })
}
