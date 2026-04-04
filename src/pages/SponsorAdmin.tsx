import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft, RefreshCw, Shield, LayoutDashboard,
  Save, CheckCircle, AlertCircle, Loader2, ExternalLink,
  Plus, X, Lock, LogOut, Eye, EyeOff,
  LayoutGrid, Table2, Camera, Info, Globe, Facebook, Instagram, Youtube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SponsorAdminStats from '@/components/admin/SponsorAdminStats';
import SponsorAdminTable from '@/components/admin/SponsorAdminTable';
import SponsorAdminCards from '@/components/admin/SponsorAdminCards';

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Sponsor {
  id: string;
  name: string;
  tier: string;
  sponsor_type: 'primary' | 'carshow' | 'both';
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SOCIAL_FIELDS = ['facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url'];

function stripSocialFields(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (!SOCIAL_FIELDS.includes(key) && key !== 'twitter_url') {
      result[key] = obj[key];
    }
  }
  return result;
}

function normalizeSponsor(data: any): Sponsor {
  return {
    id: data.id,
    name: data.name || '',
    tier: data.tier || 'bronze',
    sponsor_type: data.sponsor_type || 'carshow',
    logo_url: data.logo_url || null,
    website_url: data.website_url || null,
    description: data.description || null,
    facebook_url: data.facebook_url ?? null,
    instagram_url: data.instagram_url ?? null,
    youtube_url: data.youtube_url ?? null,
    tiktok_url: data.tiktok_url ?? null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

const ADMIN_PASSWORD = 'CraftyKates2026!';

function generateToken(): string {
  return btoa(Date.now().toString(36) + Math.random().toString(36).slice(2));
}

const AdminLoginGate: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter the admin password'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        body: { password, action: 'login' },
      });
      if (!fnError && data?.success) {
        localStorage.setItem('ck_admin_token', data.token);
        localStorage.setItem('ck_admin_expires', data.expiresAt);
        onAuthenticated();
        return;
      }
    } catch (_) {}
    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('ck_admin_token', token);
      localStorage.setItem('ck_admin_expires', expires);
      onAuthenticated();
    } else {
      setError('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <Link to="/car-show" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Car Show
        </Link>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Sponsor Admin</h1>
            <p className="text-white/40 text-sm">Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Admin Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password..."
                  className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 transition-all text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading || !password.trim()} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

let socialColumnsExist: boolean | null = null;

const SponsorAdmin: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    name: '', sponsor_type: 'carshow', description: '', website_url: '',
    facebook_url: '', instagram_url: '', youtube_url: '', tiktok_url: ''
  });
  const [socialToggles, setSocialToggles] = useState({
    facebook_url: false, instagram_url: false, youtube_url: false, tiktok_url: false
  });
  const [addingNew, setAddingNew] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { toast } = useToast();

  useEffect(() => {
    if (embedded) { setIsAuthenticated(true); setCheckingAuth(false); return; }
    const token = localStorage.getItem('ck_admin_token');
    const expires = localStorage.getItem('ck_admin_expires');
    if (token && expires && new Date(expires) > new Date()) setIsAuthenticated(true);
    setCheckingAuth(false);
  }, [embedded]);

  const handleLogout = () => {
    localStorage.removeItem('ck_admin_token');
    localStorage.removeItem('ck_admin_expires');
    setIsAuthenticated(false);
  };

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('sponsors')
        .select('*')
        .order('sort_order', { ascending: true });
      if (fetchError) throw fetchError;
      socialColumnsExist = true;
      setSponsors((data || []).map(normalizeSponsor));
    } catch (err: any) {
      setError(err.message || 'Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchSponsors(); }, [isAuthenticated, fetchSponsors]);

  const handleReorder = useCallback((reordered: Sponsor[]) => {
    setSponsors(reordered);
    setHasChanges(true);
  }, []);

  const handleUpdateSponsor = useCallback(async (id: string, updates: Partial<Sponsor>) => {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    try {
      const dbUpdates: Record<string, any> = { ...updates, updated_at: new Date().toISOString() };
      delete dbUpdates.id;
      delete dbUpdates.created_at;
      let { error: updateError } = await supabase.from('sponsors').update(dbUpdates).eq('id', id);
      if (updateError) {
        const coreUpdates = stripSocialFields(dbUpdates);
        const { error: retryError } = await supabase.from('sponsors').update(coreUpdates).eq('id', id);
        if (retryError) throw retryError;
      }
      toast({ title: 'Updated', description: 'Sponsor updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' });
      fetchSponsors();
    }
  }, [toast, fetchSponsors]);

  const handleDeleteSponsor = useCallback(async (id: string) => {
    const sponsorName = sponsors.find(s => s.id === id)?.name || 'Sponsor';
    setSponsors(prev => prev.filter(s => s.id !== id));
    try {
      const { error: deleteError } = await supabase.from('sponsors').delete().eq('id', id);
      if (deleteError) throw deleteError;
      toast({ title: 'Deleted', description: `${sponsorName} has been removed` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
      fetchSponsors();
    }
  }, [sponsors, toast, fetchSponsors]);

  const handleLogoUploaded = useCallback((id: string, newLogoUrl: string) => {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, logo_url: newLogoUrl, updated_at: new Date().toISOString() } : s));
    toast({ title: 'Logo Updated', description: 'Sponsor logo has been uploaded successfully' });
  }, [toast]);

  const handleBulkAction = useCallback(async (action: string, ids: string[], value?: string) => {
    let updates: Partial<Sponsor> = {};
    if (action === 'activate') updates = { is_active: true };
    else if (action === 'deactivate') updates = { is_active: false };
    else if (action === 'changeTier' && value) updates = { tier: value };
    setSponsors(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    try {
      for (const id of ids) {
        await supabase.from('sponsors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      }
      toast({ title: 'Bulk Action Complete', description: `${ids.length} sponsor(s) updated` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Bulk action failed', variant: 'destructive' });
      fetchSponsors();
    }
  }, [toast, fetchSponsors]);

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      for (const sponsor of sponsors) {
        await supabase.from('sponsors').update({ sort_order: sponsor.sort_order, updated_at: new Date().toISOString() }).eq('id', sponsor.id);
      }
      setHasChanges(false);
      setLastSaved(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      toast({ title: 'Order Saved', description: 'Sponsor display order has been updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save order', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSponsor = async () => {
    if (!newSponsor.name.trim()) return;
    setAddingNew(true);
    try {
      const maxOrder = sponsors.reduce((max, s) => Math.max(max, s.sort_order), 0);
      const insertData: Record<string, any> = {
        name: newSponsor.name.trim(),
        sponsor_type: newSponsor.sponsor_type,
        tier: 'bronze',
        description: newSponsor.description.trim() || null,
        website_url: newSponsor.website_url.trim() || null,
        sort_order: maxOrder + 1,
        is_active: true,
        facebook_url: socialToggles.facebook_url ? (newSponsor.facebook_url.trim() || null) : null,
        instagram_url: socialToggles.instagram_url ? (newSponsor.instagram_url.trim() || null) : null,
        youtube_url: socialToggles.youtube_url ? (newSponsor.youtube_url.trim() || null) : null,
        tiktok_url: socialToggles.tiktok_url ? (newSponsor.tiktok_url.trim() || null) : null,
      };
      const result = await supabase.from('sponsors').insert(insertData).select().single();
      if (result.error) throw result.error;
      setSponsors(prev => [...prev, normalizeSponsor(result.data)]);
      setShowAddModal(false);
      setNewSponsor({ name: '', sponsor_type: 'carshow', description: '', website_url: '', facebook_url: '', instagram_url: '', youtube_url: '', tiktok_url: '' });
      setSocialToggles({ facebook_url: false, instagram_url: false, youtube_url: false, tiktok_url: false });
      toast({ title: 'Sponsor Added', description: `${newSponsor.name} has been added. Click on the card to upload a logo.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add sponsor', variant: 'destructive' });
    } finally {
      setAddingNew(false);
    }
  };

  const addSocialPlatforms = [
    { key: 'facebook_url', label: 'Facebook', icon: Facebook, iconColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', toggleActive: 'bg-blue-600', placeholder: 'https://www.facebook.com/yourpage' },
    { key: 'instagram_url', label: 'Instagram', icon: Instagram, iconColor: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', toggleActive: 'bg-pink-600', placeholder: 'https://www.instagram.com/yourpage' },
    { key: 'youtube_url', label: 'YouTube', icon: Youtube, iconColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', toggleActive: 'bg-red-600', placeholder: 'https://www.youtube.com/@yourchannel' },
    { key: 'tiktok_url', label: 'TikTok', icon: TikTokIcon, iconColor: 'text-gray-900', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', toggleActive: 'bg-gray-900', placeholder: 'https://www.tiktok.com/@yourhandle' },
  ];

  if (checkingAuth) return <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center"><Loader2 size={32} className="text-[#FB50B1] animate-spin" /></div>;
  if (!isAuthenticated) return <AdminLoginGate onAuthenticated={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-gray-50/80 font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/car-show" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#9E065D] transition-colors">
                <ChevronLeft size={16} /> Back to Car Show
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 leading-none">Sponsor Admin</h1>
                  <p className="text-xs text-gray-500">Manage sponsors & logos</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {lastSaved && <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle size={12} /> Saved at {lastSaved}</span>}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setViewMode('cards')} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'cards' ? 'bg-white text-[#9E065D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutGrid size={13} /> Cards
                </button>
                <button onClick={() => setViewMode('table')} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-[#9E065D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Table2 size={13} /> Table
                </button>
              </div>
              <button onClick={fetchSponsors} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /><span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#9E065D] hover:bg-[#7D0348] rounded-lg transition-colors shadow-sm">
                <Plus size={14} /> <span className="hidden sm:inline">Add Sponsor</span>
              </button>
              {hasChanges && (
                <button onClick={handleSaveOrder} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Order
                </button>
              )}
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard size={24} className="text-[#9E065D]" />
            <h2 className="text-2xl font-bold text-gray-900">Sponsor Dashboard</h2>
          </div>
          <p className="text-gray-500 text-sm ml-9">Manage sponsor information, logos, and display order. Click any sponsor card to edit details including logo, description, website, and social media links.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to load sponsors</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <button onClick={fetchSponsors} className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline">Try again</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-[#9E065D] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading sponsor data...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <SponsorAdminStats sponsors={sponsors} />

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/car-show" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#FB50B1]/40 hover:text-[#9E065D] transition-all">
                <ExternalLink size={14} /> View Car Show Page
              </Link>
              {sponsors.filter(s => !s.logo_url).length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                  <Camera size={14} /> {sponsors.filter(s => !s.logo_url).length} sponsors need logos — click cards to upload
                </div>
              )}
            </div>

            <div id="sponsor-content">
              {viewMode === 'cards' ? (
                <SponsorAdminCards
                  sponsors={sponsors}
                  onUpdateSponsor={handleUpdateSponsor}
                  onDeleteSponsor={handleDeleteSponsor}
                  onReorder={handleReorder}
                  onLogoUploaded={handleLogoUploaded}
                />
              ) : (
                <SponsorAdminTable
                  sponsors={sponsors}
                  onReorder={handleReorder}
                  onUpdateSponsor={handleUpdateSponsor}
                  onBulkAction={handleBulkAction}
                />
              )}
            </div>

            {hasChanges && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-gray-900 text-white rounded-2xl px-6 py-3.5 shadow-2xl flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Unsaved order changes</span>
                  </div>
                  <button onClick={handleSaveOrder} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Now
                  </button>
                  <button onClick={() => { fetchSponsors(); setHasChanges(false); }} className="text-white/60 hover:text-white text-sm transition-colors">Discard</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center">
                  <Plus size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Add New Sponsor</h3>
                  <p className="text-xs text-gray-500">Fill in the details below</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sponsor Name <span className="text-red-500">*</span></label>
                <input type="text" value={newSponsor.name} onChange={e => setNewSponsor(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Acme Auto Parts" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all" autoFocus />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sponsor Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'primary', label: 'Primary Sponsor', activeCls: 'border-[#9E065D] bg-[#FEE6F4] text-[#9E065D] shadow-sm' },
                    { value: 'carshow', label: 'Car Show Sponsor', activeCls: 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' },
                    { value: 'both', label: 'Both', activeCls: 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm' },
                  ].map(t => (
                    <button key={t.value} onClick={() => setNewSponsor(prev => ({ ...prev, sponsor_type: t.value }))} className={`flex items-center justify-center px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${newSponsor.sponsor_type === t.value ? t.activeCls : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={newSponsor.description} onChange={e => setNewSponsor(prev => ({ ...prev, description: e.target.value }))} placeholder="Short description about the sponsor..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all resize-none" />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Globe size={14} className="text-[#9E065D]" /> Website
                </h4>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" value={newSponsor.website_url} onChange={e => setNewSponsor(prev => ({ ...prev, website_url: e.target.value }))} placeholder="https://example.com" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Social Media Links</h4>
                <p className="text-xs text-gray-500 mb-3">Toggle on the platforms this sponsor uses.</p>
                <div className="space-y-2.5">
                  {addSocialPlatforms.map(platform => {
                    const isEnabled = socialToggles[platform.key as keyof typeof socialToggles];
                    const PlatformIcon = platform.icon;
                    return (
                      <div key={platform.key} className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${isEnabled ? `${platform.borderColor} ${platform.bgColor}` : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none" onClick={() => setSocialToggles(prev => ({ ...prev, [platform.key]: !prev[platform.key as keyof typeof prev] }))}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEnabled ? platform.bgColor : 'bg-gray-100'}`}>
                              <PlatformIcon size={14} className={isEnabled ? platform.iconColor : 'text-gray-400'} />
                            </div>
                            <span className={`text-sm font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{platform.label}</span>
                          </div>
                          <div className={`relative rounded-full transition-all duration-300 ${isEnabled ? platform.toggleActive : 'bg-gray-300'}`} style={{ width: 40, height: 22 }}>
                            <div className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-md transition-all duration-300 ${isEnabled ? 'left-[19px]' : 'left-0.5'}`} />
                          </div>
                        </div>
                        {isEnabled && (
                          <div className="px-3 pb-2.5">
                            <div className="relative">
                              <PlatformIcon size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${platform.iconColor}`} />
                              <input type="url" value={(newSponsor as any)[platform.key]} onChange={e => setNewSponsor(prev => ({ ...prev, [platform.key]: e.target.value }))} placeholder={platform.placeholder} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all" onClick={e => e.stopPropagation()} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-800 font-medium">Logo Upload</p>
                  <p className="text-xs text-blue-600 mt-0.5">After adding the sponsor, click on their card to upload a logo and make further edits.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
              <button onClick={handleAddSponsor} disabled={!newSponsor.name.trim() || addingNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] text-white text-sm font-medium rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {addingNew ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Sponsor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorAdmin;
