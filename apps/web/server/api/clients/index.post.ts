import { z } from 'zod'
import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
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
  const id = crypto.randomUUID()
  const createdAt = Math.floor(Date.now() / 1000)
  await db.insert(clients).values({
    id,
    userId: user.id,
    name,
    email,
    address: address ?? null,
    phone: phone ?? null,
    createdAt,
  })
  const [row] = await db.select().from(clients).where(eq(clients.id, id))
  return row
})
