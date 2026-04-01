import React from 'react';
import {
  Crown, Trophy, Medal, Image, ImageOff, Users,
  CheckCircle, XCircle, TrendingUp, Clock
} from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SponsorAdminStatsProps {
  sponsors: Sponsor[];
}

const SponsorAdminStats: React.FC<SponsorAdminStatsProps> = ({ sponsors }) => {
  const total = sponsors.length;
  const gold = sponsors.filter(s => s.tier === 'gold');
  const silver = sponsors.filter(s => s.tier === 'silver');
  const bronze = sponsors.filter(s => s.tier === 'bronze');
  const withLogos = sponsors.filter(s => s.logo_url);
  const withoutLogos = sponsors.filter(s => !s.logo_url);
  const active = sponsors.filter(s => s.is_active);
  const inactive = sponsors.filter(s => !s.is_active);

  // Find most recently updated
  const sortedByUpdate = [...sponsors].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const lastUpdated = sortedByUpdate[0];
  const lastUpdatedDate = lastUpdated
    ? new Date(lastUpdated.updated_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'N/A';

  const logoPercentage = total > 0 ? Math.round((withLogos.length / total) * 100) : 0;

  const stats = [
    {
      label: 'Total Sponsors',
      value: total,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-700',
      subtitle: `${active.length} active, ${inactive.length} inactive`,
    },
    {
      label: 'Gold Tier',
      value: gold.length,
      icon: Crown,
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      subtitle: `${gold.filter(s => s.logo_url).length}/${gold.length} logos uploaded`,
    },
    {
      label: 'Silver Tier',
      value: silver.length,
      icon: Trophy,
      color: 'from-slate-400 to-gray-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      subtitle: `${silver.filter(s => s.logo_url).length}/${silver.length} logos uploaded`,
    },
    {
      label: 'Bronze Tier',
      value: bronze.length,
      icon: Medal,
      color: 'from-orange-400 to-amber-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      subtitle: `${bronze.filter(s => s.logo_url).length}/${bronze.length} logos uploaded`,
    },
    {
      label: 'Logos Uploaded',
      value: withLogos.length,
      icon: Image,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      subtitle: `${logoPercentage}% coverage`,
    },
    {
      label: 'Missing Logos',
      value: withoutLogos.length,
      icon: ImageOff,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      subtitle: withoutLogos.length > 0 ? `${withoutLogos.slice(0, 2).map(s => s.name).join(', ')}${withoutLogos.length > 2 ? '...' : ''}` : 'All logos uploaded!',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">{stat.label}</p>
            <p className="text-xs text-gray-500 leading-snug truncate" title={stat.subtitle}>{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Logo Coverage Bar + Last Updated */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-gray-800">Logo Upload Progress</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{logoPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${logoPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{withLogos.length} uploaded</span>
            <span className="text-xs text-gray-500">{withoutLogos.length} remaining</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Last Activity</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{lastUpdatedDate}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: <span className="font-medium text-gray-700">{lastUpdated.name}</span>
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-xs text-gray-600">{active.length} active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">{inactive.length} inactive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorAdminStats;
