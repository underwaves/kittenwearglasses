import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorks, getWorkById, Work } from '../utils/api'
import { WorkCard } from '../components/WorkCard'
import { VideoModal } from '../components/VideoModal'
import { RibbonBow } from '../components/decorations/RibbonBow'
import { StarSparkle } from '../components/decorations/StarSparkle'
import { Film, Smartphone, Monitor, Layers, Palette, Sparkles } from 'lucide-react'
import { getWorkType, WorkMainType, CONTENT_CATEGORIES, GRAPHIC_CATEGORIES } from '../../shared/workTypes'

export const PortfolioPage: React.FC = () => {
  const { id: routeWorkId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedMainType, setSelectedMainType] = useState<WorkMainType>('all')
  const [selectedOrientation, setSelectedOrientation] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modal
  const [activeWork, setActiveWork] = useState<Work | null>(null)

  useEffect(() => {
    document.title = 'ผลงานคอนเทนต์ & กราฟิกดีไซน์ | @kittenwearglasses'
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
      document.title = `${foundInList.title} | ผลงาน @kittenwearglasses`
    } else if (!loading) {
      getWorkById(numericId).then((fetched) => {
        if (fetched) {
          setActiveWork(fetched)
          document.title = `${fetched.title} | ผลงาน @kittenwearglasses`
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
    document.title = 'ผลงานคอนเทนต์ & กราฟิกดีไซน์ | @kittenwearglasses'
    if (routeWorkId) {
      navigate('/portfolio', { replace: true })
    }
  }

  // Calculate counts for badges
  const contentWorksCount = useMemo(() => {
    return works.filter((w) => getWorkType(w.category) === 'content').length
  }, [works])

  const graphicWorksCount = useMemo(() => {
    return works.filter((w) => getWorkType(w.category) === 'graphic').length
  }, [works])

  // Filter logic
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      // 1. Main Type filter (content vs graphic)
      if (selectedMainType !== 'all') {
        const type = getWorkType(work.category)
        if (type !== selectedMainType) return false
      }

      // 2. Orientation filter
      const matchOrientation =
        selectedOrientation === 'all' || work.orientation === selectedOrientation
      if (!matchOrientation) return false

      // 3. Sub-Category filter
      if (selectedCategory !== 'all') {
        if (work.category !== selectedCategory) return false
      }

      return true
    })
  }, [works, selectedMainType, selectedOrientation, selectedCategory])

  // Available sub-categories based on selectedMainType
  const availableCategories = useMemo(() => {
    if (selectedMainType === 'content') {
      const activeCats = Array.from(
        new Set(
          works
            .filter((w) => getWorkType(w.category) === 'content')
            .map((w) => w.category)
        )
      )
      return ['all', ...Array.from(new Set([...activeCats, ...CONTENT_CATEGORIES]))]
    }
    if (selectedMainType === 'graphic') {
      const activeCats = Array.from(
        new Set(
          works
            .filter((w) => getWorkType(w.category) === 'graphic')
            .map((w) => w.category)
        )
      )
      return ['all', ...Array.from(new Set([...activeCats, ...GRAPHIC_CATEGORIES]))]
    }

    // 'all'
    const activeCats = Array.from(new Set(works.map((w) => w.category)))
    return ['all', ...activeCats]
  }, [works, selectedMainType])

  return (
    <div className="space-y-8 pt-2">
      {/* Editorial Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-coquette-roseBg border border-coquette-roseLight text-[11px] font-bold text-coquette-rose uppercase tracking-wider">
          <StarSparkle size={11} />
          <span>Our Showreel &amp; Portfolio</span>
        </div>
        <div className="flex items-center justify-center space-x-2.5">
          <RibbonBow size={32} />
          <h1 className="text-3xl sm:text-5xl font-bold text-coquette-rose font-display italic">
            Portfolio Gallery
          </h1>
          <RibbonBow size={32} />
        </div>
        <p className="text-sm sm:text-base text-coquette-brown max-w-2xl mx-auto leading-relaxed">
          รวมผลงานตัดต่อวิดีโอ คอนเทนต์โซเชียลมีเดีย และงานกราฟิกดีไซน์สไตล์ Coquette จาก @kittenwearglasses ทั้งงานคลิปและภาพนิ่ง กดที่การ์ดเพื่อเปิดดูรายละเอียดได้ทันทีค่ะ 🎀
        </p>
      </div>

      {/* Primary Section Switcher: ทั้งหมด / งานคอนเทนต์ / งานกราฟิก */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setSelectedMainType('all')
            setSelectedCategory('all')
          }}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-2 shadow-xs ${
            selectedMainType === 'all'
              ? 'bg-coquette-rose text-white shadow-coquette-md scale-105 ring-2 ring-coquette-roseLight'
              : 'bg-white/95 text-coquette-brown hover:bg-coquette-roseBg hover:text-coquette-rose border border-coquette-roseLight/80'
          }`}
        >
          <Sparkles size={15} />
          <span>ผลงานทั้งหมด ({works.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedMainType('content')
            setSelectedCategory('all')
          }}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-2 shadow-xs ${
            selectedMainType === 'content'
              ? 'bg-coquette-rose text-white shadow-coquette-md scale-105 ring-2 ring-coquette-roseLight'
              : 'bg-white/95 text-coquette-brown hover:bg-coquette-roseBg hover:text-coquette-rose border border-coquette-roseLight/80'
          }`}
        >
          <Film size={15} />
          <span>🎬 งานคอนเทนต์ ({contentWorksCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedMainType('graphic')
            setSelectedCategory('all')
          }}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-2 shadow-xs ${
            selectedMainType === 'graphic'
              ? 'bg-coquette-rose text-white shadow-coquette-md scale-105 ring-2 ring-coquette-roseLight'
              : 'bg-white/95 text-coquette-brown hover:bg-coquette-roseBg hover:text-coquette-rose border border-coquette-roseLight/80'
          }`}
        >
          <Palette size={15} />
          <span>🎨 งานกราฟิก ({graphicWorksCount})</span>
        </button>
      </div>

      {/* Modern Segmented Filter Toolbar */}
      <div className="coquette-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coquette-roseLight/50 pb-4">
          {/* Orientation Segmented Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-bold text-coquette-brown uppercase tracking-wider flex items-center space-x-1.5">
              <Film size={14} className="text-coquette-rose" />
              <span>สัดส่วนชิ้นงาน:</span>
            </span>

            <div className="inline-flex bg-coquette-bgCream border border-coquette-roseLight/80 rounded-full p-1 space-x-1">
              {[
                { id: 'all', label: 'ทั้งหมด', icon: null },
                { id: 'vertical', label: 'แนวตั้ง (9:16 / โปสเตอร์)', icon: Smartphone },
                { id: 'horizontal', label: 'แนวนอน (16:9 / ปกคลิป)', icon: Monitor },
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
            <span>หมวดหมู่ย่อย:</span>
          </span>
          {availableCategories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-coquette-priceBlue text-coquette-rose border-2 border-coquette-priceBorder shadow-xs'
                    : 'bg-white text-coquette-brownMuted hover:text-coquette-rose border border-coquette-roseLight/70'
                }`}
              >
                {cat === 'all'
                  ? selectedMainType === 'content'
                    ? 'ทุกงานคอนเทนต์'
                    : selectedMainType === 'graphic'
                    ? 'ทุกงานกราฟิก'
                    : 'ทุกหมวดหมู่'
                  : cat}
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
            ลองปรับแท็บประเภทงานหลัก หรือเลือกหมวดหมู่อื่นเพื่อดูผลงานเพิ่มเติมได้นะคะ
          </p>
          <button
            onClick={() => {
              setSelectedMainType('all')
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

      {/* Video / Artwork Modal Player */}
      {activeWork && (
        <VideoModal
          isOpen={!!activeWork}
          onClose={handleCloseModal}
          videoUrl={activeWork.video_url}
          title={activeWork.title}
          workId={activeWork.id}
          orientation={activeWork.orientation}
          provider={activeWork.provider}
          category={activeWork.category}
          coverKey={activeWork.cover_key}
        />
      )}
    </div>
  )
}
