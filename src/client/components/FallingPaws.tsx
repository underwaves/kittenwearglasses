import React, { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import catPawImg from '../assets/cat-paw.png'

interface PawParticle {
  id: number
  left: number // %
  size: number // px
  duration: number // seconds for vertical fall
  delay: number // seconds (negative for instant spread)
  swayDuration: number // seconds for horizontal sway
  swayDelay: number // seconds
  sway: number // px
  initRot: number // deg
  endRot: number // deg
  maxOpacity: number
  isForeground?: boolean
}

// 14 pre-computed aesthetic falling paws with uniform linear fall speed and gentle sway
// Most (~70%) float in background behind the cards; a few (~30%) randomly float across the cards in foreground
const PARTICLES: PawParticle[] = [
  // Background particles (float behind the cards)
  { id: 1, left: 5, size: 28, duration: 14.5, delay: -2.5, swayDuration: 3.6, swayDelay: -0.5, sway: 24, initRot: -14, endRot: 28, maxOpacity: 0.6, isForeground: false },
  { id: 2, left: 13, size: 22, duration: 15.5, delay: -8.0, swayDuration: 4.2, swayDelay: -1.8, sway: 18, initRot: 20, endRot: -22, maxOpacity: 0.5, isForeground: false },
  { id: 4, left: 29, size: 24, duration: 15.8, delay: -11.5, swayDuration: 4.0, swayDelay: -0.9, sway: 20, initRot: 16, endRot: -26, maxOpacity: 0.55, isForeground: false },
  { id: 5, left: 38, size: 28, duration: 14.2, delay: -1.2, swayDuration: 3.5, swayDelay: -3.1, sway: 22, initRot: -18, endRot: 24, maxOpacity: 0.6, isForeground: false },
  { id: 7, left: 54, size: 20, duration: 16.2, delay: -7.0, swayDuration: 4.4, swayDelay: -1.4, sway: 16, initRot: 12, endRot: -18, maxOpacity: 0.45, isForeground: false },
  { id: 8, left: 62, size: 32, duration: 14.0, delay: -9.5, swayDuration: 3.4, swayDelay: -2.7, sway: 28, initRot: -16, endRot: 35, maxOpacity: 0.7, isForeground: false },
  { id: 10, left: 78, size: 22, duration: 15.8, delay: -13.0, swayDuration: 4.3, swayDelay: -3.5, sway: 18, initRot: 18, endRot: -28, maxOpacity: 0.5, isForeground: false },
  { id: 11, left: 86, size: 28, duration: 14.5, delay: -5.5, swayDuration: 3.6, swayDelay: -1.2, sway: 24, initRot: -15, endRot: 26, maxOpacity: 0.65, isForeground: false },
  { id: 13, left: 34, size: 22, duration: 16.0, delay: -14.2, swayDuration: 4.1, swayDelay: -2.1, sway: 19, initRot: -12, endRot: 20, maxOpacity: 0.5, isForeground: false },
  { id: 14, left: 68, size: 24, duration: 15.0, delay: -4.0, swayDuration: 3.8, swayDelay: -1.5, sway: 21, initRot: 15, endRot: -25, maxOpacity: 0.55, isForeground: false },

  // Foreground particles (randomly float across/in front of the cards)
  { id: 3, left: 22, size: 26, duration: 13.8, delay: -4.5, swayDuration: 3.8, swayDelay: -2.2, sway: 25, initRot: -10, endRot: 32, maxOpacity: 0.5, isForeground: true },
  { id: 6, left: 47, size: 25, duration: 14.8, delay: -6.2, swayDuration: 3.7, swayDelay: -1.0, sway: 22, initRot: -16, endRot: 26, maxOpacity: 0.48, isForeground: true },
  { id: 9, left: 73, size: 27, duration: 14.2, delay: -7.8, swayDuration: 3.7, swayDelay: -2.0, sway: 24, initRot: 20, endRot: -24, maxOpacity: 0.52, isForeground: true },
  { id: 12, left: 93, size: 24, duration: 15.2, delay: -10.5, swayDuration: 3.9, swayDelay: -2.5, sway: 20, initRot: 18, endRot: -22, maxOpacity: 0.46, isForeground: true },
]

interface FallingPawsProps {
  layer?: 'background' | 'foreground' | 'all'
}

export const FallingPaws: React.FC<FallingPawsProps> = ({ layer = 'all' }) => {
  const location = useLocation()
  const { settings } = useSettings()
  const [isVisible, setIsVisible] = useState(true)

  // Disable on admin pages or if explicitly disabled in settings
  const isAdmin = location.pathname.startsWith('/admin')
  const isEnabled = settings.paws_enabled !== '0' && !isAdmin

  useEffect(() => {
    if (!isEnabled) return

    // Accessibility: check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setIsVisible(false)
      return
    }

    // Performance: Pause when tab is hidden to save 100% of background resources
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isEnabled])

  const activeParticles = useMemo(() => {
    if (layer === 'background') return PARTICLES.filter((p) => !p.isForeground)
    if (layer === 'foreground') return PARTICLES.filter((p) => p.isForeground)
    return PARTICLES
  }, [layer])

  if (!isEnabled || !isVisible || activeParticles.length === 0) {
    return null
  }

  const zIndexClass = layer === 'foreground' ? 'z-20' : 'z-0'

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden ${zIndexClass}`}
    >
      {activeParticles.map((p) => {
        const trackStyle: React.CSSProperties = {
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          opacity: p.maxOpacity,
        }

        const bodyStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          animationDuration: `${p.swayDuration}s`,
          animationDelay: `${p.swayDelay}s`,
          ['--paw-sway' as any]: `${p.sway}px`,
          ['--paw-init-rot' as any]: `${p.initRot}deg`,
          ['--paw-end-rot' as any]: `${p.endRot}deg`,
          filter: p.isForeground
            ? 'drop-shadow(0 2px 5px rgba(224, 152, 172, 0.2))'
            : 'drop-shadow(0 3px 6px rgba(224, 152, 172, 0.25))',
        }

        return (
          <div key={p.id} className="falling-paw-track" style={trackStyle}>
            <img
              src={catPawImg}
              alt=""
              className="falling-paw-body"
              style={bodyStyle}
              loading="eager"
              decoding="async"
            />
          </div>
        )
      })}
    </div>
  )
}
