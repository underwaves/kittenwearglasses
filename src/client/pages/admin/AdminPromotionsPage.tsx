import React, { useEffect, useState } from 'react'
import {
  adminGetPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
  adminUploadImage,
  Promotion,
} from '../../utils/api'
import { optimizeImage } from '../../utils/imageOptimizer'
import { useToast } from '../../components/Toast'
import { Tag, Plus, Edit2, Trash2, Upload, Calendar, X, Sparkles } from 'lucide-react'

export const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceLabel, setPriceLabel] = useState('')
  const [conditions, setConditions] = useState('')
  const [bannerKey, setBannerKey] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { showToast } = useToast()

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      setLoading(true)
      const data = await adminGetPromotions()
      setPromotions(data)
    } catch {
      showToast('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingPromo(null)
    setTitle('')
    setDescription('')
    setPriceLabel('')
    setConditions('')
    setBannerKey('')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate('')
    setIsActive(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo)
    setTitle(promo.title)
    setDescription(promo.description)
    setPriceLabel(promo.price_label || '')
    setConditions(promo.conditions || '')
    setBannerKey(promo.banner_key || '')
    setStartDate(promo.start_date || '')
    setEndDate(promo.end_date || '')
    setIsActive(promo.is_active === 1)
    setModalOpen(true)
  }

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      showToast('กำลังย่อขนาดแบนเนอร์...', 'info')
      const optimized = await optimizeImage(file, 1280, 0.85)

      showToast('กำลังอัปโหลดไปยัง Cloudflare R2...', 'info')
      const res = await adminUploadImage(optimized)

      if (res.success && res.url) {
        setBannerKey(res.url)
        showToast('อัปโหลดแบนเนอร์เรียบร้อยแล้วค่ะ', 'success')
      } else {
        showToast(res.error || 'อัปโหลดไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอัปโหลดภาพ', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      showToast('กรุณากรอกชื่อและรายละเอียดโปรโมชั่น', 'error')
      return
    }

    setSaving(true)
    const payload = {
      title,
      description,
      price_label: priceLabel,
      conditions,
      banner_key: bannerKey,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive ? 1 : 0,
    }

    try {
      if (editingPromo) {
        await adminUpdatePromotion(editingPromo.id, payload)
        showToast('แก้ไขโปรโมชั่นเรียบร้อย', 'success')
      } else {
        await adminCreatePromotion(payload)
        showToast('เพิ่มโปรโมชั่นเรียบร้อย', 'success')
      }
      setModalOpen(false)
      loadPromotions()
    } catch {
      showToast('บันทึกโปรโมชั่นไม่สำเร็จ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) return
    try {
      await adminDeletePromotion(id)
      showToast('ลบโปรโมชั่นเรียบร้อย', 'success')
      loadPromotions()
    } catch {
      showToast('ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose flex items-center space-x-2">
            <Tag size={24} />
            <span>จัดการโปรโมชั่น (Promotions)</span>
          </h2>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            เพิ่ม แก้ไข และกำหนดระยะเวลาแสดงผลโปรโมชั่นบนหน้าเว็บ
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full bg-coquette-rose text-white text-xs sm:text-sm font-semibold shadow hover:bg-coquette-roseDark transition flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>เพิ่มโปรโมชั่น</span>
        </button>
      </div>

      {loading ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          กำลังโหลดรายการโปรโมชั่น...
        </div>
      ) : promotions.length === 0 ? (
        <div className="coquette-card p-12 text-center text-coquette-brownMuted">
          ยังไม่มีโปรโมชั่นในระบบ คลิกปุ่ม "เพิ่มโปรโมชั่น" เพื่อสร้างโปรโมชั่นแรก
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`coquette-card p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                promo.is_active === 0 ? 'opacity-60 bg-neutral-50' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {promo.banner_key && (
                  <img
                    src={
                      promo.banner_key.startsWith('http')
                        ? promo.banner_key
                        : `/media/${promo.banner_key.replace(/^\/media\//, '')}`
                    }
                    alt={promo.title}
                    className="w-20 h-20 rounded-xl object-cover border border-coquette-roseLight flex-shrink-0"
                  />
                )}

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        promo.is_active === 1
                          ? 'bg-[#F2FBE9] text-[#5E8B34]'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {promo.is_active === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                    {promo.price_label && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coquette-priceBlue text-coquette-rose">
                        {promo.price_label}
                      </span>
                    )}
                    {(promo.start_date || promo.end_date) && (
                      <span className="text-[10px] text-coquette-brownMuted flex items-center space-x-1">
                        <Calendar size={11} />
                        <span>
                          {promo.start_date} ถึง {promo.end_date || 'ไม่มีกำหนด'}
                        </span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-coquette-brown text-base">{promo.title}</h4>
                  <p className="text-xs text-coquette-brownMuted line-clamp-2 mt-1">
                    {promo.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(promo)}
                  className="p-2 rounded-xl text-coquette-brown hover:text-coquette-rose hover:bg-coquette-roseBg border border-coquette-roseLight/50"
                  title="แก้ไข"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-2 rounded-xl text-coquette-rose hover:bg-red-50 border border-red-200"
                  title="ลบ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 max-w-lg w-full shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-coquette-brown"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-coquette-rose mb-4">
              {editingPromo ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่นใหม่'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">ชื่อโปรโมชั่น *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น สั่ง 3 คลิป ลด 10%"
                  className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none focus:ring-2 focus:ring-coquette-rose"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">รายละเอียดโปรโมชั่น *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดสิทธิประโยชน์..."
                  className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none focus:ring-2 focus:ring-coquette-rose"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ข้อความราคา / ส่วนลด</label>
                  <input
                    type="text"
                    value={priceLabel}
                    onChange={(e) => setPriceLabel(e.target.value)}
                    placeholder="เช่น ลด 10%, พิเศษ 500.-"
                    className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">สถานะ</label>
                  <select
                    value={isActive ? '1' : '0'}
                    onChange={(e) => setIsActive(e.target.value === '1')}
                    className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none"
                  >
                    <option value="1">เปิดใช้งาน (แสดง)</option>
                    <option value="0">ปิดใช้งาน (ซ่อน)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">เงื่อนไขการใช้โปรโมชั่น</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="เช่น สำหรับลูกค้าที่ชำระมัดจำภายในสิ้นเดือน"
                  className="w-full px-3 py-2 rounded-xl border border-coquette-roseLight outline-none"
                />
              </div>

              {/* Banner Upload */}
              <div className="border-t border-coquette-roseLight/50 pt-3">
                <label className="block font-semibold mb-1">ภาพแบนเนอร์ (อัปโหลด R2)</label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-coquette-priceBlue text-coquette-rose text-xs font-semibold hover:bg-coquette-priceBlue/80 border border-coquette-priceBorder flex items-center space-x-1.5 transition">
                    <Upload size={14} />
                    <span>{uploading ? 'กำลังอัปโหลด...' : 'เลือกภาพแบนเนอร์'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUploadBanner}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {bannerKey && (
                    <span className="text-xs text-[#5E8B34] font-medium">
                      ✓ อัปโหลดแล้ว
                    </span>
                  )}
                </div>

                {bannerKey && (
                  <div className="mt-2">
                    <img
                      src={
                        bannerKey.startsWith('http')
                          ? bannerKey
                          : `/media/${bannerKey.replace(/^\/media\//, '')}`
                      }
                      alt="Banner Preview"
                      className="h-20 rounded-lg object-cover border border-coquette-roseLight"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-coquette-roseLight text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 rounded-full bg-coquette-rose text-white text-xs font-semibold shadow hover:bg-coquette-roseDark disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกโปรโมชั่น'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
