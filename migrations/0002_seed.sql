-- 0002_seed.sql
-- Seed initial rate card, services, terms, settings, and sample portfolio works

-- 1. Services
INSERT INTO services (title, duration_label, price_label, price_num, description, features, badge, sort_order, is_visible)
VALUES
(
  'คลิปสั้น Shorts / Reels / TikTok',
  'ไม่เกิน 1 นาที',
  '300',
  300,
  'เหมาะสำหรับคอนเทนต์สั้น TikTok, Instagram Reels, YouTube Shorts เน้นกระชับ ดึงดูดสายตา',
  '["ใส่ Text ตัวหนังสือน่ารัก", "คัดสรรเพลง & SoundFX เข้าจังหวะ", "คุมโทนสีน่ารักสไตล์ coquette", "Transition สมูท ไหลลื่น", "จัดลำดับ Storytelling ให้น่าติดตาม"]',
  'ยอดนิยม ✨',
  1,
  1
),
(
  'Vlog สั้น / คอนเทนต์สั้น',
  '1–3 นาที',
  '400–800',
  400,
  'เหมาะสำหรับคลิป Vlog รายวัน, รีวิวสินค้า, สรุปกิจกรรม, มินิซีรีส์สั้น ๆ',
  '["ใส่ Text บรรยาย & หัวข้อ", "Sound Effects & เพลงประกอบ", "คุมโทนสีคลิปให้ละมุนตา", "ตัดต่อตามจังหวะบรีฟ", "แก้ไขงานฟรี 2 ครั้ง"]',
  'แนะนำ 🎀',
  2,
  1
),
(
  'Vlog เต็ม / สรุปทริปท่องเที่ยว',
  '3–5 นาที',
  '900–1,000',
  900,
  'เหมาะสำหรับ Vlog เที่ยว คาเฟ่ ไลฟ์สไตล์ หรือคอนเทนต์บอกเล่าเรื่องราวแบบเจาะลึก',
  '["จัดลำดับเรื่องราวอย่างมืออาชีพ", "แทรก Text / Graphic น่ารัก", "เลือกเพลงประกอบหลากหลายช่วง", "คุมโทนภาพให้สม่ำเสมอตลอดคลิป", "ส่งมอบไฟล์ความละเอียดสูง HD/4K"]',
  '',
  3,
  1
);

-- 2. Add-ons
INSERT INTO addons (category, name, price_label, price_num, note, sort_order, is_visible)
VALUES
('subtitles', 'ซับไทย (คลิปไม่เกิน 1 นาที)', '+100', 100, 'บาทต่อคลิป จัดฟอนต์สวยงาม อ่านง่าย', 1, 1),
('subtitles', 'ซับไทย (คลิป 1–3 นาที)', '+150', 150, 'บาทต่อคลิป', 2, 1),
('subtitles', 'ซับไทย (คลิป 3–5 นาที)', '+200', 200, 'บาทต่อคลิป', 3, 1),
('subtitles', 'กรณีมีไฟล์ซับ (.SRT) มาให้', '+50', 50, 'บาทต่อคลิป นำเข้าและจัดแต่งฟอนต์ให้เข้ากับคลิป', 4, 1),
('voiceover', 'พากย์ไทย / เสียงบรรยาย (คลิปไม่เกิน 1 นาที)', '+150', 150, 'บาทต่อคลิป เสียงพากย์สดใสน่ารัก AI หรือเสียงบรรยาย', 5, 1),
('voiceover', 'พากย์ไทย / เสียงบรรยาย (คลิป 1–3 นาที)', '+200', 200, 'บาทต่อคลิป', 6, 1),
('voiceover', 'พากย์ไทย / เสียงบรรยาย (คลิป 3–5 นาที)', '+250', 250, 'บาทต่อคลิป', 7, 1);

-- 3. Terms & Conditions (4-step ordering + rules)
INSERT INTO terms (step_number, title, content, icon_type, sort_order, is_visible)
VALUES
(
  1,
  'ขั้นตอนที่ 1: ส่งฟุตเทจและบรีฟงาน',
  'ลูกค้าส่งฟุตเทจทั้งหมดผ่าน Google Drive + สคริปต์/ข้อความ + ตัวอย่างสไตล์ที่ต้องการ (Ref.) เช่น โทนสี หรือจังหวะเพลงที่ชอบ',
  'folder',
  1,
  1
),
(
  2,
  'ขั้นตอนที่ 2: ชำระมัดจำ 50%',
  'ชำระมัดจำ 50% เพื่อจองคิวและเริ่มงานทันที (กรณีงานด่วนพิเศษส่งภายใน 24 ชม. ชำระเต็มจำนวน + ค่าบริการด่วน 50%)',
  'payment',
  2,
  1
),
(
  3,
  'ขั้นตอนที่ 3: ตรวจสอบและแก้ไข Draft แรก',
  'ส่งมอบ Draft แรกแบบติดลายน้ำให้ตรวจทาน สามารถแก้ไขฟรีได้ 2 ครั้ง (ในขอบเขตบรีฟเดิม หากแก้เพิ่มจากบรีฟเดิมหรือเกิน 2 ครั้ง คิดเพิ่มครั้งละ 100–200 บาท)',
  'edit',
  3,
  1
),
(
  4,
  'ขั้นตอนที่ 4: ชำระส่วนที่เหลือและรับไฟล์จริง',
  'เมื่อลูกค้าอนุมัติงาน ชำระส่วนที่เหลือ 50% ทางร้านจะส่งมอบไฟล์วิดีโอตัวจริงความละเอียดสูง (HD/4K) ทาง Google Drive ไม่มีลายน้ำ พร้อมโพสต์ได้ทันที',
  'check',
  4,
  1
),
(
  0,
  'ระยะเวลาจัดทำ',
  'ปกติใช้เวลา 2–4 วันทำการต่อ 1 คลิป (นับจากวันที่ได้รับข้อมูล บรีฟ และมัดจำครบถ้วน)',
  'clock',
  5,
  1
),
(
  0,
  'เงื่อนไขการยกเลิกงาน',
  'หากลูกค้ายกเลิกงานขณะที่กำลังดำเนินการ ทางร้านขอสงวนสิทธิ์ไม่คืนเงินมัดจำในทุกกรณี',
  'alert',
  6,
  1
);

-- 4. Settings
INSERT INTO settings (key, value)
VALUES
('shop_name', '@kittenwearglasses'),
('shop_tagline', 'ร้านรับตัดต่อวิดีโอน่ารัก คุมโทนสไตล์ coquette 🎀'),
('hero_description', 'รับตัดต่อคลิปสั้น TikTok, Reels, Shorts และ Vlog โทนหวานละมุน ใส่ฟอนต์น่ารัก จังหวะเพลงเป๊ะ พร้อมอัปลงช่องทันที ✨'),
('tiktok_url', 'https://www.tiktok.com/@kittenwearglasses'),
('line_id', '@882xaxoy'),
('line_url', 'https://line.me/R/ti/p/@882xaxoy'),
('announcement', '🎀 เปิดรับคิวตัดต่อประจำเดือนนี้แล้วนะคะ ทัก LINE สอบถามคิวได้เลยค่า!');

-- 5. Promotions
INSERT INTO promotions (title, description, price_label, conditions, banner_key, start_date, end_date, is_active, sort_order)
VALUES
(
  'โปรเปิดร้านใหม่! สั่งตัดต่อ 3 คลิป ลดทันที 10%',
  'เอาใจสายครีเอเตอร์ที่ต้องการลงคลิปสม่ำเสมอ สั่งตัดต่อแพ็กเกจใดก็ได้พร้อมกัน 3 คลิป รับส่วนลด 10% จากยอดรวมทันที',
  'ลด 10%',
  'เฉพาะคิวงานที่ชำระมัดจำภายในสิ้นเดือนนี้เท่านั้น ไม่สามารถรวมกับส่วนลดอื่นได้',
  '',
  '2025-01-01',
  '2026-12-31',
  1,
  1
);

-- 6. Sample Works (Using real accessible YouTube & Drive video embeds for live testing)
INSERT INTO works (title, category, orientation, video_url, provider, video_id, cover_key, is_featured, is_visible, sort_order)
VALUES
(
  'Cute Coquette Lifestyle Shorts',
  'Shorts/Reels/TikTok',
  'vertical',
  'https://www.youtube.com/shorts/35l9O6xH3sQ',
  'youtube',
  '35l9O6xH3sQ',
  'https://img.youtube.com/vi/35l9O6xH3sQ/maxresdefault.jpg',
  1,
  1,
  1
),
(
  'Aesthetic Daily Cafe Vlog',
  'Vlog',
  'horizontal',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube',
  'dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  1,
  1,
  2
),
(
  'Pastel Makeup Routine Reels',
  'Shorts/Reels/TikTok',
  'vertical',
  'https://www.youtube.com/shorts/5O0L_9p7qQ0',
  'youtube',
  '5O0L_9p7qQ0',
  'https://img.youtube.com/vi/5O0L_9p7qQ0/hqdefault.jpg',
  1,
  1,
  3
),
(
  'Travel Weekend in Tokyo Vlog',
  'Vlog',
  'horizontal',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  'youtube',
  '9bZkp7q19f0',
  'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  1,
  1,
  4
),
(
  'TikTok Trendy Dance & Beat Cut',
  'Shorts/Reels/TikTok',
  'vertical',
  'https://www.tiktok.com/@kittenwearglasses/video/7123456789012345678',
  'tiktok',
  '7123456789012345678',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  1,
  1,
  5
),
(
  'Unboxing Special Gift (Google Drive)',
  'อื่นๆ',
  'horizontal',
  'https://drive.google.com/file/d/1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0/view?usp=sharing',
  'drive',
  '1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
  1,
  1,
  6
);
