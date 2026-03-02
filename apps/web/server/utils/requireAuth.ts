import type { H3Event } from 'h3'
import type { User } from '../database/schema'
import { getSessionUser } from './session'

/**
 * Get the current user from the session. Throws 401 if not authenticated.
 */
export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  return user
}
