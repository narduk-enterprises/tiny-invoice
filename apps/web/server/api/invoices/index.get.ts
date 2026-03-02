import { eq, desc } from 'drizzle-orm'
import { invoices, clients } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useAppDatabase(event)
  const list = await db
    .select({
      id: invoices.id,
      clientId: invoices.clientId,
      clientName: clients.name,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      total: invoices.total,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, user.id))
    .orderBy(desc(invoices.createdAt))
  return { invoices: list }
})
