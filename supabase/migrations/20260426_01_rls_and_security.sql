-- ============================================================
-- Phase 1: RLS policies and security hardening
-- Apply via Supabase dashboard SQL editor or: supabase db push
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- sponsors table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sponsors_public_read" ON public.sponsors;
CREATE POLICY "sponsors_public_read"
  ON public.sponsors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "sponsors_admin_all" ON public.sponsors;
CREATE POLICY "sponsors_admin_all"
  ON public.sponsors FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- community_events table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_read_approved" ON public.community_events;
CREATE POLICY "events_public_read_approved"
  ON public.community_events FOR SELECT
  USING (status = 'approved' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "events_public_insert_pending" ON public.community_events;
CREATE POLICY "events_public_insert_pending"
  ON public.community_events FOR INSERT
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "events_admin_all" ON public.community_events;
CREATE POLICY "events_admin_all"
  ON public.community_events FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- car_show_registrations (or registrations) table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.car_show_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_insert" ON public.car_show_registrations;
CREATE POLICY "registrations_insert"
  ON public.car_show_registrations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "registrations_admin_read" ON public.car_show_registrations;
CREATE POLICY "registrations_admin_read"
  ON public.car_show_registrations FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "registrations_admin_update" ON public.car_show_registrations;
CREATE POLICY "registrations_admin_update"
  ON public.car_show_registrations FOR UPDATE
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- coloring_books table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.coloring_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coloring_books_public_read_approved" ON public.coloring_books;
CREATE POLICY "coloring_books_public_read_approved"
  ON public.coloring_books FOR SELECT
  USING (status = 'approved' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "coloring_books_public_insert" ON public.coloring_books;
CREATE POLICY "coloring_books_public_insert"
  ON public.coloring_books FOR INSERT
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "coloring_books_update_own" ON public.coloring_books;
CREATE POLICY "coloring_books_update_own"
  ON public.coloring_books FOR UPDATE
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- coloring_book_pages table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.coloring_book_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coloring_book_pages_read" ON public.coloring_book_pages;
CREATE POLICY "coloring_book_pages_read"
  ON public.coloring_book_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coloring_books cb
      WHERE cb.id = book_id AND (cb.status = 'approved' OR auth.role() = 'service_role')
    )
  );

DROP POLICY IF EXISTS "coloring_book_pages_insert" ON public.coloring_book_pages;
CREATE POLICY "coloring_book_pages_insert"
  ON public.coloring_book_pages FOR INSERT
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- site_settings table
-- ────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- Revoke direct public schema access to auth tables
-- (Supabase handles this by default, but enforce explicitly)
-- ────────────────────────────────────────────────────────────
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM authenticated;

-- ────────────────────────────────────────────────────────────
-- Fix any SECURITY DEFINER functions missing search_path
-- ────────────────────────────────────────────────────────────
-- Note: apply this pattern to any custom functions found in dashboard.
-- Example template:
-- CREATE OR REPLACE FUNCTION public.your_function()
-- RETURNS void
-- LANGUAGE sql SECURITY DEFINER SET search_path = public
-- AS $$ ... $$;
