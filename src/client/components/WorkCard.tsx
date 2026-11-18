import React, { useState } from 'react'
import { Play, Smartphone, Monitor, ArrowUpRight } from 'lucide-react'
import { Work } from '../utils/api'
import { StarSparkle } from './decorations/StarSparkle'

interface WorkCardProps {
  work: Work
  onSelect: (work: Work) => void
}

export const WorkCard: React.FC<WorkCardProps> = ({ work, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isVertical = work.orientation === 'vertical'

  const coverSrc = work.cover_key.startsWith('http')
    ? work.cover_key
    : `/media/${work.cover_key.replace(/^\/media\//, '')}`

  const providerLabel =
    work.provider === 'youtube'
      ? 'YouTube'
      : work.provider === 'tiktok'
      ? 'TikTok'
      : 'Drive'

  return (
    <div
      onClick={() => onSelect(work)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(work)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`เล่นวิดีโอ ${work.title}`}
      className="group coquette-card coquette-card-hover cursor-pointer overflow-hidden flex flex-col p-2.5 sm:p-3 focus:outline-none focus:ring-4 focus:ring-coquette-rose/30"
    >
      {/* Inset Rounded Thumbnail Container */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-coquette-roseBg/60 border border-coquette-roseLight/60 ${
          isVertical ? 'aspect-[9/16]' : 'aspect-[16/9]'
        }`}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-coquette-roseBg via-coquette-roseLight/30 to-coquette-roseBg flex items-center justify-center">
            <StarSparkle size={24} className="text-coquette-roseLight animate-spin" />
          </div>
        )}

        {/* Cover Image */}
        <img
          src={coverSrc}
          alt={work.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Soft Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-coquette-brown/65 via-transparent to-black/10 opacity-55 group-hover:opacity-75 transition-opacity duration-300" />

        {/* Center Glass Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-coquette-rose/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md text-coquette-rose border-2 border-coquette-roseLight shadow-lg flex items-center justify-center transform group-hover:scale-110 group-hover:bg-coquette-rose group-hover:text-white group-hover:border-white transition-all duration-300">
              <Play size={20} className="ml-0.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/90 text-coquette-brown backdrop-blur-md shadow-xs border border-coquette-roseLight/70 truncate">
            {work.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-coquette-priceBlue/95 text-coquette-rose border border-coquette-priceBorder shadow-xs flex-shrink-0">
            {providerLabel}
          </span>
        </div>

        {/* Featured Star Badge */}
        {work.is_featured === 1 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-coquette-rose/95 backdrop-blur-xs text-white shadow-sm border border-white/40">
            <StarSparkle size={10} color="#FFFFFF" />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="pt-3 px-1.5 pb-1 flex-1 flex flex-col justify-between">
        <h4 className="font-semibold text-coquette-brown group-hover:text-coquette-rose transition-colors line-clamp-2 text-xs sm:text-[15px] leading-snug">
          {work.title}
        </h4>

        <div className="mt-2.5 pt-2 border-t border-coquette-roseLight/40 flex items-center justify-between text-[11px] text-coquette-brownMuted">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-coquette-bgCream border border-coquette-roseLight/60 font-medium">
            {isVertical ? <Smartphone size={11} className="text-coquette-rose" /> : <Monitor size={11} className="text-coquette-rose" />}
            <span>{isVertical ? '9:16 แนวตั้ง' : '16:9 แนวนอน'}</span>
          </span>

          <span className="inline-flex items-center space-x-0.5 text-coquette-rose font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>เล่นคลิป</span>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </div>
  )
}
