# Etch WP deployment guide

## Deployment status and boundary

Target: `https://dev.craftykates.com`

The development site was inspected on August 16, 2026 and has the required baseline activated:

| Software | Verified version |
|---|---:|
| Etch | 1.6.5 |
| Automatic.css | 4.0.1 |
| Advanced Custom Fields | 6.8.7 |
| WS Form PRO | 1.12.6 |
| WS Form PRO Post Management | 1.6.13 |
| WS Form PRO Option Management | 1.1.1 |

WordPress is only the CMS/database runtime. Etch owns page and template authoring, components, loops, dynamic images, the Asset Manager experience, and the `/admin` page shell. ACSS owns the global design system. WS Form owns every public form. ACF supplies CMS schemas. The custom plugin supplies only independent portal authentication, protected operational data endpoints, migration, media-archive generation, and the registration bridge.

The Crafty Kates portal is additional to WP Admin and is not tied to it. Portal accounts are stored in plugin-owned tables and do not use `wp_users`, WordPress roles/capabilities, WordPress login cookies, or the WordPress Admin UI.

## Package contents

- `dist/crafty-kates-portal-1.0.0.zip` — installable integration/portal plugin.
- `dist/crafty-kates-etch-deployment-1.0.0.zip` — plugin ZIP plus Etch, ACSS, WS Form, and deployment source.
- `dist/CHECKSUMS.sha256` — SHA-256 integrity hashes for both archives.
- `wordpress/etch/` — Etch HTML-panel blueprints, component source, loops, dynamic-data map, and ACSS stylesheet.
- `wordpress/ws-form/` — form build specifications and registration field-map example.
- Private migration input — `storage/private/data.json` and the matching standalone `public/uploads` tree. These are never included in either deployment ZIP.

The Etch project itself is database content. Source files become a deployable Etch project only after they are applied in the Etch builder and the completed project is exported/backed up from Etch. The supplied files do not pretend that Etch's experimental `0.x` scripting API has a stable opaque import format.

## Phase 0 — backups and rollback point

Before changing development:

1. Take a full database backup and a `wp-content` backup.
2. Export the current Etch components/templates or retain a full database snapshot.
3. Export ACSS settings.
4. Export every existing WS Form.
5. Record active plugin versions and permalinks.
6. Confirm the backup can be restored to a separate URL.

Do not start on production. Do not transfer the raw Famous export into a public web directory.

## Phase 1 — install the integration plugin

1. Upload and activate `crafty-kates-portal-1.0.0.zip` on development.
2. Add a new, randomly generated setup key of at least 32 characters to `wp-config.php`, above the stop-editing line:

   ```php
   define('CK_PORTAL_SETUP_KEY', 'replace-with-a-new-random-value-at-least-32-characters');
   ```

3. If WP-CLI is available, run:

   ```bash
   wp crafty-kates status
   wp crafty-kates provision
   ```

   `provision` creates only missing draft CMS pages and never overwrites Etch content. It assigns the Home and Posts pages. The `/admin` draft contains `[crafty_kates_portal]`.

   The status output must show PHP 8.1 or newer, ACF active, and ZipArchive available. ZipArchive is required only for the protected Download Site Images tool, but it is part of the acceptance baseline.

4. If WP-CLI is unavailable, create the Home, Car Show, Car Show Registration, Community Stories, Privacy Policy, Terms of Use, Disclaimer, and Crafty Kates Admin pages manually. Set the Admin slug to `admin` and place `[crafty_kates_portal]` in its Etch markup.
5. Open `/admin`, expand the one-time setup panel, enter the setup key, and create the first Portal Owner.
6. Remove `CK_PORTAL_SETUP_KEY` from `wp-config.php` immediately after the first owner is created. The setup route also disables itself as soon as a portal user exists.

Activation creates only plugin tables and rewrite rules. It does not create a WordPress user, publish pages, import private data, or replace an Etch template.

## Phase 2 — ACF content model and migration

The plugin registers the versioned ACF content model:

- `ck_event`
- `ck_sponsor`
- `ck_color_book`
- `ck_color_page`
- `ck_gallery`
- `ck_gallery_photo`
- `ck_site_image`

Gallery photos, coloring pages, and the eleven fixed site-image slots are CMS records with attachment IDs. Etch can query those records and render them with Dynamic Image elements; all media remains visible and manageable in Etch Asset Manager.

Transfer the ignored private export to a path outside the web root. The `--uploads` value is the standalone **public directory**, because the source JSON uses `/uploads/...` paths.

```bash
wp crafty-kates import /private/crafty-kates/data.json \
  --uploads=/private/crafty-kates/standalone/public \
  --dry-run
```

Confirm the counts and that all media references resolve, then run the same command without `--dry-run`. The importer is idempotent: it retains `_ck_source_id` and `_ck_source_path`, updates existing migrated records, and does not duplicate attachments on a rerun.

The importer includes site settings, fixed images, sponsors, stories, events, coloring books/pages, galleries/photos, registrations, contacts, and newsletter records. It never imports the Famous admin credential, auth schema, audit history, CRM scaffolding, e-commerce scaffolding, or secrets.

After verification, remove the private export from the server. Keep the offline owner copy encrypted.

## Phase 3 — configure Automatic.css

1. Apply the palette, typography, radius, and content-width values from `wordpress/etch/acss-settings.md`.
2. Enable the required brand and semantic colors.
3. Keep ACSS fluid spacing/type and contextual color relationships active.
4. Do not copy the old standalone CSS wholesale into Etch. In Etch Style Manager create the global stylesheet `Crafty Kates` from `wordpress/etch/styles/crafty-kates.css`; it is a small semantic layer that consumes ACSS variables.
5. Confirm `.btn--primary`, `.btn--secondary`, `.grid--auto-*`, `.grid-gap`, `.bg--*`, `.text--*`, and spacing variables resolve in the canvas.

Etch and ACSS require no builder compatibility toggle.

## Phase 4 — build the Etch project

Apply files in the order in `wordpress/etch/project-manifest.json`:

1. Global stylesheet.
2. CK Skip Link, Header, Footer, Section Intro, and card components.
3. Etch native Basic Nav/Burger, Gallery/Lightbox, Carousel, Dialog, and any required accessibility components.
4. Global loops from `wordpress/etch/loops.md`.
5. Global header/footer, archive, and single templates.
6. Home, Car Show, Registration, legal, and `/admin` pages.

Paste each `.etch.html` file into Etch's HTML panel for its target page/template, allow Etch to parse it into native elements, then convert repeated structures into components. Bind every image with Etch Dynamic Image and an attachment ID. Do not hard-code migrated media URLs.

Use `<etch:html ... unsafe="false" />` for rich content. Community-submitted content must never use `unsafe="true"`.

The `/admin` page uses an Etch template without the public header/footer and embeds `[crafty_kates_portal]`. The plugin enforces independent sessions and permissions; Etch owns the page/template context around the app.

## Phase 5 — build and connect WS Form

Create the six forms from `wordpress/ws-form/form-specs.json`, test them, and export the official WS Form JSON files into a private deployment record:

- Contact
- Newsletter
- Car Show Registration
- Submit Story
- Submit Event
- Submit Coloring Book

Use WS Form Post Management for Story, Event, and Coloring Book creation. New public content must be draft/pending. Map the ACF fields listed in `wordpress/etch/dynamic-data-map.md`.

For Car Show Registration, add a Run WordPress Hook action:

- type: Action
- tag: `ckp_wsform_registration`
- run: Submit
- priority: after submission creation, before notifications

After the final form import, copy `registration-field-map.example.json`, replace values with final field IDs, and run:

```bash
wp crafty-kates wsform-map /private/registration-field-map.json
wp crafty-kates status
```

Paste the final WS Form shortcodes into the Etch blueprints in place of every `REPLACE_*` token. Styling remains in WS Form/ACSS; the portal plugin does not render public forms.

## Phase 6 — `/admin` acceptance checks

Test with a Portal Owner and at least one limited user. Also test in a browser with no WordPress login cookie.

- `/admin` is noindex, uncached, frame-denied, and usable without a WP Admin session.
- Portal login does not log the user into WordPress.
- Image Manager shows exactly the eleven fixed slots plus gallery uploads, and new uploads appear in Etch Asset Manager.
- Sponsor Admin creates/edits sponsors, tiers, links, order, active state, and logos.
- Event Admin lists pending/approved/rejected WS Form submissions mapped to `ck_event` and supports notes/approve/reject/delete.
- Registrations searches, filters, sorts, shows details, and exports only for authorized users.
- Check-In changes check-in/payment state and survives reload.
- Organizer Checklist contains 54 tasks in six sections and intentionally saves checkmarks only in that browser/device.
- Download Site Images includes public Etch-managed media and excludes portal accounts, registrations, contacts, and private migration data.
- User Admin creates independent users, applies role defaults, allows per-tool overrides, deactivates accounts, requires password changes, and revokes sessions.
- Five failed logins cause a 15-minute account lock; cookies are Secure/HttpOnly/SameSite=Strict over HTTPS; mutations reject a missing/invalid CSRF token.

## Phase 7 — public acceptance checks

- Header navigation, mobile navigation, footer, skip link, focus order, and keyboard operation.
- Home sections, sponsor ordering, featured story/event/book, galleries, and fixed image slots.
- Story, event, coloring-book, gallery, car-show, registration, and legal routes.
- Native Etch Gallery/Lightbox/Carousel interactions and reduced-motion behavior.
- All six WS Forms: happy path, validation, conditional fields, upload size/type, spam control, confirmation, notification, and created CMS/submission records.
- Registration hook produces one portal registration per WS Form submission and is idempotent for the same submission ID.
- Responsive layouts at phone, tablet, laptop, and wide desktop sizes.
- No mixed content, broken dynamic image IDs, PHP warnings, console errors, or public REST exposure of private rows.

## Promotion and rollback

Only after development acceptance:

1. Back up development again, including the completed Etch database state, Etch component/pattern exports, ACSS settings, official WS Form exports, and plugin ZIP checksum.
2. Repeat the same ordered deployment on a production staging clone.
3. Freeze content briefly, run the final migration delta, verify counts, then cut over.
4. Keep the current Famous site and DNS rollback available until production acceptance is signed off.

Rollback is database-and-files based: restore the pre-deployment database and `wp-content` backup, then restore the prior DNS/origin. Deactivating the plugin alone does not remove its tables or imported CMS records, by design. Never delete migrated data as a rollback technique.
