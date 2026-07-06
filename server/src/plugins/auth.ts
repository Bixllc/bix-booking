import fp from 'fastify-plugin'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyAccessToken, type AccessTokenPayload, type Role } from '../lib/jwt.js'
import { setTenantId } from '../lib/tenantContext.js'
import { AppError } from '../lib/errors.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (...roles: Role[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async function authPlugin(fastify) {
  fastify.decorate('authenticate', async function authenticate(request: FastifyRequest) {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing bearer token')
    }

    const token = header.slice('Bearer '.length)

    try {
      const payload = verifyAccessToken(token)
      request.user = payload
      // Binds every downstream Prisma call in this request to the caller's
      // workspace — tenant scoping lives here, not scattered across queries.
      setTenantId(payload.workspaceId)
    } catch {
      throw AppError.unauthorized('Invalid or expired token')
    }
  })

  fastify.decorate('requireRole', (...roles: Role[]) => {
    return async function checkRole(request: FastifyRequest) {
      if (!request.user) {
        throw AppError.unauthorized()
      }
      if (!roles.includes(request.user.role)) {
        throw AppError.forbidden('Insufficient permissions')
      }
    }
  })
})
