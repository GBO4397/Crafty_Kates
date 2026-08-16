<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

final class CKP_Auth
{
    private const COOKIE = 'ck_portal_session';
    private const SESSION_SECONDS = 28800;
    private const MAX_ATTEMPTS = 5;
    private static ?array $session = null;
    private static bool $session_loaded = false;

    public static function capability_labels(): array
    {
        return [
            'images.manage' => 'Image Manager',
            'sponsors.manage' => 'Sponsor Admin',
            'events.manage' => 'Event Admin',
            'registrations.view' => 'View Registrations',
            'registrations.export' => 'Export Registrations',
            'checkin.manage' => 'Check-In and Payments',
            'checklist.manage' => 'Organizer Checklist',
            'archive.download' => 'Download Site Images',
            'users.manage' => 'User Admin',
            'audit.view' => 'View Audit History',
        ];
    }

    public static function role_definitions(): array
    {
        $all = array_keys(self::capability_labels());
        return [
            'portal_owner' => ['label' => 'Portal Owner', 'capabilities' => $all],
            'site_manager' => ['label' => 'Site Manager', 'capabilities' => array_values(array_diff($all, ['users.manage', 'audit.view']))],
            'media_sponsor_manager' => ['label' => 'Media / Sponsor Manager', 'capabilities' => ['images.manage', 'sponsors.manage', 'archive.download']],
            'event_manager' => ['label' => 'Event Manager', 'capabilities' => ['events.manage', 'registrations.view', 'registrations.export', 'checkin.manage', 'checklist.manage']],
            'registration_manager' => ['label' => 'Registration Manager', 'capabilities' => ['registrations.view', 'registrations.export', 'checkin.manage']],
            'checkin_staff' => ['label' => 'Check-In Staff', 'capabilities' => ['checkin.manage']],
        ];
    }

    public static function user_count(): int
    {
        global $wpdb;
        return (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . CKP_Database::table('portal_users'));
    }

    public static function setup_available(): bool
    {
        return self::user_count() === 0
            && defined('CK_PORTAL_SETUP_KEY')
            && is_string(CK_PORTAL_SETUP_KEY)
            && strlen(CK_PORTAL_SETUP_KEY) >= 32;
    }

    public static function create_user(array $input, ?int $created_by = null): array
    {
        global $wpdb;
        $email = sanitize_email((string) ($input['email'] ?? ''));
        $name = sanitize_text_field((string) ($input['display_name'] ?? ''));
        $password = (string) ($input['password'] ?? '');
        $role = sanitize_key((string) ($input['role_key'] ?? 'site_manager'));
        $roles = self::role_definitions();

        if (!is_email($email) || $name === '') {
            throw new InvalidArgumentException('A valid email address and display name are required.');
        }
        if (strlen($password) < 12) {
            throw new InvalidArgumentException('Passwords must be at least 12 characters.');
        }
        if (!isset($roles[$role])) {
            throw new InvalidArgumentException('The selected role is not valid.');
        }

        $requested = isset($input['capabilities']) && is_array($input['capabilities'])
            ? array_map('sanitize_key', $input['capabilities'])
            : $roles[$role]['capabilities'];
        $capabilities = array_values(array_intersect(array_keys(self::capability_labels()), $requested));
        if ($role === 'portal_owner') {
            $capabilities = array_keys(self::capability_labels());
        }

        $now = current_time('mysql', true);
        $inserted = $wpdb->insert(
            CKP_Database::table('portal_users'),
            [
                'public_id' => wp_generate_uuid4(),
                'email' => strtolower($email),
                'display_name' => $name,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                'role_key' => $role,
                'capabilities' => wp_json_encode($capabilities),
                'status' => 'active',
                'must_change_password' => !empty($input['must_change_password']) ? 1 : 0,
                'created_by' => $created_by,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s']
        );
        if ($inserted !== 1) {
            throw new RuntimeException('The account could not be created. The email address may already be in use.');
        }

        $user_id = (int) $wpdb->insert_id;
        self::audit($created_by, 'user.created', 'portal_user', (string) $user_id, ['role' => $role]);
        return self::get_user($user_id) ?? [];
    }

    public static function login(string $email, string $password): bool
    {
        global $wpdb;
        $table = CKP_Database::table('portal_users');
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE email = %s LIMIT 1", strtolower(sanitize_email($email))), ARRAY_A);
        $now = time();
        $valid = is_array($user)
            && ($user['status'] ?? '') === 'active'
            && (empty($user['locked_until']) || strtotime((string) $user['locked_until'] . ' UTC') <= $now)
            && password_verify($password, (string) $user['password_hash']);

        if (!$valid) {
            if (is_array($user)) {
                $attempts = (int) $user['failed_attempts'] + 1;
                $locked_until = $attempts >= self::MAX_ATTEMPTS ? gmdate('Y-m-d H:i:s', $now + 900) : null;
                $wpdb->update($table, ['failed_attempts' => $attempts, 'locked_until' => $locked_until, 'updated_at' => current_time('mysql', true)], ['id' => (int) $user['id']]);
            }
            usleep(250000);
            return false;
        }

        if (password_needs_rehash((string) $user['password_hash'], PASSWORD_DEFAULT)) {
            $wpdb->update($table, ['password_hash' => password_hash($password, PASSWORD_DEFAULT)], ['id' => (int) $user['id']]);
        }
        $wpdb->update($table, ['failed_attempts' => 0, 'locked_until' => null, 'last_login_at' => current_time('mysql', true), 'updated_at' => current_time('mysql', true)], ['id' => (int) $user['id']]);
        self::start_session((int) $user['id']);
        self::audit((int) $user['id'], 'auth.login', 'portal_user', (string) $user['id']);
        return true;
    }

    private static function start_session(int $user_id): void
    {
        global $wpdb;
        $token = bin2hex(random_bytes(32));
        $csrf = bin2hex(random_bytes(32));
        $now = current_time('mysql', true);
        $expires = gmdate('Y-m-d H:i:s', time() + self::SESSION_SECONDS);
        $wpdb->insert(
            CKP_Database::table('portal_sessions'),
            [
                'user_id' => $user_id,
                'token_hash' => hash('sha256', $token),
                'csrf_token' => $csrf,
                'user_agent_hash' => hash('sha256', (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')),
                'created_at' => $now,
                'last_seen_at' => $now,
                'expires_at' => $expires,
            ]
        );
        setcookie(self::COOKIE, $token, [
            'expires' => time() + self::SESSION_SECONDS,
            'path' => '/',
            'secure' => is_ssl(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        $_COOKIE[self::COOKIE] = $token;
        self::$session_loaded = false;
        self::$session = null;
    }

    public static function logout(): void
    {
        global $wpdb;
        $token = (string) ($_COOKIE[self::COOKIE] ?? '');
        if ($token !== '') {
            $wpdb->delete(CKP_Database::table('portal_sessions'), ['token_hash' => hash('sha256', $token)]);
        }
        setcookie(self::COOKIE, '', ['expires' => time() - 3600, 'path' => '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Strict']);
        unset($_COOKIE[self::COOKIE]);
        self::$session_loaded = true;
        self::$session = null;
    }

    public static function session(): ?array
    {
        if (self::$session_loaded) {
            return self::$session;
        }
        self::$session_loaded = true;
        $token = (string) ($_COOKIE[self::COOKIE] ?? '');
        if ($token === '') {
            return null;
        }

        global $wpdb;
        $sessions = CKP_Database::table('portal_sessions');
        $users = CKP_Database::table('portal_users');
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT s.id AS session_id, s.csrf_token, s.expires_at, s.user_agent_hash, u.* FROM {$sessions} s INNER JOIN {$users} u ON u.id = s.user_id WHERE s.token_hash = %s AND s.expires_at > UTC_TIMESTAMP() AND u.status = 'active' LIMIT 1",
            hash('sha256', $token)
        ), ARRAY_A);
        if (!is_array($row)) {
            self::logout();
            return null;
        }
        $current_agent = hash('sha256', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
        if (!empty($row['user_agent_hash']) && !hash_equals((string) $row['user_agent_hash'], $current_agent)) {
            self::logout();
            return null;
        }
        $row['capabilities'] = json_decode((string) $row['capabilities'], true) ?: [];
        $wpdb->update($sessions, ['last_seen_at' => current_time('mysql', true)], ['id' => (int) $row['session_id']]);
        self::$session = $row;
        return self::$session;
    }

    public static function can(string $capability): bool
    {
        $session = self::session();
        return $session !== null && in_array($capability, (array) $session['capabilities'], true);
    }

    public static function require_capability(string $capability): array
    {
        $session = self::session();
        if ($session === null) {
            throw new CKP_HTTP_Exception('Authentication required.', 401);
        }
        if (!empty($session['must_change_password'])) {
            throw new CKP_HTTP_Exception('Change your password before using portal tools.', 403);
        }
        if (!self::can($capability)) {
            throw new CKP_HTTP_Exception('You do not have permission to perform that action.', 403);
        }
        return $session;
    }

    public static function verify_csrf(?string $token): bool
    {
        $session = self::session();
        return $session !== null && is_string($token) && $token !== '' && hash_equals((string) $session['csrf_token'], $token);
    }

    public static function list_users(): array
    {
        global $wpdb;
        $rows = $wpdb->get_results('SELECT id, public_id, email, display_name, role_key, capabilities, status, must_change_password, last_login_at, created_at, updated_at FROM ' . CKP_Database::table('portal_users') . ' ORDER BY display_name ASC', ARRAY_A) ?: [];
        foreach ($rows as &$row) {
            $row['id'] = (int) $row['id'];
            $row['capabilities'] = json_decode((string) $row['capabilities'], true) ?: [];
            $row['must_change_password'] = (bool) $row['must_change_password'];
        }
        return $rows;
    }

    public static function get_user(int $id): ?array
    {
        global $wpdb;
        $row = $wpdb->get_row($wpdb->prepare('SELECT id, public_id, email, display_name, role_key, capabilities, status, must_change_password, last_login_at, created_at, updated_at FROM ' . CKP_Database::table('portal_users') . ' WHERE id = %d', $id), ARRAY_A);
        if (!is_array($row)) {
            return null;
        }
        $row['id'] = (int) $row['id'];
        $row['capabilities'] = json_decode((string) $row['capabilities'], true) ?: [];
        $row['must_change_password'] = (bool) $row['must_change_password'];
        return $row;
    }

    public static function update_user(int $id, array $input, int $actor_id): array
    {
        global $wpdb;
        $existing = self::get_user($id);
        if ($existing === null) {
            throw new InvalidArgumentException('User not found.');
        }
        $roles = self::role_definitions();
        $role = sanitize_key((string) ($input['role_key'] ?? $existing['role_key']));
        if (!isset($roles[$role])) {
            throw new InvalidArgumentException('The selected role is not valid.');
        }
        $requested = isset($input['capabilities']) && is_array($input['capabilities']) ? array_map('sanitize_key', $input['capabilities']) : $existing['capabilities'];
        $capabilities = $role === 'portal_owner' ? array_keys(self::capability_labels()) : array_values(array_intersect(array_keys(self::capability_labels()), $requested));
        $status = ($input['status'] ?? $existing['status']) === 'inactive' ? 'inactive' : 'active';
        if ($id === $actor_id && $status !== 'active') {
            throw new InvalidArgumentException('You cannot deactivate your own account.');
        }
        if ($existing['role_key'] === 'portal_owner' && ($role !== 'portal_owner' || $status !== 'active')) {
            $other_owners = (int) $wpdb->get_var($wpdb->prepare(
                'SELECT COUNT(*) FROM ' . CKP_Database::table('portal_users') . " WHERE role_key = 'portal_owner' AND status = 'active' AND id <> %d",
                $id
            ));
            if ($other_owners < 1) {
                throw new InvalidArgumentException('Create another active Portal Owner before changing the last owner account.');
            }
        }
        if ($id === $actor_id && !in_array('users.manage', $capabilities, true)) {
            throw new InvalidArgumentException('You cannot remove your own User Admin permission.');
        }
        $data = [
            'display_name' => sanitize_text_field((string) ($input['display_name'] ?? $existing['display_name'])),
            'role_key' => $role,
            'capabilities' => wp_json_encode($capabilities),
            'status' => $status,
            'must_change_password' => !empty($input['must_change_password']) ? 1 : 0,
            'updated_at' => current_time('mysql', true),
        ];
        if (!empty($input['password'])) {
            if (strlen((string) $input['password']) < 12) {
                throw new InvalidArgumentException('Passwords must be at least 12 characters.');
            }
            $data['password_hash'] = password_hash((string) $input['password'], PASSWORD_DEFAULT);
        }
        $wpdb->update(CKP_Database::table('portal_users'), $data, ['id' => $id]);
        if ($status === 'inactive' || !empty($input['revoke_sessions'])) {
            $wpdb->delete(CKP_Database::table('portal_sessions'), ['user_id' => $id]);
        }
        self::audit($actor_id, 'user.updated', 'portal_user', (string) $id, ['role' => $role, 'status' => $status]);
        return self::get_user($id) ?? [];
    }

    public static function change_password(int $user_id, string $current_password, string $new_password): void
    {
        global $wpdb;
        $table = CKP_Database::table('portal_users');
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $user_id), ARRAY_A);
        if (!is_array($user) || !password_verify($current_password, (string) $user['password_hash'])) {
            throw new InvalidArgumentException('The current password is not correct.');
        }
        if (strlen($new_password) < 12) {
            throw new InvalidArgumentException('The new password must be at least 12 characters.');
        }
        $wpdb->update($table, [
            'password_hash' => password_hash($new_password, PASSWORD_DEFAULT),
            'must_change_password' => 0,
            'updated_at' => current_time('mysql', true),
        ], ['id' => $user_id]);
        self::audit($user_id, 'auth.password_changed', 'portal_user', (string) $user_id);
    }

    public static function audit(?int $user_id, string $action, string $object_type, ?string $object_id = null, array $details = []): void
    {
        global $wpdb;
        $wpdb->insert(CKP_Database::table('portal_audit'), [
            'user_id' => $user_id,
            'action' => sanitize_key($action),
            'object_type' => sanitize_key($object_type),
            'object_id' => $object_id,
            'details' => $details === [] ? null : wp_json_encode($details),
            'created_at' => current_time('mysql', true),
        ]);
    }
}

final class CKP_HTTP_Exception extends RuntimeException
{
    public function __construct(string $message, public readonly int $status)
    {
        parent::__construct($message);
    }
}
