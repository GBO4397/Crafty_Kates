# Security findings to correct in the rebuild

## Critical: credential embedded in public JavaScript

The deployed bundle contains a working fallback admin password. Anyone can download the bundle and recover it. The value is intentionally omitted from this repository documentation.

Required action: rotate the production admin password and remove the fallback before the new site is launched.

## Critical: client-generated admin authorization

The current UI accepts a successful verification response, but it also has a fallback path that generates an arbitrary browser token locally. The UI trusts token and expiry values stored in local storage.

The rebuild uses a server-side PHP session. Every protected route and every mutation rechecks authorization; the browser never manufactures authority.

## High: browser-to-database writes

Public and admin forms call the database service directly with the public client configuration. Admin mutations do not visibly exchange the locally stored admin token for an authenticated database session. That design makes correct row-level policies critical and difficult to audit from the deployed client alone.

The rebuild sends all mutations through PHP controllers with authorization, CSRF, validation, prepared statements, and an audit log.

## High: private personal records

Registration, contact, newsletter, and organizer records contain names, addresses, phone numbers, and email addresses. They must never be part of a public scrape, source-control seed, client-side API response, or downloadable public backup.

## Medium: inconsistent dates and stale assets

- The home-page letter advertises April 10, 2027, while registration and event content advertise April 18, 2026.
- Thirty configured image URLs returned 404 during capture.
- Several metadata values still describe the Famous.ai modernization project instead of Crafty Kates.

The rebuild centralizes event settings, localizes preserved assets, and generates route-specific metadata.
