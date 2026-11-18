import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Video,
  ShoppingBag,
  Calculator,
  Star,
  Sparkles,
  HelpCircle,
  MessageCircle,
} from 'lucide-react'
import { RibbonBow } from './decorations/RibbonBow'
import { StarSparkle } from './decorations/StarSparkle'
import { useSettings } from '../context/SettingsContext'

interface NavRailItem {
  to: string
  label: string
  shortLabel?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  exact?: boolean
}

export const FloatingQuickMenu: React.FC = () => {
  const location = useLocation()
  const { settings } = useSettings()

  // Disable on admin dashboard
  const isAdmin = location.pathname.startsWith('/admin')
  const isEnabled = settings.floating_menu_enabled !== '0' && !isAdmin

  const navItems: NavRailItem[] = [
    {
      to: '/',
      label: 'หน้าแรก',
      icon: Home,
      exact: true,
    },
    {
      to: '/portfolio',
      label: 'ผลงาน',
      icon: Video,
    },
    {
      to: '/services',
      label: 'บริการ & ราคา',
      icon: ShoppingBag,
    },
    {
      to: '/calculator',
      label: 'คิดราคา',
      icon: Calculator,
    },
    {
      to: '/reviews',
      label: 'รีวิว',
      icon: Star,
    },
    {
      to: '/promotions',
      label: 'โปรโมชั่น',
      icon: Sparkles,
    },
    {
      to: '/faq',
      label: 'คำถามที่พบบ่อย (FAQ)',
      shortLabel: 'FAQ',
      icon: HelpCircle,
    },
    {
      to: '/contact',
      label: 'ติดต่อเรา',
      icon: MessageCircle,
    },
  ]

  const isItemActive = (item: NavRailItem) => {
    if (item.exact) {
      return location.pathname === item.to
    }
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  }

  if (!isEnabled) {
    return null
  }

  return (
    <aside
      aria-label="แถบเมนูนำทางแนวตั้งด้านขวา"
      className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none animate-fade-in pointer-events-auto"
    >
      <nav
        aria-label="เมนูหลักแนวตั้ง"
        className="bg-white/95 backdrop-blur-xl border-2 border-coquette-roseLight/90 rounded-full px-1.5 py-2.5 sm:px-2 sm:py-3 shadow-coquette-lg flex flex-col items-center gap-1.5 sm:gap-2 max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Coquette Decorative Bow */}
        <div className="pt-0.5 pb-0.5 pointer-events-none text-coquette-rose flex items-center justify-center">
          <RibbonBow size={17} />
        </div>

        {/* 8 Navigation Icon Buttons */}
        {navItems.map((item) => {
          const active = isItemActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className="relative group flex items-center justify-center focus:outline-none"
            >
              {/* Left Floating Coquette Tooltip (on hover) */}
              <div className="absolute right-full mr-3 px-3 py-1.5 rounded-2xl bg-coquette-brown/95 backdrop-blur-sm text-white text-xs font-semibold whitespace-nowrap shadow-coquette-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 -translate-x-1.5 group-hover:translate-x-0 z-50 flex items-center gap-1.5">
                <StarSparkle size={10} color="#F8D2DE" />
                <span>{item.label}</span>
                {/* Right arrow pointer pointing to the icon button */}
                <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-coquette-brown/95" />
              </div>

              {/* Circular Icon Button */}
              <div
                className={`w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  active
                    ? 'bg-coquette-rose text-white shadow-md scale-105 ring-2 ring-coquette-roseLight/80'
                    : 'bg-coquette-bgCream/85 hover:bg-coquette-roseBg text-coquette-rose hover:text-coquette-roseDark border border-coquette-roseLight/60 hover:border-coquette-rose hover:scale-105'
                }`}
              >
                <Icon size={17} className={active ? 'text-white' : 'text-coquette-rose'} />
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
