import type { H3Event } from 'h3'
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

/**
 * Drizzle ORM for the app schema (users, sessions, clients, invoices, lineItems).
 * Named useAppDatabase to avoid conflicting with the layer's useDatabase.
 */
export function useAppDatabase(event: H3Event): DrizzleD1Database<typeof schema> {
  const key = '_app_db'
  if (event.context[key]) {
    return event.context[key]
  }

  const d1 = (event.context.cloudflare?.env as { DB?: D1Database })?.DB
  if (!d1) {
    throw createError({
      statusCode: 500,
      message: 'D1 database binding not available. Ensure DB is configured in wrangler.json.',
    })
  }

  const db = drizzle(d1, { schema })
  event.context[key] = db
  return db
}
