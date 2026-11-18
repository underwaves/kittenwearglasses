import React, { useEffect, useState } from 'react'
import { adminGetSettings, adminUpdateQueue } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { useSettings } from '../../context/SettingsContext'
import { CheckCircle2, Clock, AlertCircle, Save, Calendar } from 'lucide-react'

export const AdminQueuePage: React.FC = () => {
  const [queueStatus, setQueueStatus] = useState<'open' | 'filling' | 'closed'>('open')
  const [queueNote, setQueueNote] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { showToast } = useToast()
  const { refreshSettings } = useSettings()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const s = await adminGetSettings()
        setQueueStatus((s.queue_status as 'open' | 'filling' | 'closed') || 'open')
        setQueueNote(s.queue_note || '')
        setUpdatedAt(s.queue_updated_at || '')
      } catch {
        showToast('ไม่สามารถโหลดข้อมูลสถานะคิวได้', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleQuickStatusChange = async (newStatus: 'open' | 'filling' | 'closed') => {
    setQueueStatus(newStatus)
    setSaving(true)
    try {
      const res = await adminUpdateQueue({
        queue_status: newStatus,
        queue_note: queueNote,
      })
      if (res.success && res.data) {
        setUpdatedAt(res.data.queue_updated_at)
        await refreshSettings()
        showToast('อัปเดตสถานะคิวงานทันทีเรียบร้อยแล้วค่ะ 🎀', 'success')
      } else {
        showToast(res.error || 'อัปเดตไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกสถานะคิว', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await adminUpdateQueue({
        queue_status: queueStatus,
        queue_note: queueNote,
      })
      if (res.success && res.data) {
        setUpdatedAt(res.data.queue_updated_at)
        await refreshSettings()
        showToast('บันทึกข้อความสถานะคิวเรียบร้อยแล้วค่ะ 🎀', 'success')
      } else {
        showToast(res.error || 'บันทึกไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="coquette-card p-12 text-center text-coquette-brownMuted">
        กำลังโหลดข้อมูลสถานะคิว...
      </div>
    )
  }

  const options = [
    {
      id: 'open' as const,
      label: 'เปิดรับงาน (เขียวพาสเทล)',
      desc: 'รับคิวตัดต่อตามปกติ ลูกค้ากดส่งออเดอร์ทาง LINE ได้ทันที',
      icon: CheckCircle2,
      activeClass: 'bg-[#EEF9E1] border-[#5E8B34] text-[#3B6218] ring-2 ring-[#B4DE81]',
    },
    {
      id: 'filling' as const,
      label: 'คิวเริ่มเต็ม (เหลือง)',
      desc: 'แจ้งเตือนว่าคิวช่วงนี้ใกล้เต็มแล้ว แนะนำให้ลูกค้าทักเช็กคิวก่อน',
      icon: Clock,
      activeClass: 'bg-[#FFF8DB] border-[#E5A000] text-[#7A5800] ring-2 ring-[#F3D56B]',
    },
    {
      id: 'closed' as const,
      label: 'ปิดรับชั่วคราว (ชมพู)',
      desc: 'แสดงคำเตือนในหน้าเครื่องคิดราคา และเปลี่ยนปุ่มเป็น "สอบถามคิวทาง LINE"',
      icon: AlertCircle,
      activeClass: 'bg-coquette-roseBg border-coquette-rose text-coquette-crimson ring-2 ring-coquette-roseLight',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose">
            จัดการสถานะคิวงาน (Queue Status)
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            กดเลือกสถานะเพียงคลิกเดียวเพื่ออัปเดตป้ายคิวงานทุกหน้าบนเว็บไซต์ทันที
          </p>
        </div>

        {updatedAt && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-coquette-roseLight text-xs text-coquette-brownMuted self-start sm:self-auto">
            <Calendar size={13} className="text-coquette-rose" />
            <span>อัปเดตล่าสุด: {updatedAt}</span>
          </span>
        )}
      </div>

      <div className="coquette-card p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-coquette-brown">
            คลิกเลือกสถานะคิวงาน (บันทึกทันทีด้วยคลิกเดียว):
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((opt) => {
              const Icon = opt.icon
              const isSelected = queueStatus === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleQuickStatusChange(opt.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? opt.activeClass
                      : 'bg-coquette-bgCream/70 border-coquette-roseLight/70 hover:border-coquette-rose/60 text-coquette-brown'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon size={20} />
                    <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                  <p className="text-xs opacity-85 leading-relaxed">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSaveNote} className="space-y-4 pt-4 border-t border-coquette-roseLight/60">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-coquette-brown mb-1.5">
              ข้อความเสริมแสดงคู่กับป้ายสถานะคิว (เช่น "คิวถัดไปว่างวันที่ 25")
            </label>
            <input
              type="text"
              value={queueNote}
              onChange={(e) => setQueueNote(e.target.value)}
              placeholder="เช่น คิวถัดไปว่างวันที่ 25 ทักจองคิวล่วงหน้าได้เลยค่ะ"
              className="w-full px-4 py-3 rounded-2xl border border-coquette-roseLight bg-coquette-bgCream/60 text-sm focus:outline-none focus:ring-2 focus:ring-coquette-rose"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-coquette-rose px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อความเสริม'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
