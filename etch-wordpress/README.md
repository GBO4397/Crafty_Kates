# Crafty Kates Etch rebuild

This directory contains the behavior-mapped rebuild of CraftyKates.com for Etch WP, Automatic.css, ACF, and WS Form PRO. It lives separately from the existing React/Vite application and replaces the Famous.ai runtime without unminifying or reusing Famous's generated application bundle.

## Target architecture

- Etch builds every public page, template, component, loop, and the `/admin` page shell.
- Automatic.css owns the global design system.
- Etch Asset Manager is the media workspace.
- ACF supplies CMS custom post types and fields.
- WS Form PRO owns public forms and submission workflows.
- The Crafty Kates Portal plugin supplies the independent `/admin` identity/security layer, protected operational endpoints, migrations, and the small WS Form registration bridge.
- WordPress is the CMS/database runtime only. The supplemental portal does not use WordPress users or replace WP Admin.

The installable plugin source is in `wordpress/wp-content/plugins/crafty-kates-portal`. Etch blueprints and ACSS source are in `wordpress/etch`; WS Form build specifications are in `wordpress/ws-form`.

## Build and verification

```bash
php tests/wordpress-package.php
php bin/build-wordpress-package.php
```

The build creates an installable plugin ZIP and a complete Etch deployment bundle in `dist/`. Private Famous exports, portal credentials, and form submissions are deliberately excluded.

Follow [docs/deployment.md](docs/deployment.md) for the controlled installation on `dev.craftykates.com`, Etch/ACSS/WS Form authoring order, migration, acceptance testing, and rollback.
