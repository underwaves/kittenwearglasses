import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviews, Review } from '../utils/api'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { ZoomIn, X, MessageCircle, Calculator, Heart } from 'lucide-react'

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    document.title = 'รีวิวจากลูกค้าจริง | @kittenwearglasses'
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getReviews()
        setReviews(data)
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedReview) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedReview(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedReview])

  const resolveImageUrl = (key: string) =>
    key.startsWith('http') ? key : `/media/${key.replace(/^\/media\//, '')}`

  return (
    <div className="space-y-10 pt-2">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <Heart size={11} className="fill-current" />
          <span>Happy Clients &amp; Feedback</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Customer Reviews
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-xl mx-auto">
          เสียงตอบรับและความประทับใจจากลูกค้าจริงที่ใช้บริการตัดต่อวิดีโอกับ @kittenwearglasses กดที่ภาพเพื่อขยายดูรูปเต็มได้เลยค่ะ 🎀
        </p>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="coquette-card h-80 animate-pulse bg-coquette-roseBg/30" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="coquette-card p-12 text-center max-w-md mx-auto space-y-3">
          <CloverLeaf size={40} />
          <h3 className="text-lg font-bold text-coquette-rose">กำลังอัปเดตภาพรีวิวเพิ่มเติม</h3>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            สามารถชมตัวอย่างผลงานตัดต่อจริงได้ที่หน้า Portfolio หรือทัก LINE สอบถามได้เลยค่ะ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => {
            const imgSrc = resolveImageUrl(review.image_key)
            const altText =
              review.caption?.trim() ||
              `ภาพแคปรีวิวจากลูกค้า @kittenwearglasses ลำดับที่ ${index + 1}`

            return (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedReview(review)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`ขยายดูภาพรีวิว: ${altText}`}
                className="group coquette-card coquette-card-hover p-3 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-4 focus:ring-coquette-rose/30"
              >
                <div className="relative rounded-2xl overflow-hidden bg-coquette-roseBg/60 border border-coquette-roseLight/70 aspect-[4/5]">
                  <img
                    src={imgSrc}
                    alt={altText}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-coquette-brown/0 group-hover:bg-coquette-brown/25 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-coquette-rose shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                      <ZoomIn size={20} />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-coquette-roseLight text-[10px] font-bold text-coquette-rose flex items-center space-x-1">
                    <StarSparkle size={10} />
                    <span>Verified Review</span>
                  </div>
                </div>

                {review.caption && (
                  <div className="pt-3 px-2 pb-1">
                    <p className="text-xs sm:text-sm text-coquette-brown leading-relaxed line-clamp-3">
                      “{review.caption}”
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CTA Banner */}
      <div className="coquette-card p-6 sm:p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-coquette-rose">
          อยากได้คลิปน่ารักคุมโทนแบบนี้ใช่ไหมคะ? ✨
        </h3>
        <p className="text-xs sm:text-sm text-coquette-brownMuted max-w-md mx-auto">
          ลองคำนวณงบประมาณเบื้องต้นด้วยตัวเอง หรือทัก LINE มาปรึกษาสไตล์คลิปกับเราได้เลยค่ะ
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/calculator"
            className="btn-coquette-rose px-6 py-3 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center space-x-2"
          >
            <Calculator size={16} />
            <span>ลองคำนวณราคาตัดต่อ</span>
          </Link>
          <a
            href="https://line.me/R/ti/p/@882xaxoy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-[#06C755] hover:bg-[#05a948] text-white text-xs sm:text-sm font-semibold shadow transition inline-flex items-center space-x-2"
          >
            <MessageCircle size={16} />
            <span>ทักแชท LINE @882xaxoy</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
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
                <span>รีวิวจากลูกค้า @kittenwearglasses</span>
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
                alt={selectedReview.caption || 'ภาพแคปรีวิวจากลูกค้า @kittenwearglasses'}
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
