import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
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
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'Missing client id' })
    }
    const { name, email, address, phone } = body
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
  },
)
