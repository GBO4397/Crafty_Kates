-- ============================================================
-- SITE_IMAGES CLEANUP
-- Run these in the Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. DIAGNOSE: See all stored image URLs (look for databasepad.com or
--    craftykates.com/wp-content entries — those are broken)
SELECT slot_key, category, image_url
FROM site_images
ORDER BY category, slot_key;

-- 2. FIX: Clear any image_url that points to the old databasepad.com instance
UPDATE site_images
SET image_url = NULL
WHERE image_url LIKE '%databasepad.com%';

-- 3. FIX: Clear any image_url that points to the old WordPress uploads
UPDATE site_images
SET image_url = NULL
WHERE image_url LIKE '%craftykates.com/wp-content%';

-- 4. FIX: Clear any base64 data URLs (large, cause display failures)
UPDATE site_images
SET image_url = NULL
WHERE image_url LIKE 'data:image%';

-- 5. VERIFY: Confirm what's left (should only be NULL, relative paths,
--    or gufmfkkdqgjomuitbgtt.supabase.co/storage URLs)
SELECT slot_key, category, image_url
FROM site_images
ORDER BY category, slot_key;
