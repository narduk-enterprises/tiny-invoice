import { eq, and } from 'drizzle-orm'
import { invoices, lineItems } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { defineUserMutation } from '#layer/server/utils/mutation'

export default defineUserMutation(
  { rateLimit: { namespace: 'api', maxRequests: 60, windowMs: 60_000 } },
  async ({ event, user }) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing invoice id' })
    }
    const db = useAppDatabase(event)
    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Invoice not found' })
    }
    await db.delete(lineItems).where(eq(lineItems.invoiceId, id))
    await db.delete(invoices).where(eq(invoices.id, id))
    setResponseStatus(event, 204)
  },
)
