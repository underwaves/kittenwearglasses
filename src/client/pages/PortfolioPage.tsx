import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorks, getWorkById, Work } from '../utils/api'
import { WorkCard } from '../components/WorkCard'
import { VideoModal } from '../components/VideoModal'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { Film, Smartphone, Monitor, Layers } from 'lucide-react'

export const PortfolioPage: React.FC = () => {
  const { id: routeWorkId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedOrientation, setSelectedOrientation] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modal
  const [activeWork, setActiveWork] = useState<Work | null>(null)

  useEffect(() => {
    document.title = 'ผลงานตัดต่อวิดีโอทั้งหมด | @kittenwearglasses'
  }, [])

  useEffect(() => {
    async function fetchWorksList() {
      try {
        setLoading(true)
        const data = await getWorks()
        setWorks(data)
      } catch (err) {
        console.error('Error fetching works:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorksList()
  }, [])

  // Handle direct route /portfolio/:id
  useEffect(() => {
    if (!routeWorkId) {
      setActiveWork(null)
      return
    }

    const numericId = parseInt(routeWorkId, 10)
    if (isNaN(numericId)) return

    const foundInList = works.find((w) => w.id === numericId)
    if (foundInList) {
      setActiveWork(foundInList)
      document.title = `${foundInList.title} | ผลงานตัดต่อ @kittenwearglasses`
    } else if (!loading) {
      getWorkById(numericId).then((fetched) => {
        if (fetched) {
          setActiveWork(fetched)
          document.title = `${fetched.title} | ผลงานตัดต่อ @kittenwearglasses`
        }
      })
    }
  }, [routeWorkId, works, loading])

  const handleSelectWork = (work: Work) => {
    setActiveWork(work)
    navigate(`/portfolio/${work.id}`)
  }

  const handleCloseModal = () => {
    setActiveWork(null)
    document.title = 'ผลงานตัดต่อวิดีโอทั้งหมด | @kittenwearglasses'
    if (routeWorkId) {
      navigate('/portfolio', { replace: true })
    }
  }

  // Filter logic
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchOrientation =
        selectedOrientation === 'all' || work.orientation === selectedOrientation
      const matchCategory =
        selectedCategory === 'all' || work.category === selectedCategory
      return matchOrientation && matchCategory
    })
  }, [works, selectedOrientation, selectedCategory])

  const categories = ['all', 'Shorts/Reels/TikTok', 'Vlog', 'อื่นๆ']

  return (
    <div className="space-y-8 pt-2">
      {/* Editorial Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <StarSparkle size={11} />
          <span>Our Showreel &amp; Works</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Portfolio Gallery
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-lg mx-auto">
          รวมผลงานตัดต่อวิดีโอจาก @kittenwearglasses ทั้งแนวตั้งและแนวนอน กดที่การ์ดเพื่อเปิดดูคลิปตัวอย่างหรือคัดลอกลิงก์แชร์ได้ทันทีค่ะ 🎀
        </p>
      </div>

      {/* Modern Segmented Filter Toolbar */}
      <div className="coquette-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coquette-roseLight/50 pb-4">
          {/* Orientation Segmented Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-bold text-coquette-brown uppercase tracking-wider flex items-center space-x-1.5">
              <Film size={14} className="text-coquette-rose" />
              <span>สัดส่วนวิดีโอ:</span>
            </span>

            <div className="inline-flex bg-coquette-bgCream border border-coquette-roseLight/80 rounded-full p-1 space-x-1">
              {[
                { id: 'all', label: 'ทั้งหมด', icon: null },
                { id: 'vertical', label: 'แนวตั้ง (9:16)', icon: Smartphone },
                { id: 'horizontal', label: 'แนวนอน (16:9)', icon: Monitor },
              ].map((btn) => {
                const Icon = btn.icon
                const active = selectedOrientation === btn.id
                return (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedOrientation(btn.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      active
                        ? 'bg-coquette-rose text-white shadow-coquette-sm'
                        : 'text-coquette-brown hover:text-coquette-rose hover:bg-white/70'
                    }`}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{btn.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Count pill */}
          <div className="text-xs font-medium text-coquette-brownMuted bg-coquette-bgCream px-3 py-1.5 rounded-full border border-coquette-roseLight/60 self-start md:self-auto">
            แสดงผลงาน <strong className="text-coquette-rose">{filteredWorks.length}</strong> รายการ
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-coquette-brown flex items-center space-x-1.5 mr-1">
            <Layers size={14} className="text-coquette-rose" />
            <span>หมวดหมู่:</span>
          </span>
          {categories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-coquette-priceBlue text-coquette-rose border-2 border-coquette-priceBorder shadow-xs'
                    : 'bg-white text-coquette-brownMuted hover:text-coquette-rose border border-coquette-roseLight/70'
                }`}
              >
                {cat === 'all' ? 'ทุกหมวดหมู่' : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Works */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="coquette-card aspect-[9/16] animate-pulse bg-coquette-roseBg/40 flex items-center justify-center"
            >
              <StarSparkle size={28} className="text-coquette-roseLight animate-spin" />
            </div>
          ))}
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="coquette-card p-12 text-center space-y-3">
          <RibbonBow size={44} className="opacity-60" />
          <h3 className="text-lg font-bold text-coquette-rose">
            ไม่พบผลงานตามเงื่อนไขที่เลือก
          </h3>
          <p className="text-xs sm:text-sm text-coquette-brownMuted">
            ลองปรับตัวกรองแนววิดีโอหรือหมวดหมู่อื่นเพื่อดูผลงานเพิ่มเติมได้นะคะ
          </p>
          <button
            onClick={() => {
              setSelectedOrientation('all')
              setSelectedCategory('all')
            }}
            className="btn-coquette-rose px-6 py-2.5 rounded-full text-xs font-semibold"
          >
            แสดงผลงานทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} onSelect={handleSelectWork} />
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeWork && (
        <VideoModal
          isOpen={!!activeWork}
          onClose={handleCloseModal}
          videoUrl={activeWork.video_url}
          title={activeWork.title}
          workId={activeWork.id}
          orientation={activeWork.orientation}
          provider={activeWork.provider}
        />
      )}
    </div>
  )
}
