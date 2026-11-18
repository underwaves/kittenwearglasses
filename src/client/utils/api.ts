export interface Work {
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

export interface Service {
  id: number
  title: string
  duration_label: string
  price_label: string
  price_num: number
  description: string
  features: string
  featuresList?: string[]
  badge: string
  image_key?: string
  sort_order: number
  is_visible: number
}

export interface Addon {
  id: number
  category: string
  name: string
  price_label: string
  price_num: number
  note: string
  sort_order: number
  is_visible: number
}

export interface Term {
  id: number
  step_number: number
  title: string
  content: string
  icon_type: string
  sort_order: number
  is_visible: number
}

export interface Promotion {
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
}

export interface Announcement {
  id: number
  message: string
  link_url: string
  link_label: string
  start_date: string
  end_date: string
  is_active: number
  sort_order: number
  created_at?: string
}

export interface Review {
  id: number
  image_key: string
  caption: string
  is_visible: number
  sort_order: number
  created_at?: string
}

export interface Faq {
  id: number
  question: string
  answer: string
  sort_order: number
  is_visible: number
  created_at?: string
}

export interface QueueInfo {
  queue_status: 'open' | 'filling' | 'closed'
  queue_note: string
  queue_updated_at: string
}

export interface ServicesResponse {
  services: Service[]
  addons: Addon[]
  terms: Term[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  id?: number
}

// ---------------- Public Endpoints ----------------

export async function getWorks(params?: {
  category?: string
  orientation?: string
  featured?: boolean
}): Promise<Work[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.orientation) query.set('orientation', params.orientation)
  if (params?.featured) query.set('featured', '1')

  const res = await fetch(`/api/works?${query.toString()}`)
  const json: ApiResponse<Work[]> = await res.json()
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to load works')
  }
  return json.data
}

export async function getWorkById(id: number): Promise<Work | null> {
  const res = await fetch(`/api/works/${id}`)
  if (!res.ok) return null
  const json: ApiResponse<Work> = await res.json()
  return json.success && json.data ? json.data : null
}

export async function getServices(): Promise<ServicesResponse> {
  const res = await fetch('/api/services')
  const json: ApiResponse<ServicesResponse> = await res.json()
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to load services')
  }
  return json.data
}

export async function getPromotions(): Promise<Promotion[]> {
  const res = await fetch('/api/promotions')
  const json: ApiResponse<Promotion[]> = await res.json()
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to load promotions')
  }
  return json.data
}

export async function getSettings(): Promise<Record<string, string>> {
  const res = await fetch('/api/settings')
  const json: ApiResponse<Record<string, string>> = await res.json()
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to load settings')
  }
  return json.data
}

export async function getQueue(): Promise<QueueInfo> {
  const res = await fetch('/api/queue')
  const json: ApiResponse<QueueInfo> = await res.json()
  if (!json.success || !json.data) {
    return { queue_status: 'open', queue_note: '', queue_updated_at: '' }
  }
  return json.data
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const res = await fetch('/api/announcements/active')
  const json: ApiResponse<Announcement | null> = await res.json()
  return json.success ? json.data || null : null
}

export async function getReviews(): Promise<Review[]> {
  const res = await fetch('/api/reviews')
  const json: ApiResponse<Review[]> = await res.json()
  if (!json.success || !json.data) return []
  return json.data
}

export async function getFaqs(): Promise<Faq[]> {
  const res = await fetch('/api/faqs')
  const json: ApiResponse<Faq[]> = await res.json()
  if (!json.success || !json.data) return []
  return json.data
}

// ---------------- Admin Endpoints ----------------

export async function adminLogin(password: string): Promise<ApiResponse> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminLogout(): Promise<ApiResponse> {
  const res = await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  })
  return await res.json()
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/me', { credentials: 'include' })
    const json = (await res.json()) as { authenticated?: boolean }
    return !!json.authenticated
  } catch {
    return false
  }
}

export async function adminUploadImage(file: File): Promise<{ success: boolean; key?: string; url?: string; error?: string }> {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })
  return await res.json()
}

export async function adminGetWorks(): Promise<Work[]> {
  const res = await fetch('/api/admin/works', { credentials: 'include' })
  const json: ApiResponse<Work[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreateWork(work: Partial<Work>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/works', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(work),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateWork(id: number, work: Partial<Work>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/works/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(work),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteWork(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/works/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

export async function adminReorderWorks(items: { id: number; sort_order: number }[]): Promise<ApiResponse> {
  const res = await fetch('/api/admin/works/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    credentials: 'include',
  })
  return await res.json()
}

// Services CRUD
export async function adminGetServices(): Promise<ServicesResponse> {
  const res = await fetch('/api/admin/services', { credentials: 'include' })
  const json: ApiResponse<ServicesResponse> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreateService(data: Partial<Service>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateService(id: number, data: Partial<Service>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteService(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

// Addons CRUD
export async function adminCreateAddon(data: Partial<Addon>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/addons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateAddon(id: number, data: Partial<Addon>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/addons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteAddon(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/addons/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

// Terms CRUD
export async function adminCreateTerm(data: Partial<Term>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/terms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateTerm(id: number, data: Partial<Term>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/terms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteTerm(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/terms/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

// Promotions CRUD
export async function adminGetPromotions(): Promise<Promotion[]> {
  const res = await fetch('/api/admin/promotions', { credentials: 'include' })
  const json: ApiResponse<Promotion[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreatePromotion(data: Partial<Promotion>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/promotions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdatePromotion(id: number, data: Partial<Promotion>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/promotions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeletePromotion(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/promotions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

// Settings
export async function adminGetSettings(): Promise<Record<string, string>> {
  const res = await fetch('/api/admin/settings', { credentials: 'include' })
  const json: ApiResponse<Record<string, string>> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminUpdateSettings(settings: Record<string, string>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
    credentials: 'include',
  })
  return await res.json()
}

// Queue Status
export async function adminUpdateQueue(data: {
  queue_status: 'open' | 'filling' | 'closed'
  queue_note: string
}): Promise<ApiResponse<QueueInfo>> {
  const res = await fetch('/api/admin/queue', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

// Announcements CRUD
export async function adminGetAnnouncements(): Promise<Announcement[]> {
  const res = await fetch('/api/admin/announcements', { credentials: 'include' })
  const json: ApiResponse<Announcement[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreateAnnouncement(data: Partial<Announcement>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateAnnouncement(id: number, data: Partial<Announcement>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteAnnouncement(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

// Reviews CRUD
export async function adminGetReviews(): Promise<Review[]> {
  const res = await fetch('/api/admin/reviews', { credentials: 'include' })
  const json: ApiResponse<Review[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreateReview(data: Partial<Review>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateReview(id: number, data: Partial<Review>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteReview(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

export async function adminReorderReviews(items: { id: number; sort_order: number }[]): Promise<ApiResponse> {
  const res = await fetch('/api/admin/reviews/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    credentials: 'include',
  })
  return await res.json()
}

// FAQs CRUD
export async function adminGetFaqs(): Promise<Faq[]> {
  const res = await fetch('/api/admin/faqs', { credentials: 'include' })
  const json: ApiResponse<Faq[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error || 'Failed')
  return json.data
}

export async function adminCreateFaq(data: Partial<Faq>): Promise<ApiResponse> {
  const res = await fetch('/api/admin/faqs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminUpdateFaq(id: number, data: Partial<Faq>): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/faqs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  return await res.json()
}

export async function adminDeleteFaq(id: number): Promise<ApiResponse> {
  const res = await fetch(`/api/admin/faqs/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return await res.json()
}

export async function adminReorderFaqs(items: { id: number; sort_order: number }[]): Promise<ApiResponse> {
  const res = await fetch('/api/admin/faqs/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    credentials: 'include',
  })
  return await res.json()
}
