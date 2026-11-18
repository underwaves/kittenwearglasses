import React, { useState } from 'react'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { MessageCircle, Copy, Check, ExternalLink, Sparkles } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useSettings } from '../context/SettingsContext'
import { QueueBadge } from '../components/QueueBadge'

export const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const { settings } = useSettings()

  React.useEffect(() => {
    document.title = 'ติดต่อเรา & เช็กคิวงาน | @kittenwearglasses'
  }, [])

  const shopName = settings.shop_name || '@kittenwearglasses'
  const lineId = settings.line_id || '@882xaxoy'
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@882xaxoy'
  const tiktokUrl = settings.tiktok_url || 'https://www.tiktok.com/@kittenwearglasses'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lineId)
    setCopied(true)
    showToast(`คัดลอกไอดี LINE: ${lineId} เรียบร้อยแล้ว`, 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto pt-2">
      {/* Page Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <StarSparkle size={11} />
          <span>Get In Touch</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Contact Us
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-md mx-auto">
          พร้อมเนรมิตคลิปของคุณให้น่ารักโดดเด่น ทักมาปรึกษา สอบถามคิวงาน หรือส่งตัวอย่างมาประเมินราคาก่อนได้เลยค่ะ 🎀
        </p>
      </div>

      {/* Live Queue Status Card */}
      <QueueBadge variant="card" />

      {/* Main Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LINE OA Card */}
        <div className="coquette-card coquette-card-hover p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-3 right-4 opacity-40">
            <CloverLeaf size={32} />
          </div>

          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#06C755] text-white flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-[#06C755]/15">
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path
                  d="M50 18C29.5 18 13 31.4 13 48C13 62.8 26.1 75.2 43.8 77.6C45.3 77.9 47.3 78.6 47.8 79.8C48.3 80.9 48.1 82.6 47.9 83.8L47.2 87.9C46.9 89.4 46.1 93.2 51.8 90.7C57.5 88.2 82.2 72.8 83.2 71.6C85.8 68.7 87 58.6 87 48C87 31.4 70.5 18 50 18Z"
                  fill="#FFFFFF"
                />
                <g stroke="#06C755" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M27 41V55H35" />
                  <path d="M42 41V55" />
                  <path d="M49 55V41L59 55V41" />
                  <path d="M74 41H66V55H74M66 48H72.5" />
                </g>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-coquette-brown mb-1">
              LINE Official Account
            </h3>
            <p className="text-xs sm:text-sm text-coquette-brownMuted mb-5">
              ช่องทางหลักในการสั่งงาน สอบถามคิว และส่งมอบไฟล์
            </p>

            {/* Copyable LINE ID Pill */}
            <div className="inline-flex items-center justify-between p-2 pl-4 rounded-full bg-coquette-bgCream border-2 border-coquette-roseLight mb-6 w-full max-w-xs">
              <span className="text-sm font-bold text-coquette-rose tracking-wider">
                {lineId}
              </span>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-coquette-brown hover:text-coquette-rose border border-coquette-roseLight/80 shadow-2xs transition"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-[#5E8B34]" />
                    <span className="text-[#5E8B34]">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>คัดลอกไอดี</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full bg-[#06C755] text-white font-semibold text-sm sm:text-base shadow-md hover:bg-[#05a948] transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <MessageCircle size={19} />
            <span>เปิดแชท LINE ทันที</span>
            <ExternalLink size={15} />
          </a>
        </div>

        {/* TikTok Card */}
        <div className="coquette-card coquette-card-hover p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-3 right-4 opacity-40">
            <RibbonBow size={32} />
          </div>

          <div>
            <div className="w-16 h-16 rounded-2xl bg-coquette-brown text-white flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-coquette-roseLight/40">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.34 6.34 0 0 0 6.34-6.32V8.41a8.34 8.34 0 0 0 5-1.72z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-coquette-brown mb-1">
              TikTok Official
            </h3>
            <p className="text-xs sm:text-sm text-coquette-brownMuted mb-5">
              รับชมคลิปตัวอย่าง เทคนิค และอัปเดตผลงานสไตล์น่ารัก
            </p>

            <div className="inline-flex items-center justify-center p-2.5 px-4 rounded-full bg-coquette-bgCream border-2 border-coquette-roseLight mb-6 w-full max-w-xs">
              <span className="text-sm font-bold text-coquette-rose">
                {shopName}
              </span>
            </div>
          </div>

          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coquette-rose w-full py-3.5 rounded-full font-semibold text-sm sm:text-base active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>ติดตาม TikTok ของร้าน</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Guidelines: What to prepare */}
      <div className="coquette-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-coquette-roseLight/60">
          <div className="w-8 h-8 rounded-full bg-coquette-roseBg border border-coquette-roseLight flex items-center justify-center text-coquette-rose">
            <Sparkles size={16} />
          </div>
          <h3 className="font-bold text-lg text-coquette-rose">
            สิ่งที่ควรเตรียมก่อนทักมาบรีฟงาน 🎀
          </h3>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-coquette-brown">
          {[
            {
              num: '01',
              title: 'ไฟล์ฟุตเทจวิดีโอ',
              desc: 'อัปโหลดไฟล์ขึ้น Google Drive และตั้งค่าแชร์แบบ "ทุกคนที่มีลิงก์ดูได้"',
            },
            {
              num: '02',
              title: 'สคริปต์หรือข้อความ',
              desc: 'ลำดับเรื่องราว หัวข้อ Text ที่ต้องการเน้นในคลิป หรือบทพูด',
            },
            {
              num: '03',
              title: 'ตัวอย่างสไตล์ที่ชอบ (Ref.)',
              desc: 'ลิงก์คลิปตัวอย่าง โทนสี หรือจังหวะเพลงที่อยากได้เป็นแนวทาง',
            },
            {
              num: '04',
              title: 'กำหนดวันที่ต้องการใช้งาน',
              desc: 'ปกติใช้เวลา 2–4 วันทำการ (หากต้องการงานด่วนภายใน 24 ชม. แจ้งได้เลยค่ะ)',
            },
          ].map((item) => (
            <li
              key={item.num}
              className="flex items-start space-x-3 p-4 rounded-2xl bg-coquette-bgCream/90 border border-coquette-roseLight/70"
            >
              <span className="px-2.5 py-1 rounded-full bg-coquette-rose text-white text-xs font-bold flex-shrink-0">
                {item.num}
              </span>
              <div>
                <strong className="block font-bold text-coquette-brown mb-0.5">{item.title}</strong>
                <span className="text-coquette-brownMuted leading-relaxed">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
