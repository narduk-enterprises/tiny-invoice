/**
 * Local test script: Try all known Polymarket endpoints to find the balance.
 * Run with: npx tsx scripts/test-portfolio.ts
 */

const CLOB_API = 'https://clob.polymarket.com'
const DATA_API = 'https://data-api.polymarket.com'

// Load env vars
const PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY || ''
const API_KEY = process.env.POLYMARKET_API_KEY || ''
const SECRET = process.env.POLYMARKET_SECRET || ''
const PASSPHRASE = process.env.POLYMARKET_PASSPHRASE || ''
const PROXY_ADDRESS = process.env.POLYMARKET_PROXY_ADDRESS || '0x03216DB82D621C3fcD50945908D759CE2D13dB9C'

if (!API_KEY || !SECRET || !PASSPHRASE) {
  console.error('Missing POLYMARKET_API_KEY, POLYMARKET_SECRET, or POLYMARKET_PASSPHRASE')
  console.error('Set them as env vars or use: doppler run -- npx tsx scripts/test-portfolio.ts')
  process.exit(1)
}

// ── HMAC L2 Auth ──
async function buildHmacSignature(
  secret: string, timestamp: number, method: string, requestPath: string, body?: string
): Promise<string> {
  let message = timestamp + method + requestPath
  if (body !== undefined) message += body

  const { createHmac } = await import('node:crypto')
  const sanitized = secret.replace(/-/g, '+').replace(/_/g, '/')
  const keyBuf = Buffer.from(sanitized, 'base64')
  const sig = createHmac('sha256', keyBuf).update(message).digest('base64')
  return sig.replace(/\+/g, '-').replace(/\//g, '_')
}

async function l2Headers(method: string, path: string, body?: string) {
  // Derive address from private key
  const { Wallet } = await import('ethers')
  const wallet = new Wallet(PRIVATE_KEY)
  const address = wallet.address

  const timestamp = Math.floor(Date.now() / 1000)
  const sig = await buildHmacSignature(SECRET, timestamp, method, path, body)

  return {
    'POLY_ADDRESS': address,
    'POLY_SIGNATURE': sig,
    'POLY_TIMESTAMP': String(timestamp),
    'POLY_API_KEY': API_KEY,
    'POLY_PASSPHRASE': PASSPHRASE,
  }
}

async function tryEndpoint(label: string, url: string, method = 'GET', needsAuth = false, body?: string) {
  console.log(`\n=== ${label} ===`)
  console.log(`  ${method} ${url}`)
  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (needsAuth) {
      const urlObj = new URL(url)
      const authHeaders = await l2Headers(method, urlObj.pathname + urlObj.search, body)
      Object.assign(headers, authHeaders)
    }
    if (body) headers['Content-Type'] = 'application/json'

    const res = await fetch(url, { method, headers, body })
    console.log(`  Status: ${res.status}`)
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      console.log(`  Response:`, JSON.stringify(json, null, 2).slice(0, 500))
    } catch {
      console.log(`  Response: ${text.slice(0, 300)}`)
    }
  } catch (e: any) {
    console.log(`  Error: ${e.message}`)
  }
}

async function main() {
  // Derive EOA
  const { Wallet } = await import('ethers')
  const wallet = new Wallet(PRIVATE_KEY)
  const eoaAddress = wallet.address
  const proxyLower = PROXY_ADDRESS.toLowerCase()

  console.log(`EOA Address: ${eoaAddress}`)
  console.log(`Proxy Address: ${PROXY_ADDRESS}`)
  console.log('')

  // 1. CLOB authenticated endpoints
  await tryEndpoint('CLOB /balance (auth)', `${CLOB_API}/balance`, 'GET', true)
  await tryEndpoint('CLOB /profile (auth)', `${CLOB_API}/profile`, 'GET', true)

  // 2. Data API with proxy address
  await tryEndpoint('Data API /value (proxy)', `${DATA_API}/value?user=${proxyLower}`)
  await tryEndpoint('Data API /positions (proxy)', `${DATA_API}/positions?user=${proxyLower}&limit=5`)
  await tryEndpoint('Data API /activity (proxy)', `${DATA_API}/activity?user=${proxyLower}&limit=3`)
  await tryEndpoint('Data API /trades (proxy)', `${DATA_API}/trades?user=${proxyLower}&limit=3`)

  // 3. Data API with EOA address
  await tryEndpoint('Data API /value (EOA)', `${DATA_API}/value?user=${eoaAddress.toLowerCase()}`)
  await tryEndpoint('Data API /positions (EOA)', `${DATA_API}/positions?user=${eoaAddress.toLowerCase()}&limit=5`)

  // 4. Try profile endpoints
  await tryEndpoint('Data API /profile (proxy)', `${DATA_API}/profile?user=${proxyLower}`)
  await tryEndpoint('Data API /wallets (proxy)', `${DATA_API}/wallets?user=${proxyLower}`)

  console.log('\n=== Done ===')
}

main().catch(console.error)
