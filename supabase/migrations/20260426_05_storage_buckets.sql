-- ============================================================
-- Storage bucket setup
-- Run in Supabase SQL editor (Storage API is dashboard-only;
-- this documents the required configuration)
-- ============================================================

-- coloring-books bucket: public read, authenticated write
-- Create via dashboard: Storage → New bucket → "coloring-books", Public ON
-- Or via Supabase Management API / CLI:
-- supabase storage create coloring-books --public

-- Storage RLS policies for coloring-books bucket
-- (Applied automatically when bucket is Public; document for reference)
INSERT INTO storage.buckets (id, name, public)
VALUES ('coloring-books', 'coloring-books', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to coloring-books bucket
DROP POLICY IF EXISTS "coloring_books_public_upload" ON storage.objects;
CREATE POLICY "coloring_books_public_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coloring-books');

DROP POLICY IF EXISTS "coloring_books_public_read" ON storage.objects;
CREATE POLICY "coloring_books_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coloring-books');

-- site-images: admin write, public read
DROP POLICY IF EXISTS "site_images_public_read" ON storage.objects;
CREATE POLICY "site_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_service_write" ON storage.objects;
CREATE POLICY "site_images_service_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'site-images' AND auth.role() = 'service_role');
