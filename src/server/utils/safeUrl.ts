/**
 * Validates that a user-submitted link is safe to render in an <a> tag.
 * Only permits:
 * 1. Safe relative paths (starts with single '/' and not '//', no control chars or backslashes)
 * 2. Absolute HTTP/HTTPS URLs (strictly 'http:' or 'https:' protocol)
 * Rejects javascript:, data:, vbscript:, protocol-relative (//) URLs, and malformed schemes.
 */
export function isSafeLinkUrl(urlStr: string | undefined | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return true // Optional/empty is fine
  const trimmed = urlStr.trim()
  if (trimmed === '') return true

  // Check for dangerous keywords or control characters
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false
  }

  // Safe relative internal path: starts with single '/', not '//'
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) {
      return false // Protocol-relative link disallowed
    }
    // Disallow control characters, quotes, or backslashes
    if (/[\0-\x1F\s\\<>"]/.test(trimmed)) {
      return false
    }
    return true
  }

  // Absolute URL
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
