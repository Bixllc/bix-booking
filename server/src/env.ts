import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  PUBLIC_APP_URL: z.string().default('http://localhost:5173'),
  // Comma-separated list of origins allowed to call authenticated routes in
  // production. Falls back to PUBLIC_APP_URL if unset. Public/webhook routes
  // are never restricted by this — they're meant to be called from anywhere
  // (embedded booking widgets, Stripe's servers).
  ALLOWED_ORIGINS: z.string().optional(),

  // Optional — when all three are set, notifications go out over WhatsApp via
  // Twilio instead of just the console. TWILIO_WHATSAPP_FROM is the Twilio
  // sender (e.g. "whatsapp:+14155238886" for the sandbox, or a verified
  // WhatsApp Business sender). NOTIFY_WHATSAPP_TO is who gets notified of new
  // bookings (e.g. "whatsapp:+17215541309").
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  NOTIFY_WHATSAPP_TO: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
