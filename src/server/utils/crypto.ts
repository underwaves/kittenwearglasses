// Web Crypto HMAC-SHA256 helpers for session cookies and timing-safe comparisons

const encoder = new TextEncoder()

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Constant-time string equality check using HMAC-SHA256 with an ephemeral key.
 * Prevents timing attacks when comparing passwords or secret tokens on Cloudflare Workers.
 */
export async function timingSafeEqualString(a: string, b: string): Promise<boolean> {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length > 256 || b.length > 256) return false

  try {
    const key = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
    const aBuf = encoder.encode(a)
    const bBuf = encoder.encode(b)
    const aMac = await crypto.subtle.sign('HMAC', key, aBuf)
    return await crypto.subtle.verify('HMAC', key, aMac, bBuf)
  } catch {
    return false
  }
}

/**
 * Creates a signed HMAC session token with an embedded unique session UUID for revocation.
 * Returns null if secret is missing or empty (never falls back to an insecure default).
 */
export async function createSessionToken(
  secret: string | undefined | null,
  maxAgeMs = 7 * 24 * 60 * 60 * 1000
): Promise<string | null> {
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    return null
  }

  const issuedAt = Date.now()
  const expiresAt = issuedAt + maxAgeMs
  const sessionId = crypto.randomUUID()
  const payload = `admin:${issuedAt}:${expiresAt}:${sessionId}`

  const key = await getHmacKey(secret)
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const signatureHex = bufferToHex(signatureBuffer)

  return `${payload}.${signatureHex}`
}

/**
 * Extracts session metadata (sessionId, expiresAt) without signature verification.
 */
export function extractSessionId(token: string | undefined | null): { sessionId: string; expiresAt: number } | null {
  if (!token || typeof token !== 'string') return null
  const lastDotIndex = token.lastIndexOf('.')
  if (lastDotIndex === -1) return null

  const payload = token.slice(0, lastDotIndex)
  const parts = payload.split(':')
  if (parts[0] !== 'admin') return null

  const expiresAt = parseInt(parts[2], 10)
  if (isNaN(expiresAt)) return null

  const sessionId = parts.length >= 4 ? parts[3] : ''
  return { sessionId, expiresAt }
}

/**
 * Revokes a session token by persisting its unique session ID into D1 until expiration.
 */
export async function revokeSessionToken(db: D1Database | undefined, token: string | undefined | null): Promise<void> {
  if (!db || !token) return
  const info = extractSessionId(token)
  if (!info || !info.sessionId) return

  try {
    await db
      .prepare('INSERT INTO revoked_sessions (session_id, expires_at) VALUES (?, ?) ON CONFLICT(session_id) DO NOTHING')
      .bind(info.sessionId, info.expiresAt)
      .run()

    // Opportunistic cleanup of expired revocation records (10% sampling)
    if (Math.random() < 0.1) {
      await db.prepare('DELETE FROM revoked_sessions WHERE expires_at < ?').bind(Date.now()).run()
    }
  } catch (err) {
    console.error('Error recording revoked session in D1:', err)
  }
}

/**
 * Verifies HMAC session token signature, expiration, and revocation status in D1.
 * Returns false if secret is missing/empty, signature is invalid, token is expired, or session was revoked.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  secret: string | undefined | null,
  db?: D1Database
): Promise<boolean> {
  if (!secret || typeof secret !== 'string' || secret.trim() === '') return false
  if (!token || typeof token !== 'string') return false

  const lastDotIndex = token.lastIndexOf('.')
  if (lastDotIndex === -1) return false

  const payload = token.slice(0, lastDotIndex)
  const signatureHex = token.slice(lastDotIndex + 1)

  const parts = payload.split(':')
  if (parts[0] !== 'admin') return false
  if (parts.length !== 3 && parts.length !== 4) return false

  const expiresAt = parseInt(parts[2], 10)
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false
  }

  // Check if session ID has been explicitly revoked in D1
  const sessionId = parts.length === 4 ? parts[3] : ''
  if (db && sessionId) {
    try {
      const revoked = await db
        .prepare('SELECT session_id FROM revoked_sessions WHERE session_id = ?')
        .bind(sessionId)
        .first()
      if (revoked) {
        return false
      }
    } catch {
      // If table does not exist or transient D1 error, continue to crypto verify
    }
  }

  try {
    const key = await getHmacKey(secret)
    const signatureBytes = hexToBuffer(signatureHex)
    return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(payload))
  } catch {
    return false
  }
}
