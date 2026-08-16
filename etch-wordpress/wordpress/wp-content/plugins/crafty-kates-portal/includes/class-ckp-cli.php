<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

final class CKP_CLI
{
    public static function boot(): void
    {
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::add_command('crafty-kates', CKP_CLI_Command::class);
        }
    }
}

/**
 * Inspect or import the Crafty Kates WordPress package.
 */
final class CKP_CLI_Command
{
    /**
     * Show plugin, dependency, content, and portal-table status.
     *
     * ## EXAMPLES
     *
     *     wp crafty-kates status
     */
    public function status(): void
    {
        global $wpdb;
        $post_types = ['ck_event', 'ck_sponsor', 'ck_color_book', 'ck_gallery'];
        $rows = [];
        foreach ($post_types as $post_type) {
            $counts = wp_count_posts($post_type);
            $rows[] = [
                'store' => $post_type,
                'count' => (int) ($counts->publish ?? 0) + (int) ($counts->draft ?? 0) + (int) ($counts->pending ?? 0) + (int) ($counts->private ?? 0),
            ];
        }
        foreach (['portal_users', 'registrations', 'contacts', 'subscribers'] as $table_name) {
            $table = CKP_Database::table($table_name);
            $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
            $rows[] = ['store' => $table_name, 'count' => $exists ? (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}") : 'missing'];
        }
        WP_CLI::log('Crafty Kates Portal ' . CKP_VERSION);
        WP_CLI::log('PHP: ' . PHP_VERSION);
        WP_CLI::log('ZipArchive: ' . (class_exists('ZipArchive') ? 'available' : 'missing (Download Site Images unavailable)'));
        WP_CLI::log('ACF: ' . (function_exists('acf_add_local_field_group') ? 'active' : 'missing'));
        WP_CLI::log('Etch: ' . (defined('ETCH_VERSION') || class_exists('Etch') ? 'detected' : 'verify in Plugins'));
        WP_CLI::log('Automatic.css: ' . (defined('ACSS_VERSION') ? 'detected' : 'verify in Plugins'));
        WP_CLI\Utils\format_items('table', $rows, ['store', 'count']);
        WP_CLI::log('WS Form registration map: ' . (CKP_WSForm::field_map() === [] ? 'missing' : 'configured'));
    }

    /**
     * Store the WS Form registration field-ID map used by the portal bridge.
     *
     * ## OPTIONS
     *
     * <json>
     * : Absolute path to a JSON object mapping semantic names to WS Form field IDs.
     *
     * ## EXAMPLES
     *
     *     wp crafty-kates wsform-map /secure/registration-field-map.json
     */
    public function wsform_map(array $args): void
    {
        $path = (string) ($args[0] ?? '');
        if ($path === '' || !is_readable($path)) WP_CLI::error('Provide a readable registration field-map JSON file.');
        $map = json_decode((string) file_get_contents($path), true);
        $required = ['name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'entry_type', 'liability_agreed', 'photo_release'];
        if (!is_array($map) || array_diff($required, array_keys($map)) !== []) {
            WP_CLI::error('The map must be a JSON object containing: ' . implode(', ', $required));
        }
        $clean = [];
        foreach ($map as $key => $value) {
            if (!is_int($value) && !is_string($value)) continue;
            $clean[sanitize_key((string) $key)] = sanitize_text_field((string) $value);
        }
        update_option('ckp_wsform_registration_map', $clean, false);
        WP_CLI::success('WS Form registration field map saved.');
    }

    /**
     * Create the CMS page records Etch will author and assign the home page.
     * Existing pages are retained; this command never replaces Etch content.
     *
     * ## EXAMPLES
     *
     *     wp crafty-kates provision
     */
    public function provision(): void
    {
        $pages = [
            'home' => ['Home', ''],
            'car-show' => ['Car Show', ''],
            'register' => ['Car Show Registration', ''],
            'posts' => ['Community Stories', ''],
            'privacy-policy' => ['Privacy Policy', ''],
            'terms-of-use' => ['Terms of Use', ''],
            'disclaimer' => ['Disclaimer', ''],
            'admin' => ['Crafty Kates Admin', '[crafty_kates_portal]'],
        ];
        $ids = [];
        foreach ($pages as $slug => [$title, $content]) {
            $existing = get_page_by_path($slug, OBJECT, 'page');
            if ($existing instanceof WP_Post) {
                $ids[$slug] = $existing->ID;
                continue;
            }
            $id = wp_insert_post([
                'post_type' => 'page', 'post_status' => 'draft', 'post_name' => $slug,
                'post_title' => $title, 'post_content' => $content,
            ], true);
            if (is_wp_error($id)) {
                WP_CLI::warning('Could not create /' . $slug . ': ' . $id->get_error_message());
                continue;
            }
            $ids[$slug] = (int) $id;
        }
        if (!empty($ids['home'])) {
            update_option('show_on_front', 'page');
            update_option('page_on_front', $ids['home']);
        }
        if (!empty($ids['posts'])) update_option('page_for_posts', $ids['posts']);
        WP_CLI::success('Etch CMS page records are provisioned as drafts. Open each in Etch, apply the supplied blueprint, then publish after review.');
    }

    /**
     * Import the private standalone export into ACF, WordPress Media, and plugin tables.
     *
     * The command is idempotent: source IDs and media paths are retained as migration keys.
     * Portal credentials and audit rows from the standalone export are never imported.
     *
     * ## OPTIONS
     *
     * <json>
     * : Absolute path to storage/private/data.json.
     *
     * [--uploads=<dir>]
     * : Absolute path to the standalone public directory. Required to import /uploads/... media.
     *
     * [--dry-run]
     * : Validate and report counts without changing WordPress.
     *
     * ## EXAMPLES
     *
     *     wp crafty-kates import /secure/data.json --uploads=/secure/standalone/public --dry-run
     *     wp crafty-kates import /secure/data.json --uploads=/secure/standalone/public
     *
     * @when after_wp_load
     */
    public function import(array $args, array $assoc_args): void
    {
        $json_path = (string) ($args[0] ?? '');
        $uploads_root = isset($assoc_args['uploads']) ? (string) $assoc_args['uploads'] : '';
        $dry_run = (bool) WP_CLI\Utils\get_flag_value($assoc_args, 'dry-run', false);
        $data = $this->read_export($json_path);

        if (!$dry_run) {
            CKP_Database::maybe_upgrade();
        }
        if ($uploads_root !== '' && !is_dir($uploads_root)) {
            WP_CLI::error('The --uploads directory does not exist: ' . $uploads_root);
        }

        $counts = $this->source_counts($data);
        WP_CLI\Utils\format_items('table', $counts, ['source', 'count']);
        if ($dry_run) {
            $this->validate_media_paths($data, $uploads_root);
            WP_CLI::success('Dry run complete. No WordPress content, media, options, or tables were changed.');
            return;
        }

        $this->import_settings((array) ($data['site_settings'] ?? []));
        $this->import_site_images((array) ($data['site_images'] ?? []), $uploads_root);
        $this->import_sponsors((array) ($data['sponsors'] ?? []), $uploads_root);
        $this->import_events((array) ($data['events'] ?? []), $uploads_root);
        $this->import_posts((array) ($data['posts'] ?? []), $uploads_root);
        $this->import_coloring_books(
            (array) ($data['coloring_books'] ?? []),
            (array) ($data['coloring_book_pages'] ?? []),
            $uploads_root
        );
        $this->import_galleries(
            (array) ($data['galleries'] ?? []),
            (array) ($data['gallery_images'] ?? []),
            $uploads_root
        );
        $this->import_registrations((array) ($data['car_show_registrations'] ?? []));
        $this->import_contacts((array) ($data['contact_submissions'] ?? []));
        $this->import_subscribers((array) ($data['newsletter_subscribers'] ?? []));

        flush_rewrite_rules(false);
        WP_CLI::success('Crafty Kates data imported. Run `wp crafty-kates status` and complete the deployment verification checklist.');
    }

    private function read_export(string $path): array
    {
        if ($path === '' || !is_file($path) || !is_readable($path)) {
            WP_CLI::error('Provide a readable absolute path to the private data.json export.');
        }
        $json = file_get_contents($path);
        if (!is_string($json)) {
            WP_CLI::error('The export could not be read.');
        }
        $data = json_decode($json, true);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            WP_CLI::error('The export is not valid JSON: ' . json_last_error_msg());
        }
        return $data;
    }

    private function source_counts(array $data): array
    {
        $keys = [
            'site_settings', 'site_images', 'sponsors', 'posts', 'events', 'coloring_books',
            'coloring_book_pages', 'galleries', 'gallery_images', 'car_show_registrations',
            'contact_submissions', 'newsletter_subscribers',
        ];
        $rows = [];
        foreach ($keys as $key) {
            $rows[] = ['source' => $key, 'count' => count((array) ($data[$key] ?? []))];
        }
        return $rows;
    }

    private function validate_media_paths(array $data, string $uploads_root): void
    {
        $urls = [];
        foreach ((array) ($data['site_images'] ?? []) as $row) $urls[] = $row['image_url'] ?? '';
        foreach ((array) ($data['sponsors'] ?? []) as $row) $urls[] = $row['logo_url'] ?? '';
        foreach ((array) ($data['posts'] ?? []) as $row) $urls[] = $row['image_url'] ?? '';
        foreach ((array) ($data['events'] ?? []) as $row) $urls[] = $row['image_url'] ?? '';
        foreach ((array) ($data['coloring_books'] ?? []) as $row) {
            foreach (['cover_image', 'back_cover_image', 'inside_front_cover', 'inside_back_cover'] as $field) $urls[] = $row[$field] ?? '';
        }
        foreach ((array) ($data['coloring_book_pages'] ?? []) as $row) $urls[] = $row['image_url'] ?? '';
        foreach ((array) ($data['galleries'] ?? []) as $row) $urls[] = $row['cover_image'] ?? '';
        foreach ((array) ($data['gallery_images'] ?? []) as $row) $urls[] = $row['image_url'] ?? '';
        $urls = array_values(array_unique(array_filter(array_map('strval', $urls))));
        if ($urls !== [] && $uploads_root === '') {
            WP_CLI::warning(count($urls) . ' media references found. Supply --uploads=<standalone-public-dir> for the real import.');
            return;
        }
        $missing = 0;
        foreach ($urls as $url) {
            if ($this->resolve_media_path($url, $uploads_root) === null) $missing++;
        }
        if ($missing > 0) {
            WP_CLI::warning($missing . ' referenced media files were not found under --uploads. Records can import, but those images will remain empty.');
        } else {
            WP_CLI::log(count($urls) . ' media references resolved.');
        }
    }

    private function import_settings(array $rows): void
    {
        $settings = [];
        foreach ($rows as $row) {
            if (!is_array($row) || empty($row['key'])) continue;
            $value = $row['value'] ?? '';
            $type = (string) ($row['type'] ?? 'string');
            $settings[sanitize_key((string) $row['key'])] = match ($type) {
                'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'integer', 'int' => (int) $value,
                'number', 'float' => (float) $value,
                'json' => is_string($value) ? (json_decode($value, true) ?? $value) : $value,
                default => $value,
            };
        }
        update_option('ck_site_settings', $settings, false);
    }

    private function import_site_images(array $rows, string $uploads_root): void
    {
        $slots = CKP_Content::site_image_slots();
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $slot = sanitize_key((string) ($row['slot_key'] ?? ''));
            if (!isset($slots[$slot])) continue;
            $post_id = CKP_Content::ensure_site_image_slot($slot);
            $attachment = $this->import_attachment((string) ($row['image_url'] ?? ''), $uploads_root, $post_id, (string) ($row['label'] ?? $slots[$slot]['label']));
            if ($attachment > 0) set_post_thumbnail($post_id, $attachment);
        }
    }

    private function import_sponsors(array $rows, string $uploads_root): void
    {
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $id = $this->upsert_post('ck_sponsor', $row, 'name', 'publish');
            if ($id < 1) continue;
            foreach (['tier', 'website_url', 'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'sort_order', 'is_active'] as $field) {
                if (array_key_exists($field, $row)) $this->update_field($field, $row[$field], $id);
            }
            $logo = $this->import_attachment((string) ($row['logo_url'] ?? ''), $uploads_root, $id, (string) ($row['name'] ?? 'Sponsor logo'));
            if ($logo > 0) $this->update_field('logo', $logo, $id);
        }
    }

    private function import_events(array $rows, string $uploads_root): void
    {
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $review = in_array(($row['status'] ?? ''), ['approved', 'rejected'], true) ? $row['status'] : 'pending';
            $id = $this->upsert_post('ck_event', $row, 'title', $review === 'approved' ? 'publish' : 'draft');
            if ($id < 1) continue;
            foreach (['event_date', 'event_time_start', 'event_time_end', 'location', 'address', 'category', 'organizer_name', 'organizer_email', 'organizer_phone', 'website_url', 'ticket_url', 'is_free', 'ticket_price', 'featured', 'admin_notes', 'submitted_at', 'reviewed_at'] as $field) {
                if (array_key_exists($field, $row)) $this->update_field($field, $row[$field], $id);
            }
            $this->update_field('review_status', $review, $id);
            $image = $this->import_attachment((string) ($row['image_url'] ?? ''), $uploads_root, $id, (string) ($row['title'] ?? 'Event image'));
            if ($image > 0) set_post_thumbnail($id, $image);
        }
    }

    private function import_posts(array $rows, string $uploads_root): void
    {
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $status = ($row['status'] ?? '') === 'published' || ($row['status'] ?? '') === 'approved' ? 'publish' : 'draft';
            $id = $this->upsert_post('post', $row, 'title', $status);
            if ($id < 1) continue;
            if (!empty($row['tags'])) wp_set_post_tags($id, is_array($row['tags']) ? $row['tags'] : array_map('trim', explode(',', (string) $row['tags'])));
            $image = $this->import_attachment((string) ($row['image_url'] ?? ''), $uploads_root, $id, (string) ($row['title'] ?? 'Post image'));
            if ($image > 0) set_post_thumbnail($id, $image);
        }
    }

    private function import_coloring_books(array $books, array $pages, string $uploads_root): void
    {
        foreach ($books as $row) {
            if (!is_array($row)) continue;
            $review = in_array(($row['status'] ?? ''), ['approved', 'rejected'], true) ? $row['status'] : 'pending';
            $id = $this->upsert_post('ck_color_book', $row, 'title', $review === 'approved' ? 'publish' : 'draft');
            if ($id < 1) continue;
            foreach (['author', 'featured', 'download_count', 'tags'] as $field) {
                if (array_key_exists($field, $row)) $this->update_field($field, $row[$field], $id);
            }
            $this->update_field('contact_email', $row['email'] ?? '', $id);
            $this->update_field('review_status', $review, $id);
            foreach (['cover_image', 'back_cover_image', 'inside_front_cover', 'inside_back_cover'] as $field) {
                $attachment = $this->import_attachment((string) ($row[$field] ?? ''), $uploads_root, $id, (string) ($row['title'] ?? 'Coloring book'));
                if ($attachment > 0) {
                    $this->update_field($field, $attachment, $id);
                    if ($field === 'cover_image') set_post_thumbnail($id, $attachment);
                }
            }
            $book_pages = array_values(array_filter($pages, static fn ($page): bool => is_array($page) && (string) ($page['book_id'] ?? '') === (string) ($row['id'] ?? '')));
            usort($book_pages, static fn (array $a, array $b): int => (int) ($a['page_number'] ?? 0) <=> (int) ($b['page_number'] ?? 0));
            foreach ($book_pages as $page) {
                $page['_parent'] = $id;
                $page['_menu_order'] = (int) ($page['page_number'] ?? 0);
                if (empty($page['title'])) $page['title'] = 'Page ' . (string) ($page['page_number'] ?? '');
                $page_id = $this->upsert_post('ck_color_page', $page, 'title', 'publish');
                if ($page_id < 1) continue;
                $this->update_field('coloring_book', $id, $page_id);
                $this->update_field('page_number', (int) ($page['page_number'] ?? 0), $page_id);
                $this->update_field('is_color', !empty($page['is_color']) ? 1 : 0, $page_id);
                $attachment = $this->import_attachment((string) ($page['image_url'] ?? ''), $uploads_root, $page_id, (string) ($page['title'] ?? 'Coloring page'));
                if ($attachment > 0) set_post_thumbnail($page_id, $attachment);
            }
        }
    }

    private function import_galleries(array $galleries, array $images, string $uploads_root): void
    {
        foreach ($galleries as $row) {
            if (!is_array($row)) continue;
            $id = $this->upsert_post('ck_gallery', $row, 'name', !empty($row['is_active']) ? 'publish' : 'draft');
            if ($id < 1) continue;
            $this->update_field('photographer_name', $row['name'] ?? '', $id);
            $this->update_field('sort_order', (int) ($row['sort_order'] ?? 0), $id);
            $this->update_field('is_active', !empty($row['is_active']) ? 1 : 0, $id);
            $cover = $this->import_attachment((string) ($row['cover_image'] ?? ''), $uploads_root, $id, (string) ($row['name'] ?? 'Gallery cover'));
            if ($cover > 0) {
                $this->update_field('cover_image', $cover, $id);
                set_post_thumbnail($id, $cover);
            }
            $gallery_images = array_values(array_filter($images, static fn ($image): bool => is_array($image) && (string) ($image['gallery_id'] ?? '') === (string) ($row['id'] ?? '') && !empty($image['is_active'])));
            usort($gallery_images, static fn (array $a, array $b): int => (int) ($a['sort_order'] ?? 0) <=> (int) ($b['sort_order'] ?? 0));
            foreach ($gallery_images as $image) {
                $image['_parent'] = $id;
                $image['_menu_order'] = (int) ($image['sort_order'] ?? 0);
                $image['title'] = (string) ($image['alt_text'] ?? $row['name'] ?? 'Gallery image');
                $photo_id = $this->upsert_post('ck_gallery_photo', $image, 'title', 'publish');
                if ($photo_id < 1) continue;
                $this->update_field('gallery', $id, $photo_id);
                $this->update_field('sort_order', (int) ($image['sort_order'] ?? 0), $photo_id);
                $this->update_field('is_active', 1, $photo_id);
                $attachment = $this->import_attachment((string) ($image['image_url'] ?? ''), $uploads_root, $photo_id, (string) ($image['alt_text'] ?? $row['name'] ?? 'Gallery image'));
                if ($attachment > 0) {
                    update_post_meta($attachment, '_wp_attachment_image_alt', sanitize_text_field((string) ($image['alt_text'] ?? '')));
                    wp_update_post(['ID' => $attachment, 'post_excerpt' => sanitize_textarea_field((string) ($image['caption'] ?? ''))]);
                    set_post_thumbnail($photo_id, $attachment);
                }
            }
        }
    }

    private function import_registrations(array $rows): void
    {
        global $wpdb;
        $table = CKP_Database::table('registrations');
        foreach ($rows as $row) {
            if (!is_array($row) || empty($row['id'])) continue;
            $now = current_time('mysql', true);
            $data = [
                'source_id' => (string) $row['id'], 'name' => sanitize_text_field((string) ($row['name'] ?? '')),
                'email' => sanitize_email((string) ($row['email'] ?? '')), 'phone' => sanitize_text_field((string) ($row['phone'] ?? '')),
                'address' => sanitize_text_field((string) ($row['address'] ?? '')), 'city' => sanitize_text_field((string) ($row['city'] ?? '')),
                'state' => sanitize_text_field((string) ($row['state'] ?? '')), 'postal_code' => sanitize_text_field((string) ($row['zip'] ?? '')),
                'entry_type' => sanitize_key((string) ($row['entry_type'] ?? 'vehicle')), 'vehicle_year' => sanitize_text_field((string) ($row['vehicle_year'] ?? '')),
                'vehicle_make' => sanitize_text_field((string) ($row['vehicle_make'] ?? '')), 'vehicle_model' => sanitize_text_field((string) ($row['vehicle_model'] ?? '')),
                'vendor_name' => sanitize_text_field((string) ($row['vendor_name'] ?? '')), 'vendor_space_size' => sanitize_text_field((string) ($row['vendor_space_size'] ?? '')),
                'cackle_car_info' => sanitize_textarea_field((string) ($row['cackle_car_info'] ?? '')), 'liability_agreed' => !empty($row['liability_agreed']) ? 1 : 0,
                'photo_release' => !empty($row['photo_release']) ? 1 : 0, 'payment_status' => in_array(($row['payment_status'] ?? ''), ['unpaid', 'paid', 'waived'], true) ? $row['payment_status'] : 'unpaid',
                'checked_in_at' => $this->mysql_date($row['check_in_at'] ?? null), 'created_at' => $this->mysql_date($row['created_at'] ?? null) ?? $now,
                'updated_at' => $now,
            ];
            $existing_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE source_id = %s", (string) $row['id']));
            if ($existing_id > 0) {
                unset($data['payment_status'], $data['checked_in_at']);
                $wpdb->update($table, $data, ['id' => $existing_id]);
            } else {
                $wpdb->insert($table, $data);
            }
        }
    }

    private function import_contacts(array $rows): void
    {
        global $wpdb;
        $table = CKP_Database::table('contacts');
        foreach ($rows as $row) {
            if (!is_array($row) || empty($row['id'])) continue;
            $created = $this->mysql_date($row['created_at'] ?? null) ?? current_time('mysql', true);
            $data = [
                'source_id' => (string) $row['id'], 'name' => sanitize_text_field((string) ($row['name'] ?? '')),
                'email' => sanitize_email((string) ($row['email'] ?? '')), 'subject' => sanitize_text_field((string) ($row['subject'] ?? '')),
                'message' => sanitize_textarea_field((string) ($row['message'] ?? '')), 'status' => sanitize_key((string) ($row['status'] ?? 'new')),
                'created_at' => $created, 'updated_at' => $this->mysql_date($row['updated_at'] ?? null) ?? $created,
            ];
            $this->upsert_table_row($table, (string) $row['id'], $data);
        }
    }

    private function import_subscribers(array $rows): void
    {
        global $wpdb;
        $table = CKP_Database::table('subscribers');
        foreach ($rows as $row) {
            if (!is_array($row) || empty($row['email'])) continue;
            $source_id = !empty($row['id']) ? (string) $row['id'] : hash('sha256', strtolower((string) $row['email']));
            $created = $this->mysql_date($row['created_at'] ?? null) ?? current_time('mysql', true);
            $data = [
                'source_id' => $source_id, 'email' => sanitize_email((string) $row['email']),
                'is_active' => array_key_exists('is_active', $row) && empty($row['is_active']) ? 0 : 1,
                'created_at' => $created, 'updated_at' => $this->mysql_date($row['updated_at'] ?? null) ?? $created,
            ];
            $existing_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE source_id = %s OR email = %s LIMIT 1", $source_id, $data['email']));
            if ($existing_id > 0) $wpdb->update($table, $data, ['id' => $existing_id]);
            else $wpdb->insert($table, $data);
        }
    }

    private function upsert_post(string $post_type, array $row, string $title_field, string $status): int
    {
        $source_id = (string) ($row['id'] ?? '');
        $existing = get_posts([
            'post_type' => $post_type, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids',
            'meta_key' => '_ck_source_id', 'meta_value' => $source_id, 'suppress_filters' => false,
        ]);
        $post = [
            'post_type' => $post_type, 'post_status' => $status,
            'post_title' => sanitize_text_field((string) ($row[$title_field] ?? 'Untitled')),
            'post_content' => wp_kses_post((string) ($row['content'] ?? $row['description'] ?? '')),
            'post_excerpt' => sanitize_textarea_field((string) ($row['summary'] ?? $row['subtitle'] ?? '')),
            'post_parent' => (int) ($row['_parent'] ?? 0),
            'menu_order' => (int) ($row['_menu_order'] ?? 0),
        ];
        if (!empty($row['slug'])) $post['post_name'] = sanitize_title((string) $row['slug']);
        if ($existing !== []) $post['ID'] = (int) $existing[0];
        $id = wp_insert_post($post, true);
        if (is_wp_error($id)) {
            WP_CLI::warning('Skipped ' . $post_type . ' source ' . $source_id . ': ' . $id->get_error_message());
            return 0;
        }
        update_post_meta((int) $id, '_ck_source_id', $source_id);
        return (int) $id;
    }

    private function upsert_table_row(string $table, string $source_id, array $data): void
    {
        global $wpdb;
        $existing_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE source_id = %s", $source_id));
        if ($existing_id > 0) $wpdb->update($table, $data, ['id' => $existing_id]);
        else $wpdb->insert($table, $data);
    }

    private function import_attachment(string $source_url, string $uploads_root, int $parent_id, string $description): int
    {
        if ($source_url === '') return 0;
        $existing = get_posts([
            'post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1, 'fields' => 'ids',
            'meta_key' => '_ck_source_path', 'meta_value' => $source_url,
        ]);
        if ($existing !== []) return (int) $existing[0];
        $source = $this->resolve_media_path($source_url, $uploads_root);
        if ($source === null) {
            WP_CLI::warning('Media not found: ' . $source_url);
            return 0;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        $tmp = wp_tempnam(basename($source));
        if (!is_string($tmp) || !copy($source, $tmp)) {
            WP_CLI::warning('Could not stage media: ' . $source_url);
            return 0;
        }
        $file = ['name' => sanitize_file_name(basename($source)), 'tmp_name' => $tmp];
        $id = media_handle_sideload($file, $parent_id, sanitize_text_field($description));
        if (is_wp_error($id)) {
            @unlink($tmp);
            WP_CLI::warning('Could not import media ' . $source_url . ': ' . $id->get_error_message());
            return 0;
        }
        update_post_meta((int) $id, '_ck_source_path', $source_url);
        update_post_meta((int) $id, '_wp_attachment_image_alt', sanitize_text_field($description));
        return (int) $id;
    }

    private function resolve_media_path(string $source_url, string $uploads_root): ?string
    {
        if ($source_url === '' || $uploads_root === '') return null;
        $root = realpath($uploads_root);
        if ($root === false) return null;
        $path = parse_url($source_url, PHP_URL_PATH);
        if (!is_string($path) || $path === '') return null;
        $candidate = $root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim(rawurldecode($path), '/\\'));
        $resolved = realpath($candidate);
        if ($resolved === false || !is_file($resolved)) return null;
        $root_prefix = rtrim(strtolower($root), '/\\') . DIRECTORY_SEPARATOR;
        if (!str_starts_with(strtolower($resolved), $root_prefix)) return null;
        return $resolved;
    }

    private function update_field(string $name, mixed $value, int $post_id): void
    {
        if (function_exists('update_field')) update_field($name, $value, $post_id);
        else update_post_meta($post_id, $name, $value);
    }

    private function mysql_date(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') return null;
        $time = strtotime($value);
        return $time === false ? null : gmdate('Y-m-d H:i:s', $time);
    }
}
