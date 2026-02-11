import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── Markets ────────────────────────────────────────────────
export const markets = sqliteTable('markets', {
  id: text('id').primaryKey(), // condition_id from Polymarket
  question: text('question').notNull(),
  slug: text('slug'),
  yesTokenId: text('yes_token_id'),
  noTokenId: text('no_token_id'),
  yesPrice: real('yes_price').default(0),
  noPrice: real('no_price').default(0),
  volume: real('volume').default(0),
  liquidity: real('liquidity').default(0),
  endDate: text('end_date'),
  active: integer('active', { mode: 'boolean' }).default(true),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Opportunities ──────────────────────────────────────────
export const opportunities = sqliteTable('opportunities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  marketId: text('market_id').notNull(), // market condition_id OR event_id (for multi-outcome)
  question: text('question').notNull(),
  type: text('type').notNull().default('arbitrage'), // 'arbitrage' | 'high_conviction' | 'multi_outcome_arb' | 'tail_end_sweep'
  yesPrice: real('yes_price').notNull(),
  noPrice: real('no_price').notNull(),
  spread: real('spread').notNull(), // 1.0 - (yes + no), positive = arb exists
  expectedProfit: real('expected_profit').notNull(), // per $1 invested
  conviction: real('conviction').notNull().default(0), // probability of dominant side (0-1)
  dominantSide: text('dominant_side').notNull().default(''), // 'YES' or 'NO'
  qualityScore: real('quality_score').default(0), // composite quality score
  traded: integer('traded', { mode: 'boolean' }).default(false),
  // Multi-outcome arb fields
  eventTitle: text('event_title'),
  outcomeCount: integer('outcome_count'),
  outcomesJson: text('outcomes_json'), // JSON array of { question, yesPrice }
  // Tail-end sweep fields
  annualizedReturn: real('annualized_return'),
  daysToResolution: real('days_to_resolution'),
  detectedAt: text('detected_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Trades ─────────────────────────────────────────────────
export const trades = sqliteTable('trades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  marketId: text('market_id').notNull().references(() => markets.id),
  marketQuestion: text('market_question').default(''),
  side: text('side').notNull(), // 'YES' | 'NO'
  amount: real('amount').notNull(), // USD amount
  price: real('price').notNull(),
  shares: real('shares').default(0),
  status: text('status').notNull().default('pending'), // pending | filled | failed | cancelled
  txHash: text('tx_hash'),
  pnl: real('pnl').default(0),
  executedAt: text('executed_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Scan Logs ──────────────────────────────────────────────
export const scanLogs = sqliteTable('scan_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  marketsScanned: integer('markets_scanned').default(0),
  opportunitiesFound: integer('opportunities_found').default(0),
  tradesExecuted: integer('trades_executed').default(0),
  durationMs: integer('duration_ms').default(0),
  error: text('error'),
  details: text('details'), // JSON blob with debug info (rejection breakdown, etc.)
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Bot Config ─────────────────────────────────────────────
export const botConfig = sqliteTable('bot_config', {
  id: integer('id').primaryKey().default(1),
  active: integer('active', { mode: 'boolean' }).default(false),
  dryRun: integer('dry_run', { mode: 'boolean' }).default(true),
  maxBetUsd: real('max_bet_usd').default(50),
  minSpreadPct: real('min_spread_pct').default(1.0), // minimum spread % to trigger trade
  minConvictionPct: real('min_conviction_pct').default(75), // minimum probability-of-positive-return %
  minVolume: real('min_volume').default(50000), // minimum market volume in USD
  minLiquidity: real('min_liquidity').default(10000), // minimum market liquidity in USD
  maxDailyTrades: integer('max_daily_trades').default(3), // max trades per 24h
  startingBalance: real('starting_balance').default(1000),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Type helpers ───────────────────────────────────────────
export type Market = typeof markets.$inferSelect
export type NewMarket = typeof markets.$inferInsert
export type Opportunity = typeof opportunities.$inferSelect
export type NewOpportunity = typeof opportunities.$inferInsert
export type Trade = typeof trades.$inferSelect
export type NewTrade = typeof trades.$inferInsert
export type ScanLog = typeof scanLogs.$inferSelect
export type BotConfig = typeof botConfig.$inferSelect
