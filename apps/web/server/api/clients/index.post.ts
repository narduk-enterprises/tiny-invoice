import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { clients } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { defineUserMutation, withValidatedBody } from '#layer/server/utils/mutation'

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
})

export default defineUserMutation(
  {
    rateLimit: { namespace: 'api', maxRequests: 60, windowMs: 60_000 },
    parseBody: withValidatedBody(schema.parse),
  },
  async ({ event, user, body }) => {
    const { name, email, address, phone } = body
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
  },
)
