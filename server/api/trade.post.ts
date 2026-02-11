import { eq } from 'drizzle-orm'

/**
 * POST /api/trade — manually trigger a trade on the best available opportunity
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const runtimeConfig = useRuntimeConfig()

  // Read bot config
  const configs = await db.select().from(schema.botConfig).limit(1)
  const config = configs[0] || { maxBetUsd: 10, dryRun: true, minConvictionPct: 92 }

  if (config.dryRun) {
    throw createError({
      statusCode: 400,
      message: 'Bot is in dry-run mode. Disable dry-run in settings to enable live trading.',
    })
  }

  // Check for API credentials
  if (!runtimeConfig.polymarketApiKey || !runtimeConfig.polymarketPrivateKey) {
    throw createError({
      statusCode: 500,
      message: 'Polymarket API credentials not configured',
    })
  }

  // Fetch latest opportunities to find the best one to trade
  const opportunities = await db
    .select()
    .from(schema.opportunities)
    .orderBy(schema.opportunities.detectedAt)
    .limit(50)

  // Enrich with token IDs from the markets table
  const enrichedOpps = []
  for (const opp of opportunities) {
    if (opp.traded) continue

    const markets = await db
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.id, opp.marketId))
      .limit(1)

    const market = markets[0]
    if (!market) continue

    enrichedOpps.push({
      marketId: opp.marketId,
      question: opp.question,
      type: opp.type || 'arbitrage',
      yesPrice: opp.yesPrice,
      noPrice: opp.noPrice,
      conviction: opp.conviction || 0,
      dominantSide: opp.dominantSide || '',
      yesTokenId: market.yesTokenId || '',
      noTokenId: market.noTokenId || '',
    })
  }

  if (enrichedOpps.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'No untraded opportunities available. Run a scan first.',
    })
  }

  // Execute the best trade
  const result = await executeBestTrade({
    opportunities: enrichedOpps,
    maxBetUsd: config.maxBetUsd ?? 10,
    privateKey: runtimeConfig.polymarketPrivateKey,
    apiKey: runtimeConfig.polymarketApiKey,
    secret: runtimeConfig.polymarketSecret,
    passphrase: runtimeConfig.polymarketPassphrase,
  })

  if (!result) {
    throw createError({
      statusCode: 500,
      message: 'Trade execution returned no result',
    })
  }

  // Record the trade in DB (match schema column names)
  await db.insert(schema.trades).values({
    marketId: result.marketId,
    marketQuestion: result.question,
    side: result.side,
    amount: result.amountUsd,
    price: result.price,
    shares: result.size,
    status: result.success ? 'filled' : 'failed',
    txHash: result.orderId || null,
    pnl: 0,
    executedAt: new Date().toISOString(),
  })

  return result
})
