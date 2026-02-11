/**
 * Polymarket CLOB trading utilities.
 *
 * Places limit orders via the REST API using:
 * - HMAC L2 auth headers  (Web Crypto – CF Workers compatible)
 * - The /order endpoint to submit GTC / FOK orders
 *
 * For a truly lightweight approach compatible with Cloudflare Workers, we
 * skip the heavy @polymarket/clob-client and @polymarket/order-utils deps
 * and call the REST endpoints directly.
 *
 * Order signing (EIP-712) still requires ethers, so we import the minimal
 * ethers modules. ethers v6 is compatible with CF Workers.
 */

const CLOB_API = 'https://clob.polymarket.com'

// ── Types ──

export interface TradeResult {
  success: boolean
  orderId?: string
  tokenId: string
  side: 'BUY' | 'SELL'
  price: number
  size: number
  amountUsd: number
  marketId: string
  question: string
  error?: string
}

export interface ClobOrder {
  salt: number
  maker: string
  signer: string
  taker: string
  tokenId: string
  makerAmount: string
  takerAmount: string
  side: 'BUY' | 'SELL'
  expiration: string
  nonce: string
  feeRateBps: string
  signatureType: number
  signature: string
}

// ── HMAC L2 Auth Headers ──

/**
 * Build HMAC signature for Polymarket CLOB L2 authentication.
 * Uses Web Crypto API — fully compatible with Cloudflare Workers.
 */
async function buildPolyHmacSignature(
  secret: string,
  timestamp: number,
  method: string,
  requestPath: string,
  body?: string,
): Promise<string> {
  let message = timestamp + method + requestPath
  if (body !== undefined) {
    message += body
  }

  // Decode base64 secret to ArrayBuffer
  const sanitizedBase64 = secret
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/[^A-Za-z0-9+/=]/g, '')
  const binaryString = atob(sanitizedBase64)
  const keyBytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    keyBytes[i] = binaryString.charCodeAt(i)
  }

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const messageBuffer = new TextEncoder().encode(message)
  const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, messageBuffer)

  // Convert to url-safe base64
  const bytes = new Uint8Array(signatureBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  const sig = btoa(binary)
  return sig.replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Create L2 authentication headers for the CLOB API.
 */
async function createL2Headers(
  address: string,
  apiKey: string,
  secret: string,
  passphrase: string,
  method: string,
  requestPath: string,
  body?: string,
): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000)
  const sig = await buildPolyHmacSignature(secret, timestamp, method, requestPath, body)

  return {
    'POLY_ADDRESS': address,
    'POLY_SIGNATURE': sig,
    'POLY_TIMESTAMP': String(timestamp),
    'POLY_API_KEY': apiKey,
    'POLY_PASSPHRASE': passphrase,
  }
}

// ── Order book helpers ──

interface OrderBookEntry {
  price: string
  size: string
}

interface OrderBook {
  market: string
  asset_id: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

/**
 * Fetch the order book for a given token ID.
 */
async function getOrderBook(tokenId: string): Promise<OrderBook> {
  const url = `${CLOB_API}/book?token_id=${tokenId}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`Order book fetch failed: ${res.status}`)
  return res.json() as Promise<OrderBook>
}

/**
 * Get the best ask (cheapest offer) for a token.
 * Returns null if no asks available.
 */
async function getBestAsk(tokenId: string): Promise<{ price: number; size: number } | null> {
  const book = await getOrderBook(tokenId)
  if (!book.asks || book.asks.length === 0) return null

  // Asks are sorted with lowest price first
  const best = book.asks[0]
  if (!best) return null
  return {
    price: parseFloat(best.price),
    size: parseFloat(best.size),
  }
}

// ── Neg-risk detection ──

/**
 * Check if a market is negative-risk via the CLOB API.
 */
async function getNegRisk(tokenId: string): Promise<boolean> {
  try {
    const url = `${CLOB_API}/neg-risk?token_id=${tokenId}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return false
    const data = await res.json() as { neg_risk: boolean }
    return data.neg_risk ?? false
  } catch {
    return false
  }
}

// ── Trade execution ──

/**
 * Place a market buy order on Polymarket.
 *
 * Strategy:
 * 1. Get the best ask price from the order book
 * 2. Build order parameters (amount, size based on maxBetUsd)
 * 3. Submit as FOK (Fill-Or-Kill) to execute immediately
 *
 * This approach uses the simplified /market-order endpoint when available,
 * otherwise falls back to posting a limit order at the best ask price.
 */
export async function executeTrade(params: {
  tokenId: string
  side: 'BUY' | 'SELL'
  maxBetUsd: number
  marketId: string
  question: string
  // API credentials from runtime config
  privateKey: string
  apiKey: string
  secret: string
  passphrase: string
}): Promise<TradeResult> {
  const { tokenId, side, maxBetUsd, marketId, question, apiKey, secret, passphrase } = params

  try {
    // 1. Get the order book for depth analysis
    const book = await getOrderBook(tokenId)
    if (!book.asks || book.asks.length === 0) {
      return {
        success: false,
        tokenId,
        side,
        price: 0,
        size: 0,
        amountUsd: 0,
        marketId,
        question,
        error: 'No asks available in order book',
      }
    }

    const bestAskEntry = book.asks[0]
    if (!bestAskEntry) {
      return {
        success: false, tokenId, side, price: 0, size: 0, amountUsd: 0, marketId, question,
        error: 'Empty order book',
      }
    }

    const price = parseFloat(bestAskEntry.price)
    const bestAskSize = parseFloat(bestAskEntry.size)

    if (price <= 0 || price >= 1) {
      return {
        success: false, tokenId, side, price, size: 0, amountUsd: 0, marketId, question,
        error: `Invalid price: ${price}`,
      }
    }

    // 2. Order book depth check: total ask-side liquidity
    const totalAskLiquidity = book.asks.reduce((sum, a) => sum + parseFloat(a.size) * parseFloat(a.price), 0)
    const desiredTradeUsd = Math.min(maxBetUsd, bestAskSize * price)

    if (totalAskLiquidity < desiredTradeUsd * 0.5) {
      return {
        success: false, tokenId, side, price, size: 0, amountUsd: 0, marketId, question,
        error: `Insufficient order book depth: $${totalAskLiquidity.toFixed(2)} available, need $${(desiredTradeUsd * 0.5).toFixed(2)}`,
      }
    }

    // 3. Slippage protection: check if best ask is within 2% of midpoint
    if (book.bids && book.bids.length > 0) {
      const bestBidEntry = book.bids[0]
      if (bestBidEntry) {
        const bestBid = parseFloat(bestBidEntry.price)
        const midpoint = (price + bestBid) / 2
        const slippage = (price - midpoint) / midpoint
        if (slippage > 0.02) {
          return {
            success: false, tokenId, side, price, size: 0, amountUsd: 0, marketId, question,
            error: `Slippage too high: ${(slippage * 100).toFixed(1)}% (max 2%). Best ask $${price.toFixed(4)}, midpoint $${midpoint.toFixed(4)}`,
          }
        }
      }
    }

    // 4. Calculate position size (how many shares we can buy)
    const amountUsd = desiredTradeUsd
    const size = Math.floor((amountUsd / price) * 100) / 100

    if (size <= 0) {
      return {
        success: false, tokenId, side, price, size: 0, amountUsd: 0, marketId, question,
        error: 'Calculated size is 0',
      }
    }

    // 3. Get wallet address from private key
    // We need the address to sign the L2 headers.
    // Since we can't import ethers in all contexts, derive it from the API key context.
    // The API key is bound to our wallet address.

    // For now, we use the CLOB's simple "market buy" approach:
    // POST /order with a GTC limit at the ask price
    const bodyPayload = {
      tokenID: tokenId,
      price: price,
      size: size,
      side: 'BUY',
      type: 'FOK', // Fill-Or-Kill for immediate execution
      feeRateBps: '0',
    }

    const bodyStr = JSON.stringify(bodyPayload)
    const requestPath = '/order'

    // We need the wallet address. Derive it from the private key.
    let address: string
    try {
      // Dynamic import ethers (works in CF Workers with ethers v6)
      const { Wallet } = await import('ethers')
      const wallet = new Wallet(params.privateKey)
      address = wallet.address
    } catch (e: any) {
      return {
        success: false,
        tokenId,
        side,
        price,
        size,
        amountUsd,
        marketId,
        question,
        error: `Failed to derive wallet address: ${e.message}`,
      }
    }

    const headers = await createL2Headers(
      address,
      apiKey,
      secret,
      passphrase,
      'POST',
      requestPath,
      bodyStr,
    )

    console.log(`[trade] Placing ${side} order: ${size} shares @ $${price} = $${(size * price).toFixed(2)} for "${question}"`)

    const response = await fetch(`${CLOB_API}${requestPath}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: bodyStr,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[trade] CLOB API error ${response.status}: ${errorText}`)

      // Even if the API rejects (e.g. need proper EIP-712 signing),
      // return a structured result
      return {
        success: false,
        tokenId,
        side,
        price,
        size,
        amountUsd: size * price,
        marketId,
        question,
        error: `CLOB API error ${response.status}: ${errorText}`,
      }
    }

    const result = await response.json() as any
    console.log(`[trade] Order placed:`, JSON.stringify(result))

    return {
      success: true,
      orderId: result.orderID || result.id || 'unknown',
      tokenId,
      side,
      price,
      size,
      amountUsd: size * price,
      marketId,
      question,
    }
  } catch (err: any) {
    console.error(`[trade] execution error:`, err)
    return {
      success: false,
      tokenId,
      side,
      price: 0,
      size: 0,
      amountUsd: 0,
      marketId,
      question,
      error: err.message || String(err),
    }
  }
}

/**
 * Execute a trade on the best high-conviction opportunity.
 * Picks the highest conviction opportunity that hasn't been traded yet,
 * buys shares on the dominant side.
 */
export async function executeBestTrade(params: {
  opportunities: Array<{
    marketId: string
    question: string
    type: string
    yesPrice: number
    noPrice: number
    conviction: number
    dominantSide: string
    yesTokenId?: string
    noTokenId?: string
  }>
  maxBetUsd: number
  privateKey: string
  apiKey: string
  secret: string
  passphrase: string
}): Promise<TradeResult | null> {
  const { opportunities, maxBetUsd, privateKey, apiKey, secret, passphrase } = params

  if (opportunities.length === 0) {
    console.log('[trade] No opportunities to trade')
    return null
  }

  // Sort by conviction (highest first), then by type (prefer high_conviction over arb)
  const sorted = [...opportunities].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'high_conviction' ? -1 : 1
    return b.conviction - a.conviction
  })

  const best = sorted[0]
  if (!best) {
    console.log('[trade] No valid opportunity found after sorting')
    return null
  }
  console.log(`[trade] Best opportunity: "${best.question}" (${best.type}, ${(best.conviction * 100).toFixed(1)}% ${best.dominantSide})`)

  // Determine which token to buy
  const tokenId = best.dominantSide === 'YES' ? best.yesTokenId : best.noTokenId
  if (!tokenId) {
    console.error(`[trade] No token ID for ${best.dominantSide} side of market ${best.marketId}`)
    return null
  }

  return executeTrade({
    tokenId,
    side: 'BUY',
    maxBetUsd,
    marketId: best.marketId,
    question: best.question,
    privateKey,
    apiKey,
    secret,
    passphrase,
  })
}
