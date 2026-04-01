import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, X, Car, Store, Users, Clock, CheckCircle2, Circle,
  DollarSign, RefreshCw, Loader2, AlertCircle, UserCheck, UserX,
  ChevronDown, Undo2, Zap, CreditCard, Ban, Timer, ArrowUpDown
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────
interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  entry_type: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vendor_name: string | null;
  vendor_space_size: string | null;
  cackle_car_info: string | null;
  check_in_at: string | null;
  payment_status: string;
  created_at: string;
}

type PaymentStatus = 'paid' | 'unpaid' | 'waived' | 'pending';
type ViewFilter = 'all' | 'checked-in' | 'not-checked-in';
type TypeFilter = 'all' | 'vehicle' | 'vendor' | 'cackle';
type SortMode = 'name' | 'check-in' | 'recent' | 'type';

const ENTRY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  vehicle: { label: 'Vehicle', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: Car },
  vendor: { label: 'Vendor', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: Store },
  cackle: { label: 'Cackle Car', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: Car },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-50', icon: DollarSign },
  unpaid: { label: 'Unpaid', color: 'text-red-700', bgColor: 'bg-red-50', icon: Ban },
  waived: { label: 'Waived', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: CreditCard },
  pending: { label: 'Pending', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Timer },
};

const SPACE_SIZE_LABELS: Record<string, string> = {
  '10x10': "10' x 10'",
  '10x20': "10' x 20'",
  '10x30': "10' x 30'",
  'custom': 'Custom',
};

// ─── Progress Ring ───────────────────────────────────────────────
const ProgressRing: React.FC<{ value: number; max: number; size?: number; strokeWidth?: number; color?: string }> = ({
  value, max, size = 56, strokeWidth = 5, color = '#9E065D'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = max > 0 ? value / max : 0;
  const offset = circumference - pct * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

// ─── Stat Ring Card ──────────────────────────────────────────────
const StatRingCard: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ElementType;
  subtitle?: string;
}> = ({ label, value, max, color, icon: Icon, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
    <div className="relative flex-shrink-0">
      <ProgressRing value={value} max={max} color={color} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}<span className="text-sm font-medium text-gray-400">/{max}</span></p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ─── Payment Status Dropdown ─────────────────────────────────────
const PaymentDropdown: React.FC<{
  currentStatus: string;
  onSelect: (status: PaymentStatus) => void;
  disabled?: boolean;
}> = ({ currentStatus, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const config = PAYMENT_CONFIG[currentStatus] || PAYMENT_CONFIG.unpaid;
  const Icon = config.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${config.bgColor} ${config.color} border-current/20 hover:shadow-sm disabled:opacity-50`}
      >
        <Icon size={12} />
        {config.label}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-xl py-1 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-150">
          {(Object.keys(PAYMENT_CONFIG) as PaymentStatus[]).map(status => {
            const cfg = PAYMENT_CONFIG[status];
            const StatusIcon = cfg.icon;
            return (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(status);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                  currentStatus === status ? 'bg-gray-50 font-bold' : ''
                }`}
              >
                <StatusIcon size={12} className={cfg.color} />
                <span className={cfg.color}>{cfg.label}</span>
                {currentStatus === status && (
                  <svg className="w-3 h-3 ml-auto text-[#9E065D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Check-In Card ───────────────────────────────────────────────
const CheckInCard: React.FC<{
  registration: Registration;
  onCheckIn: (id: string) => void;
  onUndoCheckIn: (id: string) => void;
  onPaymentChange: (id: string, status: PaymentStatus) => void;
  updating: string | null;
}> = ({ registration: r, onCheckIn, onUndoCheckIn, onPaymentChange, updating }) => {
  const isCheckedIn = !!r.check_in_at;
  const entryConfig = ENTRY_CONFIG[r.entry_type] || ENTRY_CONFIG.vehicle;
  const EntryIcon = entryConfig.icon;
  const isUpdating = updating === r.id;

  const getEntryInfo = (): string => {
    if (r.entry_type === 'vehicle') {
      return [r.vehicle_year, r.vehicle_make, r.vehicle_model].filter(Boolean).join(' ') || '—';
    }
    if (r.entry_type === 'vendor') return r.vendor_name || '—';
    if (r.entry_type === 'cackle') return r.cackle_car_info ? (r.cackle_car_info.length > 60 ? r.cackle_car_info.slice(0, 60) + '...' : r.cackle_car_info) : '—';
    return '—';
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isCheckedIn
          ? 'border-green-200 bg-green-50/30 shadow-sm shadow-green-100/50'
          : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Checked-in indicator strip */}
      {isCheckedIn && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Check-in status icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isCheckedIn
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isCheckedIn ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{r.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${entryConfig.bgColor} ${entryConfig.borderColor} ${entryConfig.color}`}>
                    <EntryIcon size={10} />
                    {entryConfig.label}
                  </span>
                  <span className="text-xs text-gray-500">{getEntryInfo()}</span>
                </div>
              </div>

              {/* Payment status */}
              <PaymentDropdown
                currentStatus={r.payment_status || 'unpaid'}
                onSelect={(status) => onPaymentChange(r.id, status)}
                disabled={isUpdating}
              />
            </div>

            {/* Contact row */}
            <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500 flex-wrap">
              {r.email && (
                <span className="truncate max-w-[200px]">{r.email}</span>
              )}
              {r.phone && <span>{r.phone}</span>}
              {r.city && r.state && <span>{r.city}, {r.state}</span>}
            </div>

            {/* Check-in timestamp */}
            {isCheckedIn && r.check_in_at && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-medium">
                <Clock size={11} />
                Checked in at {new Date(r.check_in_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            )}
          </div>

          {/* Check-in / Undo button */}
          <div className="flex-shrink-0">
            {isCheckedIn ? (
              <button
                onClick={(e) => { e.stopPropagation(); onUndoCheckIn(r.id); }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 border border-transparent hover:border-red-200"
                title="Undo check-in"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Undo2 size={16} />
                )}
                <span className="hidden sm:inline">Undo</span>
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onCheckIn(r.id); }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-[#9E065D]/20 hover:shadow-lg hover:shadow-[#FB50B1]/30 disabled:opacity-50 active:scale-95"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                <span>Check In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const CheckInAdmin: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  const [lastAction, setLastAction] = useState<{ id: string; type: 'checkin' | 'undo'; name: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Data ──────────────────────────────────────────────
  const fetchRegistrations = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('car_show_registrations')
        .select('id, name, phone, email, city, state, entry_type, vehicle_year, vehicle_make, vehicle_model, vendor_name, vendor_space_size, cackle_car_info, check_in_at, payment_status, created_at')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setError('Failed to load registrations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Focus search on load
  useEffect(() => {
    if (!loading && searchRef.current) {
      searchRef.current.focus();
    }
  }, [loading]);

  // ─── Check-In Handler ────────────────────────────────────────
  const handleCheckIn = async (id: string) => {
    setUpdatingId(id);
    const now = new Date().toISOString();
    const reg = registrations.find(r => r.id === id);

    // Optimistic update
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, check_in_at: now } : r)
    );

    try {
      const { error: updateError } = await supabase
        .from('car_show_registrations')
        .update({ check_in_at: now })
        .eq('id', id);

      if (updateError) throw updateError;
      setLastAction({ id, type: 'checkin', name: reg?.name || '' });
      setTimeout(() => setLastAction(null), 4000);
    } catch (err) {
      console.error('Check-in error:', err);
      // Revert optimistic update
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, check_in_at: null } : r)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Undo Check-In Handler ───────────────────────────────────
  const handleUndoCheckIn = async (id: string) => {
    setUpdatingId(id);
    const reg = registrations.find(r => r.id === id);
    const prevCheckIn = reg?.check_in_at;

    // Optimistic update
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, check_in_at: null } : r)
    );

    try {
      const { error: updateError } = await supabase
        .from('car_show_registrations')
        .update({ check_in_at: null })
        .eq('id', id);

      if (updateError) throw updateError;
      setLastAction({ id, type: 'undo', name: reg?.name || '' });
      setTimeout(() => setLastAction(null), 4000);
    } catch (err) {
      console.error('Undo check-in error:', err);
      // Revert
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, check_in_at: prevCheckIn || null } : r)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Payment Status Handler ──────────────────────────────────
  const handlePaymentChange = async (id: string, status: PaymentStatus) => {
    const reg = registrations.find(r => r.id === id);
    const prevStatus = reg?.payment_status;

    // Optimistic update
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, payment_status: status } : r)
    );

    try {
      const { error: updateError } = await supabase
        .from('car_show_registrations')
        .update({ payment_status: status })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Payment status error:', err);
      // Revert
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, payment_status: prevStatus || 'unpaid' } : r)
      );
    }
  };

  // ─── Computed Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total = registrations.length;
    const checkedIn = registrations.filter(r => !!r.check_in_at).length;
    const remaining = total - checkedIn;

    const vehicles = registrations.filter(r => r.entry_type === 'vehicle');
    const vendors = registrations.filter(r => r.entry_type === 'vendor');
    const cackle = registrations.filter(r => r.entry_type === 'cackle');

    const vehiclesCheckedIn = vehicles.filter(r => !!r.check_in_at).length;
    const vendorsCheckedIn = vendors.filter(r => !!r.check_in_at).length;
    const cackleCheckedIn = cackle.filter(r => !!r.check_in_at).length;

    const paid = registrations.filter(r => r.payment_status === 'paid').length;
    const unpaid = registrations.filter(r => !r.payment_status || r.payment_status === 'unpaid').length;
    const waived = registrations.filter(r => r.payment_status === 'waived').length;

    return {
      total, checkedIn, remaining,
      vehicles: vehicles.length, vehiclesCheckedIn,
      vendors: vendors.length, vendorsCheckedIn,
      cackle: cackle.length, cackleCheckedIn,
      paid, unpaid, waived,
    };
  }, [registrations]);

  // ─── Filtered & Sorted ──────────────────────────────────────
  const filteredList = useMemo(() => {
    let result = [...registrations];

    // View filter
    if (viewFilter === 'checked-in') {
      result = result.filter(r => !!r.check_in_at);
    } else if (viewFilter === 'not-checked-in') {
      result = result.filter(r => !r.check_in_at);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(r => r.entry_type === typeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.vehicle_make?.toLowerCase().includes(q) ||
        r.vehicle_model?.toLowerCase().includes(q) ||
        r.vendor_name?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'check-in': {
          // Unchecked first, then by name
          const aChecked = a.check_in_at ? 1 : 0;
          const bChecked = b.check_in_at ? 1 : 0;
          if (aChecked !== bChecked) return aChecked - bChecked;
          return a.name.localeCompare(b.name);
        }
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          if (a.entry_type !== b.entry_type) return a.entry_type.localeCompare(b.entry_type);
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [registrations, viewFilter, typeFilter, searchQuery, sortMode]);

  // ─── Keyboard shortcut ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // ─── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="text-[#9E065D] animate-spin" />
        <p className="text-sm text-gray-500">Loading check-in data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex flex-col items-center justify-center py-24 gap-4">
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
    );
  }

  const checkedInPct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ─── Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center shadow-lg shadow-[#9E065D]/20">
                <UserCheck size={20} className="text-white" />
              </div>
              Day-of Check-In
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Mark registrants as checked-in and track payments
            </p>
          </div>
          <button
            onClick={() => fetchRegistrations(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ─── Overall Progress Banner ──────────────────────── */}
        <div className="bg-gradient-to-r from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] rounded-2xl p-5 sm:p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9E065D]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FB50B1]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Large progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing value={stats.checkedIn} max={stats.total} size={100} strokeWidth={8} color="#FB50B1" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{checkedInPct}%</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">
                {stats.checkedIn} of {stats.total} Checked In
              </h2>
              <p className="text-white/60 text-sm">
                {stats.remaining} remaining &middot; {stats.paid} paid &middot; {stats.unpaid} unpaid
                {stats.waived > 0 && ` · ${stats.waived} waived`}
              </p>

              {/* Progress bar */}
              <div className="mt-3 w-full max-w-md bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${checkedInPct}%` }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 sm:gap-6 text-center flex-shrink-0">
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
                <p className="text-xs text-white/50">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.unpaid}</p>
                <p className="text-xs text-white/50">Unpaid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FB50B1]">{stats.checkedIn}</p>
                <p className="text-xs text-white/50">Here</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats by Entry Type ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatRingCard
            label="Vehicles"
            value={stats.vehiclesCheckedIn}
            max={stats.vehicles}
            color="#3b82f6"
            icon={Car}
            subtitle={`${stats.vehicles - stats.vehiclesCheckedIn} remaining`}
          />
          <StatRingCard
            label="Vendors"
            value={stats.vendorsCheckedIn}
            max={stats.vendors}
            color="#8b5cf6"
            icon={Store}
            subtitle={`${stats.vendors - stats.vendorsCheckedIn} remaining`}
          />
          <StatRingCard
            label="Cackle Cars"
            value={stats.cackleCheckedIn}
            max={stats.cackle}
            color="#10b981"
            icon={Car}
            subtitle={`${stats.cackle - stats.cackleCheckedIn} remaining`}
          />
        </div>

        {/* ─── Search & Filters ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, vehicle..."
                className="w-full pl-12 pr-24 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/30 focus:border-[#FB50B1] transition-all placeholder-gray-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                    className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-gray-600" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-[10px] font-mono text-gray-400">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* View filter */}
            <div className="flex items-center gap-1.5">
              {([
                { id: 'all' as ViewFilter, label: 'All', icon: Users },
                { id: 'not-checked-in' as ViewFilter, label: 'Not Checked In', icon: UserX },
                { id: 'checked-in' as ViewFilter, label: 'Checked In', icon: UserCheck },
              ]).map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setViewFilter(opt.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      viewFilter === opt.id
                        ? 'bg-[#9E065D] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={12} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              {([
                { id: 'all' as TypeFilter, label: 'All Types' },
                { id: 'vehicle' as TypeFilter, label: 'Vehicles' },
                { id: 'vendor' as TypeFilter, label: 'Vendors' },
                { id: 'cackle' as TypeFilter, label: 'Cackle' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTypeFilter(opt.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    typeFilter === opt.id
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="sm:ml-auto flex items-center gap-2">
              <ArrowUpDown size={12} className="text-gray-400" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="text-xs font-medium text-gray-600 bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/30 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="check-in">Unchecked First</option>
                <option value="recent">Most Recent</option>
                <option value="type">By Entry Type</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400">
              Showing {filteredList.length} of {registrations.length} registrant{registrations.length !== 1 ? 's' : ''}
              {viewFilter !== 'all' && ` · ${viewFilter === 'checked-in' ? 'checked in' : 'not checked in'}`}
              {typeFilter !== 'all' && ` · ${typeFilter}s`}
              {searchQuery && ` · matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        {/* ─── Toast notification ───────────────────────────── */}
        {lastAction && (
          <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 ${
            lastAction.type === 'checkin'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-white'
          }`}>
            {lastAction.type === 'checkin' ? (
              <CheckCircle2 size={16} />
            ) : (
              <Undo2 size={16} />
            )}
            {lastAction.type === 'checkin'
              ? `${lastAction.name} checked in!`
              : `${lastAction.name} check-in undone`}
          </div>
        )}

        {/* ─── Registration Cards ───────────────────────────── */}
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {searchQuery
                ? `No registrants match "${searchQuery}"`
                : 'No registrants match your filters'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setViewFilter('all'); setTypeFilter('all'); }}
              className="text-sm text-[#9E065D] hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map(r => (
              <CheckInCard
                key={r.id}
                registration={r}
                onCheckIn={handleCheckIn}
                onUndoCheckIn={handleUndoCheckIn}
                onPaymentChange={handlePaymentChange}
                updating={updatingId}
              />
            ))}
          </div>
        )}

        {/* Bottom spacer for toast */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default CheckInAdmin;
