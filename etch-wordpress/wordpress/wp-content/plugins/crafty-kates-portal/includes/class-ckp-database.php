<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}
final class CKP_Database
{
    public const VERSION = '1.0.0';

    public static function table(string $name): string
    {
        global $wpdb;
        return $wpdb->prefix . 'ck_' . $name;
    }

    public static function activate(): void
    {
        self::install();
        update_option('ckp_db_version', self::VERSION, false);
        CKP_Portal::register_routes();
        flush_rewrite_rules();
    }

    public static function maybe_upgrade(): void
    {
        if ((string) get_option('ckp_db_version', '') !== self::VERSION) {
            self::install();
            update_option('ckp_db_version', self::VERSION, false);
        }
    }

    private static function install(): void
    {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset = $wpdb->get_charset_collate();
        $users = self::table('portal_users');
        $sessions = self::table('portal_sessions');
        $resets = self::table('portal_reset_tokens');
        $audit = self::table('portal_audit');
        $registrations = self::table('registrations');
        $contacts = self::table('contacts');
        $subscribers = self::table('subscribers');

        dbDelta("CREATE TABLE {$users} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            public_id char(36) NOT NULL,
            email varchar(190) NOT NULL,
            display_name varchar(190) NOT NULL,
            password_hash varchar(255) NOT NULL,
            role_key varchar(80) NOT NULL DEFAULT 'staff',
            capabilities longtext NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'active',
            must_change_password tinyint(1) NOT NULL DEFAULT 0,
            failed_attempts smallint unsigned NOT NULL DEFAULT 0,
            locked_until datetime NULL,
            last_login_at datetime NULL,
            created_by bigint unsigned NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY public_id (public_id),
            UNIQUE KEY email (email),
            KEY status (status)
        ) {$charset};");

        dbDelta("CREATE TABLE {$sessions} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint unsigned NOT NULL,
            token_hash char(64) NOT NULL,
            csrf_token char(64) NOT NULL,
            user_agent_hash char(64) NULL,
            created_at datetime NOT NULL,
            last_seen_at datetime NOT NULL,
            expires_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY token_hash (token_hash),
            KEY user_expires (user_id, expires_at)
        ) {$charset};");

        dbDelta("CREATE TABLE {$resets} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint unsigned NOT NULL,
            token_hash char(64) NOT NULL,
            expires_at datetime NOT NULL,
            used_at datetime NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY token_hash (token_hash),
            KEY user_id (user_id)
        ) {$charset};");

        dbDelta("CREATE TABLE {$audit} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint unsigned NULL,
            action varchar(120) NOT NULL,
            object_type varchar(120) NOT NULL,
            object_id varchar(190) NULL,
            details longtext NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY created_at (created_at),
            KEY user_id (user_id)
        ) {$charset};");

        dbDelta("CREATE TABLE {$registrations} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            source_id varchar(190) NULL,
            name varchar(190) NOT NULL,
            email varchar(190) NOT NULL,
            phone varchar(80) NOT NULL,
            address varchar(255) NOT NULL,
            city varchar(120) NOT NULL,
            state varchar(40) NOT NULL,
            postal_code varchar(20) NOT NULL,
            entry_type varchar(20) NOT NULL,
            vehicle_year varchar(10) NULL,
            vehicle_make varchar(120) NULL,
            vehicle_model varchar(120) NULL,
            vendor_name varchar(190) NULL,
            vendor_space_size varchar(120) NULL,
            cackle_car_info text NULL,
            liability_agreed tinyint(1) NOT NULL DEFAULT 0,
            photo_release tinyint(1) NOT NULL DEFAULT 0,
            payment_status varchar(20) NOT NULL DEFAULT 'unpaid',
            checked_in_at datetime NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY source_id (source_id),
            KEY entry_created (entry_type, created_at),
            KEY checked_in_at (checked_in_at),
            KEY email (email)
        ) {$charset};");

        dbDelta("CREATE TABLE {$contacts} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            source_id varchar(190) NULL,
            name varchar(190) NOT NULL,
            email varchar(190) NOT NULL,
            subject varchar(120) NULL,
            message text NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'new',
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY source_id (source_id),
            KEY status_created (status, created_at)
        ) {$charset};");

        dbDelta("CREATE TABLE {$subscribers} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            source_id varchar(190) NULL,
            email varchar(190) NOT NULL,
            is_active tinyint(1) NOT NULL DEFAULT 1,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY source_id (source_id),
            UNIQUE KEY email (email)
        ) {$charset};");
    }
}
