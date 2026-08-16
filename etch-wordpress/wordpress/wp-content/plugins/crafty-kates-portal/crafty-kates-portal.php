<?php
/**
 * Plugin Name: Crafty Kates Portal
 * Description: Independent Crafty Kates operations portal, migration tools, and Etch/ACF integration.
 * Version: 1.0.0
 * Requires at least: 6.8
 * Requires PHP: 8.1
 * Author: Crafty Kates
 * Text Domain: crafty-kates-portal
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('CKP_VERSION', '1.0.0');
define('CKP_FILE', __FILE__);
define('CKP_PATH', plugin_dir_path(__FILE__));
define('CKP_URL', plugin_dir_url(__FILE__));

require_once CKP_PATH . 'includes/class-ckp-database.php';
require_once CKP_PATH . 'includes/class-ckp-auth.php';
require_once CKP_PATH . 'includes/class-ckp-content.php';
require_once CKP_PATH . 'includes/class-ckp-api.php';
require_once CKP_PATH . 'includes/class-ckp-portal.php';
require_once CKP_PATH . 'includes/class-ckp-wsform.php';
require_once CKP_PATH . 'includes/class-ckp-cli.php';

register_activation_hook(__FILE__, ['CKP_Database', 'activate']);
register_deactivation_hook(__FILE__, ['CKP_Portal', 'flush_routes']);

add_action('plugins_loaded', static function (): void {
    CKP_Database::maybe_upgrade();
    CKP_Content::boot();
    CKP_Portal::boot();
    CKP_API::boot();
    CKP_WSForm::boot();
    CKP_CLI::boot();
});
