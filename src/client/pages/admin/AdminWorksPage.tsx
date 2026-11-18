import React, { useEffect, useState } from 'react'
import {
  adminGetWorks,
  adminCreateWork,
  adminUpdateWork,
  adminDeleteWork,
  adminReorderWorks,
  adminUploadImage,
  Work,
} from '../../utils/api'
import { parseVideoUrl } from '../../../shared/videoParser'
import { optimizeImage } from '../../utils/imageOptimizer'
import { useToast } from '../../components/Toast'
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  EyeOff,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Film,
  X,
} from 'lucide-react'

export const AdminWorksPage: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<Work | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Shorts/Reels/TikTok')
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [videoUrl, setVideoUrl] = useState('')
  const [coverKey, setCoverKey] = useState('')
  const [customCover, setCustomCover] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const { showToast } = useToast()

  // Real-time video URL parser result
  const videoParse = parseVideoUrl(videoUrl)

  useEffect(() => {
    loadWorks()
  }, [])

  const loadWorks = async () => {
    try {
      setLoading(true)
      const data = await adminGetWorks()
      setWorks(data)
    } catch (err) {
      showToast('ไม่สามารถโหลดรายการผลงานได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingWork(null)
    setTitle('')
    setCategory('Shorts/Reels/TikTok')
    setOrientation('vertical')
    setVideoUrl('')
    setCoverKey('')
    setCustomCover(false)
    setIsFeatured(false)
    setIsVisible(true)
    setModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (work: Work) => {
    setEditingWork(work)
    setTitle(work.title)
    setCategory(work.category)
    setOrientation(work.orientation)
    setVideoUrl(work.video_url)
    setCoverKey(work.cover_key)
    setCustomCover(
      work.provider !== 'youtube' || !work.cover_key.includes('img.youtube.com')
    )
    setIsFeatured(work.is_featured === 1)
    setIsVisible(work.is_visible === 1)
    setModalOpen(true)
  }

  // When video URL changes and it's YouTube, auto-suggest cover if customCover is false
  useEffect(() => {
    if (videoParse.success && videoParse.data.provider === 'youtube') {
      if (!customCover && (!coverKey || coverKey.includes('img.youtube.com'))) {
        setCoverKey(
          `https://img.youtube.com/vi/${videoParse.data.id}/maxresdefault.jpg`
        )
      }
    } else if (
      videoParse.success &&
      (videoParse.data.provider === 'tiktok' || videoParse.data.provider === 'drive')
    ) {
      setCustomCover(true)
      if (coverKey.includes('img.youtube.com')) {
        setCoverKey('')
      }
    }
  }, [videoUrl, videoParse.success, customCover])

  // Handle client-side image compression and upload to R2
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      showToast('กำลังย่อขนาดและแปลงภาพเป็น WebP...', 'info')

      // Compress client side max 1280px
      const optimized = await optimizeImage(file, 1280, 0.85)

      showToast('กำลังอัปโหลดไปยัง Cloudflare R2...', 'info')
      const res = await adminUploadImage(optimized)

      if (res.success && res.url) {
        setCoverKey(res.url)
        setCustomCover(true)
        showToast('อัปโหลดภาพปกเรียบร้อยแล้วค่ะ 🎀', 'success')
      } else {
        showToast(res.error || 'อัปโหลดภาพไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการประมวลผลภาพ', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast('กรุณากรอกชื่อผลงาน', 'error')
      return
    }

    if (!videoParse.success) {
      showToast(videoParse.error, 'error')
      return
    }

    // Determine final cover
    let finalCover = coverKey.trim()
    if (!finalCover && videoParse.data.provider === 'youtube') {
      finalCover = `https://img.youtube.com/vi/${videoParse.data.id}/maxresdefault.jpg`
    }

    if (
      !finalCover &&
      (videoParse.data.provider === 'tiktok' || videoParse.data.provider === 'drive')
    ) {
      showToast(
        `สำหรับ ${
          videoParse.data.provider === 'tiktok' ? 'TikTok' : 'Google Drive'
        } ต้องอัปโหลดภาพปกด้วยนะคะ`,
        'error'
      )
      return
    }

    setSaving(true)
    try {
      const payload = {
        title,
        category,
        orientation,
        video_url: videoUrl,
        cover_key: finalCover,
        is_featured: isFeatured ? 1 : 0,
        is_visible: isVisible ? 1 : 0,
      }

      if (editingWork) {
        const res = await adminUpdateWork(editingWork.id, payload)
        if (res.success) {
          showToast('บันทึกการแก้ไขผลงานสำเร็จ', 'success')
          setModalOpen(false)
          loadWorks()
        } else {
          showToast(res.error || 'บันทึกไม่สำเร็จ', 'error')
        }
      } else {
        const res = await adminCreateWork(payload)
        if (res.success) {
          showToast('เพิ่มผลงานใหม่สำเร็จ', 'success')
          setModalOpen(false)
          loadWorks()
        } else {
          showToast(res.error || 'เพิ่มผลงานไม่สำเร็จ', 'error')
        }
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (work: Work) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน "${work.title}"?`)) {
      return
    }

    try {
      const res = await adminDeleteWork(work.id)
      if (res.success) {
        showToast('ลบผลงานเรียบร้อยแล้ว', 'success')
        loadWorks()
      } else {
        showToast(res.error || 'ลบไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบ', 'error')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= works.length) return

    const newWorks = [...works]
    const temp = newWorks[index]
    newWorks[index] = newWorks[targetIndex]
    newWorks[targetIndex] = temp

    // Assign new sort_order
    const items = newWorks.map((w, idx) => ({ id: w.id, sort_order: idx + 1 }))
    setWorks(newWorks)

    try {
      await adminReorderWorks(items)
      showToast('บันทึกลำดับผลงานแล้ว', 'success')
    } catch {
      showToast('ไม่สามารถบันทึกลำดับได้', 'error')
      loadWorks()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
            <Film size={24} />
            <span>จัดการผลงานวิดีโอ (Portfolio)</span>
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            เพิ่ม แก้ไข ลบ และเรียงลำดับผลงานที่แสดงบนหน้าเว็บ (รวมทั้งหมด {works.length} รายการ)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full bg-coquette-rose text-white text-xs sm:text-sm font-semibold shadow hover:bg-coquette-roseDark transition flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>เพิ่มผลงานใหม่</span>
        </button>
      </div>

      {/* Works List / Table */}
      {loading ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          กำลังโหลดรายการผลงาน...
        </div>
      ) : works.length === 0 ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          ยังไม่มีผลงานในระบบ คลิกปุ่ม "เพิ่มผลงานใหม่" เพื่อเริ่มต้น
        </div>
      ) : (
        <div className="space-y-3">
          {works.map((work, index) => {
            const coverSrc = work.cover_key.startsWith('http')
              ? work.cover_key
              : `/media/${work.cover_key.replace(/^\/media\//, '')}`

            return (
              <div
                key={work.id}
                className={`coquette-card p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  work.is_visible === 0 ? 'opacity-60 bg-neutral-50' : ''
                }`}
              >
                {/* Left: Reorder buttons & Thumbnail */}
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {/* Up / Down buttons */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-coquette-bgCream hover:bg-coquette-roseBg disabled:opacity-30 text-coquette-brown"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === works.length - 1}
                      className="p-1 rounded bg-coquette-bgCream hover:bg-coquette-roseBg disabled:opacity-30 text-coquette-brown"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-coquette-roseBg flex-shrink-0 border border-coquette-roseLight`}
                  >
                    <img
                      src={coverSrc}
                      alt={work.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coquette-priceBlue text-coquette-rose border border-coquette-priceBorder">
                        {work.provider.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-coquette-roseBg text-coquette-brown">
                        {work.category}
                      </span>
                      <span className="text-[10px] text-coquette-brownMuted">
                        {work.orientation === 'vertical' ? 'แนวตั้ง (9:16)' : 'แนวนอน (16:9)'}
                      </span>
                      {work.is_featured === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-coquette-rose text-white flex items-center space-x-0.5">
                          <Star size={10} className="fill-current" />
                          <span>เด่น</span>
                        </span>
                      )}
                      {work.is_visible === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-200 text-neutral-600">
                          ซ่อนอยู่
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-coquette-brown text-sm sm:text-base truncate mt-1">
                      {work.title}
                    </h4>

                    <a
                      href={work.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-coquette-rose hover:underline inline-flex items-center space-x-1 truncate max-w-xs sm:max-w-md"
                    >
                      <span className="truncate">{work.video_url}</span>
                      <ExternalLink size={11} className="flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(work)}
                    className="p-2 rounded-xl text-coquette-brown hover:text-coquette-rose hover:bg-coquette-roseBg border border-coquette-roseLight/50 transition"
                    title="แก้ไขผลงาน"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(work)}
                    className="p-2 rounded-xl text-coquette-rose hover:text-red-700 hover:bg-red-50 border border-red-200 transition"
                    title="ลบผลงาน"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT WORK                                */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-8 max-w-lg w-full shadow-2xl my-8 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-coquette-brown hover:bg-coquette-roseBg"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-coquette-rose mb-1">
              {editingWork ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}
            </h3>
            <p className="text-xs text-coquette-brownMuted mb-6">
              วางลิงก์วิดีโอจาก YouTube, TikTok หรือ Google Drive ระบบจะตรวจจับและแปลง embed ให้อัตโนมัติ
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              {/* Video URL Input */}
              <div>
                <label className="block font-semibold text-coquette-brown mb-1">
                  ลิงก์วิดีโอ (YouTube / TikTok / Google Drive) *
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/... หรือ tiktok.com/@user/video/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-coquette-bgCream/50 text-xs sm:text-sm focus:ring-2 focus:ring-coquette-rose outline-none"
                  required
                />

                {/* Real-time Detection Status */}
                {videoUrl && (
                  <div className="mt-2 text-xs">
                    {videoParse.success ? (
                      <div className="p-2.5 rounded-xl bg-[#F2FBE9] border border-[#CDE8A8] text-[#5E8B34] flex items-center space-x-2">
                        <CheckCircle2 size={16} />
                        <span>
                          ตรวจพบ: <strong>{videoParse.data.provider.toUpperCase()}</strong> (ID: {videoParse.data.id})
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start space-x-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{videoParse.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block font-semibold text-coquette-brown mb-1">
                  ชื่อผลงาน *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น Aesthetic Cafe Vlog, TikTok Trendy Dance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-coquette-bgCream/50 text-xs sm:text-sm focus:ring-2 focus:ring-coquette-rose outline-none"
                  required
                />
              </div>

              {/* Category & Orientation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-coquette-brown mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coquette-roseLight bg-coquette-bgCream/50 text-xs sm:text-sm focus:ring-2 focus:ring-coquette-rose outline-none"
                  >
                    <option value="Shorts/Reels/TikTok">Shorts/Reels/TikTok</option>
                    <option value="Vlog">Vlog</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-coquette-brown mb-1">
                    แนววิดีโอ *
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coquette-roseLight bg-coquette-bgCream/50 text-xs sm:text-sm focus:ring-2 focus:ring-coquette-rose outline-none"
                  >
                    <option value="vertical">แนวตั้ง (9:16)</option>
                    <option value="horizontal">แนวนอน (16:9)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="border-t border-coquette-roseLight/50 pt-3">
                <label className="block font-semibold text-coquette-brown mb-1">
                  ภาพปกผลงาน (Cover Image)
                </label>

                {videoParse.success && videoParse.data.provider === 'youtube' && (
                  <div className="mb-2 flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      id="customCover"
                      checked={customCover}
                      onChange={(e) => {
                        setCustomCover(e.target.checked)
                        if (!e.target.checked && videoParse.success) {
                          setCoverKey(
                            `https://img.youtube.com/vi/${videoParse.data.id}/maxresdefault.jpg`
                          )
                        }
                      }}
                      className="rounded text-coquette-rose focus:ring-coquette-rose"
                    />
                    <label htmlFor="customCover" className="cursor-pointer text-coquette-brown">
                      ต้องการอัปโหลดภาพปกเอง (แทนภาพปกเริ่มต้นของ YouTube)
                    </label>
                  </div>
                )}

                {/* Upload or Show Cover preview */}
                {(customCover ||
                  (videoParse.success &&
                    (videoParse.data.provider === 'tiktok' ||
                      videoParse.data.provider === 'drive'))) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-coquette-priceBlue text-coquette-rose text-xs font-semibold hover:bg-coquette-priceBlue/80 border border-coquette-priceBorder flex items-center space-x-1.5 transition">
                        <Upload size={14} />
                        <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ภาพปก'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-coquette-brownMuted">
                        JPG, PNG, WebP &le; 5MB (ระบบย่ออัตโนมัติ)
                      </span>
                    </div>
                  </div>
                )}

                {/* Cover Preview */}
                {coverKey && (
                  <div className="mt-3 flex items-center space-x-3 p-2 rounded-xl bg-coquette-bgCream border border-coquette-roseLight/60">
                    <img
                      src={
                        coverKey.startsWith('http')
                          ? coverKey
                          : `/media/${coverKey.replace(/^\/media\//, '')}`
                      }
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-coquette-roseLight"
                    />
                    <div className="flex-1 truncate text-xs">
                      <span className="font-semibold block text-coquette-brown truncate">
                        ภาพปกที่เลือก:
                      </span>
                      <span className="text-coquette-brownMuted truncate block text-[11px]">
                        {coverKey}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles: Featured & Visibility */}
              <div className="flex items-center space-x-6 border-t border-coquette-roseLight/50 pt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-coquette-rose focus:ring-coquette-rose"
                  />
                  <span className="font-medium text-xs sm:text-sm text-coquette-brown">
                    ติดดาวเป็นผลงานเด่น (หน้าแรก)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded text-coquette-rose focus:ring-coquette-rose"
                  />
                  <span className="font-medium text-xs sm:text-sm text-coquette-brown">
                    แสดงผลงานนี้
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-coquette-roseLight text-coquette-brown hover:bg-coquette-bgCream"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2 rounded-full bg-coquette-rose text-white font-semibold shadow hover:bg-coquette-roseDark disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกผลงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
