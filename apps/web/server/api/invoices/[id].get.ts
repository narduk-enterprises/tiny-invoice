import { eq, and } from 'drizzle-orm'
import { invoices, lineItems, clients } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing invoice id' })
  }
  const db = useAppDatabase(event)
  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .limit(1)
  if (!inv) {
    throw createError({ statusCode: 404, message: 'Invoice not found' })
  }
  const [client] = await db.select().from(clients).where(eq(clients.id, inv.clientId)).limit(1)
  const items = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id))
    .orderBy(lineItems.sortOrder, lineItems.id)
  return {
    invoice: inv,
    client: client ?? null,
    lineItems: items,
  }
})
