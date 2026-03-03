import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, getRequestHeader } from 'h3'
import { eq, and, gt } from 'drizzle-orm'
import type { User } from '../database/schema'
import { sessions, users } from '../database/schema'
import { useAppDatabase } from './database'

const SESSION_COOKIE = 'tiny_invoice_session'
const SESSION_DAYS = 30

function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Create a session for the user and set the cookie.
 */
export async function createSession(event: H3Event, userId: string): Promise<string> {
  const db = useAppDatabase(event)
  const id = crypto.randomUUID()
  const expiresAt = nowSec() + SESSION_DAYS * 86400
  const createdAt = nowSec()
  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    createdAt,
  })
  const host = getRequestHeader(event, 'host') ?? ''
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  setCookie(event, SESSION_COOKIE, id, {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 86400,
    path: '/',
  })
  return id
}

/**
 * Get the current user from the session cookie. Returns null if not found or expired.
 */
export async function getSessionUser(event: H3Event): Promise<User | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const db = useAppDatabase(event)
  const now = nowSec()
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
      businessName: users.businessName,
      businessAddress: users.businessAddress,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return row as User
}

/**
 * Destroy the session and clear the cookie.
 */
export async function destroySession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    const db = useAppDatabase(event)
    await db.delete(sessions).where(eq(sessions.id, token))
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
