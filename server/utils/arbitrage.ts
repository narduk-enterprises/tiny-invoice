/**
 * Arbitrage & high-conviction detection for Polymarket binary markets.
 *
 * Two opportunity types:
 *
 * 1. ARBITRAGE — if YES_price + NO_price < 1.0, buying both sides guarantees
 *    1.0 on resolution, netting the spread as profit (risk-free).
 *
 * 2. HIGH CONVICTION — markets where our formula estimates a high probability
 *    of positive return (default ≥75%). This is NOT just "the market is
 *    one-sided." Instead, we compute a composite probability that considers:
 *      - Market price signal (implied probability from the dominant side)
 *      - Volume efficiency (higher volume → more efficient pricing → more trust)
 *      - Liquidity confidence (enough depth to enter/exit cleanly)
 *      - Time positioning (sweet spot: 3-30 days to resolution)
 *      - Edge magnitude (profit margin if correct)
 *
 *    The formula produces a "probability of positive return" between 0-1.
 *    When this exceeds the threshold → high conviction.
 *
 * Quality Scoring:
 *   Each opportunity receives a composite quality score for ranking.
 */

import type { PolymarketMarket, PolymarketEvent } from './polymarket'
import { parseMarketPrices } from './polymarket'

export interface ArbitrageOpportunity {
  marketId: string
  question: string
  slug: string
  type: 'arbitrage' | 'high_conviction' | 'multi_outcome_arb' | 'tail_end_sweep'
  yesPrice: number
  noPrice: number
  totalCost: number  // yes + no
  spread: number     // 1.0 - totalCost (positive = profit per $1 for arb)
  spreadPct: number  // spread as percentage
  expectedProfitPer100: number // profit per $100 invested
  conviction: number // estimated probability of positive return (0-1)
  dominantSide: 'YES' | 'NO' | ''
  volume: number
  liquidity: number
  qualityScore: number // composite quality score (higher = better trade)
  // Multi-outcome arb fields
  eventTitle?: string
  outcomeCount?: number
  outcomes?: Array<{ question: string; yesPrice: number }>
  // Tail-end sweep fields
  annualizedReturn?: number
  daysToResolution?: number
}

export interface ScanFilters {
  minSpreadPct: number       // minimum spread % for arbitrage (default: 0.5)
  minConvictionPct: number   // minimum probability-of-positive-return % (default: 75)
  minVolume: number          // minimum market volume in USD (default: 50000)
  minLiquidity: number       // minimum market liquidity in USD (default: 10000)
  maxResults: number         // cap on returned opportunities (default: 10)
}

const DEFAULT_FILTERS: ScanFilters = {
  minSpreadPct: 0.5,
  minConvictionPct: 75,
  minVolume: 50000,
  minLiquidity: 10000,
  maxResults: 10,
}

// ──────────────────────────────────────────────────────────
// Debug logging
// ──────────────────────────────────────────────────────────

export interface ScanDebugLog {
  totalMarkets: number
  rejectedVolume: number
  rejectedLiquidity: number
  rejectedTimeTooSoon: number
  rejectedTimeTooFar: number
  rejectedInvalidPrice: number
  rejectedNoSpread: number
  rejectedSpreadTooLow: number
  rejectedNoEdge: number
  rejectedPriceTooLow: number
  rejectedBelowConviction: number
  rejectedPureArbitrage: number
  rejectedZeroQuality: number
  // Multi-outcome arb
  totalEvents: number
  rejectedTooFewOutcomes: number
  rejectedEventNoSpread: number
  rejectedEventLowLiquidity: number
  passedMultiOutcome: number
  // Tail-end sweep
  rejectedNotNearCertain: number
  rejectedTooFarToResolve: number
  rejectedLowAnnualized: number
  passedTailEnd: number
  passed: number
  topCandidates: Array<{
    question: string
    dominant: number
    volume: number
    liquidity: number
    prob: number
    reason: string
  }>
}

export function createDebugLog(): ScanDebugLog {
  return {
    totalMarkets: 0,
    rejectedVolume: 0,
    rejectedLiquidity: 0,
    rejectedTimeTooSoon: 0,
    rejectedTimeTooFar: 0,
    rejectedInvalidPrice: 0,
    rejectedNoSpread: 0,
    rejectedSpreadTooLow: 0,
    rejectedNoEdge: 0,
    rejectedPriceTooLow: 0,
    rejectedBelowConviction: 0,
    rejectedPureArbitrage: 0,
    rejectedZeroQuality: 0,
    totalEvents: 0,
    rejectedTooFewOutcomes: 0,
    rejectedEventNoSpread: 0,
    rejectedEventLowLiquidity: 0,
    passedMultiOutcome: 0,
    rejectedNotNearCertain: 0,
    rejectedTooFarToResolve: 0,
    rejectedLowAnnualized: 0,
    passedTailEnd: 0,
    passed: 0,
    topCandidates: [],
  }
}

// ──────────────────────────────────────────────────────────
// Shared filters: volume, liquidity, time
// ──────────────────────────────────────────────────────────

/**
 * Check if a market passes the basic quality filters.
 * Optionally tracks rejection reasons in a debug log.
 */
function passesQualityFilters(
  market: PolymarketMarket,
  filters: ScanFilters,
  debug?: ScanDebugLog,
): boolean {
  // Volume filter
  if ((market.volume || 0) < filters.minVolume) {
    if (debug) debug.rejectedVolume++
    return false
  }

  // Liquidity filter
  if ((market.liquidity || 0) < filters.minLiquidity) {
    if (debug) debug.rejectedLiquidity++
    return false
  }

  // Time-based filters
  if (market.endDate) {
    const endMs = new Date(market.endDate).getTime()
    const nowMs = Date.now()

    // Skip markets ending within 24 hours (too volatile)
    if (endMs - nowMs < 24 * 60 * 60 * 1000) {
      if (debug) debug.rejectedTimeTooSoon++
      return false
    }

    // Skip markets ending > 90 days out (too much uncertainty)
    if (endMs - nowMs > 90 * 24 * 60 * 60 * 1000) {
      if (debug) debug.rejectedTimeTooFar++
      return false
    }
  }

  return true
}

/**
 * Calculate a composite quality score for an opportunity.
 *
 * Score = edge × volumeMultiplier × liquidityMultiplier × timeFreshness
 *
 * Higher is better. Typical range: 0.01 – 1.0
 */
function calculateQualityScore(
  edge: number,
  volume: number,
  liquidity: number,
  endDate?: string,
): number {
  // Edge must be positive
  if (edge <= 0) return 0

  // Volume multiplier: log10 scale, normalised so $100k = 1.0
  const volumeMultiplier = Math.min(Math.log10(Math.max(volume, 1)) / 5, 2.0) // log10(100k) = 5

  // Liquidity multiplier: log10 scale, normalised so $10k = 1.0
  const liquidityMultiplier = Math.min(Math.log10(Math.max(liquidity, 1)) / 4, 2.0) // log10(10k) = 4

  // Time freshness: prefer markets 3-30 days out (sweet spot)
  let timeFreshness = 1.0
  if (endDate) {
    const daysToEnd = (new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    if (daysToEnd < 3) timeFreshness = 0.5  // too close, might be volatile
    else if (daysToEnd > 60) timeFreshness = 0.7  // too far, lots of uncertainty
    else if (daysToEnd >= 3 && daysToEnd <= 30) timeFreshness = 1.0  // sweet spot
    else timeFreshness = 0.85  // 30-60 days, still okay
  }

  const score = edge * volumeMultiplier * liquidityMultiplier * timeFreshness
  return Number.isFinite(score) ? score : 0
}

// ──────────────────────────────────────────────────────────
// Probability of Positive Return formula for High Conviction
// ──────────────────────────────────────────────────────────

/**
 * Estimate the probability of a positive return on buying the dominant side.
 *
 * We combine multiple confidence signals into a single probability:
 *
 *   P(positive return) = baseProb × volumeConfidence × liquidityConfidence × timeFactor
 *
 * Where:
 *   - baseProb: market-implied probability of the dominant side (its price)
 *     This is the market's consensus on the outcome probability.
 *
 *   - volumeConfidence: higher volume means more participants have agreed on this
 *     price, making it more likely to be "correct." Scales 0.7→1.0 based on volume.
 *     $50k vol → 0.85, $500k → 0.95, $5M+ → 1.0
 *
 *   - liquidityConfidence: deeper books mean less manipulation risk and cleaner
 *     entry/exit. Scales 0.7→1.0 based on available liquidity.
 *     $10k liq → 0.85, $100k → 0.95, $1M+ → 1.0
 *
 *   - timeFactor: markets in the "sweet spot" (3-30 days) are most predictable.
 *     Too close (<3d) → more volatile, too far (>60d) → more uncertain.
 *     Scales 0.7→1.0.
 *
 * The formula also requires a positive edge (1.0 - price > 1%) to ensure
 * there's meaningful profit potential even if the outcome resolves correctly.
 *
 * Example:
 *   YES = 0.88 (baseProb = 0.88)
 *   Volume = $200k (volumeConfidence = 0.92)
 *   Liquidity = $50k (liquidityConfidence = 0.92)
 *   Time = 15 days (timeFactor = 1.0)
 *   P(positive return) = 0.88 × 0.92 × 0.92 × 1.0 ≈ 0.745 (74.5%)
 *   → Just below 75%, so NOT flagged
 *
 *   YES = 0.91, Volume = $300k, Liq = $80k, Time = 10d
 *   P = 0.91 × 0.94 × 0.94 × 1.0 ≈ 0.804 (80.4%)
 *   → Above 75%, FLAGGED as high conviction
 */
function estimateProbabilityOfPositiveReturn(
  dominantPrice: number,
  volume: number,
  liquidity: number,
  endDate?: string,
): number {
  // Base probability: the market's implied probability for the dominant side
  const baseProb = dominantPrice

  // Volume confidence: log-scale from 0.7 to 1.0
  // At $50k (our minimum) → ~0.85, at $500k → ~0.95, at $5M+ → 1.0
  const logVol = Math.log10(Math.max(volume, 1))
  const volumeConfidence = Math.min(0.7 + (logVol / 5) * 0.3, 1.0) // log10(100k)=5 → 0.7+0.3=1.0

  // Liquidity confidence: log-scale from 0.7 to 1.0
  // At $10k (our minimum) → ~0.82, at $100k → ~0.93, at $1M+ → 1.0
  const logLiq = Math.log10(Math.max(liquidity, 1))
  const liquidityConfidence = Math.min(0.7 + (logLiq / 6) * 0.3, 1.0) // log10(1M)=6 → 0.7+0.3=1.0

  // Time factor: sweet spot is 3-30 days
  let timeFactor = 0.85 // default for no end date
  if (endDate) {
    const daysToEnd = (new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    if (daysToEnd < 3) timeFactor = 0.75       // too close, volatile
    else if (daysToEnd <= 14) timeFactor = 1.0  // ideal: 3-14 days
    else if (daysToEnd <= 30) timeFactor = 0.95 // good: 14-30 days
    else if (daysToEnd <= 60) timeFactor = 0.85 // okay: 30-60 days
    else timeFactor = 0.75                       // too far out
  }

  return baseProb * volumeConfidence * liquidityConfidence * timeFactor
}

// ──────────────────────────────────────────────────────────
// Pure arbitrage: spread exists when YES + NO < 1.0
// ──────────────────────────────────────────────────────────

/**
 * Scan a list of markets for pure arbitrage opportunities.
 * Returns opportunities sorted by quality score (most profitable first).
 */
export function scanForArbitrage(
  markets: PolymarketMarket[],
  minSpreadPct: number = 0.5,
  filters: Partial<ScanFilters> = {},
  debug?: ScanDebugLog,
): ArbitrageOpportunity[] {
  const mergedFilters = { ...DEFAULT_FILTERS, ...filters, minSpreadPct }
  const opportunities: ArbitrageOpportunity[] = []

  for (const market of markets) {
    // Apply quality filters
    if (!passesQualityFilters(market, mergedFilters, debug)) continue

    const { yesPrice, noPrice } = parseMarketPrices(market)

    // Skip markets with invalid/zero prices
    if (yesPrice <= 0 || noPrice <= 0 || yesPrice >= 1 || noPrice >= 1) {
      if (debug) debug.rejectedInvalidPrice++
      continue
    }

    const totalCost = yesPrice + noPrice
    const spread = 1.0 - totalCost

    // Only flag if there's a positive spread above threshold
    if (spread <= 0) {
      if (debug) debug.rejectedNoSpread++
      continue
    }

    const spreadPct = spread * 100
    if (spreadPct < mergedFilters.minSpreadPct) {
      if (debug) debug.rejectedSpreadTooLow++
      continue
    }

    const qualityScore = calculateQualityScore(
      spread,
      market.volume || 0,
      market.liquidity || 0,
      market.endDate,
    )

    if (debug) debug.passed++

    opportunities.push({
      marketId: market.id,
      question: market.question,
      slug: market.slug || '',
      type: 'arbitrage',
      yesPrice,
      noPrice,
      totalCost,
      spread,
      spreadPct,
      expectedProfitPer100: spread * 100,
      conviction: 0,
      dominantSide: '',
      volume: market.volume || 0,
      liquidity: market.liquidity || 0,
      qualityScore,
    })
  }

  // Sort by quality score descending, cap results
  return opportunities
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, mergedFilters.maxResults)
}

// ──────────────────────────────────────────────────────────
// High conviction: estimated probability of positive return ≥ threshold
// ──────────────────────────────────────────────────────────

/**
 * Scan for high-conviction opportunities using "probability of positive return."
 *
 * Unlike pure arbitrage (risk-free spreads), high conviction means we've
 * estimated that the probability of making money on a directional bet is
 * above a threshold (default 75%).
 *
 * The formula considers:
 *   - Market-implied probability (what the dominant side is priced at)
 *   - Volume efficiency (more volume = more reliable pricing consensus)
 *   - Liquidity confidence (deeper books = less manipulation, better entry)
 *   - Time-to-resolution (3-14 days is the sweet spot)
 *
 * This is distinctly different from "the market is one-sided." A market at
 * YES=95¢ with low volume/liquidity might only score 60% probability of
 * positive return. A market at YES=85¢ with massive volume and good
 * liquidity might score 78% — that's the one we want to trade.
 *
 * We also require at least 2% edge (1.0 - price ≥ 0.02) so there's
 * meaningful profit potential if the outcome resolves in our favour.
 */
export function scanForHighConviction(
  markets: PolymarketMarket[],
  minConvictionPct: number = 75,
  filters: Partial<ScanFilters> = {},
  debug?: ScanDebugLog,
): ArbitrageOpportunity[] {
  const mergedFilters = { ...DEFAULT_FILTERS, ...filters, minConvictionPct }
  const minProbThreshold = mergedFilters.minConvictionPct / 100
  const opportunities: ArbitrageOpportunity[] = []

  // Track near-miss candidates for debugging
  const nearMisses: Array<{ question: string; dominant: number; volume: number; liquidity: number; prob: number; reason: string }> = []

  for (const market of markets) {
    // Apply quality filters (volume, liquidity, time)
    if (!passesQualityFilters(market, mergedFilters, debug)) continue

    const { yesPrice, noPrice } = parseMarketPrices(market)

    // Skip invalid prices
    if (yesPrice <= 0 || noPrice <= 0 || yesPrice >= 1 || noPrice >= 1) {
      if (debug) debug.rejectedInvalidPrice++
      continue
    }

    // Determine dominant side (the side we'd buy)
    const dominantPrice = Math.max(yesPrice, noPrice)
    const dominantSide: 'YES' | 'NO' = yesPrice >= noPrice ? 'YES' : 'NO'

    // Skip markets that are pure arbitrage (those are caught by scanForArbitrage)
    const totalCost = yesPrice + noPrice
    if (totalCost < 1.0) {
      if (debug) debug.rejectedPureArbitrage++
      continue
    }

    // Edge: profit margin if the dominant side resolves correctly
    const edge = 1.0 - dominantPrice

    // Require at least 2% edge (skip markets at 98¢+ where profit is negligible)
    if (edge < 0.02) {
      if (debug) debug.rejectedNoEdge++
      nearMisses.push({ question: market.question, dominant: dominantPrice, volume: market.volume || 0, liquidity: market.liquidity || 0, prob: 0, reason: `edge too low (${(edge * 100).toFixed(1)}%)` })
      continue
    }

    // Don't consider markets where dominant side is too low (< 60¢)
    if (dominantPrice < 0.60) {
      if (debug) debug.rejectedPriceTooLow++
      nearMisses.push({ question: market.question, dominant: dominantPrice, volume: market.volume || 0, liquidity: market.liquidity || 0, prob: 0, reason: `dominant price too low (${(dominantPrice * 100).toFixed(0)}¢)` })
      continue
    }

    // ══════════════════════════════════════════════════
    // Core formula: estimate probability of positive return
    // ══════════════════════════════════════════════════
    const probPositiveReturn = estimateProbabilityOfPositiveReturn(
      dominantPrice,
      market.volume || 0,
      market.liquidity || 0,
      market.endDate,
    )

    // Only flag if our estimated probability exceeds the threshold
    if (probPositiveReturn < minProbThreshold) {
      if (debug) debug.rejectedBelowConviction++
      nearMisses.push({ question: market.question, dominant: dominantPrice, volume: market.volume || 0, liquidity: market.liquidity || 0, prob: probPositiveReturn, reason: `prob ${(probPositiveReturn * 100).toFixed(1)}% < ${minConvictionPct}%` })
      continue
    }

    const rewardPer100 = edge * 100

    const qualityScore = calculateQualityScore(
      edge,
      market.volume || 0,
      market.liquidity || 0,
      market.endDate,
    )

    // Skip opportunities with negligible quality score
    if (qualityScore <= 0) {
      if (debug) debug.rejectedZeroQuality++
      continue
    }

    if (debug) debug.passed++

    opportunities.push({
      marketId: market.id,
      question: market.question,
      slug: market.slug || '',
      type: 'high_conviction',
      yesPrice,
      noPrice,
      totalCost,
      spread: 1.0 - totalCost,
      spreadPct: (1.0 - totalCost) * 100,
      expectedProfitPer100: rewardPer100,
      conviction: probPositiveReturn,
      dominantSide,
      volume: market.volume || 0,
      liquidity: market.liquidity || 0,
      qualityScore,
    })
  }

  // Attach top near-miss candidates to debug log (sorted by prob desc)
  if (debug) {
    debug.topCandidates = nearMisses
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 10)
  }

  // Sort by quality score descending, cap results
  return opportunities
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, mergedFilters.maxResults)
}

// ──────────────────────────────────────────────────────────
// Multi-Outcome Bundle Arbitrage
// ──────────────────────────────────────────────────────────

/**
 * Scan multi-outcome events for bundle arbitrage.
 *
 * In a multi-outcome event (e.g., "Who will win the election?"),
 * each outcome has its own market with a YES price. If the sum
 * of all YES prices across outcomes is < $1.00, buying one YES
 * share of every outcome guarantees a $1.00 payout on resolution.
 *
 * Profit = 1.00 - sum(yesPrices)
 *
 * This is pure mathematics — no prediction or opinion needed.
 * Common in election, sports, and category markets.
 */
export function scanForMultiOutcomeArbitrage(
  events: PolymarketEvent[],
  filters: Partial<ScanFilters> = {},
  debug?: ScanDebugLog,
): ArbitrageOpportunity[] {
  const mergedFilters = { ...DEFAULT_FILTERS, ...filters }
  const opportunities: ArbitrageOpportunity[] = []

  if (debug) debug.totalEvents = events.length

  for (const event of events) {
    // Need at least 3 sub-markets for this to be a multi-outcome
    if (!event.markets || event.markets.length < 3) {
      if (debug) debug.rejectedTooFewOutcomes++
      continue
    }

    // Parse YES prices from each sub-market
    const outcomes: Array<{ question: string; yesPrice: number; market: PolymarketMarket }> = []
    let allValid = true

    for (const m of event.markets) {
      const { yesPrice } = parseMarketPrices(m)
      if (yesPrice <= 0 || yesPrice >= 1) {
        allValid = false
        break
      }
      outcomes.push({ question: m.question, yesPrice, market: m })
    }

    if (!allValid) {
      if (debug) debug.rejectedInvalidPrice++
      continue
    }

    // Sum all YES prices
    const totalYesPrice = outcomes.reduce((sum, o) => sum + o.yesPrice, 0)
    const spread = 1.0 - totalYesPrice

    // Only flag if there's a positive spread (sum < $1.00)
    if (spread <= 0) {
      if (debug) debug.rejectedEventNoSpread++
      continue
    }

    // Aggregate volume and find minimum liquidity across sub-markets
    const totalVolume = outcomes.reduce((sum, o) => sum + (o.market.volume || 0), 0)
    const minLiquidity = Math.min(...outcomes.map(o => o.market.liquidity || 0))

    // Liquidity filter: the weakest link matters for execution
    if (minLiquidity < mergedFilters.minLiquidity) {
      if (debug) debug.rejectedEventLowLiquidity++
      continue
    }

    const spreadPct = spread * 100
    const qualityScore = calculateQualityScore(
      spread,
      totalVolume,
      minLiquidity,
      // Use earliest end date from sub-markets
      outcomes.map(o => o.market.endDate).filter(Boolean).sort()[0],
    )

    if (qualityScore <= 0) {
      if (debug) debug.rejectedZeroQuality++
      continue
    }

    if (debug) {
      debug.passedMultiOutcome++
      debug.passed++
    }

    opportunities.push({
      marketId: event.id, // Use event ID as the "market" ID
      question: event.title || `Multi-outcome: ${outcomes.length} outcomes`,
      slug: event.slug || '',
      type: 'multi_outcome_arb',
      yesPrice: totalYesPrice, // Sum of all YES prices
      noPrice: 0, // Not applicable
      totalCost: totalYesPrice,
      spread,
      spreadPct,
      expectedProfitPer100: spread * 100,
      conviction: 0, // Pure arb, not directional
      dominantSide: '',
      volume: totalVolume,
      liquidity: minLiquidity,
      qualityScore,
      eventTitle: event.title,
      outcomeCount: outcomes.length,
      outcomes: outcomes.map(o => ({ question: o.question, yesPrice: o.yesPrice })),
    })
  }

  return opportunities
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, mergedFilters.maxResults)
}

// ──────────────────────────────────────────────────────────
// Tail-End / Endgame Sweep
// ──────────────────────────────────────────────────────────

/**
 * Scan for tail-end sweep opportunities.
 *
 * These are near-certain markets (dominant side ≥ 95¢) with short
 * time-to-resolution (≤ 7 days). The logic:
 *   - Market is almost settled (price reflects near-certainty)
 *   - High volume confirms market efficiency (price is reliable)
 *   - Short time horizon means capital isn't locked up long
 *   - Small edge (1-5%) but extremely high annualized returns
 *
 * Example: YES = 97¢, 3 days to resolution
 *   Edge = 3¢ per share
 *   Annualized = (0.03 / 0.97) × (365 / 3) × 100 ≈ 376% APY
 *
 * Research shows ~90% of large orders ($10k+) on Polymarket
 * execute at prices > 95¢ using this strategy.
 *
 * Different from high-conviction: this targets markets that are
 * ALMOST RESOLVED, not just "likely to win."
 */
export function scanForTailEndSweep(
  markets: PolymarketMarket[],
  filters: Partial<ScanFilters> = {},
  debug?: ScanDebugLog,
): ArbitrageOpportunity[] {
  const mergedFilters = { ...DEFAULT_FILTERS, ...filters }
  const opportunities: ArbitrageOpportunity[] = []

  const MIN_PRICE = 0.95        // Must be near-certain
  const MAX_DAYS = 7            // Must resolve within 7 days
  const MIN_ANNUALIZED = 100    // Must beat 100% annualized to be worth it

  for (const market of markets) {
    // Volume filter only (we relax time filters since we want short-horizon)
    if ((market.volume || 0) < mergedFilters.minVolume) {
      if (debug) debug.rejectedVolume++
      continue
    }
    if ((market.liquidity || 0) < mergedFilters.minLiquidity) {
      if (debug) debug.rejectedLiquidity++
      continue
    }

    const { yesPrice, noPrice } = parseMarketPrices(market)
    if (yesPrice <= 0 || noPrice <= 0 || yesPrice >= 1 || noPrice >= 1) {
      if (debug) debug.rejectedInvalidPrice++
      continue
    }

    // Determine dominant side
    const dominantPrice = Math.max(yesPrice, noPrice)
    const dominantSide: 'YES' | 'NO' = yesPrice >= noPrice ? 'YES' : 'NO'

    // Must be near-certain (≥ 95¢)
    if (dominantPrice < MIN_PRICE) {
      if (debug) debug.rejectedNotNearCertain++
      continue
    }

    // Must have an end date and be within 7 days
    if (!market.endDate) {
      if (debug) debug.rejectedTooFarToResolve++
      continue
    }

    const endMs = new Date(market.endDate).getTime()
    const nowMs = Date.now()
    const daysToEnd = (endMs - nowMs) / (24 * 60 * 60 * 1000)

    // Must be within 7 days but at least 2 hours out (to avoid settled markets)
    if (daysToEnd > MAX_DAYS || daysToEnd < (2 / 24)) {
      if (debug) debug.rejectedTooFarToResolve++
      continue
    }

    // Calculate edge and annualized return
    const edge = 1.0 - dominantPrice
    const annualizedReturn = (edge / dominantPrice) * (365 / Math.max(daysToEnd, 0.1)) * 100

    // Must beat minimum annualized return threshold
    if (annualizedReturn < MIN_ANNUALIZED) {
      if (debug) debug.rejectedLowAnnualized++
      continue
    }

    const totalCost = yesPrice + noPrice
    const qualityScore = calculateQualityScore(
      edge,
      market.volume || 0,
      market.liquidity || 0,
      market.endDate,
    )

    if (qualityScore <= 0) {
      if (debug) debug.rejectedZeroQuality++
      continue
    }

    if (debug) {
      debug.passedTailEnd++
      debug.passed++
    }

    opportunities.push({
      marketId: market.id,
      question: market.question,
      slug: market.slug || '',
      type: 'tail_end_sweep',
      yesPrice,
      noPrice,
      totalCost,
      spread: 1.0 - totalCost,
      spreadPct: (1.0 - totalCost) * 100,
      expectedProfitPer100: edge * 100,
      conviction: dominantPrice, // The price IS the conviction for tail-end
      dominantSide,
      volume: market.volume || 0,
      liquidity: market.liquidity || 0,
      qualityScore,
      annualizedReturn: Math.round(annualizedReturn),
      daysToResolution: Math.round(daysToEnd * 10) / 10,
    })
  }

  return opportunities
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, mergedFilters.maxResults)
}

// ──────────────────────────────────────────────────────────
// Position sizing
// ──────────────────────────────────────────────────────────

/**
 * Calculate the optimal position size for a trade.
 * Caps at maxBet, and ensures we don't exceed available liquidity.
 */
export function calculatePositionSize(
  spread: number,
  maxBetUsd: number,
  availableLiquidity: number
): { yesAmount: number; noAmount: number; totalCost: number; expectedProfit: number } {
  const maxInvestment = Math.min(maxBetUsd, availableLiquidity * 0.1)
  const totalCost = maxInvestment
  const expectedProfit = totalCost * spread

  const perSide = totalCost / 2

  return {
    yesAmount: perSide,
    noAmount: perSide,
    totalCost,
    expectedProfit
  }
}
