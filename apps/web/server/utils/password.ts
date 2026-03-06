const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 16
const KEY_LENGTH_BITS = 256

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false
  }
  let diff = 0
  for (let index = 0; index < left.length; index++) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return diff === 0
}

/**
 * Hash password with PBKDF2-SHA256. Returns "saltHex:hashHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  )
  return `${bytesToHex(salt)}:${bytesToHex(new Uint8Array(derivedBits))}`
}

/**
 * Verify password against stored "saltHex:hashHex".
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) {
    return false
  }

  const salt = hexToBytes(saltHex)
  const expected = hexToBytes(hashHex)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  )
  const actual = new Uint8Array(derivedBits)
  return constantTimeEqual(actual, expected)
}
