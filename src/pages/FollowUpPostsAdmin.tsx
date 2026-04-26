import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import PermissionGuard from '@/components/admin/PermissionGuard';
import {
  FileText, Plus, Trash2, Edit2, Check, Loader2, RefreshCw,
  AlertCircle, Calendar, Image as ImageIcon, Upload, X, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  event_date: string;
}

interface FollowUpPost {
  id: string;
  event_id: string | null;
  title: string;
  body: string | null;
  featured_image_url: string | null;
  status: 'draft' | 'published';
  publish_date: string;
  created_at: string;
}

interface FormData {
  event_id: string;
  title: string;
  body: string;
  featured_image_url: string;
  status: 'draft' | 'published';
  publish_date: string;
}

const EMPTY_FORM: FormData = {
  event_id: '',
  title: '',
  body: '',
  featured_image_url: '',
  status: 'draft',
  publish_date: new Date().toISOString().split('T')[0],
};

interface FollowUpPostsAdminProps {
  embedded?: boolean;
}

const FollowUpPostsAdmin: React.FC<FollowUpPostsAdminProps> = ({ embedded }) => {
  const { canManageFollowUpPosts } = useAdminPermissions();
  const { toast } = useToast();

  const [posts, setPosts] = useState<FollowUpPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [postsRes, eventsRes] = await Promise.all([
        supabase.from('event_followup_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('community_events').select('id, title, event_date').eq('status', 'approved').order('event_date', { ascending: false }),
      ]);
      if (postsRes.error) throw postsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      setPosts(postsRes.data ?? []);
      setEvents(eventsRes.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const startEdit = (post: FollowUpPost) => {
    setEditingId(post.id);
    setForm({
      event_id: post.event_id ?? '',
      title: post.title,
      body: post.body ?? '',
      featured_image_url: post.featured_image_url ?? '',
      status: post.status,
      publish_date: post.publish_date,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `followup/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(path);
      setForm(p => ({ ...p, featured_image_url: urlData.publicUrl }));
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        event_id: form.event_id || null,
        title: form.title.trim(),
        body: form.body.trim() || null,
        featured_image_url: form.featured_image_url.trim() || null,
        status: form.status,
        publish_date: form.publish_date,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: e } = await supabase.from('event_followup_posts').update(payload).eq('id', editingId);
        if (e) throw e;
        toast({ title: 'Post updated' });
      } else {
        const { error: e } = await supabase.from('event_followup_posts').insert(payload);
        if (e) throw e;
        toast({ title: 'Post created' });
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const { error: e } = await supabase.from('event_followup_posts').delete().eq('id', id);
      if (e) throw e;
      toast({ title: 'Post deleted' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all';
  const wrapClass = embedded ? 'p-6' : 'max-w-4xl mx-auto px-4 sm:px-6 py-8';

  return (
    <PermissionGuard permission="follow_up_posts" hasPermission={canManageFollowUpPosts}>
      <div className={wrapClass}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Follow-up Posts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Post-event recaps, thank-you notes, and highlights.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] transition-colors"
            >
              <Plus size={15} /> New Post
            </button>
          </div>
        </div>

        {/* Editor form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">{editingId ? 'Edit Post' : 'New Follow-up Post'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="2026 Car Show Recap" />
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Body</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  rows={8}
                  className={`${inputCls} resize-y font-mono text-xs`}
                  placeholder="Write your recap post here... Markdown is supported."
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Featured Image</label>
                <div className="flex items-center gap-3">
                  <input
                    value={form.featured_image_url}
                    onChange={e => setForm(p => ({ ...p, featured_image_url: e.target.value }))}
                    className={`${inputCls} flex-1`}
                    placeholder="https://... or upload below"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {imageUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload
                  </button>
                  <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </div>
                {form.featured_image_url && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.featured_image_url} className="w-32 h-20 object-cover rounded-lg border border-gray-200" alt="Preview" />
                    <button onClick={() => setForm(p => ({ ...p, featured_image_url: '' }))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Publish Date</label>
                  <input type="date" value={form.publish_date} onChange={e => setForm(p => ({ ...p, publish_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
                  <div className="flex gap-2">
                    {(['draft', 'published'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, status: s }))}
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
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E065D] text-white text-sm font-medium rounded-xl hover:bg-[#7D0348] disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editingId ? 'Save Changes' : 'Create Post'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Post list */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#9E065D] animate-spin" /></div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 py-8 text-red-600"><AlertCircle size={16} /><span className="text-sm">{error}</span></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No follow-up posts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map(post => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4">
                  {post.featured_image_url ? (
                    <img src={post.featured_image_url} className="w-14 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-14 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {post.event_id && events.find(e => e.id === post.event_id) && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={10} /> {events.find(e => e.id === post.event_id)!.title}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-gray-400">{post.publish_date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(post)} className="p-1.5 text-gray-400 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

export default FollowUpPostsAdmin;
