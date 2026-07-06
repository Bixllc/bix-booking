import type { FastifyInstance } from 'fastify'
import { env } from '../../env.js'
import { stripe } from '../../lib/stripe.js'
import { confirmBookingFromPaymentIntent } from '../bookings/service.js'

export default async function webhooksRoutes(fastify: FastifyInstance) {
  // Scoped so this raw-buffer content-type parser doesn't affect the rest of the app.
  fastify.register(async (scoped) => {
    scoped.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_request, body, done) => {
      done(null, body)
    })

    scoped.post('/webhooks/stripe', async (request, reply) => {
      const signature = request.headers['stripe-signature']
      if (!signature || typeof signature !== 'string') {
        return reply.code(400).send({ error: { code: 'bad_request', message: 'Missing stripe-signature header' } })
      }

      let event
      try {
        event = stripe.webhooks.constructEvent(request.body as Buffer, signature, env.STRIPE_WEBHOOK_SECRET)
      } catch (err) {
        request.log.warn({ err }, 'Stripe webhook signature verification failed')
        return reply.code(400).send({ error: { code: 'bad_request', message: 'Invalid signature' } })
      }

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as { id: string }
        await confirmBookingFromPaymentIntent(intent.id)
      }

      reply.send({ received: true })
    })
  })
}
