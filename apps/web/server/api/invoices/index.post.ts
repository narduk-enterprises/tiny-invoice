import { z } from 'zod'
import { readBody } from 'h3'
import { eq, and, desc } from 'drizzle-orm'
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
  taxRate: z.number().int().min(0).max(10000).optional(), // e.g. 825 = 8.25%
  lineItems: z.array(lineItemSchema).min(1).max(100),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
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
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, user.id)))
    .limit(1)
  if (!client) {
    throw createError({ statusCode: 400, message: 'Client not found' })
  }

  const last = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(eq(invoices.userId, user.id))
    .orderBy(desc(invoices.createdAt))
    .limit(1)
  const nextNum = last.length
    ? parseInt(last[0]!.invoiceNumber.replace(/\D/g, ''), 10) + 1
    : 1
  const invoiceNumber = `INV-${String(nextNum).padStart(3, '0')}`

  let subtotal = 0
  const lineRows = items.map((item, i) => {
    const amount = item.quantity * item.unitPrice
    subtotal += amount
    return {
      id: crypto.randomUUID(),
      invoiceId: '' as string,
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
  const invoiceId = crypto.randomUUID()
  await db.insert(invoices).values({
    id: invoiceId,
    userId: user.id,
    clientId,
    invoiceNumber,
    status: 'draft',
    issueDate,
    dueDate,
    notes: notes ?? null,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  })

  for (const row of lineRows) {
    row.invoiceId = invoiceId
  }
  await db.insert(lineItems).values(
    lineRows.map((r) => ({
      id: crypto.randomUUID(),
      invoiceId: r.invoiceId,
      description: r.description,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      amount: r.amount,
      sortOrder: r.sortOrder,
    })),
  )

  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1)
  const createdItems = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, invoiceId))
    .orderBy(lineItems.sortOrder)
  setResponseStatus(event, 201)
  return {
    invoice: inv,
    client,
    lineItems: createdItems,
  }
})
