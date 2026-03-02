import { z } from 'zod'
import { readBody } from 'h3'
import { eq, and } from 'drizzle-orm'
import { invoices, lineItems, clients } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1).max(999999),
  unitPrice: z.number().int().min(0),
})
const schema = z.object({
  clientId: z.string().uuid(),
  issueDate: z.number().int().min(0),
  dueDate: z.number().int().min(0),
  notes: z.string().max(2000).optional(),
  taxRate: z.number().int().min(0).max(10000).optional(),
  lineItems: z.array(lineItemSchema).min(1).max(100),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing invoice id' })
  }
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const { clientId, issueDate, dueDate, notes, taxRate = 0, lineItems: items } = parsed.data

  const db = useAppDatabase(event)
  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Invoice not found' })
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, user.id)))
    .limit(1)
  if (!client) {
    throw createError({ statusCode: 400, message: 'Client not found' })
  }

  let subtotal = 0
  const lineRows = items.map((item, i) => {
    const amount = item.quantity * item.unitPrice
    subtotal += amount
    return {
      id: crypto.randomUUID(),
      invoiceId: id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount,
      sortOrder: i,
    }
  })
  const taxAmount = Math.round((subtotal * (taxRate / 10000)))
  const total = subtotal + taxAmount
  const now = Math.floor(Date.now() / 1000)

  await db
    .update(invoices)
    .set({
      clientId,
      issueDate,
      dueDate,
      notes: notes ?? null,
      subtotal,
      taxRate,
      taxAmount,
      total,
      updatedAt: now,
    })
    .where(eq(invoices.id, id))

  await db.delete(lineItems).where(eq(lineItems.invoiceId, id))
  await db.insert(lineItems).values(
    lineRows.map((r) => ({
      id: r.id,
      invoiceId: r.invoiceId,
      description: r.description,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      amount: r.amount,
      sortOrder: r.sortOrder,
    })),
  )

  const [inv] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1)
  const createdItems = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id))
    .orderBy(lineItems.sortOrder)
  return {
    invoice: inv,
    client,
    lineItems: createdItems,
  }
})
