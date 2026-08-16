# Etch dynamic data map

| CMS record | Etch bindings |
|---|---|
| Standard post | title, excerpt, content, featured image ID, permalink, published date, author |
| `ck_event` | title/content/featured image plus ACF `event_date`, start/end time, location, address, category, website/ticket URLs, free/price, featured |
| `ck_sponsor` | title/content plus ACF `tier`, `logo` media ID, website/social URLs, `sort_order`, `is_active` |
| `ck_color_book` | title/content plus ACF author, cover media IDs, review status, featured, downloads, tags |
| `ck_color_page` | featured image ID plus ACF coloring-book relationship, page number, color flag |
| `ck_gallery` | title/content/featured image plus ACF photographer, cover media ID, order, active |
| `ck_gallery_photo` | title/excerpt/featured image plus ACF gallery relationship, order, active |
| `ck_site_image` | title/featured image plus ACF slot key, category, description, active |

Use `<etch:img mediaId="{item.featured_image_id}" useSrcSet="true" />` for featured media and the ACF media ID for ACF image fields. Use `<etch:html content={this.content} unsafe="false" />` for rich content. Never set `unsafe="true"` for community submissions.
