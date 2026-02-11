import { desc, sql, count, sum } from 'drizzle-orm'

/**
 * GET /api/stats — aggregate dashboard statistics
 * Portfolio value now comes from /api/portfolio (live Polymarket data)
 */
export default defineEventHandler(async () => {
  const db = useDatabase()

  // Total scans
  const [scanCount] = await db.select({ total: count() }).from(scanLogs)

  // Total opportunities found
  const [oppCount] = await db.select({ total: count() }).from(opportunities)

  // Total trades
  const [tradeCount] = await db.select({ total: count() }).from(trades)

  // Net P&L from our trades
  const [pnlResult] = await db.select({ total: sum(trades.pnl) }).from(trades)

  // Last scan
  const lastScan = await db.select().from(scanLogs).orderBy(desc(scanLogs.createdAt)).limit(1)

  // Active markets count
  const [marketCount] = await db.select({ total: count() }).from(markets)

  // Bot config (real values only, no fallbacks)
  const config = await db.select().from(botConfig).limit(1)
  const cfg = config[0] || null

  const netPnl = Number(pnlResult?.total || 0)

  // Win/loss breakdown
  const [winCount] = await db.select({ total: count() }).from(trades).where(sql`${trades.pnl} > 0`)
  const [lossCount] = await db.select({ total: count() }).from(trades).where(sql`${trades.pnl} < 0`)

  return {
    totalScans: scanCount?.total || 0,
    totalOpportunities: oppCount?.total || 0,
    totalTrades: tradeCount?.total || 0,
    netPnl,
    lastScan: lastScan[0] || null,
    activeMarkets: marketCount?.total || 0,
    config: cfg,
    winCount: winCount?.total || 0,
    lossCount: lossCount?.total || 0,
  }
})
