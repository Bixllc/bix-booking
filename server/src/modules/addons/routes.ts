import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { createAddOnSchema, updateAddOnSchema } from './schemas.js'

async function assertServiceIdsValid(serviceIds: string[] | undefined) {
  if (!serviceIds || serviceIds.length === 0) return
  const valid = await prisma.service.findMany({ where: { id: { in: serviceIds } } })
  if (valid.length !== serviceIds.length) {
    throw AppError.badRequest('One or more serviceIds are invalid for this workspace')
  }
}

export default async function addOnsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/addons', async (_request, reply) => {
    const addOns = await prisma.addOn.findMany({
      include: { services: { include: { service: true } } },
      orderBy: { createdAt: 'asc' },
    })
    reply.send({ addOns })
  })

  fastify.post('/addons', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { serviceIds, ...input } = parseOrThrow(createAddOnSchema, request.body)
    await assertServiceIdsValid(serviceIds)

    const addOn = await prisma.addOn.create({
      data: {
        ...input,
        workspaceId: request.user!.workspaceId,
        services: serviceIds ? { create: serviceIds.map((serviceId) => ({ serviceId })) } : undefined,
      },
      include: { services: { include: { service: true } } },
    })
    reply.code(201).send({ addOn })
  })

  fastify.patch('/addons/:id', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { serviceIds, ...input } = parseOrThrow(updateAddOnSchema, request.body)

    const existing = await prisma.addOn.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Add-on not found')
    await assertServiceIdsValid(serviceIds)

    if (serviceIds) {
      await prisma.$transaction([
        prisma.serviceAddOn.deleteMany({ where: { addOnId: id } }),
        prisma.serviceAddOn.createMany({ data: serviceIds.map((serviceId) => ({ addOnId: id, serviceId })) }),
      ])
    }

    const addOn = await prisma.addOn.update({
      where: { id },
      data: input,
      include: { services: { include: { service: true } } },
    })
    reply.send({ addOn })
  })

  fastify.delete('/addons/:id', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.addOn.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Add-on not found')
    await prisma.addOn.delete({ where: { id } })
    reply.code(204).send()
  })
}
