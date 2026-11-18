import React, { useEffect, useState } from 'react'
import { getPromotions, Promotion } from '../utils/api'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { PriceBadge } from '../components/decorations/PriceBadge'
import { MessageCircle, Calendar, Sparkles } from 'lucide-react'

export const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await getPromotions()
        setPromotions(list)
      } catch (err) {
        console.error('Failed to load promotions:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-10 pt-2">
      {/* Page Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <StarSparkle size={11} />
          <span>Monthly Deals &amp; Offers</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Special Promotions
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-lg mx-auto">
          โปรโมชั่นและดีลสุดพิเศษสำหรับลูกค้าคนสำคัญ ติดตามสิทธิประโยชน์และส่วนลดประจำเดือนได้ที่นี่ค่ะ 🎀
        </p>
      </div>

      {/* Promotions List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="coquette-card h-64 animate-pulse bg-coquette-roseBg/30" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        /* Cute empty state */
        <div className="coquette-card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="inline-block p-4 rounded-full bg-coquette-roseBg text-coquette-rose border border-coquette-roseLight">
            <RibbonBow size={48} />
          </div>
          <h3 className="text-xl font-bold text-coquette-rose">
            ตอนนี้ยังไม่มีโปรโมชั่นใหม่น้า
          </h3>
          <p className="text-xs sm:text-sm text-coquette-brownMuted leading-relaxed">
            ช่วงนี้กำลังเตรียมโปรโมชั่นน่ารัก ๆ รอติดตามได้เร็ว ๆ นี้นะคะ หรือทัก LINE มาสอบถามเรทราคาก่อนได้เลยค่า ✨
          </p>
          <div className="pt-2">
            <a
              href="https://line.me/R/ti/p/@882xaxoy"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-coquette-rose inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold"
            >
              <MessageCircle size={16} />
              <span>ทักไลน์สอบถามคิวงาน</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {promotions.map((promo) => {
            const bannerSrc = promo.banner_key
              ? promo.banner_key.startsWith('http')
                ? promo.banner_key
                : `/media/${promo.banner_key.replace(/^\/media\//, '')}`
              : null

            return (
              <div
                key={promo.id}
                className="coquette-card coquette-card-hover overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-8"
              >
                {/* Banner Image (if exists) */}
                {bannerSrc && (
                  <div className="md:col-span-5 rounded-2xl overflow-hidden aspect-[16/9] md:aspect-auto max-h-72 border-2 border-coquette-roseLight">
                    <img
                      src={bannerSrc}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div
                  className={`flex flex-col justify-between ${
                    bannerSrc ? 'md:col-span-7' : 'md:col-span-12'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg text-coquette-rose text-xs font-bold border border-coquette-roseLight">
                        <Sparkles size={12} />
                        <span>SPECIAL DEAL ✦ ดีลพิเศษ</span>
                      </span>

                      {(promo.start_date || promo.end_date) && (
                        <span className="text-xs text-coquette-brownMuted flex items-center space-x-1 bg-coquette-bgCream px-3 py-1 rounded-full border border-coquette-roseLight/60">
                          <Calendar size={13} className="text-coquette-rose" />
                          <span>
                            {promo.start_date ? `เริ่ม ${promo.start_date}` : ''}
                            {promo.end_date ? ` ถึง ${promo.end_date}` : ''}
                          </span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-coquette-rose">
                      {promo.title}
                    </h3>

                    <p className="text-sm sm:text-base text-coquette-brown leading-relaxed">
                      {promo.description}
                    </p>

                    {promo.conditions && (
                      <div className="p-3.5 rounded-2xl bg-coquette-bgCream border border-coquette-roseLight/70 text-xs text-coquette-brownMuted">
                        <strong className="text-coquette-brown">เงื่อนไข:</strong> {promo.conditions}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-5 border-t-2 border-dashed border-coquette-roseLight/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {promo.price_label ? (
                      <PriceBadge price={promo.price_label} unit="" size="md" />
                    ) : (
                      <div />
                    )}

                    <a
                      href={`https://line.me/R/ti/p/@882xaxoy?text=${encodeURIComponent(
                        `สวัสดีค่ะ สนใจโปรโมชั่น: ${promo.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-coquette-rose w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={18} />
                      <span>สอบถามโปรนี้ทาง LINE</span>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
