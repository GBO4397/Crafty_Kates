<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Minimal WS Form bridge for the one dataset the supplemental portal must query.
 * Public form layout, validation, uploads, email, spam controls, and all other
 * actions remain owned by WS Form PRO.
 */
final class CKP_WSForm
{
    public const REGISTRATION_HOOK = 'ckp_wsform_registration';

    public static function boot(): void
    {
        add_action(self::REGISTRATION_HOOK, [self::class, 'capture_registration'], 10, 2);
    }

    public static function field_map(): array
    {
        $map = get_option('ckp_wsform_registration_map', []);
        return is_array($map) ? $map : [];
    }

    public static function capture_registration(mixed $form, mixed $submit): void
    {
        if (!function_exists('wsf_submit_get_value') || !is_object($submit)) {
            return;
        }
        $map = self::field_map();
        if ($map === []) {
            error_log('Crafty Kates Portal: WS Form registration field map is not configured.');
            return;
        }

        $value = static function (string $name) use ($map, $submit): mixed {
            $field = $map[$name] ?? null;
            if (!is_int($field) && !is_string($field)) return '';
            $key = str_starts_with((string) $field, 'field_') ? (string) $field : 'field_' . (string) $field;
            return wsf_submit_get_value($submit, $key);
        };
        $text = static function (string $name) use ($value): string {
            $raw = $value($name);
            if (is_array($raw)) $raw = implode(', ', array_map('strval', $raw));
            return sanitize_text_field((string) $raw);
        };
        $truthy = static function (string $name) use ($value): int {
            $raw = $value($name);
            return !empty($raw) && !in_array(strtolower((string) $raw), ['0', 'false', 'no', 'off'], true) ? 1 : 0;
        };

        $name = $text('name');
        $email = sanitize_email($text('email'));
        if ($name === '' || !is_email($email)) {
            error_log('Crafty Kates Portal: a WS Form registration was not copied because name or email was missing.');
            return;
        }

        global $wpdb;
        $submission_id = isset($submit->id) ? (string) $submit->id : hash('sha256', $email . '|' . microtime(true));
        $source_id = 'ws-form:' . $submission_id;
        $table = CKP_Database::table('registrations');
        $now = current_time('mysql', true);
        $data = [
            'source_id' => $source_id,
            'name' => $name,
            'email' => $email,
            'phone' => $text('phone'),
            'address' => $text('address'),
            'city' => $text('city'),
            'state' => $text('state'),
            'postal_code' => $text('postal_code'),
            'entry_type' => in_array($text('entry_type'), ['vehicle', 'vendor', 'cackle'], true) ? $text('entry_type') : 'vehicle',
            'vehicle_year' => $text('vehicle_year'),
            'vehicle_make' => $text('vehicle_make'),
            'vehicle_model' => $text('vehicle_model'),
            'vendor_name' => $text('vendor_name'),
            'vendor_space_size' => $text('vendor_space_size'),
            'cackle_car_info' => sanitize_textarea_field((string) $value('cackle_car_info')),
            'liability_agreed' => $truthy('liability_agreed'),
            'photo_release' => $truthy('photo_release'),
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $existing_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE source_id = %s", $source_id));
        if ($existing_id > 0) {
            unset($data['source_id'], $data['created_at']);
            $wpdb->update($table, $data, ['id' => $existing_id]);
            return;
        }
        $data['payment_status'] = 'unpaid';
        $data['checked_in_at'] = null;
        $wpdb->insert($table, $data);
    }
}
