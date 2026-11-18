import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { checkAdminSession, adminLogout } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { RibbonBow } from '../../components/decorations/RibbonBow'
import {
  Film,
  DollarSign,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Clock,
  Megaphone,
  Heart,
  HelpCircle,
} from 'lucide-react'

export const AdminLayout: React.FC = () => {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    async function verify() {
      const isAuth = await checkAdminSession()
      if (!isAuth) {
        navigate('/admin/login')
      } else {
        setChecking(false)
      }
    }
    verify()
  }, [navigate])

  const handleLogout = async () => {
    await adminLogout()
    showToast('ออกจากระบบเรียบร้อยแล้วค่ะ', 'info')
    navigate('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coquette-bgCream">
        <div className="flex flex-col items-center space-y-3">
          <RibbonBow size={48} className="animate-bounce" />
          <p className="text-sm font-medium text-coquette-brown">กำลังตรวจสอบสิทธิ์แอดมิน...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { to: '/admin', end: true, label: 'จัดการผลงาน', icon: Film },
    { to: '/admin/services', end: false, label: 'บริการและราคา', icon: DollarSign },
    { to: '/admin/queue', end: false, label: 'สถานะคิว', icon: Clock },
    { to: '/admin/announcements', end: false, label: 'ประกาศ', icon: Megaphone },
    { to: '/admin/reviews', end: false, label: 'รีวิว', icon: Heart },
    { to: '/admin/faqs', end: false, label: 'FAQ', icon: HelpCircle },
    { to: '/admin/promotions', end: false, label: 'โปรโมชั่น', icon: Tag },
    { to: '/admin/settings', end: false, label: 'ตั้งค่าเว็บไซต์', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-coquette-bgCream/40 pb-16">
      {/* Top Admin Header */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-coquette-roseLight sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <RibbonBow size={28} />
              <span className="font-display italic text-lg sm:text-xl font-bold text-coquette-rose">
                Admin Panel
              </span>
              <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-coquette-roseBg text-coquette-rose font-semibold border border-coquette-roseLight">
                @kittenwearglasses
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/"
                target="_blank"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-coquette-brown hover:bg-coquette-bgCream flex items-center space-x-1 border border-coquette-roseLight/60"
              >
                <span>ดูหน้าเว็บจริง</span>
                <ExternalLink size={12} />
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-coquette-rose hover:bg-coquette-roseBg flex items-center space-x-1 border border-coquette-rose"
              >
                <LogOut size={13} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-coquette-roseLight/40">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? 'bg-coquette-rose text-white shadow-coquette-sm font-semibold'
                        : 'text-coquette-brown hover:bg-coquette-roseBg'
                    }`
                  }
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
