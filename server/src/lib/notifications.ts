export interface BookingNotificationPayload {
  bookingId: string
  workspaceId: string
  clientEmail: string
  clientName: string
  serviceName: string
  startAt: Date
}

export interface CancellationNotificationPayload extends BookingNotificationPayload {
  feeCents: number
}

export interface Notifier {
  bookingCreated(payload: BookingNotificationPayload): Promise<void>
  bookingConfirmed(payload: BookingNotificationPayload): Promise<void>
  bookingCancelled(payload: CancellationNotificationPayload): Promise<void>
}

/** Dev/test adapter — logs instead of sending real email/SMS. */
export class ConsoleNotifier implements Notifier {
  async bookingCreated(payload: BookingNotificationPayload) {
    console.log(`[notify] booking.created — ${payload.clientEmail} — ${payload.serviceName} @ ${payload.startAt.toISOString()}`)
  }

  async bookingConfirmed(payload: BookingNotificationPayload) {
    console.log(`[notify] booking.confirmed — ${payload.clientEmail} — ${payload.serviceName} @ ${payload.startAt.toISOString()}`)
  }

  async bookingCancelled(payload: CancellationNotificationPayload) {
    console.log(
      `[notify] booking.cancelled — ${payload.clientEmail} — ${payload.serviceName} — fee: ${payload.feeCents}c`,
    )
  }
}

export const notifier: Notifier = new ConsoleNotifier()
