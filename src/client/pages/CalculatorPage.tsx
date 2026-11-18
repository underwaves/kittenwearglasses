import React, { useEffect, useState, useMemo } from 'react'
import { getServices, Service, Addon } from '../utils/api'
import {
  ClipItemInput,
  calculateOrderQuote,
  formatPriceRange,
  buildOrderSummaryText,
  parsePriceRange,
  MAX_ALLOWED_CLIPS,
} from '../../shared/priceCalculator'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/Toast'
import { QueueBadge } from '../components/QueueBadge'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'
import {
  Calculator,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  MessageCircle,
  Zap,
  Clock,
  FileText,
  Mic,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react'

export const CalculatorPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)

  const [clips, setClips] = useState<ClipItemInput[]>([])
  const [isRush, setIsRush] = useState(false)
  const [footageUrl, setFootageUrl] = useState('')
  const [refUrl, setRefUrl] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [copied, setCopied] = useState(false)

  const { settings } = useSettings()
  const { showToast } = useToast()

  useEffect(() => {
    document.title = 'คำนวณราคาตัดต่อวิดีโอ | @kittenwearglasses'
  }, [])

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true)
        const data = await getServices()
        setServices(data.services)
        setAddons(data.addons)

        const defaultServiceId = data.services[0]?.id || 1
        setClips([
          {
            id: crypto.randomUUID(),
            serviceId: defaultServiceId,
            addSubtitles: false,
            hasSrtFile: false,
            addVoiceover: false,
          },
        ])
      } catch (err) {
        console.error('Failed to load pricing for calculator:', err)
        showToast('ไม่สามารถโหลดข้อมูลเรทราคาได้ กรุณาลองใหม่อีกครั้ง', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadPricing()
  }, [])

  const config = useMemo(() => {
    return {
      rushFeePercent: Number(settings.rush_fee_percent) || 50,
      depositPercent: Number(settings.deposit_percent) || 50,
      srtFeeFallback: Number(settings.srt_fee) || 50,
      srtMode: (settings.srt_mode === 'add' ? 'add' : 'replace') as 'replace' | 'add',
    }
  }, [settings])

  const quote = useMemo(() => {
    if (!clips || clips.length === 0 || !services || services.length === 0) {
      return {
        clips: [],
        subtotalMin: 0,
        subtotalMax: 0,
        isRush,
        rushFeePercent: config.rushFeePercent,
        rushFeeMin: 0,
        rushFeeMax: 0,
        totalMin: 0,
        totalMax: 0,
        depositPercent: isRush ? 100 : config.depositPercent,
        depositMin: 0,
        depositMax: 0,
        remainingMin: 0,
        remainingMax: 0,
      }
    }
    try {
      return calculateOrderQuote(clips, services, addons, isRush, config)
    } catch (err) {
      console.error('Calculation error:', err)
      return {
        clips: [],
        subtotalMin: 0,
        subtotalMax: 0,
        isRush,
        rushFeePercent: config.rushFeePercent,
        rushFeeMin: 0,
        rushFeeMax: 0,
        totalMin: 0,
        totalMax: 0,
        depositPercent: isRush ? 100 : config.depositPercent,
        depositMin: 0,
        depositMax: 0,
        remainingMin: 0,
        remainingMax: 0,
      }
    }
  }, [clips, services, addons, isRush, config])

  const summaryText = useMemo(() => {
    return buildOrderSummaryText(quote, {
      footageUrl,
      refUrl,
      customerNote,
      shopName: settings.shop_name || '@kittenwearglasses',
    })
  }, [quote, footageUrl, refUrl, customerNote, settings.shop_name])

  const handleAddClip = () => {
    if (clips.length >= MAX_ALLOWED_CLIPS) {
      showToast(
        `สามารถคำนวณราคาพร้อมกันได้สูงสุด ${MAX_ALLOWED_CLIPS} คลิปค่ะ หากต้องการมากกว่านี้สามารถทักสอบถามทาง LINE ได้เลยนะคะ 🎀`,
        'info'
      )
      return
    }
    const defaultServiceId = services[0]?.id || 1
    setClips((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        serviceId: defaultServiceId,
        addSubtitles: false,
        hasSrtFile: false,
        addVoiceover: false,
      },
    ])
  }

  const handleRemoveLastClip = () => {
    if (clips.length <= 1) return
    setClips((prev) => prev.slice(0, -1))
  }

  const handleRemoveSpecificClip = (id: string) => {
    if (clips.length <= 1) return
    setClips((prev) => prev.filter((c) => c.id !== id))
  }

  const updateClip = (id: string, patch: Partial<ClipItemInput>) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const next = { ...c, ...patch }
        if (!next.addSubtitles) {
          next.hasSrtFile = false
        }
        return next
      })
    )
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      showToast('คัดลอกข้อความสรุปออเดอร์เรียบร้อยแล้วค่ะ 🎀', 'success')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast('ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาคัดลอกจากกล่องข้อความด้านล่าง', 'error')
    }
  }

  const handleSendToLine = async () => {
    const rawLineId = (settings.line_id || '@882xaxoy').trim()
    const cleanLineId = rawLineId.startsWith('@') ? rawLineId : `@${rawLineId}`
    const fallbackLineUrl = settings.line_url || `https://line.me/R/ti/p/${cleanLineId}`

    try {
      // Always copy to clipboard first as a convenience backup
      await navigator.clipboard.writeText(summaryText).catch(() => {})

      const encoded = encodeURIComponent(summaryText)
      if (encoded.length > 1800) {
        showToast('คัดลอกข้อความสรุปให้แล้วค่ะ กำลังเปิดแชต LINE เพื่อกดวางส่งได้เลย', 'info')
        window.open(fallbackLineUrl, '_blank', 'noopener,noreferrer')
        return
      }

      const oaMessageUrl = `https://line.me/R/oaMessage/${cleanLineId}/?text=${encoded}`
      const win = window.open(oaMessageUrl, '_blank', 'noopener,noreferrer')
      if (!win) {
        window.location.href = oaMessageUrl
      } else {
        showToast('คัดลอกข้อความสรุปสำรองไว้ให้แล้ว กำลังเปิดแอป LINE ค่ะ ✨', 'success')
      }
    } catch {
      showToast('คัดลอกข้อความสรุปแล้ว กำลังเปิดหน้าแชต LINE ค่ะ', 'info')
      window.open(fallbackLineUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const isQueueClosed = settings.queue_status === 'closed'

  return (
    <div className="space-y-8 pt-2">
      {/* Page Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <Calculator size={12} />
          <span>Instant Price Estimator</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Price Calculator
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-xl mx-auto">
          คำนวณเรทราคาตัดต่อวิดีโอเบื้องต้นตามจำนวนคลิป ความยาว และบริการเสริม พร้อมสรุปออเดอร์ส่งเข้า LINE ได้ทันทีค่ะ 🎀
        </p>
      </div>

      {/* Queue Status Banner */}
      <div className="max-w-4xl mx-auto">
        <QueueBadge variant="card" />

        {isQueueClosed && (
          <div className="mt-3 p-4 rounded-2xl bg-coquette-roseBg border-2 border-coquette-rose text-coquette-crimson text-xs sm:text-sm flex items-start space-x-2.5 shadow-xs">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-coquette-rose" />
            <div>
              <strong className="font-bold block">ขณะนี้ทางร้านปิดรับคิวชั่วคราวค่ะ</strong>
              <span>
                คุณลูกค้ายังสามารถใช้เครื่องคิดราคาเพื่อประเมินงบประมาณเบื้องต้น และกดปุ่ม{' '}
                <strong>"สอบถามคิวทาง LINE"</strong> เพื่อจองคิวรอบถัดไปล่วงหน้าได้เลยนะคะ
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 coquette-card h-96 animate-pulse bg-coquette-roseBg/30" />
          <div className="lg:col-span-5 coquette-card h-96 animate-pulse bg-coquette-roseBg/30" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ==================================================== */}
          {/* LEFT COLUMN: CLIP BUILDER & OPTIONS                  */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Number of Clips Stepper */}
            <div className="coquette-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-coquette-rose block">
                    STEP 01
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-coquette-brown">
                    1. เลือกจำนวนคลิปที่ต้องการสั่งตัดต่อ
                  </h2>
                  <p className="text-xs text-coquette-brownMuted">
                    สามารถกำหนดความยาวและบริการเสริมแยกแต่ละคลิปได้อิสระ
                  </p>
                </div>

                <div className="inline-flex items-center space-x-3 bg-coquette-bgCream border-2 border-coquette-roseLight rounded-full p-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleRemoveLastClip}
                    disabled={clips.length <= 1}
                    aria-label="ลดจำนวนคลิป"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-coquette-roseLight text-coquette-brown hover:text-coquette-rose hover:border-coquette-rose disabled:opacity-40 flex items-center justify-center transition"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-3 text-base sm:text-lg font-extrabold text-coquette-rose min-w-[60px] text-center">
                    {clips.length} คลิป
                  </span>
                  <button
                    type="button"
                    onClick={handleAddClip}
                    disabled={clips.length >= MAX_ALLOWED_CLIPS}
                    aria-label="เพิ่มจำนวนคลิป"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-coquette-rose text-white hover:bg-coquette-roseDark disabled:opacity-40 flex items-center justify-center shadow-xs transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Individual Clip Cards */}
            <div className="space-y-4">
              {clips.map((clip, idx) => {
                const selectedService =
                  services.find((s) => s.id === clip.serviceId) || services[0]
                const clipBreakdown = quote.clips[idx]

                return (
                  <div
                    key={clip.id}
                    className="coquette-card p-5 sm:p-6 space-y-5 border-2 border-coquette-roseLight hover:border-coquette-rose/70 transition-colors"
                  >
                    {/* Clip Header */}
                    <div className="flex items-center justify-between border-b border-coquette-roseLight/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full bg-coquette-rose text-white text-xs font-bold shadow-2xs">
                          คลิปที่ {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-coquette-brown">
                          {selectedService?.title || 'ตัดต่อวิดีโอ'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {clipBreakdown && (
                          <span className="px-3 py-1 rounded-full bg-coquette-priceBlue/80 border border-coquette-priceBorder text-xs font-bold text-coquette-rose">
                            {formatPriceRange(clipBreakdown.clipTotalMin, clipBreakdown.clipTotalMax)}
                          </span>
                        )}
                        {clips.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecificClip(clip.id)}
                            aria-label={`ลบคลิปที่ ${idx + 1}`}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-coquette-brownMuted hover:text-coquette-crimson hover:bg-coquette-roseBg flex items-center justify-center transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2.1 Select Duration */}
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-coquette-brown">
                        ความยาวคลิปเสร็จสมบูรณ์:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {services.map((svc) => {
                          const isSelected = clip.serviceId === svc.id
                          const range = parsePriceRange(svc.price_label, svc.price_num)
                          return (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => updateClip(clip.id, { serviceId: svc.id })}
                              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-coquette-roseBg border-coquette-rose shadow-coquette-sm'
                                  : 'bg-coquette-bgCream/80 border-coquette-roseLight/70 hover:border-coquette-rose/50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs font-bold text-coquette-brown">
                                  {svc.duration_label}
                                </span>
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-coquette-rose text-white flex items-center justify-center">
                                    <Check size={10} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-extrabold text-coquette-rose">
                                {formatPriceRange(range.min, range.max)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 2.2 Subtitles Toggle + SRT Question */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-coquette-brown flex items-center space-x-1.5">
                            <FileText size={15} className="text-coquette-rose" />
                            <span>ใส่ซับไทย (Subtitles)</span>
                          </span>
                          <div className="inline-flex rounded-full bg-white border border-coquette-roseLight p-0.5">
                            <button
                              type="button"
                              onClick={() => updateClip(clip.id, { addSubtitles: false, hasSrtFile: false })}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                !clip.addSubtitles
                                  ? 'bg-coquette-brown text-white'
                                  : 'text-coquette-brownMuted hover:text-coquette-brown'
                              }`}
                            >
                              ไม่ใส่
                            </button>
                            <button
                              type="button"
                              onClick={() => updateClip(clip.id, { addSubtitles: true })}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                clip.addSubtitles
                                  ? 'bg-coquette-rose text-white'
                                  : 'text-coquette-brownMuted hover:text-coquette-rose'
                              }`}
                            >
                              ใส่ซับ
                            </button>
                          </div>
                        </div>

                        {/* Follow-up question if Subtitles enabled */}
                        {clip.addSubtitles && (
                          <div className="pt-2 border-t border-coquette-roseLight/60 space-y-1.5 animate-fade-in">
                            <span className="block text-[11px] font-semibold text-coquette-brown">
                              มีไฟล์ซับ .SRT มาให้ร้านไหมคะ?
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateClip(clip.id, { hasSrtFile: false })}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                                  !clip.hasSrtFile
                                    ? 'bg-coquette-roseBg border-coquette-rose text-coquette-rose'
                                    : 'bg-white border-coquette-roseLight/70 text-coquette-brownMuted'
                                }`}
                              >
                                ไม่มี (ให้ร้านแกะให้)
                              </button>
                              <button
                                type="button"
                                onClick={() => updateClip(clip.id, { hasSrtFile: true })}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                                  clip.hasSrtFile
                                    ? 'bg-coquette-priceBlue border-coquette-priceBorder text-coquette-rose'
                                    : 'bg-white border-coquette-roseLight/70 text-coquette-brownMuted'
                                }`}
                              >
                                มีไฟล์ .SRT (+{config.srtFeeFallback}฿)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2.3 Voiceover Toggle */}
                      <div className="p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-coquette-brown flex items-center space-x-1.5">
                            <Mic size={15} className="text-coquette-rose" />
                            <span>พากย์ไทย (Voiceover)</span>
                          </span>
                          <div className="inline-flex rounded-full bg-white border border-coquette-roseLight p-0.5">
                            <button
                              type="button"
                              onClick={() => updateClip(clip.id, { addVoiceover: false })}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                !clip.addVoiceover
                                  ? 'bg-coquette-brown text-white'
                                  : 'text-coquette-brownMuted hover:text-coquette-brown'
                              }`}
                            >
                              ไม่ใส่
                            </button>
                            <button
                              type="button"
                              onClick={() => updateClip(clip.id, { addVoiceover: true })}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                clip.addVoiceover
                                  ? 'bg-coquette-rose text-white'
                                  : 'text-coquette-brownMuted hover:text-coquette-rose'
                              }`}
                            >
                              พากย์เสียง
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-coquette-brownMuted mt-2">
                          {clip.addVoiceover && clipBreakdown
                            ? `คิดค่าพากย์เสียง +${clipBreakdown.voiceoverCost} บาท สำหรับคลิปนี้`
                            : 'เพิ่มเสียงพากย์บรรยายภาษาไทยโทนสดใสน่าฟัง'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={handleAddClip}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-coquette-roseLight hover:border-coquette-rose bg-white/70 hover:bg-coquette-roseBg/40 text-coquette-rose text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition"
              >
                <Plus size={16} />
                <span>เพิ่มคลิปอีก 1 รายการ</span>
              </button>
            </div>

            {/* Step 3: Rush Order Option */}
            <div className="coquette-card p-5 sm:p-6 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-coquette-rose block">
                  STEP 02
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-coquette-brown">
                  2. เลือกระยะเวลาจัดทำ (งานปกติ / งานด่วน)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRush(false)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    !isRush
                      ? 'bg-[#F2FBE9] border-[#5E8B34] shadow-xs'
                      : 'bg-coquette-bgCream border-coquette-roseLight/70 hover:border-coquette-rose/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-coquette-brown flex items-center space-x-1.5">
                      <Clock size={15} className="text-[#5E8B34]" />
                      <span>งานปกติ (2–4 วันทำการ)</span>
                    </span>
                    {!isRush && <Check size={16} className="text-[#5E8B34]" />}
                  </div>
                  <p className="text-xs text-coquette-brownMuted">
                    ชำระมัดจำ {config.depositPercent}% ก่อนเริ่มงาน และส่วนที่เหลือตอนอนุมัติ Draft
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRush(true)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    isRush
                      ? 'bg-coquette-roseBg border-coquette-rose shadow-coquette-sm'
                      : 'bg-coquette-bgCream border-coquette-roseLight/70 hover:border-coquette-rose/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-coquette-rose flex items-center space-x-1.5">
                      <Zap size={15} />
                      <span>งานด่วนพิเศษ (ภายใน 24 ชม.)</span>
                    </span>
                    {isRush && <Check size={16} className="text-coquette-rose" />}
                  </div>
                  <p className="text-xs text-coquette-brownMuted">
                    บวกค่าบริการด่วน +{config.rushFeePercent}% และชำระเต็มจำนวน 100% ก่อนเริ่มงาน
                  </p>
                </button>
              </div>
            </div>

            {/* Step 4: Optional Links */}
            <div className="coquette-card p-5 sm:p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-coquette-rose block">
                  STEP 03 (OPTIONAL)
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-coquette-brown">
                  3. แนบลิงก์ฟุตเทจและตัวอย่างสไตล์ (ไม่บังคับ)
                </h2>
                <p className="text-xs text-coquette-brownMuted">
                  ข้อมูลส่วนนี้จะถูกนำไปรวมในข้อความสรุปสำหรับส่ง LINE เท่านั้น ไม่มีการบันทึกลงฐานข้อมูลค่ะ
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1 flex items-center space-x-1">
                    <LinkIcon size={13} className="text-coquette-rose" />
                    <span>ลิงก์ฟุตเทจวิดีโอ (Google Drive)</span>
                  </label>
                  <input
                    type="url"
                    value={footageUrl}
                    onChange={(e) => setFootageUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-coquette-roseLight bg-coquette-bgCream/70 text-xs sm:text-sm focus:outline-none focus:border-coquette-rose"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1 flex items-center space-x-1">
                    <Sparkles size={13} className="text-coquette-rose" />
                    <span>ลิงก์ตัวอย่างสไตล์ที่ชอบ (Ref. TikTok / Reels / YouTube)</span>
                  </label>
                  <input
                    type="url"
                    value={refUrl}
                    onChange={(e) => setRefUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@.../video/..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-coquette-roseLight bg-coquette-bgCream/70 text-xs sm:text-sm focus:outline-none focus:border-coquette-rose"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1">
                    รายละเอียดเพิ่มเติม / โทนที่ต้องการ
                  </label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="เช่น โทนชมพูพาสเทล เน้นจังหวะสนุก ๆ..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-coquette-roseLight bg-coquette-bgCream/70 text-xs sm:text-sm focus:outline-none focus:border-coquette-rose"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: RECEIPT BREAKDOWN & SEND TO LINE       */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="coquette-card p-6 sm:p-7 space-y-5 border-2 border-coquette-rose shadow-coquette-lg relative overflow-hidden">
              <div className="absolute -top-2 -right-2 pointer-events-none opacity-80">
                <RibbonBow size={44} />
              </div>

              <div className="flex items-center space-x-2 border-b border-coquette-roseLight pb-3">
                <CloverLeaf size={22} />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-coquette-rose">
                    สรุปรายการประเมินราคา
                  </h3>
                  <p className="text-[11px] text-coquette-brownMuted">
                    อ้างอิงตามเรทราคาปัจจุบันของร้าน ({clips.length} คลิป)
                  </p>
                </div>
              </div>

              {/* Line-by-line Clip Breakdown */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {quote.clips.map((item) => (
                  <div
                    key={item.clipIndex}
                    className="p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-coquette-brown">
                      <span>
                        คลิปที่ {item.clipIndex}: {item.durationLabel}
                      </span>
                      <span className="text-coquette-rose">
                        {formatPriceRange(item.baseMin, item.baseMax)}
                      </span>
                    </div>

                    {item.subtitleCost > 0 && (
                      <div className="flex items-center justify-between text-coquette-brownMuted pl-2">
                        <span>• {item.subtitleLabel}</span>
                        <span>+{item.subtitleCost.toLocaleString('th-TH')} บาท</span>
                      </div>
                    )}

                    {item.voiceoverCost > 0 && (
                      <div className="flex items-center justify-between text-coquette-brownMuted pl-2">
                        <span>• {item.voiceoverLabel}</span>
                        <span>+{item.voiceoverCost.toLocaleString('th-TH')} บาท</span>
                      </div>
                    )}

                    {(item.subtitleCost > 0 || item.voiceoverCost > 0) && (
                      <div className="pt-1 border-t border-coquette-roseLight/40 flex items-center justify-between font-semibold text-coquette-brown">
                        <span>รวมคลิปที่ {item.clipIndex}</span>
                        <span>{formatPriceRange(item.clipTotalMin, item.clipTotalMax)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Rush Fee Line */}
              {quote.isRush && (
                <div className="p-3 rounded-2xl bg-coquette-roseBg border border-coquette-roseLight flex items-center justify-between text-xs font-bold text-coquette-rose">
                  <span className="flex items-center space-x-1">
                    <Zap size={14} />
                    <span>ค่าบริการงานด่วน 24 ชม. (+{quote.rushFeePercent}%)</span>
                  </span>
                  <span>+{formatPriceRange(quote.rushFeeMin, quote.rushFeeMax)}</span>
                </div>
              )}

              {/* Grand Total Box */}
              <div className="p-4 rounded-2xl bg-coquette-priceBlue/55 border-2 border-coquette-priceBorder space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs sm:text-sm font-bold text-coquette-brown">
                    ยอดรวมประเมินทั้งหมด
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-coquette-rose font-display">
                    {formatPriceRange(quote.totalMin, quote.totalMax)}
                  </span>
                </div>

                <div className="pt-2 border-t border-coquette-priceBorder/60 space-y-1 text-xs">
                  {quote.isRush ? (
                    <div className="flex items-center justify-between font-bold text-coquette-crimson">
                      <span>ชำระก่อนเริ่มงาน (งานด่วน 100%):</span>
                      <span>{formatPriceRange(quote.depositMin, quote.depositMax)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between font-bold text-coquette-brown">
                        <span>ยอดมัดจำก่อนเริ่มงาน ({quote.depositPercent}%):</span>
                        <span className="text-coquette-rose">
                          {formatPriceRange(quote.depositMin, quote.depositMax)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-coquette-brownMuted">
                        <span>ชำระส่วนที่เหลือตอนอนุมัติ Draft ({100 - quote.depositPercent}%):</span>
                        <span>{formatPriceRange(quote.remainingMin, quote.remainingMax)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start space-x-2 text-[11px] text-coquette-brownMuted leading-relaxed bg-coquette-bgCream/80 p-3 rounded-xl border border-coquette-roseLight/50">
                <Info size={14} className="text-coquette-rose flex-shrink-0 mt-0.5" />
                <span>
                  ราคาจริงขึ้นอยู่กับความซับซ้อนและรายละเอียด ร้านจะยืนยันอีกครั้งทาง LINE
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSendToLine}
                  className="w-full py-3.5 px-5 rounded-full bg-[#06C755] hover:bg-[#05a948] text-white font-bold text-sm sm:text-base shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={19} />
                  <span>{isQueueClosed ? 'สอบถามคิวทาง LINE' : 'ส่งให้ร้านทาง LINE'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full py-3 px-5 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-coquette-rose font-bold text-xs sm:text-sm transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-[#5E8B34]" />
                      <span className="text-[#5E8B34]">คัดลอกข้อความสรุปเรียบร้อยแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>คัดลอกข้อความสรุป</span>
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Preview of Text */}
              <details className="text-xs text-coquette-brownMuted pt-1">
                <summary className="cursor-pointer font-semibold hover:text-coquette-rose select-none">
                  ดูตัวอย่างข้อความที่จะส่งให้ร้าน
                </summary>
                <pre className="mt-2 p-3 rounded-xl bg-coquette-bgCream border border-coquette-roseLight/70 text-[11px] text-coquette-brown whitespace-pre-wrap font-prompt leading-relaxed">
                  {summaryText}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
