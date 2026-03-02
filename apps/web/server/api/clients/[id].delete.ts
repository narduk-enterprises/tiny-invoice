import { eq, and } from 'drizzle-orm'
import { clients, invoices } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing client id' })
  }
  const db = useAppDatabase(event)
  const [existing] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, user.id)))
    .limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Client not found' })
  }
  const withInvoices = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.clientId, id))
    .limit(1)
  if (withInvoices.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Cannot delete client with existing invoices',
    })
  }
  await db.delete(clients).where(eq(clients.id, id))
  setResponseStatus(event, 204)
})
