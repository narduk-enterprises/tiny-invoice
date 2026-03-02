import { z } from 'zod'
import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useAppDatabase } from '../../utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { hashPassword } from '../../utils/password'
import { createSession } from '../../utils/session'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(100),
  businessName: z.string().max(200).optional(),
  businessAddress: z.string().max(500).optional(),
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
  const { email, name, password, businessName, businessAddress } = parsed.data

  const db = useAppDatabase(event)
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Email already registered',
    })
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)
  const createdAt = Math.floor(Date.now() / 1000)
  await db.insert(users).values({
    id,
    email,
    name,
    passwordHash,
    businessName: businessName ?? null,
    businessAddress: businessAddress ?? null,
    createdAt,
  })

  await createSession(event, id)
  return {
    user: {
      id,
      email,
      name,
      businessName: businessName ?? null,
      businessAddress: businessAddress ?? null,
    },
  }
})
