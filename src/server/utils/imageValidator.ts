/**
 * Server-side image validator that verifies magic bytes and structural headers of uploaded files.
 * Rejects SVGs, non-image files, forged MIME types, and malformed images.
 * Only accepts valid JPEG, PNG, and WebP images.
 */

export interface ImageValidationResult {
  valid: boolean
  mime?: 'image/jpeg' | 'image/png' | 'image/webp'
  extension?: 'jpg' | 'png' | 'webp'
  error?: string
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MiB

export function validateImageBuffer(buffer: ArrayBuffer): ImageValidationResult {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, error: 'ไฟล์ภาพว่างเปล่า' }
  }

  if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'ขนาดไฟล์ภาพเกิน 5 MB' }
  }

  if (buffer.byteLength < 30) {
    return { valid: false, error: 'ขนาดไฟล์เล็กเกินกว่าจะเป็นไฟล์ภาพที่ถูกต้อง' }
  }

  const bytes = new Uint8Array(buffer)

  // Explicitly check for and reject SVG or HTML text content disguised as image
  const first300Chars = new TextDecoder('utf-8', { fatal: false })
    .decode(bytes.slice(0, Math.min(300, bytes.length)))
    .toLowerCase()

  if (
    first300Chars.includes('<svg') ||
    first300Chars.includes('<?xml') ||
    first300Chars.includes('<!doctype html') ||
    first300Chars.includes('<html') ||
    first300Chars.includes('<script')
  ) {
    return { valid: false, error: 'ไม่อนุญาตไฟล์ SVG หรือ HTML เนื่องจากเหตุผลด้านความปลอดภัย' }
  }

  // 1. PNG Verification
  // Signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    // Check first chunk is IHDR (bytes 12-15 = 'IHDR')
    const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
    if (chunkType === 'IHDR') {
      const view = new DataView(buffer)
      const width = view.getUint32(16, false)
      const height = view.getUint32(20, false)
      if (width > 0 && height > 0) {
        return { valid: true, mime: 'image/png', extension: 'png' }
      }
    }
    return { valid: false, error: 'โครงสร้างไฟล์ PNG ไม่สมบูรณ์' }
  }

  // 2. JPEG Verification
  // Signature: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    // Valid JPEG files should end with EOI marker (FF D9) in the last 100 bytes
    let hasEoi = false
    const scanStart = Math.max(0, bytes.length - 100)
    for (let i = scanStart; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
        hasEoi = true
        break
      }
    }

    if (hasEoi) {
      return { valid: true, mime: 'image/jpeg', extension: 'jpg' }
    }
    // Allow JPEG even if EOI is truncated slightly if SOF marker exists
    let hasValidMarker = false
    for (let i = 2; i < Math.min(bytes.length - 4, 1024); i++) {
      if (bytes[i] === 0xff && (bytes[i + 1] === 0xc0 || bytes[i + 1] === 0xc2 || bytes[i + 1] === 0xe0 || bytes[i + 1] === 0xe1)) {
        hasValidMarker = true
        break
      }
    }
    if (hasValidMarker) {
      return { valid: true, mime: 'image/jpeg', extension: 'jpg' }
    }
    return { valid: false, error: 'โครงสร้างไฟล์ JPEG ไม่สมบูรณ์' }
  }

  // 3. WebP Verification
  // RIFF .... WEBP
  if (
    bytes[0] === 0x52 && // 'R'
    bytes[1] === 0x49 && // 'I'
    bytes[2] === 0x46 && // 'F'
    bytes[3] === 0x46 && // 'F'
    bytes[8] === 0x57 && // 'W'
    bytes[9] === 0x45 && // 'E'
    bytes[10] === 0x42 && // 'B'
    bytes[11] === 0x50 // 'P'
  ) {
    const vp8Chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
    if (vp8Chunk === 'VP8 ' || vp8Chunk === 'VP8L' || vp8Chunk === 'VP8X') {
      return { valid: true, mime: 'image/webp', extension: 'webp' }
    }
    return { valid: false, error: 'รูปแบบย่อยของไฟล์ WebP ไม่ถูกต้อง' }
  }

  return {
    valid: false,
    error: 'ไฟล์ที่อัปโหลดไม่ใช่รูปภาพที่รองรับ (รองรับเฉพาะ JPEG, PNG, หรือ WebP แท้เท่านั้น)',
  }
}
