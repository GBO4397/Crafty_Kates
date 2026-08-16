<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

final class CKP_Content
{
    public static function boot(): void
    {
        add_action('acf/init', [self::class, 'register_content_model']);
        add_action('admin_notices', [self::class, 'dependency_notice']);
    }

    public static function dependency_notice(): void
    {
        if (current_user_can('activate_plugins') && !function_exists('acf_add_local_field_group')) {
            echo '<div class="notice notice-error"><p><strong>Crafty Kates Portal:</strong> Advanced Custom Fields 6.8 or newer must be active.</p></div>';
        }
    }

    public static function register_content_model(): void
    {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }
        self::register_post_types();
        self::register_field_groups();
    }

    private static function register_post_types(): void
    {
        $types = [
            'ck_event' => [
                'key' => 'post_type_ck_event', 'plural' => 'Events', 'singular' => 'Event',
                'icon' => 'dashicons-calendar-alt', 'public' => true, 'archive' => 'events', 'rewrite' => 'event',
                'supports' => ['title', 'editor', 'excerpt', 'thumbnail'],
            ],
            'ck_sponsor' => [
                'key' => 'post_type_ck_sponsor', 'plural' => 'Sponsors', 'singular' => 'Sponsor',
                'icon' => 'dashicons-awards', 'public' => false, 'archive' => false, 'rewrite' => false,
                'supports' => ['title', 'editor', 'thumbnail'],
            ],
            'ck_color_book' => [
                'key' => 'post_type_ck_color_book', 'plural' => 'Coloring Books', 'singular' => 'Coloring Book',
                'icon' => 'dashicons-art', 'public' => true, 'archive' => 'coloring-books', 'rewrite' => 'coloring-book',
                'supports' => ['title', 'editor', 'excerpt', 'thumbnail'],
            ],
            'ck_gallery' => [
                'key' => 'post_type_ck_gallery', 'plural' => 'Galleries', 'singular' => 'Gallery',
                'icon' => 'dashicons-format-gallery', 'public' => true, 'archive' => false, 'rewrite' => 'gallery',
                'supports' => ['title', 'editor', 'thumbnail'],
            ],
            'ck_gallery_photo' => [
                'key' => 'post_type_ck_gallery_photo', 'plural' => 'Gallery Photos', 'singular' => 'Gallery Photo',
                'icon' => 'dashicons-format-image', 'public' => false, 'archive' => false, 'rewrite' => false,
                'supports' => ['title', 'excerpt', 'thumbnail', 'page-attributes'],
            ],
            'ck_color_page' => [
                'key' => 'post_type_ck_color_page', 'plural' => 'Coloring Pages', 'singular' => 'Coloring Page',
                'icon' => 'dashicons-format-image', 'public' => false, 'archive' => false, 'rewrite' => false,
                'supports' => ['title', 'thumbnail', 'page-attributes'],
            ],
            'ck_site_image' => [
                'key' => 'post_type_ck_site_image', 'plural' => 'Site Image Slots', 'singular' => 'Site Image Slot',
                'icon' => 'dashicons-cover-image', 'public' => false, 'archive' => false, 'rewrite' => false,
                'supports' => ['title', 'thumbnail', 'page-attributes'],
            ],
        ];

        foreach ($types as $post_type => $config) {
            $args = [
                'labels' => [
                    'name' => $config['plural'],
                    'singular_name' => $config['singular'],
                    'add_new_item' => 'Add ' . $config['singular'],
                    'edit_item' => 'Edit ' . $config['singular'],
                    'new_item' => 'New ' . $config['singular'],
                    'view_item' => 'View ' . $config['singular'],
                    'search_items' => 'Search ' . $config['plural'],
                    'not_found' => 'No ' . strtolower($config['plural']) . ' found',
                ],
                'public' => $config['public'],
                'publicly_queryable' => $config['public'],
                'show_ui' => true,
                'show_in_menu' => true,
                'show_in_rest' => true,
                'has_archive' => $config['archive'],
                'rewrite' => $config['rewrite'] === false ? false : ['slug' => $config['rewrite'], 'with_front' => false],
                'menu_icon' => $config['icon'],
                'supports' => $config['supports'],
                'hierarchical' => false,
                'exclude_from_search' => !$config['public'],
                'query_var' => $config['public'],
            ];
            if (function_exists('acf_add_local_post_type')) {
                acf_add_local_post_type(array_merge($args, [
                    'key' => $config['key'],
                    'title' => $config['plural'],
                    'post_type' => $post_type,
                    'active' => true,
                    'advanced_configuration' => true,
                ]));
            } elseif (!post_type_exists($post_type)) {
                register_post_type($post_type, $args);
            }
        }
    }

    private static function base_field(string $key, string $label, string $name, string $type, array $extra = []): array
    {
        return array_merge([
            'key' => $key,
            'label' => $label,
            'name' => $name,
            'type' => $type,
            'instructions' => '',
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => ['width' => '', 'class' => '', 'id' => ''],
        ], $extra);
    }

    private static function register_field_groups(): void
    {
        acf_add_local_field_group([
            'key' => 'group_ck_event_details', 'title' => 'Event Details',
            'fields' => [
                self::base_field('field_ck_event_date', 'Event Date', 'event_date', 'date_picker', ['required' => 1, 'display_format' => 'F j, Y', 'return_format' => 'Y-m-d', 'first_day' => 0]),
                self::base_field('field_ck_event_start', 'Start Time', 'event_time_start', 'time_picker', ['display_format' => 'g:i a', 'return_format' => 'H:i:s']),
                self::base_field('field_ck_event_end', 'End Time', 'event_time_end', 'time_picker', ['display_format' => 'g:i a', 'return_format' => 'H:i:s']),
                self::base_field('field_ck_event_location', 'Location', 'location', 'text', ['required' => 1]),
                self::base_field('field_ck_event_address', 'Address', 'address', 'textarea', ['rows' => 2]),
                self::base_field('field_ck_event_category', 'Category', 'category', 'select', ['choices' => self::event_categories(), 'default_value' => 'community-event', 'return_format' => 'value', 'ui' => 1]),
                self::base_field('field_ck_event_organizer_name', 'Organizer Name', 'organizer_name', 'text'),
                self::base_field('field_ck_event_organizer_email', 'Organizer Email', 'organizer_email', 'email'),
                self::base_field('field_ck_event_organizer_phone', 'Organizer Phone', 'organizer_phone', 'text'),
                self::base_field('field_ck_event_website', 'Website', 'website_url', 'url'),
                self::base_field('field_ck_event_ticket', 'Ticket URL', 'ticket_url', 'url'),
                self::base_field('field_ck_event_free', 'Free Admission', 'is_free', 'true_false', ['default_value' => 1, 'ui' => 1]),
                self::base_field('field_ck_event_price', 'Admission Details', 'ticket_price', 'text'),
                self::base_field('field_ck_event_status', 'Review Status', 'review_status', 'select', ['choices' => ['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected'], 'default_value' => 'pending', 'return_format' => 'value', 'ui' => 1]),
                self::base_field('field_ck_event_featured', 'Featured', 'featured', 'true_false', ['ui' => 1]),
                self::base_field('field_ck_event_notes', 'Admin Notes', 'admin_notes', 'textarea', ['rows' => 3]),
                self::base_field('field_ck_event_submitted', 'Submitted At', 'submitted_at', 'date_time_picker', ['display_format' => 'M j, Y g:i a', 'return_format' => 'Y-m-d H:i:s']),
                self::base_field('field_ck_event_reviewed', 'Reviewed At', 'reviewed_at', 'date_time_picker', ['display_format' => 'M j, Y g:i a', 'return_format' => 'Y-m-d H:i:s']),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_event']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_sponsor_details', 'title' => 'Sponsor Details',
            'fields' => [
                self::base_field('field_ck_sponsor_tier', 'Tier', 'tier', 'button_group', ['choices' => ['gold' => 'Gold', 'silver' => 'Silver', 'bronze' => 'Bronze'], 'default_value' => 'bronze', 'return_format' => 'value']),
                self::base_field('field_ck_sponsor_logo', 'Logo', 'logo', 'image', ['return_format' => 'id', 'preview_size' => 'medium', 'library' => 'all', 'mime_types' => 'jpg,jpeg,png,gif,webp,avif']),
                self::base_field('field_ck_sponsor_website', 'Website', 'website_url', 'url'),
                self::base_field('field_ck_sponsor_facebook', 'Facebook', 'facebook_url', 'url'),
                self::base_field('field_ck_sponsor_instagram', 'Instagram', 'instagram_url', 'url'),
                self::base_field('field_ck_sponsor_youtube', 'YouTube', 'youtube_url', 'url'),
                self::base_field('field_ck_sponsor_tiktok', 'TikTok', 'tiktok_url', 'url'),
                self::base_field('field_ck_sponsor_order', 'Display Order', 'sort_order', 'number', ['default_value' => 0, 'min' => 0, 'step' => 1]),
                self::base_field('field_ck_sponsor_active', 'Active', 'is_active', 'true_false', ['default_value' => 1, 'ui' => 1]),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_sponsor']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_coloring_book', 'title' => 'Coloring Book Details',
            'fields' => [
                self::base_field('field_ck_book_author', 'Author', 'author', 'text', ['required' => 1]),
                self::base_field('field_ck_book_email', 'Contact Email', 'contact_email', 'email'),
                self::base_field('field_ck_book_cover', 'Cover', 'cover_image', 'image', ['return_format' => 'id', 'preview_size' => 'medium']),
                self::base_field('field_ck_book_back', 'Back Cover', 'back_cover_image', 'image', ['return_format' => 'id', 'preview_size' => 'medium']),
                self::base_field('field_ck_book_inside_front', 'Inside Front Cover', 'inside_front_cover', 'image', ['return_format' => 'id', 'preview_size' => 'medium']),
                self::base_field('field_ck_book_inside_back', 'Inside Back Cover', 'inside_back_cover', 'image', ['return_format' => 'id', 'preview_size' => 'medium']),
                self::base_field('field_ck_book_status', 'Review Status', 'review_status', 'select', ['choices' => ['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected'], 'default_value' => 'pending', 'return_format' => 'value', 'ui' => 1]),
                self::base_field('field_ck_book_featured', 'Featured', 'featured', 'true_false', ['ui' => 1]),
                self::base_field('field_ck_book_downloads', 'Download Count', 'download_count', 'number', ['default_value' => 0, 'min' => 0, 'step' => 1]),
                self::base_field('field_ck_book_tags', 'Tags', 'tags', 'text', ['instructions' => 'Comma-separated tags.']),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_color_book']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_gallery', 'title' => 'Gallery Details',
            'fields' => [
                self::base_field('field_ck_gallery_photographer', 'Photographer', 'photographer_name', 'text', ['required' => 1]),
                self::base_field('field_ck_gallery_cover', 'Cover Image', 'cover_image', 'image', ['return_format' => 'id', 'preview_size' => 'medium']),
                self::base_field('field_ck_gallery_order', 'Display Order', 'sort_order', 'number', ['default_value' => 0, 'min' => 0, 'step' => 1]),
                self::base_field('field_ck_gallery_active', 'Active', 'is_active', 'true_false', ['default_value' => 1, 'ui' => 1]),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_gallery']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_gallery_photo', 'title' => 'Gallery Photo Details',
            'fields' => [
                self::base_field('field_ck_photo_gallery', 'Gallery', 'gallery', 'post_object', ['post_type' => ['ck_gallery'], 'return_format' => 'id', 'required' => 1]),
                self::base_field('field_ck_photo_order', 'Display Order', 'sort_order', 'number', ['default_value' => 0, 'min' => 0, 'step' => 1]),
                self::base_field('field_ck_photo_active', 'Active', 'is_active', 'true_false', ['default_value' => 1, 'ui' => 1]),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_gallery_photo']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_coloring_page', 'title' => 'Coloring Page Details',
            'fields' => [
                self::base_field('field_ck_page_book', 'Coloring Book', 'coloring_book', 'post_object', ['post_type' => ['ck_color_book'], 'return_format' => 'id', 'required' => 1]),
                self::base_field('field_ck_page_number', 'Page Number', 'page_number', 'number', ['default_value' => 1, 'min' => 1, 'step' => 1]),
                self::base_field('field_ck_page_color', 'Color Page', 'is_color', 'true_false', ['default_value' => 0, 'ui' => 1]),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_color_page']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);

        acf_add_local_field_group([
            'key' => 'group_ck_site_image', 'title' => 'Site Image Slot Details',
            'fields' => [
                self::base_field('field_ck_site_slot_key', 'Slot Key', 'slot_key', 'text', ['required' => 1, 'readonly' => 1]),
                self::base_field('field_ck_site_category', 'Category', 'category', 'text'),
                self::base_field('field_ck_site_description', 'Description', 'description', 'textarea', ['rows' => 2]),
                self::base_field('field_ck_site_active', 'Active', 'is_active', 'true_false', ['default_value' => 1, 'ui' => 1]),
            ],
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'ck_site_image']]],
            'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label', 'active' => true, 'show_in_rest' => 1,
        ]);
    }

    public static function event_categories(): array
    {
        return [
            'car-show' => 'Car Show', 'community-event' => 'Community Event', 'fundraiser' => 'Fundraiser',
            'festival-fair' => 'Festival / Fair', 'meetup-cruise' => 'Meetup / Cruise', 'swap-meet' => 'Swap Meet', 'other' => 'Other',
        ];
    }

    public static function site_image_slots(): array
    {
        return [
            'logo' => ['label' => 'Site Logo', 'category' => 'Branding', 'description' => 'Main Crafty Kates logo used in navigation and footer'],
            'hero-background' => ['label' => 'Hero Background', 'category' => 'Hero Section', 'description' => 'Large background image for the main hero section'],
            'hero-license-plate' => ['label' => 'Welcome License Plate', 'category' => 'Hero Section', 'description' => 'License plate welcome graphic overlaid on the hero'],
            'about-portrait' => ['label' => 'Katherine Portrait', 'category' => 'About Section', 'description' => 'Portrait photo for the About section'],
            'events-car-show' => ['label' => 'Car Show Event', 'category' => 'Events Section', 'description' => 'Featured image for the Events section'],
            'motto-background' => ['label' => 'Motto Background', 'category' => 'Motto Section', 'description' => 'Background image for the motto area'],
            'community-animal-shelter' => ['label' => 'Animal Shelter', 'category' => 'Community Section', 'description' => 'Animal Shelter partner image'],
            'community-almost-eden' => ['label' => 'Almost Eden', 'category' => 'Community Section', 'description' => 'Almost Eden partner image'],
            'car-show-hero-bg' => ['label' => 'Car Show Page Hero', 'category' => 'Car Show Page', 'description' => 'Hero background for the Car Show page'],
            'car-show-classic-cars' => ['label' => 'Classic Cars', 'category' => 'Car Show Page', 'description' => 'Classic cars image for the Car Show page'],
            'car-show-registration-hero' => ['label' => 'Registration Hero', 'category' => 'Car Show Page', 'description' => 'Hero image for the registration page'],
        ];
    }

    public static function site_image_data(): array
    {
        $result = [];
        foreach (self::site_image_slots() as $key => $slot) {
            $posts = get_posts([
                'post_type' => 'ck_site_image', 'post_status' => ['publish', 'draft'], 'name' => $key,
                'numberposts' => 1, 'fields' => 'ids',
            ]);
            $post_id = $posts !== [] ? (int) $posts[0] : 0;
            $id = $post_id > 0 ? (int) get_post_thumbnail_id($post_id) : 0;
            $result[$key] = array_merge($slot, [
                'post_id' => $post_id, 'id' => $id,
                'url' => $id > 0 ? (string) wp_get_attachment_url($id) : '',
                'alt' => $id > 0 ? (string) get_post_meta($id, '_wp_attachment_image_alt', true) : '',
            ]);
        }
        return $result;
    }

    public static function ensure_site_image_slot(string $key): int
    {
        $slots = self::site_image_slots();
        if (!isset($slots[$key])) return 0;
        $existing = get_posts(['post_type' => 'ck_site_image', 'post_status' => 'any', 'name' => $key, 'numberposts' => 1, 'fields' => 'ids']);
        if ($existing !== []) return (int) $existing[0];
        $id = wp_insert_post([
            'post_type' => 'ck_site_image', 'post_status' => 'publish', 'post_name' => $key,
            'post_title' => $slots[$key]['label'], 'post_content' => $slots[$key]['description'],
        ], true);
        if (is_wp_error($id)) return 0;
        foreach (['slot_key' => $key, 'category' => $slots[$key]['category'], 'description' => $slots[$key]['description'], 'is_active' => 1] as $field => $value) {
            if (function_exists('update_field')) update_field($field, $value, (int) $id);
            else update_post_meta((int) $id, $field, $value);
        }
        return (int) $id;
    }
}
