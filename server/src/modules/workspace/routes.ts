import type { FastifyInstance } from 'fastify'
import type { Prisma } from '../../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { setupStateSchema } from './schemas.js'

const DEFAULT_SETUP_STATE = {
  service: false,
  flow: false,
  hours: false,
  pay: false,
  team: false,
  share: false,
}

export default async function workspaceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/workspace/setup-state', async (request, reply) => {
    const workspace = await prisma.workspace.findUnique({ where: { id: request.user!.workspaceId } })
    if (!workspace) throw AppError.notFound('Workspace not found')
    reply.send({ setupState: { ...DEFAULT_SETUP_STATE, ...(workspace.setupState as object) } })
  })

  fastify.patch(
    '/workspace/setup-state',
    { preHandler: fastify.requireRole('owner', 'admin') },
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
}
