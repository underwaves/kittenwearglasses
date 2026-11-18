-- 0004_phase2_features.sql
-- Phase 2 tables: announcements, reviews, faqs + new settings keys for calculator & queue status

-- 1. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  link_url TEXT DEFAULT '',
  link_label TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_announcements_active_sort ON announcements(is_active, sort_order ASC);

-- 2. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  caption TEXT DEFAULT '',
  is_visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_reviews_visible_sort ON reviews(is_visible, sort_order ASC);

-- 3. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_faqs_visible_sort ON faqs(is_visible, sort_order ASC);

-- 4. Seed New Settings Keys (Queue & Calculator Config)
INSERT OR IGNORE INTO settings (key, value) VALUES
('queue_status', 'open'),
('queue_note', 'คิวว่างพร้อมเริ่มงานทันที ทักส่งบรีฟได้ตลอดเลยค่ะ 🎀'),
('queue_updated_at', '2026-11-17'),
('rush_fee_percent', '50'),
('deposit_percent', '50'),
('srt_fee', '50');

-- 5. Seed Sample Active Top Announcement
INSERT INTO announcements (message, link_url, link_label, start_date, end_date, is_active, sort_order)
VALUES (
  '🎀 ใหม่! ลองคำนวณเรทราคาตัดต่อเบื้องต้นและส่งบรีฟเข้า LINE ได้ทันทีที่หน้าเครื่องคิดราคา',
  '/calculator',
  'ลองคำนวณราคา →',
  '2025-01-01',
  '2027-12-31',
  1,
  1
);

-- 6. Seed Sample Customer Reviews
INSERT INTO reviews (image_key, caption, is_visible, sort_order)
VALUES
(
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop&q=80',
  'รีวิวจากลูกค้าช่อง TikTok บิวตี้: งานไวมาก โทนสีชมพูละมุนถูกใจสุด ๆ ฟอนต์น่ารักเข้ากับคลิปมากค่ะ 🎀',
  1,
  1
),
(
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  'รีวิวจากลูกค้า Vlog คาเฟ่: ตัดจังหวะเพลงเป๊ะมาก ซับไทยอ่านง่าย ส่งดราฟต์ไว แนะนำเลยค่ะ ✨',
  1,
  2
),
(
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'รีวิวจากลูกค้า Reels รีวิวสินค้า: ลูกค้าชมว่าคลิปดูน่าซื้อขึ้นเยอะเลย กลับมาจ้างซ้ำรอบที่ 3 แล้วค่า 💕',
  1,
  3
);

-- 7. Seed 7 FAQs based on Shop Rules
INSERT INTO faqs (question, answer, sort_order, is_visible)
VALUES
(
  'ต้องเตรียมและส่งฟุตเทจให้ทางร้านอย่างไร?',
  'ลูกค้าสามารถอัปโหลดไฟล์วิดีโอฟุตเทจทั้งหมดลงใน Google Drive (ตั้งค่าสิทธิ์เป็น "ทุกคนที่มีลิงก์ดูได้") พร้อมส่งสคริปต์ข้อความ ลำดับเรื่องราว และลิงก์ตัวอย่างสไตล์ที่ชอบ (Ref.) มาทาง LINE OA (@882xaxoy) ได้เลยค่ะ',
  1,
  1
),
(
  'ต้องชำระเงินมัดจำเท่าไหร่ก่อนเริ่มงาน?',
  'สำหรับงานปกติ ชำระมัดจำ 50% ของยอดประเมินเพื่อล็อกคิวและเริ่มงานทันที และชำระอีก 50% ที่เหลือเมื่อตรวจอนุมัติ Draft เรียบร้อยแล้วค่ะ (สำหรับงานด่วนภายใน 24 ชม. ชำระเต็มจำนวน 100% พร้อมค่าบริการด่วนก่อนเริ่มงานค่ะ)',
  2,
  1
),
(
  'สามารถแก้ไขงานได้กี่ครั้ง มีค่าใช้จ่ายเพิ่มเติมไหม?',
  'แก้ไขงานฟรีได้ 2 ครั้ง ภายในขอบเขตบรีฟเดิมค่ะ หากต้องการแก้ไขเกิน 2 ครั้ง หรือปรับแก้เพิ่มเติมจากบรีฟเดิม จะมีค่าบริการเพิ่มครั้งละ 100–200 บาท ตามความซับซ้อนของงานค่ะ',
  3,
  1
),
(
  'ใช้ระยะเวลาในการตัดต่อนานแค่ไหน?',
  'ปกติใช้เวลาจัดทำ 2–4 วันทำการต่อ 1 คลิป (นับจากวันที่ได้รับฟุตเทจ บรีฟ และยอดมัดจำครบถ้วน) ทั้งนี้ขึ้นอยู่กับความยาวและความซับซ้อนของคลิปค่ะ',
  4,
  1
),
(
  'กรณีต้องการงานด่วนภายใน 24 ชั่วโมง คิดราคาอย่างไร?',
  'งานด่วนรับไฟล์ภายใน 24 ชั่วโมง จะมีค่าบริการด่วนเพิ่มเติม +50% จากยอดรวมปกติ และชำระยอดเต็มจำนวนก่อนเริ่มงาน สามารถทัก LINE เพื่อเช็กคิวด่วนว่างก่อนได้ค่ะ',
  5,
  1
),
(
  'จะได้รับไฟล์งานจริงผ่านช่องทางไหน ความละเอียดเท่าไหร่?',
  'ระหว่างตรวจงานร้านจะส่งเป็นไฟล์ Draft ติดลายน้ำให้เช็กก่อน เมื่ออนุมัติและชำระยอดคงเหลือครบแล้ว ทางร้านจะส่งลิงก์ Google Drive สำหรับดาวน์โหลดไฟล์จริงความละเอียดสูง (Full HD 1080p / 4K) แบบไม่มีลายน้ำค่ะ',
  6,
  1
),
(
  'หากต้องการยกเลิกงานระหว่างดำเนินการ สามารถขอคืนเงินมัดจำได้ไหม?',
  'หากลูกค้าขอยกเลิกงานในขณะที่ทางร้านกำลังดำเนินการตัดต่อ หรือล็อกคิวงานไว้แล้ว ทางร้านขอสงวนสิทธิ์ไม่คืนเงินมัดจำในทุกกรณี เพื่อชดเชยเวลาและการจัดสรรคิวงานค่ะ',
  7,
  1
);
