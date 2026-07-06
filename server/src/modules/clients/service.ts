import { prisma } from '../../lib/prisma.js'

export interface FindOrCreateClientInput {
  workspaceId: string
  name: string
  email: string
  phone?: string
}

/** Used both by the admin Clients CRUD and by the public booking flow, so a
 *  client who books twice under the same email is recognized, not duplicated. */
export async function findOrCreateClient(input: FindOrCreateClientInput) {
  const existing = await prisma.client.findUnique({
    where: { workspaceId_email: { workspaceId: input.workspaceId, email: input.email } },
  })
  if (existing) {
    if (input.phone && !existing.phone) {
      return prisma.client.update({ where: { id: existing.id }, data: { phone: input.phone } })
    }
    return existing
  }

  return prisma.client.create({
    data: { workspaceId: input.workspaceId, name: input.name, email: input.email, phone: input.phone },
  })
}
