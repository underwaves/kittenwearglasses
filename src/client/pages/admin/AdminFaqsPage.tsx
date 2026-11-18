import React, { useEffect, useState } from 'react'
import {
  adminGetFaqs,
  adminCreateFaq,
  adminUpdateFaq,
  adminDeleteFaq,
  adminReorderFaqs,
  Faq,
} from '../../utils/api'
import { useToast } from '../../components/Toast'
import { HelpCircle, Plus, Edit2, Trash2, Check, X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'

export const AdminFaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [saving, setSaving] = useState(false)

  const { showToast } = useToast()

  const loadFaqs = async () => {
    try {
      setLoading(true)
      const list = await adminGetFaqs()
      setFaqs(list)
    } catch {
      showToast('ไม่สามารถโหลดรายการ FAQ ได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setQuestion('')
    setAnswer('')
    setIsVisible(true)
    setShowForm(false)
  }

  const startEdit = (faq: Faq) => {
    setEditingId(faq.id)
    setQuestion(faq.question)
    setAnswer(faq.answer)
    setIsVisible(faq.is_visible === 1)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) {
      showToast('กรุณากรอกทั้งคำถามและคำตอบ', 'error')
      return
    }
    setSaving(true)
    try {
      const existingItem = faqs.find((f) => f.id === editingId)
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        is_visible: isVisible ? 1 : 0,
        sort_order: existingItem ? existingItem.sort_order : faqs.length + 1,
      }

      const res = editingId
        ? await adminUpdateFaq(editingId, payload)
        : await adminCreateFaq(payload)

      if (res.success) {
        showToast(res.message || 'บันทึกคำถามเรียบร้อยแล้ว', 'success')
        resetForm()
        await loadFaqs()
      } else {
        showToast(res.error || 'บันทึกไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisible = async (faq: Faq) => {
    try {
      const res = await adminUpdateFaq(faq.id, {
        ...faq,
        is_visible: faq.is_visible === 1 ? 0 : 1,
      })
      if (res.success) {
        showToast('เปลี่ยนสถานะการแสดงผลเรียบร้อยแล้ว', 'info')
        await loadFaqs()
      }
    } catch {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('ต้องการลบคำถามข้อนี้ใช่หรือไม่?')) return
    try {
      const res = await adminDeleteFaq(id)
      if (res.success) {
        showToast('ลบคำถามเรียบร้อยแล้ว', 'info')
        await loadFaqs()
      }
    } catch {
      showToast('ลบไม่สำเร็จ', 'error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= faqs.length) return

    const updated = [...faqs]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp

    const payload = updated.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }))
    setFaqs(updated)

    try {
      await adminReorderFaqs(payload)
      showToast('บันทึกลำดับคำถามเรียบร้อยแล้ว', 'success')
    } catch {
      showToast('เรียงลำดับไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
            <HelpCircle size={24} />
            <span>จัดการคำถามที่พบบ่อย (FAQ Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            เพิ่ม แก้ไข เรียงลำดับ หรือซ่อนคำถามที่พบบ่อยในหน้า `/faq`
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
          <span>เพิ่มคำถามใหม่</span>
        </button>
      </div>

      {/* FAQ MODAL DIALOG (เด้งขึ้นมากลางจอทันที ไม่ต้องเลื่อนขึ้น) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8 text-coquette-brown">
            <div className="flex items-center justify-between border-b border-coquette-roseLight/70 pb-3 mb-5">
              <h3 className="font-bold text-lg text-coquette-rose">
                {editingId ? 'แก้ไขคำถามที่พบบ่อย' : 'เพิ่มคำถามใหม่'}
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
              <div>
                <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                  คำถาม (Question) *
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  placeholder="เช่น ต้องเตรียมและส่งฟุตเทจอย่างไร?"
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coquette-brown mb-1.5">
                  คำตอบ (Answer) *
                </label>
                <textarea
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  placeholder="อธิบายรายละเอียดคำตอบ..."
                  className="w-full px-4 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-sm text-coquette-brown focus:outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center space-x-2.5 cursor-pointer text-sm font-semibold text-coquette-brown">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded text-coquette-rose focus:ring-coquette-rose w-4 h-4"
                  />
                  <span>แสดงผลบนหน้าเว็บไซต์</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t border-coquette-roseLight/50">
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
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกคำถาม'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {loading ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            กำลังโหลดรายการคำถาม...
          </div>
        ) : faqs.length === 0 ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            ยังไม่มีคำถามที่พบบ่อย
          </div>
        ) : (
          faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="coquette-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-bold">
                    Q{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(faq)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                      faq.is_visible === 1
                        ? 'bg-[#EEF9E1] text-[#3B6218]'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {faq.is_visible === 1 ? <Eye size={11} /> : <EyeOff size={11} />}
                    <span>{faq.is_visible === 1 ? 'แสดง' : 'ซ่อน'}</span>
                  </button>
                </div>

                <h4 className="font-bold text-coquette-brown text-sm sm:text-base">
                  {faq.question}
                </h4>
                <p className="text-xs sm:text-sm text-coquette-brownMuted leading-relaxed">
                  {faq.answer}
                </p>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-start flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-coquette-bgCream border border-coquette-roseLight disabled:opacity-30"
                  title="เลื่อนขึ้น"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === faqs.length - 1}
                  className="p-1.5 rounded-lg bg-coquette-bgCream border border-coquette-roseLight disabled:opacity-30"
                  title="เลื่อนลง"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(faq)}
                  className="p-2 rounded-full bg-coquette-bgCream border border-coquette-roseLight text-coquette-brown hover:text-coquette-rose"
                  title="แก้ไข"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(faq.id)}
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
