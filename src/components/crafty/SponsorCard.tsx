import React, { useState, useEffect } from 'react';
import {
  ExternalLink, Globe, Facebook, Instagram, Youtube, Crown
} from 'lucide-react';

// Custom TikTok icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export interface SponsorData {
  id?: string;
  name: string;
  tier?: 'gold' | 'silver' | 'bronze';
  logo_url: string | null;
  website_url: string | null;
  description?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
}

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
const SocialLinks: React.FC<{ sponsor: SponsorData; size?: 'sm' | 'md' }> = ({ sponsor, size = 'sm' }) => {
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

/* ─── Tier Config ─── */
const tierConfig = {
  gold: {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    shadowColor: 'hover:shadow-amber-200/50',
  },
  silver: {
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    bgGradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    shadowColor: 'hover:shadow-slate-200/50',
  },
  bronze: {
    gradient: 'from-orange-400 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    shadowColor: 'hover:shadow-orange-200/50',
  },
};

/* ─── Full Sponsor Card (for main sponsor section) ─── */
interface SponsorCardProps {
  sponsor: SponsorData;
  size?: 'lg' | 'md' | 'sm';
}

export const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const tier = sponsor.tier || 'bronze';
  const config = tierConfig[tier];
  const hasLogo = sponsor.logo_url && !imgError;
  const isLg = size === 'lg';
  const isMd = size === 'md';

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [sponsor.logo_url]);

  const primaryLink = sponsor.website_url || sponsor.facebook_url || sponsor.instagram_url || sponsor.youtube_url || sponsor.tiktok_url;

  const cardContent = (
    <div className={`relative group bg-white rounded-2xl border-2 transition-all duration-500 overflow-hidden ${config.borderColor} ${config.hoverBorder} ${config.shadowColor} hover:shadow-xl hover:-translate-y-1 ${isLg ? 'p-6 sm:p-8' : isMd ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}>
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Tier ribbon for gold */}
      {tier === 'gold' && (
        <div className={`absolute top-0 right-0 bg-gradient-to-l ${config.gradient} text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md`}>
          <div className="flex items-center gap-1"><Crown size={12} /> TITLE SPONSOR</div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo / Brand Card Area */}
        <div className={`relative flex items-center justify-center overflow-hidden rounded-xl mb-4 ${isLg ? 'w-full max-w-[280px] h-36 sm:h-44' : isMd ? 'w-full max-w-[220px] h-28 sm:h-32' : 'w-full max-w-[180px] h-24 sm:h-28'}`}>
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
            /* Beautiful branded card fallback — full name, not just initials */
            <div className={`w-full h-full bg-gradient-to-br ${getNameColor(sponsor.name)} rounded-xl flex flex-col items-center justify-center px-4 py-3 transition-all duration-700 ease-out group-hover:scale-105`}>
              <span className={`font-heading text-white tracking-wider text-center leading-tight ${isLg ? 'text-lg sm:text-xl' : isMd ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                {sponsor.name.toUpperCase()}
              </span>
              {sponsor.description && (
                <span className={`text-white/60 mt-1 text-center leading-tight ${isLg ? 'text-xs' : 'text-[10px]'}`}>
                  {sponsor.description}
                </span>
              )}
            </div>
          )}
        </div>

        <h3 className={`font-bold text-gray-900 group-hover:text-[#9E065D] transition-colors duration-300 ${isLg ? 'text-lg sm:text-xl' : isMd ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
          {sponsor.name}
        </h3>

        {sponsor.description && (
          <p className={`text-gray-500 mt-1 leading-relaxed ${isLg ? 'text-sm' : 'text-xs'}`}>
            {sponsor.description}
          </p>
        )}

        {/* Social Media Links */}
        <SocialLinks sponsor={sponsor} size={isLg ? 'md' : 'sm'} />

        {/* Visit link on hover */}
        {primaryLink && (
          <div className="mt-3 flex items-center gap-1.5 text-[#9E065D] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-medium">Visit</span>
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

/* ─── Compact Sponsor Card (for footer, nostalgia, inline use) ─── */
interface CompactSponsorCardProps {
  name: string;
  logo_url: string | null;
  link: string | null;
  description?: string;
  className?: string;
}

export const CompactSponsorCard: React.FC<CompactSponsorCardProps> = ({ name, logo_url, link, description, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasLogo = logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [logo_url]);

  const cardContent = (
    <div className={`group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-[#FB50B1]/30 hover:shadow-lg hover:shadow-[#FB50B1]/5 ${className}`}>
      <div className="flex items-center justify-center h-20 sm:h-24 p-3">
        {hasLogo ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
            )}
            <img
              src={logo_url!}
              alt={`${name} logo`}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-full object-contain filter brightness-0 invert opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 ${imgLoaded ? '' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <span className="font-heading text-white/70 group-hover:text-[#FB50B1] text-xs sm:text-sm tracking-wider leading-tight transition-colors duration-300">
              {name.toUpperCase()}
            </span>
            {description && (
              <span className="text-white/30 text-[9px] sm:text-[10px] mt-0.5 leading-tight">{description}</span>
            )}
          </div>
        )}
      </div>
      {/* Hover accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FB50B1] to-[#9E065D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block" title={name}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

/* ─── Light Compact Sponsor Card (for light backgrounds like nostalgia section) ─── */
interface LightSponsorCardProps {
  name: string;
  logo_url: string | null;
  link: string | null;
  description?: string;
  className?: string;
}

export const LightSponsorCard: React.FC<LightSponsorCardProps> = ({ name, logo_url, link, description, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasLogo = logo_url && !imgError;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [logo_url]);

  const cardContent = (
    <div className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-[#FB50B1]/30 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      <div className="flex items-center justify-center h-28 sm:h-32 p-4">
        {hasLogo ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-50 animate-pulse rounded-2xl" />
            )}
            <img
              src={logo_url!}
              alt={`${name} logo`}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-full object-contain transition-all duration-700 ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getNameColor(name)} rounded-xl flex flex-col items-center justify-center px-3 py-2 transition-all duration-700 ease-out group-hover:scale-105`}>
            <span className="font-heading text-white tracking-wider text-center leading-tight text-sm sm:text-base">
              {name.toUpperCase()}
            </span>
            {description && (
              <span className="text-white/60 text-[10px] sm:text-xs mt-1 text-center leading-tight">{description}</span>
            )}
          </div>
        )}
      </div>
      <div className="px-4 pb-4 text-center">
        <h4 className="font-heading text-base text-gray-900 tracking-wide group-hover:text-[#9E065D] transition-colors leading-tight">{name}</h4>
        {description && (
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        )}
        {link && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[#9E065D] opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-xs font-medium">Visit</span>
            <ExternalLink size={10} />
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block" title={name}>
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

export default SponsorCard;
