import React, { useState } from 'react'
import { StarSparkle } from './decorations/StarSparkle'
import { useSettings } from '../context/SettingsContext'

export const FloatingLineButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false)
  const { settings } = useSettings()

  const lineId = settings.line_id || '@882xaxoy'
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@882xaxoy'

  return (
    <aside
      aria-label="ติดต่อ LINE OA"
      className="fixed bottom-20 right-3.5 sm:bottom-25 sm:right-6 z-40 flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cute Tooltip Pill */}
      <div
        className={`hidden sm:flex items-center space-x-1.5 mr-3 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-coquette-roseLight shadow-coquette text-xs font-semibold text-coquette-brown transition-all duration-300 ${
          isHovered
            ? 'opacity-100 translate-x-0'
            : 'opacity-90 translate-x-1 hover:opacity-100'
        }`}
      >
        <StarSparkle size={12} className="text-coquette-rose animate-spin" />
        <span>ทักไลน์สอบถามคิวงาน {lineId}</span>
      </div>

      {/* Main Floating Button */}
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`ติดต่อทาง LINE OA ${lineId}`}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#06C755] text-white flex items-center justify-center shadow-coquette-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#06C755]/40"
      >
        {/* Cute Sparkle Accent */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-coquette-rose flex items-center justify-center border-2 border-white shadow-sm animate-bounce z-10">
          <StarSparkle size={11} color="#FFFFFF" />
        </div>

        {/* Crisp Centered LINE Speech Bubble SVG */}
        <svg
          className="w-8 h-8 sm:w-9 sm:h-9"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Centered White Chat Bubble */}
          <path
            d="M50 18C29.5 18 13 31.4 13 48C13 62.8 26.1 75.2 43.8 77.6C45.3 77.9 47.3 78.6 47.8 79.8C48.3 80.9 48.1 82.6 47.9 83.8L47.2 87.9C46.9 89.4 46.1 93.2 51.8 90.7C57.5 88.2 82.2 72.8 83.2 71.6C85.8 68.7 87 58.6 87 48C87 31.4 70.5 18 50 18Z"
            fill="#FFFFFF"
          />
          {/* Crisp L I N E Letters inside Bubble */}
          <g
            stroke="#06C755"
            strokeWidth="4.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* L */}
            <path d="M27 41V55H35" />
            {/* I */}
            <path d="M42 41V55" />
            {/* N */}
            <path d="M49 55V41L59 55V41" />
            {/* E */}
            <path d="M74 41H66V55H74M66 48H72.5" />
          </g>
        </svg>
      </a>
    </aside>
  )
}
