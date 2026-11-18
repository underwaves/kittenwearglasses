import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Navbar } from './Navbar'
import { QueueBadge } from './QueueBadge'
import { Footer } from './Footer'
import { PawTrail } from './PawTrail'
import { FallingPaws } from './FallingPaws'
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer'
import { FloatingQuickMenu } from './FloatingQuickMenu'
import { Lock } from 'lucide-react'

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      {/* Background Falling Paws: float behind the cards */}
      <FallingPaws layer="background" />
      <div className="relative z-10">
        <Navbar />
        {/* Global compact queue status badge & Admin shortcut visible on every page */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <QueueBadge variant="pill" />
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/90 hover:bg-coquette-roseBg border border-coquette-roseLight text-xs font-semibold text-coquette-rose shadow-2xs transition hover:scale-[1.02]"
          >
            <Lock size={11} />
            <span>หลังบ้าน</span>
          </Link>
        </div>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <Outlet />
        </main>
      </div>
      {/* Foreground Falling Paws: randomly float across the cards */}
      <FallingPaws layer="foreground" />
      <Footer />
      <PawTrail />
      <BackgroundMusicPlayer />
      <FloatingQuickMenu />
    </div>
  )
}
