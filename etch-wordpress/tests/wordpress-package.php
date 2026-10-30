<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$plugin = $root . '/wordpress/wp-content/plugins/crafty-kates-portal';
$checks = 0;

function check_wp(bool $condition, string $message): void
{
    global $checks;
    $checks++;
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$required = [
    'crafty-kates-portal.php', 'includes/class-ckp-database.php', 'includes/class-ckp-auth.php',
    'includes/class-ckp-content.php', 'includes/class-ckp-api.php', 'includes/class-ckp-portal.php',
    'includes/class-ckp-wsform.php', 'includes/class-ckp-cli.php', 'assets/portal.js', 'assets/portal.css',
    'templates/login.php', 'templates/dashboard.php',
];
foreach ($required as $relative) check_wp(is_file($plugin . '/' . $relative), "required plugin file exists: {$relative}");

$php = '';
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($plugin, FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file instanceof SplFileInfo && $file->isFile() && $file->getExtension() === 'php') $php .= (string) file_get_contents($file->getPathname());
}
check_wp(!str_contains($php, 'wp_set_auth_cookie'), 'portal never creates a WordPress login session');
check_wp(!preg_match('/\$wpdb->(?:users|usermeta)|\bwp_users\b/', $php), 'portal accounts never use WordPress user tables');
check_wp(!str_contains(strtolower($php), '$wpdb->replace'), 'imports use stable upserts instead of destructive table replacement');
check_wp(str_contains($php, 'CK_PORTAL_SETUP_KEY'), 'one-time portal owner setup is explicitly keyed');
check_wp(str_contains($php, 'ckp_wsform_registration'), 'WS Form registration action bridge is registered');
check_wp(str_contains($php, "self::route('/portal/checkin', 'GET', 'checkin_records')"), 'Check-In has a least-privilege read route');
check_wp(str_contains($php, "self::guard('checkin.manage', \$request)"), 'Check-In read route requires its dedicated capability');
check_wp(str_contains($php, "if (!empty(\$session['must_change_password']))"), 'temporary-password users cannot use portal tools before changing password');
check_wp(str_contains($php, 'Create another active Portal Owner before changing the last owner account.'), 'the last active Portal Owner cannot be removed');

$js = (string) file_get_contents($plugin . '/assets/portal.js');
$tools = ['Image Manager', 'Sponsor Admin', 'Event Admin', 'Registrations', 'Check-In', 'Organizer Checklist', 'Download Site Images', 'User Admin'];
foreach ($tools as $tool) check_wp(str_contains($js, "'{$tool}'"), "portal includes {$tool}");
check_wp(substr_count($js, "['") >= 8, 'portal navigation contains the eight mapped tools');
check_wp(str_contains($js, "localStorage.setItem('ck-organizer-checklist'"), 'checklist intentionally persists per browser/device');

$api = (string) file_get_contents($plugin . '/includes/class-ckp-api.php');
preg_match('/private static function checklist\(\): array\s*\{\s*return\s*(\[.*?\]);\s*\}/s', $api, $match);
check_wp(isset($match[1]), 'checklist definition is readable');
$checklist = eval('return ' . $match[1] . ';');
check_wp(is_array($checklist) && count($checklist) === 6, 'checklist contains six sections');
$task_count = array_sum(array_map(static fn (array $section): int => count($section['tasks'] ?? []), $checklist));
check_wp($task_count === 54, 'checklist contains exactly 54 tasks');

$content = (string) file_get_contents($plugin . '/includes/class-ckp-content.php');
foreach (['ck_event', 'ck_sponsor', 'ck_color_book', 'ck_color_page', 'ck_gallery', 'ck_gallery_photo', 'ck_site_image'] as $post_type) {
    check_wp(str_contains($content, "'{$post_type}'"), "ACF content model includes {$post_type}");
}
check_wp(substr_count($content, "'label' =>") >= 11, 'fixed media model retains at least eleven labeled site slots');

$manifest = json_decode((string) file_get_contents($root . '/wordpress/etch/project-manifest.json'), true);
check_wp(is_array($manifest) && ($manifest['tested_baseline']['etch'] ?? '') === '1.6.5', 'Etch manifest is valid and baseline-pinned');
$forms = json_decode((string) file_get_contents($root . '/wordpress/ws-form/form-specs.json'), true);
check_wp(is_array($forms) && count($forms['forms'] ?? []) === 6, 'WS Form specification contains six forms');

$etch = '';
$etch_markup = '';
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/wordpress/etch', FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file instanceof SplFileInfo && $file->isFile()) {
        $contents = (string) file_get_contents($file->getPathname());
        $etch .= $contents;
        if ($file->getExtension() === 'html') $etch_markup .= $contents;
    }
}
check_wp(!str_contains($etch_markup, 'unsafe="true"'), 'Etch markup never renders CMS/community HTML unsafely');
check_wp(str_contains($etch, '<etch:img'), 'Etch source uses Dynamic Image elements');
check_wp(str_contains($etch, '[crafty_kates_portal]'), 'Etch /admin page embeds the independent portal component');

echo "WordPress/Etch package checks passed: {$checks}\n";
