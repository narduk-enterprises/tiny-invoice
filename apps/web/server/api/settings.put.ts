import { z } from 'zod'
import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../database/schema'
import { requireAuth } from '../utils/requireAuth'
import { useAppDatabase } from '../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

const schema = z.object({
  businessName: z.string().max(200).nullable(),
  businessAddress: z.string().max(500).nullable(),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 30, 60_000)
  const user = await requireAuth(event)
  const body = await readBody(event).catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const db = useAppDatabase(event)
  await db
    .update(users)
    .set({
      businessName: parsed.data.businessName ?? null,
      businessAddress: parsed.data.businessAddress ?? null,
    })
    .where(eq(users.id, user.id))
  return { ok: true }
})
