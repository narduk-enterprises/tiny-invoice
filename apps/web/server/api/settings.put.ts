import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { defineUserMutation, withValidatedBody } from '#layer/server/utils/mutation'

const schema = z.object({
  businessName: z.string().max(200).nullable(),
  businessAddress: z.string().max(500).nullable(),
})

export default defineUserMutation(
  {
    rateLimit: { namespace: 'api', maxRequests: 30, windowMs: 60_000 },
    parseBody: withValidatedBody(schema.parse),
  },
  async ({ event, user, body }) => {
    const db = useAppDatabase(event)
    await db
      .update(users)
      .set({
        businessName: body.businessName ?? null,
        businessAddress: body.businessAddress ?? null,
      })
      .where(eq(users.id, user.id))
    return { ok: true }
  },
)
