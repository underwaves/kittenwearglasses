import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServices, ServicesResponse } from '../utils/api'
import { OrderStepper } from '../components/OrderStepper'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { Check, ChevronDown, ChevronUp, MessageCircle, AlertCircle, FileText, Mic, Sparkles, Calculator, HelpCircle } from 'lucide-react'

export const ServicesPage: React.FC = () => {
  const [data, setData] = useState<ServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [openTerms, setOpenTerms] = useState<Record<number, boolean>>({ 0: true, 1: true })

  useEffect(() => {
    document.title = 'บริการและเรทราคาตัดต่อวิดีโอ | @kittenwearglasses'
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await getServices()
        setData(res)
      } catch (err) {
        console.error('Failed to load services:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleTerm = (idx: number) => {
    setOpenTerms((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="space-y-16 pt-2">
      {/* Page Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <Sparkles size={11} />
          <span>Rate Card &amp; Services</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Services &amp; Rates
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-xl mx-auto">
          เรทราคาค่าบริการตัดต่อคลิป บริการเสริม และเงื่อนไขการทำงานอย่างโปร่งใส เลือกแพ็กเกจที่เหมาะกับสไตล์คลิปของคุณได้เลยค่ะ 🎀
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/calculator"
            className="btn-coquette-rose inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold"
          >
            <Calculator size={16} />
            <span>เปิดเครื่องคิดราคาตัดต่อ + สรุปบรีฟส่ง LINE</span>
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center space-x-1.5 px-5 py-3 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-coquette-rose text-xs sm:text-sm font-semibold transition"
          >
            <HelpCircle size={15} />
            <span>ดูคำถามที่พบบ่อย (FAQ)</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. RATE CARD PACKAGES                                    */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-coquette-roseLight/70 pb-3">
          <div className="w-8 h-8 rounded-full bg-coquette-roseBg border border-coquette-roseLight flex items-center justify-center">
            <StarSparkle size={16} className="text-coquette-rose" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose">
            เรทราคาตัดต่อวิดีโอ (บาท)
          </h2>
        </div>

        {loading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="coquette-card h-96 animate-pulse bg-coquette-roseBg/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.services.map((service) => {
              let features: string[] = []
              try {
                features = JSON.parse(service.features)
              } catch {
                features = []
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
                          <span className="px-3 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold shadow-xs">
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
                            เรทราคาค่าบริการ
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

                      <p className="text-xs sm:text-sm text-coquette-brownMuted mb-5 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="border-t border-coquette-roseLight/50 pt-4 mb-5">
                        <span className="text-xs font-bold text-coquette-brown block mb-2.5">
                          ทุกแพ็กเกจรวม:
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-coquette-brown">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="w-4 h-4 rounded-full bg-coquette-clover text-coquette-brown flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#5E8B34]/30">
                                <Check size={11} strokeWidth={3} />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 sm:px-3 pb-2">
                    <a
                      href={`https://line.me/R/ti/p/@882xaxoy?text=${encodeURIComponent(
                        `สวัสดีค่ะ สนใจสั่งตัดต่อ: ${service.title} (${service.price_label} บาท)`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-coquette-rose w-full py-3 rounded-full text-center text-sm font-semibold flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={16} />
                      <span>จองคิวทาง LINE</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-coquette-priceBlue/45 border border-coquette-priceBorder text-xs sm:text-sm text-coquette-brown text-center shadow-xs">
          💡 <strong>หมายเหตุ:</strong> ราคาอาจปรับเปลี่ยนขึ้นอยู่กับความซับซ้อนของบรีฟ จำนวนฟุตเทจ และรายละเอียดงานพิเศษ สามารถส่งตัวอย่างมาประเมินราคาก่อนได้ฟรีค่ะ
        </div>
      </section>

      {/* Dotted Divider */}
      <div className="coquette-divider" />

      {/* ======================================================== */}
      {/* 2. ADD-ON SERVICES                                       */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-coquette-roseLight/70 pb-3">
          <CloverLeaf size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose">
            บริการเสริม (Add-on)
          </h2>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subtitles Box */}
            <div className="coquette-card p-6 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-coquette-roseLight/60">
                <div className="w-9 h-9 rounded-2xl bg-coquette-roseBg border border-coquette-roseLight text-coquette-rose flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-coquette-rose leading-tight">
                    บริการใส่ซับไตเติล (ซับไทย)
                  </h3>
                  <p className="text-[11px] text-coquette-brownMuted">แกะคำพูดและจัดวางฟอนต์น่ารักอ่านง่าย</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {data.addons
                  .filter((a) => a.category === 'subtitles')
                  .map((addon) => (
                    <li
                      key={addon.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/70 hover:border-coquette-rose/60 transition-colors text-sm"
                    >
                      <div className="pr-3">
                        <span className="font-semibold text-coquette-brown block">
                          {addon.name}
                        </span>
                        {addon.note && (
                          <span className="text-xs text-coquette-brownMuted">
                            {addon.note}
                          </span>
                        )}
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-coquette-priceBlue text-coquette-rose font-bold text-xs sm:text-sm whitespace-nowrap border border-coquette-priceBorder shadow-2xs">
                        {addon.price_label}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Voiceover Box */}
            <div className="coquette-card p-6 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-coquette-roseLight/60">
                <div className="w-9 h-9 rounded-2xl bg-coquette-roseBg border border-coquette-roseLight text-coquette-rose flex items-center justify-center">
                  <Mic size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-coquette-rose leading-tight">
                    บริการพากย์เสียง (Voiceover)
                  </h3>
                  <p className="text-[11px] text-coquette-brownMuted">เสียงพากย์ไทยโทนสดใสน่าฟัง คมชัด</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {data.addons
                  .filter((a) => a.category === 'voiceover')
                  .map((addon) => (
                    <li
                      key={addon.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/70 hover:border-coquette-rose/60 transition-colors text-sm"
                    >
                      <div className="pr-3">
                        <span className="font-semibold text-coquette-brown block">
                          {addon.name}
                        </span>
                        {addon.note && (
                          <span className="text-xs text-coquette-brownMuted">
                            {addon.note}
                          </span>
                        )}
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-coquette-priceBlue text-coquette-rose font-bold text-xs sm:text-sm whitespace-nowrap border border-coquette-priceBorder shadow-2xs">
                        {addon.price_label}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Dotted Divider */}
      <div className="coquette-divider" />

      {/* ======================================================== */}
      {/* 3. ORDERING STEPS & TERMS ACCORDION                      */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-coquette-roseLight/70 pb-3">
          <RibbonBow size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-coquette-rose">
            เงื่อนไขและขั้นตอนการรับงาน
          </h2>
        </div>

        {data && (
          <div className="space-y-3">
            {data.terms.map((term, idx) => {
              const isOpen = openTerms[idx] ?? false
              return (
                <div
                  key={term.id}
                  className="coquette-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleTerm(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-coquette-rose/40"
                  >
                    <div className="flex items-center space-x-3.5 pr-2">
                      <span className="w-8 h-8 rounded-full bg-coquette-rose text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                        {term.step_number > 0 ? term.step_number : '✦'}
                      </span>
                      <h4 className="font-bold text-coquette-brown text-sm sm:text-base">
                        {term.title}
                      </h4>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-coquette-roseBg text-coquette-rose flex items-center justify-center flex-shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-coquette-brownMuted leading-relaxed border-t border-coquette-roseLight/40 bg-coquette-bgCream/60">
                      <p>{term.content}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Warning Notice Box */}
        <div className="p-4 sm:p-5 rounded-3xl bg-coquette-roseBg/90 border-2 border-coquette-roseLight text-xs sm:text-sm text-coquette-brown leading-relaxed flex items-start space-x-3 shadow-xs">
          <AlertCircle size={20} className="text-coquette-rose flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-coquette-rose block mb-0.5">
              นโยบายการยกเลิกงานและการคืนเงิน
            </span>
            <span>
              หากลูกค้าขอยกเลิกงานขณะที่กำลังดำเนินการ ทางร้านขอสงวนสิทธิ์ไม่คืนเงินมัดจำในทุกกรณี เพื่อชดเชยเวลาและการจัดสรรคิวงานค่ะ
            </span>
          </div>
        </div>
      </section>

      <div className="coquette-divider" />

      {/* 4-Step Visual Order Stepper */}
      <OrderStepper />
    </div>
  )
}
