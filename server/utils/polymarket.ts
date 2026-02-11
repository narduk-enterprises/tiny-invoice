/**
 * Polymarket API client utilities.
 * Uses the Gamma API for market discovery and the CLOB API for prices/trading.
 *
 * The CLOB client requires ethers for wallet signing, but since we're in
 * a Cloudflare Workers environment, we use direct REST calls instead of
 * the heavy @polymarket/clob-client npm package.
 */

const GAMMA_API = 'https://gamma-api.polymarket.com'
const CLOB_API = 'https://clob.polymarket.com'

export interface PolymarketEvent {
  id: string
  slug: string
  title: string
  markets: PolymarketMarket[]
}

/**
 * Fetch active events from the Gamma API.
 * Events group multiple related markets (multi-outcome questions).
 * Used for multi-outcome bundle arbitrage detection.
 */
export async function fetchActiveEvents(limit = 100): Promise<PolymarketEvent[]> {
  const url = new URL(`${GAMMA_API}/events`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('active', 'true')
  url.searchParams.set('closed', 'false')
  url.searchParams.set('order', 'volume')
  url.searchParams.set('ascending', 'false')

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) {
    throw new Error(`Gamma Events API error: ${res.status} ${res.statusText}`)
  }

  const data: PolymarketEvent[] = await res.json()

  // Normalise JSON-encoded fields in each sub-market
  for (const event of data) {
    if (!event.markets) event.markets = []
    for (const m of event.markets) {
      if (typeof m.outcomes === 'string') {
        try { m.outcomes = JSON.parse(m.outcomes) } catch { m.outcomes = [] }
      }
      if (typeof m.clobTokenIds === 'string') {
        try { m.clobTokenIds = JSON.parse(m.clobTokenIds) } catch { m.clobTokenIds = [] }
      }
      if (typeof m.outcomePrices === 'string') {
        try { m.outcomePrices = JSON.parse(m.outcomePrices) } catch { m.outcomePrices = [] }
      }
    }
  }

  // Only return events with 3+ markets (multi-outcome)
  return data.filter(e => e.markets && e.markets.length >= 3)
}

export interface PolymarketMarket {
  id: string // condition_id
  question: string
  slug: string
  active: boolean
  closed: boolean
  volume: number
  liquidity: number
  endDate: string
  outcomes: string[]
  outcomePrices: string[] // JSON-encoded array of price strings
  clobTokenIds: string[] // [yesTokenId, noTokenId]
}

export interface MarketPrice {
  tokenId: string
  price: number
  midpoint: number
}

/**
 * Fetch active binary markets from the Gamma API.
 * Returns markets sorted by volume (highest first).
 */
export async function fetchActiveMarkets(limit = 200): Promise<PolymarketMarket[]> {
  const url = new URL(`${GAMMA_API}/markets`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('active', 'true')
  url.searchParams.set('closed', 'false')
  url.searchParams.set('order', 'volumeNum')
  url.searchParams.set('ascending', 'false')

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) {
    throw new Error(`Gamma API error: ${res.status} ${res.statusText}`)
  }

  const data: PolymarketMarket[] = await res.json()

  // The Gamma API returns outcomes and clobTokenIds as JSON-encoded strings.
  // Normalise them into actual arrays before filtering.
  for (const m of data) {
    if (typeof m.outcomes === 'string') {
      try { m.outcomes = JSON.parse(m.outcomes) } catch { m.outcomes = [] }
    }
    if (typeof m.clobTokenIds === 'string') {
      try { m.clobTokenIds = JSON.parse(m.clobTokenIds) } catch { m.clobTokenIds = [] }
    }
    if (typeof m.outcomePrices === 'string') {
      try { m.outcomePrices = JSON.parse(m.outcomePrices) } catch { m.outcomePrices = [] }
    }
    // Gamma API returns volume and liquidity as strings — parse to numbers
    if (typeof m.volume === 'string') m.volume = parseFloat(m.volume) || 0
    if (typeof m.liquidity === 'string') m.liquidity = parseFloat(m.liquidity) || 0
  }

  // Filter to only binary markets (exactly 2 outcomes: Yes/No)
  return data.filter(m =>
    m.outcomes && m.outcomes.length === 2 &&
    m.clobTokenIds && m.clobTokenIds.length === 2
  )
}

/**
 * Get the midpoint price for a token from the CLOB API.
 */
export async function getTokenMidpoint(tokenId: string): Promise<number> {
  const url = `${CLOB_API}/midpoint?token_id=${tokenId}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) {
    throw new Error(`CLOB midpoint error: ${res.status}`)
  }

  const data = await res.json() as { mid: string }
  return parseFloat(data.mid) || 0
}

/**
 * Get prices for a market (both YES and NO tokens).
 * Uses the outcome prices from the Gamma API data if available,
 * otherwise falls back to CLOB midpoint calls.
 */
export function parseMarketPrices(market: PolymarketMarket): { yesPrice: number; noPrice: number } {
  try {
    if (market.outcomePrices && market.outcomePrices.length >= 2) {
      // outcomePrices can be either a JSON string or individual strings
      let prices: number[]
      if (typeof market.outcomePrices === 'string') {
        prices = JSON.parse(market.outcomePrices as unknown as string).map(Number)
      } else {
        prices = market.outcomePrices.map(p => parseFloat(String(p)))
      }
      return {
        yesPrice: prices[0] || 0,
        noPrice: prices[1] || 0
      }
    }
  } catch {
    // Fall through to default
  }
  return { yesPrice: 0, noPrice: 0 }
}

/**
 * Fetch CLOB prices for multiple token IDs at once.
 * Falls back to sequential if batch isn't available.
 */
export async function getMarketPricesFromClob(
  yesTokenId: string,
  noTokenId: string
): Promise<{ yesPrice: number; noPrice: number }> {
  const [yesMid, noMid] = await Promise.all([
    getTokenMidpoint(yesTokenId),
    getTokenMidpoint(noTokenId)
  ])

  return { yesPrice: yesMid, noPrice: noMid }
}

/**
 * Fetch a single market by its condition ID from the Gamma API.
 */
export async function fetchMarketById(conditionId: string): Promise<PolymarketMarket | null> {
  const url = `${GAMMA_API}/markets/${conditionId}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) return null
  return res.json()
}
