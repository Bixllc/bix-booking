import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import {
  createStaffSchema,
  timeOffSchema,
  updateStaffSchema,
  workingHoursSchema,
} from './schemas.js'

export default async function staffRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/staff', async (_request, reply) => {
    const staff = await prisma.staff.findMany({
      include: { workingHours: true, services: { include: { service: true } } },
      orderBy: { createdAt: 'asc' },
    })
    reply.send({ staff })
  })

  fastify.get('/staff/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { workingHours: true, timeOff: true, services: { include: { service: true } } },
    })
    if (!staff) throw AppError.notFound('Staff member not found')
    reply.send({ staff })
  })

  fastify.post('/staff', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { serviceIds, ...input } = parseOrThrow(createStaffSchema, request.body)

    if (serviceIds && serviceIds.length > 0) {
      const valid = await prisma.service.findMany({ where: { id: { in: serviceIds } } })
      if (valid.length !== serviceIds.length) {
        throw AppError.badRequest('One or more serviceIds are invalid for this workspace')
      }
    }

    const staff = await prisma.staff.create({
      data: {
        ...input,
        workspaceId: request.user!.workspaceId,
        services: serviceIds ? { create: serviceIds.map((serviceId) => ({ serviceId })) } : undefined,
      },
      include: { services: { include: { service: true } } },
    })
    reply.code(201).send({ staff })
  })

  fastify.patch('/staff/:id', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { serviceIds, ...input } = parseOrThrow(updateStaffSchema, request.body)

    const existing = await prisma.staff.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Staff member not found')

    if (serviceIds) {
      const valid = await prisma.service.findMany({ where: { id: { in: serviceIds } } })
      if (valid.length !== serviceIds.length) {
        throw AppError.badRequest('One or more serviceIds are invalid for this workspace')
      }
      await prisma.$transaction([
        prisma.staffService.deleteMany({ where: { staffId: id } }),
        prisma.staffService.createMany({ data: serviceIds.map((serviceId) => ({ staffId: id, serviceId })) }),
      ])
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: input,
      include: { services: { include: { service: true } } },
    })
    reply.send({ staff })
  })

  fastify.delete('/staff/:id', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.staff.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Staff member not found')
    await prisma.staff.delete({ where: { id } })
    reply.code(204).send()
  })

  fastify.put(
    '/staff/:id/working-hours',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(workingHoursSchema, request.body)

      const existing = await prisma.staff.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Staff member not found')

      await prisma.$transaction([
        prisma.workingHours.deleteMany({ where: { staffId: id } }),
        prisma.workingHours.createMany({ data: input.hours.map((h) => ({ ...h, staffId: id })) }),
      ])

      const workingHours = await prisma.workingHours.findMany({ where: { staffId: id } })
      reply.send({ workingHours })
    },
  )

  fastify.post(
    '/staff/:id/time-off',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(timeOffSchema, request.body)

      const existing = await prisma.staff.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Staff member not found')

      const startAt = new Date(input.startAt)
      const endAt = new Date(input.endAt)
      if (endAt <= startAt) {
        throw AppError.badRequest('endAt must be after startAt')
      }

      const timeOff = await prisma.timeOff.create({
        data: { staffId: id, startAt, endAt, reason: input.reason },
      })
      reply.code(201).send({ timeOff })
    },
  )

  fastify.delete(
    '/staff/:id/time-off/:timeOffId',
    { preHandler: fastify.requireRole('owner', 'admin') },
    async (request, reply) => {
      const { id, timeOffId } = request.params as { id: string; timeOffId: string }

      const staff = await prisma.staff.findUnique({ where: { id } })
      if (!staff) throw AppError.notFound('Staff member not found')

      const existing = await prisma.timeOff.findFirst({ where: { id: timeOffId, staffId: id } })
      if (!existing) throw AppError.notFound('Time off entry not found')
      await prisma.timeOff.delete({ where: { id: timeOffId } })
      reply.code(204).send()
    },
  )
}
