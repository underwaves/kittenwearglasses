import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifySessionToken } from '../utils/crypto'
import { Env } from '../types'

export const SESSION_COOKIE_NAME = 'kwg_admin_session'

export async function adminAuthMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const sessionSecret = c.env.SESSION_SECRET

  // Securely reject if session secret is missing or empty - NEVER use fallback
  if (!sessionSecret || typeof sessionSecret !== 'string' || sessionSecret.trim() === '') {
    return c.json(
      {
        success: false,
        error: 'ระบบความปลอดภัยยังไม่ได้ตั้งค่าความลับเซสชัน (SESSION_SECRET)',
      },
      500
    )
  }

  const sessionToken = getCookie(c, SESSION_COOKIE_NAME)
  const isValid = await verifySessionToken(sessionToken, sessionSecret, c.env.DB)

  if (!isValid) {
    return c.json(
      {
        success: false,
        error: 'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      },
      401
    )
  }

  await next()
}
