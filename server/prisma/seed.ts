import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { hashPassword } from '../src/lib/passwords.js'
import { addDaysToDateString, localToUtc } from '../src/modules/availability/timezone.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const WORKSPACE_SLUG = 'big-cadi-vip'
const WORKSPACE_TZ = 'America/New_York'

function localTodayDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: WORKSPACE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  )
}

// hour/minute are workspace-local wall-clock time, converted to the correct UTC instant.
function dateAt(dayOffset: number, hour: number, minute = 0): Date {
  const dateStr = addDaysToDateString(localTodayDateStr(), dayOffset)
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return localToUtc(dateStr, `${hh}:${mm}`, WORKSPACE_TZ)
}

function daysAgo(days: number, hour: number, minute = 0): Date {
  return dateAt(-days, hour, minute)
}

function daysFromNow(days: number, hour: number, minute = 0): Date {
  return dateAt(days, hour, minute)
}

async function main() {
  console.log('Seeding Big Cadi VIP...')

  const existing = await prisma.workspace.findUnique({ where: { slug: WORKSPACE_SLUG } })
  if (existing) {
    console.log('Removing existing workspace to reseed cleanly...')
    await prisma.workspace.delete({ where: { id: existing.id } })
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Big Cadi VIP',
      slug: WORKSPACE_SLUG,
      timezone: 'America/New_York',
      currency: 'USD',
      supportEmail: 'concierge@bigcadivip.com',
      phone: '+1 (305) 555-0148',
      setupState: { service: true, flow: true, hours: true, pay: true, team: true, share: false },
    },
  })

  const ownerPasswordHash = await hashPassword('password123')
  const owner = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      role: 'owner',
      name: 'Cadi',
      email: 'cadi@bigcadivip.com',
      passwordHash: ownerPasswordHash,
    },
  })

  // One staff member also gets a login, to demonstrate the `staff` role's
  // restricted "own assignments only" view.
  const staffPasswordHash = await hashPassword('password123')
  const damonUser = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      role: 'staff',
      name: 'Damon Carter',
      email: 'damon@bigcadivip.com',
      passwordHash: staffPasswordHash,
    },
  })

  // ---- Services (3 categories, ~5 services) ----
  const [airportTransfer, hourlyChauffeur, cityTour, sunsetYacht, fullDayCharter] = await Promise.all([
    prisma.service.create({
      data: {
        workspaceId: workspace.id,
        name: 'Airport Transfer',
        description: 'Door-to-door airport transfer in a luxury sedan.',
        durationMinutes: 45,
        priceCents: 14_000,
        category: 'Airport transfer',
        bufferBeforeMin: 10,
        bufferAfterMin: 10,
      },
    }),
    prisma.service.create({
      data: {
        workspaceId: workspace.id,
        name: 'Hourly Chauffeur',
        description: 'Chauffeured SUV, billed hourly.',
        durationMinutes: 60,
        priceCents: 9_500,
        category: 'Hourly chauffeur',
        bufferBeforeMin: 0,
        bufferAfterMin: 15,
      },
    }),
    prisma.service.create({
      data: {
        workspaceId: workspace.id,
        name: 'City Tour',
        description: 'Guided city tour with a private chauffeur.',
        durationMinutes: 120,
        priceCents: 32_000,
        category: 'Hourly chauffeur',
        bufferBeforeMin: 15,
        bufferAfterMin: 15,
      },
    }),
    prisma.service.create({
      data: {
        workspaceId: workspace.id,
        name: 'Sunset Yacht Tour',
        description: 'Three-hour sunset cruise for up to 10 guests.',
        durationMinutes: 180,
        priceCents: 190_000,
        category: 'Yacht tour',
        bufferBeforeMin: 30,
        bufferAfterMin: 30,
      },
    }),
    prisma.service.create({
      data: {
        workspaceId: workspace.id,
        name: 'Full Day Charter',
        description: 'Full-day yacht charter with crew.',
        durationMinutes: 480,
        priceCents: 650_000,
        category: 'Yacht tour',
        bufferBeforeMin: 60,
        bufferAfterMin: 60,
      },
    }),
  ])

  // ---- Add-ons ----
  const [champagne, extraHour, decor] = await Promise.all([
    prisma.addOn.create({ data: { workspaceId: workspace.id, name: 'Champagne Service', priceCents: 7_500 } }),
    prisma.addOn.create({ data: { workspaceId: workspace.id, name: 'Extra Hour', priceCents: 9_500 } }),
    prisma.addOn.create({ data: { workspaceId: workspace.id, name: 'Decor Package', priceCents: 12_000 } }),
  ])
  await prisma.serviceAddOn.createMany({
    data: [
      { serviceId: sunsetYacht.id, addOnId: champagne.id },
      { serviceId: fullDayCharter.id, addOnId: champagne.id },
      { serviceId: fullDayCharter.id, addOnId: decor.id },
      { serviceId: hourlyChauffeur.id, addOnId: extraHour.id },
      { serviceId: cityTour.id, addOnId: decor.id },
    ],
  })

  // ---- Staff (6) ----
  const weekdayHoursMonSat: Array<{ weekday: number; startTime: string; endTime: string }> = [1, 2, 3, 4, 5, 6].map(
    (weekday) => ({ weekday, startTime: '09:00', endTime: '18:00' }),
  )

  const staffDefs = [
    { name: 'Damon Carter', color: '#f43f5e', userId: damonUser.id, services: [airportTransfer, hourlyChauffeur, cityTour] },
    { name: 'Mateo Alvarez', color: '#38bdf8', userId: null, services: [airportTransfer, hourlyChauffeur] },
    { name: 'Leo Ortiz', color: '#6366f1', userId: null, services: [sunsetYacht, fullDayCharter] },
    { name: 'Priya Nair', color: '#34d399', userId: null, services: [cityTour, airportTransfer] },
    { name: 'Owen Blake', color: '#fbbf24', userId: null, services: [sunsetYacht, fullDayCharter] },
    { name: 'Nina Torres', color: '#a78bfa', userId: null, services: [hourlyChauffeur, cityTour, airportTransfer] },
  ]

  const staffRecords = new Map<string, { id: string }>()
  for (const def of staffDefs) {
    const staff = await prisma.staff.create({
      data: {
        workspaceId: workspace.id,
        name: def.name,
        color: def.color,
        userId: def.userId ?? undefined,
        services: { create: def.services.map((s) => ({ serviceId: s.id })) },
        workingHours: { create: weekdayHoursMonSat },
      },
    })
    staffRecords.set(def.name, staff)
  }

  const damon = staffRecords.get('Damon Carter')!
  const mateo = staffRecords.get('Mateo Alvarez')!
  const leo = staffRecords.get('Leo Ortiz')!
  const priya = staffRecords.get('Priya Nair')!
  const owen = staffRecords.get('Owen Blake')!
  const nina = staffRecords.get('Nina Torres')!
  // ---- Booking flow ----
  const flow = await prisma.bookingFlow.create({ data: { workspaceId: workspace.id } })
  await prisma.flowStep.createMany({
    data: [
      { bookingFlowId: flow.id, type: 'service_select', position: 0, required: true, enabled: true },
      { bookingFlowId: flow.id, type: 'date_time', position: 1, required: true, enabled: true },
      { bookingFlowId: flow.id, type: 'add_ons', position: 2, required: false, enabled: true },
      { bookingFlowId: flow.id, type: 'customer_info', position: 3, required: true, enabled: true },
      { bookingFlowId: flow.id, type: 'payment', position: 4, required: true, enabled: true },
    ],
  })

  // ---- Availability rule ----
  await prisma.availabilityRule.create({
    data: {
      workspaceId: workspace.id,
      weekdayHours: { 1: [['09:00', '18:00']], 2: [['09:00', '18:00']], 3: [['09:00', '18:00']], 4: [['09:00', '18:00']], 5: [['09:00', '18:00']], 6: [['09:00', '18:00']] },
      blackoutDates: [],
      minLeadMinutes: 60,
      maxAdvanceDays: 60,
      slotGranularity: 30,
      travelBufferMin: 15,
    },
  })

  // ---- Payment & cancellation policy ----
  await prisma.paymentPolicy.create({
    data: {
      workspaceId: workspace.id,
      mode: 'deposit',
      depositPercent: 30,
      chargeTiming: 'at_booking',
      currency: 'USD',
    },
  })
  await prisma.cancellationPolicy.create({
    data: { workspaceId: workspace.id, freeCancelHours: 24, lateFeePercent: 50, noShowFeePercent: 100 },
  })

  // ---- Clients ----
  const clientDefs = [
    { name: 'Olivia Bennett', email: 'olivia.bennett@example.com' },
    { name: 'James Park', email: 'james.park@example.com' },
    { name: 'Sofia Rossi', email: 'sofia.rossi@example.com' },
    { name: 'Emma Davis', email: 'emma.davis@example.com' },
    { name: 'Ava Walsh', email: 'ava.walsh@example.com' },
    { name: 'Noah Williams', email: 'noah.williams@example.com' },
    { name: 'Liam Carter', email: 'liam.carter@example.com' },
    { name: 'Grace Kim', email: 'grace.kim@example.com' },
    { name: 'Ethan Cole', email: 'ethan.cole@example.com' },
  ]
  const clients = new Map<string, { id: string; name: string; email: string }>()
  for (const def of clientDefs) {
    const client = await prisma.client.create({ data: { workspaceId: workspace.id, ...def } })
    clients.set(def.name, client)
  }

  const c = (name: string) => clients.get(name)!

  // ---- A week of sample bookings ----
  interface SeedBooking {
    service: typeof airportTransfer
    staff: { id: string }
    client: { id: string }
    startAt: Date
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  }

  const pastCompleted: SeedBooking[] = [
    { service: airportTransfer, staff: damon, client: c('Olivia Bennett'), startAt: daysAgo(6, 9), status: 'completed' },
    { service: hourlyChauffeur, staff: mateo, client: c('James Park'), startAt: daysAgo(5, 11), status: 'completed' },
    { service: cityTour, staff: priya, client: c('Grace Kim'), startAt: daysAgo(5, 14), status: 'completed' },
    { service: sunsetYacht, staff: leo, client: c('Sofia Rossi'), startAt: daysAgo(4, 17), status: 'completed' },
    { service: airportTransfer, staff: nina, client: c('Noah Williams'), startAt: daysAgo(3, 8), status: 'completed' },
    { service: hourlyChauffeur, staff: damon, client: c('Liam Carter'), startAt: daysAgo(2, 10), status: 'completed' },
    { service: fullDayCharter, staff: owen, client: c('Ethan Cole'), startAt: daysAgo(1, 9), status: 'completed' },
    { service: cityTour, staff: mateo, client: c('Emma Davis'), startAt: daysAgo(1, 13), status: 'cancelled' },
  ]

  const today: SeedBooking[] = [
    { service: airportTransfer, staff: damon, client: c('Olivia Bennett'), startAt: daysAgo(0, 9), status: 'confirmed' },
    { service: hourlyChauffeur, staff: mateo, client: c('James Park'), startAt: daysAgo(0, 9, 45), status: 'confirmed' },
    { service: sunsetYacht, staff: leo, client: c('Sofia Rossi'), startAt: daysAgo(0, 10, 30), status: 'confirmed' },
    { service: cityTour, staff: damon, client: c('Emma Davis'), startAt: daysAgo(0, 13), status: 'confirmed' },
  ]

  const upcomingPending: SeedBooking[] = [
    { service: sunsetYacht, staff: leo, client: c('Ava Walsh'), startAt: daysFromNow(2, 11), status: 'pending' },
    { service: airportTransfer, staff: nina, client: c('Noah Williams'), startAt: daysFromNow(2, 14, 30), status: 'pending' },
    { service: hourlyChauffeur, staff: priya, client: c('Liam Carter'), startAt: daysFromNow(3, 9), status: 'pending' },
    { service: cityTour, staff: mateo, client: c('Grace Kim'), startAt: daysFromNow(3, 16), status: 'pending' },
    { service: fullDayCharter, staff: owen, client: c('Ethan Cole'), startAt: daysFromNow(4, 12), status: 'pending' },
  ]

  for (const b of [...pastCompleted, ...today, ...upcomingPending]) {
    const endAt = new Date(b.startAt.getTime() + b.service.durationMinutes * 60_000)
    await prisma.booking.create({
      data: {
        workspaceId: workspace.id,
        serviceId: b.service.id,
        staffId: b.staff.id,
        clientId: b.client.id,
        startAt: b.startAt,
        endAt,
        status: b.status,
        priceCents: b.service.priceCents,
        currency: 'USD',
        ...(b.status === 'cancelled' ? { cancelledAt: new Date(), cancelFeeCents: 0 } : {}),
      },
    })
  }

  console.log('Seed complete:')
  console.log(`  Workspace: ${workspace.name} (/${workspace.slug})`)
  console.log(`  Owner login: ${owner.email} / password123`)
  console.log(`  Staff login: ${damonUser.email} / password123`)
  console.log(`  Services: 5, Staff: 6, Bookings: ${pastCompleted.length + today.length + upcomingPending.length}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
