import { Hono } from 'hono'
import { Env } from '../types'

export const mediaRouter = new Hono<{ Bindings: Env }>()

// Allowed key pattern: letters, numbers, hyphens, underscores, dots with verified image extensions
// Forbids directory traversal (..), path escapes, control characters, or unapproved file types
const SAFE_MEDIA_KEY_REGEX = /^(covers\/)?[a-zA-Z0-9_-]+[a-zA-Z0-9_.-]*\.(webp|png|jpg|jpeg)$/i

// GET /media/* - Serves verified image files stored in R2 bucket
mediaRouter.get('/:key{.+}', async (c) => {
  const key = c.req.param('key')

  if (!key || typeof key !== 'string') {
    return c.text('Not Found', 404)
  }

  // Reject path traversal and non-image or unrecognized keys
  if (key.includes('..') || key.includes('\\') || !SAFE_MEDIA_KEY_REGEX.test(key)) {
    return c.text('Not Found', 404)
  }

  try {
    const object = await c.env.MEDIA.get(key)

    if (!object) {
      return c.text('File Not Found', 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Enforce strict image Content-Type based on extension
    const lowerKey = key.toLowerCase()
    if (lowerKey.endsWith('.webp')) {
      headers.set('content-type', 'image/webp')
    } else if (lowerKey.endsWith('.png')) {
      headers.set('content-type', 'image/png')
    } else if (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg')) {
      headers.set('content-type', 'image/jpeg')
    } else {
      headers.set('content-type', 'application/octet-stream')
    }

    // Check If-None-Match for 304 Not Modified
    const clientEtag = c.req.header('if-none-match')
    if (clientEtag && clientEtag === object.httpEtag) {
      return new Response(null, { status: 304, headers })
    }

    return new Response(object.body as ReadableStream, {
      status: 200,
      headers,
    })
  } catch (err) {
    // Log error internally and do not expose exception details to clients
    console.error('Error fetching media from R2:', err)
    return c.text('Error retrieving media file', 500)
  }
})
