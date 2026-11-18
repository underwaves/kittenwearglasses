import React, { useEffect, useState } from 'react'
import {
  adminGetReviews,
  adminCreateReview,
  adminUpdateReview,
  adminDeleteReview,
  adminReorderReviews,
  adminUploadImage,
  Review,
} from '../../utils/api'
import { optimizeImage } from '../../utils/imageOptimizer'
import { useToast } from '../../components/Toast'
import { Heart, Upload, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Save } from 'lucide-react'

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [editingCaptions, setEditingCaptions] = useState<Record<number, string>>({})

  const { showToast } = useToast()

  const loadReviews = async () => {
    try {
      setLoading(true)
      const list = await adminGetReviews()
      setReviews(list)
      const map: Record<number, string> = {}
      list.forEach((r) => {
        map[r.id] = r.caption || ''
      })
      setEditingCaptions(map)
    } catch {
      showToast('ไม่สามารถโหลดรายการรีวิวได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  // Multi-image upload handler (client-side WebP compression + R2 upload)
  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    setUploading(true)

    let successCount = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i]
        if (rawFile.size > 5 * 1024 * 1024) {
          showToast(`ไฟล์ ${rawFile.name} มีขนาดเกิน 5 MB ระบบข้ามไฟล์นี้ค่ะ`, 'error')
          continue
        }

        setUploadProgress(`กำลังย่อและอัปโหลดภาพที่ ${i + 1}/${files.length}...`)
        const optimized = await optimizeImage(rawFile, 1280, 0.85)
        const uploadRes = await adminUploadImage(optimized)

        if (uploadRes.success && uploadRes.key) {
          await adminCreateReview({
            image_key: uploadRes.key,
            caption: '',
            is_visible: 1,
            sort_order: reviews.length + i + 1,
          })
          successCount++
        }
      }

      if (successCount > 0) {
        showToast(`อัปโหลดและเพิ่มรีวิวสำเร็จ ${successCount} ภาพค่ะ 🎀`, 'success')
        await loadReviews()
      }
    } catch {
      showToast('เกิดข้อผิดพลาดระหว่างอัปโหลดภาพรีวิว', 'error')
    } finally {
      setUploading(false)
      setUploadProgress('')
      e.target.value = ''
    }
  }

  const handleSaveCaption = async (review: Review) => {
    try {
      const newCaption = editingCaptions[review.id] ?? ''
      const res = await adminUpdateReview(review.id, {
        ...review,
        caption: newCaption,
      })
      if (res.success) {
        showToast('บันทึกคำบรรยายรีวิวเรียบร้อยแล้วค่ะ', 'success')
        await loadReviews()
      }
    } catch {
      showToast('บันทึกไม่สำเร็จ', 'error')
    }
  }

  const handleToggleVisible = async (review: Review) => {
    try {
      const res = await adminUpdateReview(review.id, {
        ...review,
        is_visible: review.is_visible === 1 ? 0 : 1,
      })
      if (res.success) {
        showToast('อัปเดตการแสดงผลเรียบร้อยแล้ว', 'info')
        await loadReviews()
      }
    } catch {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('ต้องการลบรีวิวนี้ใช่หรือไม่? (ไฟล์ภาพใน R2 จะถูกลบด้วย)')) return
    try {
      const res = await adminDeleteReview(id)
      if (res.success) {
        showToast('ลบรีวิวและไฟล์ภาพใน R2 เรียบร้อยแล้ว', 'info')
        await loadReviews()
      }
    } catch {
      showToast('ลบไม่สำเร็จ', 'error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= reviews.length) return

    const updated = [...reviews]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp

    const payload = updated.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }))
    setReviews(updated)

    try {
      await adminReorderReviews(payload)
      showToast('บันทึกลำดับรีวิวเรียบร้อยแล้ว', 'success')
    } catch {
      showToast('เรียงลำดับไม่สำเร็จ', 'error')
    }
  }

  const resolveImageUrl = (key: string) =>
    key.startsWith('http') ? key : `/media/${key.replace(/^\/media\//, '')}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
            <Heart size={24} />
            <span>จัดการรีวิวจากลูกค้า (Customer Reviews)</span>
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            รองรับการเลือกอัปโหลดหลายภาพพร้อมกัน ระบบย่อและแปลงเป็น WebP อัตโนมัติก่อนเก็บใน R2 (ไม่เกิน 5 MB/ภาพ)
          </p>
        </div>

        <label className="btn-coquette-rose cursor-pointer px-5 py-3 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center space-x-2 self-start sm:self-auto">
          <Upload size={16} />
          <span>{uploading ? uploadProgress || 'กำลังอัปโหลด...' : 'อัปโหลดภาพรีวิว (เลือกได้หลายภาพ)'}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleMultiUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          กำลังโหลดรายการรีวิว...
        </div>
      ) : reviews.length === 0 ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          ยังไม่มีภาพรีวิว กดปุ่มอัปโหลดด้านบนเพื่อเพิ่มรีวิวได้เลยค่ะ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div key={rev.id} className="coquette-card p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-coquette-brown">
                    ลำดับ #{idx + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg bg-coquette-bgCream border border-coquette-roseLight disabled:opacity-30"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === reviews.length - 1}
                      className="p-1 rounded-lg bg-coquette-bgCream border border-coquette-roseLight disabled:opacity-30"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(rev)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                        rev.is_visible === 1
                          ? 'bg-[#EEF9E1] text-[#3B6218]'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {rev.is_visible === 1 ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{rev.is_visible === 1 ? 'แสดง' : 'ซ่อน'}</span>
                    </button>
                  </div>
                </div>

                <div className="aspect-[4/4] rounded-2xl overflow-hidden bg-coquette-roseBg border border-coquette-roseLight mb-3">
                  <img
                    src={resolveImageUrl(rev.image_key)}
                    alt={rev.caption || 'ภาพรีวิว'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-coquette-brown">
                    คำบรรยาย / Alt Text (ไม่บังคับ):
                  </label>
                  <textarea
                    rows={2}
                    value={editingCaptions[rev.id] ?? ''}
                    onChange={(e) =>
                      setEditingCaptions((prev) => ({ ...prev, [rev.id]: e.target.value }))
                    }
                    placeholder="เช่น รีวิวจากลูกค้าช่อง TikTok..."
                    className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight bg-coquette-bgCream/60 text-xs focus:outline-none focus:border-coquette-rose"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-coquette-roseLight/50">
                <button
                  type="button"
                  onClick={() => handleSaveCaption(rev)}
                  className="px-3.5 py-1.5 rounded-full bg-coquette-rose text-white text-xs font-semibold inline-flex items-center space-x-1 hover:bg-coquette-roseDark transition"
                >
                  <Save size={13} />
                  <span>บันทึกข้อความ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 rounded-full bg-coquette-roseBg text-coquette-crimson hover:bg-coquette-rose hover:text-white transition"
                  title="ลบรีวิวและไฟล์ R2"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
