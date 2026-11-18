import React, { useEffect, useState } from 'react'
import {
  adminGetServices,
  adminUpdateService,
  adminCreateService,
  adminDeleteService,
  adminUpdateAddon,
  adminCreateAddon,
  adminDeleteAddon,
  adminUpdateTerm,
  adminCreateTerm,
  adminDeleteTerm,
  adminUploadImage,
  Service,
  Addon,
  Term,
} from '../../utils/api'
import { optimizeImage } from '../../utils/imageOptimizer'
import { useToast } from '../../components/Toast'
import { DollarSign, Edit2, Plus, Trash2, Check, X, Upload, Image as ImageIcon } from 'lucide-react'

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Service Edit/Create modal
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceModal, setServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    title: '',
    duration_label: '',
    price_label: '',
    price_num: 300,
    description: '',
    features: '',
    badge: '',
    image_key: '',
    is_visible: 1,
  })

  // Addon Edit/Create modal
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [addonModal, setAddonModal] = useState(false)
  const [addonForm, setAddonForm] = useState({
    category: 'subtitles',
    name: '',
    price_label: '',
    price_num: 100,
    note: '',
    is_visible: 1,
  })

  // Term Edit/Create modal
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [termModal, setTermModal] = useState(false)
  const [termForm, setTermForm] = useState({
    step_number: 1,
    title: '',
    content: '',
    is_visible: 1,
  })

  const { showToast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await adminGetServices()
      setServices(res.services)
      setAddons(res.addons)
      setTerms(res.terms)
    } catch {
      showToast('ไม่สามารถโหลดข้อมูลบริการได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Service Handlers ---
  const handleOpenService = (service?: Service) => {
    if (service) {
      setEditingService(service)
      let parsedFeat = ''
      try {
        const arr = JSON.parse(service.features)
        parsedFeat = Array.isArray(arr) ? arr.join('\n') : service.features
      } catch {
        parsedFeat = service.features
      }
      setServiceForm({
        title: service.title,
        duration_label: service.duration_label,
        price_label: service.price_label,
        price_num: service.price_num,
        description: service.description,
        features: parsedFeat,
        badge: service.badge,
        image_key: service.image_key || '',
        is_visible: service.is_visible,
      })
    } else {
      setEditingService(null)
      setServiceForm({
        title: '',
        duration_label: '',
        price_label: '',
        price_num: 300,
        description: '',
        features: 'ใส่ Text / เพลง / SoundFX\nคุมโทนสีน่ารัก\nแก้ไขงานฟรี 2 ครั้ง',
        badge: '',
        image_key: '',
        is_visible: 1,
      })
    }
    setServiceModal(true)
  }

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      showToast('กำลังย่อขนาดภาพ...', 'info')
      const optimized = await optimizeImage(file, 1280, 0.85)

      showToast('กำลังอัปโหลดไปยัง Cloudflare R2...', 'info')
      const res = await adminUploadImage(optimized)

      if (res.success && res.url) {
        setServiceForm((prev) => ({ ...prev, image_key: res.url! }))
        showToast('อัปโหลดภาพแพ็กเกจเรียบร้อยค่ะ 🎀', 'success')
      } else {
        showToast(res.error || 'อัปโหลดไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอัปโหลดภาพ', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    const featuresArray = serviceForm.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)

    const payload = {
      ...serviceForm,
      features: JSON.stringify(featuresArray),
    }

    try {
      if (editingService) {
        await adminUpdateService(editingService.id, payload)
        showToast('แก้ไขบริการเรียบร้อย', 'success')
      } else {
        await adminCreateService(payload)
        showToast('เพิ่มบริการใหม่เรียบร้อย', 'success')
      }
      setServiceModal(false)
      loadData()
    } catch {
      showToast('บันทึกไม่สำเร็จ', 'error')
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('คุณต้องการลบแพ็กเกจนี้ใช่หรือไม่?')) return
    await adminDeleteService(id)
    showToast('ลบแพ็กเกจเรียบร้อย', 'success')
    loadData()
  }

  // --- Addon Handlers ---
  const handleOpenAddon = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon)
      setAddonForm({
        category: addon.category,
        name: addon.name,
        price_label: addon.price_label,
        price_num: addon.price_num,
        note: addon.note,
        is_visible: addon.is_visible,
      })
    } else {
      setEditingAddon(null)
      setAddonForm({
        category: 'subtitles',
        name: '',
        price_label: '+100',
        price_num: 100,
        note: 'บาทต่อคลิป',
        is_visible: 1,
      })
    }
    setAddonModal(true)
  }

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAddon) {
        await adminUpdateAddon(editingAddon.id, addonForm)
        showToast('แก้ไขบริการเสริมเรียบร้อย', 'success')
      } else {
        await adminCreateAddon(addonForm)
        showToast('เพิ่มบริการเสริมเรียบร้อย', 'success')
      }
      setAddonModal(false)
      loadData()
    } catch {
      showToast('บันทึกไม่สำเร็จ', 'error')
    }
  }

  const handleDeleteAddon = async (id: number) => {
    if (!window.confirm('คุณต้องการลบบริการเสริมนี้ใช่หรือไม่?')) return
    await adminDeleteAddon(id)
    showToast('ลบบริการเสริมเรียบร้อย', 'success')
    loadData()
  }

  // --- Term Handlers ---
  const handleOpenTerm = (term?: Term) => {
    if (term) {
      setEditingTerm(term)
      setTermForm({
        step_number: term.step_number,
        title: term.title,
        content: term.content,
        is_visible: term.is_visible,
      })
    } else {
      setEditingTerm(null)
      setTermForm({
        step_number: terms.length + 1,
        title: '',
        content: '',
        is_visible: 1,
      })
    }
    setTermModal(true)
  }

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTerm) {
        await adminUpdateTerm(editingTerm.id, termForm)
        showToast('แก้ไขขั้นตอน/เงื่อนไขเรียบร้อย', 'success')
      } else {
        await adminCreateTerm(termForm)
        showToast('เพิ่มขั้นตอน/เงื่อนไขเรียบร้อย', 'success')
      }
      setTermModal(false)
      loadData()
    } catch {
      showToast('บันทึกไม่สำเร็จ', 'error')
    }
  }

  const handleDeleteTerm = async (id: number) => {
    if (!window.confirm('คุณต้องการลบข้อกำหนดนี้ใช่หรือไม่?')) return
    await adminDeleteTerm(id)
    showToast('ลบข้อกำหนดเรียบร้อย', 'success')
    loadData()
  }

  return (
    <div className="space-y-12">
      {/* 1. SERVICES LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-coquette-rose flex items-center space-x-2">
              <DollarSign size={20} />
              <span>แพ็กเกจบริการและราคาหลัก</span>
            </h2>
            <p className="text-xs text-coquette-brownMuted">
              แก้ไขราคา รายละเอียด จุดเด่น และรูปภาพประกอบของแต่ละแพ็กเกจ
            </p>
          </div>
          <button
            onClick={() => handleOpenService()}
            className="btn-coquette-rose px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1 shadow"
          >
            <Plus size={14} />
            <span>เพิ่มแพ็กเกจ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((svc) => {
            const imgSrc = svc.image_key
              ? svc.image_key.startsWith('http')
                ? svc.image_key
                : `/media/${svc.image_key.replace(/^\/media\//, '')}`
              : null

            return (
              <div key={svc.id} className="coquette-card overflow-hidden bg-white flex flex-col justify-between shadow-coquette-sm border-2 border-coquette-roseLight">
                <div>
                  {/* Package Image Banner */}
                  {imgSrc ? (
                    <div className="w-full aspect-[16/9] overflow-hidden bg-coquette-priceBlue border-b border-coquette-roseLight relative">
                      <img
                        src={imgSrc}
                        alt={svc.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {svc.badge && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-bold shadow-xs">
                          {svc.badge}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-coquette-roseBg to-coquette-priceBlue border-b border-coquette-roseLight flex items-center justify-center text-coquette-brownMuted relative">
                      <ImageIcon size={28} className="text-coquette-rose/75" />
                      {svc.badge && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-bold shadow-xs">
                          {svc.badge}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <span className="text-xs font-semibold text-coquette-brownMuted uppercase tracking-wider">
                      {svc.duration_label}
                    </span>
                    <h4 className="font-bold text-coquette-rose text-base mt-0.5">{svc.title}</h4>

                    {/* Standard Price Display */}
                    <div className="my-2.5 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-bold text-coquette-rose tracking-tight">
                        {svc.price_label}
                      </span>
                      <span className="text-xs font-semibold text-coquette-brown">บาท</span>
                    </div>

                    <p className="text-xs text-coquette-brownMuted line-clamp-2 mb-2">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 flex items-center justify-end space-x-2 border-t border-coquette-roseLight/50 mt-2">
                  <button
                    onClick={() => handleOpenService(svc)}
                    className="p-2 rounded-xl text-coquette-rose hover:bg-coquette-roseBg border border-coquette-roseLight transition"
                    title="แก้ไข"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-2 rounded-xl text-coquette-crimson hover:bg-red-50 border border-red-200 transition"
                    title="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 2. ADDONS LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-coquette-rose">บริการเสริม (Add-ons)</h2>
            <p className="text-xs text-coquette-brownMuted">
              เช่น ค่าซับไตเติล ค่าพากย์เสียง
            </p>
          </div>
          <button
            onClick={() => handleOpenAddon()}
            className="btn-coquette-rose px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1 shadow"
          >
            <Plus size={14} />
            <span>เพิ่มบริการเสริม</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="p-4 rounded-2xl bg-white border-2 border-coquette-roseLight shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-coquette-rose uppercase tracking-wider block">
                  {addon.category}
                </span>
                <span className="font-semibold text-coquette-brown text-sm block">
                  {addon.name}
                </span>
                <span className="text-xs text-coquette-rose font-bold">
                  {addon.price_label}
                </span>
                {addon.note && (
                  <span className="text-[11px] text-coquette-brownMuted ml-2">
                    ({addon.note})
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleOpenAddon(addon)}
                  className="p-1.5 rounded-lg text-coquette-rose hover:bg-coquette-roseBg border border-coquette-roseLight transition"
                  title="แก้ไข"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteAddon(addon.id)}
                  className="p-1.5 rounded-lg text-coquette-crimson hover:bg-red-50 border border-red-200 transition"
                  title="ลบ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TERMS & CONDITIONS LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-coquette-rose">ขั้นตอนและเงื่อนไขการรับงาน</h2>
            <p className="text-xs text-coquette-brownMuted">
              ขั้นตอน 4 ขั้น และเงื่อนไขข้อตกลงที่แสดงในหน้าเว็บ
            </p>
          </div>
          <button
            onClick={() => handleOpenTerm()}
            className="btn-coquette-rose px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1 shadow"
          >
            <Plus size={14} />
            <span>เพิ่มข้อกำหนด</span>
          </button>
        </div>

        <div className="space-y-2">
          {terms.map((term) => (
            <div
              key={term.id}
              className="p-4 rounded-2xl bg-white border-2 border-coquette-roseLight shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-coquette-rose text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {term.step_number > 0 ? term.step_number : 'i'}
                </span>
                <div>
                  <h5 className="font-semibold text-coquette-brown text-sm">{term.title}</h5>
                  <p className="text-xs text-coquette-brownMuted mt-1 leading-relaxed">
                    {term.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button
                  onClick={() => handleOpenTerm(term)}
                  className="p-1.5 rounded-lg text-coquette-rose hover:bg-coquette-roseBg border border-coquette-roseLight transition"
                  title="แก้ไข"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteTerm(term.id)}
                  className="p-1.5 rounded-lg text-coquette-crimson hover:bg-red-50 border border-red-200 transition"
                  title="ลบ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICE MODAL */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8 text-coquette-brown">
            <button
              onClick={() => setServiceModal(false)}
              className="absolute top-5 right-5 p-1 text-coquette-brown hover:text-coquette-rose transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg sm:text-xl font-bold text-coquette-rose mb-4">
              {editingService ? 'แก้ไขแพ็กเกจบริการ' : 'เพิ่มแพ็กเกจใหม่'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs sm:text-sm text-coquette-brown">
              <div>
                <label className="block font-semibold text-coquette-brown mb-1">ชื่อแพ็กเกจ *</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-coquette-brown mb-1">ความยาวคลิป *</label>
                  <input
                    type="text"
                    value={serviceForm.duration_label}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, duration_label: e.target.value })
                    }
                    placeholder="เช่น ไม่เกิน 1 นาที"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-coquette-brown mb-1">ข้อความราคา (บาท) *</label>
                  <input
                    type="text"
                    value={serviceForm.price_label}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price_label: e.target.value })
                    }
                    placeholder="เช่น 300 หรือ 400-800"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                    required
                  />
                </div>
              </div>

              {/* Package Image Upload */}
              <div className="border-t border-coquette-roseLight/50 pt-3">
                <label className="block font-semibold text-coquette-brown mb-1">รูปภาพประกอบแพ็กเกจ (อัปโหลด R2)</label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-coquette-rose text-white text-xs font-semibold hover:bg-coquette-roseDark flex items-center space-x-1.5 shadow-sm transition">
                    <Upload size={14} />
                    <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleServiceImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {serviceForm.image_key && (
                    <button
                      type="button"
                      onClick={() => setServiceForm({ ...serviceForm, image_key: '' })}
                      className="text-xs text-coquette-rose font-semibold hover:underline"
                    >
                      ลบรูปภาพ
                    </button>
                  )}
                </div>

                {serviceForm.image_key && (
                  <div className="mt-2.5 flex items-center space-x-3 p-2.5 rounded-xl bg-coquette-bgCream border border-coquette-roseLight">
                    <img
                      src={
                        serviceForm.image_key.startsWith('http')
                          ? serviceForm.image_key
                          : `/media/${serviceForm.image_key.replace(/^\/media\//, '')}`
                      }
                      alt="Service Preview"
                      className="w-20 h-14 rounded-lg object-cover border border-coquette-roseLight flex-shrink-0"
                    />
                    <span className="text-[11px] text-coquette-brownMuted truncate">
                      {serviceForm.image_key}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">
                  สิ่งที่รวมในแพ็กเกจ (บรรทัดละ 1 ข้อ)
                </label>
                <textarea
                  rows={4}
                  value={serviceForm.features}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, features: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose font-mono text-xs transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={serviceForm.badge}
                  onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                  placeholder="เช่น ยอดนิยม ✨, แนะนำ 🎀"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setServiceModal(false)}
                  className="px-5 py-2 rounded-full border border-coquette-roseLight text-coquette-brown hover:bg-coquette-bgCream text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="btn-coquette-rose px-6 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow transition disabled:opacity-50"
                >
                  <span>บันทึก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADDON MODAL */}
      {addonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-coquette-brown">
            <button
              onClick={() => setAddonModal(false)}
              className="absolute top-5 right-5 p-1 text-coquette-brown hover:text-coquette-rose transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-coquette-rose mb-4">
              {editingAddon ? 'แก้ไขบริการเสริม' : 'เพิ่มบริการเสริมใหม่'}
            </h3>

            <form onSubmit={handleSaveAddon} className="space-y-3.5 text-xs sm:text-sm text-coquette-brown">
              <div>
                <label className="block font-semibold text-coquette-brown mb-1">หมวดหมู่</label>
                <select
                  value={addonForm.category}
                  onChange={(e) => setAddonForm({ ...addonForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                >
                  <option value="subtitles">ซับไทย (Subtitles)</option>
                  <option value="voiceover">พากย์เสียง (Voiceover)</option>
                  <option value="other">อื่น ๆ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">ชื่อบริการเสริม *</label>
                <input
                  type="text"
                  value={addonForm.name}
                  onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                  placeholder="เช่น ซับไทย (คลิปไม่เกิน 1 นาที)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">ราคาที่แสดง *</label>
                <input
                  type="text"
                  value={addonForm.price_label}
                  onChange={(e) => setAddonForm({ ...addonForm, price_label: e.target.value })}
                  placeholder="เช่น +100 หรือ +150 บาท"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={addonForm.note}
                  onChange={(e) => setAddonForm({ ...addonForm, note: e.target.value })}
                  placeholder="เช่น บาทต่อคลิป"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setAddonModal(false)}
                  className="px-5 py-2 rounded-full border border-coquette-roseLight text-coquette-brown hover:bg-coquette-bgCream text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-coquette-rose px-6 py-2 rounded-full text-xs font-semibold shadow transition"
                >
                  <span>บันทึก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TERM MODAL */}
      {termModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coquette-brown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-coquette-roseLight p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-coquette-brown">
            <button
              onClick={() => setTermModal(false)}
              className="absolute top-5 right-5 p-1 text-coquette-brown hover:text-coquette-rose transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-coquette-rose mb-4">
              {editingTerm ? 'แก้ไขข้อกำหนด/ขั้นตอน' : 'เพิ่มข้อกำหนด/ขั้นตอนใหม่'}
            </h3>

            <form onSubmit={handleSaveTerm} className="space-y-3.5 text-xs sm:text-sm text-coquette-brown">
              <div>
                <label className="block font-semibold text-coquette-brown mb-1">ลำดับขั้นตอน (0 = ข้อกำหนดทั่วไป)</label>
                <input
                  type="number"
                  value={termForm.step_number}
                  onChange={(e) =>
                    setTermForm({ ...termForm, step_number: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">หัวข้อ *</label>
                <input
                  type="text"
                  value={termForm.title}
                  onChange={(e) => setTermForm({ ...termForm, title: e.target.value })}
                  placeholder="เช่น ขั้นตอนที่ 1: ส่งฟุตเทจและบรีฟงาน"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose transition"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-coquette-brown mb-1">รายละเอียดเนื้อหา *</label>
                <textarea
                  rows={4}
                  value={termForm.content}
                  onChange={(e) => setTermForm({ ...termForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coquette-roseLight bg-white text-coquette-brown outline-none focus:ring-2 focus:ring-coquette-rose text-xs transition"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setTermModal(false)}
                  className="px-5 py-2 rounded-full border border-coquette-roseLight text-coquette-brown hover:bg-coquette-bgCream text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-coquette-rose px-6 py-2 rounded-full text-xs font-semibold shadow transition"
                >
                  <span>บันทึก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
