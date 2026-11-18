import React, { useEffect, useState } from 'react'
import {
  adminGetSettings,
  adminUpdateSettings,
  adminUploadImage,
  adminUpdateQueue,
} from '../../utils/api'
import { optimizeImage } from '../../utils/imageOptimizer'
import { useToast } from '../../components/Toast'
import { useSettings } from '../../context/SettingsContext'
import {
  Settings,
  Save,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calculator,
  Music,
  Play,
  Volume2,
} from 'lucide-react'

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    shop_name: '@kittenwearglasses',
    shop_tagline: '',
    hero_description: '',
    announcement: '',
    tiktok_url: 'https://www.tiktok.com/@kittenwearglasses',
    line_id: '@882xaxoy',
    line_url: 'https://line.me/R/ti/p/@882xaxoy',
    shop_logo: '',
    queue_status: 'open',
    queue_note: 'คิวว่างพร้อมเริ่มงานทันที ทักส่งบรีฟได้ตลอดเลยค่ะ 🎀',
    queue_updated_at: '',
    rush_fee_percent: '50',
    deposit_percent: '50',
    srt_fee: '50',
    srt_mode: 'replace',
    paws_enabled: '1',
    floating_menu_enabled: '1',
    bg_music_youtube_url: '',
    bg_music_enabled: '1',
    bg_music_title: 'เพลงบรรเลงน่ารัก คลอเบาๆ 🎀',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { showToast } = useToast()
  const { refreshSettings } = useSettings()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await adminGetSettings()
        setSettings((prev) => ({ ...prev, ...data }))
      } catch {
        showToast('ไม่สามารถโหลดการตั้งค่าได้', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }))
  }

  // One-click Queue Status update
  const handleQuickQueueStatus = async (newStatus: 'open' | 'filling' | 'closed') => {
    let nextNote = settings.queue_note || ''
    if (newStatus === 'open' && (!nextNote || nextNote.includes('ปิด') || nextNote.includes('แน่น') || nextNote.includes('เต็ม'))) {
      nextNote = 'คิวว่างพร้อมเริ่มงานทันที ทักส่งบรีฟได้ตลอดเลยค่ะ 🎀'
    } else if (newStatus === 'filling' && (!nextNote || nextNote.includes('ว่าง') || nextNote.includes('ปิด'))) {
      nextNote = 'คิวเริ่มแน่นแล้วค่ะ ทักจองคิวล่วงหน้าได้นะคะ 🎀'
    } else if (newStatus === 'closed' && (!nextNote || nextNote.includes('ว่าง') || nextNote.includes('แน่น'))) {
      nextNote = 'ปิดรับคิวงานชั่วคราว สอบถามคิวล่วงหน้าได้ค่ะ 🎀'
    }
    setSettings((prev) => ({ ...prev, queue_status: newStatus, queue_note: nextNote }))
    try {
      const res = await adminUpdateQueue({
        queue_status: newStatus,
        queue_note: nextNote,
      })
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          queue_status: newStatus,
          queue_note: nextNote,
          queue_updated_at: res.data!.queue_updated_at,
        }))
        await refreshSettings()
        showToast('อัปเดตสถานะคิวงานเรียบร้อยแล้วค่ะ 🎀', 'success')
      }
    } catch {
      showToast('ไม่สามารถอัปเดตสถานะคิวได้', 'error')
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingLogo(true)
      showToast('กำลังย่อขนาดภาพโลโก้...', 'info')
      const optimized = await optimizeImage(file, 512, 0.9)

      showToast('กำลังอัปโหลดไปยัง Cloudflare R2...', 'info')
      const res = await adminUploadImage(optimized)

      if (res.success && res.url) {
        setSettings((prev) => ({ ...prev, shop_logo: res.url! }))
        showToast('อัปโหลดภาพโลโก้ร้านเรียบร้อยแล้วค่ะ 🎀', 'success')
      } else {
        showToast(res.error || 'อัปโหลดภาพไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอัปโหลดภาพ', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, shop_logo: '' }))
    showToast('เปลี่ยนกลับไปใช้ไอคอนเริ่มต้นแล้วค่ะ', 'info')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const payload = {
        ...settings,
        queue_updated_at: today,
      }
      const res = await adminUpdateSettings(payload)
      if (res.success) {
        setSettings(payload)
        showToast('บันทึกการตั้งค่าเว็บไซต์สำเร็จเรียบร้อยค่ะ 🎀', 'success')
        await refreshSettings()
      } else {
        showToast(res.error || 'บันทึกไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="coquette-card p-12 text-center text-coquette-brownMuted">
        กำลังโหลดการตั้งค่า...
      </div>
    )
  }

  const logoPreviewSrc = settings.shop_logo
    ? settings.shop_logo.startsWith('http')
      ? settings.shop_logo
      : `/media/${settings.shop_logo.replace(/^\/media\//, '')}`
    : ''

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
          <Settings size={24} />
          <span>ตั้งค่าเว็บไซต์ (Site Settings)</span>
        </h2>
        <p className="text-xs sm:text-sm text-coquette-brownMuted">
          ปรับแต่งสถานะคิวงาน รูปโลโก้ร้าน กติกาเครื่องคิดราคา และลิงก์ช่องทางติดต่อทั้งหมด
        </p>
      </div>

      <form onSubmit={handleSubmit} className="coquette-card p-6 sm:p-8 space-y-6">
        {/* 1. ONE-CLICK QUEUE STATUS SWITCHER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-coquette-bgCream border-2 border-coquette-roseLight space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-bold text-coquette-rose">
              สถานะคิวงานปัจจุบัน (คลิกเดียวเปลี่ยนทันที)
            </label>
            {settings.queue_updated_at && (
              <span className="text-[11px] text-coquette-brownMuted">
                อัปเดตล่าสุด: {settings.queue_updated_at}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'open' as const,
                label: 'เปิดรับงาน',
                icon: CheckCircle2,
                activeClass: 'bg-[#EEF9E1] border-[#5E8B34] text-[#3B6218]',
              },
              {
                id: 'filling' as const,
                label: 'คิวเริ่มเต็ม',
                icon: Clock,
                activeClass: 'bg-[#FFF8DB] border-[#E5A000] text-[#7A5800]',
              },
              {
                id: 'closed' as const,
                label: 'ปิดรับชั่วคราว',
                icon: AlertCircle,
                activeClass: 'bg-coquette-roseBg border-coquette-rose text-coquette-crimson',
              },
            ].map((q) => {
              const Icon = q.icon
              const active = settings.queue_status === q.id
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleQuickQueueStatus(q.id)}
                  className={`p-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    active
                      ? q.activeClass
                      : 'bg-white border-coquette-roseLight/70 text-coquette-brownMuted hover:text-coquette-brown'
                  }`}
                >
                  <Icon size={15} />
                  <span>{q.label}</span>
                </button>
              )
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-coquette-brown mb-1">
              ข้อความเสริมสถานะคิว (เช่น "คิวถัดไปว่างวันที่ 25")
            </label>
            <input
              type="text"
              value={settings.queue_note || ''}
              onChange={(e) => handleChange('queue_note', e.target.value)}
              placeholder="เช่น คิวถัดไปว่างวันที่ 25 ทักสอบถามได้ค่ะ"
              className="w-full px-3.5 py-2 rounded-xl border border-coquette-roseLight bg-white text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* 2. SHOP LOGO / AVATAR UPLOAD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-coquette-bgCream/80 border border-coquette-roseLight space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-coquette-rose">
            รูปภาพโลโก้ร้าน / รูปโปรไฟล์ (Shop Logo)
          </label>
          <p className="text-xs text-coquette-brownMuted">
            รูปจะแสดงที่แถบด้านบน (Navbar) และกรอบโปรไฟล์หน้าแรก
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="relative w-20 h-20 rounded-full border-2 border-coquette-rose bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreviewSrc ? (
                <img
                  src={logoPreviewSrc}
                  alt="Shop Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-14 h-14">
                  <circle cx="50" cy="50" r="48" fill="#FFFBF0" />
                  <polygon points="26,38 18,18 42,26" fill="#F9C6DA" stroke="#E8607E" strokeWidth="3" />
                  <polygon points="74,38 82,18 58,26" fill="#F9C6DA" stroke="#E8607E" strokeWidth="3" />
                  <circle cx="50" cy="56" r="30" fill="#FFFBF0" />
                  <circle cx="38" cy="52" r="10" fill="none" stroke="#4A3428" strokeWidth="3.5" />
                  <circle cx="62" cy="52" r="10" fill="none" stroke="#4A3428" strokeWidth="3.5" />
                  <line x1="48" y1="52" x2="52" y2="52" stroke="#4A3428" strokeWidth="3.5" />
                  <circle cx="38" cy="52" r="3.5" fill="#4A3428" />
                  <circle cx="62" cy="52" r="3.5" fill="#4A3428" />
                  <polygon points="50,60 46,57 54,57" fill="#E8607E" />
                  <path d="M47,63 Q50,66 53,63" stroke="#4A3428" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-full bg-coquette-rose text-white text-xs font-semibold shadow hover:bg-coquette-roseDark transition flex items-center space-x-1.5">
                  <Upload size={14} />
                  <span>{uploadingLogo ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพโลโก้'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>

                {settings.shop_logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-2 rounded-full bg-white text-coquette-rose border border-coquette-rose text-xs font-semibold hover:bg-coquette-roseBg transition"
                  >
                    ใช้ไอคอนเริ่มต้น
                  </button>
                )}
              </div>
              <span className="text-[11px] text-coquette-brownMuted block">
                รองรับไฟล์ภาพ JPG, PNG, WebP (ระบบจะย่อขนาดให้อัตโนมัติและเก็บใน Cloudflare R2)
              </span>
            </div>
          </div>
        </div>

        {/* 3. CALCULATOR CONFIG */}
        <div className="p-4 sm:p-5 rounded-2xl bg-coquette-priceBlue/30 border border-coquette-priceBorder space-y-3">
          <div className="flex items-center space-x-1.5 text-coquette-rose font-bold text-xs sm:text-sm">
            <Calculator size={16} />
            <span>ตั้งค่ากติกาเครื่องคิดราคา (/calculator)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                ค่าบริการงานด่วน (%)
              </label>
              <input
                type="number"
                value={settings.rush_fee_percent || '50'}
                onChange={(e) => handleChange('rush_fee_percent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                สัดส่วนเงินมัดจำงานปกติ (%)
              </label>
              <input
                type="number"
                value={settings.deposit_percent || '50'}
                onChange={(e) => handleChange('deposit_percent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                เรทกรณีมีไฟล์ .SRT (บาท/คลิป)
              </label>
              <input
                type="number"
                value={settings.srt_fee || '50'}
                onChange={(e) => handleChange('srt_fee', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* 4. VISUAL EFFECTS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-coquette-bgCream/80 border border-coquette-roseLight space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-coquette-rose">
            เอฟเฟกต์ตกแต่งหน้าเว็บ (Decorations & Effects)
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paws_enabled !== '0'}
              onChange={(e) => handleChange('paws_enabled', e.target.checked ? '1' : '0')}
              className="w-4 h-4 text-coquette-rose rounded border-coquette-roseLight focus:ring-coquette-rose"
            />
            <span className="text-xs sm:text-sm text-coquette-brown font-medium">
              เปิดเอฟเฟกต์รอยเท้าน้องแมว (Paw Trail) ตามเคอร์เซอร์เมาส์บนหน้าเว็บ
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={settings.floating_menu_enabled !== '0'}
              onChange={(e) => handleChange('floating_menu_enabled', e.target.checked ? '1' : '0')}
              className="w-4 h-4 text-coquette-rose rounded border-coquette-roseLight focus:ring-coquette-rose"
            />
            <span className="text-xs sm:text-sm text-coquette-brown font-medium">
              เปิดแถบไอคอนลอยแนวตั้งด้านขวา (Floating Icon Menu) สำหรับนำทางหน้าเว็บ
            </span>
          </label>
          <span className="text-[11px] text-coquette-brownMuted block">
            หมายเหตุ: ระบบจะปิดเอฟเฟกต์นี้อัตโนมัติเมื่อผู้ใช้เปิดโหมด prefers-reduced-motion หรือสลับแท็บเพื่อประหยัดแบตเตอรี่
          </span>
        </div>

        {/* 5. BACKGROUND MUSIC (YOUTUBE) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-coquette-roseBg/50 border border-coquette-roseLight space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-coquette-rose font-bold text-xs sm:text-sm">
              <Music size={17} />
              <span>เพลงพื้นหลังเว็บไซต์ (Background Music จาก YouTube)</span>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bg_music_autoplay !== '0'}
                  onChange={(e) => handleChange('bg_music_autoplay', e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-coquette-rose rounded border-coquette-roseLight focus:ring-coquette-rose"
                />
                <span className="text-xs font-medium text-coquette-brown">
                  เล่นออโต้ (Autoplay)
                </span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bg_music_enabled !== '0'}
                  onChange={(e) => handleChange('bg_music_enabled', e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-coquette-rose rounded border-coquette-roseLight focus:ring-coquette-rose"
                />
                <span className="text-xs font-semibold text-coquette-brown">
                  {settings.bg_music_enabled !== '0' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </label>
            </div>
          </div>

          <p className="text-xs text-coquette-brownMuted leading-relaxed">
            ผู้เข้าชมจะสามารถฟังเพลงคลอเบา ๆ สไตล์ Coquette ผ่านวิดเจ็ตเครื่องเล่นเพลงรูปแผ่นเสียงน่ารักที่มุมจอได้ตลอดการเยี่ยมชมเว็บไซต์
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                ลิงก์วิดีโอ YouTube หรือ YouTube Shorts (URL หรือ Video ID)
              </label>
              <input
                type="text"
                value={settings.bg_music_youtube_url || ''}
                onChange={(e) => handleChange('bg_music_youtube_url', e.target.value)}
                placeholder="เช่น https://www.youtube.com/watch?v=jfKfPfyJRdk หรือ https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coquette-rose"
              />
              <span className="text-[11px] text-coquette-brownMuted block mt-1">
                * รองรับทุกลิงก์ของ YouTube (youtube.com/watch?v=, youtu.be/, shorts หรือใส่เฉพาะ Video ID ก็ได้ค่ะ)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                ชื่อเพลง / ข้อความแสดงบนเครื่องเล่นเพลง
              </label>
              <input
                type="text"
                value={settings.bg_music_title || ''}
                onChange={(e) => handleChange('bg_music_title', e.target.value)}
                placeholder="เช่น เพลงบรรเลงน่ารัก คลอเบาๆ 🎀 หรือ Lofi Coquette Vibe"
                className="w-full px-3.5 py-2 rounded-xl border border-coquette-roseLight bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-coquette-rose"
              />
            </div>
          </div>
        </div>

        {/* 6. GENERAL SHOP TEXT & LINKS */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-coquette-brown mb-1">
            ชื่อร้าน (Shop Name)
          </label>
          <input
            type="text"
            value={settings.shop_name}
            onChange={(e) => handleChange('shop_name', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight outline-none focus:ring-2 focus:ring-coquette-rose text-sm font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-coquette-brown mb-1">
            ป้ายข้อความต้อนรับใน Hero หน้าแรก
          </label>
          <input
            type="text"
            value={settings.announcement}
            onChange={(e) => handleChange('announcement', e.target.value)}
            placeholder="เช่น เปิดรับคิวตัดต่อประจำเดือนนี้ ✦"
            className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight outline-none focus:ring-2 focus:ring-coquette-rose text-sm"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-coquette-brown mb-1">
            ข้อความแนะนำร้านในหน้าแรก (Hero Intro)
          </label>
          <textarea
            rows={3}
            value={settings.hero_description}
            onChange={(e) => handleChange('hero_description', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight outline-none focus:ring-2 focus:ring-coquette-rose text-sm leading-relaxed"
          />
        </div>

        <div className="border-t border-coquette-roseLight/50 pt-4 space-y-4">
          <h4 className="font-bold text-coquette-rose text-sm">
            ลิงก์ช่องทางการติดต่อ
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                LINE ID (เช่น @882xaxoy)
              </label>
              <input
                type="text"
                value={settings.line_id}
                onChange={(e) => handleChange('line_id', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-coquette-roseLight outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-coquette-brown mb-1">
                LINE Add Link (ลิงก์เพิ่มเพื่อน)
              </label>
              <input
                type="url"
                value={settings.line_url}
                onChange={(e) => handleChange('line_url', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-coquette-roseLight outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-coquette-brown mb-1">
              TikTok URL (ลิงก์ช่อง TikTok)
            </label>
            <input
              type="url"
              value={settings.tiktok_url}
              onChange={(e) => handleChange('tiktok_url', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-coquette-roseLight outline-none text-sm"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="btn-coquette-rose px-7 py-3 rounded-full text-sm font-semibold flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
