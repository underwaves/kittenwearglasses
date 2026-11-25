export type WorkMainType = 'all' | 'content' | 'graphic'

/**
 * Categorizes a work into 'content' (video/clips/vlog) or 'graphic' (thumbnails/banners/artwork)
 * based on its category name.
 */
export function getWorkType(category: string): 'content' | 'graphic' {
  const cat = (category || '').toLowerCase()
  if (
    cat.includes('กราฟิก') ||
    cat.includes('กราฟฟิก') ||
    cat.includes('graphic') ||
    cat.includes('thumbnail') ||
    cat.includes('ปกคลิป') ||
    cat.includes('banner') ||
    cat.includes('แบนเนอร์') ||
    cat.includes('artwork') ||
    cat.includes('อาร์ตเวิร์ก') ||
    cat.includes('โปสเตอร์') ||
    cat.includes('poster') ||
    cat.includes('ป้าย') ||
    cat.includes('ดีไซน์') ||
    cat.includes('design')
  ) {
    return 'graphic'
  }
  return 'content'
}

export function isGraphicWork(category: string): boolean {
  return getWorkType(category) === 'graphic'
}

export const CONTENT_CATEGORIES = [
  'Shorts/Reels/TikTok',
  'Vlog',
  'วิดีโอคอนเทนต์/รีวิว',
  'อื่นๆ',
]

export const GRAPHIC_CATEGORIES = [
  'งานกราฟิก - ปกคลิป (Thumbnail)',
  'งานกราฟิก - แบนเนอร์ (Banner)',
  'งานกราฟิก - อาร์ตเวิร์ก (Artwork)',
  'งานกราฟิก - โซเชียลมีเดีย',
  'อื่นๆ',
]
