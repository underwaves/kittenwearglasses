import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

interface PawPoint {
  id: number
  x: number
  y: number
  rotation: number
}

const MAX_PAW_ELEMENTS = 12

export const PawTrail: React.FC = () => {
  const [paws, setPaws] = useState<PawPoint[]>([])
  const location = useLocation()
  const { settings } = useSettings()
  const lastTimeRef = useRef(0)
  const idCounterRef = useRef(0)

  // Disable in admin pages or if explicitly turned off in settings
  const isAdmin = location.pathname.startsWith('/admin')
  const isEnabled = settings.paws_enabled !== '0' && !isAdmin

  useEffect(() => {
    if (!isEnabled) {
      setPaws([])
      return
    }

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      return
    }

    let isDocumentVisible = !document.hidden

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden
      if (!isDocumentVisible) {
        setPaws([])
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDocumentVisible) return

      const now = performance.now()
      // Throttle spawn rate to every 180ms
      if (now - lastTimeRef.current < 180) return
      lastTimeRef.current = now

      const newId = ++idCounterRef.current
      const randomRot = (Math.random() - 0.5) * 40

      setPaws((prev) => {
        const next = [...prev, { id: newId, x: e.clientX, y: e.clientY, rotation: randomRot }]
        if (next.length > MAX_PAW_ELEMENTS) {
          return next.slice(next.length - MAX_PAW_ELEMENTS)
        }
        return next
      })

      // Clean up single paw after animation duration
      setTimeout(() => {
        setPaws((prev) => prev.filter((p) => p.id !== newId))
      }, 1500)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isEnabled])

  if (!isEnabled || paws.length === 0) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    >
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ease-out opacity-25"
          style={{
            left: `${paw.x}px`,
            top: `${paw.y}px`,
            transform: `translate(-50%, -50%) rotate(${paw.rotation}deg)`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 100 100" fill="#E098AC">
            {/* Main pad */}
            <ellipse cx="50" cy="65" rx="24" ry="20" />
            {/* Toe pads */}
            <circle cx="26" cy="36" r="10" />
            <circle cx="42" cy="24" r="10" />
            <circle cx="58" cy="24" r="10" />
            <circle cx="74" cy="36" r="10" />
          </svg>
        </div>
      ))}
    </div>
  )
}
