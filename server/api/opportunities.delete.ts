import { sql } from 'drizzle-orm'

/**
 * DELETE /api/opportunities — clear all stored opportunities.
 * Used to reset before running the new strategy.
 */
export default defineEventHandler(async () => {
  const db = useDatabase()

  // Delete all opportunities
  await db.delete(schema.opportunities)

  // Also clear scan logs so dashboard stats reset cleanly
  await db.delete(schema.scanLogs)

  return {
    success: true,
    message: 'All opportunities and scan logs cleared.',
  }
})
