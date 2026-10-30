<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

final class CKP_API
{
    private const NS = 'crafty-kates/v1';

    public static function boot(): void
    {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void
    {
        self::route('/portal/config', 'GET', 'config');
        self::route('/portal/users', 'GET', 'users');
        self::route('/portal/users', 'POST', 'create_user');
        self::route('/portal/users/(?P<id>\d+)', 'PATCH', 'update_user');
        self::route('/portal/sponsors', 'GET', 'sponsors');
        self::route('/portal/sponsors', 'POST', 'create_sponsor');
        self::route('/portal/sponsors/(?P<id>\d+)', 'PATCH', 'update_sponsor');
        self::route('/portal/sponsors/(?P<id>\d+)/logo', 'POST', 'upload_sponsor_logo');
        self::route('/portal/events', 'GET', 'events');
        self::route('/portal/events/(?P<id>\d+)', 'PATCH', 'update_event');
        self::route('/portal/registrations', 'GET', 'registrations');
        self::route('/portal/checkin', 'GET', 'checkin_records');
        self::route('/portal/registrations/(?P<id>\d+)', 'PATCH', 'update_registration');
        self::route('/portal/images', 'GET', 'images');
        self::route('/portal/images/(?P<slot>[a-z0-9-]+)', 'POST', 'upload_site_image');
        self::route('/portal/images/(?P<slot>[a-z0-9-]+)', 'DELETE', 'remove_site_image');
        self::route('/portal/galleries', 'GET', 'galleries');
        self::route('/portal/galleries/(?P<id>\d+)/media', 'POST', 'upload_gallery_image');
        self::route('/portal/galleries/(?P<id>\d+)/media/(?P<attachment>\d+)', 'DELETE', 'remove_gallery_image');
        self::route('/portal/audit', 'GET', 'audit');
    }

    private static function route(string $route, string $method, string $callback): void
    {
        register_rest_route(self::NS, $route, [
            'methods' => $method,
            'callback' => [self::class, $callback],
            'permission_callback' => '__return_true',
        ]);
    }

    private static function guard(string $capability, WP_REST_Request $request, bool $mutation = false): array|WP_Error
    {
        try {
            $session = CKP_Auth::require_capability($capability);
            if ($mutation && !CKP_Auth::verify_csrf($request->get_header('X-CK-CSRF'))) {
                throw new CKP_HTTP_Exception('Your session token is invalid or expired.', 403);
            }
            return $session;
        } catch (CKP_HTTP_Exception $error) {
            return new WP_Error('ck_portal_auth', $error->getMessage(), ['status' => $error->status]);
        }
    }

    private static function error(Throwable $error, int $status = 400): WP_Error
    {
        return new WP_Error('ck_portal_error', $error->getMessage(), ['status' => $status]);
    }

    public static function config(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $session = CKP_Auth::session();
        if ($session === null) {
            return new WP_Error('ck_portal_auth', 'Authentication required.', ['status' => 401]);
        }
        $user = [
            'id' => (int) $session['id'],
            'public_id' => $session['public_id'],
            'email' => $session['email'],
            'display_name' => $session['display_name'],
            'role_key' => $session['role_key'],
            'capabilities' => $session['capabilities'],
            'must_change_password' => (bool) $session['must_change_password'],
        ];
        return rest_ensure_response([
            'user' => $user,
            'csrf' => $session['csrf_token'],
            'roles' => CKP_Auth::role_definitions(),
            'capability_labels' => CKP_Auth::capability_labels(),
            'site_image_slots' => CKP_Content::site_image_slots(),
            'event_categories' => CKP_Content::event_categories(),
            'checklist' => self::checklist(),
            'api_root' => rest_url(self::NS . '/portal'),
        ]);
    }

    public static function users(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('users.manage', $request);
        return is_wp_error($guard) ? $guard : rest_ensure_response(['items' => CKP_Auth::list_users()]);
    }

    public static function create_user(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('users.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        try {
            return rest_ensure_response(CKP_Auth::create_user((array) $request->get_json_params(), (int) $guard['id']));
        } catch (Throwable $error) {
            return self::error($error);
        }
    }

    public static function update_user(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('users.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        try {
            return rest_ensure_response(CKP_Auth::update_user((int) $request['id'], (array) $request->get_json_params(), (int) $guard['id']));
        } catch (Throwable $error) {
            return self::error($error);
        }
    }

    public static function sponsors(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('sponsors.manage', $request);
        if (is_wp_error($guard)) return $guard;
        $posts = get_posts(['post_type' => 'ck_sponsor', 'post_status' => ['publish', 'draft', 'pending', 'private'], 'numberposts' => -1, 'meta_key' => 'sort_order', 'orderby' => 'meta_value_num title', 'order' => 'ASC']);
        return rest_ensure_response(['items' => array_map([self::class, 'sponsor_record'], $posts)]);
    }

    public static function create_sponsor(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('sponsors.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $input = (array) $request->get_json_params();
        $name = sanitize_text_field((string) ($input['name'] ?? ''));
        if ($name === '') return self::error(new InvalidArgumentException('Sponsor name is required.'));
        $id = wp_insert_post(['post_type' => 'ck_sponsor', 'post_status' => 'publish', 'post_title' => $name, 'post_content' => wp_kses_post((string) ($input['description'] ?? ''))], true);
        if (is_wp_error($id)) return $id;
        self::save_sponsor((int) $id, $input);
        CKP_Auth::audit((int) $guard['id'], 'sponsor.created', 'ck_sponsor', (string) $id);
        return rest_ensure_response(self::sponsor_record(get_post((int) $id)));
    }

    public static function update_sponsor(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('sponsors.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post instanceof WP_Post || $post->post_type !== 'ck_sponsor') return self::error(new InvalidArgumentException('Sponsor not found.'), 404);
        $input = (array) $request->get_json_params();
        $update = ['ID' => $id];
        if (isset($input['name'])) $update['post_title'] = sanitize_text_field((string) $input['name']);
        if (isset($input['description'])) $update['post_content'] = wp_kses_post((string) $input['description']);
        wp_update_post($update);
        self::save_sponsor($id, $input);
        CKP_Auth::audit((int) $guard['id'], 'sponsor.updated', 'ck_sponsor', (string) $id);
        return rest_ensure_response(self::sponsor_record(get_post($id)));
    }

    public static function upload_sponsor_logo(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('sponsors.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post instanceof WP_Post || $post->post_type !== 'ck_sponsor') {
            return self::error(new InvalidArgumentException('Sponsor not found.'), 404);
        }
        $attachment = self::handle_upload('file', $id);
        if (is_wp_error($attachment)) return $attachment;
        self::update_acf('logo', $attachment, $id);
        CKP_Auth::audit((int) $guard['id'], 'sponsor.logo_updated', 'ck_sponsor', (string) $id, ['attachment_id' => $attachment]);
        return rest_ensure_response(self::sponsor_record($post));
    }

    private static function save_sponsor(int $id, array $input): void
    {
        $fields = [
            'tier' => ['gold', 'silver', 'bronze'],
            'website_url' => 'url', 'facebook_url' => 'url', 'instagram_url' => 'url', 'youtube_url' => 'url', 'tiktok_url' => 'url',
            'sort_order' => 'int', 'is_active' => 'bool', 'logo' => 'int',
        ];
        foreach ($fields as $field => $type) {
            if (!array_key_exists($field, $input)) continue;
            $value = match ($type) {
                'url' => esc_url_raw((string) $input[$field]),
                'int' => (int) $input[$field],
                'bool' => !empty($input[$field]) ? 1 : 0,
                default => is_array($type) && in_array($input[$field], $type, true) ? $input[$field] : $type[0],
            };
            self::update_acf($field, $value, $id);
        }
    }

    private static function sponsor_record(WP_Post $post): array
    {
        $logo = (int) self::field('logo', $post->ID, 0);
        return [
            'id' => $post->ID, 'name' => $post->post_title, 'description' => $post->post_content,
            'tier' => self::field('tier', $post->ID, 'bronze'), 'logo_id' => $logo, 'logo_url' => $logo ? (string) wp_get_attachment_url($logo) : '',
            'website_url' => self::field('website_url', $post->ID, ''), 'facebook_url' => self::field('facebook_url', $post->ID, ''),
            'instagram_url' => self::field('instagram_url', $post->ID, ''), 'youtube_url' => self::field('youtube_url', $post->ID, ''),
            'tiktok_url' => self::field('tiktok_url', $post->ID, ''), 'sort_order' => (int) self::field('sort_order', $post->ID, 0),
            'is_active' => (bool) self::field('is_active', $post->ID, true), 'updated_at' => $post->post_modified_gmt,
        ];
    }

    public static function events(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('events.manage', $request);
        if (is_wp_error($guard)) return $guard;
        $posts = get_posts(['post_type' => 'ck_event', 'post_status' => ['publish', 'draft', 'pending', 'private'], 'numberposts' => -1, 'orderby' => 'date', 'order' => 'DESC']);
        return rest_ensure_response(['items' => array_map([self::class, 'event_record'], $posts)]);
    }

    public static function update_event(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('events.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $id = (int) $request['id'];
        $post = get_post($id);
        if (!$post instanceof WP_Post || $post->post_type !== 'ck_event') return self::error(new InvalidArgumentException('Event not found.'), 404);
        $input = (array) $request->get_json_params();
        $action = sanitize_key((string) ($input['action'] ?? 'update'));
        if ($action === 'delete') {
            wp_trash_post($id);
            CKP_Auth::audit((int) $guard['id'], 'event.deleted', 'ck_event', (string) $id);
            return rest_ensure_response(['deleted' => true]);
        }
        if (in_array($action, ['approve', 'reject'], true)) {
            self::update_acf('review_status', $action === 'approve' ? 'approved' : 'rejected', $id);
            self::update_acf('reviewed_at', current_time('mysql', true), $id);
            wp_update_post(['ID' => $id, 'post_status' => $action === 'approve' ? 'publish' : 'draft']);
        }
        if (array_key_exists('admin_notes', $input)) self::update_acf('admin_notes', sanitize_textarea_field((string) $input['admin_notes']), $id);
        CKP_Auth::audit((int) $guard['id'], 'event.' . $action, 'ck_event', (string) $id);
        return rest_ensure_response(self::event_record(get_post($id)));
    }

    private static function event_record(WP_Post $post): array
    {
        $fields = ['event_date', 'event_time_start', 'event_time_end', 'location', 'address', 'category', 'organizer_name', 'organizer_email', 'organizer_phone', 'website_url', 'ticket_url', 'ticket_price', 'review_status', 'admin_notes', 'submitted_at', 'reviewed_at'];
        $row = ['id' => $post->ID, 'title' => $post->post_title, 'description' => $post->post_content, 'status' => $post->post_status, 'image_url' => (string) get_the_post_thumbnail_url($post->ID, 'large')];
        foreach ($fields as $field) $row[$field] = self::field($field, $post->ID, '');
        $row['is_free'] = (bool) self::field('is_free', $post->ID, true);
        $row['featured'] = (bool) self::field('featured', $post->ID, false);
        return $row;
    }

    public static function registrations(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('registrations.view', $request);
        return self::registration_list_response($guard);
    }

    public static function checkin_records(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('checkin.manage', $request);
        return self::registration_list_response($guard);
    }

    private static function registration_list_response(array|WP_Error $guard): WP_REST_Response|WP_Error
    {
        if (is_wp_error($guard)) return $guard;
        global $wpdb;
        $table = CKP_Database::table('registrations');
        $rows = $wpdb->get_results("SELECT * FROM {$table} ORDER BY created_at DESC", ARRAY_A) ?: [];
        return rest_ensure_response(['items' => array_map([self::class, 'registration_record'], $rows)]);
    }

    public static function update_registration(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('checkin.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        global $wpdb;
        $id = (int) $request['id'];
        $table = CKP_Database::table('registrations');
        $input = (array) $request->get_json_params();
        $data = ['updated_at' => current_time('mysql', true)];
        if (isset($input['payment_status']) && in_array($input['payment_status'], ['unpaid', 'paid', 'waived'], true)) $data['payment_status'] = $input['payment_status'];
        if (array_key_exists('checked_in', $input)) $data['checked_in_at'] = !empty($input['checked_in']) ? current_time('mysql', true) : null;
        $wpdb->update($table, $data, ['id' => $id]);
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id), ARRAY_A);
        if (!is_array($row)) return self::error(new InvalidArgumentException('Registration not found.'), 404);
        CKP_Auth::audit((int) $guard['id'], 'registration.updated', 'registration', (string) $id, array_intersect_key($data, array_flip(['payment_status', 'checked_in_at'])));
        return rest_ensure_response(self::registration_record($row));
    }

    private static function registration_record(array $row): array
    {
        foreach (['id', 'liability_agreed', 'photo_release'] as $field) $row[$field] = (int) ($row[$field] ?? 0);
        $row['checked_in'] = !empty($row['checked_in_at']);
        return $row;
    }

    public static function images(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request);
        return is_wp_error($guard) ? $guard : rest_ensure_response(['items' => CKP_Content::site_image_data()]);
    }

    public static function upload_site_image(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $slot = sanitize_key((string) $request['slot']);
        if (!isset(CKP_Content::site_image_slots()[$slot])) return self::error(new InvalidArgumentException('Unknown image slot.'), 404);
        $post_id = CKP_Content::ensure_site_image_slot($slot);
        if ($post_id < 1) return self::error(new RuntimeException('The Etch media slot could not be created.'), 500);
        $attachment = self::handle_upload('file', $post_id);
        if (is_wp_error($attachment)) return $attachment;
        set_post_thumbnail($post_id, $attachment);
        CKP_Auth::audit((int) $guard['id'], 'image.updated', 'site_image', $slot, ['attachment_id' => $attachment]);
        return rest_ensure_response(CKP_Content::site_image_data()[$slot]);
    }

    public static function remove_site_image(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $slot = sanitize_key((string) $request['slot']);
        $record = CKP_Content::site_image_data()[$slot] ?? null;
        if (is_array($record) && !empty($record['post_id'])) delete_post_thumbnail((int) $record['post_id']);
        CKP_Auth::audit((int) $guard['id'], 'image.removed', 'site_image', $slot);
        return rest_ensure_response(['removed' => true]);
    }

    public static function galleries(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request);
        if (is_wp_error($guard)) return $guard;
        $posts = get_posts(['post_type' => 'ck_gallery', 'post_status' => ['publish', 'draft'], 'numberposts' => -1, 'orderby' => 'menu_order title', 'order' => 'ASC']);
        $items = [];
        foreach ($posts as $post) {
            $photos = get_posts(['post_type' => 'ck_gallery_photo', 'post_status' => ['publish', 'draft'], 'post_parent' => $post->ID, 'numberposts' => -1, 'fields' => 'ids', 'orderby' => 'menu_order', 'order' => 'ASC']);
            $ids = array_values(array_filter(array_map('get_post_thumbnail_id', $photos)));
            $items[] = ['id' => $post->ID, 'name' => $post->post_title, 'description' => $post->post_content, 'count' => count($ids), 'media_ids' => $ids];
        }
        return rest_ensure_response(['items' => $items]);
    }

    public static function upload_gallery_image(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $id = (int) $request['id'];
        if (get_post_type($id) !== 'ck_gallery') return self::error(new InvalidArgumentException('Gallery not found.'), 404);
        $attachment = self::handle_upload('file', $id);
        if (is_wp_error($attachment)) return $attachment;
        $count = (int) wp_count_children($id, 'ck_gallery_photo')->publish;
        $photo_id = wp_insert_post([
            'post_type' => 'ck_gallery_photo', 'post_status' => 'publish', 'post_parent' => $id,
            'post_title' => sanitize_text_field((string) get_the_title($attachment)), 'menu_order' => $count,
        ], true);
        if (is_wp_error($photo_id)) return $photo_id;
        set_post_thumbnail((int) $photo_id, $attachment);
        self::update_acf('gallery', $id, (int) $photo_id);
        self::update_acf('sort_order', $count, (int) $photo_id);
        self::update_acf('is_active', 1, (int) $photo_id);
        CKP_Auth::audit((int) $guard['id'], 'gallery.image_added', 'ck_gallery', (string) $id, ['attachment_id' => $attachment]);
        return rest_ensure_response(['attachment_id' => $attachment, 'photo_id' => (int) $photo_id, 'url' => (string) wp_get_attachment_url($attachment), 'count' => $count + 1]);
    }

    public static function remove_gallery_image(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('images.manage', $request, true);
        if (is_wp_error($guard)) return $guard;
        $id = (int) $request['id'];
        $attachment = (int) $request['attachment'];
        $photos = get_posts(['post_type' => 'ck_gallery_photo', 'post_status' => 'any', 'post_parent' => $id, 'numberposts' => -1, 'fields' => 'ids']);
        foreach ($photos as $photo_id) {
            if ((int) get_post_thumbnail_id((int) $photo_id) === $attachment) wp_trash_post((int) $photo_id);
        }
        $remaining = get_posts(['post_type' => 'ck_gallery_photo', 'post_status' => ['publish', 'draft'], 'post_parent' => $id, 'numberposts' => -1, 'fields' => 'ids']);
        CKP_Auth::audit((int) $guard['id'], 'gallery.image_removed', 'ck_gallery', (string) $id, ['attachment_id' => $attachment]);
        return rest_ensure_response(['removed' => true, 'count' => count($remaining)]);
    }

    public static function audit(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $guard = self::guard('audit.view', $request);
        if (is_wp_error($guard)) return $guard;
        global $wpdb;
        $audit = CKP_Database::table('portal_audit');
        $users = CKP_Database::table('portal_users');
        $rows = $wpdb->get_results("SELECT a.*, u.display_name FROM {$audit} a LEFT JOIN {$users} u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 200", ARRAY_A) ?: [];
        return rest_ensure_response(['items' => $rows]);
    }

    private static function handle_upload(string $field, int $post_id = 0): int|WP_Error
    {
        if (empty($_FILES[$field]) || !is_array($_FILES[$field])) return new WP_Error('ck_upload_missing', 'Select an image to upload.', ['status' => 400]);
        $file = $_FILES[$field];
        if ((int) ($file['size'] ?? 0) > 10 * 1024 * 1024) return new WP_Error('ck_upload_size', 'Images must be 10MB or smaller.', ['status' => 400]);
        $tmp = (string) ($file['tmp_name'] ?? '');
        if ($tmp === '' || !is_uploaded_file($tmp) || !wp_get_image_mime($tmp)) return new WP_Error('ck_upload_type', 'Upload a valid JPEG, PNG, GIF, WebP, or AVIF image.', ['status' => 400]);
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        $id = media_handle_upload($field, $post_id, [], ['test_form' => false]);
        return is_wp_error($id) ? $id : (int) $id;
    }

    private static function field(string $name, int $post_id, mixed $default = null): mixed
    {
        $value = function_exists('get_field') ? get_field($name, $post_id) : get_post_meta($post_id, $name, true);
        return ($value === null || $value === false || $value === '') ? $default : $value;
    }

    private static function update_acf(string $name, mixed $value, int $post_id): void
    {
        if (function_exists('update_field')) update_field($name, $value, $post_id);
        else update_post_meta($post_id, $name, $value);
    }

    private static function checklist(): array
    {
        return [
            ['key' => 'immediate', 'label' => 'Highest Priority', 'title' => 'Do Immediately', 'tasks' => ['County permit', 'Make map per county instructions', 'Fill out county paperwork', 'Contact CHP for a letter', 'Provide proof of insurance to the county', 'Complete state permit after county approval and pay fee', 'Coordinate with county roads for roadblocks and signage', 'Coordinate with the rescue and shelter', 'Confirm insurance', 'Reserve porta-potties, tables, pop-ups, and chairs', 'Update website for the current Classic Burger show', 'Confirm date with Classic Burgers']],
            ['key' => 'sponsors', 'label' => 'High Priority', 'title' => 'Sponsors & Fundraising', 'tasks' => ['Reach out to returning sponsors for commitment', 'Create sponsor packet with levels and benefits', 'Contact new potential sponsors', 'Collect sponsor logos for banners and website', 'Set up online payment for sponsorships', 'Order sponsor banners and signage', 'Secure raffle items and donation prizes', 'Send thank-you letters to confirmed sponsors']],
            ['key' => 'logistics', 'label' => 'Important', 'title' => 'Logistics & Setup', 'tasks' => ['Create event site layout and parking plan', 'Arrange sound system and PA equipment', 'Confirm food vendors and food trucks', 'Organize volunteer crew and assign roles', 'Set up registration table supplies (forms, pens, cash box)', 'Order trophies and award plaques', 'Arrange trash and recycling bins', 'Confirm power supply and generator if needed', 'Prepare first aid kit and emergency plan']],
            ['key' => 'marketing', 'label' => 'Ongoing', 'title' => 'Marketing & Promotion', 'tasks' => ['Design and print event flyers', 'Post event on Facebook, Instagram, and YouTube', 'Contact local newspaper and radio for coverage', 'Distribute flyers to local businesses', 'Create social media countdown posts', 'Update car show entry page on website', 'Send email blast to previous participants', 'Post on car club forums and groups']],
            ['key' => 'event-day', 'label' => 'Event Day', 'title' => 'Day-of Event', 'tasks' => ['Arrive early for setup (minimum 2 hours before)', 'Set up registration and check-in area', 'Place directional signs and parking cones', 'Test sound system and microphone', 'Brief volunteers on their roles', 'Set up sponsor banners and displays', 'Prepare raffle table and ticket sales', 'Coordinate trophy/award ceremony timing', 'Take photos and videos for social media', 'Announce sponsors and thank supporters']],
            ['key' => 'post-event', 'label' => 'After Show', 'title' => 'Post-Event', 'tasks' => ['Clean up event site thoroughly', 'Return all rented equipment', 'Send thank-you messages to sponsors and volunteers', 'Post event photos and recap on social media', 'Tally up funds raised and prepare financial summary', 'Deliver donation to rescue and shelter', "Gather feedback for next year's improvements"]],
        ];
    }
}
