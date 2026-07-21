export type Role = 'owner' | 'admin' | 'staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthWorkspace {
  id: string
  name: string
  slug: string
  timezone: string
  currency: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  timezone: string
  currency: string
  supportEmail: string | null
  phone: string | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  category: string
  bufferBeforeMin: number
  bufferAfterMin: number
  active: boolean
  createdAt: string
}

export interface PublicService {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  category: string
  staff: Array<{ id: string; name: string }>
  addOns: Array<{ id: string; name: string; priceCents: number }>
}

export interface Staff {
  id: string
  name: string
  color: string
  active: boolean
  userId: string | null
  workingHours?: Array<{ id: string; weekday: number; startTime: string; endTime: string }>
  services?: Array<{ service: Service }>
}

export interface AddOn {
  id: string
  name: string
  priceCents: number
  active: boolean
  services: Array<{ service: Service }>
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  notes: string | null
  tags: string[]
  createdAt: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  startAt: string
  endAt: string
  status: BookingStatus
  priceCents: number
  currency: string
  cancelledAt: string | null
  cancelFeeCents: number | null
  service: Service
  staff: Staff
  client: Client
  addOns: Array<{ addOn: AddOn; priceCents: number }>
}

export interface DashboardStats {
  date: string
  todaysRevenueCents: number
  appointments: { total: number; completed: number }
  newClients: number
  revenueSparkline: number[]
  currency: string
}

export interface AvailabilitySlot {
  staffId: string
  startAt: string
  endAt: string
}

export interface AvailabilityRule {
  id: string
  weekdayHours: Record<string, Array<[string, string]>>
  blackoutDates: string[]
  minLeadMinutes: number
  maxAdvanceDays: number
  slotGranularity: number
  travelBufferMin: number
}

export interface PaymentPolicy {
  id: string
  mode: 'deposit' | 'full' | 'none'
  depositPercent: number | null
  depositCents: number | null
  chargeTiming: 'at_booking' | 'before_start'
  currency: string
}

export interface CancellationPolicy {
  id: string
  freeCancelHours: number
  lateFeePercent: number
  noShowFeePercent: number
}

export type FlowStepType = 'service_select' | 'date_time' | 'customer_info' | 'add_ons' | 'payment' | 'custom_field'

export interface FlowStep {
  id: string
  type: FlowStepType
  position: number
  required: boolean
  enabled: boolean
  config: Record<string, unknown>
}

export interface BookingFlow {
  id: string
  steps: FlowStep[]
}

export type AnalyticsRange = '7d' | '30d' | '90d'

export interface AnalyticsOverview {
  range: { start: string; end: string; days: number }
  summary: {
    totalRevenueCents: number
    totalBookings: number
    avgBookingValueCents: number
    newClients: number
    revenueChangePct: number | null
    bookingsChangePct: number | null
    newClientsChangePct: number | null
  }
  revenueTrend: Array<{ date: string; revenueCents: number }>
  bookingsByStatus: Record<string, number>
  servicePerformance: Array<{ serviceId: string; name: string; bookings: number; revenueCents: number }>
  staffPerformance: Array<{ staffId: string; name: string; bookings: number; revenueCents: number }>
  clientRetention: { newClients: number; returningClients: number; totalActiveClients: number }
  currency: string
}

export interface SetupState {
  service: boolean
  flow: boolean
  hours: boolean
  pay: boolean
  team: boolean
  share: boolean
}
