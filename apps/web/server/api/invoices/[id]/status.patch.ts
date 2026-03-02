import { z } from 'zod'
import { readBody } from 'h3'
import { eq, and } from 'drizzle-orm'
import { invoices } from '../../../database/schema'
import { requireAuth } from '../../../utils/requireAuth'
import { useAppDatabase } from '../../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import type { InvoiceStatus } from '../../../database/schema'

const schema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing invoice id' })
  }
  const body = await readBody(event).catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const status = parsed.data.status as InvoiceStatus
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
})
