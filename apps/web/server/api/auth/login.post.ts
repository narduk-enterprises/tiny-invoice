import { z } from 'zod'
import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { verifyPassword } from '../../utils/password'
import { createSession } from '../../utils/session'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth', 10, 60_000)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const { email, password } = parsed.data

  const db = useAppDatabase(event)
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = rows[0]
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  await createSession(event, user.id)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      businessAddress: user.businessAddress,
    },
  }
})
