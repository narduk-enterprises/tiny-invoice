import { eq, and } from 'drizzle-orm'
import { invoices, lineItems } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
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
})
