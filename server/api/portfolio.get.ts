/**
 * GET /api/portfolio — fetch live portfolio / balance data from Polymarket.
 *
 * Uses the authenticated CLOB API (`GET /balance-allowance`) to get the
 * cash (USDC) balance, and the Data API for position data.
 */

const CLOB_API = 'https://clob.polymarket.com'
const DATA_API = 'https://data-api.polymarket.com'

// ── HMAC L2 Auth (matches trading.ts) ──

async function buildHmac(
  secret: string, timestamp: number, method: string, requestPath: string, body?: string,
): Promise<string> {
  let message = timestamp + method + requestPath
  if (body !== undefined) message += body

  const sanitized = secret.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '')
  const binaryString = atob(sanitized)
  const keyBytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    keyBytes[i] = binaryString.charCodeAt(i)
  }
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw', keyBytes.buffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const msgBuf = new TextEncoder().encode(message)
  const sigBuf = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, msgBuf)
  const bytes = new Uint8Array(sigBuf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_')
}

async function l2Headers(
  address: string, apiKey: string, secret: string, passphrase: string,
  method: string, requestPath: string, body?: string,
) {
  const timestamp = Math.floor(Date.now() / 1000)
  const sig = await buildHmac(secret, timestamp, method, requestPath, body)
  return {
    'POLY_ADDRESS': address,
    'POLY_SIGNATURE': sig,
    'POLY_TIMESTAMP': String(timestamp),
    'POLY_API_KEY': apiKey,
    'POLY_PASSPHRASE': passphrase,
  }
}

// ── Types ──

interface PortfolioPosition {
  market: string
  outcome: string
  size: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  pnl: number
  pnlPct: number
}

// ── Helper to call CLOB /balance-allowance ──

async function fetchClobBalance(
  eoaAddress: string, apiKey: string, secret: string, passphrase: string,
  assetType: string, signatureType: number,
): Promise<{ balance: number | null; raw: any; status: number }> {
  // IMPORTANT: Sign only the base path, NOT the query string.
  // The official Polymarket SDK signs just the endpoint path.
  const basePath = '/balance-allowance'
  const headers = await l2Headers(eoaAddress, apiKey, secret, passphrase, 'GET', basePath)

  // Pass query params in the URL but NOT in the signature
  const url = `${CLOB_API}${basePath}?asset_type=${assetType}&signature_type=${signatureType}`
  const res = await fetch(url, { headers })
  const text = await res.text()
  let raw: any
  try { raw = JSON.parse(text) } catch { raw = text }

  if (!res.ok) return { balance: null, raw, status: res.status }

  if (raw?.balance !== undefined) {
    const val = Number(raw.balance)
    // USDC has 6 decimals — CLOB may return in micro-USDC or dollar units
    const balance = val > 1e9 ? val / 1e6 : val
    return { balance, raw, status: res.status }
  }
  return { balance: null, raw, status: res.status }
}

// ── Handler ──

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // 1. Check required credentials
  if (!config.polymarketPrivateKey || !config.polymarketApiKey || !config.polymarketSecret || !config.polymarketPassphrase) {
    return {
      status: 'disconnected' as const,
      reason: 'Polymarket API credentials not configured',
      portfolioValue: null, cashBalance: null, positionsValue: null, positions: [],
    }
  }

  // 2. Derive EOA address
  let eoaAddress: string
  try {
    const { Wallet } = await import('ethers')
    const wallet = new Wallet(config.polymarketPrivateKey)
    eoaAddress = wallet.address
  } catch (e: any) {
    return {
      status: 'error' as const,
      reason: `Failed to derive wallet: ${e.message}`,
      portfolioValue: null, cashBalance: null, positionsValue: null, positions: [],
    }
  }

  const proxyAddress = (config.polymarketProxyAddress || '').toLowerCase() || null

  // 3. Fetch USDC balance via authenticated CLOB API
  // Try all signature types: 0 = EOA, 1 = POLY_PROXY, 2 = GNOSIS_SAFE
  const debug: any[] = []
  let cashBalance: number | null = null

  for (const sigType of [0, 1, 2]) {
    try {
      const result = await fetchClobBalance(
        eoaAddress, config.polymarketApiKey, config.polymarketSecret, config.polymarketPassphrase,
        'USDC', sigType,
      )
      debug.push({ asset: 'USDC', sigType, ...result })
      if (result.balance != null && result.balance > 0) {
        cashBalance = result.balance
        break
      } else if (result.balance != null && cashBalance == null) {
        cashBalance = result.balance
      }
    } catch (e: any) {
      debug.push({ asset: 'USDC', sigType, error: e.message })
    }
  }

  // 4. Fetch positions from Data API (try proxy first, then EOA)
  const positions: PortfolioPosition[] = []
  let positionsValue: number | null = null
  const addressesToTry = proxyAddress
    ? [proxyAddress, eoaAddress.toLowerCase()]
    : [eoaAddress.toLowerCase()]

  for (const addr of addressesToTry) {
    if (positions.length > 0) break
    try {
      const posRes = await fetch(`${DATA_API}/positions?user=${addr}&limit=100&sortBy=CURRENT&sortDirection=DESC`)
      if (posRes.ok) {
        const posData = await posRes.json() as any[]
        let totalPositionValue = 0
        for (const p of (posData || [])) {
          const size = Number(p.size || p.tokens || 0)
          const avgPrice = Number(p.avgPrice || p.initialPrice || 0)
          const currentPrice = Number(p.curPrice || p.currentPrice || p.price || 0)
          const currentValue = Number(p.currentValue || (size * currentPrice) || 0)
          const pnl = Number(p.cashPnl || p.pnl || (currentValue - size * avgPrice) || 0)
          totalPositionValue += currentValue
          if (size > 0) {
            positions.push({
              market: p.title || p.question || p.market || 'Unknown',
              outcome: p.outcome || p.side || '',
              size, avgPrice, currentPrice, currentValue, pnl,
              pnlPct: avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0,
            })
          }
        }
        if (totalPositionValue > 0) positionsValue = totalPositionValue
      }
    } catch {
      // try next address
    }
  }

  // 5. Compute total
  const totalValue = (cashBalance ?? 0) + (positionsValue ?? 0)

  if (cashBalance == null && positions.length === 0) {
    return {
      status: 'error' as const,
      reason: `No portfolio data found for EOA ${eoaAddress}${proxyAddress ? ` / proxy ${proxyAddress}` : ''}.`,
      address: eoaAddress,
      proxyAddress,
      portfolioValue: null,
      cashBalance: null,
      positionsValue: null,
      positions: [],
      _debug: debug,
    }
  }

  return {
    status: 'connected' as const,
    address: eoaAddress,
    proxyAddress,
    portfolioValue: totalValue,
    cashBalance,
    positionsValue,
    positionCount: positions.length,
    positions,
    _debug: debug,
  }
})
