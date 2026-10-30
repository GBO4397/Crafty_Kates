# Recovered data model

The production frontend uses a Supabase-compatible service. This model was recovered from public queries and compiled client operations. Private records were not downloaded.

## Public/editorial records

### `community_posts`

`id`, `title`, `author_name`, `author_email`, `category`, `summary`, `content`, `image_url`, `tags`, `source_url`, `status`, `submitted_at`, moderation timestamps/notes.

The deployed client inserts into this relation, but the production API currently reports that the relation does not exist. The featured Rodney Potter story is therefore effectively hardcoded in the frontend.

### `community_events`

`id`, `title`, `description`, `event_date`, `event_time_start`, `event_time_end`, `location`, `address`, `category`, `organizer_name`, `organizer_email`, `organizer_phone`, `image_url`, `website_url`, `ticket_url`, `is_free`, `ticket_price`, `status`, `admin_notes`, `submitted_at`, `reviewed_at`, `updated_at`.

### `coloring_books`

`id`, `title`, `author`, `email`, `description`, `cover_image`, `back_cover_image`, `inside_front_cover`, `inside_back_cover`, `page_count`, `status`, `featured`, `download_count`, `tags`, `created_at`, `updated_at`.

### `coloring_book_pages`

`id`, `book_id`, `page_number`, `image_url`, `title`, `is_color`, `created_at`.

### `site_images`

`id`, `slot_key`, `category`, `label`, `description`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`.

### `sponsors`

`id`, `name`, `tier`, `logo_url`, `website_url`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`, `facebook_url`, `instagram_url`, `twitter_url`, `youtube_url`, `tiktok_url`.

## Private operational records

### `car_show_registrations`

`id`, `name`, `phone`, `address`, `city`, `state`, `zip`, `email`, `entry_type`, `vehicle_year`, `vehicle_make`, `vehicle_model`, `vendor_name`, `vendor_space_size`, `cackle_car_info`, `liability_agreed`, `photo_release`, `payment_status`, `check_in_at`, `created_at`.

### `contact_submissions`

`id`, `name`, `email`, `subject`, `message`, read/reply workflow fields, `created_at`.

### `newsletter_subscribers`

`id`, `email`, subscription state, `created_at`, `updated_at`.

## Upload/storage concepts

- Sponsor logos
- Site images
- Event flyers
- Coloring-book covers and pages

The PHP rebuild stores uploads outside source control, validates MIME type and size on the server, generates collision-safe names, and serves only explicitly public media.
