export type VideoProvider = 'youtube' | 'tiktok' | 'drive'

export interface ParsedVideoResult {
  provider: VideoProvider
  id: string
  embedUrl: string
}

export type ParseVideoResponse =
  | { success: true; data: ParsedVideoResult }
  | { success: false; error: string }

/**
 * Validates and extracts embed info from supported video URLs (YouTube, TikTok, Google Drive).
 * Used both in client forms and server-side validation.
 */
export function parseVideoUrl(inputUrl: string): ParseVideoResponse {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { success: false, error: 'กรุณากรอกลิงก์วิดีโอ' }
  }

  let trimmed = inputUrl.trim()
  if (!trimmed) {
    return { success: false, error: 'กรุณากรอกลิงก์วิดีโอ' }
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { success: false, error: 'รูปแบบ URL ไม่ถูกต้อง' }
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

  // 1. Check for TikTok short links first to give friendly specific guidance
  if (hostname === 'vm.tiktok.com' || hostname === 'vt.tiktok.com') {
    return {
      success: false,
      error:
        'ลิงก์ TikTok นี้เป็นลิงก์แบบย่อ (vm.tiktok.com / vt.tiktok.com) กรุณากดเปิดลิงก์ในเบราว์เซอร์ แล้วคัดลอก URL เต็มจากแถบที่อยู่มาวางแทน (รูปแบบ: tiktok.com/@username/video/เลขไอดี)',
    }
  }

  // 2. YouTube
  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtu.be' ||
    hostname === 'youtube-nocookie.com'
  ) {
    let videoId: string | null = null

    if (hostname === 'youtu.be') {
      // Path format: /ID
      const pathPart = parsed.pathname.slice(1).split('/')[0]
      if (pathPart && /^[\w-]{6,15}$/.test(pathPart)) {
        videoId = pathPart
      }
    } else {
      // Standard watch URL: /watch?v=ID
      const vParam = parsed.searchParams.get('v')
      if (vParam && /^[\w-]{6,15}$/.test(vParam)) {
        videoId = vParam
      } else if (parsed.pathname.startsWith('/shorts/')) {
        // Shorts URL: /shorts/ID
        const idPart = parsed.pathname.replace('/shorts/', '').split('/')[0]
        if (idPart && /^[\w-]{6,15}$/.test(idPart)) {
          videoId = idPart
        }
      } else if (parsed.pathname.startsWith('/embed/')) {
        // Embed URL: /embed/ID
        const idPart = parsed.pathname.replace('/embed/', '').split('/')[0]
        if (idPart && /^[\w-]{6,15}$/.test(idPart)) {
          videoId = idPart
        }
      }
    }

    if (!videoId) {
      return {
        success: false,
        error:
          'ไม่พบรหัสวิดีโอ YouTube ที่ถูกต้อง (รองรับ youtube.com/watch?v=ID, youtu.be/ID หรือ youtube.com/shorts/ID)',
      }
    }

    return {
      success: true,
      data: {
        provider: 'youtube',
        id: videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      },
    }
  }

  // 3. TikTok
  if (hostname === 'tiktok.com' || hostname === 'm.tiktok.com') {
    // Expected format: /@username/video/1234567890123456789
    const match = parsed.pathname.match(/\/@[^/]+\/video\/(\d+)/i)
    if (match && match[1]) {
      const videoId = match[1]
      return {
        success: true,
        data: {
          provider: 'tiktok',
          id: videoId,
          embedUrl: `https://www.tiktok.com/embed/${videoId}`,
        },
      }
    }

    return {
      success: false,
      error:
        'รูปแบบลิงก์ TikTok ไม่ถูกต้อง ต้องเป็นลิงก์วิดีโอเต็ม เช่น https://www.tiktok.com/@username/video/7123456789012345678',
    }
  }

  // 4. Google Drive
  if (hostname === 'drive.google.com') {
    let fileId: string | null = null

    // Format 1: /file/d/FILE_ID/view... or /file/d/FILE_ID/preview
    const match = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i)
    if (match && match[1]) {
      fileId = match[1]
    } else {
      // Format 2: /open?id=FILE_ID or /uc?id=FILE_ID
      const idParam = parsed.searchParams.get('id')
      if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) {
        fileId = idParam
      }
    }

    if (!fileId) {
      return {
        success: false,
        error:
          'ไม่พบรหัสไฟล์ Google Drive ที่ถูกต้อง (รองรับ drive.google.com/file/d/ID/view หรือ drive.google.com/open?id=ID)',
      }
    }

    return {
      success: true,
      data: {
        provider: 'drive',
        id: fileId,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      },
    }
  }

  return {
    success: false,
    error:
      'ระบบรองรับเฉพาะลิงก์วิดีโอจาก YouTube, TikTok (ลิงก์เต็ม), และ Google Drive เท่านั้น',
  }
}
