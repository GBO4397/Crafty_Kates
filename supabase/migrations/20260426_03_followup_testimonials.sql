-- ============================================================
-- Phase 6: Follow-up Posts and Testimonials tables
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- event_followup_posts
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_followup_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text,
  featured_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  publish_date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.event_followup_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "followup_public_read" ON public.event_followup_posts;
CREATE POLICY "followup_public_read"
  ON public.event_followup_posts FOR SELECT
  USING (status = 'published' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "followup_admin_write" ON public.event_followup_posts;
CREATE POLICY "followup_admin_write"
  ON public.event_followup_posts FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- testimonials
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_title text,
  author_photo_url text,
  testimonial_text text NOT NULL,
  star_rating integer CHECK (star_rating BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
CREATE POLICY "testimonials_public_read"
  ON public.testimonials FOR SELECT
  USING (status = 'published' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "testimonials_admin_write" ON public.testimonials;
CREATE POLICY "testimonials_admin_write"
  ON public.testimonials FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- Phase 10: Structured admission pricing columns on community_events
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.community_events
  ADD COLUMN IF NOT EXISTS admission_free boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_adults numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_kids numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_kids_free_under_age integer;
