import React, { useEffect, useState } from 'react'
import {
  adminGetAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement,
  Announcement,
} from '../../utils/api'
import { useToast } from '../../components/Toast'
import { Megaphone, Plus, Edit2, Trash2, Check, X, Calendar } from 'lucide-react'

export const AdminAnnouncementsPage: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [message, setMessage] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortOrder, setSortOrder] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const { showToast } = useToast()

  const loadList = async () => {
    try {
      setLoading(true)
      const data = await adminGetAnnouncements()
      setItems(data)
    } catch {
      showToast('ไม่สามารถโหลดรายการประกาศได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setMessage('')
    setLinkUrl('')
    setLinkLabel('')
    setStartDate('')
    setEndDate('')
    setSortOrder(items.length + 1)
    setIsActive(true)
    setShowForm(false)
  }

  const startEdit = (item: Announcement) => {
    setEditingId(item.id)
    setMessage(item.message)
    setLinkUrl(item.link_url || '')
    setLinkLabel(item.link_label || '')
    setStartDate(item.start_date || '')
    setEndDate(item.end_date || '')
    setSortOrder(item.sort_order || 1)
    setIsActive(item.is_active === 1)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      showToast('กรุณากรอกข้อความประกาศ', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        message: message.trim(),
        link_url: linkUrl.trim(),
        link_label: linkLabel.trim(),
        start_date: startDate,
        end_date: endDate,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive ? 1 : 0,
      }

      const res = editingId
        ? await adminUpdateAnnouncement(editingId, payload)
        : await adminCreateAnnouncement(payload)

      if (res.success) {
        showToast(res.message || 'บันทึกประกาศสำเร็จ', 'success')
        resetForm()
        await loadList()
      } else {
        showToast(res.error || 'บันทึกไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item: Announcement) => {
    try {
      const res = await adminUpdateAnnouncement(item.id, {
        ...item,
        is_active: item.is_active === 1 ? 0 : 1,
      })
      if (res.success) {
        showToast('เปลี่ยนสถานะการแสดงผลเรียบร้อยแล้ว', 'success')
        await loadList()
      }
    } catch {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('ต้องการลบแถบประกาศนี้ใช่หรือไม่?')) return
    try {
      const res = await adminDeleteAnnouncement(id)
      if (res.success) {
        showToast('ลบประกาศเรียบร้อยแล้ว', 'info')
        await loadList()
      }
    } catch {
      showToast('ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
            <Megaphone size={24} />
            <span>จัดการแถบประกาศด้านบนเว็บ (Top Announcement Bar)</span>
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            ระบบจะแสดงเฉพาะประกาศที่เปิดใช้งานและอยู่ในช่วงเวลา หากมีหลายอันจะแสดงอันที่ลำดับ (Sort Order) น้อยที่สุดอันเดียวค่ะ
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="btn-coquette-rose px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>เพิ่มประกาศใหม่</span>
        </button>
      </div>

      {/* ANNOUNCEMENT MODAL DIALOG (เด้งขึ้นมากลางจอทันที ไม่ต้องเลื่อนขึ้น) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 text-coquette-brown">
            <div className="flex items-center justify-between border-b border-coquette-roseLight/70 pb-3 mb-5">
              <h3 className="font-bold text-lg text-coquette-rose">
                {editingId ? 'แก้ไขแถบประกาศ' : 'สร้างแถบประกาศใหม่'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 rounded-full text-coquette-brownMuted hover:text-coquette-rose transition"
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    ข้อความประกาศ *
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="เช่น 🎀 โปรโมชั่นเดือนนี้ สั่งตัดต่อ 3 คลิป ลดทันที 10%!"
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    ลิงก์ปลายทาง (ไม่บังคับ เช่น `/calculator` หรือ `https://...`)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/calculator"
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    ข้อความปุ่มลิงก์ (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="เช่น ลองคำนวณราคา →"
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    วันเริ่มแสดง (ไม่บังคับ)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    วันหมดอายุ (ไม่บังคับ)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                    ลำดับความสำคัญ (เลขยิ่งน้อยยิ่งแสดงก่อน)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-coquette-brown">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-coquette-rose focus:ring-coquette-rose w-4 h-4"
                    />
                    <span>เปิดแสดงผลทันที</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-coquette-roseLight/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full border border-coquette-roseLight text-xs font-semibold text-coquette-brown hover:bg-coquette-bgCream transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-coquette-rose px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center space-x-1.5 shadow transition disabled:opacity-50"
                >
                  <Check size={15} />
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกประกาศ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            กำลังโหลดรายการประกาศ...
          </div>
        ) : items.length === 0 ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            ยังไม่มีแถบประกาศ
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="coquette-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-coquette-bgCream border border-coquette-roseLight text-[11px] font-bold text-coquette-brown">
                    ลำดับ #{item.sort_order}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition ${
                      item.is_active === 1
                        ? 'bg-[#EEF9E1] text-[#3B6218] border border-[#B4DE81]'
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                    }`}
                  >
                    {item.is_active === 1 ? '● เปิดแสดงผล' : '○ ปิดอยู่'}
                  </button>
                  {(item.start_date || item.end_date) && (
                    <span className="text-[11px] text-coquette-brownMuted flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>
                        {item.start_date || '...'} ถึง {item.end_date || '...'}
                      </span>
                    </span>
                  )}
                </div>

                <p className="font-bold text-sm sm:text-base text-coquette-brown">
                  {item.message}
                </p>

                {item.link_url && (
                  <p className="text-xs text-coquette-rose">
                    ลิงก์: {item.link_url} ({item.link_label || 'ดูรายละเอียด'})
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="p-2 rounded-full bg-coquette-bgCream border border-coquette-roseLight text-coquette-brown hover:text-coquette-rose"
                  title="แก้ไข"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-coquette-crimson hover:bg-coquette-rose hover:text-white transition"
                  title="ลบ"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
