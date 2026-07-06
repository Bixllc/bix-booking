import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { createServiceSchema, staffAssignmentSchema, updateServiceSchema } from './schemas.js'

export default async function servicesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/services', async (request, reply) => {
    const { active } = request.query as { active?: string }
    const services = await prisma.service.findMany({
      where: active !== undefined ? { active: active === 'true' } : undefined,
      orderBy: { createdAt: 'asc' },
    })
    reply.send({ services })
  })

  fastify.get('/services/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) throw AppError.notFound('Service not found')
    reply.send({ service })
  })

  fastify.post(
    '/services',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const input = parseOrThrow(createServiceSchema, request.body)
      const service = await prisma.service.create({
        data: { ...input, workspaceId: request.user!.workspaceId },
      })
      reply.code(201).send({ service })
    },
  )

  fastify.patch(
    '/services/:id',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(updateServiceSchema, request.body)
      const existing = await prisma.service.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Service not found')
      const service = await prisma.service.update({ where: { id }, data: input })
      reply.send({ service })
    },
  )

  fastify.delete(
    '/services/:id',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const existing = await prisma.service.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Service not found')
      await prisma.service.delete({ where: { id } })
      reply.code(204).send()
    },
  )

  fastify.get('/services/:id/staff', async (request, reply) => {
    const { id } = request.params as { id: string }
    const service = await prisma.service.findUnique({
      where: { id },
      include: { staff: { include: { staff: true } } },
    })
    if (!service) throw AppError.notFound('Service not found')
    reply.send({ staff: service.staff.map((s) => s.staff) })
  })

  fastify.put(
    '/services/:id/staff',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(staffAssignmentSchema, request.body)

      const service = await prisma.service.findUnique({ where: { id } })
      if (!service) throw AppError.notFound('Service not found')

      if (input.staffIds.length > 0) {
        // prisma.staff is tenant-scoped, so any staffId belonging to another
        // workspace simply won't come back here — reject the request if so.
        const validStaff = await prisma.staff.findMany({ where: { id: { in: input.staffIds } } })
        if (validStaff.length !== input.staffIds.length) {
          throw AppError.badRequest('One or more staffIds are invalid for this workspace')
        }
      }

      await prisma.$transaction([
        prisma.staffService.deleteMany({ where: { serviceId: id } }),
        prisma.staffService.createMany({
          data: input.staffIds.map((staffId) => ({ serviceId: id, staffId })),
        }),
      ])

      const updated = await prisma.service.findUnique({
        where: { id },
        include: { staff: { include: { staff: true } } },
      })
      reply.send({ staff: updated!.staff.map((s) => s.staff) })
    },
  )
}
