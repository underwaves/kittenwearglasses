import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface QueueBadgeProps {
  variant?: 'pill' | 'banner' | 'card'
  className?: string
}

export const QueueBadge: React.FC<QueueBadgeProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { settings } = useSettings()
  const rawStatus = settings.queue_status || 'open'
  const defaultNotes: Record<string, string> = {
    open: 'คิวว่างพร้อมเริ่มงานทันที ทักส่งบรีฟได้ตลอดเลยค่ะ 🎀',
    filling: 'คิวเริ่มแน่นแล้วค่ะ ทักจองคิวล่วงหน้าได้นะคะ 🎀',
    closed: 'ปิดรับคิวงานชั่วคราว สอบถามคิวล่วงหน้าได้ค่ะ 🎀',
  }
  const queueNote = settings.queue_note || defaultNotes[rawStatus] || ''
  const updatedAt = settings.queue_updated_at || ''

  const statusConfig = {
    open: {
      label: 'เปิดรับงาน',
      bgClass: 'bg-[#EEF9E1] border-[#B4DE81] text-[#3B6218]',
      dotClass: 'bg-[#5E8B34]',
      icon: CheckCircle2,
    },
    filling: {
      label: 'คิวเริ่มเต็ม',
      bgClass: 'bg-[#FFFDF4] border-[#F5E08E] text-[#7A5800]',
      dotClass: 'bg-[#E5A000]',
      icon: Clock,
    },
    closed: {
      label: 'ปิดรับชั่วคราว',
      bgClass: 'bg-coquette-roseBg border-coquette-rose text-coquette-crimson',
      dotClass: 'bg-coquette-rose',
      icon: AlertCircle,
    },
  }

  const current =
    statusConfig[rawStatus as keyof typeof statusConfig] || statusConfig.open
  const Icon = current.icon

  if (variant === 'pill') {
    return (
      <Link
        to="/calculator"
        title={queueNote ? `${current.label}: ${queueNote}` : current.label}
        className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full border text-xs font-semibold shadow-2xs transition hover:scale-[1.02] ${current.bgClass} ${className}`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dotClass} animate-pulse flex-shrink-0`} />
        <span className="whitespace-nowrap">สถานะคิว: {current.label}</span>
        {queueNote && (
          <span className="hidden sm:inline opacity-85 font-normal whitespace-nowrap">
            • {queueNote}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div
      className={`rounded-3xl border-2 p-4 sm:p-5 shadow-xs transition-all ${current.bgClass} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className={`w-3 h-3 rounded-full ${current.dotClass} animate-pulse flex-shrink-0`} />
          <Icon size={18} className="flex-shrink-0" />
          <span className="font-bold text-sm sm:text-base">
            สถานะคิวงานปัจจุบัน: {current.label}
          </span>
        </div>

        {updatedAt && (
          <span className="inline-flex items-center space-x-1 text-[11px] opacity-80">
            <Calendar size={12} />
            <span>อัปเดตล่าสุด: {updatedAt}</span>
          </span>
        )}
      </div>

      {queueNote && (
        <p className="mt-2 text-xs sm:text-sm leading-relaxed pl-5 font-medium">
          {queueNote}
        </p>
      )}
    </div>
  )
}
