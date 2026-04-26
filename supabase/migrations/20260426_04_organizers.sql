-- ============================================================
-- Phase 5e: Organizers table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  role text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizers_admin_all" ON public.organizers;
CREATE POLICY "organizers_admin_all"
  ON public.organizers FOR ALL
  USING (auth.role() = 'service_role');
