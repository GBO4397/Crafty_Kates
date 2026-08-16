# Crafty Kates route inventory

Captured from the production site on 2026-08-16.

## Public routes

| Route | Purpose | Dynamic behavior |
| --- | --- | --- |
| `/` | Long-form home page, about, letter, photo reel, galleries, featured post, coloring books, events, sponsors, contact, newsletter | Section navigation, mobile menu, car-show CTAs, photo lightbox/reel, testimonials, post/event/coloring-book submission overlays, contact form, newsletter form |
| `/posts` | Community posts archive | Category filters, featured story reader, post submission overlay, query-driven detail state |
| `/posts?post=rodney-potter` | Featured Rodney Potter story | Full story state selected by query string |
| `/events` | Community events archive | Event-type filters, event submission overlay, featured car-show CTA |
| `/coloring-books` | Approved coloring-book archive | Opens the four-step coloring-book creator |
| `/coloring-book/:id` | Digital coloring-book reader | Page viewer and client-generated download/print flow |
| `/car-show` | Classic Burger Car Show information and sponsor directory | Sponsor tier filters and sponsor CTA |
| `/register` | Car-show entry registration | Vehicle, vendor, and cackle-car variants with conditional fields and releases |
| `/gallery/ben-radatz` | Ben Radatz gallery | Grid/masonry modes and photo lightbox |
| `/gallery/k-mikael-wallin` | K. Mikael Wallin gallery | Grid/masonry modes and photo lightbox |
| `/legal/privacy-policy` | Privacy policy | Static legal content |
| `/legal/disclaimer` | Disclaimer | Static legal content |
| `/legal/terms-of-use` | Terms of use | Static legal content |
| `*` | Not-found state | Returns users to the site |

## Protected management routes

| Route | Module |
| --- | --- |
| `/admin` | Unified admin dashboard |
| `/image-admin` | Site image slots and uploads |
| `/sponsor-admin` | Sponsor CRUD, logos, tiers, ordering, and active status |
| `/event-admin` | Review, approve, reject, annotate, and delete community events |
| `/checklist` | 54-task organizer checklist in six categories |
| `/download-images` | Hardcoded image archive, manifest, retry, and migration guide |

The unified dashboard also lazy-loads registration management and day-of check-in modules.
