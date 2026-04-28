-- ============================================================
-- Patch: grant anon role UPDATE and DELETE on community_events
--
-- Root cause: the initial RLS migration only gave anon SELECT
-- (approved rows only) and INSERT (pending only). No UPDATE or
-- DELETE policies existed for anon, so the browser-side admin
-- panel received a silent success (0 rows affected) from
-- Supabase instead of an error — causing optimistic UI updates
-- that reverted on page refresh.
--
-- Also widens SELECT to all rows so the admin panel can view
-- pending and rejected submissions, not just approved ones.
-- Public pages (EventsPage, EventsSection) still filter by
-- status = 'approved' in their own queries, so this change
-- has no effect on what visitors see.
-- ============================================================

-- Replace approved-only SELECT with open SELECT
DROP POLICY IF EXISTS "events_public_read_approved" ON public.community_events;
DROP POLICY IF EXISTS "events_public_read_all" ON public.community_events;
CREATE POLICY "events_public_read_all"
  ON public.community_events FOR SELECT
  USING (true);

-- Allow anon to UPDATE (approve / reject / save admin notes)
DROP POLICY IF EXISTS "events_anon_update" ON public.community_events;
CREATE POLICY "events_anon_update"
  ON public.community_events FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon to DELETE (admin permanently removes a submission)
DROP POLICY IF EXISTS "events_anon_delete" ON public.community_events;
CREATE POLICY "events_anon_delete"
  ON public.community_events FOR DELETE
  TO anon
  USING (true);
