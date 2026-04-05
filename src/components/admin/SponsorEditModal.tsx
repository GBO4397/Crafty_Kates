import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Save, Loader2, Camera, Crown, Trophy, Medal, Globe,
  Trash2, Upload, Check, AlertCircle, Image as ImageIcon,
  CheckCircle, XCircle, Facebook, Instagram, Youtube
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import SponsorImageCropper from '@/components/crafty/SponsorImageCropper';

// Custom TikTok icon (lucide doesn't have one)
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Sponsor {
  id: string;
  name: string;
  tier?: string;
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

interface SponsorEditModalProps {
  sponsor: Sponsor;
  onSave: (id: string, updates: Partial<Sponsor>) => void;
  onDelete: (id: string) => void;
  onLogoUploaded: (id: string, newLogoUrl: string) => void;
  onClose: () => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;


const tierOptions = [
  { value: 'gold', label: 'Gold', icon: Crown, cls: 'border-amber-400 bg-amber-50 text-amber-700', gradient: 'from-amber-400 to-yellow-500' },
  { value: 'silver', label: 'Silver', icon: Trophy, cls: 'border-slate-400 bg-slate-50 text-slate-700', gradient: 'from-slate-400 to-gray-500' },
  { value: 'bronze', label: 'Bronze', icon: Medal, cls: 'border-orange-400 bg-orange-50 text-orange-700', gradient: 'from-orange-400 to-amber-600' },
];

const getInitials = (name: string): string => {
  const words = name.replace(/[–—-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

const getNameColor = (name: string): string => {
  const colors = [
    'from-rose-500 to-pink-600', 'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600', 'from-cyan-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

type UploadStatus = 'idle' | 'cropping' | 'uploading' | 'success' | 'error';

// Social media platform config
const socialPlatforms = [
  {
    key: 'facebook_url' as const,
    label: 'Facebook',
    icon: Facebook,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    toggleActive: 'bg-blue-600',
    placeholder: 'https://www.facebook.com/yourpage',
  },
  {
    key: 'instagram_url' as const,
    label: 'Instagram',
    icon: Instagram,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    toggleActive: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
    placeholder: 'https://www.instagram.com/yourpage',
  },
  {
    key: 'youtube_url' as const,
    label: 'YouTube',
    icon: Youtube,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    toggleActive: 'bg-red-600',
    placeholder: 'https://www.youtube.com/@yourchannel',
  },
  {
    key: 'tiktok_url' as const,
    label: 'TikTok',
    icon: TikTokIcon,
    iconColor: 'text-gray-900',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    toggleActive: 'bg-gray-900',
    placeholder: 'https://www.tiktok.com/@yourhandle',
  },
];

const SponsorEditModal: React.FC<SponsorEditModalProps> = ({
  sponsor, onSave, onDelete, onLogoUploaded, onClose
}) => {
  // Form state
  const [name, setName] = useState(sponsor.name);
  const [description, setDescription] = useState(sponsor.description || '');
  const [websiteUrl, setWebsiteUrl] = useState(sponsor.website_url || '');
  const [tier, setTier] = useState(sponsor.tier || '');
  const [sponsorType, setSponsorType] = useState((sponsor as any).sponsor_type || 'carshow');
  const [isActive, setIsActive] = useState(sponsor.is_active);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Social media state with toggles
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    facebook_url: sponsor.facebook_url || '',
    instagram_url: sponsor.instagram_url || '',
    youtube_url: sponsor.youtube_url || '',
    tiktok_url: sponsor.tiktok_url || '',
  });
  const [socialEnabled, setSocialEnabled] = useState<Record<string, boolean>>({
    facebook_url: !!sponsor.facebook_url,
    instagram_url: !!sponsor.instagram_url,
    youtube_url: !!sponsor.youtube_url,
    tiktok_url: !!sponsor.tiktok_url,
  });

  // Logo upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'logo'>('details');

  const hasLogo = sponsor.logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [sponsor.logo_url]);

  const handleToggleSocial = (key: string) => {
    setSocialEnabled(prev => {
      const newEnabled = { ...prev, [key]: !prev[key] };
      // If turning off, clear the URL
      if (prev[key]) {
        setSocialLinks(prevLinks => ({ ...prevLinks, [key]: '' }));
      }
      return newEnabled;
    });
  };

  const handleSocialUrlChange = (key: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    const socialChanged = socialPlatforms.some(p => {
      const originalUrl = (sponsor as any)[p.key] || '';
      const currentUrl = socialEnabled[p.key] ? socialLinks[p.key] : '';
      return currentUrl !== originalUrl;
    });

    return (
      name.trim() !== sponsor.name ||
      (description.trim() || null) !== (sponsor.description || null) ||
      (websiteUrl.trim() || null) !== (sponsor.website_url || null) ||
      tier !== (sponsor.tier || '') || sponsorType !== ((sponsor as any).sponsor_type || 'carshow') ||
      isActive !== sponsor.is_active ||
      socialChanged
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    
    const updates: Partial<Sponsor> = {};
    if (name.trim() !== sponsor.name) updates.name = name.trim();
    if ((description.trim() || null) !== (sponsor.description || null)) updates.description = description.trim() || null;
    if ((websiteUrl.trim() || null) !== (sponsor.website_url || null)) updates.website_url = websiteUrl.trim() || null;
    if (tier !== sponsor.tier) updates.tier = tier;
    if (sponsorType !== ((sponsor as any).sponsor_type || 'carshow')) (updates as any).sponsor_type = sponsorType;
    if (isActive !== sponsor.is_active) updates.is_active = isActive;

    // Social media - save URL if enabled, null if disabled
    socialPlatforms.forEach(p => {
      const originalUrl = (sponsor as any)[p.key] || '';
      const currentUrl = socialEnabled[p.key] ? (socialLinks[p.key].trim() || null) : null;
      const originalNorm = originalUrl || null;
      if (currentUrl !== originalNorm) {
        (updates as any)[p.key] = currentUrl;
      }
    });

    if (Object.keys(updates).length > 0) {
      onSave(sponsor.id, updates);
    }
    setSaving(false);
    onClose();
  };

  // Logo upload handlers
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.';
    if (file.size > MAX_FILE_SIZE) return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`;
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      setUploadStatus('error');
      return;
    }
    setSelectedFile(file);
    setUploadError('');
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setUploadStatus('idle');
      };
      reader.readAsDataURL(file);
    } else {
      setUploadStatus('cropping');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  }, [handleFileSelect]);

  const handleCropComplete = (croppedDataUrl: string) => {
    setPreviewUrl(croppedDataUrl);
    setUploadStatus('idle');
  };

  const handleUploadLogo = async () => {
    if (!previewUrl) return;
    setUploadStatus('uploading');
    setUploadProgress(10);

    try {
      setUploadProgress(30);

      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          logo_url: previewUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sponsor.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setUploadProgress(100);
      setUploadStatus('success');
      onLogoUploaded(sponsor.id, previewUrl);

      setTimeout(() => {
        setUploadStatus('idle');
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
      }, 1500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
      setUploadStatus('error');
    }
  };


  const resetUploader = () => {
    setUploadStatus('idle');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const dims = { width: 300, height: 300 };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Logo thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                {hasLogo ? (
                  <img src={sponsor.logo_url!} alt="" className="w-full h-full object-contain p-1" onError={() => setImgError(true)} />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getNameColor(sponsor.name)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{getInitials(sponsor.name)}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">Edit Sponsor</h3>
                <p className="text-xs text-gray-500">{sponsor.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#9E065D] text-[#9E065D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Sponsor Details
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logo' ? 'border-[#9E065D] text-[#9E065D]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Camera size={14} />
              Logo
              {!hasLogo && (
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">MISSING</span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === 'details' ? (
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Sponsor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Acme Auto Parts"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short description about the sponsor..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all resize-none"
                  />
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sponsor Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'primary', label: 'Primary Sponsor', cls: 'border-[#9E065D] bg-[#FEE6F4] text-[#9E065D]' },
                      { value: 'carshow', label: 'Car Show Sponsor', cls: 'border-blue-400 bg-blue-50 text-blue-700' },
                      { value: 'both', label: 'Both', cls: 'border-purple-400 bg-purple-50 text-purple-700' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSponsorType(t.value)}
                        className={`flex items-center justify-center px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${sponsorType === t.value ? t.cls + ' shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsActive(true)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${isActive ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <CheckCircle size={16} /> Active
                    </button>
                    <button
                      onClick={() => setIsActive(false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${!isActive ? 'border-gray-400 bg-gray-50 text-gray-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <XCircle size={16} /> Inactive
                    </button>
                  </div>
                </div>

                {/* Website URL */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={16} className="text-[#9E065D]" />
                    Website
                  </h4>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all"
                    />
                  </div>
                </div>

                {/* Social Media Links with Toggles */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-[#9E065D]">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    Social Media Links
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">Toggle each platform on or off based on the sponsor's social media presence.</p>

                  <div className="space-y-3">
                    {socialPlatforms.map(platform => {
                      const isEnabled = socialEnabled[platform.key];
                      const PlatformIcon = platform.icon;

                      return (
                        <div
                          key={platform.key}
                          className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                            isEnabled
                              ? `${platform.borderColor} ${platform.bgColor}`
                              : 'border-gray-100 bg-gray-50/50'
                          }`}
                        >
                          {/* Toggle Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                            onClick={() => handleToggleSocial(platform.key)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isEnabled ? `${platform.bgColor}` : 'bg-gray-100'
                              }`}>
                                <PlatformIcon size={16} className={isEnabled ? platform.iconColor : 'text-gray-400'} />
                              </div>
                              <div>
                                <span className={`text-sm font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {platform.label}
                                </span>
                                {!isEnabled && (
                                  <p className="text-xs text-gray-400">Click to enable</p>
                                )}
                              </div>
                            </div>

                            {/* Toggle Switch */}
                            <div
                              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                                isEnabled ? platform.toggleActive : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                                  isEnabled ? 'left-[22px]' : 'left-0.5'
                                }`}
                              />
                            </div>
                          </div>

                          {/* URL Input (shown when enabled) */}
                          {isEnabled && (
                            <div className="px-4 pb-3">
                              <div className="relative">
                                <PlatformIcon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${platform.iconColor}`} />
                                <input
                                  type="url"
                                  value={socialLinks[platform.key]}
                                  onChange={e => handleSocialUrlChange(platform.key, e.target.value)}
                                  placeholder={platform.placeholder}
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                              {socialLinks[platform.key] && (
                                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                                  <Check size={10} className="text-emerald-500" />
                                  <span className="text-xs text-emerald-600 font-medium">Link added</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete Section */}
                <div className="border-t border-gray-100 pt-5">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} /> Delete this sponsor
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-800 mb-1">Are you sure?</p>
                      <p className="text-xs text-red-600 mb-3">This will permanently delete <strong>{sponsor.name}</strong> and their logo. This cannot be undone.</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { onDelete(sponsor.id); onClose(); }}
                          className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Logo Tab */
              <div className="space-y-5">
                {/* Current Logo Display */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Logo</label>
                  <div className="relative w-full aspect-[4/3] max-w-sm mx-auto rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                    {hasLogo ? (
                      <img
                        src={sponsor.logo_url!}
                        alt={`${sponsor.name} logo`}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getNameColor(sponsor.name)} flex flex-col items-center justify-center gap-2`}>
                        <span className="text-4xl font-bold text-white tracking-wider">{getInitials(sponsor.name)}</span>
                        <span className="text-white/70 text-sm font-medium">No logo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Area */}
                {uploadStatus === 'idle' && !previewUrl && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {hasLogo ? 'Replace Logo' : 'Upload Logo'}
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${isDragOver ? 'border-[#FB50B1] bg-[#FEE6F4]/30 scale-[1.01]' : 'border-gray-200 hover:border-[#FB50B1]/50 hover:bg-[#FEE6F4]/10'}`}
                    >
                      <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} className="hidden" />
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all ${isDragOver ? 'bg-[#FB50B1] text-white scale-110' : 'bg-[#FEE6F4] text-[#9E065D] group-hover:bg-[#FB50B1] group-hover:text-white group-hover:scale-110'}`}>
                        <Upload size={24} />
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">{isDragOver ? 'Drop your logo here!' : 'Click or drag to upload'}</p>
                      <p className="text-gray-400 text-sm mb-2">PNG, JPG, SVG, or WebP — Max 5MB</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ImageIcon size={12} />
                        <span>Recommended: {dims.width} x {dims.height}px</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview after crop/select */}
                {uploadStatus === 'idle' && previewUrl && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Preview — Ready to Upload</label>
                    <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-center p-4" style={{ minHeight: 160 }}>
                        <img src={previewUrl} alt="Logo preview" className="max-w-full max-h-48 object-contain rounded-lg" />
                      </div>
                      <button onClick={resetUploader} className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                      <span className="text-green-500 flex items-center gap-1"><Check size={10} /> Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={resetUploader} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleUploadLogo} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#9E065D] to-[#7D0348] rounded-xl hover:from-[#FB50B1] hover:to-[#9E065D] transition-all shadow-lg shadow-[#9E065D]/20">
                        <Upload size={16} /> Upload Logo
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploading */}
                {uploadStatus === 'uploading' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#FB50B1" strokeWidth="4" strokeDasharray={`${uploadProgress * 1.76} 176`} strokeLinecap="round" className="transition-all duration-300" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#9E065D]">{uploadProgress}%</span>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">Uploading logo...</p>
                    <p className="text-gray-400 text-sm mt-1">Optimizing and saving</p>
                  </div>
                )}

                {/* Success */}
                {uploadStatus === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <p className="font-semibold text-gray-800">Logo uploaded successfully!</p>
                    <p className="text-gray-400 text-sm mt-1">The logo has been updated.</p>
                  </div>
                )}

                {/* Error */}
                {uploadStatus === 'error' && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                      <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">Upload Failed</p>
                    <p className="text-red-500 text-sm mb-4 max-w-xs mx-auto">{uploadError}</p>
                    <button onClick={resetUploader} className="text-sm text-[#9E065D] hover:text-[#FB50B1] font-medium underline transition-colors">
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {hasChanges() && (
                <span className="text-xs text-amber-600 font-medium mr-2">Unsaved changes</span>
              )}
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving || !hasChanges()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-[#9E065D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {uploadStatus === 'cropping' && selectedFile && (
        <SponsorImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={resetUploader}
          targetWidth={dims.width}
          targetHeight={dims.height}
        />
      )}
    </>
  );
};

export default SponsorEditModal;
