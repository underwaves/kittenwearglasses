-- 0006_add_graphic_and_content_works.sql
-- Add sample graphic design works (thumbnails, promotion banners, and artworks)

INSERT INTO works (title, category, orientation, video_url, provider, video_id, cover_key, is_featured, is_visible, sort_order)
VALUES
(
  'Coquette YouTube Thumbnail - คาเฟ่ & ไลฟ์สไตล์หวานละมุน',
  'งานกราฟิก - ปกคลิป (Thumbnail)',
  'horizontal',
  'https://drive.google.com/file/d/1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0/view',
  'drive',
  '1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1280&auto=format&fit=crop&q=85',
  1,
  1,
  10
),
(
  'Promotion & Rate Card Banner - ป้ายโปรโมชั่นร้านสไตล์ Coquette',
  'งานกราฟิก - แบนเนอร์ (Banner)',
  'vertical',
  'https://drive.google.com/file/d/1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0/view',
  'drive',
  '1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=85',
  1,
  1,
  11
),
(
  'Aesthetic Social Media Cover & Artwork Kit',
  'งานกราฟิก - อาร์ตเวิร์ก (Artwork)',
  'vertical',
  'https://drive.google.com/file/d/1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0/view',
  'drive',
  '1B7A6bE8C9D0E1F2G3H4I5J6K7L8M9N0',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=85',
  1,
  1,
  12
);
