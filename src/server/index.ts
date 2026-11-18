import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env, WorkRecord } from './types'
import { publicRouter } from './routes/public'
import { adminRouter } from './routes/admin'
import { mediaRouter } from './routes/media'
import { csrfProtection, isAllowedOrigin } from './middleware/csrf'

const app = new Hono<{ Bindings: Env }>()

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Global Error Handler - does NOT expose internal exception details to client
app.onError((err, c) => {
  console.error('Unhandled Worker Error:', err)
  return c.json(
    {
      success: false,
      error: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
    },
    500
  )
})

// Global Security Headers Middleware
app.use('*', async (c, next) => {
  await next()

  // Common security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Frame protection: Admin paths strictly forbidden from embedding, public pages same-origin
  const path = c.req.path
  if (path.startsWith('/api/admin') || path.startsWith('/admin')) {
    c.res.headers.set('X-Frame-Options', 'DENY')
  } else {
    c.res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }

  // Content-Security-Policy (Restricting iframe embedding to authorized video providers)
  const isExcludedFromFrameAncestors = path.startsWith('/admin') || path.startsWith('/api/admin')
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.tiktok.com https://www.youtube.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://img.youtube.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokcdn-eu.com https://*.tiktok.com https://drive.google.com https://lh3.googleusercontent.com",
    "media-src 'self' blob: https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://drive.google.com",
    "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.tiktok.com https://drive.google.com",
    "connect-src 'self'",
    isExcludedFromFrameAncestors ? "frame-ancestors 'none'" : "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ]
  c.res.headers.set('Content-Security-Policy', cspDirectives.join('; '))
})

// Explicit Origin Allowlist CORS (No wildcard reflection with credentials)
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const requestUrl = new URL(c.req.url)
      if (origin && isAllowedOrigin(origin, requestUrl)) {
        return origin
      }
      return null
    },
    credentials: true,
  })
)

// CSRF check on mutating requests (POST, PUT, PATCH, DELETE)
app.use('/api/*', csrfProtection)

// Mount API routes
app.route('/api', publicRouter)
app.route('/api/admin', adminRouter)
app.route('/media', mediaRouter)

// Dynamic Open Graph / Twitter Meta for /portfolio/:id
app.get('/portfolio/:id', async (c) => {
  const idParam = c.req.param('id')
  const id = parseInt(idParam, 10)

  if (!c.env.ASSETS) {
    return c.text('Not Found', 404)
  }

  // Fetch base SPA HTML from ASSETS (Cloudflare SPA mode serves index.html for /portfolio/:id)
  const url = new URL(c.req.url)
  const assetResponse = await c.env.ASSETS.fetch(c.req.raw)

  if (isNaN(id)) {
    return assetResponse
  }

  try {
    const work = await c.env.DB.prepare('SELECT * FROM works WHERE id = ? AND is_visible = 1')
      .bind(id)
      .first<WorkRecord>()

    if (!work) {
      return assetResponse
    }

    const pageTitle = `${work.title} | ผลงานตัดต่อ @kittenwearglasses`
    const pageDesc = `ชมผลงานตัดต่อวิดีโอ "${work.title}" หมวด ${work.category} (${
      work.orientation === 'vertical' ? 'แนวตั้ง 9:16' : 'แนวนอน 16:9'
    }) โดยร้านรับตัดต่อวิดีโอ @kittenwearglasses 🎀`
    const coverUrl = work.cover_key.startsWith('http')
      ? work.cover_key
      : `${url.origin}/media/${work.cover_key.replace(/^\/media\//, '')}`
    const canonicalUrl = `${url.origin}/portfolio/${work.id}`

    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(pageTitle)
        },
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', pageDesc)
        },
      })
      .on('meta[property="og:title"]', {
        element(el) {
          el.setAttribute('content', pageTitle)
        },
      })
      .on('meta[property="og:description"]', {
        element(el) {
          el.setAttribute('content', pageDesc)
        },
      })
      .on('head', {
        element(el) {
          el.append(
            `<meta property="og:image" content="${escapeAttr(coverUrl)}" />
             <meta property="og:url" content="${escapeAttr(canonicalUrl)}" />
             <meta name="twitter:card" content="summary_large_image" />
             <meta name="twitter:title" content="${escapeAttr(pageTitle)}" />
             <meta name="twitter:description" content="${escapeAttr(pageDesc)}" />
             <meta name="twitter:image" content="${escapeAttr(coverUrl)}" />`,
            { html: true }
          )
        },
      })

    return rewriter.transform(assetResponse)
  } catch (err) {
    console.error('Error rewriting OG tags for /portfolio/:id:', err)
    return assetResponse
  }
})

// Fallback to static assets (SPA handled by Cloudflare Assets)
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw)
  }
  return c.text('Not Found', 404)
})

export default app
