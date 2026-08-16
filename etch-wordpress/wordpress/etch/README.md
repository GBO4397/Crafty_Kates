# Crafty Kates Etch source package

This directory is the source-of-truth handoff for the Etch project stored in the WordPress database. It is not a WordPress theme and must not be copied into `wp-content/themes`.

## Ownership boundary

- Etch: every public page, template, component, loop, the `/admin` page shell, and the Asset Manager experience.
- Automatic.css: palette, type scale, spacing, grids, buttons, responsive utilities, and contextual color relationships.
- WS Form PRO: public forms, validation, uploads, spam controls, email, save/submit actions, and form submissions.
- ACF: CMS post-type and field definitions only.
- Crafty Kates Portal plugin: independent portal authentication, protected operational APIs, the WS Form registration bridge, migration, and archive generation.
- WordPress: CMS/database/runtime only. WordPress users, roles, cookies, Media screen, and WP Admin are not the Crafty Kates portal.

## Applying the source

1. Configure the ACSS values from `acss-settings.md`.
2. In Etch Style Manager, create a global stylesheet named `Crafty Kates` and paste `styles/crafty-kates.css`.
3. Build the components in `components/` in the order listed by `project-manifest.json`. Use Etch native Basic Nav, Gallery/Lightbox, Carousel, Dialog, and Skip Link components where named.
4. Create the loops in `loops.md`.
5. Open each target page/template in Etch and paste the matching `.etch.html` source into the HTML panel. Replace `REPLACE_*` tokens only after WS Form IDs and the component instances exist.
6. Use Etch Dynamic Image elements for every media ID. Do not paste permanent file URLs into page markup.
7. Run the acceptance checks in the deployment guide before publishing.

Etch's current public API is experimental (`0.x`), so this package deliberately uses reviewable HTML-panel source and Etch's own UI instead of fabricating opaque Copy/Paste JSON. After the source has been applied and accepted on development, export the resulting Etch components/patterns with Etch itself for the production handoff.
