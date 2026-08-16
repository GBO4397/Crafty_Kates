# Etch loop definitions

Create these as global WP Query loops. The names are referenced by the HTML-panel blueprints.

| Loop | Query |
|---|---|
| `ckFeaturedStories` | `post_type=post`, `post_status=publish`, meta `featured=1`, newest first, 1 item |
| `ckStories` | main query on the Blog Archive template |
| `ckUpcomingEvents` | `post_type=ck_event`, `post_status=publish`, meta `review_status=approved`, order by `event_date` ascending |
| `ckEventArchive` | main query on the Event Archive template |
| `ckSponsors` | `post_type=ck_sponsor`, `post_status=publish`, meta `is_active=1`, numeric meta order by `sort_order` ascending |
| `ckColoringBooks` | `post_type=ck_color_book`, `post_status=publish`, meta `review_status=approved`, newest first |
| `ckColoringArchive` | main query on the Coloring Book Archive template |
| `ckGalleries` | `post_type=ck_gallery`, `post_status=publish`, meta `is_active=1`, numeric meta order by `sort_order` ascending |
| `ckGalleryPhotos` | `post_type=ck_gallery_photo`, `post_status=publish`, `post_parent={this.id}`, order by `menu_order` ascending |
| `ckColoringPages` | `post_type=ck_color_page`, `post_status=publish`, `post_parent={this.id}`, order by `menu_order` ascending |
| `ckHeroImage` | `post_type=ck_site_image`, `name=hero-background`, 1 item |
| `ckAboutPortrait` | `post_type=ck_site_image`, `name=about-portrait`, 1 item |
| `ckCarShowHero` | `post_type=ck_site_image`, `name=car-show-hero-bg`, 1 item |
| `ckRegistrationHero` | `post_type=ck_site_image`, `name=car-show-registration-hero`, 1 item |

For child loops, verify that Etch 1.6.5 resolves `{this.id}` in the `post_parent` query preview. If it does not, create the loop locally on the single template and bind the current post ID with the Etch loop parameter UI. Do not replace the relationship with hard-coded IDs.
