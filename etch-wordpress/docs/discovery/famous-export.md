# Famous export assessment

Assessed 2026-08-16 from the owner-provided project export and project-settings screenshots.

## What the export contains

- A PostgreSQL database dump with schema, policies, and table data.
- Historical bundles for six edge functions.
- Stored files from the `site-images` and `event-flyers` buckets.
- No frontend source project, templates, package manifest, or original Famous editor source.

The export is therefore an authoritative backend and data source, not a complete website codebase. The production route captures and behavior map remain the frontend specification.

## Site-specific database scope

The Famous settings UI identifies these nine Crafty Kates tables:

1. `admin_settings`
2. `car_show_registrations`
3. `coloring_book_pages`
4. `coloring_books`
5. `community_events`
6. `contact_submissions`
7. `newsletter_subscribers`
8. `site_images`
9. `sponsors`

The dump contains 5 registrations, 8 coloring-book pages, 1 coloring book, 1 community event, 1 contact submission, 11 site-image records, and 10 sponsors. The admin settings table contains one credential record. Private rows and credentials must not be committed or emitted in logs.

The dump also includes 24 generic CRM tables and several generic e-commerce tables created by the Famous platform. On 2026-08-16, the owner confirmed that neither CRM nor e-commerce has been built out for Crafty Kates. Those tables are unused scaffolding and are excluded from the rebuild, data migration, admin, and deployment.

## Storage scope

The Famous settings UI confirms four public buckets:

- `coloring-books`
- `event-flyers`
- `site-images`
- `sponsor-logos`

Only buckets with files were included in the tar export. Empty bucket directories are reconstructed by the PHP setup process.

## Edge-function scope

The active Famous project contains:

- `proxy-image`
- `upload-coloring-page`
- `upload-event-flyer`
- `upload-site-image`
- `upload-sponsor-logo`
- `verify-admin`

Their required behavior is absorbed into PHP controllers and services. The JavaScript bundles will not run in the rebuilt site.

## Security corrections

- The latest exported admin-verification function contains a hardcoded password and accepts structurally plausible client-supplied tokens without server-side token state. It will not be reused.
- Upload functions can fall back to returning or storing full base64 data URLs and may choose a public key when a privileged key is unavailable. The PHP replacement stores validated files locally and performs all metadata writes server-side.
- Several exported row-level policies grant unrestricted reads or mutations, including access to registration records. The PHP application exposes no direct browser-to-database API.
- The two Famous secret names visible in project settings belong to Famous platform CRM/gateway infrastructure and are not required by the PHP rebuild.

## Migration rule

The raw export remains in the ignored `reference/famous-export` directory. A private import command will read only the site-specific tables and storage files, hash a newly supplied admin password, and write to the target application database. It will never copy the exported admin credential.
