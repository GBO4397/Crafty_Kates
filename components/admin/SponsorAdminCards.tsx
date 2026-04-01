import React, { useState, useEffect } from 'react';
import {
  Crown, Trophy, Medal, Camera, ExternalLink, Globe,
  CheckCircle, XCircle, Pencil, Trash2, X, Check,
  ArrowUp, ArrowDown, Image, ImageOff, Facebook, Instagram, Youtube
} from 'lucide-react';
import SponsorEditModal from '@/components/admin/SponsorEditModal';

// Custom TikTok icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 11, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Sponsor {
  id: string;
  name: string;
  tier: string;
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

interface SponsorAdminCardsProps {
  sponsors: Sponsor[];
  onUpdateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  onDeleteSponsor: (id: string) => void;
  onReorder: (sponsors: Sponsor[]) => void;
  onLogoUploaded: (id: string, newLogoUrl: string) => void;
}

const tierConfig: Record<string, {
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  activeBorder: string;
  textColor: string;
  badgeBg: string;
}> = {
  gold: {
    label: 'Gold',
    icon: Crown,
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    activeBorder: 'border-amber-400',
    textColor: 'text-amber-700',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
  },
  silver: {
    label: 'Silver',
    icon: Trophy,
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    bgGradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200',
    activeBorder: 'border-slate-400',
    textColor: 'text-slate-700',
    badgeBg: 'bg-gradient-to-r from-slate-400 to-gray-500',
  },
  bronze: {
    label: 'Bronze',
    icon: Medal,
    gradient: 'from-orange-400 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    activeBorder: 'border-orange-400',
    textColor: 'text-orange-800',
    badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-600',
  },
};

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

/* ─── Individual Sponsor Card ─── */
interface SponsorCardProps {
  sponsor: Sponsor;
  index: number;
  totalCount: number;
  onEditClick: (sponsor: Sponsor) => void;
  onUpdate: (id: string, updates: Partial<Sponsor>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const SponsorCard: React.FC<SponsorCardProps> = ({
  sponsor, index, totalCount, onEditClick, onUpdate, onMoveUp, onMoveDown
}) => {
  const [imgError, setImgError] = useState(false);

  const config = tierConfig[sponsor.tier] || tierConfig.bronze;
  const TierIcon = config.icon;
  const hasLogo = sponsor.logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [sponsor.logo_url]);

  const hasSocialLinks = sponsor.facebook_url || sponsor.instagram_url || sponsor.youtube_url || sponsor.tiktok_url;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg cursor-pointer group ${sponsor.is_active ? config.borderColor : 'border-gray-200 opacity-70'}`}
      onClick={() => onEditClick(sponsor)}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

      {/* Card Header: Tier badge + controls */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {/* Tier Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.badgeBg} text-white shadow-sm`}>
          <TierIcon size={11} />
          {config.label}
        </div>

        {/* Controls - stop propagation so they don't trigger edit modal */}
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onMoveUp(sponsor.id)}
            disabled={index === 0}
            className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            onClick={() => onMoveDown(sponsor.id)}
            disabled={index === totalCount - 1}
            className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ArrowDown size={13} />
          </button>
          <div className="w-px h-4 bg-gray-100 mx-0.5" />
          <button
            onClick={() => onUpdate(sponsor.id, { is_active: !sponsor.is_active })}
            className={`p-1 rounded-lg transition-colors ${sponsor.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
            title={sponsor.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
          >
            {sponsor.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
          </button>
        </div>
      </div>

      {/* Logo Area */}
      <div className="px-4 py-2">
        <div className="relative">
          <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed ${hasLogo ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-gray-100'} flex items-center justify-center transition-all`}>
            {hasLogo ? (
              <img
                src={sponsor.logo_url!}
                alt={`${sponsor.name} logo`}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getNameColor(sponsor.name)} flex flex-col items-center justify-center gap-2`}>
                <span className="text-3xl font-bold text-white tracking-wider">
                  {getInitials(sponsor.name)}
                </span>
                <span className="text-white/70 text-xs font-medium">No logo uploaded</span>
              </div>
            )}

            {/* Edit overlay on hover */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
              <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
                <Pencil size={20} className="text-[#9E065D]" />
              </div>
              <span className="text-white text-sm font-semibold drop-shadow-md">
                Click to Edit
              </span>
            </div>
          </div>

          {/* Logo status badge */}
          <div className="absolute top-2 right-2">
            {hasLogo ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-sm">
                <Image size={10} /> Logo
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-sm">
                <ImageOff size={10} /> Missing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sponsor Info */}
      <div className="px-4 pb-4">
        <h3 className="text-base font-bold text-gray-900 mb-0.5 leading-tight truncate">{sponsor.name}</h3>
        {sponsor.description ? (
          <p className="text-sm text-gray-500 mb-2 leading-relaxed line-clamp-2">{sponsor.description}</p>
        ) : (
          <p className="text-xs text-gray-400 italic mb-2">No description</p>
        )}

        {/* Links Row */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {sponsor.website_url && (
            <span className="inline-flex items-center gap-1 text-xs text-[#9E065D] font-medium">
              <Globe size={11} />
              <span className="truncate max-w-[120px]">{sponsor.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </span>
          )}
          {sponsor.facebook_url && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600" title="Facebook">
              <Facebook size={11} />
            </span>
          )}
          {sponsor.instagram_url && (
            <span className="inline-flex items-center gap-1 text-xs text-pink-600" title="Instagram">
              <Instagram size={11} />
            </span>
          )}
          {sponsor.youtube_url && (
            <span className="inline-flex items-center gap-1 text-xs text-red-600" title="YouTube">
              <Youtube size={11} />
            </span>
          )}
          {sponsor.tiktok_url && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-900" title="TikTok">
              <TikTokIcon size={11} />
            </span>
          )}
          {!sponsor.website_url && !hasSocialLinks && (
            <span className="text-xs text-gray-400 italic">No links added</span>
          )}
        </div>

        {/* Quick info row */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Order: <span className="font-mono font-semibold text-gray-600">{sponsor.sort_order}</span>
          </span>
          <span className={`text-xs font-medium ${sponsor.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
            {sponsor.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(sponsor.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Cards Grid ─── */
const SponsorAdminCards: React.FC<SponsorAdminCardsProps> = ({
  sponsors, onUpdateSponsor, onDeleteSponsor, onReorder, onLogoUploaded
}) => {
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');

  const handleMoveUp = (id: string) => {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx <= 0) return;
    const newOrder = [...sponsors];
    [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
    onReorder(newOrder.map((s, i) => ({ ...s, sort_order: i + 1 })));
  };

  const handleMoveDown = (id: string) => {
    const idx = sponsors.findIndex(s => s.id === id);
    if (idx === -1 || idx >= sponsors.length - 1) return;
    const newOrder = [...sponsors];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onReorder(newOrder.map((s, i) => ({ ...s, sort_order: i + 1 })));
  };

  const handleEditClick = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
  };

  // Keep editing sponsor in sync with parent state
  useEffect(() => {
    if (editingSponsor) {
      const updated = sponsors.find(s => s.id === editingSponsor.id);
      if (updated) setEditingSponsor(updated);
    }
  }, [sponsors]);

  // Filter sponsors
  let filtered = [...sponsors];
  if (filterTier !== 'all') filtered = filtered.filter(s => s.tier === filterTier);

  // Group by tier
  const goldSponsors = filtered.filter(s => s.tier === 'gold');
  const silverSponsors = filtered.filter(s => s.tier === 'silver');
  const bronzeSponsors = filtered.filter(s => s.tier === 'bronze');

  const renderTierGroup = (tier: string, tierSponsors: Sponsor[]) => {
    if (tierSponsors.length === 0) return null;
    const tc = tierConfig[tier];
    const TIcon = tc.icon;

    return (
      <div key={tier} className="mb-10 last:mb-0">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-9 h-9 bg-gradient-to-br ${tc.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
            <TIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${tc.textColor}`}>{tc.label} Sponsors</h3>
            <p className="text-xs text-gray-400">{tierSponsors.length} sponsor{tierSponsors.length !== 1 ? 's' : ''} — {tierSponsors.filter(s => s.logo_url).length} with logos</p>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tierSponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              index={sponsors.indexOf(sponsor)}
              totalCount={sponsors.length}
              onEditClick={handleEditClick}
              onUpdate={onUpdateSponsor}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">View:</span>
          {[
            { key: 'all', label: 'All Tiers', count: sponsors.length },
            { key: 'gold', label: 'Gold', count: sponsors.filter(s => s.tier === 'gold').length, icon: Crown },
            { key: 'silver', label: 'Silver', count: sponsors.filter(s => s.tier === 'silver').length, icon: Trophy },
            { key: 'bronze', label: 'Bronze', count: sponsors.filter(s => s.tier === 'bronze').length, icon: Medal },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilterTier(btn.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterTier === btn.key
                  ? 'bg-[#9E065D] text-white border-[#9E065D] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {btn.icon && <btn.icon size={12} />}
              {btn.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filterTier === btn.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Image size={12} className="text-emerald-500" />
            {sponsors.filter(s => s.logo_url).length} logos
          </span>
          <span className="flex items-center gap-1">
            <ImageOff size={12} className="text-rose-400" />
            {sponsors.filter(s => !s.logo_url).length} missing
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <Pencil size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Click any sponsor card</strong> to edit their details, upload/change their logo, add description, website URL, and social media links (Facebook, Instagram, YouTube, TikTok).
        </p>
      </div>

      {/* Cards by Tier */}
      {filterTier === 'all' ? (
        <>
          {renderTierGroup('gold', goldSponsors)}
          {renderTierGroup('silver', silverSponsors)}
          {renderTierGroup('bronze', bronzeSponsors)}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              index={sponsors.indexOf(sponsor)}
              totalCount={sponsors.length}
              onEditClick={handleEditClick}
              onUpdate={onUpdateSponsor}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ImageOff size={28} />
          </div>
          <p className="text-sm font-medium">No sponsors found</p>
          <p className="text-xs mt-1">Try a different filter or add a new sponsor</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingSponsor && (
        <SponsorEditModal
          sponsor={editingSponsor}
          onSave={onUpdateSponsor}
          onDelete={onDeleteSponsor}
          onLogoUploaded={onLogoUploaded}
          onClose={() => setEditingSponsor(null)}
        />
      )}
    </div>
  );
};

export default SponsorAdminCards;
