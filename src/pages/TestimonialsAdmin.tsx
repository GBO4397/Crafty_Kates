import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import PermissionGuard from '@/components/admin/PermissionGuard';
import {
  Star, Plus, Trash2, Edit2, Check, Loader2, RefreshCw,
  AlertCircle, Upload, X, Eye, EyeOff, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  event_date: string;
}

interface Testimonial {
  id: string;
  event_id: string | null;
  author_name: string;
  author_title: string | null;
  author_photo_url: string | null;
  testimonial_text: string;
  star_rating: number | null;
  status: 'draft' | 'published';
  created_at: string;
  community_events?: { title: string } | null;
}

interface FormData {
  event_id: string;
  author_name: string;
  author_title: string;
  author_photo_url: string;
  testimonial_text: string;
  star_rating: string;
  status: 'draft' | 'published';
}

const EMPTY_FORM: FormData = {
  event_id: '',
  author_name: '',
  author_title: '',
  author_photo_url: '',
  testimonial_text: '',
  star_rating: '',
  status: 'draft',
};

interface TestimonialsAdminProps {
  embedded?: boolean;
}

const TestimonialsAdmin: React.FC<TestimonialsAdminProps> = ({ embedded }) => {
  const { canManageTestimonials } = useAdminPermissions();
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [filterEventId, setFilterEventId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, evRes] = await Promise.all([
        supabase.from('testimonials').select('*, community_events(title)').order('created_at', { ascending: false }),
        supabase.from('community_events').select('id, title, event_date').eq('status', 'approved').order('event_date', { ascending: false }),
      ]);
      if (tRes.error) throw tRes.error;
      if (evRes.error) throw evRes.error;
      setTestimonials(tRes.data ?? []);
      setEvents(evRes.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      event_id: t.event_id ?? '',
      author_name: t.author_name,
      author_title: t.author_title ?? '',
      author_photo_url: t.author_photo_url ?? '',
      testimonial_text: t.testimonial_text,
      star_rating: t.star_rating ? String(t.star_rating) : '',
      status: t.status,
    });
    setShowForm(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `testimonials/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(path);
      setForm(p => ({ ...p, author_photo_url: urlData.publicUrl }));
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.author_name.trim()) { toast({ title: 'Author name is required', variant: 'destructive' }); return; }
    if (!form.testimonial_text.trim()) { toast({ title: 'Testimonial text is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        event_id: form.event_id || null,
        author_name: form.author_name.trim(),
        author_title: form.author_title.trim() || null,
        author_photo_url: form.author_photo_url.trim() || null,
        testimonial_text: form.testimonial_text.trim(),
        star_rating: form.star_rating ? parseInt(form.star_rating) : null,
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: e } = await supabase.from('testimonials').update(payload).eq('id', editingId);
        if (e) throw e;
        toast({ title: 'Testimonial updated' });
      } else {
        const { error: e } = await supabase.from('testimonials').insert(payload);
        if (e) throw e;
        toast({ title: 'Testimonial added' });
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      const { error: e } = await supabase.from('testimonials').delete().eq('id', id);
      if (e) throw e;
      toast({ title: 'Testimonial deleted' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = filterEventId ? testimonials.filter(t => t.event_id === filterEventId) : testimonials;
  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all';
  const wrapClass = embedded ? 'p-6' : 'max-w-4xl mx-auto px-4 sm:px-6 py-8';

  return (
    <PermissionGuard permission="testimonials" hasPermission={canManageTestimonials}>
      <div className={wrapClass}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage attendee and vendor testimonials, grouped by event.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] transition-colors"
            >
              <Plus size={15} /> Add Testimonial
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Author Name *</label>
                  <input value={form.author_name} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} className={inputCls} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Author Title / Role</label>
                  <input value={form.author_title} onChange={e => setForm(p => ({ ...p, author_title: e.target.value }))} className={inputCls} placeholder="e.g. Vendor, Attendee, Sponsor" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Related Event</label>
                  <select value={form.event_id} onChange={e => setForm(p => ({ ...p, event_id: e.target.value }))} className={inputCls}>
                    <option value="">— No linked event —</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.event_date})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Star Rating</label>
                  <select value={form.star_rating} onChange={e => setForm(p => ({ ...p, star_rating: e.target.value }))} className={inputCls}>
                    <option value="">— No rating —</option>
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{'★'.repeat(n)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Testimonial *</label>
                <textarea value={form.testimonial_text} onChange={e => setForm(p => ({ ...p, testimonial_text: e.target.value }))} rows={4} className={`${inputCls} resize-none`} placeholder="What they said..." />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Author Photo (optional)</label>
                <div className="flex items-center gap-3">
                  <input value={form.author_photo_url} onChange={e => setForm(p => ({ ...p, author_photo_url: e.target.value }))} className={`${inputCls} flex-1`} placeholder="https://..." />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={photoUploading} className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0">
                    {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload
                  </button>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                </div>
                {form.author_photo_url && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.author_photo_url} className="w-12 h-12 object-cover rounded-full border border-gray-200" alt="Preview" />
                    <button onClick={() => setForm(p => ({ ...p, author_photo_url: '' }))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={9} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
                <div className="flex gap-2 max-w-xs">
                  {(['draft', 'published'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        form.status === s ? 'border-[#9E065D] bg-[#FEE6F4]/30 text-[#9E065D]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s === 'published' ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editingId ? 'Save Changes' : 'Add Testimonial'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        {/* Filter by event */}
        <div className="flex items-center gap-3 mb-4">
          <select value={filterEventId} onChange={e => setFilterEventId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]">
            <option value="">All Events</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          <span className="text-xs text-gray-400">{filtered.length} testimonial{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#9E065D] animate-spin" /></div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 py-8 text-red-600"><AlertCircle size={16} /><span className="text-sm">{error}</span></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No testimonials yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(t => (
                <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                  {t.author_photo_url ? (
                    <img src={t.author_photo_url} className="w-10 h-10 object-cover rounded-full border border-gray-200 flex-shrink-0" alt={t.author_name} />
                  ) : (
                    <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-yellow-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{t.author_name}</p>
                      {t.author_title && <span className="text-xs text-gray-400">· {t.author_title}</span>}
                      {t.star_rating && <span className="text-xs text-yellow-500">{'★'.repeat(t.star_rating)}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{t.testimonial_text}</p>
                    {t.community_events?.title && <p className="text-[10px] text-gray-400 mt-0.5">{t.community_events.title}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(t)} className="p-1.5 text-gray-400 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id, t.author_name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

export default TestimonialsAdmin;
