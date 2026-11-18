export interface RateLimitCheckResult {
  allowed: boolean
  remainingMinutes?: number
  error?: string
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes (900,000 ms)

/**
 * Extracts trusted client IP without trusting arbitrary client-spoofed headers.
 * Uses Cloudflare's trusted `cf-connecting-ip` header when present,
 * and falls back safely to '127.0.0.1' in local dev environments.
 */
export function getTrustedClientIp(req: { header: (name: string) => string | undefined }): string {
  const cfIp = req.header('cf-connecting-ip')
  if (cfIp && typeof cfIp === 'string' && cfIp.trim() !== '') {
    return cfIp.trim()
  }
  return '127.0.0.1'
}

/**
 * Checks if the IP has exceeded 5 login attempts within a 15-minute window.
 * Fails closed (rejects login) if D1 database or query fails, avoiding bypass during outages.
 */
export async function checkLoginRateLimit(db: D1Database | undefined, ip: string): Promise<RateLimitCheckResult> {
  if (!db) {
    console.error('Rate limit check failed: DB binding missing')
    return { allowed: false, remainingMinutes: 15, error: 'ระบบความปลอดภัยไม่พร้อมใช้งาน' }
  }

  const now = Date.now()
  try {
    const row = await db
      .prepare('SELECT attempts, last_attempt_at FROM login_attempts WHERE ip = ?')
      .bind(ip)
      .first<{ attempts: number; last_attempt_at: number }>()

    if (!row) {
      return { allowed: true }
    }

    const elapsed = now - row.last_attempt_at

    // If lockout window (15 mins) has passed, allow attempt (next fail will reset count)
    if (elapsed > LOCKOUT_MS) {
      return { allowed: true }
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      const remainingMs = LOCKOUT_MS - elapsed
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)))
      return { allowed: false, remainingMinutes }
    }

    return { allowed: true }
  } catch (err) {
    console.error('Error during rate limit check (failing closed):', err)
    // Fail-closed to protect admin endpoint when D1 is degraded or schema error
    return {
      allowed: false,
      remainingMinutes: 15,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ความปลอดภัย',
    }
  }
}

/**
 * Records a failed login attempt atomically using SQLite UPSERT with RETURNING clause.
 * Avoids race conditions between concurrent read and write operations.
 */
export async function recordFailedLogin(db: D1Database | undefined, ip: string): Promise<number> {
  if (!db) return MAX_ATTEMPTS

  const now = Date.now()
  try {
    const result = await db
      .prepare(`
        INSERT INTO login_attempts (ip, attempts, last_attempt_at)
        VALUES (?, 1, ?)
        ON CONFLICT(ip) DO UPDATE SET
          attempts = CASE
            WHEN (? - login_attempts.last_attempt_at) > 900000 THEN 1
            ELSE login_attempts.attempts + 1
          END,
          last_attempt_at = ?
        RETURNING attempts
      `)
      .bind(ip, now, now, now)
      .first<{ attempts: number }>()

    return result?.attempts ?? 1
  } catch (err) {
    console.error('Error recording failed login attempt:', err)
    // On failure to record, return MAX_ATTEMPTS to avoid brute force
    return MAX_ATTEMPTS
  }
}

/**
 * Resets failed login attempts for an IP upon successful authentication.
 */
export async function resetLoginAttempts(db: D1Database | undefined, ip: string): Promise<void> {
  if (!db) return
  try {
    await db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run()
  } catch (err) {
    console.error('Error resetting login attempts:', err)
  }
}
