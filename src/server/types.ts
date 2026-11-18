export interface Env {
  // Bindings
  DB: D1Database
  MEDIA: R2Bucket
  ASSETS?: Fetcher

  // Secrets
  ADMIN_PASSWORD?: string
  SESSION_SECRET?: string
}

export interface WorkRecord {
  id: number
  title: string
  category: string
  orientation: 'vertical' | 'horizontal'
  video_url: string
  provider: 'youtube' | 'tiktok' | 'drive'
  video_id: string
  cover_key: string
  is_featured: number
  is_visible: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ServiceRecord {
  id: number
  title: string
  duration_label: string
  price_label: string
  price_num: number
  description: string
  features: string // JSON string
  badge: string
  image_key?: string
  sort_order: number
  is_visible: number
  created_at: string
  updated_at: string
}

export interface AddonRecord {
  id: number
  category: string
  name: string
  price_label: string
  price_num: number
  note: string
  sort_order: number
  is_visible: number
  created_at: string
  updated_at: string
}

export interface TermRecord {
  id: number
  step_number: number
  title: string
  content: string
  icon_type: string
  sort_order: number
  is_visible: number
  created_at: string
  updated_at: string
}

export interface PromotionRecord {
  id: number
  title: string
  description: string
  price_label: string
  conditions: string
  banner_key: string
  start_date: string
  end_date: string
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AnnouncementRecord {
  id: number
  message: string
  link_url: string
  link_label: string
  start_date: string
  end_date: string
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ReviewRecord {
  id: number
  image_key: string
  caption: string
  is_visible: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FaqRecord {
  id: number
  question: string
  answer: string
  sort_order: number
  is_visible: number
  created_at: string
  updated_at: string
}
