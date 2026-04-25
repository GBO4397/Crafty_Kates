# Crafty Kates Website - Project Context

**Project:** craftykates.com — promotional website for Crafty Kates Promotions  
**Developer:** Velocity Tech Solutions  
**Repository:** https://github.com/GBO4397/Crafty_Kates  
**Live Site:** https://craftykates.com  
**Status:** ✅ Live and operational (April 2026)

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Hosting:** Netlify (auto-deploys from GitHub main branch)
- **Backend:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (email/password for admin)
- **File Storage:** GitHub public folder + Supabase Storage
- **Framework:** TypeScript strict mode

**Node Version:** LTS (check .nvmrc)  
**Package Manager:** npm  
**Build Command:** `npm run build`  
**Dev Command:** `npm run dev`

---

## Supabase Setup

**Project URL:** `https://gufmfkkdqgjomuitbgtt.supabase.co`

**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zm1ma2tkcWdqb211aXRiZ3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODU1ODksImV4cCI6MjA5MDY2MTU4OX0.zDSmO1TlrJtwPnM2Peivprubq0HgGhrnJCGIGs_6Nv8`

**Tables:**
- `site_settings` — Global site configuration (motto, admin password, contact info)
- `sponsors` — All sponsors with logos and metadata
- `events` — Car shows and community events
- `registrations` — Car show registrations
- `site_images` — CMS for hero/background images (planned)

**Admin Password:** `CraftyKates2026!` (stored in site_settings table, hashed)

**Key Database Columns:**
- `sponsors.sponsor_type` — Values: `'primary'` | `'carshow'` | `'both'`
- `sponsors.logo_url` — Relative path like `/images/site/logo.webp` (NOT base64)
- `sponsors.website_url`, `sponsors.facebook_url`, `sponsors.instagram_url` — Social links

---

## Directory Structure

```
Crafty_Kates/
├── src/
│   ├── pages/
│   │   ├── AdminPage.tsx              — Main admin dashboard
│   │   ├── LoginPage.tsx              — Admin login
│   │   ├── SponsorAdmin.tsx           — Sponsor CRUD interface
│   │   ├── EventAdmin.tsx             — Event management
│   │   ├── CarShowPage.tsx            — Car show details
│   │   ├── RegisterPage.tsx           — Registration form
│   │   └── [other pages...]
│   ├── components/
│   │   ├── admin/
│   │   │   ├── SponsorAdminStats.tsx  — Stats cards (Primary/CarShow/Both)
│   │   │   ├── SponsorAdminCards.tsx  — Sponsor cards grouped by type
│   │   │   ├── SponsorEditModal.tsx   — Edit modal with sponsor_type dropdown
│   │   │   └── SponsorLogoUploader.tsx — Logo upload (300x300 square)
│   │   ├── crafty/
│   │   │   ├── SponsorSection.tsx     — Homepage sponsor display (two-tier layout)
│   │   │   ├── PostsSection.tsx       — Blog/news section
│   │   │   ├── CommunitySection.tsx   — Ridgecrest Animal Shelter callout
│   │   │   └── [other sections...]
│   │   └── [shared components...]
│   ├── lib/
│   │   ├── supabase.ts               — Supabase client config
│   │   └── [utilities...]
│   ├── data/
│   │   └── imageConfig.ts            — Centralized image paths
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── images/
│       └── site/                      — Static site images
│           ├── KATES-LOGO-512x512-1-150x150.webp
│           ├── 2024_03_Classic_Cars_Classic_Burgers-100-13.jpg
│           ├── 2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg
│           ├── 2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg
│           ├── 2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg
│           ├── Rodney5.jpeg
│           ├── ridgecrest-animal-shelter.jpg
│           └── almost-eden-rescue.jpg
├── package.json
├── tsconfig.json
├── vite.config.ts
└── netlify.toml
```

---

## Key Design Decisions

### Sponsor System (Primary Value)

**Old System (Removed):** Gold/Silver/Bronze tiers with "Nostalgia"/"Heart"/"Sponsor" categories. Confusing, not meaningful to business.

**New System (Current):**
- **Primary Sponsor** — Sponsors Crafty Kates Promotions overall (recurring support)
- **Classic Car Show Sponsor** — Sponsors the car show only (event-specific)
- **Both** — Sponsors both Crafty Kates and the car show

**Display Logic:**
- Primary Sponsors appear FIRST with a pink gradient header background
- Car Show Sponsors appear SECOND with a clean white bordered header
- Sponsors with `sponsor_type = 'both'` appear in BOTH sections
- SponsorCard component accepts `isPrimary` boolean to style accordingly

**Admin Form:** Dropdown in `SponsorEditModal.tsx` lets admins choose sponsor_type. Stats cards show breakdown: Total | Primary Count | Car Show Count | Both Count.

### Image Management

**Static Images (GitHub):**
- Stored in `public/images/site/`
- Served directly from GitHub / Netlify CDN
- Centralized in `src/data/imageConfig.ts`
- Updated when code changes

**Dynamic Images (Planned - Supabase):**
- Sponsor logos point to relative paths (currently stored as URLs in DB, should move to Supabase Storage)
- Logo uploader currently saves to Supabase Storage with filename pattern

**Current Image Filenames** (match imageConfig.ts exactly):
- `KATES-LOGO-512x512-1-150x150.webp` — Logo
- `2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg` — Hero background
- `2024_03_Classic_Cars_Classic_Burgers-100-13.jpg` — Car show event image
- `2024_03_Classic_Cars_Classic_Burgers-100-9.jpeg` — Motto/engine background
- `2024_03_Classic_Cars_Classic_Burgers-100-66.jpeg` — About portrait
- `Rodney5.jpeg` — Blog post image
- `ridgecrest-animal-shelter.jpg` — Community section
- `almost-eden-rescue.jpg` — Community section

---

## Admin Dashboard

**Login:** `craftykates.com` → Admin login with password `CraftyKates2026!`

**Sections:**
1. **Image Manager** — Upload/manage site images (partial — doesn't cover all image slots yet)
2. **Sponsor Admin** — Add/edit/delete sponsors. Shows Primary/CarShow/Both stats.
3. **Event Admin** — Create and manage events
4. **Registrations** — View car show registrations (currently empty — no historical data from Famous.ai)
5. **Check-In** — Mark registrations as checked in
6. **Organizer Check List** — Task management for event coordinators
7. **Download Site Images** — Bulk export functionality

**Status:** Sponsor Admin working. Other sections partially tested.

---

## Current Issues & Known Gaps

### ✅ Working
- Website live and loading
- Admin dashboard accessible
- Sponsor display (Primary vs Car Show)
- Car show registration form
- Netlify auto-deploy on push to main

### ⚠️ Partially Working
- Image Manager missing slots for gallery images
- Supabase Storage upload function exists but needs testing
- Logo uploader working but needs size standardization (300x300 square)

### ❌ Not Implemented
- Photo gallery upload system (placeholder only)
- Scheduled Email digests
- Automated social media posting
- Admin audit logs
- Role-based access (single password for all admins)

### Known Gotchas
- Never hardcode base64 in `logo_url` field — causes display failures. Use relative paths only: `/images/site/filename.ext`
- Image filenames must match exactly in code and GitHub folder (case-sensitive on Linux)
- `sponsor_type` column is critical for display logic. If missing, query fails silently.
- Rodney5 image is a `.jpeg` in code but might be `.jpg` on disk — verify file extension always.

---

## Supabase SQL — Key Queries

**Filter sponsors by type:**
```sql
-- Primary sponsors
SELECT * FROM sponsors WHERE sponsor_type IN ('primary', 'both') ORDER BY name;

-- Car show sponsors
SELECT * FROM sponsors WHERE sponsor_type IN ('carshow', 'both') ORDER BY name;

-- All sponsors
SELECT * FROM sponsors WHERE logo_url IS NOT NULL ORDER BY name;
```

**Fix broken base64 logos:**
```sql
UPDATE sponsors SET logo_url = NULL WHERE logo_url LIKE 'data:image%';
```

**Check admin password:**
```sql
SELECT value FROM site_settings WHERE key = 'admin_password';
```

---

## Deployment & GitHub

**GitHub Repo:** https://github.com/GBO4397/Crafty_Kates  
**Netlify Project:** craftykates.com  
**Auto-Deploy:** Enabled on main branch

**Workflow:**
1. Make changes locally in VS Code
2. Commit and push to GitHub main branch
3. Netlify auto-builds and deploys (~2-3 min)
4. Visit craftykates.com to verify

**Force Deploy:** In Netlify dashboard, trigger manual deploy if needed.

---

## Important URLs & Services

- **Website:** https://craftykates.com
- **GitHub:** https://github.com/GBO4397/Crafty_Kates
- **Netlify:** https://app.netlify.com (find Crafty_Kates project)
- **Supabase Console:** https://app.supabase.com
- **Classic Burgers Restaurant:** Classic Burgers, 6525 Inyokern Road, Inyokern, CA 93527

---

## About Crafty Kates

**Founder:** Ms. Kate (Crafty Kate)  
**Mission:** Promote classic car culture, grassroots racing, and community fundraising  
**Flagship Event:** 2026 Classic Burgers Car Show — April 18, Inyokern, CA  
**Beneficiary:** Ridgecrest Animal Shelter (all proceeds)

**Key Stats:**
- 6th annual car show
- 200+ vehicles in 2024
- $20,000+ raised for shelter since 2019
- 100% volunteer-run
- Community partners: Kings of the Sport, Rods West, Classic Burgers

**Tagline:** "Drive into the past, fuel the future."

---

## Next Steps

### High Priority
1. Test Supabase Storage upload function end-to-end
2. Expand Image Manager to include all image slots on site
3. Populate gallery images for past car shows
4. Test Event Admin and Check-In functionality

### Medium Priority
1. Add role-based access control (currently single password)
2. Set up automated sponsor reminder emails
3. Implement email digest for organizers
4. Add sponsor tier analytics dashboard

### Low Priority
1. Add coloring book section with downloadable PDFs
2. Implement photo gallery social sharing
3. Set up email newsletter signup on homepage
4. Create sponsor package PDF generator

---

## Claude Tool Division of Labor

This project uses a consolidated Claude setup. Each tool has a specific role — don't duplicate effort across environments.

### Claude Code (Primary — Coding)
- Run from inside the `Crafty_Kates/` repo directory: `claude`
- Handles all code changes, builds, git commits, and Supabase query testing
- This CLAUDE.md is the single source of truth — it loads automatically

### Claude Cowork (Supporting — Non-Code Tasks)
- Connected to: `C:\Users\gbosy\OneDrive - Velocity Tech Solutions\Documents 1\GitHub\Crafty_Kates`
- Handles: sponsor documents, image asset management, reports, docx/pptx/xlsx generation, admin workflows outside the codebase
- Use when the output is a file or document, not a code change

### Claude Chat (claude.ai)
- **Retired for this project.** The Chat project has been removed — CLAUDE.md covers all persistent context.
- Use Claude Chat only for quick one-off questions unrelated to the codebase.

---

## For Claude Code Sessions

Simply run `claude` from the repo root — CLAUDE.md loads automatically. No copy/paste prompt needed.

---

## Last Updated
April 25, 2026 — Consolidated Claude environment (Code + Cowork, Chat retired)

**Maintained By:** Velocity Tech Solutions  
**For Questions:** Contact Kate at craftykates@mail.com or Rods West (703 E Dolphin, Ridgecrest, CA 93555)
