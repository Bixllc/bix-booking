import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { rawPrisma } from '../../lib/prisma.js'
import { parseOrThrow } from '../../lib/validate.js'
import { AppError } from '../../lib/errors.js'
import { hashPassword, comparePassword } from '../../lib/passwords.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js'
import { loginSchema, refreshSchema, registerSchema } from './schemas.js'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function issueTokens(user: { id: string; workspaceId: string; role: 'owner' | 'admin' | 'staff' }) {
  const accessToken = signAccessToken({ sub: user.id, workspaceId: user.workspaceId, role: user.role })
  const refreshToken = signRefreshToken({ sub: user.id })
  await rawPrisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken) },
  })
  return { accessToken, refreshToken }
}

const AUTH_RATE_LIMIT = { rateLimit: { max: 10, timeWindow: '1 minute' } }

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', { config: AUTH_RATE_LIMIT }, async (request, reply) => {
    const input = parseOrThrow(registerSchema, request.body)

    const existingSlug = await rawPrisma.workspace.findUnique({ where: { slug: input.slug } })
    if (existingSlug) {
      throw AppError.conflict('That workspace URL is already taken')
    }

    const passwordHash = await hashPassword(input.password)

    const { workspace, user } = await rawPrisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: input.workspaceName,
          slug: input.slug,
          timezone: input.timezone,
          currency: input.currency,
        },
      })
      const user = await tx.user.create({
        data: {
          workspaceId: workspace.id,
          name: input.ownerName,
          email: input.email,
          passwordHash,
          role: 'owner',
        },
      })
      return { workspace, user }
    })

    const tokens = await issueTokens(user)

    reply.code(201).send({
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, timezone: workspace.timezone, currency: workspace.currency },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    })
  })

  fastify.post('/auth/login', { config: AUTH_RATE_LIMIT }, async (request, reply) => {
    const input = parseOrThrow(loginSchema, request.body)

    const workspace = await rawPrisma.workspace.findUnique({ where: { slug: input.slug } })
    if (!workspace) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const user = await rawPrisma.user.findUnique({
      where: { workspaceId_email: { workspaceId: workspace.id, email: input.email } },
    })
    if (!user) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const tokens = await issueTokens(user)

    reply.send({
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, timezone: workspace.timezone, currency: workspace.currency },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    })
  })

  fastify.post('/auth/refresh', { config: AUTH_RATE_LIMIT }, async (request, reply) => {
    const input = parseOrThrow(refreshSchema, request.body)

    let payload: { sub: string }
    try {
      payload = verifyRefreshToken(input.refreshToken)
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token')
    }

    const user = await rawPrisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.refreshTokenHash) {
      throw AppError.unauthorized('Invalid or expired refresh token')
    }

    if (user.refreshTokenHash !== hashToken(input.refreshToken)) {
      throw AppError.unauthorized('Invalid or expired refresh token')
    }

    const tokens = await issueTokens(user)
    reply.send(tokens)
  })

  fastify.get('/auth/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = await rawPrisma.user.findUnique({
      where: { id: request.user!.sub },
      include: { workspace: true },
    })
    if (!user) {
      throw AppError.notFound('User not found')
    }

    reply.send({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      workspace: {
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug,
        timezone: user.workspace.timezone,
        currency: user.workspace.currency,
      },
    })
  })
}
