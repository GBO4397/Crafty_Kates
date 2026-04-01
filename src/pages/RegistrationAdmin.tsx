import React, { useState, useEffect, useMemo } from 'react';
import {
  Car, Store, Search, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Users, Calendar, Filter, X, Eye, Mail, Phone, MapPin, Clock, ArrowUpDown,
  FileSpreadsheet, RefreshCw, Loader2, AlertCircle, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Registration {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  entry_type: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vendor_name: string | null;
  vendor_space_size: string | null;
  cackle_car_info: string | null;
  liability_agreed: boolean;
  photo_release: boolean;
  created_at: string;
}

type SortField = 'name' | 'entry_type' | 'email' | 'city' | 'created_at';
type SortDir = 'asc' | 'desc';

const ENTRY_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  vehicle: { label: 'Vehicle', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: Car },
  vendor: { label: 'Vendor', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: Store },
  cackle: {
    label: 'Cackle Car', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200',
    icon: Car,
  },
};

const SPACE_SIZE_LABELS: Record<string, string> = {
  '10x10': "10' x 10' (1 space)",
  '10x20': "10' x 20' (2 spaces)",
  '10x30': "10' x 30' (3 spaces)",
  'custom': 'Custom',
};

// ─── Stats Card ──────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtitle?: string;
}> = ({ label, value, icon: Icon, color, bgColor, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={20} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Detail Modal ────────────────────────────────────────────────
const DetailModal: React.FC<{
  registration: Registration;
  onClose: () => void;
}> = ({ registration: r, onClose }) => {
  const config = ENTRY_TYPE_CONFIG[r.entry_type] || ENTRY_TYPE_CONFIG.vehicle;
  const EntryIcon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor} border`}>
              <EntryIcon size={18} className={config.color} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{r.name}</h3>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} border ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href={`mailto:${r.email}`} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl hover:bg-[#FEE6F4]/30 transition-colors group">
                <Mail size={16} className="text-gray-400 group-hover:text-[#9E065D]" />
                <span className="text-sm text-gray-700 truncate">{r.email}</span>
              </a>
              <a href={`tel:${r.phone}`} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl hover:bg-[#FEE6F4]/30 transition-colors group">
                <Phone size={16} className="text-gray-400 group-hover:text-[#9E065D]" />
                <span className="text-sm text-gray-700">{r.phone}</span>
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Address</h4>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${r.address}, ${r.city}, ${r.state} ${r.zip}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl hover:bg-[#FEE6F4]/30 transition-colors group"
            >
              <MapPin size={16} className="text-gray-400 group-hover:text-[#9E065D] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p>{r.address}</p>
                <p>{r.city}, {r.state} {r.zip}</p>
              </div>
            </a>
          </div>

          {/* Entry Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Entry Details</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              {r.entry_type === 'vehicle' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Year</p>
                      <p className="text-sm font-semibold text-gray-900">{r.vehicle_year || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Make</p>
                      <p className="text-sm font-semibold text-gray-900">{r.vehicle_make || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Model</p>
                      <p className="text-sm font-semibold text-gray-900">{r.vehicle_model || '—'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pt-1 border-t border-gray-200 mt-2">
                    {r.vehicle_year} {r.vehicle_make} {r.vehicle_model}
                  </p>
                </div>
              )}
              {r.entry_type === 'vendor' && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Business Name</p>
                    <p className="text-sm font-semibold text-gray-900">{r.vendor_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Space Size</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {r.vendor_space_size ? (SPACE_SIZE_LABELS[r.vendor_space_size] || r.vendor_space_size) : '—'}
                    </p>
                  </div>
                </div>
              )}
              {r.entry_type === 'cackle' && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Cackle Car Info</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{r.cackle_car_info || '—'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Agreements & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Agreements</h4>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${r.liability_agreed ? 'text-green-700' : 'text-red-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${r.liability_agreed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {r.liability_agreed ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <X size={10} />
                    )}
                  </div>
                  Liability Release
                </div>
                <div className={`flex items-center gap-2 text-sm ${r.photo_release ? 'text-green-700' : 'text-red-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${r.photo_release ? 'bg-green-100' : 'bg-red-100'}`}>
                    {r.photo_release ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <X size={10} />
                    )}
                  </div>
                  Photo Release
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Registered</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} className="text-gray-400" />
                {new Date(r.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const RegistrationAdmin: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 15;

  const fetchRegistrations = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('car_show_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setError('Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // ─── Computed Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total = registrations.length;
    const vehicles = registrations.filter(r => r.entry_type === 'vehicle').length;
    const vendors = registrations.filter(r => r.entry_type === 'vendor').length;
    const cackle = registrations.filter(r => r.entry_type === 'cackle').length;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = registrations.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;

    return { total, vehicles, vendors, cackle, recent };
  }, [registrations]);

  // ─── Filtered & Sorted ──────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let result = [...registrations];

    // Filter by entry type
    if (filterType !== 'all') {
      result = result.filter(r => r.entry_type === filterType);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.vehicle_make?.toLowerCase().includes(q) ||
        r.vehicle_model?.toLowerCase().includes(q) ||
        r.vendor_name?.toLowerCase().includes(q) ||
        r.vehicle_year?.includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'entry_type':
          aVal = a.entry_type;
          bVal = b.entry_type;
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'city':
          aVal = (a.city || '').toLowerCase();
          bVal = (b.city || '').toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [registrations, filterType, searchQuery, sortField, sortDir]);

  // ─── Pagination ─────────────────────────────────────────────
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery, sortField, sortDir]);

  // ─── Sort Handler ───────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-[#9E065D]" />
      : <ChevronDown size={13} className="text-[#9E065D]" />;
  };

  // ─── CSV Export ─────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip',
      'Entry Type', 'Vehicle Year', 'Vehicle Make', 'Vehicle Model',
      'Vendor Name', 'Vendor Space Size', 'Cackle Car Info',
      'Liability Agreed', 'Photo Release', 'Registration Date'
    ];

    const rows = filteredAndSorted.map(r => [
      r.name,
      r.email,
      r.phone,
      r.address,
      r.city,
      r.state,
      r.zip,
      r.entry_type,
      r.vehicle_year || '',
      r.vehicle_make || '',
      r.vehicle_model || '',
      r.vendor_name || '',
      r.vendor_space_size ? (SPACE_SIZE_LABELS[r.vendor_space_size] || r.vendor_space_size) : '',
      r.cackle_car_info || '',
      r.liability_agreed ? 'Yes' : 'No',
      r.photo_release ? 'Yes' : 'No',
      new Date(r.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `car-show-registrations-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── Entry Type Badge ──────────────────────────────────────
  const EntryBadge: React.FC<{ type: string }> = ({ type }) => {
    const config = ENTRY_TYPE_CONFIG[type] || ENTRY_TYPE_CONFIG.vehicle;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bgColor} ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  // ─── Vehicle Info Display ──────────────────────────────────
  const getEntryInfo = (r: Registration): string => {
    if (r.entry_type === 'vehicle') {
      return [r.vehicle_year, r.vehicle_make, r.vehicle_model].filter(Boolean).join(' ') || '—';
    }
    if (r.entry_type === 'vendor') {
      return r.vendor_name || '—';
    }
    if (r.entry_type === 'cackle') {
      return r.cackle_car_info ? (r.cackle_car_info.length > 50 ? r.cackle_car_info.slice(0, 50) + '...' : r.cackle_car_info) : '—';
    }
    return '—';
  };

  // ─── Render ────────────────────────────────────────────────
  const containerClass = embedded
    ? 'min-h-screen bg-gray-50/80'
    : 'min-h-screen bg-gray-50/80';

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={32} className="text-[#9E065D] animate-spin" />
          <p className="text-sm text-gray-500">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => fetchRegistrations()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#9E065D] text-white rounded-lg text-sm hover:bg-[#7D0348] transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registrations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage car show registrations for the 6th Annual Classic Burger Car Show
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRegistrations(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={filteredAndSorted.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={14} />
              Export CSV
              {filteredAndSorted.length > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{filteredAndSorted.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <StatCard
            label="Total Registrations"
            value={stats.total}
            icon={Users}
            color="text-[#9E065D]"
            bgColor="bg-[#FEE6F4]"
          />
          <StatCard
            label="Vehicles"
            value={stats.vehicles}
            icon={Car}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Vendors"
            value={stats.vendors}
            icon={Store}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            label="Cackle Cars"
            value={stats.cackle}
            icon={Car}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Last 7 Days"
            value={stats.recent}
            icon={TrendingUp}
            color="text-amber-600"
            bgColor="bg-amber-50"
            subtitle="Recent signups"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, city, vehicle..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/30 focus:border-[#FB50B1] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <X size={10} className="text-gray-600" />
                </button>
              )}
            </div>

            {/* Entry Type Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={14} className="text-gray-400 mr-1 hidden sm:block" />
              {[
                { id: 'all', label: 'All' },
                { id: 'vehicle', label: 'Vehicles' },
                { id: 'vendor', label: 'Vendors' },
                { id: 'cackle', label: 'Cackle' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    filterType === opt.id
                      ? 'bg-[#9E065D] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {paginatedData.length} of {filteredAndSorted.length} registration{filteredAndSorted.length !== 1 ? 's' : ''}
              {filterType !== 'all' && ` (filtered: ${filterType})`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {searchQuery || filterType !== 'all'
                  ? 'No registrations match your filters'
                  : 'No registrations yet'}
              </p>
              {(searchQuery || filterType !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                  className="text-sm text-[#9E065D] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3">
                      <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#9E065D] transition-colors">
                        Name <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button onClick={() => handleSort('entry_type')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#9E065D] transition-colors">
                        Type <SortIcon field="entry_type" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry Info</span>
                    </th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">
                      <button onClick={() => handleSort('email')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#9E065D] transition-colors">
                        Email <SortIcon field="email" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</span>
                    </th>
                    <th className="text-left px-4 py-3 hidden xl:table-cell">
                      <button onClick={() => handleSort('city')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#9E065D] transition-colors">
                        Location <SortIcon field="city" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button onClick={() => handleSort('created_at')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#9E065D] transition-colors">
                        Date <SortIcon field="created_at" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FEE6F4]/10 transition-colors cursor-pointer group"
                      onClick={() => setSelectedRegistration(r)}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 group-hover:text-[#9E065D] transition-colors">{r.name}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <EntryBadge type={r.entry_type} />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-gray-600 text-xs max-w-[200px] truncate">{getEntryInfo(r)}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-gray-600 truncate max-w-[180px]">{r.email}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <p className="text-gray-600">{r.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <p className="text-gray-600">{r.city}, {r.state}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-500 text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedRegistration(r); }}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#FEE6F4] flex items-center justify-center transition-colors mx-auto group-hover:bg-[#FEE6F4]"
                        >
                          <Eye size={14} className="text-gray-500 group-hover:text-[#9E065D]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} className="text-gray-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#9E065D] text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <DetailModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
        />
      )}
    </div>
  );
};

export default RegistrationAdmin;
