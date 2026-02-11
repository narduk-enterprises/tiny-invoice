import { eq } from 'drizzle-orm'

/**
 * PUT /api/config — update bot configuration
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const body = await readBody(event)

  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString()
  }

  if (typeof body.active === 'boolean') updates.active = body.active
  if (typeof body.dryRun === 'boolean') updates.dryRun = body.dryRun
  if (typeof body.maxBetUsd === 'number' && body.maxBetUsd > 0) updates.maxBetUsd = body.maxBetUsd
  if (typeof body.minSpreadPct === 'number' && body.minSpreadPct >= 0) updates.minSpreadPct = body.minSpreadPct
  if (typeof body.minConvictionPct === 'number' && body.minConvictionPct >= 50) updates.minConvictionPct = body.minConvictionPct
  if (typeof body.minVolume === 'number' && body.minVolume >= 0) updates.minVolume = body.minVolume
  if (typeof body.minLiquidity === 'number' && body.minLiquidity >= 0) updates.minLiquidity = body.minLiquidity
  if (typeof body.maxDailyTrades === 'number' && body.maxDailyTrades >= 1) updates.maxDailyTrades = body.maxDailyTrades

  // Check if config exists
  const existing = await db.select().from(botConfig).limit(1)

  if (existing.length === 0) {
    // Insert default config with updates
    await db.insert(botConfig).values({
      id: 1,
      active: updates.active ?? false,
      dryRun: updates.dryRun ?? true,
      maxBetUsd: updates.maxBetUsd ?? 50,
      minSpreadPct: updates.minSpreadPct ?? 1.0,
      minConvictionPct: updates.minConvictionPct ?? 75,
      minVolume: updates.minVolume ?? 50000,
      minLiquidity: updates.minLiquidity ?? 10000,
      maxDailyTrades: updates.maxDailyTrades ?? 3,
      startingBalance: 1000,
      updatedAt: updates.updatedAt,
    })
  } else {
    await db.update(botConfig).set(updates).where(eq(botConfig.id, 1))
  }

  // Return updated config
  const [config] = await db.select().from(botConfig).limit(1)
  return config
})
