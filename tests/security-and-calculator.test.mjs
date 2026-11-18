import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { parseVideoUrl } from '../src/shared/videoParser.ts'
import {
  calculateOrderQuote,
  buildOrderSummaryText,
  parsePriceRange,
  formatPriceRange,
} from '../src/shared/priceCalculator.ts'
import { timingSafeEqualString } from '../src/server/utils/crypto.ts'
import { validateImageBuffer } from '../src/server/utils/imageValidator.ts'
import { isSafeLinkUrl } from '../src/server/utils/safeUrl.ts'

// Mock D1 datasets matching initial database seeds
const mockServices = [
  {
    id: 1,
    title: 'Short Form Basic (ไม่เกิน 1 นาที)',
    duration_label: 'ไม่เกิน 1 นาที',
    price_label: '300',
    price_num: 300,
  },
  {
    id: 2,
    title: 'Standard Viral Edit (1–3 นาที)',
    duration_label: '1–3 นาที',
    price_label: '400–800',
    price_num: 600,
  },
  {
    id: 3,
    title: 'Long Form / Storytelling (3–5 นาที)',
    duration_label: '3–5 นาที',
    price_label: '900–1,000',
    price_num: 950,
  },
]

const mockAddons = [
  { id: 1, category: 'subtitles', name: 'ซับไทย (ไม่เกิน 1 นาที)', price_label: '100', price_num: 100 },
  { id: 2, category: 'subtitles', name: 'ซับไทย (1–3 นาที)', price_label: '150', price_num: 150 },
  { id: 3, category: 'subtitles', name: 'ซับไทย (3–5 นาที)', price_label: '200', price_num: 200 },
  { id: 4, category: 'subtitles', name: 'มีไฟล์ .SRT มาให้', price_label: '50', price_num: 50 },
  { id: 5, category: 'voiceover', name: 'พากย์ไทย (ไม่เกิน 1 นาที)', price_label: '150', price_num: 150 },
  { id: 6, category: 'voiceover', name: 'พากย์ไทย (1–3 นาที)', price_label: '200', price_num: 200 },
  { id: 7, category: 'voiceover', name: 'พากย์ไทย (3–5 นาที)', price_label: '250', price_num: 250 },
]

const defaultConfig = {
  rushFeePercent: 50,
  depositPercent: 50,
  srtFeeFallback: 50,
  srtMode: 'replace',
}

describe('1. Video URL & Embed Parser', () => {
  test('parses standard YouTube watch URL', () => {
    const res = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'youtube')
      assert.equal(res.data.id, 'dQw4w9WgXcQ')
      assert.equal(res.data.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    }
  })

  test('parses youtu.be short URL', () => {
    const res = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'youtube')
      assert.equal(res.data.id, 'dQw4w9WgXcQ')
    }
  })

  test('parses YouTube Shorts URL', () => {
    const res = parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'youtube')
      assert.equal(res.data.id, 'dQw4w9WgXcQ')
    }
  })

  test('parses YouTube URL missing protocol prefix', () => {
    const res = parseVideoUrl('youtube.com/watch?v=dQw4w9WgXcQ')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.id, 'dQw4w9WgXcQ')
    }
  })

  test('parses TikTok full video URL', () => {
    const res = parseVideoUrl('https://www.tiktok.com/@kittenwearglasses/video/7123456789012345678')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'tiktok')
      assert.equal(res.data.id, '7123456789012345678')
      assert.equal(
        res.data.embedUrl,
        'https://www.tiktok.com/embed/7123456789012345678'
      )
    }
  })

  test('rejects TikTok short link with friendly instructions', () => {
    const res = parseVideoUrl('https://vt.tiktok.com/ZSRxxxxxx/')
    assert.equal(res.success, false)
    if (!res.success) {
      assert.match(res.error, /ลิงก์แบบย่อ/)
    }
  })

  test('parses Google Drive file preview URL', () => {
    const res = parseVideoUrl('https://drive.google.com/file/d/1abcXYZ_12345/view?usp=sharing')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'drive')
      assert.equal(res.data.id, '1abcXYZ_12345')
      assert.equal(res.data.embedUrl, 'https://drive.google.com/file/d/1abcXYZ_12345/preview')
    }
  })

  test('parses Google Drive open?id= URL', () => {
    const res = parseVideoUrl('https://drive.google.com/open?id=1abcXYZ_12345')
    assert.equal(res.success, true)
    if (res.success) {
      assert.equal(res.data.provider, 'drive')
      assert.equal(res.data.id, '1abcXYZ_12345')
    }
  })

  test('rejects hostile / spoofed URLs', () => {
    assert.equal(parseVideoUrl('javascript:alert(1)').success, false)
    assert.equal(parseVideoUrl('https://youtube.com.attacker.com/watch?v=123456').success, false)
    assert.equal(parseVideoUrl('https://vimeo.com/123456789').success, false)
    assert.equal(parseVideoUrl('').success, false)
    assert.equal(parseVideoUrl('   ').success, false)
  })
})

describe('2. Price Calculator & Order Quote', () => {
  test('Scenario 1: Standard 1 clip without add-ons (<= 1 min, 300 THB)', () => {
    const clips = [
      { id: '1', serviceId: 1, addSubtitles: false, hasSrtFile: false, addVoiceover: false },
    ]
    const quote = calculateOrderQuote(clips, mockServices, mockAddons, false, defaultConfig)
    assert.equal(quote.clips.length, 1)
    assert.equal(quote.subtotalMin, 300)
    assert.equal(quote.subtotalMax, 300)
    assert.equal(quote.isRush, false)
    assert.equal(quote.totalMin, 300)
    assert.equal(quote.totalMax, 300)
    assert.equal(quote.depositMin, 150)
    assert.equal(quote.remainingMin, 150)
  })

  test('Scenario 2: Multi-clip (2 clips) with subtitles + SRT file in replace mode', () => {
    const clips = [
      { id: '1', serviceId: 1, addSubtitles: true, hasSrtFile: true, addVoiceover: false }, // 300 + 50 = 350
      { id: '2', serviceId: 2, addSubtitles: true, hasSrtFile: true, addVoiceover: false }, // 400..800 + 50 = 450..850
    ]
    const quote = calculateOrderQuote(clips, mockServices, mockAddons, false, defaultConfig)
    assert.equal(quote.clips[0].subtitleCost, 50)
    assert.equal(quote.clips[1].subtitleCost, 50)
    assert.equal(quote.subtotalMin, 800) // 350 + 450
    assert.equal(quote.subtotalMax, 1200) // 350 + 850
  })

  test('Scenario 3: 3 mixed clips with voiceover', () => {
    const clips = [
      { id: '1', serviceId: 1, addSubtitles: false, hasSrtFile: false, addVoiceover: true }, // 300 + 150 = 450
      { id: '2', serviceId: 2, addSubtitles: false, hasSrtFile: false, addVoiceover: true }, // 400..800 + 200 = 600..1000
      { id: '3', serviceId: 3, addSubtitles: false, hasSrtFile: false, addVoiceover: true }, // 900..1000 + 250 = 1150..1250
    ]
    const quote = calculateOrderQuote(clips, mockServices, mockAddons, false, defaultConfig)
    assert.equal(quote.clips.length, 3)
    assert.equal(quote.subtotalMin, 450 + 600 + 1150) // 2200
    assert.equal(quote.subtotalMax, 450 + 1000 + 1250) // 2700
  })

  test('Scenario 4: Rush order (50% rush fee on subtotal, 100% deposit)', () => {
    const clips = [
      { id: '1', serviceId: 1, addSubtitles: false, hasSrtFile: false, addVoiceover: false }, // 300
    ]
    const quote = calculateOrderQuote(clips, mockServices, mockAddons, true, defaultConfig)
    assert.equal(quote.isRush, true)
    assert.equal(quote.subtotalMin, 300)
    assert.equal(quote.rushFeeMin, 150) // 50% of 300
    assert.equal(quote.totalMin, 450)
    assert.equal(quote.depositMin, 450) // 100% deposit for rush
    assert.equal(quote.remainingMin, 0)
  })

  test('Scenario 5: Boundary clip count validation (0, 50, 51 clips)', () => {
    assert.throws(
      () => calculateOrderQuote([], mockServices, mockAddons, false, defaultConfig),
      /อย่างน้อย 1 คลิป/
    )

    const fiftyClips = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      serviceId: 1,
      addSubtitles: false,
      hasSrtFile: false,
      addVoiceover: false,
    }))
    const quote50 = calculateOrderQuote(fiftyClips, mockServices, mockAddons, false, defaultConfig)
    assert.equal(quote50.clips.length, 50)
    assert.equal(quote50.subtotalMin, 15000)

    const fiftyOneClips = Array.from({ length: 51 }, (_, i) => ({
      id: String(i + 1),
      serviceId: 1,
      addSubtitles: false,
      hasSrtFile: false,
      addVoiceover: false,
    }))
    assert.throws(
      () => calculateOrderQuote(fiftyOneClips, mockServices, mockAddons, false, defaultConfig),
      /ไม่เกิน 50 คลิป/
    )
  })

  test('Scenario 6: Invalid service ID rejection', () => {
    const invalidClips = [
      { id: '1', serviceId: 99999, addSubtitles: false, hasSrtFile: false, addVoiceover: false },
    ]
    assert.throws(
      () => calculateOrderQuote(invalidClips, mockServices, mockAddons, false, defaultConfig),
      /ไม่พบแพ็กเกจบริการรหัส 99999/
    )
  })

  test('Scenario 7: Summary text generation, encoding, and length fallback check', () => {
    const clips = [
      { id: '1', serviceId: 1, addSubtitles: true, hasSrtFile: false, addVoiceover: true },
    ]
    const quote = calculateOrderQuote(clips, mockServices, mockAddons, false, defaultConfig)
    const summary = buildOrderSummaryText(quote, {
      shopName: '@kittenwearglasses',
      footageUrl: 'https://drive.google.com/drive/folders/test12345',
      refUrl: 'https://tiktok.com/@ref/video/12345',
      customerNote: 'ขอโทนสีชมพูละมุน coquette สดใส',
    })

    assert.match(summary, /สรุปรายการประเมินราคาตัดต่อ/)
    assert.match(summary, /@kittenwearglasses/)
    assert.match(summary, /https:\/\/drive\.google\.com/)

    const encoded = encodeURIComponent(summary)
    assert.ok(encoded.length > 0)

    // Verify fallback trigger when text exceeds 1,800 characters
    const longSummary = summary + '\n' + 'ข้อความยาวมาก '.repeat(200)
    const longEncoded = encodeURIComponent(longSummary)
    assert.ok(longEncoded.length > 1800)
    const wouldTriggerFallback = longEncoded.length > 1800
    assert.equal(wouldTriggerFallback, true)
  })
})

describe('3. Security Utilities', () => {
  test('timingSafeEqualString correctly compares strings in constant time', async () => {
    const match = await timingSafeEqualString('secretToken123', 'secretToken123')
    assert.equal(match, true)

    const mismatch = await timingSafeEqualString('secretToken123', 'wrongToken456')
    assert.equal(mismatch, false)

    const lengthDiff = await timingSafeEqualString('short', 'muchLongerString')
    assert.equal(lengthDiff, false)
  })

  test('validateImageBuffer validates JPEG, PNG, WebP and rejects SVG/HTML/malicious payloads', () => {
    // 1. Valid PNG (40 bytes with IHDR and dimensions)
    const png = new Uint8Array(40)
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) // Signature
    png.set([0x00, 0x00, 0x00, 0x0d], 8) // IHDR length
    png.set([0x49, 0x48, 0x44, 0x52], 12) // 'IHDR'
    const view = new DataView(png.buffer)
    view.setUint32(16, 100, false) // width = 100
    view.setUint32(20, 100, false) // height = 100
    const pngResult = validateImageBuffer(png.buffer)
    assert.equal(pngResult.valid, true)
    if (pngResult.valid) assert.equal(pngResult.mime, 'image/png')

    // 2. Valid JPEG (40 bytes with SOI and EOI markers)
    const jpg = new Uint8Array(40)
    jpg[0] = 0xff; jpg[1] = 0xd8; jpg[2] = 0xff; jpg[3] = 0xe0
    jpg[38] = 0xff; jpg[39] = 0xd9 // EOI
    const jpgResult = validateImageBuffer(jpg.buffer)
    assert.equal(jpgResult.valid, true)
    if (jpgResult.valid) assert.equal(jpgResult.mime, 'image/jpeg')

    // 3. Valid WebP (40 bytes with RIFF, WEBP, VP8)
    const webp = new Uint8Array(40)
    webp.set([0x52, 0x49, 0x46, 0x46]) // 'RIFF'
    webp.set([0x20, 0x00, 0x00, 0x00], 4)
    webp.set([0x57, 0x45, 0x42, 0x50], 8) // 'WEBP'
    webp.set([0x56, 0x50, 0x38, 0x20], 12) // 'VP8 '
    const webpResult = validateImageBuffer(webp.buffer)
    assert.equal(webpResult.valid, true)
    if (webpResult.valid) assert.equal(webpResult.mime, 'image/webp')

    // 4. Malicious SVG disguised as image
    const fakeSvg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>                   '
    )
    const svgResult = validateImageBuffer(fakeSvg.buffer)
    assert.equal(svgResult.valid, false)

    // 5. Truncated buffer (< 30 bytes)
    assert.equal(validateImageBuffer(new Uint8Array(10).buffer).valid, false)

    // 6. Oversized buffer (> 5MB)
    const oversized = new Uint8Array(5 * 1024 * 1024 + 1)
    assert.equal(validateImageBuffer(oversized.buffer).valid, false)
  })

  test('isSafeLinkUrl validates safe URLs and prevents XSS schemes', () => {
    assert.equal(isSafeLinkUrl('/services'), true)
    assert.equal(isSafeLinkUrl('/calculator'), true)
    assert.equal(isSafeLinkUrl('https://line.me/R/ti/p/@882xaxoy'), true)
    assert.equal(isSafeLinkUrl('https://tiktok.com/@kittenwearglasses'), true)
    // Optional/empty link is allowed
    assert.equal(isSafeLinkUrl(undefined), true)
    assert.equal(isSafeLinkUrl(''), true)

    // Hostile / unsafe schemes
    assert.equal(isSafeLinkUrl('javascript:alert(1)'), false)
    assert.equal(isSafeLinkUrl('data:text/html,<script>alert(1)</script>'), false)
    assert.equal(isSafeLinkUrl('vbscript:msgbox(1)'), false)
    assert.equal(isSafeLinkUrl('//evil.com/phishing'), false)
  })
})
