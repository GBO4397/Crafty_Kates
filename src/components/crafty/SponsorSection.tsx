import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Globe, Facebook, Instagram, Youtube, Heart } from 'lucide-react';

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface Sponsor {
  id: string;
  name: string;
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
}

const SponsorCard: React.FC<{ sponsor: Sponsor; isPrimary?: boolean }> = ({ sponsor, isPrimary = false }) => {
  const primaryLink = sponsor.website_url || sponsor.facebook_url || sponsor.instagram_url || sponsor.youtube_url || sponsor.tiktok_url;

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
      isPrimary
        ? 'bg-gradient-to-b from-[#FEF0F8] to-white border-[#FB50B1]/30 hover:border-[#FB50B1]/60 hover:shadow-[#FB50B1]/10'
        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-gray-100'
    }`}>
      {isPrimary && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="px-3 py-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-xs font-bold rounded-full shadow-md">
            Primary Sponsor
          </span>
        </div>
      )}

      {/* Logo */}
      <div className="w-full aspect-square flex items-center justify-center mb-4 mt-2 bg-gray-50 rounded-xl overflow-hidden p-3">
        {sponsor.logo_url ? (
          <img
            src={sponsor.logo_url}
            alt={sponsor.name}
            className="w-full h-full object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={`w-full h-full rounded-xl flex items-center justify-center ${isPrimary ? 'bg-[#FEE6F4]' : 'bg-gray-100'}`}>
            <span className={`text-xs font-bold text-center px-2 leading-tight ${isPrimary ? 'text-[#9E065D]' : 'text-gray-400'}`}>
              {sponsor.name}
            </span>
          </div>
        )}
      </div>

      {/* Name & Description */}
      <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{sponsor.name}</h3>
      {sponsor.description && (
        <p className="text-xs text-gray-500 text-center mb-3 leading-relaxed">{sponsor.description}</p>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-2 mt-auto">
        {primaryLink && (
          <a href={primaryLink} target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-lg transition-colors ${isPrimary ? 'text-[#9E065D] hover:bg-[#FEE6F4]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
            <Globe size={14} />
          </a>
        )}
        {sponsor.facebook_url && (
          <a href={sponsor.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
            <Facebook size={14} />
          </a>
        )}
        {sponsor.instagram_url && (
          <a href={sponsor.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-pink-500 hover:bg-pink-50 transition-colors">
            <Instagram size={14} />
          </a>
        )}
        {sponsor.youtube_url && (
          <a href={sponsor.youtube_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            <Youtube size={14} />
          </a>
        )}
        {sponsor.tiktok_url && (
          <a href={sponsor.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors">
            <TikTokIcon size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

interface SponsorSectionProps {
  onContactClick?: () => void;
}

const SponsorSection: React.FC<SponsorSectionProps> = ({ onContactClick }) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setSponsors(data || []);
    } catch (err) {
      console.warn('Failed to load sponsors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const primarySponsors = sponsors.filter(s => s.sponsor_type === 'primary' || s.sponsor_type === 'both');
  const carShowSponsors = sponsors.filter(s => s.sponsor_type === 'carshow' || s.sponsor_type === 'both');

  if (loading) return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="w-8 h-8 border-2 border-[#9E065D] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </section>
  );

  if (sponsors.length === 0) return null;

  return (
    <section id="sponsors" className="py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEE6F4] rounded-full mb-4">
            <Heart size={14} className="text-[#9E065D]" />
            <span className="text-sm font-semibold text-[#9E065D] tracking-wide uppercase">Our Sponsors</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Our Amazing Sponsors</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These incredible partners make our events and community work possible.
          </p>
        </div>

        {/* Primary Sponsors */}
        {primarySponsors.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent to-[#FB50B1]/50 flex-1" />
              <div className="text-center px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] rounded-2xl shadow-lg shadow-[#9E065D]/20">
                <h3 className="text-lg font-bold text-white">Primary Sponsors</h3>
                <p className="text-xs text-white/70">Supporting Crafty Kates Promotions</p>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent to-[#FB50B1]/50 flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {primarySponsors.map(sponsor => (
                <SponsorCard key={`primary-${sponsor.id}`} sponsor={sponsor} isPrimary={true} />
              ))}
            </div>
          </div>
        )}

        {/* Car Show Sponsors */}
        {carShowSponsors.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent to-gray-300 flex-1" />
              <div className="text-center px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Classic Burger Car Show Sponsors</h3>
                <p className="text-xs text-gray-500">Supporting the Annual Car Show</p>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent to-gray-300 flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {carShowSponsors.map(sponsor => (
                <SponsorCard key={`carshow-${sponsor.id}`} sponsor={sponsor} isPrimary={false} />
              ))}
            </div>
          </div>
        )}

        {/* Become a Sponsor CTA */}
        <div className="text-center">
          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all"
          >
            <Heart size={18} />
            Become a Sponsor
          </button>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
