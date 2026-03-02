import { eq } from 'drizzle-orm'
import { invoices } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useAppDatabase(event)
  const all = await db
    .select({
      status: invoices.status,
      total: invoices.total,
    })
    .from(invoices)
    .where(eq(invoices.userId, user.id))

  let totalRevenue = 0
  let outstanding = 0
  const countByStatus: Record<string, number> = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  }

  for (const row of all) {
    countByStatus[row.status] = (countByStatus[row.status] ?? 0) + 1
    if (row.status === 'paid') {
      totalRevenue += row.total
    } else if (row.status === 'sent' || row.status === 'overdue') {
      outstanding += row.total
    }
  }

  return {
    totalRevenue,
    outstanding,
    invoiceCountByStatus: countByStatus,
  }
})
