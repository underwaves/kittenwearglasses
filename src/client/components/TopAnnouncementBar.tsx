import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveAnnouncement, Announcement } from '../utils/api'
import { StarSparkle } from './decorations/StarSparkle'
import { X, ArrowRight } from 'lucide-react'

export const TopAnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const active = await getActiveAnnouncement()
        if (active) {
          const storageKey = `dismissed_announcement_${active.id}`
          if (sessionStorage.getItem(storageKey) === '1') {
            setDismissed(true)
          } else {
            setAnnouncement(active)
          }
        }
      } catch {
        // ignore error
      }
    }
    load()
  }, [])

  if (!announcement || dismissed) return null

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(`dismissed_announcement_${announcement.id}`, '1')
    } catch {
      // ignore storage error
    }
    setDismissed(true)
  }

  // Strictly check URL safety: allows only safe internal relative paths or http/https URLs
  const linkType: 'internal' | 'external' | null = (() => {
    const url = announcement.link_url?.trim()
    if (!url) return null
    if (url.startsWith('/') && !url.startsWith('//')) {
      if (/[\0-\x1F\s\\<>"]/.test(url)) return null
      return 'internal'
    }
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return 'external'
      }
    } catch {
      return null
    }
    return null
  })()

  return (
    <div
      role="region"
      aria-label="ประกาศจากทางร้าน"
      className="bg-coquette-roseBg border-b border-coquette-roseLight text-coquette-brown px-3 py-2 text-xs sm:text-sm relative z-50 shadow-2xs"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
          <StarSparkle size={12} className="text-coquette-rose hidden sm:inline-block" />
          <span className="font-medium leading-snug">{announcement.message}</span>

          {linkType && (
            linkType === 'internal' ? (
              <Link
                to={announcement.link_url}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold hover:bg-coquette-roseDark transition shadow-2xs"
              >
                <span>{announcement.link_label || 'ดูรายละเอียด'}</span>
                <ArrowRight size={11} />
              </Link>
            ) : (
              <a
                href={announcement.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-coquette-rose text-white text-[11px] font-semibold hover:bg-coquette-roseDark transition shadow-2xs"
              >
                <span>{announcement.link_label || 'ดูรายละเอียด'}</span>
                <ArrowRight size={11} />
              </a>
            )
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="ปิดแถบประกาศชั่วคราว"
          className="p-1 rounded-full text-coquette-brown hover:text-coquette-rose hover:bg-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-coquette-rose flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
