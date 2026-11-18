import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle, Lock, ArrowRight } from 'lucide-react'
import { RibbonBow } from './decorations/RibbonBow'
import { StarSparkle } from './decorations/StarSparkle'
import { useSettings } from '../context/SettingsContext'
import { getActiveAnnouncement, Announcement } from '../utils/api'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const location = useLocation()
  const { settings } = useSettings()

  useEffect(() => {
    async function load() {
      try {
        const active = await getActiveAnnouncement()
        if (active) {
          setAnnouncement(active)
        }
      } catch {
        // ignore error
      }
    }
    load()
  }, [])

  const linkType: 'internal' | 'external' | null = (() => {
    if (!announcement) return null
    const url = announcement.link_url?.trim()
    if (!url) return null
    if (url.startsWith('/') && !url.startsWith('//')) {
      if (/[\0-\x1F\s\\<>"]/.test(url)) return null
      return 'internal'
    }
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return 'external'
      }
    } catch {
      return null
    }
    return null
  })()

  const shopName = settings.shop_name || '@kittenwearglasses'
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@882xaxoy'
  const logoUrl = settings.shop_logo
    ? settings.shop_logo.startsWith('http')
      ? settings.shop_logo
      : `/media/${settings.shop_logo.replace(/^\/media\//, '')}`
    : ''

  const navLinks = [
    { to: '/', label: 'หน้าแรก' },
    { to: '/portfolio', label: 'ผลงาน' },
    { to: '/services', label: 'บริการ & ราคา' },
    { to: '/calculator', label: 'คิดราคา' },
    { to: '/reviews', label: 'รีวิว' },
    { to: '/promotions', label: 'โปรโมชั่น' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'ติดต่อเรา' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 pt-1 transition-all">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl border-2 border-coquette-roseLight/90 rounded-full px-3.5 sm:px-5 h-16 sm:h-[70px] flex items-center justify-between gap-2 shadow-coquette">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 sm:space-x-2.5 group focus:outline-none flex-shrink-0"
            aria-label={`หน้าแรก ${shopName}`}
          >
            {/* Kitten Glasses or Custom Image Logo */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-coquette-bgCream border-2 border-coquette-rose ring-2 ring-coquette-roseLight/60 flex items-center justify-center shadow-sm overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-8 h-8">
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
              <div className="absolute -bottom-1 -right-1 z-10 pointer-events-none">
                <RibbonBow size={17} />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-display italic text-base sm:text-lg xl:text-xl font-bold text-coquette-rose tracking-tight leading-none group-hover:text-coquette-roseDark transition-colors">
                {shopName}
              </span>
              <span className="text-[10px] font-medium text-coquette-brownMuted tracking-wider uppercase mt-0.5 lg:hidden xl:block">
                Creator &amp; Video Studio
              </span>
            </div>
          </Link>

          {/* Announcement Pill replacing Desktop Nav Menu (Image 2 in place of Image 1) */}
          {announcement ? (
            <div className="hidden lg:flex items-center bg-coquette-roseBg/90 border border-coquette-roseLight rounded-full px-4 py-1.5 space-x-2 text-xs text-coquette-brown shadow-2xs max-w-xl truncate">
              <span className="flex items-center space-x-1.5 truncate">
                <StarSparkle size={11} className="text-coquette-rose flex-shrink-0" />
                <span className="font-medium truncate">{announcement.message}</span>
              </span>

              {linkType && (
                linkType === 'internal' ? (
                  <Link
                    to={announcement.link_url}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold hover:bg-coquette-roseDark transition shadow-2xs flex-shrink-0 whitespace-nowrap"
                  >
                    <span>{announcement.link_label || 'ดูรายละเอียด'}</span>
                    <ArrowRight size={10} />
                  </Link>
                ) : (
                  <a
                    href={announcement.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold hover:bg-coquette-roseDark transition shadow-2xs flex-shrink-0 whitespace-nowrap"
                  >
                    <span>{announcement.link_label || 'ดูรายละเอียด'}</span>
                    <ArrowRight size={10} />
                  </a>
                )
              )}
            </div>
          ) : (
            <div className="hidden lg:block flex-1" />
          )}

          {/* Desktop CTA & Compact Admin Button */}
          <div className="hidden lg:flex items-center space-x-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-coquette-bgCream hover:bg-coquette-roseBg text-coquette-rose border border-coquette-roseLight text-xs font-semibold transition shadow-2xs"
              aria-label="เปิดเมนูนำทาง"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
              <span>เมนู</span>
            </button>

            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-coquette-rose inline-flex items-center space-x-1.5 px-3.5 xl:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-[#CDE8A8] animate-ping" />
              <MessageCircle size={13} />
              <span>ติดต่อ LINE</span>
            </a>

            <Link
              to="/admin"
              title="เข้าสู่ระบบหลังบ้าน (Admin)"
              aria-label="เข้าสู่ระบบหลังบ้าน (Admin)"
              className="w-9 h-9 rounded-full bg-coquette-bgCream hover:bg-coquette-roseBg text-coquette-rose border border-coquette-roseLight hover:border-coquette-rose flex items-center justify-center transition-all shadow-2xs flex-shrink-0"
            >
              <Lock size={14} />
            </Link>
          </div>

          {/* Mobile / Tablet Menu Button */}
          <div className="flex items-center space-x-1.5 lg:hidden flex-shrink-0">
            <Link
              to="/admin"
              title="เข้าสู่ระบบหลังบ้าน (Admin)"
              className="w-9 h-9 rounded-full text-coquette-rose bg-coquette-bgCream hover:bg-coquette-roseBg border border-coquette-roseLight/80 flex items-center justify-center transition-colors"
              aria-label="ระบบหลังบ้าน (Admin)"
            >
              <Lock size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-coquette-rose bg-coquette-roseBg/80 hover:bg-coquette-roseBg border border-coquette-roseLight/80 focus:outline-none focus:ring-2 focus:ring-coquette-rose transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="เปิดเมนูนำทาง"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Announcement Banner */}
        {announcement && (
          <div className="mt-2 lg:hidden bg-coquette-roseBg/95 border border-coquette-roseLight rounded-2xl px-3 py-1.5 flex items-center justify-between text-[11px] text-coquette-brown shadow-2xs">
            <div className="flex items-center space-x-1.5 truncate mr-2">
              <StarSparkle size={10} className="text-coquette-rose flex-shrink-0" />
              <span className="truncate font-medium">{announcement.message}</span>
            </div>
            {linkType && (
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {linkType === 'internal' ? (
                  <Link
                    to={announcement.link_url}
                    className="px-2 py-0.5 rounded-full bg-coquette-rose text-white text-[10px] font-semibold hover:bg-coquette-roseDark transition"
                  >
                    {announcement.link_label || 'ดูเพิ่ม'}
                  </Link>
                ) : (
                  <a
                    href={announcement.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full bg-coquette-rose text-white text-[10px] font-semibold hover:bg-coquette-roseDark transition"
                  >
                    {announcement.link_label || 'ดูเพิ่ม'}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 bg-white/95 backdrop-blur-xl border-2 border-coquette-roseLight rounded-3xl px-4 pt-3 pb-5 space-y-1.5 shadow-coquette-lg animate-fade-in">
            {navLinks.map((link) => {
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-coquette-rose text-white font-semibold shadow-xs'
                      : 'text-coquette-brown hover:bg-coquette-roseBg/60 hover:text-coquette-rose'
                  }`}
                >
                  <span>{link.label === 'FAQ' ? 'คำถามที่พบบ่อย (FAQ)' : link.label}</span>
                  {active && <StarSparkle size={12} color="#FFFFFF" />}
                </Link>
              )
            })}

            <div className="pt-2 space-y-2">
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-coquette-rose w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-full text-sm font-semibold"
              >
                <MessageCircle size={18} />
                <span>ทักแชท LINE ({settings.line_id || '@882xaxoy'})</span>
              </a>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-coquette-bgCream border border-coquette-roseLight text-coquette-rose text-xs font-bold hover:bg-coquette-roseBg transition"
              >
                <Lock size={14} />
                <span>เข้าสู่ระบบหลังบ้าน (Admin)</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
