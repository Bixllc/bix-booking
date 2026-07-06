import { AppError } from '../../lib/errors.js'
import type { PublicCreateBookingInput } from './schemas.js'

interface FlowStepLike {
  id: string
  type: string
  required: boolean
  enabled: boolean
}

/** Confirms the client answered every required, enabled step in the workspace's booking flow. */
export function validateAgainstFlow(steps: FlowStepLike[], input: PublicCreateBookingInput) {
  for (const step of steps) {
    if (!step.enabled || !step.required) continue

    switch (step.type) {
      case 'service_select':
        if (!input.serviceId) throw AppError.badRequest('Service selection is required')
        break
      case 'date_time':
        if (!input.startAt) throw AppError.badRequest('Date & time selection is required')
        break
      case 'customer_info':
        if (!input.customer?.name || !input.customer?.email) {
          throw AppError.badRequest('Customer name and email are required')
        }
        break
      case 'add_ons':
        if (input.addOnIds.length === 0) {
          throw AppError.badRequest('At least one add-on is required')
        }
        break
      case 'custom_field':
        if (input.answers[step.id] === undefined || input.answers[step.id] === '') {
          throw AppError.badRequest('Missing required field', { stepId: step.id })
        }
        break
      case 'payment':
        // Enforced separately by payment-intent creation.
        break
      default:
        break
    }
  }
}
