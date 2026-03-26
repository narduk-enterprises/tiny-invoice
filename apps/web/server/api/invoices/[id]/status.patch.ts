import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { invoices } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { defineUserMutation, withValidatedBody } from '#layer/server/utils/mutation'
import type { InvoiceStatus } from '#server/database/schema'

const schema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})

export default defineUserMutation(
  {
    rateLimit: { namespace: 'api', maxRequests: 60, windowMs: 60_000 },
    parseBody: withValidatedBody(schema.parse),
  },
  async ({ event, user, body }) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing invoice id' })
    }
    const status = body.status as InvoiceStatus
    const db = useAppDatabase(event)
    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
      .limit(1)
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Invoice not found' })
    }

    const now = Math.floor(Date.now() / 1000)
    const updates: Partial<typeof existing> = { status, updatedAt: now }
    if (status === 'paid') {
      updates.paidAt = now
    }
    await db.update(invoices).set(updates).where(eq(invoices.id, id))
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1)
    return inv
  },
)
