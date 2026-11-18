import { Hono, Context } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { z } from 'zod'
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
import {
  createSessionToken,
  verifySessionToken,
  revokeSessionToken,
  timingSafeEqualString,
} from '../utils/crypto'
import { adminAuthMiddleware, SESSION_COOKIE_NAME } from '../middleware/auth'
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  getTrustedClientIp,
} from '../middleware/rateLimit'
import { parseVideoUrl } from '../../shared/videoParser'
import { validateImageBuffer } from '../utils/imageValidator'
import { isSafeLinkUrl } from '../utils/safeUrl'
import { getThailandToday } from './public'

export const adminRouter = new Hono<{ Bindings: Env }>()

// Helper to safely parse JSON body; returns 400 Bad Request on invalid JSON instead of 500
async function getJsonBody<T = any>(
  c: Context
): Promise<{ success: true; data: T } | { success: false; res: Response }> {
  try {
    const data = await c.req.json<T>()
    return { success: true, data }
  } catch {
    return {
      success: false,
      res: c.json({ success: false, error: 'รูปแบบข้อมูล JSON ไม่ถูกต้อง' }, 400),
    }
  }
}

// Checks if an R2 object key is still referenced by any other record before deleting
async function isKeyInUse(
  db: D1Database,
  cleanKey: string,
  excludeTable?: string,
  excludeId?: number
): Promise<boolean> {
  const mediaUrl = `/media/${cleanKey}`
  const checks = [
    { table: 'works', col: 'cover_key' },
    { table: 'services', col: 'image_key' },
    { table: 'promotions', col: 'banner_key' },
    { table: 'reviews', col: 'image_key' },
  ]

  for (const { table, col } of checks) {
    let sql = `SELECT COUNT(*) as cnt FROM ${table} WHERE (${col} = ? OR ${col} = ?)`
    const params: (string | number)[] = [cleanKey, mediaUrl]
    if (excludeTable === table && excludeId !== undefined) {
      sql += ` AND id != ?`
      params.push(excludeId)
    }
    try {
      const res = await db.prepare(sql).bind(...params).first<{ cnt: number }>()
      if (res && res.cnt > 0) return true
    } catch {
      // Table might not exist or error, continue
    }
  }

  try {
    const settingRes = await db
      .prepare('SELECT COUNT(*) as cnt FROM settings WHERE value = ? OR value = ?')
      .bind(cleanKey, mediaUrl)
      .first<{ cnt: number }>()
    if (settingRes && settingRes.cnt > 0) return true
  } catch {
    // Ignore setting check error
  }

  return false
}

// Safely deletes an R2 object if it is internal and not referenced elsewhere
async function deleteR2Object(
  bucket: R2Bucket,
  db: D1Database,
  keyOrUrl: string | undefined | null,
  excludeTable?: string,
  excludeId?: number
) {
  if (!keyOrUrl || typeof keyOrUrl !== 'string') return
  const cleanKey = keyOrUrl.replace(/^\/media\//, '').trim()
  if (!cleanKey || cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) return

  try {
    const inUse = await isKeyInUse(db, cleanKey, excludeTable, excludeId)
    if (!inUse) {
      await bucket.delete(cleanKey)
    }
  } catch (err) {
    console.error('Error checking or deleting R2 object:', err)
  }
}

// Common Reorder Schema
const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive('รหัสรายการต้องเป็นจำนวนเต็มบวก'),
        sort_order: z.number().int().min(0).max(100000, 'ลำดับต้องอยู่ระหว่าง 0 ถึง 100000'),
      })
    )
    .min(1, 'ต้องมีรายการอย่างน้อย 1 รายการ')
    .max(500, 'รายการต้องไม่เกิน 500 รายการ'),
})

// ==========================================
// 1. AUTHENTICATION (PUBLIC ENDPOINTS)
// ==========================================

const loginSchema = z.object({
  password: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .max(256, 'รหัสผ่านมีความยาวเกินกำหนด'),
})

// POST /api/admin/login
adminRouter.post('/login', async (c) => {
  const adminPassword = c.env.ADMIN_PASSWORD
  const sessionSecret = c.env.SESSION_SECRET

  // Reject login securely if secrets are not configured - NEVER use fallback credentials
  if (
    !adminPassword ||
    typeof adminPassword !== 'string' ||
    adminPassword.trim() === '' ||
    !sessionSecret ||
    typeof sessionSecret !== 'string' ||
    sessionSecret.trim() === ''
  ) {
    console.error('Missing required ADMIN_PASSWORD or SESSION_SECRET configuration')
    return c.json(
      {
        success: false,
        error:
          'ระบบความปลอดภัยยังไม่ได้ตั้งค่ารหัสผ่านหรือความลับเซสชัน กรุณาตั้งค่า ADMIN_PASSWORD และ SESSION_SECRET ใน Worker Secrets',
      },
      500
    )
  }

  const ip = getTrustedClientIp(c.req)

  // Rate limit check: 5 attempts per 15 minutes (fail-closed if D1 is degraded)
  const rateLimit = await checkLoginRateLimit(c.env.DB, ip)
  if (!rateLimit.allowed) {
    return c.json(
      {
        success: false,
        error:
          rateLimit.error ||
          `คุณใส่รหัสผ่านผิดเกินกำหนด กรุณารออีกประมาณ ${
            rateLimit.remainingMinutes || 15
          } นาที ก่อนลองใหม่อีกครั้ง`,
      },
      429
    )
  }

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = loginSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { password } = parsed.data

  // Constant-time password comparison to prevent timing side-channels
  const isMatch = await timingSafeEqualString(password, adminPassword)

  if (!isMatch) {
    const attempts = await recordFailedLogin(c.env.DB, ip)
    const remaining = Math.max(0, 5 - attempts)
    return c.json(
      {
        success: false,
        error: `รหัสผ่านไม่ถูกต้อง (เหลือโอกาสลองอีก ${remaining} ครั้ง)`,
      },
      401
    )
  }

  // Password correct: atomically reset rate limit attempts
  await resetLoginAttempts(c.env.DB, ip)

  // Generate 7-day HMAC session token with embedded unique session UUID
  const token = await createSessionToken(sessionSecret, 7 * 24 * 60 * 60 * 1000)
  if (!token) {
    return c.json({ success: false, error: 'ไม่สามารถสร้างเซสชันที่ปลอดภัยได้' }, 500)
  }

  const isHttps = c.req.url.startsWith('https://')

  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })

  return c.json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
  })
})

// POST /api/admin/logout - Revokes session token in D1 and deletes cookie
adminRouter.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME)
  if (token && c.env.DB) {
    await revokeSessionToken(c.env.DB, token)
  }

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/',
  })

  return c.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ',
  })
})

// GET /api/admin/me - Verify current session
adminRouter.get('/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME)
  const sessionSecret = c.env.SESSION_SECRET

  if (!sessionSecret || typeof sessionSecret !== 'string' || sessionSecret.trim() === '') {
    return c.json({ success: true, authenticated: false })
  }

  const isValid = await verifySessionToken(token, sessionSecret, c.env.DB)

  return c.json({
    success: true,
    authenticated: isValid,
  })
})

// ==========================================
// APPLY AUTH MIDDLEWARE TO ALL BELOW ROUTES
// ==========================================
adminRouter.use('/*', adminAuthMiddleware)

// ==========================================
// 2. IMAGE UPLOAD (R2) WITH MAGIC BYTES CHECK
// ==========================================
adminRouter.post('/upload-image', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = (formData.get('image') || formData.get('file')) as File | null

    if (!file) {
      return c.json({ success: false, error: 'กรุณาเลือกไฟล์ภาพที่ต้องการอัปโหลด' }, 400)
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: false, error: 'ขนาดไฟล์ภาพต้องไม่เกิน 5 MB' }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()

    // Validate actual binary contents/magic bytes (Accepts only real JPEG, PNG, WebP; rejects SVG and fake files)
    const validation = validateImageBuffer(arrayBuffer)
    if (!validation.valid || !validation.mime || !validation.extension) {
      return c.json(
        {
          success: false,
          error:
            validation.error ||
            'ไฟล์ที่อัปโหลดไม่ใช่รูปภาพที่รองรับ (รองรับเฉพาะ JPEG, PNG หรือ WebP แท้เท่านั้น)',
        },
        400
      )
    }

    // Generate random R2 key without path traversal or user-controlled filename
    const randomId = crypto.randomUUID().slice(0, 12)
    const key = `covers/${Date.now()}-${randomId}.${validation.extension}`

    await c.env.MEDIA.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: validation.mime,
      },
    })

    return c.json({
      success: true,
      key,
      url: `/media/${key}`,
    })
  } catch (err) {
    console.error('Error during image upload:', err)
    return c.json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ภาพ' }, 500)
  }
})

// ==========================================
// 3. WORKS MANAGEMENT
// ==========================================

const workSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุชื่อผลงาน')
    .max(200, 'ชื่อผลงานต้องไม่เกิน 200 ตัวอักษร'),
  category: z
    .string()
    .trim()
    .min(1, 'กรุณาเลือกหมวดหมู่')
    .max(100, 'หมวดหมู่ต้องไม่เกิน 100 ตัวอักษร'),
  orientation: z.enum(['vertical', 'horizontal'], {
    error: 'แนววิดีโอต้องเป็น vertical หรือ horizontal',
  }),
  video_url: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกลิงก์วิดีโอ')
    .max(1000, 'ลิงก์วิดีโอยาวเกินไป'),
  cover_key: z
    .string()
    .trim()
    .max(500, 'ลิงก์ภาพปกยาวเกินไป')
    .optional()
    .default(''),
  is_featured: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
})

// GET /api/admin/works
adminRouter.get('/works', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM works ORDER BY sort_order ASC, id DESC'
  ).all<WorkRecord>()
  return c.json({ success: true, data: results })
})

// POST /api/admin/works
adminRouter.post('/works', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = workSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { title, category, orientation, video_url, cover_key, is_featured, is_visible, sort_order } =
    parsed.data

  const videoParse = parseVideoUrl(video_url)
  if (!videoParse.success) {
    return c.json({ success: false, error: videoParse.error }, 400)
  }

  const { provider, id: video_id } = videoParse.data

  let finalCoverKey = cover_key?.trim() || ''
  if (!finalCoverKey && provider === 'youtube') {
    finalCoverKey = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`
  }

  if (!finalCoverKey && (provider === 'tiktok' || provider === 'drive')) {
    return c.json(
      {
        success: false,
        error: `สำหรับวิดีโอจาก ${
          provider === 'tiktok' ? 'TikTok' : 'Google Drive'
        } จำเป็นต้องอัปโหลดภาพปกผลงานด้วยค่ะ`,
      },
      400
    )
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO works (title, category, orientation, video_url, provider, video_id, cover_key, is_featured, is_visible, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      category,
      orientation,
      video_url,
      provider,
      video_id,
      finalCoverKey,
      is_featured,
      is_visible,
      sort_order
    )
    .run()

  return c.json({
    success: true,
    message: 'เพิ่มผลงานเรียบร้อยแล้ว',
    id: result.meta.last_row_id,
  })
})

// PUT /api/admin/works/:id
adminRouter.put('/works/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM works WHERE id = ?')
    .bind(id)
    .first<WorkRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบผลงานที่ต้องการแก้ไข' }, 404)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = workSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { title, category, orientation, video_url, cover_key, is_featured, is_visible, sort_order } =
    parsed.data

  const videoParse = parseVideoUrl(video_url)
  if (!videoParse.success) {
    return c.json({ success: false, error: videoParse.error }, 400)
  }

  const { provider, id: video_id } = videoParse.data

  let finalCoverKey = cover_key?.trim() || ''
  if (!finalCoverKey && provider === 'youtube') {
    finalCoverKey = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`
  }

  if (!finalCoverKey && (provider === 'tiktok' || provider === 'drive')) {
    return c.json(
      {
        success: false,
        error: `สำหรับวิดีโอจาก ${
          provider === 'tiktok' ? 'TikTok' : 'Google Drive'
        } จำเป็นต้องอัปโหลดภาพปกผลงานด้วยค่ะ`,
      },
      400
    )
  }

  if (existing.cover_key && existing.cover_key !== finalCoverKey) {
    await deleteR2Object(c.env.MEDIA, c.env.DB, existing.cover_key, 'works', id)
  }

  await c.env.DB.prepare(
    `UPDATE works 
     SET title = ?, category = ?, orientation = ?, video_url = ?, provider = ?, video_id = ?, cover_key = ?, is_featured = ?, is_visible = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      title,
      category,
      orientation,
      video_url,
      provider,
      video_id,
      finalCoverKey,
      is_featured,
      is_visible,
      sort_order,
      id
    )
    .run()

  return c.json({ success: true, message: 'บันทึกการแก้ไขผลงานเรียบร้อยแล้ว' })
})

// DELETE /api/admin/works/:id
adminRouter.delete('/works/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM works WHERE id = ?')
    .bind(id)
    .first<WorkRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบผลงานที่ต้องการลบ' }, 404)

  await deleteR2Object(c.env.MEDIA, c.env.DB, existing.cover_key, 'works', id)
  await c.env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run()

  return c.json({ success: true, message: 'ลบผลงานเรียบร้อยแล้ว' })
})

// POST /api/admin/works/reorder
adminRouter.post('/works/reorder', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = reorderSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลลำดับไม่ถูกต้อง' },
      400
    )
  }

  const statements = parsed.data.items.map((item) =>
    c.env.DB.prepare(
      'UPDATE works SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(item.sort_order, item.id)
  )

  await c.env.DB.batch(statements)

  return c.json({ success: true, message: 'บันทึกลำดับเรียบร้อยแล้ว' })
})

// ==========================================
// 4. SERVICES & ADDONS MANAGEMENT
// ==========================================

const serviceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุชื่อบริการ')
    .max(200, 'ชื่อบริการต้องไม่เกิน 200 ตัวอักษร'),
  duration_label: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุความยาวคลิป')
    .max(100, 'ความยาวคลิปต้องไม่เกิน 100 ตัวอักษร'),
  price_label: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุราคา')
    .max(100, 'ป้ายราคาต้องไม่เกิน 100 ตัวอักษร'),
  price_num: z.number().int().min(0).max(1000000).optional().default(0),
  description: z.string().max(2000, 'คำอธิบายต้องไม่เกิน 2000 ตัวอักษร').optional().default(''),
  features: z
    .array(z.string().max(200))
    .max(30)
    .or(z.string().max(4000))
    .transform((val) => (typeof val === 'string' ? val : JSON.stringify(val))),
  badge: z.string().max(50, 'ป้ายกำกับต้องไม่เกิน 50 ตัวอักษร').optional().default(''),
  image_key: z.string().max(500).optional().default(''),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
})

// GET /api/admin/services
adminRouter.get('/services', async (c) => {
  const [servicesResult, addonsResult, termsResult] = await Promise.all([
    c.env.DB.prepare(
      'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
    ).all<ServiceRecord>(),
    c.env.DB.prepare(
      'SELECT * FROM addons ORDER BY sort_order ASC, id ASC'
    ).all<AddonRecord>(),
    c.env.DB.prepare(
      'SELECT * FROM terms ORDER BY sort_order ASC, id ASC'
    ).all<TermRecord>(),
  ])

  return c.json({
    success: true,
    data: {
      services: servicesResult.results,
      addons: addonsResult.results,
      terms: termsResult.results,
    },
  })
})

// POST /api/admin/services
adminRouter.post('/services', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = serviceSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const {
    title,
    duration_label,
    price_label,
    price_num,
    description,
    features,
    badge,
    image_key,
    sort_order,
    is_visible,
  } = parsed.data

  await c.env.DB.prepare(
    `INSERT INTO services (title, duration_label, price_label, price_num, description, features, badge, image_key, sort_order, is_visible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      duration_label,
      price_label,
      price_num,
      description,
      features,
      badge,
      image_key,
      sort_order,
      is_visible
    )
    .run()

  return c.json({ success: true, message: 'เพิ่มแพ็กเกจบริการสำเร็จ' })
})

// PUT /api/admin/services/:id
adminRouter.put('/services/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบแพ็กเกจบริการที่ต้องการแก้ไข' }, 404)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = serviceSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const {
    title,
    duration_label,
    price_label,
    price_num,
    description,
    features,
    badge,
    image_key,
    sort_order,
    is_visible,
  } = parsed.data

  if (existing.image_key && existing.image_key !== image_key) {
    await deleteR2Object(c.env.MEDIA, c.env.DB, existing.image_key, 'services', id)
  }

  await c.env.DB.prepare(
    `UPDATE services
     SET title = ?, duration_label = ?, price_label = ?, price_num = ?, description = ?, features = ?, badge = ?, image_key = ?, sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      title,
      duration_label,
      price_label,
      price_num,
      description,
      features,
      badge,
      image_key,
      sort_order,
      is_visible,
      id
    )
    .run()

  return c.json({ success: true, message: 'บันทึกบริการสำเร็จ' })
})

// DELETE /api/admin/services/:id
adminRouter.delete('/services/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบแพ็กเกจบริการที่ต้องการลบ' }, 404)

  if (existing.image_key) {
    await deleteR2Object(c.env.MEDIA, c.env.DB, existing.image_key, 'services', id)
  }

  await c.env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'ลบแพ็กเกจบริการสำเร็จ' })
})

// Addons CRUD
const addonSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุหมวดบริการเสริม')
    .max(50, 'หมวดหมู่ต้องไม่เกิน 50 ตัวอักษร'),
  name: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุชื่อบริการเสริม')
    .max(200, 'ชื่อบริการเสริมต้องไม่เกิน 200 ตัวอักษร'),
  price_label: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุราคา')
    .max(100, 'ป้ายราคาต้องไม่เกิน 100 ตัวอักษร'),
  price_num: z.number().int().min(0).max(1000000).optional().default(0),
  note: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional().default(''),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
})

adminRouter.post('/addons', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = addonSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }
  const { category, name, price_label, price_num, note, sort_order, is_visible } = parsed.data

  await c.env.DB.prepare(
    'INSERT INTO addons (category, name, price_label, price_num, note, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(category, name, price_label, price_num, note, sort_order, is_visible)
    .run()

  return c.json({ success: true, message: 'เพิ่มบริการเสริมสำเร็จ' })
})

adminRouter.put('/addons/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = addonSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }
  const { category, name, price_label, price_num, note, sort_order, is_visible } = parsed.data

  await c.env.DB.prepare(
    'UPDATE addons SET category = ?, name = ?, price_label = ?, price_num = ?, note = ?, sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  )
    .bind(category, name, price_label, price_num, note, sort_order, is_visible, id)
    .run()

  return c.json({ success: true, message: 'บันทึกบริการเสริมสำเร็จ' })
})

adminRouter.delete('/addons/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  await c.env.DB.prepare('DELETE FROM addons WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'ลบบริการเสริมสำเร็จ' })
})

// Terms CRUD
const termSchema = z.object({
  step_number: z.number().int().min(0).max(20).optional().default(0),
  title: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุหัวข้อ')
    .max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร'),
  content: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุรายละเอียด')
    .max(2000, 'รายละเอียดต้องไม่เกิน 2000 ตัวอักษร'),
  icon_type: z.string().max(50).optional().default('info'),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
})

adminRouter.post('/terms', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = termSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }
  const { step_number, title, content, icon_type, sort_order, is_visible } = parsed.data

  await c.env.DB.prepare(
    'INSERT INTO terms (step_number, title, content, icon_type, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(step_number, title, content, icon_type, sort_order, is_visible)
    .run()

  return c.json({ success: true, message: 'เพิ่มเงื่อนไข/ขั้นตอนสำเร็จ' })
})

adminRouter.put('/terms/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = termSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }
  const { step_number, title, content, icon_type, sort_order, is_visible } = parsed.data

  await c.env.DB.prepare(
    'UPDATE terms SET step_number = ?, title = ?, content = ?, icon_type = ?, sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  )
    .bind(step_number, title, content, icon_type, sort_order, is_visible, id)
    .run()

  return c.json({ success: true, message: 'บันทึกเงื่อนไข/ขั้นตอนสำเร็จ' })
})

adminRouter.delete('/terms/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  await c.env.DB.prepare('DELETE FROM terms WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'ลบเงื่อนไข/ขั้นตอนสำเร็จ' })
})

// ==========================================
// 5. PROMOTIONS MANAGEMENT
// ==========================================

const promoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุชื่อโปรโมชั่น')
    .max(200, 'ชื่อโปรโมชั่นต้องไม่เกิน 200 ตัวอักษร'),
  description: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุรายละเอียด')
    .max(2000, 'รายละเอียดต้องไม่เกิน 2000 ตัวอักษร'),
  price_label: z.string().max(100).optional().default(''),
  conditions: z.string().max(1000).optional().default(''),
  banner_key: z.string().max(500).optional().default(''),
  start_date: z.string().max(50).optional().default(''),
  end_date: z.string().max(50).optional().default(''),
  is_active: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
})

// GET /api/admin/promotions
adminRouter.get('/promotions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM promotions ORDER BY sort_order ASC, id DESC'
  ).all<PromotionRecord>()
  return c.json({ success: true, data: results })
})

// POST /api/admin/promotions
adminRouter.post('/promotions', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = promoSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const {
    title,
    description,
    price_label,
    conditions,
    banner_key,
    start_date,
    end_date,
    is_active,
    sort_order,
  } = parsed.data

  await c.env.DB.prepare(
    `INSERT INTO promotions (title, description, price_label, conditions, banner_key, start_date, end_date, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      description,
      price_label,
      conditions,
      banner_key,
      start_date,
      end_date,
      is_active,
      sort_order
    )
    .run()

  return c.json({ success: true, message: 'เพิ่มโปรโมชั่นสำเร็จ' })
})

// PUT /api/admin/promotions/:id
adminRouter.put('/promotions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?')
    .bind(id)
    .first<PromotionRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบโปรโมชั่นที่ต้องการแก้ไข' }, 404)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = promoSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const {
    title,
    description,
    price_label,
    conditions,
    banner_key,
    start_date,
    end_date,
    is_active,
    sort_order,
  } = parsed.data

  // If banner changed, clean up previous R2 file if not in use elsewhere
  if (existing.banner_key && existing.banner_key !== banner_key) {
    await deleteR2Object(c.env.MEDIA, c.env.DB, existing.banner_key, 'promotions', id)
  }

  await c.env.DB.prepare(
    `UPDATE promotions
     SET title = ?, description = ?, price_label = ?, conditions = ?, banner_key = ?, start_date = ?, end_date = ?, is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      title,
      description,
      price_label,
      conditions,
      banner_key,
      start_date,
      end_date,
      is_active,
      sort_order,
      id
    )
    .run()

  return c.json({ success: true, message: 'บันทึกโปรโมชั่นสำเร็จ' })
})

// DELETE /api/admin/promotions/:id
adminRouter.delete('/promotions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?')
    .bind(id)
    .first<PromotionRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบโปรโมชั่นที่ต้องการลบ' }, 404)

  await deleteR2Object(c.env.MEDIA, c.env.DB, existing.banner_key, 'promotions', id)
  await c.env.DB.prepare('DELETE FROM promotions WHERE id = ?').bind(id).run()

  return c.json({ success: true, message: 'ลบโปรโมชั่นสำเร็จ' })
})

// ==========================================
// 6. SETTINGS MANAGEMENT
// ==========================================

const settingsSchema = z
  .record(
    z.string().min(1, 'คีย์ต้องไม่ว่างเปล่า').max(100, 'คีย์การตั้งค่ายาวเกินไป'),
    z.string().max(2000, 'ค่าการตั้งค่ายาวเกิน 2000 ตัวอักษร')
  )
  .refine((obj) => Object.keys(obj).length <= 50, {
    message: 'จำนวนการตั้งค่าต้องไม่เกิน 50 รายการ',
  })

adminRouter.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM settings').all<{
    key: string
    value: string
  }>()
  const map: Record<string, string> = {}
  for (const r of results) map[r.key] = r.value
  return c.json({ success: true, data: map })
})

adminRouter.post('/settings', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = settingsSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลการตั้งค่าไม่ถูกต้อง' },
      400
    )
  }

  const statements = Object.entries(parsed.data).map(([key, value]) =>
    c.env.DB.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`
    ).bind(key, String(value), String(value))
  )

  await c.env.DB.batch(statements)

  return c.json({ success: true, message: 'บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว' })
})

// ==========================================
// 7. QUEUE STATUS QUICK UPDATE
// ==========================================

const queueSchema = z.object({
  queue_status: z.enum(['open', 'filling', 'closed'], {
    error: 'สถานะคิวต้องเป็น open, filling หรือ closed',
  }),
  queue_note: z.string().max(300, 'ข้อความเสริมต้องไม่เกิน 300 ตัวอักษร').optional().default(''),
})

adminRouter.put('/queue', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = queueSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลสถานะคิวไม่ถูกต้อง' },
      400
    )
  }

  const today = getThailandToday()
  const entries: [string, string][] = [
    ['queue_status', parsed.data.queue_status],
    ['queue_note', parsed.data.queue_note],
    ['queue_updated_at', today],
  ]

  const statements = entries.map(([key, value]) =>
    c.env.DB.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`
    ).bind(key, value, value)
  )

  await c.env.DB.batch(statements)

  return c.json({
    success: true,
    message: 'อัปเดตสถานะคิวงานเรียบร้อยแล้วค่ะ',
    data: {
      queue_status: parsed.data.queue_status,
      queue_note: parsed.data.queue_note,
      queue_updated_at: today,
    },
  })
})

// ==========================================
// 8. ANNOUNCEMENTS MANAGEMENT
// ==========================================

const announcementSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุข้อความประกาศ')
    .max(500, 'ข้อความประกาศต้องไม่เกิน 500 ตัวอักษร'),
  link_url: z
    .string()
    .max(1000, 'ลิงก์ยาวเกินไป')
    .optional()
    .default('')
    .refine(isSafeLinkUrl, {
      message: 'ลิงก์ต้องเป็น relative path ภายใน หรือ URL แบบ http/https เท่านั้น',
    }),
  link_label: z.string().max(100, 'ข้อความปุ่มต้องไม่เกิน 100 ตัวอักษร').optional().default(''),
  start_date: z.string().max(50).optional().default(''),
  end_date: z.string().max(50).optional().default(''),
  is_active: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
})

adminRouter.get('/announcements', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM announcements ORDER BY sort_order ASC, id DESC'
  ).all<AnnouncementRecord>()
  return c.json({ success: true, data: results })
})

adminRouter.post('/announcements', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = announcementSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { message, link_url, link_label, start_date, end_date, is_active, sort_order } =
    parsed.data
  await c.env.DB.prepare(
    `INSERT INTO announcements (message, link_url, link_label, start_date, end_date, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(message, link_url, link_label, start_date, end_date, is_active, sort_order)
    .run()

  return c.json({ success: true, message: 'เพิ่มแถบประกาศเรียบร้อยแล้ว' })
})

adminRouter.put('/announcements/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = announcementSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { message, link_url, link_label, start_date, end_date, is_active, sort_order } =
    parsed.data
  await c.env.DB.prepare(
    `UPDATE announcements
     SET message = ?, link_url = ?, link_label = ?, start_date = ?, end_date = ?, is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(message, link_url, link_label, start_date, end_date, is_active, sort_order, id)
    .run()

  return c.json({ success: true, message: 'บันทึกแถบประกาศเรียบร้อยแล้ว' })
})

adminRouter.delete('/announcements/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  await c.env.DB.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'ลบแถบประกาศเรียบร้อยแล้ว' })
})

// ==========================================
// 9. REVIEWS MANAGEMENT (WITH R2 CLEANUP)
// ==========================================

const reviewSchema = z.object({
  image_key: z
    .string()
    .trim()
    .min(1, 'กรุณาอัปโหลดภาพรีวิว')
    .max(500, 'ลิงก์ภาพรีวิวยาวเกินไป'),
  caption: z.string().max(500, 'คำบรรยายต้องไม่เกิน 500 ตัวอักษร').optional().default(''),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
})

adminRouter.get('/reviews', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM reviews ORDER BY sort_order ASC, id DESC'
  ).all<ReviewRecord>()
  return c.json({ success: true, data: results })
})

adminRouter.post('/reviews', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = reviewSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { image_key, caption, is_visible, sort_order } = parsed.data
  const res = await c.env.DB.prepare(
    `INSERT INTO reviews (image_key, caption, is_visible, sort_order) VALUES (?, ?, ?, ?)`
  )
    .bind(image_key, caption, is_visible, sort_order)
    .run()

  return c.json({ success: true, message: 'เพิ่มรีวิวเรียบร้อยแล้ว', id: res.meta.last_row_id })
})

adminRouter.put('/reviews/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?')
    .bind(id)
    .first<ReviewRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบรีวิวที่ต้องการแก้ไข' }, 404)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = reviewSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { image_key, caption, is_visible, sort_order } = parsed.data
  if (existing.image_key && existing.image_key !== image_key) {
    await deleteR2Object(c.env.MEDIA, c.env.DB, existing.image_key, 'reviews', id)
  }

  await c.env.DB.prepare(
    `UPDATE reviews SET image_key = ?, caption = ?, is_visible = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(image_key, caption, is_visible, sort_order, id)
    .run()

  return c.json({ success: true, message: 'บันทึกรีวิวเรียบร้อยแล้ว' })
})

adminRouter.delete('/reviews/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const existing = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?')
    .bind(id)
    .first<ReviewRecord>()
  if (!existing) return c.json({ success: false, error: 'ไม่พบรีวิวที่ต้องการลบ' }, 404)

  await deleteR2Object(c.env.MEDIA, c.env.DB, existing.image_key, 'reviews', id)
  await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run()

  return c.json({ success: true, message: 'ลบรีวิวเรียบร้อยแล้ว' })
})

adminRouter.post('/reviews/reorder', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = reorderSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลลำดับไม่ถูกต้อง' },
      400
    )
  }

  const statements = parsed.data.items.map((item) =>
    c.env.DB.prepare(
      'UPDATE reviews SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(item.sort_order, item.id)
  )
  await c.env.DB.batch(statements)
  return c.json({ success: true, message: 'บันทึกลำดับรีวิวเรียบร้อยแล้ว' })
})

// ==========================================
// 10. FAQS MANAGEMENT
// ==========================================

const faqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุคำถาม')
    .max(300, 'คำถามต้องไม่เกิน 300 ตัวอักษร'),
  answer: z
    .string()
    .trim()
    .min(1, 'กรุณาระบุคำตอบ')
    .max(2000, 'คำตอบต้องไม่เกิน 2000 ตัวอักษร'),
  sort_order: z.number().int().min(0).max(100000).optional().default(0),
  is_visible: z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0)),
})

adminRouter.get('/faqs', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM faqs ORDER BY sort_order ASC, id ASC'
  ).all<FaqRecord>()
  return c.json({ success: true, data: results })
})

adminRouter.post('/faqs', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = faqSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { question, answer, sort_order, is_visible } = parsed.data
  await c.env.DB.prepare(
    `INSERT INTO faqs (question, answer, sort_order, is_visible) VALUES (?, ?, ?, ?)`
  )
    .bind(question, answer, sort_order, is_visible)
    .run()

  return c.json({ success: true, message: 'เพิ่มคำถามที่พบบ่อยเรียบร้อยแล้ว' })
})

adminRouter.put('/faqs/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = faqSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
      400
    )
  }

  const { question, answer, sort_order, is_visible } = parsed.data
  await c.env.DB.prepare(
    `UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(question, answer, sort_order, is_visible, id)
    .run()

  return c.json({ success: true, message: 'บันทึกคำถามที่พบบ่อยเรียบร้อยแล้ว' })
})

adminRouter.delete('/faqs/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id) || id <= 0) return c.json({ success: false, error: 'ID ไม่ถูกต้อง' }, 400)

  await c.env.DB.prepare('DELETE FROM faqs WHERE id = ?').bind(id).run()
  return c.json({ success: true, message: 'ลบคำถามที่พบบ่อยเรียบร้อยแล้ว' })
})

adminRouter.post('/faqs/reorder', async (c) => {
  const jsonResult = await getJsonBody(c)
  if (!jsonResult.success) return jsonResult.res

  const parsed = reorderSchema.safeParse(jsonResult.data)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message || 'ข้อมูลลำดับไม่ถูกต้อง' },
      400
    )
  }

  const statements = parsed.data.items.map((item) =>
    c.env.DB.prepare(
      'UPDATE faqs SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(item.sort_order, item.id)
  )
  await c.env.DB.batch(statements)
  return c.json({ success: true, message: 'บันทึกลำดับคำถามเรียบร้อยแล้ว' })
})
