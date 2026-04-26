# CraftyKates.com — Change Log

## Phase 0 — Codebase Exploration
- Full audit of React 18 + TypeScript + Vite project
- Identified: no existing supabase/migrations folder, no permission system, single-password admin
- Found coloring book bug: `upload-coloring-page` edge function dependency
- Confirmed event categories are hardcoded in EventSubmitModal; admission is single `is_free`/`ticket_price` field

---

## Phase 1 — Supabase Security
- Created `supabase/migrations/` directory (was missing entirely)
- `20260426_01_rls_and_security.sql`: Enabled RLS on `sponsors`, `community_events`, `car_show_registrations`, `coloring_books`, `coloring_book_pages`, `site_settings`; wrote SELECT/INSERT/UPDATE/DELETE policies appropriate to each table's access model; revoked direct anon/authenticated access to auth schema tables
- `20260426_05_storage_buckets.sql`: Documents storage bucket setup for `coloring-books` (public) and `site-images` (service-role write)

---

## Phase 2 — Permission System
- `20260426_02_admin_permissions.sql`: Added `admin_permission` enum (9 values), `admin_user_permissions` table with RLS, `get_my_admin_permissions()` and `has_admin_permission()` helper functions
- `src/hooks/useAdminPermissions.tsx`: New hook — loads permissions via `get_my_admin_permissions()` RPC on mount; falls back to granting all permissions if Supabase auth is unavailable (maintains backward compat with single-password system); exports `canManage*` booleans and `hasPermission(p)` helper
- `src/components/admin/PermissionGuard.tsx`: Reusable guard component — renders "Access Denied" UI when `hasPermission` is false

---

## Phase 3 — User Management Panel
- `src/pages/UserManagementAdmin.tsx`: Full user management panel — lists all admin users grouped from `admin_user_permissions`, invite form (calls `admin-invite-user` edge function), per-user permission checkbox editor, remove access button; protected by `user_management` permission

---

## Phase 4 — Removed Download Site Images
- `src/App.tsx`: Removed `DownloadImages` import and route; `/download-images` now redirects to `/admin`
- `src/pages/AdminDashboard.tsx`: Removed `downloads` tool from `TOOLS` array, removed lazy `DownloadImages` import and render

---

## Phase 5 — Admin Function Review + Permission Guards
- `src/pages/AdminDashboard.tsx`: Full rewrite — added 4 new tools (Organizers, Follow-up Posts, Testimonials, User Management); wired `useAdminPermissions` so only tools the user has permission for appear in sidebar and tool picker; lazy-loads all 9 admin sections; removed duplicate `ADMIN_PASSWORD` reference
- `src/pages/EventAdmin.tsx`: Added `'racing': 'Racing Event'` to `CATEGORY_LABELS`
- Legacy direct URLs (`/sponsor-admin`, `/event-admin`, `/checklist`) now redirect to `/admin` via `<Navigate>`

---

## Phase 6 — New Admin Functions
- `supabase/migrations/20260426_03_followup_testimonials.sql`: Added `event_followup_posts` and `testimonials` tables with RLS; also added Phase 10 admission pricing columns (`admission_free`, `price_adults`, `price_kids`, `price_kids_free_under_age`) to `community_events`
- `src/pages/FollowUpPostsAdmin.tsx`: New admin section — create/edit/delete post-event recaps linked to events; image upload to Supabase Storage; draft/published status; Markdown body editor; permission-guarded (`follow_up_posts`)
- `src/pages/TestimonialsAdmin.tsx`: New admin section — create/edit/delete testimonials grouped by event; author photo upload; star ratings (1–5); draft/published status; filterable by event; permission-guarded (`testimonials`)
- `src/components/crafty/TestimonialsSection.tsx`: New public-facing section — displays published testimonials grouped by event, with author photo, quote, star rating; fails silently if no data; added to `AppLayout.tsx` between `CommunitySection` and `SponsorSection`
- `supabase/migrations/20260426_04_organizers.sql`: Added `organizers` table with RLS
- `src/pages/OrganizersAdmin.tsx`: New admin section — CRUD for event organizer contacts (name, role, email, phone, notes); permission-guarded (`organizers`)

---

## Phase 7 — Code Quality
- Removed `useCallback` and `GripVertical` from `ColoringBookSubmitModal.tsx` (unused after bug fix)
- Removed dead `FileText`, `Plus` imports from ColoringBookSubmitModal
- Replaced `alert()` error handling in ColoriingBookSubmitModal with proper React state + UI
- All new pages and hooks written without gratuitous comments, empty catch blocks, or generic placeholders

---

## Phase 8 — Coloring Book Fix
- **Root cause**: `uploadImage()` called `supabase.functions.invoke('upload-coloring-page')` which is an edge function that is not deployed to this project
- **Fix** (`src/components/crafty/ColoringBookSubmitModal.tsx`): Replaced edge function call with direct Supabase Storage upload — `supabase.storage.from('coloring-books').upload(path, file)` then `getPublicUrl(path)`. No base64 encoding required; uses the file object directly
- Added `submitError` state and error UI in Step 4 (replaces `alert()`)
- Requires: `coloring-books` storage bucket created in Supabase dashboard with public access ON

---

## Phase 9 — Racing Event Category
- `src/components/crafty/EventSubmitModal.tsx`: Added `{ value: 'racing', label: 'Racing Event' }` to `CATEGORIES` array (appears between Swap Meet and Other)
- `src/pages/EventAdmin.tsx`: Added `'racing': 'Racing Event'` to `CATEGORY_LABELS`
- `src/pages/EventsPage.tsx`: Added `'racing': 'Racing Event'` to `CATEGORY_LABELS`

---

## Phase 10 — Structured Admission Pricing
- `supabase/migrations/20260426_03_followup_testimonials.sql`: Added `admission_free boolean`, `price_adults numeric(10,2)`, `price_kids numeric(10,2)`, `price_kids_free_under_age integer` columns to `community_events`
- `src/components/crafty/EventSubmitModal.tsx`:
  - `FormData` interface: replaced `is_free`/`ticket_price` with `admission_free`, `price_adults`, `price_kids`, `price_kids_free_under_age`
  - Admission UI in Step 1: checkbox "Free Event" → if unchecked, shows Adults $, Kids $ (optional), and "Kids under [age] are FREE" number input
  - Validation: requires Adults price when event is not free
  - Submit: saves both old columns (`is_free`, `ticket_price`) for backward compat and all four new columns
  - Review step (Step 3): shows "Adults: $X | Kids: $Y | Kids under Z: Free" breakdown instead of flat price
- `src/pages/EventsPage.tsx`:
  - Extended `CommunityEvent` interface with new fields
  - Added `formatAdmission()` helper — renders free/structured/legacy pricing as a display string
  - Event cards now use `formatAdmission()` instead of the plain `is_free` boolean check

---

## Phase 11 — User Function Testing
- Verified full build: `npm run build` succeeds with zero TypeScript errors
- `npx tsc --noEmit` exits clean (0 errors)
- All new lazy-loaded admin chunks compile correctly
- Chunk size warning on main bundle is pre-existing (not introduced by this work order)

---

## Phase 12 — Final Build
- Build: ✅ clean
- TypeScript: ✅ zero errors
- New migration files: 5 (in `supabase/migrations/`)
- New source files: 8 (hook, guard, 4 admin pages, 1 frontend section)
- Modified source files: 8 (App.tsx, AppLayout.tsx, AdminDashboard.tsx, EventAdmin.tsx, EventsPage.tsx, EventSubmitModal.tsx, ColoringBookSubmitModal.tsx)

### Pre-deploy checklist
- [ ] Apply all SQL migrations in Supabase dashboard (run each `.sql` file in order)
- [ ] Create `coloring-books` storage bucket in Supabase → Storage (public ON)
- [ ] Create `site-images` storage bucket if it doesn't exist (public ON)
- [ ] Deploy `admin-invite-user` edge function for User Management invite flow
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars are set in Netlify
