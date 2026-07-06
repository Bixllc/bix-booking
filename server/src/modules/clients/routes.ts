import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { updateClientSchema, upsertClientSchema } from './schemas.js'
import { findOrCreateClient } from './service.js'

export default async function clientsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/clients', async (request, reply) => {
    const { q } = request.query as { q?: string }
    const clients = await prisma.client.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    })
    reply.send({ clients })
  })

  fastify.get('/clients/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const client = await prisma.client.findUnique({ where: { id }, include: { bookings: true } })
    if (!client) throw AppError.notFound('Client not found')
    reply.send({ client })
  })

  fastify.post('/clients', async (request, reply) => {
    const input = parseOrThrow(upsertClientSchema, request.body)
    const client = await findOrCreateClient({ workspaceId: request.user!.workspaceId, ...input })
    reply.code(201).send({ client })
  })

  fastify.patch('/clients/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const input = parseOrThrow(updateClientSchema, request.body)

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Client not found')

    const client = await prisma.client.update({ where: { id }, data: input })
    reply.send({ client })
  })

  fastify.delete('/clients/:id', { preHandler: fastify.requireRole('owner', 'admin') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Client not found')
    await prisma.client.delete({ where: { id } })
    reply.code(204).send()
  })
}
