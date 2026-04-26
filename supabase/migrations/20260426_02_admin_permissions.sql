-- ============================================================
-- Phase 2: Admin permission system
-- ============================================================

-- Enum of all admin permissions
DO $$ BEGIN
  CREATE TYPE admin_permission AS ENUM (
    'sponsor_admin',
    'event_admin',
    'registrations',
    'checkin',
    'organizers',
    'checklist',
    'follow_up_posts',
    'testimonials',
    'user_management'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Table linking auth users to specific permissions
CREATE TABLE IF NOT EXISTS public.admin_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission admin_permission NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission)
);

ALTER TABLE public.admin_user_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins (user_management permission holders) can manage all rows
DROP POLICY IF EXISTS "permissions_super_admin_all" ON public.admin_user_permissions;
CREATE POLICY "permissions_super_admin_all"
  ON public.admin_user_permissions FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.admin_user_permissions aup
      WHERE aup.user_id = auth.uid()
        AND aup.permission = 'user_management'
    )
  );

-- Regular admins can read their own permissions
DROP POLICY IF EXISTS "permissions_self_read" ON public.admin_user_permissions;
CREATE POLICY "permissions_self_read"
  ON public.admin_user_permissions FOR SELECT
  USING (user_id = auth.uid());

-- Helper: return all permissions for the calling user
CREATE OR REPLACE FUNCTION public.get_my_admin_permissions()
RETURNS SETOF admin_permission
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT permission FROM public.admin_user_permissions WHERE user_id = auth.uid();
$$;

-- Helper: check if calling user has a specific permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(p admin_permission)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_user_permissions
    WHERE user_id = auth.uid() AND permission = p
  );
$$;
