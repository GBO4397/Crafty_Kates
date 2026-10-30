<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

final class CKP_Portal
{
    public static function boot(): void
    {
        add_action('init', [self::class, 'register_routes']);
        add_filter('query_vars', [self::class, 'query_vars']);
        add_action('template_redirect', [self::class, 'prepare_admin_page'], 5);
        add_action('template_redirect', [self::class, 'dispatch'], 10);
        add_shortcode('crafty_kates_portal', [self::class, 'shortcode']);
    }

    public static function register_routes(): void
    {
        add_rewrite_rule('^ck-portal/(setup|login|logout|change-password|download-images)/?$', 'index.php?ck_portal_path=$matches[1]', 'top');
    }

    public static function flush_routes(): void
    {
        flush_rewrite_rules();
    }

    public static function query_vars(array $vars): array
    {
        $vars[] = 'ck_portal_path';
        return $vars;
    }

    public static function dispatch(): void
    {
        $path = (string) get_query_var('ck_portal_path', '');
        if ($path === '') {
            return;
        }

        nocache_headers();
        header('X-Robots-Tag: noindex, nofollow', true);
        header('X-Frame-Options: DENY', true);
        header('Referrer-Policy: same-origin', true);

        if ($path === 'setup') {
            self::setup();
        }
        if ($path === 'login') {
            self::login();
        }
        if ($path === 'logout') {
            self::logout();
        }
        if ($path === 'change-password') {
            self::change_password();
        }
        if ($path === 'download-images') {
            self::download_images();
        }
        status_header(404);
        exit('Portal action not found.');
    }

    public static function prepare_admin_page(): void
    {
        if (!is_page('admin')) return;
        nocache_headers();
        header('X-Robots-Tag: noindex, nofollow', true);
        header('X-Frame-Options: DENY', true);
        header('Referrer-Policy: same-origin', true);
        add_filter('wp_robots', static fn (array $robots): array => array_merge($robots, ['noindex' => true, 'nofollow' => true]));
        wp_enqueue_style('ckp-portal', CKP_URL . 'assets/portal.css', [], CKP_VERSION);
        $session = CKP_Auth::session();
        if ($session !== null && empty($session['must_change_password'])) {
            wp_enqueue_script('ckp-portal', CKP_URL . 'assets/portal.js', [], CKP_VERSION, true);
            wp_localize_script('ckp-portal', 'CKPortalBoot', ['apiRoot' => rest_url('crafty-kates/v1/portal'), 'adminUrl' => home_url('/ck-portal')]);
        }
    }

    public static function shortcode(): string
    {
        if (!is_page('admin')) return '';
        $session = CKP_Auth::session();
        $template = $session === null ? 'login' : 'dashboard';
        $data = $session === null
            ? ['setup_available' => CKP_Auth::setup_available(), 'error' => self::request_error()]
            : ['session' => $session, 'password_error' => self::request_error()];
        ob_start();
        extract($data, EXTR_SKIP);
        require CKP_PATH . 'templates/' . $template . '.php';
        return (string) ob_get_clean();
    }

    private static function setup(): never
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !self::same_origin_request() || !CKP_Auth::setup_available()) {
            self::redirect('/admin');
        }
        $key = (string) wp_unslash($_POST['setup_key'] ?? '');
        if (!hash_equals((string) CK_PORTAL_SETUP_KEY, $key)) {
            self::redirect('/admin?portal=setup-failed');
        }
        try {
            CKP_Auth::create_user([
                'email' => sanitize_email((string) wp_unslash($_POST['email'] ?? '')),
                'display_name' => sanitize_text_field((string) wp_unslash($_POST['display_name'] ?? '')),
                'password' => (string) wp_unslash($_POST['password'] ?? ''),
                'role_key' => 'portal_owner',
                'capabilities' => array_keys(CKP_Auth::capability_labels()),
            ]);
            CKP_Auth::login(sanitize_email((string) wp_unslash($_POST['email'] ?? '')), (string) wp_unslash($_POST['password'] ?? ''));
            self::redirect('/admin');
        } catch (Throwable $error) {
            self::redirect('/admin?portal=setup-invalid');
        }
    }

    private static function login(): never
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !self::same_origin_request()) {
            self::redirect('/admin');
        }
        $email = sanitize_email((string) wp_unslash($_POST['email'] ?? ''));
        $password = (string) wp_unslash($_POST['password'] ?? '');
        if (!CKP_Auth::login($email, $password)) {
            self::redirect('/admin?portal=login-failed');
        }
        self::redirect('/admin');
    }

    private static function logout(): never
    {
        $session = CKP_Auth::session();
        $token = (string) wp_unslash($_POST['_ck_csrf'] ?? '');
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $session !== null && CKP_Auth::verify_csrf($token)) {
            CKP_Auth::audit((int) $session['id'], 'auth.logout', 'portal_user', (string) $session['id']);
            CKP_Auth::logout();
        }
        self::redirect('/admin');
    }

    private static function change_password(): never
    {
        $session = CKP_Auth::session();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $session === null || !CKP_Auth::verify_csrf((string) wp_unslash($_POST['_ck_csrf'] ?? ''))) {
            self::redirect('/admin');
        }
        try {
            CKP_Auth::change_password((int) $session['id'], (string) wp_unslash($_POST['current_password'] ?? ''), (string) wp_unslash($_POST['new_password'] ?? ''));
            self::redirect('/admin?password=changed');
        } catch (Throwable $error) {
            self::redirect('/admin?portal=password-failed');
        }
    }

    private static function download_images(): never
    {
        try {
            $session = CKP_Auth::require_capability('archive.download');
        } catch (CKP_HTTP_Exception $error) {
            status_header($error->status);
            exit(esc_html($error->getMessage()));
        }
        if (!class_exists('ZipArchive')) {
            status_header(500);
            exit('The PHP ZipArchive extension is required to build the image archive.');
        }

        $zip_path = wp_tempnam('crafty-kates-images.zip');
        $zip = new ZipArchive();
        if (!$zip_path || $zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            status_header(500);
            exit('The archive could not be created.');
        }

        $manifest = [['Section', 'WordPress ID', 'Filename', 'URL', 'SHA-256']];
        $seen = [];
        $collections = [
            'site-images' => array_map(static fn (array $row): int => (int) $row['id'], CKP_Content::site_image_data()),
            'sponsor-logos' => self::sponsor_attachment_ids(),
            'galleries' => self::child_thumbnail_ids('ck_gallery_photo'),
            'coloring-books' => array_merge(self::acf_attachment_ids('ck_color_book', ['cover_image', 'back_cover_image', 'inside_front_cover', 'inside_back_cover']), self::child_thumbnail_ids('ck_color_page')),
        ];
        foreach ($collections as $section => $ids) {
            foreach (array_values(array_unique(array_filter(array_map('intval', $ids)))) as $id) {
                if (isset($seen[$id])) continue;
                $seen[$id] = true;
                $path = get_attached_file($id);
                if (!is_string($path) || !is_file($path)) continue;
                $filename = sanitize_file_name(basename($path));
                $zip->addFile($path, $section . '/' . $filename);
                $manifest[] = [$section, (string) $id, $filename, (string) wp_get_attachment_url($id), hash_file('sha256', $path) ?: ''];
            }
        }
        $stream = fopen('php://temp', 'r+');
        foreach ($manifest as $row) fputcsv($stream, $row);
        rewind($stream);
        $zip->addFromString('manifest.csv', (string) stream_get_contents($stream));
        fclose($stream);
        $zip->addFromString('README.txt', "Crafty Kates public media archive\nGenerated: " . gmdate('c') . "\nContains WordPress/Etch-managed public images only. Portal users, registrations, contacts, and private migration files are excluded.\n");
        $zip->close();

        CKP_Auth::audit((int) $session['id'], 'archive.downloaded', 'media_archive');
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="crafty-kates-images-' . gmdate('Y-m-d') . '.zip"');
        header('Content-Length: ' . (string) filesize($zip_path));
        readfile($zip_path);
        unlink($zip_path);
        exit;
    }

    private static function sponsor_attachment_ids(): array
    {
        $ids = [];
        foreach (get_posts(['post_type' => 'ck_sponsor', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids']) as $post_id) {
            $ids[] = function_exists('get_field') ? (int) get_field('logo', $post_id) : (int) get_post_meta($post_id, 'logo', true);
        }
        return $ids;
    }

    private static function child_thumbnail_ids(string $post_type): array
    {
        $ids = [];
        foreach (get_posts(['post_type' => $post_type, 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids']) as $post_id) {
            $ids[] = (int) get_post_thumbnail_id((int) $post_id);
        }
        return $ids;
    }

    private static function acf_attachment_ids(string $post_type, array $fields): array
    {
        $ids = [];
        foreach (get_posts(['post_type' => $post_type, 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids']) as $post_id) {
            foreach ($fields as $field) $ids[] = function_exists('get_field') ? (int) get_field($field, $post_id) : (int) get_post_meta($post_id, $field, true);
        }
        return $ids;
    }

    private static function request_error(): string
    {
        return match (sanitize_key((string) ($_GET['portal'] ?? ''))) {
            'setup-failed' => 'The setup key is not valid.',
            'setup-invalid' => 'The first portal account could not be created. Check the required fields and password length.',
            'login-failed' => 'The email address or password is not valid.',
            'password-failed' => 'The password could not be changed. Verify the current password and use at least 12 characters.',
            default => '',
        };
    }

    private static function same_origin_request(): bool
    {
        $expected = strtolower((string) wp_parse_url(home_url('/'), PHP_URL_HOST));
        $source = (string) ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '');
        $actual = strtolower((string) wp_parse_url($source, PHP_URL_HOST));
        return $expected !== '' && $actual !== '' && hash_equals($expected, $actual);
    }

    private static function redirect(string $path): never
    {
        wp_safe_redirect(home_url($path), 303);
        exit;
    }
}
