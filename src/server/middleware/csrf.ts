import { Context, Next } from 'hono'
import { Env } from '../types'

/**
 * Validates whether an origin is in the explicit allowlist.
 * Supports production origin and local development origins (when running locally).
 */
export function isAllowedOrigin(originStr: string | undefined | null, requestUrl: URL): boolean {
  if (!originStr || typeof originStr !== 'string') return false
  try {
    const originUrl = new URL(originStr)

    // 1. Exact same-origin match
    if (originUrl.origin === requestUrl.origin) {
      return true
    }

    // 2. Production origin allowlist
    const allowedProductionOrigins = [
      'https://kittenwearglasses.wo-nad.workers.dev',
    ]
    if (allowedProductionOrigins.includes(originUrl.origin)) {
      return true
    }

    // 3. Local development origins (only accepted if the server itself is receiving traffic locally)
    const isLocalServer =
      requestUrl.hostname === 'localhost' ||
      requestUrl.hostname === '127.0.0.1' ||
      requestUrl.hostname === '0.0.0.0'

    if (isLocalServer) {
      const isLocalClient =
        originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1'
      const allowedPorts = ['5173', '8787', '3000', '4173']
      if (isLocalClient && (allowedPorts.includes(originUrl.port) || originUrl.port === '')) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}

/**
 * Strict CSRF protection for mutating requests (POST, PUT, DELETE, PATCH).
 * Rejects requests without Origin or Referer, or with disallowed origins.
 */
export async function csrfProtection(c: Context<{ Bindings: Env }>, next: Next) {
  const method = c.req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return await next()
  }

  const origin = c.req.header('origin')
  const referer = c.req.header('referer')
  const requestUrl = new URL(c.req.url)

  // Disallow mutating requests where both Origin and Referer are stripped
  if (!origin && !referer) {
    return c.json(
      {
        success: false,
        error: 'ไม่อนุญาตการส่งข้อมูลโดยไม่มี Origin หรือ Referer header (CSRF policy)',
      },
      403
    )
  }

  // 1. Validate Origin header if present
  if (origin) {
    if (!isAllowedOrigin(origin, requestUrl)) {
      return c.json(
        {
          success: false,
          error: 'ไม่อนุญาตการเข้าถึงข้อมูลจาก Origin นี้ (CSRF policy)',
        },
        403
      )
    }
    return await next()
  }

  // 2. Fallback to validate Referer origin if Origin is absent
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      if (!isAllowedOrigin(refererUrl.origin, requestUrl)) {
        return c.json(
          {
            success: false,
            error: 'ไม่อนุญาตการเข้าถึงข้อมูลจาก Referer นี้ (CSRF policy)',
          },
          403
        )
      }
    } catch {
      return c.json(
        {
          success: false,
          error: 'รูปแบบ Referer header ไม่ถูกต้อง (CSRF policy)',
        },
        403
      )
    }
  }

  await next()
}
