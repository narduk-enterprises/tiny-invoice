
/**
 * Cloudflare Workers Scheduled (Cron) Handler.
 * Runs hourly or per cron config.
 *
 * Flow:
 * 1. Init D1 & read bot config
 * 2. Fetch active binary markets from Gamma API
 * 3. Update market price cache in D1
 * 4. Scan for arbitrage + high-conviction opportunities (with quality filters)
 * 5. Deduplicate and store opportunities in D1
 * 6. If bot is not in dry-run mode, execute the best trade (with cadence controls)
 * 7. Log scan results
 */
import { gte, and, eq } from 'drizzle-orm'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled' as any, async (event: any) => {
    const startTime = Date.now()
    let marketsScanned = 0
    let opportunitiesFound = 0
    let tradesExecuted = 0
    let errorMsg: string | undefined
    let tradeSkipReason: string | undefined

    try {
      // Init database from the CF env binding
      const env = event.env || {}
      if (env.DB) {
        initDatabase(env.DB)
      }
      const db = useDatabase()

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

      // If bot is not active, log and exit
      if (!config.active) {
        await db.insert(schema.scanLogs).values({
          marketsScanned: 0,
          opportunitiesFound: 0,
          tradesExecuted: 0,
          durationMs: Date.now() - startTime,
          error: 'Bot is paused',
          createdAt: new Date().toISOString(),
        })
        return
      }

      // Build filter config from settings
      const filters = {
        minVolume: config.minVolume ?? 50000,
        minLiquidity: config.minLiquidity ?? 10000,
        maxResults: 10,
      }

      // 2. Fetch active markets (broader search)
      const polymarkets = await fetchActiveMarkets(500)
      marketsScanned = polymarkets.length

      // 3. Update market cache (non-fatal per row)
      for (const m of polymarkets) {
        try {
          const { yesPrice, noPrice } = parseMarketPrices(m)
          await db
            .insert(schema.markets)
            .values({
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
            })
            .onConflictDoUpdate({
              target: schema.markets.id,
              set: {
                yesPrice: Number.isFinite(yesPrice) ? yesPrice : 0,
                noPrice: Number.isFinite(noPrice) ? noPrice : 0,
                volume: Number.isFinite(m.volume) ? m.volume : 0,
                liquidity: Number.isFinite(m.liquidity) ? m.liquidity : 0,
                active: !!(m.active && !m.closed),
                updatedAt: new Date().toISOString(),
              },
            })
        } catch {
          // Skip individual market cache failures
        }
      }

      // 4. Scan with quality filters (original scanners)
      const arbs = scanForArbitrage(polymarkets, config.minSpreadPct ?? 1.0, filters)
      const convictions = scanForHighConviction(polymarkets, config.minConvictionPct ?? 95, filters)

      // 4b. Scan new strategies
      let multiOutcomeOpps: any[] = []
      let tailEndOpps: any[] = []
      try {
        const events = await fetchActiveEvents(200)
        multiOutcomeOpps = scanForMultiOutcomeArbitrage(events, filters)
      } catch (e) {
        console.error('[scheduled] multi-outcome scan error:', e)
      }
      try {
        tailEndOpps = scanForTailEndSweep(polymarkets, filters)
      } catch (e) {
        console.error('[scheduled] tail-end sweep scan error:', e)
      }

      // 5. Deduplicate: skip markets already detected in last 6 hours
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      const recentOpps = await db.select({ marketId: schema.opportunities.marketId })
        .from(schema.opportunities)
        .where(gte(schema.opportunities.detectedAt, sixHoursAgo))
      const recentMarketIds = new Set(recentOpps.map(o => o.marketId))

      const allOpps = [...arbs, ...convictions, ...multiOutcomeOpps, ...tailEndOpps].filter(
        opp => !recentMarketIds.has(opp.marketId)
      )
      opportunitiesFound = allOpps.length

      // Store opportunities (with new strategy fields and NaN safety)
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
            detectedAt: new Date().toISOString(),
            // New strategy fields
            eventTitle: opp.eventTitle || null,
            outcomeCount: opp.outcomeCount || null,
            outcomesJson: opp.outcomes ? JSON.stringify(opp.outcomes) : (opp.outcomesJson || null),
            annualizedReturn: Number.isFinite(opp.annualizedReturn) ? opp.annualizedReturn : null,
            daysToResolution: Number.isFinite(opp.daysToResolution) ? opp.daysToResolution : null,
          })
        } catch {
          // Skip individual opportunity insert failures
        }
      }

      // 6. Execute trade if not in dry-run mode — WITH CADENCE CONTROLS
      if (!config.dryRun && allOpps.length > 0) {
        // --- Per-market cooldown: don't trade same market within 12 hours ---
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        const recentTrades = await db.select({ marketId: schema.trades.marketId })
          .from(schema.trades)
          .where(gte(schema.trades.executedAt, twelveHoursAgo))
        const recentlyTradedMarkets = new Set(recentTrades.map(t => t.marketId))

        // --- Daily trade limit ---
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const dailyTrades = await db.select({ id: schema.trades.id })
          .from(schema.trades)
          .where(and(
            gte(schema.trades.executedAt, twentyFourHoursAgo),
            eq(schema.trades.status, 'filled')
          ))
        const maxDaily = config.maxDailyTrades ?? 3

        if (dailyTrades.length >= maxDaily) {
          tradeSkipReason = `Daily trade limit reached (${dailyTrades.length}/${maxDaily})`
          console.log(`[scheduled] ${tradeSkipReason}`)
        } else {
          // Filter out recently traded markets
          const tradableOpps = allOpps.filter(opp => !recentlyTradedMarkets.has(opp.marketId))

          if (tradableOpps.length === 0) {
            tradeSkipReason = 'All opportunities are on cooldown (traded within 12h)'
            console.log(`[scheduled] ${tradeSkipReason}`)
          } else {
            // Get runtime config for API credentials
            const runtimeConfig = useRuntimeConfig()

            // Enrich opportunities with token IDs from markets
            const enrichedOpps = tradableOpps.map(opp => {
              const market = polymarkets.find(m => m.id === opp.marketId)
              return {
                ...opp,
                yesTokenId: market?.clobTokenIds?.[0] || '',
                noTokenId: market?.clobTokenIds?.[1] || '',
              }
            })

            const tradeResult = await executeBestTrade({
              opportunities: enrichedOpps,
              maxBetUsd: config.maxBetUsd ?? 10,
              privateKey: runtimeConfig.polymarketPrivateKey,
              apiKey: runtimeConfig.polymarketApiKey,
              secret: runtimeConfig.polymarketSecret,
              passphrase: runtimeConfig.polymarketPassphrase,
            })

            if (tradeResult?.success) {
              tradesExecuted = 1
              await db.insert(schema.trades).values({
                marketId: tradeResult.marketId,
                marketQuestion: tradeResult.question,
                side: tradeResult.side,
                amount: tradeResult.amountUsd,
                price: tradeResult.price,
                shares: tradeResult.size,
                status: 'filled',
                txHash: tradeResult.orderId || null,
                pnl: 0,
                executedAt: new Date().toISOString(),
              })
              console.log(`[scheduled] Trade executed: ${tradeResult.orderId}`)
            } else if (tradeResult) {
              tradeSkipReason = tradeResult.error
              console.error(`[scheduled] Trade failed: ${tradeResult.error}`)
              await db.insert(schema.trades).values({
                marketId: tradeResult.marketId,
                marketQuestion: tradeResult.question,
                side: tradeResult.side,
                amount: 0,
                price: tradeResult.price,
                shares: tradeResult.size,
                status: 'failed',
                txHash: null,
                pnl: 0,
                executedAt: new Date().toISOString(),
              })
            }
          }
        }
      } else if (config.dryRun) {
        tradeSkipReason = 'Bot is in dry-run mode'
      } else {
        tradeSkipReason = 'No opportunities found'
      }

    } catch (err: any) {
      errorMsg = err.message || String(err)
      console.error('[scheduled] scan error:', errorMsg)
    } finally {
      // Log the scan result
      try {
        const db = useDatabase()
        await db.insert(schema.scanLogs).values({
          marketsScanned,
          opportunitiesFound,
          tradesExecuted,
          durationMs: Date.now() - startTime,
          error: errorMsg || tradeSkipReason,
          createdAt: new Date().toISOString(),
        })
      } catch (logErr) {
        console.error('[scheduled] failed to log scan:', logErr)
      }
    }
  })
})
