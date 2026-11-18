import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSettings } from '../utils/api'

interface SettingsContextType {
  settings: Record<string, string>
  loading: boolean
  refreshSettings: () => Promise<void>
}

const defaultSettings: Record<string, string> = {
  shop_name: '@kittenwearglasses',
  shop_tagline: 'ร้านรับตัดต่อวิดีโอน่ารัก คุมโทนสไตล์ coquette 🎀',
  hero_description: 'รับตัดต่อคลิปสั้น TikTok, Reels, Shorts และ Vlog โทนหวานละมุน ใส่ฟอนต์น่ารัก จังหวะเพลงเป๊ะ พร้อมอัปลงช่องทันที ✨',
  tiktok_url: 'https://www.tiktok.com/@kittenwearglasses',
  line_id: '@882xaxoy',
  line_url: 'https://line.me/R/ti/p/@882xaxoy',
  announcement: '🎀 เปิดรับคิวตัดต่อประจำเดือนนี้แล้วนะคะ ทัก LINE สอบถามคิวได้เลยค่า!',
  shop_logo: '',
  bg_music_youtube_url: '',
  bg_music_enabled: '1',
  bg_music_title: 'เพลงบรรเลงน่ารัก คลอเบาๆ 🎀',
  bg_music_autoplay: '1',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
})

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      const data = await getSettings()
      setSettings((prev) => ({ ...prev, ...data }))
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
