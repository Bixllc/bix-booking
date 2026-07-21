import { env } from '../env.js'
import { centsToDecimalString } from './money.js'

export interface CustomFieldAnswer {
  label: string
  value: string
}

export interface BookingNotificationPayload {
  bookingId: string
  workspaceId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  serviceName: string
  startAt: Date
  priceCents: number
  currency: string
  customFields?: CustomFieldAnswer[]
}

export interface CancellationNotificationPayload extends BookingNotificationPayload {
  feeCents: number
}

export interface Notifier {
  bookingCreated(payload: BookingNotificationPayload): Promise<void>
  bookingConfirmed(payload: BookingNotificationPayload): Promise<void>
  bookingCancelled(payload: CancellationNotificationPayload): Promise<void>
}

function formatWhen(startAt: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(startAt)
}

function formatBookingMessage(heading: string, payload: BookingNotificationPayload, extraLines: string[] = []): string {
  const lines = [
    heading,
    '',
    `Client: ${payload.clientName}`,
    `Email: ${payload.clientEmail}`,
    payload.clientPhone ? `Phone: ${payload.clientPhone}` : null,
    `Service: ${payload.serviceName}`,
    `When: ${formatWhen(payload.startAt)}`,
    `Price: ${payload.currency} ${centsToDecimalString(payload.priceCents)}`,
  ].filter((l): l is string => l !== null)

  if (payload.customFields?.length) {
    lines.push('')
    for (const field of payload.customFields) {
      lines.push(`${field.label}: ${field.value}`)
    }
  }

  lines.push('', ...extraLines, `Booking ID: ${payload.bookingId}`)

  return lines.join('\n')
}

/** Dev/test adapter — logs instead of sending real email/SMS. */
export class ConsoleNotifier implements Notifier {
  async bookingCreated(payload: BookingNotificationPayload) {
    console.log(formatBookingMessage('📋 Booking created (pending)', payload))
  }

  async bookingConfirmed(payload: BookingNotificationPayload) {
    console.log(formatBookingMessage('✅ Booking confirmed', payload))
  }

  async bookingCancelled(payload: CancellationNotificationPayload) {
    console.log(formatBookingMessage('❌ Booking cancelled', payload, [`Fee charged: ${centsToDecimalString(payload.feeCents)}`]))
  }
}

/** Sends the same messages as ConsoleNotifier, plus a WhatsApp message via Twilio. */
export class TwilioWhatsAppNotifier extends ConsoleNotifier implements Notifier {
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromWhatsApp: string,
    private toWhatsApp: string,
  ) {
    super()
  }

  private async send(body: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: this.fromWhatsApp,
        To: this.toWhatsApp,
        Body: body,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[whatsapp] Twilio send failed (${res.status}): ${text}`)
    }
  }

  override async bookingCreated(payload: BookingNotificationPayload) {
    await super.bookingCreated(payload)
    await this.send(formatBookingMessage('📋 New booking (pending)', payload))
  }

  override async bookingConfirmed(payload: BookingNotificationPayload) {
    await super.bookingConfirmed(payload)
    await this.send(formatBookingMessage('✅ Booking confirmed', payload))
  }

  override async bookingCancelled(payload: CancellationNotificationPayload) {
    await super.bookingCancelled(payload)
    await this.send(
      formatBookingMessage('❌ Booking cancelled', payload, [`Fee charged: ${centsToDecimalString(payload.feeCents)}`]),
    )
  }
}

function buildNotifier(): Notifier {
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM && env.NOTIFY_WHATSAPP_TO) {
    return new TwilioWhatsAppNotifier(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_AUTH_TOKEN,
      env.TWILIO_WHATSAPP_FROM,
      env.NOTIFY_WHATSAPP_TO,
    )
  }
  return new ConsoleNotifier()
}

export const notifier: Notifier = buildNotifier()
