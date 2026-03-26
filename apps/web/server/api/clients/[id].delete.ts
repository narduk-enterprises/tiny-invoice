import { eq, and } from 'drizzle-orm'
import { clients, invoices } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { defineUserMutation } from '#layer/server/utils/mutation'

export default defineUserMutation(
  { rateLimit: { namespace: 'api', maxRequests: 60, windowMs: 60_000 } },
  async ({ event, user }) => {
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
  },
)
