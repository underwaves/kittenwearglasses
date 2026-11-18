import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { parseVideoUrl } from '../../shared/videoParser'
import { Play, Pause, Volume2, VolumeX, Music, Disc3, Minimize2, Sparkles } from 'lucide-react'

// Default aesthetic, copyright-free lofi track if admin has not set one yet
const DEFAULT_YOUTUBE_URL = 'https://www.youtube.com/watch?v=jfKfPfyJRdk'

export const BackgroundMusicPlayer: React.FC = () => {
  const location = useLocation()
  const { settings } = useSettings()

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const userPausedRef = useRef(false)

  // Strictly disabled on admin dashboard
  const isAdmin = location.pathname.startsWith('/admin')
  const isEnabled = settings.bg_music_enabled !== '0' && !isAdmin
  const isAutoplay = settings.bg_music_autoplay !== '0'

  // Resolve YouTube Video ID
  const musicUrl = (settings.bg_music_youtube_url || DEFAULT_YOUTUBE_URL).trim()
  const videoId: string | null = (() => {
    if (!musicUrl) return null
    if (/^[a-zA-Z0-9_-]{11}$/.test(musicUrl)) {
      return musicUrl
    }
    const parsed = parseVideoUrl(musicUrl)
    if (parsed.success && parsed.data?.provider === 'youtube' && parsed.data.id) {
      return parsed.data.id
    }
    return null
  })()

  const musicTitle = settings.bg_music_title || 'เพลงบรรเลงน่ารัก คลอเบาๆ 🎀'

  // PostMessage Command helper to YouTube IFrame API
  const sendCommand = (func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    } catch {
      // Ignore communication error
    }
  }

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsReady(true)
    // Set default pleasant background volume (45%)
    sendCommand('setVolume', [45])
    if (isAutoplay && !userPausedRef.current) {
      sendCommand('playVideo')
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      sendCommand('pauseVideo')
      userPausedRef.current = true
      setIsPlaying(false)
    } else {
      sendCommand('playVideo')
      sendCommand('setVolume', [45])
      userPausedRef.current = false
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      sendCommand('unMute')
      setIsMuted(false)
    } else {
      sendCommand('mute')
      setIsMuted(true)
    }
  }

  // Listen for iframe state messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data !== 'string') return
      try {
        const data = JSON.parse(e.data)
        if (data.event === 'onStateChange') {
          // 1: playing, 2: paused, 0: ended
          if (data.info === 1) setIsPlaying(true)
          if (data.info === 2) setIsPlaying(false)
          if (data.info === 0) {
            // Loop playback
            sendCommand('playVideo')
          }
        }
      } catch {
        // Not a JSON message
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Autoplay fallback: if initial unmuted autoplay is blocked by browser policy without user gesture,
  // trigger on the first user interaction anywhere on the page (click, touch, scroll, keydown)
  useEffect(() => {
    if (!isEnabled || !videoId || !isAutoplay || isPlaying) return

    const triggerAutoplayOnGesture = () => {
      if (userPausedRef.current) return
      sendCommand('playVideo')
      sendCommand('setVolume', [45])
      setIsPlaying(true)
      cleanup()
    }

    const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll']
    const cleanup = () => {
      events.forEach((ev) => window.removeEventListener(ev, triggerAutoplayOnGesture))
    }

    events.forEach((ev) => {
      window.addEventListener(ev, triggerAutoplayOnGesture, { once: true, passive: true })
    })

    return () => cleanup()
  }, [isEnabled, videoId, isAutoplay, isPlaying])

  if (!isEnabled || !videoId) {
    return null
  }

  return (
    <>
      {/* Hidden YouTube Audio Stream IFrame */}
      <iframe
        ref={iframeRef}
        key={videoId}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&version=3&loop=1&playlist=${videoId}&autoplay=1&controls=0&modestbranding=1`}
        title="Website Background Music Stream"
        onLoad={handleIframeLoad}
        aria-hidden="true"
        tabIndex={-1}
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 pointer-events-none opacity-0"
        allow="autoplay; encrypted-media"
      />

      {/* Floating Coquette Music Widget */}
      <aside
        aria-label="เครื่องเล่นเพลงพื้นหลัง"
        className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-40 select-none pointer-events-auto animate-fade-in"
      >
        {isExpanded ? (
          <div className="bg-white/95 backdrop-blur-xl border-2 border-coquette-roseLight rounded-full pl-2.5 pr-3 py-1.5 sm:pl-3 sm:pr-3.5 sm:py-2 shadow-coquette-lg flex items-center space-x-2 sm:space-x-3 max-w-[280px] sm:max-w-[340px] transition-all duration-300">
            {/* Spinning Vinyl Record Disc */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'หยุดเล่นเพลง' : 'เล่นเพลง'}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-coquette-brown to-[#2B0F0B] flex items-center justify-center text-white shadow-xs flex-shrink-0 group focus:outline-none"
            >
              <Disc3
                size={20}
                className={`text-coquette-roseLight transition-transform duration-700 ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'opacity-85'
                }`}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </span>
            </button>

            {/* Song Title & Equalizer Waves */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-coquette-rose truncate block leading-tight">
                  {musicTitle}
                </span>
                {isPlaying && (
                  <span className="flex items-end space-x-0.5 h-2.5 flex-shrink-0">
                    <span className="w-0.5 h-2 bg-coquette-rose rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-coquette-rose rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-coquette-rose rounded-full animate-pulse [animation-delay:300ms]" />
                  </span>
                )}
              </div>
              <span className="text-[9px] text-coquette-brownMuted block leading-none mt-0.5">
                {isPlaying ? 'กำลังเล่นเพลงคลอ...' : 'แตะที่ใดก็ได้เพื่อเล่นเพลง 🎀'}
              </span>
            </div>

            {/* Controls: Play/Pause, Mute, Minimize */}
            <div className="flex items-center space-x-1 flex-shrink-0 border-l border-coquette-roseLight/60 pl-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'หยุดเล่น' : 'เล่นเพลง'}
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-coquette-roseBg hover:bg-coquette-rose text-coquette-rose hover:text-white transition-colors flex items-center justify-center focus:outline-none"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-coquette-bgCream hover:bg-coquette-roseBg text-coquette-brown hover:text-coquette-rose transition-colors flex items-center justify-center focus:outline-none"
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="ย่อเครื่องเล่นเพลง"
                title="ย่อเครื่องเล่นเพลง"
                className="w-6 h-6 rounded-full text-coquette-brownMuted hover:text-coquette-rose transition-colors flex items-center justify-center focus:outline-none"
              >
                <Minimize2 size={11} />
              </button>
            </div>
          </div>
        ) : (
          /* Minimized Badge Button */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-label="เปิดแผงควบคุมเพลง"
            className="group relative flex items-center space-x-1.5 bg-white/95 backdrop-blur-md border-2 border-coquette-roseLight hover:border-coquette-rose rounded-full px-2.5 py-1.5 shadow-coquette hover:shadow-coquette-lg hover:scale-105 active:scale-95 transition-all text-coquette-rose focus:outline-none"
          >
            <div className="relative w-6 h-6 rounded-full bg-coquette-brown flex items-center justify-center text-white flex-shrink-0">
              <Disc3
                size={16}
                className={`text-coquette-roseLight ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              />
            </div>
            <span className="text-[10.5px] font-bold text-coquette-rose flex items-center space-x-1">
              <Music size={11} />
              <span>{isPlaying ? 'เพลงคลอ 🎀' : 'เปิดเพลง'}</span>
            </span>
            {isPlaying && (
              <span className="w-2 h-2 rounded-full bg-coquette-rose animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        )}
      </aside>
    </>
  )
}
