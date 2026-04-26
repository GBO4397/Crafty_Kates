import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import PermissionGuard from '@/components/admin/PermissionGuard';
import {
  Contact, Plus, Trash2, Edit2, Check, X, Loader2, Mail,
  Phone, RefreshCw, AlertCircle, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organizer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  notes: string | null;
  created_at: string;
}

interface OrganizerFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
}

const EMPTY_FORM: OrganizerFormData = { name: '', email: '', phone: '', role: '', notes: '' };

interface OrganizersAdminProps {
  embedded?: boolean;
}

const OrganizersAdmin: React.FC<OrganizersAdminProps> = ({ embedded }) => {
  const { canManageOrganizers } = useAdminPermissions();
  const { toast } = useToast();

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrganizerFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: dbErr } = await supabase
        .from('organizers')
        .select('*')
        .order('name');
      if (dbErr) throw dbErr;
      setOrganizers(data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (o: Organizer) => {
    setEditingId(o.id);
    setForm({ name: o.name, email: o.email ?? '', phone: o.phone ?? '', role: o.role ?? '', notes: o.notes ?? '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        role: form.role.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (editingId) {
        const { error: e } = await supabase.from('organizers').update(payload).eq('id', editingId);
        if (e) throw e;
        toast({ title: 'Organizer updated' });
      } else {
        const { error: e } = await supabase.from('organizers').insert(payload);
        if (e) throw e;
        toast({ title: 'Organizer added' });
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete organizer "${name}"?`)) return;
    try {
      const { error: e } = await supabase.from('organizers').delete().eq('id', id);
      if (e) throw e;
      toast({ title: 'Organizer deleted' });
      await load();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all';

  const wrapClass = embedded ? 'p-6' : 'max-w-3xl mx-auto px-4 sm:px-6 py-8';

  return (
    <PermissionGuard permission="organizers" hasPermission={canManageOrganizers}>
      <div className={wrapClass}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage event organizer contacts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] transition-colors"
            >
              <Plus size={15} /> Add Organizer
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Organizer' : 'Add Organizer'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls} placeholder="e.g. Volunteer Coordinator" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="(760) 555-0000" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editingId ? 'Save Changes' : 'Add Organizer'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#9E065D] animate-spin" /></div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 py-8 text-red-600"><AlertCircle size={16} /><span className="text-sm">{error}</span></div>
          ) : organizers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <User size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No organizers yet. Add one above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {organizers.map(o => (
                <div key={o.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Contact size={18} className="text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{o.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {o.role && <span className="text-xs text-gray-500">{o.role}</span>}
                      {o.email && (
                        <a href={`mailto:${o.email}`} className="text-xs text-[#9E065D] flex items-center gap-1 hover:underline">
                          <Mail size={11} /> {o.email}
                        </a>
                      )}
                      {o.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={11} /> {o.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(o)} className="p-1.5 text-gray-400 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(o.id, o.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default OrganizersAdmin;
