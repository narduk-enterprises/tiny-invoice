import { z } from 'zod'
import { readBody } from 'h3'
import { eq, and } from 'drizzle-orm'
import { clients } from '../../database/schema'
import { requireAuth } from '../../utils/requireAuth'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing client id' })
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
  const { name, email, address, phone } = parsed.data
  const db = useAppDatabase(event)
  const [existing] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, user.id)))
    .limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Client not found' })
  }
  await db
    .update(clients)
    .set({
      name,
      email,
      address: address ?? null,
      phone: phone ?? null,
    })
    .where(eq(clients.id, id))
  const [row] = await db.select().from(clients).where(eq(clients.id, id))
  return row
})
