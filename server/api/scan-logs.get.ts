import { desc } from 'drizzle-orm'

/**
 * GET /api/scan-logs — retrieve recent scan logs with debug details.
 * Shows the rejection breakdown from each scan run.
 */
export default defineEventHandler(async () => {
  const db = useDatabase()

  const logs = await db.select()
    .from(schema.scanLogs)
    .orderBy(desc(schema.scanLogs.createdAt))
    .limit(20)

  return logs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
  }))
})
