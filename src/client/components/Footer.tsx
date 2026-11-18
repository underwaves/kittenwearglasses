import React from 'react'
import { Link } from 'react-router-dom'
import { RibbonBow } from './decorations/RibbonBow'
import { CloverLeaf } from './decorations/CloverLeaf'
import { StarSparkle } from './decorations/StarSparkle'
import { useSettings } from '../context/SettingsContext'

export const Footer: React.FC = () => {
  const { settings } = useSettings()
  const shopName = settings.shop_name || '@kittenwearglasses'
  const lineId = settings.line_id || '@882xaxoy'
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@882xaxoy'
  const tiktokUrl = settings.tiktok_url || 'https://www.tiktok.com/@kittenwearglasses'

  const logoUrl = settings.shop_logo
    ? settings.shop_logo.startsWith('http')
      ? settings.shop_logo
      : `/media/${settings.shop_logo.replace(/^\/media\//, '')}`
    : ''

  return (
    <footer className="mt-20 border-t-2 border-coquette-roseLight bg-coquette-bgCream/95 relative z-10 overflow-hidden">
      {/* Decorative Ribbon corners */}
      <div className="absolute top-2 left-4 pointer-events-none opacity-40">
        <RibbonBow size={32} />
      </div>
      <div className="absolute top-2 right-4 pointer-events-none opacity-40">
        <RibbonBow size={32} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Shop Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white border border-coquette-rose overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-6 h-6">
                    <circle cx="50" cy="50" r="48" fill="#FAF6F0" />
                    <polygon points="26,38 18,18 42,26" fill="#E098AC" stroke="#68002C" strokeWidth="3" />
                    <polygon points="74,38 82,18 58,26" fill="#E098AC" stroke="#68002C" strokeWidth="3" />
                    <circle cx="50" cy="56" r="30" fill="#FAF6F0" />
                    <circle cx="38" cy="52" r="10" fill="none" stroke="#441910" strokeWidth="3.5" />
                    <circle cx="62" cy="52" r="10" fill="none" stroke="#441910" strokeWidth="3.5" />
                    <line x1="48" y1="52" x2="52" y2="52" stroke="#441910" strokeWidth="3.5" />
                    <circle cx="38" cy="52" r="3.5" fill="#441910" />
                    <circle cx="62" cy="52" r="3.5" fill="#441910" />
                    <polygon points="50,60 46,57 54,57" fill="#68002C" />
                    <path d="M47,63 Q50,66 53,63" stroke="#441910" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="font-display italic text-2xl font-bold text-coquette-rose">
                {shopName}
              </span>
              <CloverLeaf size={24} />
            </div>
            <p className="text-sm text-coquette-brownMuted leading-relaxed max-w-md">
              {settings.shop_tagline || 'ร้านรับตัดต่อวิดีโอสไตล์น่ารัก คุมโทนสไตล์ coquette & aesthetic ใส่ใจในทุกจังหวะดนตรี ลำดับเรื่องราว และฟอนต์ที่ช่วยเสริมเสน่ห์ให้คลิปของคุณโดดเด่นยิ่งขึ้น ✨'}
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs text-coquette-brown font-medium">
              <span className="px-3 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight">
                Shorts / Reels
              </span>
              <span className="px-3 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight">
                TikTok
              </span>
              <span className="px-3 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight">
                Vlog
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-coquette-rose uppercase tracking-wider flex items-center space-x-1">
              <span>เมนูเว็บไซต์</span>
              <StarSparkle size={12} />
            </h4>
            <ul className="space-y-2 text-sm text-coquette-brown">
              <li>
                <Link to="/" className="hover:text-coquette-rose transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-coquette-rose transition-colors">
                  ผลงานตัดต่อทั้งหมด
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-coquette-rose transition-colors">
                  บริการและเรทราคา
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="hover:text-coquette-rose transition-colors font-semibold text-coquette-rose">
                  เครื่องคิดราคาตัดต่อ ✦
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-coquette-rose transition-colors">
                  รีวิวจากลูกค้าจริง
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-coquette-rose transition-colors">
                  โปรโมชั่นพิเศษ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-coquette-rose transition-colors">
                  คำถามที่พบบ่อย (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-coquette-rose transition-colors">
                  ช่องทางติดต่อ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-coquette-rose uppercase tracking-wider flex items-center space-x-1">
              <span>ช่องทางการติดต่อ</span>
              <StarSparkle size={12} />
            </h4>
            <div className="space-y-2 text-sm text-coquette-brown">
              <p>
                <span className="text-coquette-brownMuted">LINE OA: </span>
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-coquette-rose hover:underline"
                >
                  {lineId}
                </a>
              </p>
              <p>
                <span className="text-coquette-brownMuted">TikTok: </span>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-coquette-rose hover:underline"
                >
                  {shopName}
                </a>
              </p>
              <div className="pt-2">
                <span className="inline-block text-xs text-coquette-brownMuted bg-white px-2.5 py-1 rounded-lg border border-coquette-roseLight/60">
                  เวลาตอบแชท: 09:00 - 22:00 น.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-coquette-roseLight/50 flex flex-col sm:flex-row items-center justify-between text-xs text-coquette-brownMuted space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} {shopName}. All rights reserved.</span>
            <span>🎀</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white border border-coquette-roseLight text-coquette-rose font-semibold hover:bg-coquette-rose hover:text-white transition shadow-2xs"
            >
              <span>🔐 ระบบหลังบ้าน (Admin)</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
