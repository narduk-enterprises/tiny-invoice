import { eq, gte, and } from 'drizzle-orm'

/**
 * GET /api/opportunities/:id — get a single opportunity with trade context
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid opportunity ID' })
  }

  // Get the opportunity
  const [opp] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1)

  if (!opp) {
    throw createError({ statusCode: 404, statusMessage: 'Opportunity not found' })
  }

  // Get related market info
  const [market] = await db
    .select()
    .from(markets)
    .where(eq(markets.id, opp.marketId))
    .limit(1)

  // Check if this market was traded
  const relatedTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.marketId, opp.marketId))

  // Check cooldown status (traded in last 12h?)
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  const recentTrade = relatedTrades.find(t => t.executedAt && t.executedAt > twelveHoursAgo)

  // Check daily trade limit
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const dailyTrades = await db
    .select()
    .from(trades)
    .where(and(
      gte(trades.executedAt, twentyFourHoursAgo),
      eq(trades.status, 'filled')
    ))

  const configs = await db.select().from(botConfig).limit(1)
  const config = configs[0]
  const maxDaily = config?.maxDailyTrades ?? 3

  // Build trade status explanation
  let tradeStatus: 'traded' | 'eligible' | 'cooldown' | 'daily_limit' | 'dry_run' | 'inactive'
  let tradeReason: string

  if (opp.traded) {
    tradeStatus = 'traded'
    tradeReason = 'This opportunity was already executed as a trade.'
  } else if (!config?.active) {
    tradeStatus = 'inactive'
    tradeReason = 'Bot is currently paused. Enable it in Settings to allow trading.'
  } else if (config?.dryRun) {
    tradeStatus = 'dry_run'
    tradeReason = 'Bot is in dry-run mode. Switch to live trading in Settings to execute trades.'
  } else if (dailyTrades.length >= maxDaily) {
    tradeStatus = 'daily_limit'
    tradeReason = `Daily trade limit reached (${dailyTrades.length}/${maxDaily}). Resets in ${Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - new Date(dailyTrades[0]?.executedAt || '').getTime())) / 3600000)}h.`
  } else if (recentTrade) {
    tradeStatus = 'cooldown'
    tradeReason = `This market was traded ${new Date(recentTrade.executedAt || '').toLocaleString()}. Cooldown period: 12 hours.`
  } else {
    tradeStatus = 'eligible'
    tradeReason = 'This opportunity is eligible for trading on the next scheduled run.'
  }

  return {
    ...opp,
    market: market || null,
    relatedTrades,
    tradeStatus,
    tradeReason,
    dailyTradesUsed: dailyTrades.length,
    dailyTradeLimit: maxDaily,
  }
})
