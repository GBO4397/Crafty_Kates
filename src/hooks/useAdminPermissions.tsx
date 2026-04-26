import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type AdminPermission =
  | 'sponsor_admin'
  | 'event_admin'
  | 'registrations'
  | 'checkin'
  | 'organizers'
  | 'checklist'
  | 'follow_up_posts'
  | 'testimonials'
  | 'user_management'
  | 'coloring_book_admin';

interface AdminPermissions {
  permissions: Set<AdminPermission>;
  loading: boolean;
  canManageSponsors: boolean;
  canManageEvents: boolean;
  canViewRegistrations: boolean;
  canCheckIn: boolean;
  canManageOrganizers: boolean;
  canManageChecklist: boolean;
  canManageFollowUpPosts: boolean;
  canManageTestimonials: boolean;
  canManageUsers: boolean;
  hasPermission: (p: AdminPermission) => boolean;
}

export function useAdminPermissions(): AdminPermissions {
  const [permissions, setPermissions] = useState<Set<AdminPermission>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const ALL_PERMISSIONS: AdminPermission[] = [
        'sponsor_admin', 'event_admin', 'registrations', 'checkin',
        'organizers', 'checklist', 'follow_up_posts', 'testimonials',
        'user_management', 'coloring_book_admin',
      ];

      try {
        const { data, error } = await supabase.rpc('get_my_admin_permissions');
        if (!cancelled) {
          if (!error && Array.isArray(data) && data.length > 0) {
            setPermissions(new Set(data as AdminPermission[]));
          } else {
            // No Supabase auth session (single-password admin) — grant all permissions.
            setPermissions(new Set(ALL_PERMISSIONS));
          }
        }
      } catch {
        if (!cancelled) setPermissions(new Set(ALL_PERMISSIONS));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const hasPermission = (p: AdminPermission) => permissions.has(p);

  return {
    permissions,
    loading,
    canManageSponsors: hasPermission('sponsor_admin'),
    canManageEvents: hasPermission('event_admin'),
    canViewRegistrations: hasPermission('registrations'),
    canCheckIn: hasPermission('checkin'),
    canManageOrganizers: hasPermission('organizers'),
    canManageChecklist: hasPermission('checklist'),
    canManageFollowUpPosts: hasPermission('follow_up_posts'),
    canManageTestimonials: hasPermission('testimonials'),
    canManageUsers: hasPermission('user_management'),
    hasPermission,
  };
}
