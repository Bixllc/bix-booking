import { EventEmitter } from 'node:events'
import { notifier, type BookingNotificationPayload, type CancellationNotificationPayload } from './notifications.js'

export const domainEvents = new EventEmitter()

export const BookingEvents = {
  created: 'booking.created',
  confirmed: 'booking.confirmed',
  cancelled: 'booking.cancelled',
} as const

domainEvents.on(BookingEvents.created, (payload: BookingNotificationPayload) => {
  void notifier.bookingCreated(payload)
})

domainEvents.on(BookingEvents.confirmed, (payload: BookingNotificationPayload) => {
  void notifier.bookingConfirmed(payload)
})

domainEvents.on(BookingEvents.cancelled, (payload: CancellationNotificationPayload) => {
  void notifier.bookingCancelled(payload)
})
