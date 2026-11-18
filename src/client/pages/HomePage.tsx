import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Check,
  MessageCircle,
  Play,
  Clock,
  Wand2,
  HeartHandshake,
  Calculator,
  Heart,
  ZoomIn,
  X,
} from 'lucide-react'
import {
  getWorks,
  getServices,
  getPromotions,
  getReviews,
  Work,
  Service,
  Promotion,
  Review,
} from '../utils/api'
import { useSettings } from '../context/SettingsContext'
import { WorkCard } from '../components/WorkCard'
import { VideoModal } from '../components/VideoModal'
import { OrderStepper } from '../components/OrderStepper'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'

export const HomePage: React.FC = () => {
  const [featuredWorks, setFeaturedWorks] = useState<Work[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  // Video modal state
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  // Review Lightbox state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const shopName = settings.shop_name || '@kittenwearglasses'
  const lineId = settings.line_id || '@882xaxoy'
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@882xaxoy'
  const logoUrl = settings.shop_logo
    ? settings.shop_logo.startsWith('http')
      ? settings.shop_logo
      : `/media/${settings.shop_logo.replace(/^\/media\//, '')}`
    : ''

  useEffect(() => {
    document.title = `${shopName} | ร้านรับตัดต่อวิดีโอน่ารัก คุมโทน Shorts Reels TikTok Vlog`
  }, [shopName])

  useEffect(() => {
    async function loadData() {
      try {
        const [worksData, servicesData, promoData, reviewsData] = await Promise.all([
          getWorks({ featured: true }),
          getServices(),
          getPromotions(),
          getReviews(),
        ])
        setFeaturedWorks(worksData.slice(0, 6))
        setServices(servicesData.services.slice(0, 3))
        setPromotions(promoData)
        setReviews(reviewsData.slice(0, 3))
      } catch (err) {
        console.error('Failed to load homepage data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const resolveImageUrl = (key: string) =>
    key.startsWith('http') ? key : `/media/${key.replace(/^\/media\//, '')}`

  return (
    <div className="space-y-16 sm:space-y-24 pt-2">
      {/* ======================================================== */}
      {/* 1. MODERN EDITORIAL COQUETTE HERO SECTION                */}
      {/* ======================================================== */}
      <section className="relative coquette-card px-5 py-10 sm:px-12 sm:py-14 text-center overflow-hidden">
        {/* Ambient Soft Glow Blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-coquette-roseLight/35 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-coquette-priceBlue/50 blur-3xl pointer-events-none" />

        {/* Corner Ribbon & Clover Accents */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-6 pointer-events-none transform -rotate-12 opacity-90">
          <RibbonBow size={48} />
        </div>
        <div className="absolute top-3 right-3 sm:top-5 sm:right-6 pointer-events-none transform rotate-12 opacity-90">
          <RibbonBow size={48} />
        </div>
        <div className="hidden sm:block absolute bottom-6 left-8 pointer-events-none opacity-60 animate-float-slow">
          <CloverLeaf size={34} />
        </div>
        <div className="hidden sm:block absolute bottom-6 right-8 pointer-events-none opacity-60 animate-float-slow">
          <CloverLeaf size={34} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Announcement Live Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-coquette-roseLight shadow-coquette-sm text-xs sm:text-sm font-medium text-coquette-rose mb-6">
            <span className="w-2 h-2 rounded-full bg-[#5E8B34] animate-pulse" />
            <span>{settings.announcement || 'เปิดรับคิวตัดต่อประจำเดือนนี้ ✦ สไตล์น่ารัก คุมโทน'}</span>
            <StarSparkle size={13} className="text-coquette-rose animate-sparkle" />
          </div>

          {/* Centerpiece Cameo Avatar Frame */}
          <div className="relative mb-5 group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-coquette-rose via-coquette-roseLight to-coquette-priceBlue shadow-coquette">
              <div className="w-full h-full rounded-full bg-coquette-bgCream border-2 border-white overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-20 h-20">
                    <circle cx="50" cy="50" r="48" fill="#FFFBF0" />
                    <polygon points="26,38 18,18 42,26" fill="#F9C6DA" stroke="#E8607E" strokeWidth="3" />
                    <polygon points="74,38 82,18 58,26" fill="#F9C6DA" stroke="#E8607E" strokeWidth="3" />
                    <circle cx="50" cy="56" r="30" fill="#FFFBF0" />
                    <circle cx="38" cy="52" r="10" fill="none" stroke="#4A3428" strokeWidth="3.5" />
                    <circle cx="62" cy="52" r="10" fill="none" stroke="#4A3428" strokeWidth="3.5" />
                    <line x1="48" y1="52" x2="52" y2="52" stroke="#4A3428" strokeWidth="3.5" />
                    <circle cx="38" cy="52" r="3.5" fill="#4A3428" />
                    <circle cx="62" cy="52" r="3.5" fill="#4A3428" />
                    <polygon points="50,60 46,57 54,57" fill="#E8607E" />
                    <path d="M47,63 Q50,66 53,63" stroke="#4A3428" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5">
              <RibbonBow size={28} />
            </div>
            <div className="absolute -top-1 -left-2 animate-sparkle">
              <StarSparkle size={18} />
            </div>
          </div>

          {/* Script Subtitle & Main Shop Heading */}
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-coquette-brownMuted mb-1">
            Coquette &amp; Aesthetic Video Editing Studio
          </span>
          <h1 className="font-display italic text-4xl sm:text-6xl lg:text-7xl font-bold text-coquette-rose tracking-tight mb-4 drop-shadow-xs">
            {shopName}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-coquette-brown font-normal leading-relaxed mb-8">
            {settings.hero_description ||
              'บริการรับตัดต่อวิดีโอสไตล์น่ารัก coquette & aesthetic คุมโทนหวานละมุน ใส่ฟอนต์สวย เพลงเข้าจังหวะ สำหรับ TikTok, Instagram Reels, Shorts และ Vlog 🎀'}
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 w-full max-w-2xl mx-auto mb-10">
            <Link
              to="/portfolio"
              className="btn-coquette-rose flex-1 min-w-[140px] px-5 py-3.5 rounded-full text-sm sm:text-base font-semibold active:scale-95 flex items-center justify-center space-x-2"
            >
              <Play size={16} className="fill-current" />
              <span>ดูผลงาน</span>
            </Link>

            <Link
              to="/calculator"
              className="flex-1 min-w-[155px] px-5 py-3.5 rounded-full bg-coquette-priceBlue/90 hover:bg-coquette-priceBlue text-coquette-rose border-2 border-coquette-priceBorder text-sm sm:text-base font-bold shadow-coquette-sm transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Calculator size={17} />
              <span>คำนวณราคา</span>
            </Link>

            <Link
              to="/services"
              className="flex-1 min-w-[130px] px-5 py-3.5 rounded-full bg-white text-coquette-rose border-2 border-coquette-roseLight hover:border-coquette-rose text-sm sm:text-base font-semibold shadow-coquette-sm hover:bg-coquette-roseBg/70 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <StarSparkle size={14} />
              <span>ดูราคา</span>
            </Link>

            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#06C755] text-white text-sm sm:text-base font-semibold shadow-md hover:bg-[#05a948] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <MessageCircle size={18} />
              <span>ติดต่อ LINE ({lineId})</span>
            </a>
          </div>

          {/* 4-Pill Studio Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full pt-6 border-t border-coquette-roseLight/60">
            {[
              { icon: Wand2, label: 'คุมโทนสีละมุน', sub: 'Color & Mood' },
              { icon: Sparkles, label: 'ฟอนต์ & เอฟเฟกต์น่ารัก', sub: 'Cute Typography' },
              { icon: Clock, label: 'ส่งงานไว 2–4 วัน', sub: 'Fast Turnaround' },
              { icon: HeartHandshake, label: 'แก้ไขงานฟรี 2 ครั้ง', sub: '2 Free Revisions' },
            ].map((badge, i) => {
              const Icon = badge.icon
              return (
                <div
                  key={i}
                  className="flex items-center space-x-2.5 p-2.5 sm:p-3 rounded-2xl bg-coquette-bgCream/90 border border-coquette-roseLight/70 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-coquette-roseBg text-coquette-rose flex items-center justify-center flex-shrink-0 border border-coquette-roseLight/80">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-coquette-brown truncate">{badge.label}</p>
                    <p className="text-[10px] text-coquette-brownMuted truncate">{badge.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. ACTIVE PROMOTION BANNER (IF AVAILABLE)                */}
      {/* ======================================================== */}
      {promotions.length > 0 && (
        <section className="relative coquette-card p-6 sm:p-8 bg-gradient-to-r from-[#FFF5F8] via-white to-[#F0F7FB] border-2 border-coquette-rose shadow-coquette-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-rose text-white text-xs font-semibold shadow-xs">
                <Sparkles size={12} />
                <span>SPECIAL PROMOTION ✦ โปรโมชั่นพิเศษ</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-coquette-rose">
                {promotions[0].title}
              </h3>
              <p className="text-sm sm:text-base text-coquette-brown leading-relaxed">
                {promotions[0].description}
              </p>
              {promotions[0].conditions && (
                <p className="text-xs text-coquette-brownMuted">
                  *เงื่อนไข: {promotions[0].conditions}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <a
                href={`https://line.me/R/ti/p/@882xaxoy?text=${encodeURIComponent(
                  `สวัสดีค่ะ สนใจโปรโมชั่น: ${promotions[0].title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-coquette-rose px-6 py-3.5 rounded-full text-sm font-semibold flex items-center space-x-1.5"
              >
                <span>รับสิทธิ์ทาง LINE</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. FEATURED WORKS (6 LATEST)                             */}
      {/* ======================================================== */}
      <section className="space-y-7">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider mb-2">
              <StarSparkle size={10} />
              <span>Portfolio Showcase</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2.5">
              <h2 className="text-3xl sm:text-4xl font-bold text-coquette-rose font-display italic">
                Featured Works
              </h2>
              <RibbonBow size={30} />
            </div>
            <p className="text-sm text-coquette-brownMuted mt-1">
              ตัวอย่างผลงานตัดต่อคัดพิเศษ กดที่การ์ดเพื่อเปิดดูคลิปวิดีโอได้ทันทีค่ะ
            </p>
          </div>

          <Link
            to="/portfolio"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-xs sm:text-sm font-semibold text-coquette-rose shadow-coquette-sm hover:bg-coquette-roseBg/50 transition-all"
          >
            <span>ดูผลงานทั้งหมด ({featuredWorks.length}+)</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Works Grid */}
        {featuredWorks.length === 0 && !loading ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            ยังไม่มีรายการผลงานเด่นในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredWorks.map((work) => (
              <WorkCard key={work.id} work={work} onSelect={setSelectedWork} />
            ))}
          </div>
        )}
      </section>

      {/* Dotted Divider */}
      <div className="coquette-divider" />

      {/* ======================================================== */}
      {/* 4. SERVICE PACKAGES PREVIEW                              */}
      {/* ======================================================== */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F2FBE9] border border-coquette-clover text-[11px] font-bold text-coquette-cloverDark uppercase tracking-wider">
            <CloverLeaf size={13} />
            <span>Transparent Pricing</span>
          </div>
          <div className="flex items-center justify-center space-x-2.5">
            <CloverLeaf size={28} />
            <h2 className="text-3xl sm:text-4xl font-bold text-coquette-rose font-display italic">
              Editing Packages
            </h2>
            <CloverLeaf size={28} />
          </div>
          <p className="text-sm sm:text-base text-coquette-brown max-w-xl mx-auto">
            แพ็กเกจตัดต่อครอบคลุมทุกความยาว ทุกแพ็กเกจรวมแต่งสี คุมโทน ใส่ฟอนต์น่ารัก เพลง และเอฟเฟกต์เสียงครบจบ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => {
            let features: string[] = []
            try {
              features = JSON.parse(service.features)
            } catch {
              features = ['ใส่ Text / เพลง / SoundFX', 'คุมโทนสีน่ารัก', 'แก้ฟรี 2 ครั้ง']
            }

            const imgSrc = service.image_key
              ? service.image_key.startsWith('http')
                ? service.image_key
                : `/media/${service.image_key.replace(/^\/media\//, '')}`
              : null

            return (
              <div
                key={service.id}
                className="group coquette-card coquette-card-hover flex flex-col justify-between p-3 sm:p-4"
              >
                <div>
                  {/* Framed Package Image */}
                  {imgSrc && (
                    <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-coquette-roseBg border border-coquette-roseLight/80 relative mb-4">
                      <img
                        src={imgSrc}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      {service.badge && (
                        <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-coquette-rose/95 backdrop-blur-xs text-white text-[11px] font-semibold shadow-md flex items-center space-x-1 border border-white/40">
                          <StarSparkle size={10} color="#FFFFFF" />
                          <span>{service.badge}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-2 sm:px-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-semibold text-coquette-rose">
                        {service.duration_label}
                      </span>
                      {!imgSrc && service.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold shadow-xs">
                          {service.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-coquette-brown group-hover:text-coquette-rose transition-colors leading-snug">
                      {service.title}
                    </h3>

                    {/* Modern Tinted Price Box */}
                    <div className="my-4 p-3.5 rounded-2xl bg-coquette-priceBlue/50 border border-coquette-priceBorder/90 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-coquette-brownMuted block">
                          เรทราคาเริ่มต้น
                        </span>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl sm:text-3xl font-extrabold text-coquette-rose tracking-tight font-display">
                            {service.price_label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-coquette-brown">
                            บาท / คลิป
                          </span>
                        </div>
                      </div>
                      <StarSparkle size={18} className="text-coquette-rose opacity-80" />
                    </div>

                    <p className="text-xs sm:text-sm text-coquette-brownMuted mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6 text-xs sm:text-sm text-coquette-brown border-t border-coquette-roseLight/50 pt-3.5">
                      {features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-2">
                          <span className="w-4 h-4 rounded-full bg-coquette-clover text-coquette-brown flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#5E8B34]/30">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-2 sm:px-3 pb-2">
                  <a
                    href={`https://line.me/R/ti/p/@882xaxoy?text=${encodeURIComponent(
                      `สวัสดีค่ะ สนใจแพ็กเกจตัดต่อ: ${service.title} (${service.price_label} บาท)`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-coquette-rose w-full py-3 rounded-full text-center text-sm font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle size={16} />
                    <span>สั่งตัดต่อแพ็กเกจนี้</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/calculator"
            className="btn-coquette-rose inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold"
          >
            <Calculator size={16} />
            <span>ลองคำนวณราคาหลายคลิป + บริการเสริม</span>
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-coquette-rose text-sm font-semibold hover:bg-coquette-roseBg/60 shadow-coquette-sm transition-all"
          >
            <span>ดูบริการเสริม (ซับไทย / พากย์เสียง) และเงื่อนไขทั้งหมด</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Dotted Divider */}
      <div className="coquette-divider" />

      {/* ======================================================== */}
      {/* 5. CUSTOMER REVIEWS SECTION                              */}
      {/* ======================================================== */}
      {reviews.length > 0 && (
        <>
          <section className="space-y-7">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider mb-2">
                  <Heart size={11} className="fill-current" />
                  <span>Happy Clients</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2.5">
                  <h2 className="text-3xl sm:text-4xl font-bold text-coquette-rose font-display italic">
                    Customer Reviews
                  </h2>
                  <RibbonBow size={28} />
                </div>
                <p className="text-sm text-coquette-brownMuted mt-1">
                  เสียงตอบรับจากลูกค้าที่ใช้บริการตัดต่อกับ {shopName} กดที่รูปเพื่อดูภาพขยายค่ะ 🎀
                </p>
              </div>

              <Link
                to="/reviews"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-xs sm:text-sm font-semibold text-coquette-rose shadow-coquette-sm hover:bg-coquette-roseBg/50 transition-all"
              >
                <span>ดูรีวิวทั้งหมด</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {reviews.map((rev, i) => {
                const imgSrc = resolveImageUrl(rev.image_key)
                const altText = rev.caption || `รีวิวจากลูกค้า ${shopName} #${i + 1}`
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedReview(rev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedReview(rev)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`ขยายดูภาพรีวิว: ${altText}`}
                    className="group coquette-card coquette-card-hover p-3 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/4] bg-coquette-roseBg border border-coquette-roseLight/70">
                      <img
                        src={imgSrc}
                        alt={altText}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-coquette-brown/0 group-hover:bg-coquette-brown/25 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/95 text-coquette-rose shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn size={18} />
                        </div>
                      </div>
                    </div>
                    {rev.caption && (
                      <p className="pt-3 px-1.5 pb-1 text-xs sm:text-sm text-coquette-brown line-clamp-2 leading-relaxed">
                        “{rev.caption}”
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <div className="coquette-divider" />
        </>
      )}

      {/* ======================================================== */}
      {/* 6. 4-STEP VISUAL WORKFLOW                                 */}
      {/* ======================================================== */}
      <OrderStepper />

      {/* Video Modal Player */}
      {selectedWork && (
        <VideoModal
          isOpen={!!selectedWork}
          onClose={() => setSelectedWork(null)}
          videoUrl={selectedWork.video_url}
          title={selectedWork.title}
          workId={selectedWork.id}
          orientation={selectedWork.orientation}
          provider={selectedWork.provider}
        />
      )}

      {/* Review Lightbox Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 bg-coquette-brown/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReview(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="ดูภาพรีวิวขนาดเต็ม"
        >
          <div className="relative max-w-lg w-full coquette-card p-3 sm:p-4 bg-coquette-bgCream max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 px-1">
              <div className="flex items-center space-x-1.5 text-coquette-rose font-bold text-xs sm:text-sm">
                <RibbonBow size={22} />
                <span>รีวิวจากลูกค้า {shopName}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="ปิดภาพขยาย"
                className="p-1.5 rounded-full bg-white text-coquette-brown hover:text-coquette-rose border border-coquette-roseLight"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-auto rounded-2xl border border-coquette-roseLight bg-white flex items-center justify-center">
              <img
                src={resolveImageUrl(selectedReview.image_key)}
                alt={selectedReview.caption || `ภาพแคปรีวิวจากลูกค้า ${shopName}`}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>

            {selectedReview.caption && (
              <p className="mt-3 px-2 text-xs sm:text-sm text-coquette-brown text-center leading-relaxed">
                “{selectedReview.caption}”
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
