import React, { useEffect, useRef, useState } from 'react'
import { X, ExternalLink, AlertCircle, Link2, Check } from 'lucide-react'
import { parseVideoUrl } from '../../shared/videoParser'
import { RibbonBow } from './decorations/RibbonBow'
import { useToast } from './Toast'

export interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  workId?: number
  orientation?: 'vertical' | 'horizontal'
  provider?: string
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  workId,
  orientation = 'vertical',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const { showToast } = useToast()

  const parsed = parseVideoUrl(videoUrl)
  const embedUrl = parsed.success ? parsed.data.embedUrl : ''
  const effectiveOrientation = orientation || 'vertical'

  const handleCopyShareLink = async () => {
    const shareUrl = workId
      ? `${window.location.origin}/portfolio/${workId}`
      : window.location.href
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      showToast('คัดลอกลิงก์ผลงานเรียบร้อยแล้วค่ะ 🎀', 'success')
      setTimeout(() => setCopiedLink(false), 2200)
    } catch {
      showToast('ไม่สามารถคัดลอกลิงก์ได้', 'error')
    }
  }

  // Focus trap & ESC key handling
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setLoadError(false)
      setCopiedLink(false)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
          return
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements.length === 0) return

          const first = focusableElements[0]
          const last = focusableElements[focusableElements.length - 1]

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-coquette-brown/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        ref={modalRef}
        className={`relative w-full bg-coquette-bgCream border-2 border-coquette-roseLight rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
          effectiveOrientation === 'vertical'
            ? 'max-w-[420px] max-h-[90vh]'
            : 'max-w-4xl max-h-[90vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-coquette-roseLight/60 bg-white/85">
          <div className="flex items-center space-x-2 truncate pr-2">
            <RibbonBow size={24} />
            <h3
              id="video-modal-title"
              className="text-sm sm:text-base font-bold text-coquette-rose truncate"
              title={title}
            >
              {title}
            </h3>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-coquette-roseBg text-coquette-rose border border-coquette-roseLight hover:bg-coquette-rose hover:text-white transition-colors inline-flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-coquette-rose"
              aria-label="คัดลอกลิงก์ผลงานนี้"
            >
              {copiedLink ? (
                <>
                  <Check size={13} />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Link2 size={13} />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-1.5 rounded-full text-coquette-brown hover:text-coquette-rose hover:bg-coquette-roseBg transition-colors focus:outline-none focus:ring-2 focus:ring-coquette-rose"
              aria-label="ปิดวิดีโอ"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* TikTok helper tip */}
        {parsed.success && parsed.data.provider === 'tiktok' && (
          <div className="px-3.5 py-2 bg-[#FFF8F0] border-b border-coquette-roseLight/60 flex items-center justify-between text-[11px] text-coquette-brown">
            <span className="truncate pr-2">
              🎀 สามารถกดเปิดดูคลิปต้นฉบับคมชัดเต็มจอบนแอป TikTok ได้เลยค่ะ
            </span>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-bold text-coquette-rose hover:underline flex-shrink-0"
            >
              <span>เปิดดูบน TikTok</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Video Player Container */}
        <div
          className={`relative w-full bg-black flex items-center justify-center ${
            effectiveOrientation === 'vertical'
              ? 'aspect-[9/16] max-h-[75vh]'
              : 'aspect-[16/9]'
          }`}
        >
          {embedUrl && !loadError ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="p-6 text-center text-white bg-coquette-brown flex flex-col items-center justify-center space-y-3">
              <AlertCircle size={36} className="text-coquette-roseLight" />
              <p className="text-sm font-medium">
                {loadError
                  ? 'ไม่สามารถเล่นวิดีโอในหน้านี้ได้ชั่วคราว'
                  : 'วิดีโออาจถูกตั้งค่าความเป็นส่วนตัว หรือต้องเปิดดูจากแอปต้นทาง'}
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-coquette-rose text-white text-xs sm:text-sm font-medium rounded-full shadow hover:bg-coquette-roseDark transition"
              >
                <span>เปิดดูที่ต้นทาง</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Footer info & Original link */}
        <div className="px-4 py-2.5 bg-coquette-bgCream flex items-center justify-between text-xs text-coquette-brownMuted border-t border-coquette-roseLight/40">
          <span className="truncate">
            {parsed.success
              ? `แหล่งที่มา: ${
                  parsed.data.provider === 'youtube'
                    ? 'YouTube'
                    : parsed.data.provider === 'tiktok'
                    ? 'TikTok'
                    : 'Google Drive'
                }`
              : ''}
          </span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coquette-rose font-medium hover:underline inline-flex items-center space-x-1 ml-2 flex-shrink-0"
          >
            <span>เปิดดูที่ต้นทาง</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}
