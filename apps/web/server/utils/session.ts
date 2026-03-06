import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, getRequestURL } from 'h3'
import { and, eq, gt } from 'drizzle-orm'
import { sessions, users } from '../database/schema'
import { useAppDatabase } from './database'

const SESSION_COOKIE = 'tiny_invoice_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function generateSessionId(): string {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(event: H3Event, userId: string): Promise<string> {
  const db = useAppDatabase(event)
  const id = generateSessionId()
  const now = Date.now()
  const createdAt = Math.floor(now / 1000)
  const expiresAt = Math.floor((now + SESSION_TTL_MS) / 1000)

  await db.insert(sessions).values({ id, userId, createdAt, expiresAt })

  const requestUrl = getRequestURL(event)
  setCookie(event, SESSION_COOKIE, id, {
    httpOnly: true,
    secure: requestUrl.protocol === 'https:',
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  })

  return id
}

export async function destroySession(event: H3Event): Promise<void> {
  const db = useAppDatabase(event)
  const sessionId = getCookie(event, SESSION_COOKIE)
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export async function getSessionUser(event: H3Event): Promise<typeof users.$inferSelect | null> {
  const sessionId = getCookie(event, SESSION_COOKIE)
  if (!sessionId) {
    return null
  }

  const db = useAppDatabase(event)
  const now = Math.floor(Date.now() / 1000)
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1)

  if (!session) {
    return null
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
}
