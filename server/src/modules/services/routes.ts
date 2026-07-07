import type { FastifyInstance } from 'fastify'
import { prisma, rawPrisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { setTenantId } from '../../lib/tenantContext.js'
import { createServiceSchema, staffAssignmentSchema, updateServiceSchema } from './schemas.js'

export default async function servicesRoutes(fastify: FastifyInstance) {
  // Public: what a client sees on the booking page — active services only,
  // with the staff who can perform each (so the page can show "with Damon C.").
  fastify.get(
    '/public/:slug/services',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { slug } = request.params as { slug: string }
      const workspace = await rawPrisma.workspace.findUnique({ where: { slug } })
      if (!workspace) throw AppError.notFound('Workspace not found')
      setTenantId(workspace.id)

      const services = await prisma.service.findMany({
        where: { active: true },
        include: {
          staff: { include: { staff: { select: { id: true, name: true, active: true } } } },
          addOns: { include: { addOn: true } },
        },
        orderBy: { createdAt: 'asc' },
      })

      reply.send({
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMinutes,
          priceCents: s.priceCents,
          category: s.category,
          staff: s.staff.map((ss) => ss.staff).filter((st) => st.active),
          addOns: s.addOns.map((sa) => sa.addOn).filter((a) => a.active),
        })),
      })
    },
  )

  // ---- tenant-scoped (encapsulated so the authenticate hook doesn't leak to the public route above) ----
  fastify.register(async (scoped) => {
    scoped.addHook('preHandler', scoped.authenticate)

    scoped.get('/services', async (request, reply) => {
      const { active } = request.query as { active?: string }
      const services = await prisma.service.findMany({
        where: active !== undefined ? { active: active === 'true' } : undefined,
        orderBy: { createdAt: 'asc' },
      })
      reply.send({ services })
    })

    scoped.get('/services/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const service = await prisma.service.findUnique({ where: { id } })
      if (!service) throw AppError.notFound('Service not found')
      reply.send({ service })
    })

    scoped.post('/services', { preHandler: scoped.requireRole('owner', 'admin') }, async (request, reply) => {
      const input = parseOrThrow(createServiceSchema, request.body)
      const service = await prisma.service.create({
        data: { ...input, workspaceId: request.user!.workspaceId },
      })
      reply.code(201).send({ service })
    })

    scoped.patch('/services/:id', { preHandler: scoped.requireRole('owner', 'admin') }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const input = parseOrThrow(updateServiceSchema, request.body)
      const existing = await prisma.service.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Service not found')
      const service = await prisma.service.update({ where: { id }, data: input })
      reply.send({ service })
    })

    scoped.delete('/services/:id', { preHandler: scoped.requireRole('owner', 'admin') }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const existing = await prisma.service.findUnique({ where: { id } })
      if (!existing) throw AppError.notFound('Service not found')
      await prisma.service.delete({ where: { id } })
      reply.code(204).send()
    })

    scoped.get('/services/:id/staff', async (request, reply) => {
      const { id } = request.params as { id: string }
      const service = await prisma.service.findUnique({
        where: { id },
        include: { staff: { include: { staff: true } } },
      })
      if (!service) throw AppError.notFound('Service not found')
      reply.send({ staff: service.staff.map((s) => s.staff) })
    })

    scoped.put(
      '/services/:id/staff',
      { preHandler: scoped.requireRole('owner', 'admin') },
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
  })
}
