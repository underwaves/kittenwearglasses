import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { Home } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 ไม่พบหน้า | @kittenwearglasses'
  }, [])

  return (
    <div className="py-16 sm:py-24 text-center max-w-xl mx-auto space-y-6">
      <div className="relative inline-flex items-center justify-center">
        <RibbonBow size={64} />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-bold text-coquette-rose tracking-wider uppercase">
          ERROR 404
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-coquette-rose font-display italic">
          ไม่พบหน้าที่คุณต้องการ 🎀
        </h1>
        <p className="text-sm sm:text-base text-coquette-brownMuted leading-relaxed pt-2">
          หน้าที่คุณกำลังเปิดอาจถูกย้าย ลิงก์ไม่ถูกต้อง หรือยังไม่มีอยู่ในระบบค่ะ
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="btn-coquette-rose inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold shadow-coquette transition active:scale-95"
        >
          <Home size={16} />
          <span>กลับสู่หน้าแรก</span>
          <StarSparkle size={14} color="#FAF6F0" />
        </Link>
        <Link
          to="/portfolio"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white border-2 border-coquette-roseLight text-coquette-rose hover:border-coquette-rose text-sm font-semibold transition active:scale-95"
        >
          <span>ชมผลงานทั้งหมด</span>
        </Link>
      </div>
    </div>
  )
}
