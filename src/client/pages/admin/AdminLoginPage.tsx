import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminLogin } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { RibbonBow } from '../../components/decorations/RibbonBow'
import { CloverLeaf } from '../../components/decorations/CloverLeaf'
import { StarSparkle } from '../../components/decorations/StarSparkle'
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่าน')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await adminLogin(password)
      if (res.success) {
        showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับค่ะ 🎀', 'success')
        navigate('/admin')
      } else {
        setErrorMsg(res.error || 'รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center p-4">
      <div className="coquette-card p-8 sm:p-10 w-full max-w-md text-center shadow-coquette-lg relative overflow-hidden">
        {/* Corner Decorations */}
        <div className="absolute top-3 right-3 transform rotate-12 pointer-events-none">
          <RibbonBow size={48} />
        </div>
        <div className="absolute bottom-3 left-4 opacity-40 pointer-events-none">
          <CloverLeaf size={28} />
        </div>

        {/* Icon Badge */}
        <div className="relative w-16 h-16 rounded-2xl bg-coquette-roseBg text-coquette-rose flex items-center justify-center mx-auto mb-4 border-2 border-coquette-roseLight shadow-coquette-sm">
          <Lock size={26} />
          <span className="absolute -top-1.5 -right-1.5">
            <StarSparkle size={14} />
          </span>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-coquette-brownMuted block mb-1">
          Studio Management
        </span>
        <h1 className="text-3xl font-bold text-coquette-rose mb-1 font-display italic">
          Admin Portal
        </h1>
        <p className="text-xs sm:text-sm text-coquette-brownMuted mb-6">
          เข้าสู่ระบบจัดการข้อมูลเว็บไซต์ @kittenwearglasses
        </p>

        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-2xl bg-coquette-roseBg border border-coquette-rose/40 text-xs text-coquette-roseDark font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-coquette-brown mb-1.5 ml-1">
              รหัสผ่านผู้ดูแลระบบ (Admin Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border-2 border-coquette-roseLight bg-coquette-bgCream/70 text-sm focus:outline-none focus:border-coquette-rose focus:bg-white text-coquette-brown transition-all"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-coquette-brownMuted hover:text-coquette-rose p-1.5 rounded-full hover:bg-coquette-roseBg transition-colors focus:outline-none"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-coquette-rose w-full py-3.5 rounded-full font-semibold text-sm active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบหลังบ้าน'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-7 pt-4 border-t border-coquette-roseLight/50 flex flex-col space-y-3">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-coquette-brownMuted">
            <ShieldCheck size={14} className="text-[#5E8B34]" />
            <span>ระบบรักษาความปลอดภัยจำกัดการลองผิด 5 ครั้ง/15 นาที</span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-1 text-xs font-semibold text-coquette-rose hover:underline"
          >
            <ArrowLeft size={13} />
            <span>กลับสู่หน้าหลักเว็บไซต์</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
