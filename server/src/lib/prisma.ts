import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { env } from '../env.js'
import { getTenantId } from './tenantContext.js'

// Models that carry a workspaceId column and must never be queried across tenants.
// Workspace itself is excluded — it IS the tenant. Join/child tables (FlowStep,
// StaffService, WorkingHours, TimeOff, ServiceAddOn, BookingAddOn, Payment) are
// scoped transitively through their parent, which routes must load/verify first.
const TENANT_SCOPED_MODELS = new Set([
  'User',
  'Service',
  'AddOn',
  'Staff',
  'BookingFlow',
  'AvailabilityRule',
  'PaymentPolicy',
  'CancellationPolicy',
  'Client',
  'Booking',
])

function withTenantScope(client: PrismaClient) {
  return client.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const workspaceId = getTenantId()
          if (!workspaceId || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args)
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const a = args as any

          switch (operation) {
            case 'findUnique':
            case 'findUniqueOrThrow':
            case 'findFirst':
            case 'findFirstOrThrow':
            case 'findMany':
            case 'update':
            case 'updateMany':
            case 'delete':
            case 'deleteMany':
            case 'count':
            case 'aggregate':
            case 'groupBy':
              a.where = { ...(a.where ?? {}), workspaceId }
              break
            case 'create':
              a.data = { ...(a.data ?? {}), workspaceId }
              break
            case 'createMany':
            case 'createManyAndReturn':
              if (Array.isArray(a.data)) {
                a.data = a.data.map((d: Record<string, unknown>) => ({ ...d, workspaceId }))
              }
              break
            case 'upsert':
              a.where = { ...(a.where ?? {}), workspaceId }
              a.create = { ...(a.create ?? {}), workspaceId }
              a.update = { ...(a.update ?? {}), workspaceId }
              break
            default:
              break
          }

          return query(a)
        },
      },
    },
  })
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const basePrisma = globalThis.__prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = basePrisma
}

/** Tenant-scoped Prisma client — use everywhere in request handlers. */
export const prisma = withTenantScope(basePrisma)

/** Unscoped client for scripts (seed, migrations) that legitimately cross tenants. */
export const rawPrisma = basePrisma
