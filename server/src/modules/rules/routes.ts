import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { parseOrThrow } from '../../lib/validate.js'
import { availabilityRuleSchema, cancellationPolicySchema, paymentPolicySchema } from './schemas.js'

export default async function rulesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/availability-rules', async (request, reply) => {
    const rule = await prisma.availabilityRule.findUnique({ where: { workspaceId: request.user!.workspaceId } })
    reply.send({ availabilityRule: rule })
  })

  fastify.put(
    '/availability-rules',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const input = parseOrThrow(availabilityRuleSchema, request.body)
      const workspaceId = request.user!.workspaceId
      const rule = await prisma.availabilityRule.upsert({
        where: { workspaceId },
        create: { workspaceId, ...input },
        update: input,
      })
      reply.send({ availabilityRule: rule })
    },
  )

  fastify.get('/payment-policy', async (request, reply) => {
    const policy = await prisma.paymentPolicy.findUnique({ where: { workspaceId: request.user!.workspaceId } })
    reply.send({ paymentPolicy: policy })
  })

  fastify.put('/payment-policy', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const input = parseOrThrow(paymentPolicySchema, request.body)
    const workspaceId = request.user!.workspaceId
    const policy = await prisma.paymentPolicy.upsert({
      where: { workspaceId },
      create: { workspaceId, ...input },
      update: input,
    })
    reply.send({ paymentPolicy: policy })
  })

  fastify.get('/cancellation-policy', async (request, reply) => {
    const policy = await prisma.cancellationPolicy.findUnique({ where: { workspaceId: request.user!.workspaceId } })
    reply.send({ cancellationPolicy: policy })
  })

  fastify.put(
    '/cancellation-policy',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const input = parseOrThrow(cancellationPolicySchema, request.body)
      const workspaceId = request.user!.workspaceId
      const policy = await prisma.cancellationPolicy.upsert({
        where: { workspaceId },
        create: { workspaceId, ...input },
        update: input,
      })
      reply.send({ cancellationPolicy: policy })
    },
  )
}
