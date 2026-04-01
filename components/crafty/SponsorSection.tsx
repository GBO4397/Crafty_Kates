import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ExternalLink, Award, Trophy, Medal, ChevronRight, Crown,
  Globe, Facebook, Instagram, Youtube
} from 'lucide-react';
import { sponsorDirectory, findSponsor, getSponsorLink } from '@/data/sponsorData';

// Custom TikTok icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Sponsor {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze';
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  sort_order: number;
}

// Normalize sponsor data from DB, enriching with directory data if logo is missing
function normalizeSponsor(data: any): Sponsor {
  const dirMatch = findSponsor(data.name || '');
  return {
    id: data.id,
    name: data.name || '',
    tier: data.tier || 'bronze',
    logo_url: data.logo_url || (dirMatch?.logo_url ?? null),
    website_url: data.website_url || (dirMatch?.website_url ?? null),
    description: data.description || (dirMatch?.description ?? null),
    facebook_url: data.facebook_url ?? (dirMatch?.facebook_url ?? null),
    instagram_url: data.instagram_url ?? (dirMatch?.instagram_url ?? null),
    youtube_url: data.youtube_url ?? (dirMatch?.youtube_url ?? null),
    tiktok_url: data.tiktok_url ?? (dirMatch?.tiktok_url ?? null),
    sort_order: data.sort_order ?? 0,
  };
}

// Fallback data — actual sponsors from the Classic Burger Car Show
const fallbackSponsors: Sponsor[] = [
  { id: '1', name: 'Classic Burgers', tier: 'gold', logo_url: null, website_url: 'https://www.facebook.com/ClassicBurgersRidgecrest/', description: 'Title Sponsor & Venue Host', facebook_url: 'https://www.facebook.com/ClassicBurgersRidgecrest/', instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 1 },
  { id: '2', name: 'Gary Charlon - State Farm Ridgecrest', tier: 'gold', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/State-farm-insurance-logo.svg/500px-State-farm-insurance-logo.svg.png', website_url: 'https://www.statefarm.com/agent/us/ca/ridgecrest/gary-charlon-gylbh1ys000', description: 'Like a Good Neighbor', facebook_url: null, instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 2 },
  { id: '3', name: 'Rods West', tier: 'silver', logo_url: null, website_url: 'https://www.facebook.com/profile.php?id=100063605474498', description: 'Hot Rod Parts & Accessories', facebook_url: 'https://www.facebook.com/profile.php?id=100063605474498', instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 3 },
  { id: '4', name: 'Cheater Slick Culture', tier: 'silver', logo_url: null, website_url: 'https://www.instagram.com/cheaterslickculture/', description: 'Drag Racing Culture & Apparel', facebook_url: null, instagram_url: 'https://www.instagram.com/cheaterslickculture/', youtube_url: null, tiktok_url: null, sort_order: 4 },
  { id: '5', name: 'Viking Motorcycle Luggage', tier: 'silver', logo_url: 'https://www.vikingbags.com/media/logo/stores/1/viking-bags-logo.png', website_url: 'https://www.vikingbags.com/', description: 'Premium Motorcycle Bags & Luggage', facebook_url: null, instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 5 },
  { id: '6', name: 'Kings of the Sport', tier: 'bronze', logo_url: null, website_url: null, description: 'Celebrating Racing Legends', facebook_url: null, instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 6 },
  { id: '7', name: 'Isky Racing Cams', tier: 'silver', logo_url: 'https://iskycams.com/wp-content/uploads/2020/07/isky-logo-2020.png', website_url: 'https://iskycams.com/', description: 'The Camfather — Ed Iskenderian', facebook_url: 'https://www.facebook.com/IskyRacingCams/', instagram_url: null, youtube_url: null, tiktok_url: null, sort_order: 7 },
  { id: '8', name: 'NITRO SLAMDANCE', tier: 'bronze', logo_url: null, website_url: 'https://www.instagram.com/nitroslamdance/', description: 'High-Octane Nostalgia Racing', facebook_url: null, instagram_url: 'https://www.instagram.com/nitroslamdance/', youtube_url: null, tiktok_url: null, sort_order: 8 },
];

const tierConfig = {
  gold: {
    label: 'Gold Sponsors',
    sublabel: 'Title Partners',
    icon: Crown,
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    textColor: 'text-amber-700',
    accentColor: 'text-amber-600',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    shadowColor: 'hover:shadow-amber-200/50',
  },
  silver: {
    label: 'Silver Sponsors',
    sublabel: 'Premium Partners',
    icon: Trophy,
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    bgGradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    textColor: 'text-slate-700',
    accentColor: 'text-slate-500',
    badgeBg: 'bg-gradient-to-r from-slate-400 to-gray-500',
    shadowColor: 'hover:shadow-slate-200/50',
  },
  bronze: {
    label: 'Bronze Sponsors',
    sublabel: 'Community Supporters',
    icon: Medal,
    gradient: 'from-orange-400 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    textColor: 'text-orange-800',
    accentColor: 'text-orange-600',
    badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-600',
    shadowColor: 'hover:shadow-orange-200/50',
  },
};

const getNameColor = (name: string): string => {
  const colors = [
    'from-rose-600 to-pink-700', 'from-violet-600 to-purple-700',
    'from-blue-600 to-indigo-700', 'from-emerald-600 to-teal-700',
    'from-orange-600 to-red-700', 'from-cyan-600 to-blue-700',
    'from-fuchsia-600 to-pink-700', 'from-amber-600 to-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/* ─── Social Media Icons Row ─── */
const SocialLinks: React.FC<{ sponsor: Sponsor; size?: 'sm' | 'md' }> = ({ sponsor, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const btnCls = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-lg';

  const links = [
    { url: sponsor.website_url, icon: Globe, label: 'Website', hoverBg: 'hover:bg-[#FEE6F4] hover:text-[#9E065D]' },
    { url: sponsor.facebook_url, icon: Facebook, label: 'Facebook', hoverBg: 'hover:bg-blue-50 hover:text-blue-600' },
    { url: sponsor.instagram_url, icon: Instagram, label: 'Instagram', hoverBg: 'hover:bg-pink-50 hover:text-pink-600' },
    { url: sponsor.youtube_url, icon: Youtube, label: 'YouTube', hoverBg: 'hover:bg-red-50 hover:text-red-600' },
    { url: sponsor.tiktok_url, icon: TikTokIcon, label: 'TikTok', hoverBg: 'hover:bg-gray-100 hover:text-gray-900' },
  ].filter(l => l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-3">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnCls} flex items-center justify-center bg-gray-100 text-gray-400 ${link.hoverBg} transition-all duration-300 group-hover:bg-gray-100`}
          title={link.label}
          onClick={e => e.stopPropagation()}
        >
          <link.icon size={iconSize} />
        </a>
      ))}
    </div>
  );
};

/* ─── Sponsor Card ─── */
interface SponsorCardProps {
  sponsor: Sponsor;
  tier: 'gold' | 'silver' | 'bronze';
}

const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, tier }) => {
  const config = tierConfig[tier];
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasLogo = sponsor.logo_url && !imgError;
  const isGold = tier === 'gold';
  const isSilver = tier === 'silver';

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [sponsor.logo_url]);

  const primaryLink = sponsor.website_url || sponsor.facebook_url || sponsor.instagram_url || sponsor.youtube_url || sponsor.tiktok_url;

  const logoArea = (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl mb-4 ${isGold ? 'w-full max-w-[280px] h-36 sm:h-44' : isSilver ? 'w-full max-w-[220px] h-28 sm:h-32' : 'w-full max-w-[180px] h-24 sm:h-28'}`}>
      {hasLogo ? (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
          )}
          <img
            src={sponsor.logo_url!}
            alt={`${sponsor.name} logo`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain p-3 transition-all duration-700 ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      ) : (
        /* Branded name card — shows full sponsor name, not just initials */
        <div className={`w-full h-full bg-gradient-to-br ${getNameColor(sponsor.name)} rounded-xl flex flex-col items-center justify-center px-4 py-3 transition-all duration-700 ease-out group-hover:scale-105`}>
          <span className={`font-heading text-white tracking-wider text-center leading-tight ${isGold ? 'text-lg sm:text-xl' : isSilver ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
            {sponsor.name.toUpperCase()}
          </span>
          {sponsor.description && (
            <span className={`text-white/60 mt-1.5 text-center leading-tight ${isGold ? 'text-xs' : 'text-[10px]'}`}>
              {sponsor.description}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const cardContent = (
    <div className={`relative group bg-white rounded-2xl border-2 transition-all duration-500 overflow-hidden ${config.borderColor} ${config.hoverBorder} ${config.shadowColor} hover:shadow-xl hover:-translate-y-1 ${isGold ? 'p-8 sm:p-10' : isSilver ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}`}>
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Tier ribbon for gold */}
      {isGold && (
        <div className={`absolute top-0 right-0 bg-gradient-to-l ${config.gradient} text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md`}>
          <div className="flex items-center gap-1"><Crown size={12} /> TITLE SPONSOR</div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {logoArea}

        <h3 className={`font-bold text-gray-900 group-hover:text-[#9E065D] transition-colors duration-300 ${isGold ? 'text-xl sm:text-2xl' : isSilver ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
          {sponsor.name}
        </h3>

        {sponsor.description && (
          <p className={`text-gray-500 mt-1.5 leading-relaxed ${isGold ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
            {sponsor.description}
          </p>
        )}

        {/* Social Media Links */}
        <SocialLinks sponsor={sponsor} size={isGold ? 'md' : 'sm'} />

        {/* Visit Website link (shown on hover if has primary link) */}
        {primaryLink && (
          <div className="mt-3 flex items-center gap-1.5 text-[#9E065D] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-medium">Visit Website</span>
            <ExternalLink size={12} />
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
    </div>
  );

  if (primaryLink) {
    return (
      <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#9E065D] focus:ring-offset-2 rounded-2xl">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

/* ─── Tier Section ─── */
interface TierSectionProps {
  tier: 'gold' | 'silver' | 'bronze';
  sponsors: Sponsor[];
}

const TierSection: React.FC<TierSectionProps> = ({ tier, sponsors }) => {
  const config = tierConfig[tier];
  const TierIcon = config.icon;
  if (sponsors.length === 0) return null;
  const isGold = tier === 'gold';
  const isSilver = tier === 'silver';

  return (
    <div className="mb-14 last:mb-0">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gray-200" />
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <TierIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-heading text-lg tracking-wider ${config.textColor} leading-none`}>{config.label.toUpperCase()}</h3>
            <p className={`text-xs ${config.accentColor} font-medium`}>{config.sublabel}</p>
          </div>
        </div>
        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      <div className={`grid gap-6 ${isGold ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto' : ''} ${isSilver ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' : ''} ${!isGold && !isSilver ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-6xl mx-auto' : ''}`}>
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} tier={tier} />
        ))}
      </div>
    </div>
  );
};

/* ─── Main Sponsor Section ─── */
interface SponsorSectionProps {
  onContactClick?: () => void;
}

const SponsorSection: React.FC<SponsorSectionProps> = ({ onContactClick }) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>(fallbackSponsors);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'gold' | 'silver' | 'bronze'>('all');
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchSponsors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        // Normalize + enrich with directory data (fills in missing logos/links)
        setSponsors(data.map(normalizeSponsor));
        setUsingFallback(false);
      } else {
        setUsingFallback(true);
      }
    } catch (err) {
      console.warn('Using fallback sponsor data:', err);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const goldSponsors = sponsors.filter(s => s.tier === 'gold');
  const silverSponsors = sponsors.filter(s => s.tier === 'silver');
  const bronzeSponsors = sponsors.filter(s => s.tier === 'bronze');

  const filteredGold = activeFilter === 'all' || activeFilter === 'gold' ? goldSponsors : [];
  const filteredSilver = activeFilter === 'all' || activeFilter === 'silver' ? silverSponsors : [];
  const filteredBronze = activeFilter === 'all' || activeFilter === 'bronze' ? bronzeSponsors : [];

  const filterButtons = [
    { key: 'all' as const, label: 'All Sponsors', count: sponsors.length },
    { key: 'gold' as const, label: 'Gold', count: goldSponsors.length, icon: Crown },
    { key: 'silver' as const, label: 'Silver', count: silverSponsors.length, icon: Trophy },
    { key: 'bronze' as const, label: 'Bronze', count: bronzeSponsors.length, icon: Medal },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FEE6F4]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#FEE6F4]/10 to-transparent rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-[#9E065D] text-sm font-semibold uppercase tracking-widest mb-3">Thank You</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-gray-900 tracking-wide mb-4">SPONSORS &amp; DONORS</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] mx-auto rounded-full mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A heartfelt thank you to our sponsors and supporters who make the Classic Burger Car Show possible.
            Your generosity fuels our community and helps us give back.
          </p>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          {filterButtons.map((btn) => {
            const isActive = activeFilter === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border-2 ${isActive ? 'bg-[#9E065D] text-white border-[#9E065D] shadow-lg shadow-[#9E065D]/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FB50B1]/40 hover:text-[#9E065D]'}`}
              >
                {btn.icon && <btn.icon size={14} className={isActive ? 'text-white' : ''} />}
                {btn.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-[#9E065D] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading sponsors...</span>
            </div>
          </div>
        )}

        {/* Sponsor Tiers */}
        {!loading && (
          <div className="transition-all duration-500">
            <TierSection tier="gold" sponsors={filteredGold} />
            <TierSection tier="silver" sponsors={filteredSilver} />
            <TierSection tier="bronze" sponsors={filteredBronze} />
          </div>
        )}

        {/* Become a Sponsor CTA */}
        <div className="text-center mt-14">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#FEE6F4]/50 to-amber-50/50 border border-[#FEE6F4] rounded-2xl px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Interested in Sponsoring?</p>
                <p className="text-gray-500 text-sm">Join our growing family of supporters</p>
              </div>
            </div>
            <button
              onClick={onContactClick}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-7 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-[#9E065D]/20 hover:shadow-[#FB50B1]/30 hover:scale-105"
            >
              Become a Sponsor
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
