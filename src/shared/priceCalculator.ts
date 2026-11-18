export interface Service {
  id: number
  title?: string
  duration_label?: string
  price_label?: string
  price_num?: number
  [key: string]: any
}

export interface Addon {
  id: number
  category?: string
  name: string
  price_label?: string
  price_num?: number
  [key: string]: any
}

export interface ClipItemInput {
  id: string
  serviceId: number // ID of selected service from D1 services table
  addSubtitles: boolean
  hasSrtFile: boolean
  addVoiceover: boolean
}

export interface CalculatorConfig {
  rushFeePercent: number // default 50
  depositPercent: number // default 50
  srtFeeFallback: number // default 50
  srtMode: 'replace' | 'add' // default 'replace' (เมื่อมีไฟล์ .SRT คิดเรทนำเข้า .SRT +50 บาทแทนเรทแกะซับ)
}

export interface ClipBreakdownItem {
  clipIndex: number
  serviceTitle: string
  durationLabel: string
  baseMin: number
  baseMax: number
  subtitleCost: number
  subtitleLabel: string
  voiceoverCost: number
  voiceoverLabel: string
  clipTotalMin: number
  clipTotalMax: number
}

export interface CalculationResult {
  clips: ClipBreakdownItem[]
  subtotalMin: number
  subtotalMax: number
  isRush: boolean
  rushFeePercent: number
  rushFeeMin: number
  rushFeeMax: number
  totalMin: number
  totalMax: number
  depositPercent: number
  depositMin: number
  depositMax: number
  remainingMin: number
  remainingMax: number
}

export const MAX_ALLOWED_CLIPS = 50

/**
 * Parses a price label like "300", "400–800", "900–1,000" into { min, max }
 */
export function parsePriceRange(priceLabel?: string | null, fallbackNum = 0): { min: number; max: number } {
  if (!priceLabel || typeof priceLabel !== 'string') return { min: fallbackNum, max: fallbackNum }
  const cleaned = priceLabel.replace(/,/g, '')
  const matches = cleaned.match(/\d+(\.\d+)?/g)
  if (!matches || matches.length === 0) {
    return { min: fallbackNum, max: fallbackNum }
  }
  if (matches.length === 1) {
    const val = Math.round(Number(matches[0]))
    return { min: val, max: val }
  }
  const min = Math.round(Number(matches[0]))
  const max = Math.round(Number(matches[1]))
  return { min: Math.min(min, max), max: Math.max(min, max) }
}

/**
 * Formats a min-max range nicely in Thai Baht (e.g. "300 บาท" or "800–1,600 บาท")
 */
export function formatPriceRange(min: number, max: number, includeUnit = true): string {
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const suffix = includeUnit ? ' บาท' : ''
  if (min === max) {
    return `${fmt(min)}${suffix}`
  }
  return `${fmt(min)}–${fmt(max)}${suffix}`
}

/**
 * Matches an addon price from D1 addons table by category and duration tier index
 */
function findAddonPrice(
  addons: Addon[],
  category: 'subtitles' | 'voiceover',
  serviceIndex: number,
  durationLabel: string
): { price: number; name: string } {
  const categoryAddons = addons.filter(
    (a) => a.category === category && !a.name.toLowerCase().includes('srt')
  )

  // Match by duration keywords
  const matchedByKeyword = categoryAddons.find((a) => {
    if (durationLabel.includes('1–3') || durationLabel.includes('1-3')) {
      return a.name.includes('1–3') || a.name.includes('1-3')
    }
    if (durationLabel.includes('3–5') || durationLabel.includes('3-5')) {
      return a.name.includes('3–5') || a.name.includes('3-5')
    }
    if (durationLabel.includes('ไม่เกิน 1')) {
      return a.name.includes('ไม่เกิน 1')
    }
    return false
  })

  const chosen = matchedByKeyword || categoryAddons[serviceIndex] || categoryAddons[0]
  if (chosen) {
    const parsed = parsePriceRange(chosen.price_label, chosen.price_num)
    return { price: parsed.min, name: chosen.name }
  }

  // Fallback defaults if addons table is empty in initial bootstrap
  if (category === 'subtitles') {
    const defaults = [100, 150, 200]
    return { price: defaults[serviceIndex] ?? 100, name: `ซับไทย (${durationLabel})` }
  } else {
    const defaults = [150, 200, 250]
    return { price: defaults[serviceIndex] ?? 150, name: `พากย์ไทย (${durationLabel})` }
  }
}

function findSrtAddonPrice(addons: Addon[], fallback: number): number {
  const srtAddon = addons.find((a) => a.name.toLowerCase().includes('srt'))
  if (srtAddon) {
    return parsePriceRange(srtAddon.price_label, srtAddon.price_num).min
  }
  return fallback
}

/**
 * Calculates total price quote for video editing clips.
 * Rejects empty clips, clips > 50, and invalid service IDs.
 */
export function calculateOrderQuote(
  clips: ClipItemInput[],
  services: Service[],
  addons: Addon[],
  isRush: boolean,
  config: CalculatorConfig
): CalculationResult {
  if (!Array.isArray(clips) || clips.length < 1) {
    throw new Error('ต้องมีรายการคลิปอย่างน้อย 1 คลิปสำหรับการคำนวณราคา')
  }

  if (clips.length > MAX_ALLOWED_CLIPS) {
    throw new Error(`จำนวนคลิปต้องไม่เกิน ${MAX_ALLOWED_CLIPS} คลิป`)
  }

  const srtUnitFee = findSrtAddonPrice(addons, config.srtFeeFallback)

  const clipBreakdowns: ClipBreakdownItem[] = clips.map((clip, idx) => {
    const service = services.find((s) => s.id === clip.serviceId)
    if (!service) {
      throw new Error(`ไม่พบแพ็กเกจบริการรหัส ${clip.serviceId} ในระบบ กรุณาเลือกแพ็กเกจที่ถูกต้อง`)
    }

    const effectiveServiceIdx = Math.max(0, services.indexOf(service))
    const baseRange = parsePriceRange(service.price_label, service.price_num)
    const durationLabel = service.duration_label || 'ไม่เกิน 1 นาที'
    const serviceTitle = service.title || 'ตัดต่อวิดีโอ'

    let subtitleCost = 0
    let subtitleLabel = 'ไม่ใส่ซับไทย'

    if (clip.addSubtitles) {
      const subAddon = findAddonPrice(addons, 'subtitles', effectiveServiceIdx, durationLabel)
      if (clip.hasSrtFile) {
        // Business logic check: current mode is 'replace' (charge +50 instead of full manual subbing fee)
        if (config.srtMode === 'add') {
          subtitleCost = subAddon.price + srtUnitFee
          subtitleLabel = `ซับไทย (${durationLabel} + มีไฟล์ .SRT)`
        } else {
          subtitleCost = srtUnitFee
          subtitleLabel = 'ซับไทย (ลูกค้ามีไฟล์ .SRT มาให้)'
        }
      } else {
        subtitleCost = subAddon.price
        subtitleLabel = `ซับไทย (${durationLabel})`
      }
    }

    let voiceoverCost = 0
    let voiceoverLabel = 'ไม่พากย์เสียง'
    if (clip.addVoiceover) {
      const voAddon = findAddonPrice(addons, 'voiceover', effectiveServiceIdx, durationLabel)
      voiceoverCost = voAddon.price
      voiceoverLabel = `พากย์ไทย (${durationLabel})`
    }

    const clipTotalMin = baseRange.min + subtitleCost + voiceoverCost
    const clipTotalMax = baseRange.max + subtitleCost + voiceoverCost

    return {
      clipIndex: idx + 1,
      serviceTitle,
      durationLabel,
      baseMin: baseRange.min,
      baseMax: baseRange.max,
      subtitleCost,
      subtitleLabel,
      voiceoverCost,
      voiceoverLabel,
      clipTotalMin,
      clipTotalMax,
    }
  })

  const subtotalMin = clipBreakdowns.reduce((acc, c) => acc + c.clipTotalMin, 0)
  const subtotalMax = clipBreakdowns.reduce((acc, c) => acc + c.clipTotalMax, 0)

  const rushFeePercent = config.rushFeePercent || 50
  const rushFeeMin = isRush ? Math.round((subtotalMin * rushFeePercent) / 100) : 0
  const rushFeeMax = isRush ? Math.round((subtotalMax * rushFeePercent) / 100) : 0

  const totalMin = subtotalMin + rushFeeMin
  const totalMax = subtotalMax + rushFeeMax

  const depositPercent = isRush ? 100 : config.depositPercent || 50
  const depositMin = Math.round((totalMin * depositPercent) / 100)
  const depositMax = Math.round((totalMax * depositPercent) / 100)

  const remainingMin = totalMin - depositMin
  const remainingMax = totalMax - depositMax

  return {
    clips: clipBreakdowns,
    subtotalMin,
    subtotalMax,
    isRush,
    rushFeePercent,
    rushFeeMin,
    rushFeeMax,
    totalMin,
    totalMax,
    depositPercent,
    depositMin,
    depositMax,
    remainingMin,
    remainingMax,
  }
}

export function buildOrderSummaryText(
  result: CalculationResult,
  options: {
    footageUrl?: string
    refUrl?: string
    customerNote?: string
    shopName?: string
  }
): string {
  const lines: string[] = []
  lines.push(`🎀 สรุปรายการประเมินราคาตัดต่อ (${options.shopName || '@kittenwearglasses'})`)
  lines.push(`จำนวนทั้งหมด: ${result.clips.length} คลิป`)
  lines.push(`──────────────────`)

  for (const clip of result.clips) {
    lines.push(
      `🎬 คลิปที่ ${clip.clipIndex}: ${clip.durationLabel} (${formatPriceRange(clip.baseMin, clip.baseMax)})`
    )
    if (clip.subtitleCost > 0) {
      lines.push(`   • ${clip.subtitleLabel}: +${clip.subtitleCost.toLocaleString('th-TH')} บาท`)
    }
    if (clip.voiceoverCost > 0) {
      lines.push(`   • ${clip.voiceoverLabel}: +${clip.voiceoverCost.toLocaleString('th-TH')} บาท`)
    }
  }

  lines.push(`──────────────────`)
  lines.push(`ยอดรวมตัดต่อ: ${formatPriceRange(result.subtotalMin, result.subtotalMax)}`)

  if (result.isRush) {
    lines.push(
      `⚡ บริการงานด่วน 24 ชม. (+${result.rushFeePercent}%): +${formatPriceRange(
        result.rushFeeMin,
        result.rushFeeMax
      )}`
    )
    lines.push(`ยอดรวมทั้งสิ้น (ชำระเต็มจำนวน 100%): ${formatPriceRange(result.totalMin, result.totalMax)}`)
  } else {
    lines.push(`ยอดรวมประเมิน: ${formatPriceRange(result.totalMin, result.totalMax)}`)
    lines.push(`มัดจำล็อกคิว (${result.depositPercent}%): ${formatPriceRange(result.depositMin, result.depositMax)}`)
    lines.push(
      `ชำระส่วนที่เหลือตอนอนุมัติ Draft (${100 - result.depositPercent}%): ${formatPriceRange(
        result.remainingMin,
        result.remainingMax
      )}`
    )
  }

  if (options.footageUrl?.trim()) {
    lines.push(`📁 ลิงก์ฟุตเทจ (Google Drive): ${options.footageUrl.trim()}`)
  }
  if (options.refUrl?.trim()) {
    lines.push(`✨ ลิงก์ตัวอย่าง Ref.: ${options.refUrl.trim()}`)
  }
  if (options.customerNote?.trim()) {
    lines.push(`📝 รายละเอียดเพิ่มเติม: ${options.customerNote.trim()}`)
  }

  lines.push(`──────────────────`)
  lines.push(`* ราคาจริงขึ้นอยู่กับความซับซ้อนและรายละเอียด ร้านจะยืนยันอีกครั้งทาง LINE นะคะ 🎀`)

  return lines.join('\n')
}
