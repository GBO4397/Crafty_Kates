import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminPermissions, AdminPermission } from '@/hooks/useAdminPermissions';
import PermissionGuard from '@/components/admin/PermissionGuard';
import {
  Users, UserPlus, Trash2, Edit2, Check, X, Loader2, Mail,
  AlertCircle, Shield, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  user_id: string;
  email: string;
  permissions: AdminPermission[];
  granted_at: string;
}

const ALL_PERMISSIONS: { value: AdminPermission; label: string; description: string }[] = [
  { value: 'sponsor_admin', label: 'Sponsor Admin', description: 'Manage sponsors & logos' },
  { value: 'event_admin', label: 'Event Admin', description: 'Review community event submissions' },
  { value: 'registrations', label: 'Registrations', description: 'View car show registrations' },
  { value: 'checkin', label: 'Check-In', description: 'Day-of event check-in system' },
  { value: 'organizers', label: 'Organizers', description: 'Manage organizer contacts' },
  { value: 'checklist', label: 'Check List', description: 'Event planning checklist' },
  { value: 'follow_up_posts', label: 'Follow-up Posts', description: 'Write post-event recaps' },
  { value: 'testimonials', label: 'Testimonials', description: 'Manage testimonials by event' },
  { value: 'user_management', label: 'User Management', description: 'Invite and manage admin users (super admin only)' },
];

interface UserManagementAdminProps {
  embedded?: boolean;
}

const UserManagementAdmin: React.FC<UserManagementAdminProps> = ({ embedded }) => {
  const { canManageUsers } = useAdminPermissions();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<Set<AdminPermission>>(new Set());
  const [inviting, setInviting] = useState(false);

  // Edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<Set<AdminPermission>>(new Set());
  const [saving, setSaving] = useState(false);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('admin_user_permissions')
        .select('user_id, permission, granted_at')
        .order('granted_at', { ascending: false });

      if (dbError) throw dbError;

      // Group by user_id
      const userMap = new Map<string, AdminUser>();
      for (const row of data ?? []) {
        if (!userMap.has(row.user_id)) {
          userMap.set(row.user_id, {
            user_id: row.user_id,
            email: row.user_id, // will try to enrich via function
            permissions: [],
            granted_at: row.granted_at,
          });
        }
        userMap.get(row.user_id)!.permissions.push(row.permission);
      }
      setUsers(Array.from(userMap.values()));
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleInvitePermission = (p: AdminPermission) => {
    setInvitePermissions(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (invitePermissions.size === 0) {
      toast({ title: 'Select at least one permission', variant: 'destructive' });
      return;
    }

    setInviting(true);
    try {
      // Invite user via Supabase Auth admin API (requires service role — handled server-side)
      const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-invite-user', {
        body: {
          email: inviteEmail.trim(),
          permissions: Array.from(invitePermissions),
        },
      });

      if (fnError || !fnData?.success) {
        throw new Error(fnData?.error || fnError?.message || 'Invite failed');
      }

      toast({ title: `Invite sent to ${inviteEmail.trim()}` });
      setInviteEmail('');
      setInvitePermissions(new Set());
      await loadUsers();
    } catch (err: any) {
      toast({ title: 'Invite failed', description: err.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingUserId(user.user_id);
    setEditPermissions(new Set(user.permissions));
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditPermissions(new Set());
  };

  const saveEdit = async (userId: string) => {
    setSaving(true);
    try {
      // Delete existing permissions for this user
      const { error: delError } = await supabase
        .from('admin_user_permissions')
        .delete()
        .eq('user_id', userId);
      if (delError) throw delError;

      // Insert new permissions
      if (editPermissions.size > 0) {
        const rows = Array.from(editPermissions).map(p => ({
          user_id: userId,
          permission: p,
        }));
        const { error: insError } = await supabase
          .from('admin_user_permissions')
          .insert(rows);
        if (insError) throw insError;
      }

      toast({ title: 'Permissions updated' });
      setEditingUserId(null);
      await loadUsers();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (userId: string, email: string) => {
    if (!confirm(`Remove all admin access for ${email}?`)) return;
    try {
      const { error: dbError } = await supabase
        .from('admin_user_permissions')
        .delete()
        .eq('user_id', userId);
      if (dbError) throw dbError;
      toast({ title: 'Admin access removed' });
      await loadUsers();
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const toggleEditPermission = (p: AdminPermission) => {
    setEditPermissions(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const wrapClass = embedded ? 'p-6' : 'max-w-4xl mx-auto px-4 sm:px-6 py-8';

  return (
    <PermissionGuard permission="user_management" hasPermission={canManageUsers}>
      <div className={wrapClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Invite admins and control which sections they can access.</p>
          </div>
          <button
            onClick={loadUsers}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Invite form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-[#9E065D]" />
            Invite New Admin
          </h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(p => (
                  <label
                    key={p.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      invitePermissions.has(p.value)
                        ? 'border-[#9E065D] bg-[#FEE6F4]/30'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={invitePermissions.has(p.value)}
                      onChange={() => toggleInvitePermission(p.value)}
                      className="mt-0.5 accent-[#9E065D]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{p.label}</span>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim() || invitePermissions.size === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-[#9E065D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {inviting ? 'Sending invite...' : 'Send Invite'}
            </button>
          </form>
        </div>

        {/* User list */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <h2 className="text-base font-bold text-gray-800">Current Admin Users</h2>
            <span className="ml-auto text-xs text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-[#9E065D] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 py-8 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No admin users yet. Invite someone above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map(user => (
                <div key={user.user_id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#9E065D]/20 to-[#FB50B1]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#9E065D] text-sm font-bold">
                          {(user.email?.[0] ?? '?').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          {user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {editingUserId !== user.user_id && (
                        <>
                          <button
                            onClick={() => setExpandedUserId(expandedUserId === user.user_id ? null : user.user_id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {expandedUserId === user.user_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 text-gray-400 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => removeUser(user.user_id, user.email)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Permission tags (collapsed view) */}
                  {expandedUserId === user.user_id && editingUserId !== user.user_id && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {user.permissions.map(p => {
                        const conf = ALL_PERMISSIONS.find(a => a.value === p);
                        return (
                          <span key={p} className="px-2.5 py-0.5 bg-[#FEE6F4]/60 text-[#9E065D] text-xs rounded-full border border-[#FB50B1]/20 font-medium">
                            {conf?.label ?? p}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Edit mode */}
                  {editingUserId === user.user_id && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Edit Permissions</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.map(p => (
                          <label
                            key={p.value}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              editPermissions.has(p.value)
                                ? 'border-[#9E065D] bg-[#FEE6F4]/30'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={editPermissions.has(p.value)}
                              onChange={() => toggleEditPermission(p.value)}
                              className="mt-0.5 accent-[#9E065D]"
                            />
                            <span className="text-sm text-gray-800">{p.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(user.user_id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] transition-colors disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default UserManagementAdmin;
