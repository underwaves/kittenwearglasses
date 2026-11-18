-- 0003_add_service_image.sql
-- Add image_key column to services table and populate initial images

ALTER TABLE services ADD COLUMN image_key TEXT DEFAULT '';

UPDATE services 
SET image_key = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
WHERE id = 1;

UPDATE services 
SET image_key = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80'
WHERE id = 2;

UPDATE services 
SET image_key = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'
WHERE id = 3;
