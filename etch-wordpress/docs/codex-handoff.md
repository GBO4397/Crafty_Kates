# Codex handoff — Crafty Kates Etch rebuild

Audit date: 2026-10-30. Branch: `codex/etch-wordpress-rebuild`.
Plugin paths below are relative to `etch-wordpress/wordpress/wp-content/plugins/crafty-kates-portal/`.

## Ground rules

- The live React app in `src/` is the front-end specification (copy, sections, images, behavior). Read the matching `src/` file before building each page or section.
- Stack: WordPress, Etch WP, ACSS 4, ACF Free, WS Form PRO, WS Form PRO Post Management (owner is installing it). Use only free ACF field types — no Repeater, Flexible Content, Gallery, or Options Pages.
- Do not add libraries or frameworks. Use ACSS variables and utility classes.
- Work through the list in order. Commit after each numbered item so it can be reviewed.
- Never commit the private Famous export, credentials, or submissions.
- `php etch-wordpress/tests/wordpress-package.php` must still pass, but it only checks for files and strings — test real behavior on `dev.craftykates.com`.

## A. Plugin fixes (do first — the Etch work depends on 2)

1. **Gallery upload crash.** `includes/class-ckp-api.php:353` in `upload_gallery_image` calls `wp_count_children()`, which does not exist in WordPress. Replace with a `get_posts(['post_type' => 'ck_gallery_photo', 'post_parent' => $id, 'post_status' => 'publish', 'fields' => 'ids', 'numberposts' => -1])` count. Done when a gallery photo upload returns 200 and leaves no orphan attachment on failure.

2. **Sponsor model.** Replace the Gold/Silver/Bronze `tier` field with `sponsor_type` = `primary` | `carshow` | `both` (default `primary`). Update: the ACF field in `includes/class-ckp-content.php:157`, `save_sponsor` / allowed values in `includes/class-ckp-api.php:182` and `:203`, the importer field list in `includes/class-ckp-cli.php:298` (import `sponsor_type` from the export), and the portal sponsor form in `assets/portal.js`. Live logic is in `src/components/crafty/SponsorSection.tsx` and `src/components/admin/SponsorAdminCards.tsx`. Done when Home shows Primary + Both first (pink gradient header) then Car Show + Both (white bordered header), and the Car Show page shows Car Show + Both.

3. **Login lockout abuse.** `includes/class-ckp-auth.php:120-129` in `login()`: failed attempts keep incrementing and extending `locked_until` while the account is already locked, so anyone can keep an owner locked out forever. Do not increment or extend while locked; add a per-IP transient throttle. Done when a locked account unlocks 15 minutes after its last lock regardless of further bad attempts.

4. **Private event fields exposed over REST.** `includes/class-ckp-content.php:89` (`show_in_rest` on CPTs) and the ACF groups at `:151`–`:232` (`'show_in_rest' => 1`). Set `show_in_rest` to 0 on field groups that contain `organizer_email`, `organizer_phone`, `admin_notes`, and on internal CPTs. Done when `/wp-json/wp/v2/ck_event` (logged out) shows none of those fields.

5. **Privilege escalation.** `includes/class-ckp-auth.php` `update_user()` (line 273) and `create_user()` (line 60): a user with `users.manage` can grant themselves `portal_owner` or capabilities they do not hold, or reset an owner's password. Reject grants the actor does not hold; only owners may edit owners.

6. **Image ZIP can include private files.** `includes/class-ckp-portal.php` `download_images()` (line 159, `get_attached_file` at 191) and `save_sponsor` in `class-ckp-api.php:179`. Require `wp_attachment_is_image()` when saving a logo, `realpath`-check ZIP sources against `wp_upload_dir()['basedir']`, and prefix ZIP entry names with the attachment ID to avoid overwrites.

7. **Smaller hardening.**
   - Cookie: force `secure => true` in `start_session()` (`class-ckp-auth.php:144`), not `is_ssl()`.
   - `change_password()` (line 325): delete the user's other sessions on success.
   - Purge expired session rows on login.
   - Check-in-only roles get a trimmed registration field set (no address/email/phone) in `registrations()` (`class-ckp-api.php:253`).
   - Register the CPTs on `init` even if ACF is inactive (`class-ckp-content.php`).
   - `includes/class-ckp-wsform.php:49` and `:53`: reduce array values (checkboxes) to a scalar before `(string)` casting.
   - Sanitize imported URL/text fields in `class-ckp-cli.php` (`esc_url_raw`, `sanitize_text_field`).

## B. Missing content model and data

8. **Testimonials, Organizers, Event follow-up posts.** The live app reads `testimonials`, `organizers`, `event_followup_posts` (see `src/` `.from()` calls and `supabase/migrations/20260426_03_followup_testimonials.sql`, `20260426_04_organizers.sql`). Add CPTs or plugin tables, ACF Free fields, and importer support.

9. **Event pricing.** Add `price_adults`, `price_kids`, `price_kids_free_under_age`, `admission_free` to the `ck_event` ACF group, importer, portal event editor, and the event submission form spec.

10. **Event editing.** `update_event` (`class-ckp-api.php:219`) only saves review fields. Allow editing date, start/end time, location, address, pricing (match `src/pages/EventAdmin.tsx` inline time editing).

11. **Gallery images.** Import the 40 static photos in `public/images/gallery/ben-radatz/` and `public/images/gallery/wallin/` into the Media Library as two `ck_gallery` posts with `ck_gallery_photo` children, using photographer names and captions from `src/data/imageConfig.ts`.

12. **Posts.** Import the hardcoded posts from `src/components/crafty/PostsSection.tsx` (and `Rodney5.jpeg`) as WordPress posts.

## C. WS Form

13. **Post Management forms.** With WS Form PRO Post Management installed, build the story, event and coloring-book forms from `etch-wordpress/wordpress/ws-form/form-specs.json`. Add the event pricing fields (item 9). The coloring-book form must also create one `ck_color_page` child per uploaded page — Post Management will not do this, so add a small post-submit hook in `includes/class-ckp-wsform.php`. Export each finished form to `etch-wordpress/wordpress/ws-form/exports/`.

14. Build the registration, contact and newsletter forms from the same spec and confirm the registration bridge accepts the live `pending` payment status.

## D. Etch pages (use the Etch Connector; `src/` is the spec)

15. **Home** (`etch/blueprints/home.etch.html`). Add the missing sections in live order from `src/components/AppLayout.tsx`: Hero (with the `hero-license-plate` slot), Motto (`motto-background`), About, Nostalgia, Events, Sponsors (two tiers per item 2), Gallery preview (`ckGalleries` loop), Coloring Books, Posts, Testimonials (item 8), Community (`community-*` slots), Contact. Carry over the copy word for word from each `src/components/crafty/*Section.tsx`.

16. **Car Show** (`car-show.etch.html`). Replace the placeholder sentence "Keep the date, time, location..." with the real date, time, location, pricing and beneficiary details from `src/pages/CarShowPage.tsx`, bound to ACF fields.

17. **Register** (`register.etch.html`). Real copy from `src/pages/CarShowRegistration.tsx` plus the WS Form registration form.

18. **Gallery.** Gallery archive plus `gallery-single.etch.html`: grid/list toggle, lightbox, download and share, matching `src/components/crafty/PhotographerGallery.tsx`. Vanilla JS only.

19. **Coloring books.** Show front, back and inside covers and a page-flip viewer matching `src/components/crafty/FlipBookViewer.tsx` (vanilla JS).

20. **Posts.** Add search and category filter matching `src/pages/PostsPage.tsx`.

21. **Events.** Show adult/kid pricing and free admission on archive and single templates.

22. **Footer, Back-to-top, 404.** Complete the footer from `src/components/crafty/Footer.tsx`, add the back-to-top button (`BackToTop.tsx`) and a 404 template (`src/pages/NotFound.tsx`).

23. **Components.** Build the components the manifest lists but that do not exist: CK Section Intro, CK Coloring Book Card, CK Gallery Card (`etch/project-manifest.json` vs `etch/components/cards.etch.html`).

## E. Admin portal

24. Add portal views and REST routes for Testimonials, Organizers, Follow-up Posts, and Coloring Book moderation (approve/reject), each behind its own capability. Live references: `src/pages/TestimonialsAdmin.tsx`, `OrganizersAdmin.tsx`, `FollowUpPostsAdmin.tsx`, `ColoringBookAdmin.tsx`.

25. Sponsor admin: delete route, logo crop to 300×300 square, filter by `sponsor_type`.

26. Organizer checklist: save progress server-side (plugin table) instead of browser `localStorage` (`assets/portal.js:200`), so organizers share one checklist.

## F. Finish

27. Update `etch-wordpress/wordpress/etch/project-manifest.json` and `docs/deployment.md` for any changes above. Run the package tests and build, then stop and hand back for re-audit before anything goes to production.
