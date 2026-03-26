import type { H3Event } from 'h3'
import type { User } from '#server/database/schema'
import { getSessionUser } from '#server/utils/session'

export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return user
}
