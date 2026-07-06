import type { FastifyInstance } from 'fastify'
import type { Prisma } from '../../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { parseOrThrow } from '../../lib/validate.js'
import { updateFlowSchema } from './schemas.js'

export default async function flowRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/flow', async (request, reply) => {
    const flow = await prisma.bookingFlow.findUnique({
      where: { workspaceId: request.user!.workspaceId },
      include: { steps: { orderBy: { position: 'asc' } } },
    })
    reply.send({ flow })
  })

  fastify.put('/flow', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const input = parseOrThrow(updateFlowSchema, request.body)
    const workspaceId = request.user!.workspaceId

    const flow = await prisma.$transaction(async (tx) => {
      const flow = await tx.bookingFlow.upsert({
        where: { workspaceId },
        create: { workspaceId },
        update: {},
      })

      await tx.flowStep.deleteMany({ where: { bookingFlowId: flow.id } })
      await tx.flowStep.createMany({
        data: input.steps.map((step) => ({
          ...step,
          config: step.config as Prisma.InputJsonValue,
          bookingFlowId: flow.id,
        })),
      })

      return tx.bookingFlow.findUnique({
        where: { id: flow.id },
        include: { steps: { orderBy: { position: 'asc' } } },
      })
    })

    reply.send({ flow })
  })
}
