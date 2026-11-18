import { Hono } from 'hono'
import {
  Env,
  WorkRecord,
  ServiceRecord,
  AddonRecord,
  TermRecord,
  PromotionRecord,
  AnnouncementRecord,
  ReviewRecord,
  FaqRecord,
} from '../types'

export const publicRouter = new Hono<{ Bindings: Env }>()

/**
 * Gets the current date string in Thailand timezone (Asia/Bangkok, UTC+7) as 'YYYY-MM-DD'.
 */
export function getThailandToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

// Allowed public settings keys that the client frontend is permitted to consume.
// Internal calculation rates needed by the calculator are included, but internal admin secrets are strictly excluded.
const PUBLIC_SETTINGS_KEYS = [
  'shop_name',
  'shop_tagline',
  'shop_logo',
  'line_id',
  'line_url',
  'tiktok_url',
  'announcement',
  'hero_description',
  'queue_status',
  'queue_note',
  'queue_updated_at',
  'rush_fee_percent',
  'deposit_percent',
  'srt_fee',
  'srt_mode',
  'paws_enabled',
  'floating_menu_enabled',
  'bg_music_youtube_url',
  'bg_music_enabled',
  'bg_music_title',
  'bg_music_autoplay',
]

// GET /api/works - List visible works
publicRouter.get('/works', async (c) => {
  const category = c.req.query('category')
  const orientation = c.req.query('orientation')
  const featured = c.req.query('featured')

  let sql = 'SELECT * FROM works WHERE is_visible = 1'
  const params: any[] = []

  if (category && category !== 'ทั้งหมด') {
    sql += ' AND category = ?'
    params.push(category)
  }

  if (orientation && (orientation === 'vertical' || orientation === 'horizontal')) {
    sql += ' AND orientation = ?'
    params.push(orientation)
  }

  if (featured === '1' || featured === 'true') {
    sql += ' AND is_featured = 1'
  }

  sql += ' ORDER BY sort_order ASC, id DESC'

  const { results } = await c.env.DB.prepare(sql).bind(...params).all<WorkRecord>()

  return c.json({
    success: true,
    data: results,
  })
})

// GET /api/works/:id - Get a single visible work
publicRouter.get('/works/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) {
    return c.json({ success: false, error: 'รหัสผลงานไม่ถูกต้อง' }, 400)
  }

  const work = await c.env.DB.prepare('SELECT * FROM works WHERE id = ? AND is_visible = 1')
    .bind(id)
    .first<WorkRecord>()

  if (!work) {
    return c.json({ success: false, error: 'ไม่พบผลงานนี้' }, 404)
  }

  return c.json({
    success: true,
    data: work,
  })
})

// GET /api/services - Get visible services, addons, and terms
publicRouter.get('/services', async (c) => {
  const [servicesResult, addonsResult, termsResult] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM services WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC').all<ServiceRecord>(),
    c.env.DB.prepare('SELECT * FROM addons WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC').all<AddonRecord>(),
    c.env.DB.prepare('SELECT * FROM terms WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC').all<TermRecord>(),
  ])

  const formattedServices = servicesResult.results.map((service) => {
    let parsedFeatures: string[] = []
    try {
      parsedFeatures = JSON.parse(service.features)
    } catch {
      parsedFeatures = []
    }
    return {
      ...service,
      featuresList: parsedFeatures,
    }
  })

  return c.json({
    success: true,
    data: {
      services: formattedServices,
      addons: addonsResult.results,
      terms: termsResult.results,
    },
  })
})

// GET /api/promotions - Get active promotions filtered by both start_date and end_date in Thailand timezone
publicRouter.get('/promotions', async (c) => {
  const today = getThailandToday()

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM promotions 
     WHERE is_active = 1 
     AND (start_date IS NULL OR start_date = '' OR start_date <= ?)
     AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
     ORDER BY sort_order ASC, id DESC`
  )
    .bind(today, today)
    .all<PromotionRecord>()

  return c.json({
    success: true,
    data: results,
  })
})

// GET /api/settings - Return ONLY public settings keys
publicRouter.get('/settings', async (c) => {
  const placeholders = PUBLIC_SETTINGS_KEYS.map(() => '?').join(', ')
  const { results } = await c.env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN (${placeholders})`
  )
    .bind(...PUBLIC_SETTINGS_KEYS)
    .all<{ key: string; value: string }>()

  const settingsMap: Record<string, string> = {}
  for (const row of results) {
    settingsMap[row.key] = row.value
  }

  return c.json({
    success: true,
    data: settingsMap,
  })
})

// GET /api/queue - Public queue status
publicRouter.get('/queue', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('queue_status', 'queue_note', 'queue_updated_at')`
  ).all<{ key: string; value: string }>()

  const map: Record<string, string> = {
    queue_status: 'open',
    queue_note: '',
    queue_updated_at: '',
  }
  for (const row of results) {
    map[row.key] = row.value
  }

  return c.json({
    success: true,
    data: map,
  })
})

// GET /api/announcements/active - Get current active announcement in Thailand timezone
publicRouter.get('/announcements/active', async (c) => {
  const today = getThailandToday()

  const topAnnouncement = await c.env.DB.prepare(
    `SELECT * FROM announcements
     WHERE is_active = 1
     AND (start_date IS NULL OR start_date = '' OR start_date <= ?)
     AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
     ORDER BY sort_order ASC, id DESC
     LIMIT 1`
  )
    .bind(today, today)
    .first<AnnouncementRecord>()

  return c.json({
    success: true,
    data: topAnnouncement || null,
  })
})

// GET /api/reviews - Get visible customer reviews
publicRouter.get('/reviews', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM reviews WHERE is_visible = 1 ORDER BY sort_order ASC, id DESC'
  ).all<ReviewRecord>()

  return c.json({
    success: true,
    data: results,
  })
})

// GET /api/faqs - Get visible FAQs
publicRouter.get('/faqs', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM faqs WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC'
  ).all<FaqRecord>()

  return c.json({
    success: true,
    data: results,
  })
})
