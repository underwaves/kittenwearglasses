import React from 'react'
import { Link } from 'react-router-dom'
import { RibbonBow } from './decorations/RibbonBow'
import { CloverLeaf } from './decorations/CloverLeaf'
import { StarSparkle } from './decorations/StarSparkle'
import { FolderUp, CreditCard, Film, CloudDownload, ArrowRight, Calculator, MessageCircle } from 'lucide-react'

export const OrderStepper: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'ส่งฟุตเทจ + บรีฟสไตล์',
      subtitle: 'Send Footage & Brief',
      desc: 'ส่งลิงก์ไฟล์วิดีโอทาง Google Drive พร้อมสคริปต์ข้อความ โทนสี หรือคลิปตัวอย่าง (Ref.) ที่ต้องการทาง LINE',
      icon: FolderUp,
      badgeBg: 'bg-coquette-roseBg text-coquette-rose border-coquette-roseLight',
      iconBg: 'bg-coquette-rose text-white',
    },
    {
      num: '02',
      title: 'ชำระมัดจำ 50%',
      subtitle: '50% Queue Deposit',
      desc: 'ชำระมัดจำ 50% เพื่อล็อกคิวและเริ่มตัดต่อทันที (กรณีงานด่วน 24 ชม. ชำระเต็มจำนวน + ค่าบริการด่วน 50%)',
      icon: CreditCard,
      badgeBg: 'bg-coquette-priceBlue text-[#236AB9] border-coquette-priceBorder',
      iconBg: 'bg-[#4A96E6] text-white',
    },
    {
      num: '03',
      title: 'รับ Draft ติดลายน้ำ & แก้ไข',
      subtitle: 'Review Draft (2 Free Edits)',
      desc: 'ตรวจเช็กงานดราฟต์แรกแบบติดลายน้ำ สามารถแจ้งปรับแก้ไขได้ฟรี 2 ครั้งภายในขอบเขตบรีฟเดิม',
      icon: Film,
      badgeBg: 'bg-[#EEF9E1] text-[#3B6218] border-[#B4DE81]',
      iconBg: 'bg-[#5E8B34] text-white',
    },
    {
      num: '04',
      title: 'ชำระส่วนที่เหลือ + รับไฟล์ HD/4K',
      subtitle: 'Final Payment & Delivery',
      desc: 'ชำระยอดคงเหลือ 50% และรับลิงก์ดาวน์โหลดไฟล์จริงความละเอียดสูง HD/4K แบบไม่มีลายน้ำทาง Google Drive',
      icon: CloudDownload,
      badgeBg: 'bg-coquette-roseBg text-coquette-crimson border-coquette-roseLight',
      iconBg: 'bg-coquette-crimson text-white',
    },
  ]

  return (
    <section className="coquette-card p-6 sm:p-10 relative overflow-hidden">
      {/* Corner & Floating Decorations */}
      <div className="absolute -top-2 -left-2 pointer-events-none opacity-85 transform -rotate-12">
        <RibbonBow size={44} />
      </div>
      <div className="absolute -top-2 -right-2 pointer-events-none opacity-85 transform rotate-12">
        <RibbonBow size={44} />
      </div>
      <div className="hidden sm:block absolute bottom-4 left-6 pointer-events-none opacity-55">
        <CloverLeaf size={30} />
      </div>
      <div className="hidden sm:block absolute bottom-4 right-6 pointer-events-none opacity-55">
        <CloverLeaf size={30} />
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#EEF9E1] border border-[#B4DE81] text-[11px] font-bold text-[#3B6218] uppercase tracking-wider">
          <CloverLeaf size={12} />
          <span>4-Step Visual Workflow</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <StarSparkle size={18} className="text-coquette-rose animate-sparkle" />
          <h2 className="text-2xl sm:text-4xl font-bold text-coquette-rose font-display italic">
            ขั้นตอนการสั่งตัดต่อง่าย ๆ ใน 4 ขั้นตอน
          </h2>
          <StarSparkle size={18} className="text-coquette-rose animate-sparkle" />
        </div>
        <p className="text-xs sm:text-sm text-coquette-brownMuted">
          ส่งฟุตเทจ → มัดจำ 50% → รับ Draft ติดลายน้ำ → จ่ายส่วนที่เหลือ + รับไฟล์ HD/4K ทาง Google Drive
        </p>
      </div>

      {/* 4-Step Visual Stepper Grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div key={step.num} className="relative flex flex-col">
              {/* Desktop connector arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-12 -right-3.5 z-20 w-7 h-7 rounded-full bg-white border-2 border-coquette-roseLight text-coquette-rose items-center justify-center shadow-2xs">
                  <ArrowRight size={13} />
                </div>
              )}

              <div className="flex-1 p-5 rounded-3xl bg-coquette-bgCream border-2 border-coquette-roseLight/80 hover:border-coquette-rose transition-all flex flex-col justify-between relative overflow-hidden group shadow-2xs">
                {/* Decorative clover/sparkle watermark */}
                <div className="absolute -bottom-2 -right-2 opacity-15 pointer-events-none group-hover:scale-110 transition-transform">
                  {idx % 2 === 0 ? <CloverLeaf size={56} /> : <RibbonBow size={56} />}
                </div>

                <div>
                  {/* Top Row: Icon + Step Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border ${step.badgeBg}`}
                    >
                      STEP {step.num}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-coquette-brownMuted block">
                    {step.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-coquette-brown mt-0.5 mb-2 group-hover:text-coquette-rose transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-coquette-brownMuted leading-relaxed relative z-10">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-coquette-roseLight/60 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/calculator"
          className="btn-coquette-rose px-6 py-3 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center space-x-2"
        >
          <Calculator size={16} />
          <span>คำนวณเรทราคาและสรุปบรีฟ</span>
        </Link>
        <a
          href="https://line.me/R/ti/p/@882xaxoy"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full bg-white border-2 border-coquette-roseLight hover:border-coquette-rose text-coquette-rose text-xs sm:text-sm font-semibold transition inline-flex items-center space-x-2"
        >
          <MessageCircle size={16} />
          <span>สอบถามทาง LINE (@882xaxoy)</span>
        </a>
      </div>
    </section>
  )
}
