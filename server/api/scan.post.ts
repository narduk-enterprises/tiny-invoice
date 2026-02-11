import { desc, and, eq, gte } from 'drizzle-orm'
import { createDebugLog, scanForMultiOutcomeArbitrage, scanForTailEndSweep, type ScanDebugLog } from '../utils/arbitrage'
import { fetchActiveEvents } from '../utils/polymarket'

/**
 * POST /api/scan — manually trigger an arbitrage scan.
 * Same logic as the cron worker but callable via API for testing.
 *
 * Features:
 * - Volume/liquidity/time filtering via scanner
 * - Composite quality scoring
 * - Deduplication (same market within 6 hours → skip)
 * - Debug logging with market rejection breakdown
 * - Returns top opportunities ranked by quality score
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const startTime = Date.now()

  try {
    // 1. Read bot config
    const configs = await db.select().from(schema.botConfig).limit(1)
    const config = configs[0] || {
      active: false,
      dryRun: true,
      maxBetUsd: 50,
      minSpreadPct: 1.0,
      minConvictionPct: 95,
      minVolume: 50000,
      minLiquidity: 10000,
      maxDailyTrades: 3,
    }

    // Build filter config from settings
    const filters = {
      minVolume: config.minVolume ?? 50000,
      minLiquidity: config.minLiquidity ?? 10000,
      maxResults: 10,
    }

    // 2. Fetch active markets from Polymarket (broader search)
    const polymarkets = await fetchActiveMarkets(500)

    // 3. Update market cache in D1 (non-fatal per row)
    let marketCacheErrors = 0
    for (const m of polymarkets) {
      try {
        const { yesPrice, noPrice } = parseMarketPrices(m)
        await db.insert(schema.markets).values({
          id: m.id,
          question: m.question || '',
          slug: m.slug || '',
          yesTokenId: m.clobTokenIds?.[0] || '',
          noTokenId: m.clobTokenIds?.[1] || '',
          yesPrice: Number.isFinite(yesPrice) ? yesPrice : 0,
          noPrice: Number.isFinite(noPrice) ? noPrice : 0,
          volume: Number.isFinite(m.volume) ? m.volume : 0,
          liquidity: Number.isFinite(m.liquidity) ? m.liquidity : 0,
          endDate: m.endDate || '',
          active: !!(m.active && !m.closed),
          updatedAt: new Date().toISOString(),
        }).onConflictDoUpdate({
          target: schema.markets.id,
          set: {
            yesPrice: Number.isFinite(yesPrice) ? yesPrice : 0,
            noPrice: Number.isFinite(noPrice) ? noPrice : 0,
            volume: Number.isFinite(m.volume) ? m.volume : 0,
            liquidity: Number.isFinite(m.liquidity) ? m.liquidity : 0,
            active: !!(m.active && !m.closed),
            updatedAt: new Date().toISOString(),
          }
        })
      } catch {
        marketCacheErrors++
      }
    }

    // 4. Create debug log to track rejection reasons
    const debug = createDebugLog()
    debug.totalMarkets = polymarkets.length

    // 5. Scan for pure arbitrage (with debug tracking)
    const arbs = scanForArbitrage(polymarkets, config.minSpreadPct ?? 1.0, filters, debug)

    // 6. Scan for high-conviction (skewed) opportunities (with debug tracking)
    const convictions = scanForHighConviction(polymarkets, config.minConvictionPct ?? 95, filters, debug)

    // 6b. Fetch multi-outcome events and scan for bundle arb
    let multiOutcomeArbs: Awaited<ReturnType<typeof scanForMultiOutcomeArbitrage>> = []
    let tailEndSweeps: Awaited<ReturnType<typeof scanForTailEndSweep>> = []

    try {
      const events = await fetchActiveEvents(100)
      multiOutcomeArbs = scanForMultiOutcomeArbitrage(events, filters, debug)
    } catch (err: any) {
      console.warn('[scan] Multi-outcome fetch failed:', err.message)
    }

    // 6c. Scan for tail-end sweep opportunities
    tailEndSweeps = scanForTailEndSweep(polymarkets, filters, debug)

    // 7. Deduplicate: skip markets already detected in last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    const recentOpps = await db.select({ marketId: schema.opportunities.marketId })
      .from(schema.opportunities)
      .where(gte(schema.opportunities.detectedAt, sixHoursAgo))

    const recentMarketIds = new Set(recentOpps.map(o => o.marketId))

    const allOpps = [...arbs, ...convictions, ...multiOutcomeArbs, ...tailEndSweeps].filter(
      opp => !recentMarketIds.has(opp.marketId)
    )

    let storedCount = 0
    for (const opp of allOpps) {
      try {
        await db.insert(schema.opportunities).values({
          marketId: opp.marketId,
          question: opp.question || '',
          type: opp.type,
          yesPrice: Number.isFinite(opp.yesPrice) ? opp.yesPrice : 0,
          noPrice: Number.isFinite(opp.noPrice) ? opp.noPrice : 0,
          spread: Number.isFinite(opp.spread) ? opp.spread : 0,
          expectedProfit: Number.isFinite(opp.expectedProfitPer100) ? opp.expectedProfitPer100 : 0,
          conviction: Number.isFinite(opp.conviction) ? opp.conviction : 0,
          dominantSide: opp.dominantSide || '',
          qualityScore: Number.isFinite(opp.qualityScore) ? opp.qualityScore : 0,
          traded: false,
          // Multi-outcome arb fields
          eventTitle: opp.eventTitle || null,
          outcomeCount: opp.outcomeCount || null,
          outcomesJson: opp.outcomes ? JSON.stringify(opp.outcomes) : null,
          // Tail-end sweep fields
          annualizedReturn: Number.isFinite(opp.annualizedReturn) ? opp.annualizedReturn : null,
          daysToResolution: Number.isFinite(opp.daysToResolution) ? opp.daysToResolution : null,
          detectedAt: new Date().toISOString(),
        })
        storedCount++
      } catch {
        // Skip opportunities that fail to insert
      }
    }

    // 9. Log the scan with debug details
    const durationMs = Date.now() - startTime
    await db.insert(schema.scanLogs).values({
      marketsScanned: polymarkets.length,
      opportunitiesFound: allOpps.length,
      tradesExecuted: 0,
      durationMs,
      details: JSON.stringify(debug),
      createdAt: new Date().toISOString(),
    })

    return {
      success: true,
      marketsScanned: polymarkets.length,
      marketCacheErrors,
      filteredByQuality: polymarkets.length - allOpps.length,
      opportunitiesFound: allOpps.length,
      opportunitiesStored: storedCount,
      arbitrageCount: arbs.filter(a => !recentMarketIds.has(a.marketId)).length,
      highConvictionCount: convictions.filter(c => !recentMarketIds.has(c.marketId)).length,
      multiOutcomeCount: multiOutcomeArbs.filter(m => !recentMarketIds.has(m.marketId)).length,
      tailEndCount: tailEndSweeps.filter(t => !recentMarketIds.has(t.marketId)).length,
      deduplicated: arbs.length + convictions.length + multiOutcomeArbs.length + tailEndSweeps.length - allOpps.length,
      opportunities: allOpps.slice(0, 20), // return top 20
      durationMs,
      debug, // Include debug in response too
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime
    // Log error
    await db.insert(schema.scanLogs).values({
      marketsScanned: 0,
      opportunitiesFound: 0,
      tradesExecuted: 0,
      durationMs,
      error: error.message || String(error),
      createdAt: new Date().toISOString(),
    }).catch(() => {}) // don't throw on log error

    return {
      success: false,
      error: error.message || 'Unknown error',
      durationMs,
    }
  }
})
