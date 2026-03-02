/**
 * Generate PBKDF2-SHA256 hash for demo password (demo1234) with 16 zero-byte salt.
 * Matches server/utils/password.ts: 100k iterations, 256-bit key.
 * Usage: node scripts/gen-demo-hash.mjs
 */
const SALT_LENGTH = 16
const ITERATIONS = 100_000
const KEY_LENGTH = 256

function toHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function main() {
  const salt = new Uint8Array(SALT_LENGTH).fill(0)
  const password = 'demo1234'
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    KEY_LENGTH,
  )
  const out = `${toHex(salt)}:${toHex(bits)}`
  console.log(out)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
