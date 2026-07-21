import type { AuthUser, AuthWorkspace, Booking, DashboardStats, Service, Staff, Client } from './api/types'

export const DEMO_USER: AuthUser = {
  id: 'demo-user',
  name: 'Cadi',
  email: 'cadi@bigcadivip.com',
  role: 'owner',
}

export const DEMO_WORKSPACE: AuthWorkspace = {
  id: 'demo-workspace',
  name: 'Big Cadi VIP',
  slug: 'big-cadi-vip',
  timezone: 'America/New_York',
  currency: 'USD',
}

function service(id: string, name: string, durationMinutes: number, priceCents: number, category: string): Service {
  return {
    id,
    name,
    description: null,
    durationMinutes,
    priceCents,
    category,
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    active: true,
    createdAt: new Date().toISOString(),
  }
}

function staffMember(id: string, name: string, color: string): Staff {
  return { id, name, color, active: true, userId: null }
}

function client(id: string, name: string, email: string): Client {
  return { id, name, email, phone: null, notes: null, tags: [], createdAt: new Date().toISOString() }
}

const airportTransfer = service('svc-airport', 'Airport Transfer', 45, 14_000, 'Airport transfer')
const hourlyChauffeur = service('svc-hourly', 'Hourly Chauffeur', 60, 9_500, 'Hourly chauffeur')
const cityTour = service('svc-city', 'City Tour', 120, 32_000, 'Hourly chauffeur')
const sunsetYacht = service('svc-sunset', 'Sunset Yacht Tour', 180, 190_000, 'Yacht tour')

const damon = staffMember('staff-damon', 'Damon Carter', '#f43f5e')
const mateo = staffMember('staff-mateo', 'Mateo Alvarez', '#38bdf8')
const leo = staffMember('staff-leo', 'Leo Ortiz', '#6366f1')
const priya = staffMember('staff-priya', 'Priya Nair', '#34d399')

const olivia = client('client-olivia', 'Olivia Bennett', 'olivia.bennett@example.com')
const james = client('client-james', 'James Park', 'james.park@example.com')
const sofia = client('client-sofia', 'Sofia Rossi', 'sofia.rossi@example.com')
const emma = client('client-emma', 'Emma Davis', 'emma.davis@example.com')
const ava = client('client-ava', 'Ava Walsh', 'ava.walsh@example.com')
const noah = client('client-noah', 'Noah Williams', 'noah.williams@example.com')
const liam = client('client-liam', 'Liam Carter', 'liam.carter@example.com')
const grace = client('client-grace', 'Grace Kim', 'grace.kim@example.com')

/** ISO instant for `dayOffset` days from now (local machine time) at the given wall-clock hour. */
function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function booking(
  id: string,
  svc: Service,
  staff: Staff,
  who: Client,
  startAt: string,
  status: Booking['status'],
): Booking {
  return {
    id,
    startAt,
    endAt: new Date(new Date(startAt).getTime() + svc.durationMinutes * 60_000).toISOString(),
    status,
    priceCents: svc.priceCents,
    currency: 'USD',
    cancelledAt: null,
    cancelFeeCents: null,
    service: svc,
    staff,
    client: who,
    addOns: [],
  }
}

export const MOCK_BOOKINGS: Booking[] = [
  booking('bk-1', airportTransfer, damon, olivia, at(-6, 9), 'completed'),
  booking('bk-2', hourlyChauffeur, mateo, james, at(-2, 11), 'completed'),
  booking('bk-3', cityTour, priya, grace, at(-1, 14), 'completed'),
  booking('bk-4', airportTransfer, damon, olivia, at(0, 9), 'completed'),
  booking('bk-5', hourlyChauffeur, mateo, james, at(0, 9, 45), 'confirmed'),
  booking('bk-6', sunsetYacht, leo, sofia, at(0, 10, 30), 'confirmed'),
  booking('bk-7', cityTour, damon, emma, at(0, 13), 'confirmed'),
  booking('bk-8', sunsetYacht, leo, ava, at(2, 11), 'pending'),
  booking('bk-9', airportTransfer, mateo, noah, at(2, 14, 30), 'pending'),
  booking('bk-10', hourlyChauffeur, priya, liam, at(3, 9), 'pending'),
]

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  date: new Date().toISOString().slice(0, 10),
  todaysRevenueCents: 245_500,
  appointments: { total: 4, completed: 1 },
  newClients: 3,
  revenueSparkline: [8_200, 11_400, 9_800, 15_200, 12_600, 18_900, 24_500],
  currency: 'USD',
}
