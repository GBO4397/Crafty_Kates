import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft, RefreshCw, Shield, LayoutDashboard,
  CheckCircle, AlertCircle, Loader2, Lock, LogOut, Eye, EyeOff,
  Image as ImageIcon, ImageOff, Camera, Layers, FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageAdminCard from '@/components/admin/ImageAdminCard';
import GalleryAdminSection from '@/components/admin/GalleryAdminSection';
import type { SiteImageSlot } from '@/components/admin/ImageAdminCard';

// ─── Shared Admin Password (same as Sponsor Admin) ──────────────
// This password is checked client-side as a primary gate.
// For production, use an environment variable or edge function.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;

// Generate a simple token for session persistence
function generateToken(): string {
  return btoa(Date.now().toString(36) + Math.random().toString(36).slice(2));
}

// ─── Admin Login Gate ────────────────────────────────────────────
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
      // Try edge function first (if deployed)
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        body: { password, action: 'login' },
      });

      if (!fnError && data?.success) {
        localStorage.setItem('ck_admin_token', data.token);
        localStorage.setItem('ck_admin_expires', data.expiresAt);
        onAuthenticated();
        return;
      }
    } catch (_) {
      // Edge function not available — fall through to client-side check
    }

    // Client-side password check (fallback)
    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9E065D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FB50B1]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9E065D]/30">
              <ImageIcon size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Image Manager</h1>
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
                  className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1]/50 transition-all text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
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

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#9E065D]/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            Protected area — authorized personnel only
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/30 hover:text-white/50 text-xs transition-colors">
            Crafty Kates Promotions
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Image Section Categories ────────────────────────────────────
const SITE_SECTIONS = [
  {
    title: 'Branding',
    description: 'Site logo and identity',
    icon: Layers,
    slots: ['logo'],
  },
  {
    title: 'Hero Section',
    description: 'Main homepage hero area',
    icon: ImageIcon,
    slots: ['hero-background', 'hero-license-plate'],
  },
  {
    title: 'About Section',
    description: 'Katherine\'s portrait and about content',
    icon: Camera,
    slots: ['about-portrait'],
  },
  {
    title: 'Events Section',
    description: 'Event feature images',
    icon: Camera,
    slots: ['events-car-show'],
  },
  {
    title: 'Motto Section',
    description: 'Background for the motto/quote area',
    icon: ImageIcon,
    slots: ['motto-background'],
  },
  {
    title: 'Community Section',
    description: 'Community partner images',
    icon: Camera,
    slots: ['community-animal-shelter', 'community-almost-eden'],
  },
  {
    title: 'Car Show Page',
    description: 'Images for the car show detail page',
    icon: FolderOpen,
    slots: ['car-show-hero-bg', 'car-show-classic-cars', 'car-show-registration-hero'],
  },
];

// ─── Main ImageAdmin Page ────────────────────────────────────────
const ImageAdmin: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [images, setImages] = useState<SiteImageSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'site' | 'gallery'>('site');
  const { toast } = useToast();

  // Check existing session on mount
  useEffect(() => {
    if (embedded) {
      setIsAuthenticated(true);
      setCheckingAuth(false);
      return;
    }
    const token = localStorage.getItem('ck_admin_token');
    const expires = localStorage.getItem('ck_admin_expires');
    if (token && expires && new Date(expires) > new Date()) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, [embedded]);

  const handleLogout = () => {
    localStorage.removeItem('ck_admin_token');
    localStorage.removeItem('ck_admin_expires');
    setIsAuthenticated(false);
    supabase.functions.invoke('verify-admin', { body: { action: 'logout' } }).catch(() => {});
  };

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('site_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setImages(data || []);
    } catch (err: any) {
      console.error('Fetch images error:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchImages();
  }, [isAuthenticated, fetchImages]);

  const handleImageUpdated = useCallback((slotKey: string, newUrl: string) => {

    setImages(prev => prev.map(img =>
      img.slot_key === slotKey && img.category === 'site'
        ? { ...img, image_url: newUrl, updated_at: new Date().toISOString() }
        : img
    ));
    toast({ title: 'Image Updated', description: `${slotKey} has been uploaded successfully` });
  }, [toast]);

  const handleImageRemoved = useCallback((slotKey: string) => {
    setImages(prev => prev.map(img =>
      img.slot_key === slotKey && img.category === 'site'
        ? { ...img, image_url: null, updated_at: new Date().toISOString() }
        : img
    ));
    toast({ title: 'Image Removed', description: `${slotKey} has been removed` });
  }, [toast]);

  // Stats
  const siteImages = images.filter(img => img.category === 'site');
  const uploadedCount = siteImages.filter(img => img.image_url).length;
  const totalSiteSlots = siteImages.length;
  const benRadatzCount = images.filter(img => img.category === 'gallery-ben-radatz' && img.image_url).length;
  const wallinCount = images.filter(img => img.category === 'gallery-wallin' && img.image_url).length;

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center">
        <Loader2 size={32} className="text-[#FB50B1] animate-spin" />
      </div>
    );
  }

  // Show login gate if not authenticated
  if (!isAuthenticated) {
    return <AdminLoginGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/80 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#9E065D] transition-colors">
                <ChevronLeft size={16} /> Back to Site
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-200" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center">
                  <ImageIcon size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 leading-none">Image Manager</h1>
                  <p className="text-xs text-gray-500">Upload & manage site images</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/sponsor-admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-[#9E065D] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Shield size={14} /> <span className="hidden sm:inline">Sponsors</span>
              </Link>
              <button onClick={fetchImages} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sign out">
                <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard size={24} className="text-[#9E065D]" />
            <h2 className="text-2xl font-bold text-gray-900">Image Manager</h2>
          </div>
          <p className="text-gray-500 text-sm ml-9">
            Upload and manage all images used across the website. Click on any image card or drag & drop files to upload.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon size={14} className="text-[#9E065D]" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Site Images</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{uploadedCount}</span>
              <span className="text-sm text-gray-400">/ {totalSiteSlots}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {uploadedCount === totalSiteSlots && totalSiteSlots > 0 ? (
                <CheckCircle size={14} className="text-emerald-500" />
              ) : (
                <ImageOff size={14} className="text-amber-500" />
              )}
              <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
            </div>
            <span className={`text-sm font-semibold ${uploadedCount === totalSiteSlots && totalSiteSlots > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalSiteSlots === 0 ? 'Loading...' : uploadedCount === totalSiteSlots ? 'All Uploaded' : `${totalSiteSlots - uploadedCount} Missing`}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Camera size={14} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Ben Radatz</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{benRadatzCount}</span>
            <span className="text-sm text-gray-400 ml-1">photos</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Camera size={14} className="text-purple-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">K. Mikael Wallin</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{wallinCount}</span>
            <span className="text-sm text-gray-400 ml-1">photos</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to load images</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <button onClick={fetchImages} className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline">Try again</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-[#9E065D] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading images...</p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
              <button
                onClick={() => setActiveTab('site')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'site'
                    ? 'bg-white text-[#9E065D] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layers size={15} />
                Site Images
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'site' ? 'bg-[#FEE6F4] text-[#9E065D]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {uploadedCount}/{totalSiteSlots}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-white text-[#9E065D] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Camera size={15} />
                Photo Galleries
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'gallery' ? 'bg-[#FEE6F4] text-[#9E065D]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {benRadatzCount + wallinCount}
                </span>
              </button>
            </div>

            {/* Site Images Tab */}
            {activeTab === 'site' && (
              <div className="space-y-10">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-start gap-3">
                  <Camera size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">How to upload images</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Click on any image card or drag & drop a file onto it to upload. Images are saved immediately.
                      Supported formats: PNG, JPG, SVG, WebP (max 10MB). Each slot represents a specific location on the website.
                    </p>
                  </div>
                </div>

                {SITE_SECTIONS.map(section => {
                  const sectionImages = section.slots
                    .map(slotKey => siteImages.find(img => img.slot_key === slotKey))
                    .filter(Boolean) as SiteImageSlot[];

                  if (sectionImages.length === 0) return null;

                  const SectionIcon = section.icon;
                  const uploadedInSection = sectionImages.filter(img => img.image_url).length;

                  return (
                    <div key={section.title}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center shadow-sm">
                          <SectionIcon size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{section.title}</h3>
                          <p className="text-xs text-gray-500">
                            {section.description} — {uploadedInSection}/{sectionImages.length} uploaded
                          </p>
                        </div>
                        <div className="flex-1 h-px bg-gray-100" />
                        {uploadedInSection === sectionImages.length ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle size={12} /> Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <ImageOff size={12} /> {sectionImages.length - uploadedInSection} missing
                          </span>
                        )}
                      </div>

                      <div className={`grid gap-5 ${
                        sectionImages.length === 1
                          ? 'grid-cols-1 max-w-md'
                          : sectionImages.length === 2
                            ? 'grid-cols-1 sm:grid-cols-2'
                            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {sectionImages.map(img => (
                          <ImageAdminCard
                            key={img.id}
                            image={img}
                            onImageUpdated={handleImageUpdated}
                            onImageRemoved={handleImageRemoved}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-start gap-3">
                  <Camera size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Gallery Photo Upload</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Upload multiple photos at once by dragging & dropping or clicking "Add Photos". 
                      You can select multiple files at once. Photos will appear in the gallery pages automatically.
                    </p>
                  </div>
                </div>

                <GalleryAdminSection
                  title="Ben Radatz Photography"
                  category="gallery-ben-radatz"
                  images={images}
                  onImagesUpdated={fetchImages}
                />

                <GalleryAdminSection
                  title="K. Mikael Wallin Photography"
                  category="gallery-wallin"
                  images={images}
                  onImagesUpdated={fetchImages}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ImageAdmin;
