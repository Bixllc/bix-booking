import Fastify, { type FastifyError } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { env } from './env.js'
import { AppError, toErrorEnvelope } from './lib/errors.js'
import authPlugin from './plugins/auth.js'
import authRoutes from './modules/auth/routes.js'
import servicesRoutes from './modules/services/routes.js'
import addOnsRoutes from './modules/addons/routes.js'
import staffRoutes from './modules/staff/routes.js'
import flowRoutes from './modules/flow/routes.js'
import rulesRoutes from './modules/rules/routes.js'
import clientsRoutes from './modules/clients/routes.js'
import availabilityRoutes from './modules/availability/routes.js'
import bookingsRoutes from './modules/bookings/routes.js'
import dashboardRoutes from './modules/dashboard/routes.js'
import analyticsRoutes from './modules/analytics/routes.js'
import workspaceRoutes from './modules/workspace/routes.js'
import webhooksRoutes from './modules/webhooks/routes.js'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : 'info',
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
  })

  const allowedOrigins = (env.ALLOWED_ORIGINS ?? env.PUBLIC_APP_URL).split(',').map((s) => s.trim()).filter(Boolean)

  // Hand-rolled instead of @fastify/cors: that plugin's `origin` callback only
  // receives the Origin header, not the request, so it can't be path-aware —
  // and public booking-widget routes need a different policy (any origin)
  // than authenticated admin routes (known origins only, in production).
  app.addHook('onRequest', (request, reply, done) => {
    const origin = request.headers.origin
    const path = request.raw.url ?? ''
    const isPublic = path.startsWith('/public/')

    if (origin) {
      const allowed = isPublic || env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)
      if (allowed) {
        reply.header('Access-Control-Allow-Origin', origin)
        reply.header('Vary', 'Origin')
      }
      reply.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    if (request.method === 'OPTIONS') {
      reply.code(204).send()
      return
    }

    done()
  })

  // Default budget for authenticated, tenant-scoped traffic. Public/auth
  // routes tighten this further via their own route-level config below.
  app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' })

  app.register(authPlugin)

  app.setErrorHandler((err: FastifyError | AppError, request, reply) => {
    if (err instanceof AppError) {
      reply.code(err.statusCode).send(toErrorEnvelope(err))
      return
    }

    if (err.validation) {
      reply.code(400).send({ error: { code: 'bad_request', message: err.message } })
      return
    }

    if (err.statusCode === 429) {
      reply.code(429).send({ error: { code: 'rate_limited', message: 'Too many requests' } })
      return
    }

    request.log.error(err)
    reply.code(500).send({ error: { code: 'internal_error', message: 'Internal server error' } })
  })

  app.get('/health', async () => ({ status: 'ok' }))

  app.register(authRoutes)
  app.register(servicesRoutes)
  app.register(addOnsRoutes)
  app.register(staffRoutes)
  app.register(flowRoutes)
  app.register(rulesRoutes)
  app.register(clientsRoutes)
  app.register(availabilityRoutes)
  app.register(bookingsRoutes)
  app.register(dashboardRoutes)
  app.register(analyticsRoutes)
  app.register(workspaceRoutes)
  app.register(webhooksRoutes)

  return app
}
