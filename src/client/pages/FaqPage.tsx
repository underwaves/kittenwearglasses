import React, { useEffect, useState } from 'react'
import { getFaqs, Faq } from '../utils/api'
import { OrderStepper } from '../components/OrderStepper'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { CloverLeaf } from '../components/decorations/CloverLeaf'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({})

  useEffect(() => {
    document.title = 'คำถามที่พบบ่อย (FAQ) & ขั้นตอนสั่งงาน | @kittenwearglasses'
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const list = await getFaqs()
        setFaqs(list)
        if (list.length > 0) {
          setOpenIds({ [list[0].id]: true, ...(list[1] ? { [list[1].id]: true } : {}) })
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleFaq = (id: number) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-14 pt-2">
      {/* Page Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <HelpCircle size={12} />
          <span>Frequently Asked Questions</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            FAQ &amp; How to Order
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-xl mx-auto">
          รวมคำถามที่พบบ่อยเกี่ยวกับการส่งฟุตเทจ การชำระมัดจำ การแก้ไขงาน และขั้นตอนการสั่งตัดต่อตั้งแต่ต้นจนรับไฟล์จริงค่ะ 🎀
        </p>
      </div>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="coquette-card h-16 animate-pulse bg-coquette-roseBg/30" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="coquette-card p-10 text-center text-coquette-brownMuted">
            ยังไม่มีรายการคำถามที่พบบ่อยในขณะนี้
          </div>
        ) : (
          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = !!openIds[faq.id]
              const panelId = `faq-panel-${faq.id}`
              const buttonId = `faq-btn-${faq.id}`

              return (
                <div
                  key={faq.id}
                  className="coquette-card overflow-hidden transition-all"
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-coquette-rose transition-colors hover:bg-coquette-roseBg/30"
                    >
                      <div className="flex items-center space-x-3.5 pr-3">
                        <span className="w-8 h-8 rounded-full bg-coquette-rose text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                          Q{idx + 1}
                        </span>
                        <span className="font-bold text-coquette-brown text-sm sm:text-base leading-snug">
                          {faq.question}
                        </span>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-coquette-rose flex items-center justify-center flex-shrink-0">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 pb-5 pt-3 text-xs sm:text-sm text-coquette-brown leading-relaxed border-t border-coquette-roseLight/50 bg-coquette-bgCream/70 flex items-start space-x-2.5"
                    >
                      <CloverLeaf size={18} className="flex-shrink-0 mt-0.5" />
                      <p className=" whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Dotted Divider */}
      <div className="coquette-divider" />

      {/* 4-Step Visual Order Stepper underneath FAQ */}
      <OrderStepper />
    </div>
  )
}
