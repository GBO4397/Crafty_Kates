import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft, RefreshCw, Shield, Calendar, MapPin, Clock,
  CheckCircle, AlertCircle, Loader2, X, Lock, LogOut, Eye, EyeOff,
  User, Mail, Phone, Globe, Ticket, DollarSign, Tag,
  ThumbsUp, ThumbsDown, Trash2, MessageSquare, ExternalLink,
  Filter, Search, Image as ImageIcon, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time_start: string | null;
  event_time_end: string | null;
  location: string;
  address: string | null;
  category: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string | null;
  image_url: string | null;
  website_url: string | null;
  ticket_url: string | null;
  is_free: boolean;
  ticket_price: string | null;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;

const CATEGORY_LABELS: Record<string, string> = {
  'car-show': 'Car Show',
  'community': 'Community',
  'fundraiser': 'Fundraiser',
  'festival': 'Festival',
  'meetup': 'Meetup',
  'swap-meet': 'Swap Meet',
  'racing': 'Racing Event',
  'other': 'Other',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
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
      const token = btoa(Date.now().toString(36) + Math.random().toString(36).slice(2));
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9E065D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FB50B1]/8 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </Link>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9E065D]/30">
              <Calendar size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Event Admin</h1>
            <p className="text-white/40 text-sm">Review & manage community event submissions</p>
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
            <button type="submit" disabled={loading || !password.trim()} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#9E065D]/30 disabled:opacity-50 text-sm">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Event Admin Page ───────────────────────────────────────
const EventAdmin: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [eventTimes, setEventTimes] = useState<Record<string, { start: string; end: string }>>({});
  const [timeSaving, setTimeSaving] = useState<string | null>(null);
  const { toast } = useToast();

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
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('community_events')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEvents(data || []);
      // Initialize admin notes
      const notes: Record<string, string> = {};
      (data || []).forEach((e: CommunityEvent) => { notes[e.id] = e.admin_notes || ''; });
      setAdminNotes(notes);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated, fetchEvents]);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const { error: updateError, count } = await supabase
        .from('community_events')
        .update({
          status: newStatus,
          admin_notes: adminNotes[id] || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { count: 'exact' })
        .eq('id', id);

      if (updateError) throw updateError;
      if (!count || count === 0) throw new Error('Update was blocked by database permissions. Apply the Supabase RLS migration and try again.');

      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus, admin_notes: adminNotes[id] || null, reviewed_at: new Date().toISOString() } : e));
      toast({
        title: newStatus === 'approved' ? 'Event Approved' : 'Event Rejected',
        description: `The event has been ${newStatus}. ${newStatus === 'approved' ? 'It will now appear on the website.' : ''}`,
      });
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTimeUpdate = async (id: string) => {
    const times = eventTimes[id];
    if (!times) return;
    setTimeSaving(id);
    try {
      const { error } = await supabase
        .from('community_events')
        .update({
          event_time_start: times.start || null,
          event_time_end: times.end || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === id ? { ...e, event_time_start: times.start || null, event_time_end: times.end || null } : e));
      toast({ title: 'Time Saved', description: 'Event times updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
    } finally {
      setTimeSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this event submission?')) return;
    setActionLoading(id);
    try {
      const { error: deleteError, count } = await supabase
        .from('community_events')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (deleteError) throw deleteError;
      if (!count || count === 0) throw new Error('Delete was blocked by database permissions. Apply the Supabase RLS migration and try again.');

      setEvents(prev => prev.filter(e => e.id !== id));
      if (expandedEvent === id) setExpandedEvent(null);
      toast({ title: 'Deleted', description: 'Event submission has been permanently removed.' });
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete event. Check Supabase permissions.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.organizer_name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = events.filter(e => e.status === 'pending').length;
  const approvedCount = events.filter(e => e.status === 'approved').length;
  const rejectedCount = events.filter(e => e.status === 'rejected').length;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center">
        <Loader2 size={32} className="text-[#FB50B1] animate-spin" />
      </div>
    );
  }

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
                <ChevronLeft size={16} /> Home
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-200" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 leading-none">Event Admin</h1>
                  <p className="text-xs text-gray-500">Review community submissions</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700">
                  {pendingCount} pending
                </span>
              )}
              <button onClick={fetchEvents} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link to="/sponsor-admin" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors">
                <Shield size={14} />
                <span className="hidden sm:inline">Sponsors</span>
              </Link>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                <p className="text-xs text-gray-500 font-medium">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <X size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                <p className="text-xs text-gray-500 font-medium">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-[#9E065D] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to load events</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <button onClick={fetchEvents} className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline">Try again</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-[#9E065D] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading event submissions...</p>
          </div>
        )}

        {/* Events List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Calendar size={40} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No events found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {filterStatus !== 'all' ? 'Try changing the filter' : 'Community event submissions will appear here'}
                </p>
              </div>
            ) : (
              filteredEvents.map(event => {
                const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
                const isExpanded = expandedEvent === event.id;
                const isLoading = actionLoading === event.id;

                return (
                  <div key={event.id} className={`bg-white rounded-2xl border transition-all duration-300 ${
                    event.status === 'pending' ? 'border-amber-200 shadow-sm' : 'border-gray-100'
                  }`}>
                    {/* Summary Row */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-2xl"
                      onClick={() => {
                        const next = isExpanded ? null : event.id;
                        setExpandedEvent(next);
                        if (next && !eventTimes[next]) {
                          setEventTimes(prev => ({ ...prev, [next]: { start: event.event_time_start || '', end: event.event_time_end || '' } }));
                        }
                      }}
                    >
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-14 h-14 bg-[#FEE6F4]/50 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-[#9E065D] uppercase">
                          {new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-gray-900 leading-none">
                          {new Date(event.event_date + 'T12:00:00').getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-gray-900 truncate">{event.title}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
                          <span className="flex items-center gap-1"><User size={11} /> {event.organizer_name}</span>
                          <span className="flex items-center gap-1"><Tag size={11} /> {CATEGORY_LABELS[event.category] || event.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {event.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(event.id, 'approved'); }}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(event.id, 'rejected'); }}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <ThumbsDown size={12} />
                              Reject
                            </button>
                          </>
                        )}
                        <ChevronLeft size={16} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <div className="grid md:grid-cols-2 gap-6 pt-5">
                          {/* Event Details */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Event Details</h5>
                            
                            {event.description && (
                              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{event.description}</p>
                            )}

                            {/* Flyer / Image Preview */}
                            {event.image_url && (
                              <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                                <a href={event.image_url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={event.image_url}
                                    alt={`Flyer for ${event.title}`}
                                    className="w-full max-h-56 object-contain bg-gray-50 hover:opacity-90 transition-opacity cursor-pointer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </a>
                                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <ImageIcon size={12} className="text-[#9E065D]" />
                                    Event Flyer / Image
                                  </span>
                                  <a
                                    href={event.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#9E065D] hover:underline flex items-center gap-1"
                                  >
                                    Open full size <ExternalLink size={10} />
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-start gap-2 text-sm">
                                <Calendar size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">Date</p>
                                  <p className="text-gray-900">{new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <Clock size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-400 font-medium mb-1">Time</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                      type="time"
                                      value={eventTimes[event.id]?.start ?? event.event_time_start ?? ''}
                                      onChange={e => setEventTimes(prev => ({ ...prev, [event.id]: { ...prev[event.id], start: e.target.value } }))}
                                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
                                    />
                                    <span className="text-gray-400 text-xs">to</span>
                                    <input
                                      type="time"
                                      value={eventTimes[event.id]?.end ?? event.event_time_end ?? ''}
                                      onChange={e => setEventTimes(prev => ({ ...prev, [event.id]: { ...prev[event.id], end: e.target.value } }))}
                                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D]"
                                    />
                                    <button
                                      onClick={() => handleTimeUpdate(event.id)}
                                      disabled={timeSaving === event.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#9E065D] hover:bg-[#FB50B1] text-white rounded-lg text-xs transition-colors disabled:opacity-50"
                                    >
                                      {timeSaving === event.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">Location</p>
                                  <p className="text-gray-900">{event.location}</p>
                                  {event.address && <p className="text-xs text-gray-500">{event.address}</p>}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <DollarSign size={14} className="text-[#9E065D] mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">Admission</p>
                                  <p className="text-gray-900">{event.is_free ? 'Free' : event.ticket_price || 'Paid'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              {event.website_url && (
                                <a href={event.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors">
                                  <Globe size={12} /> Website <ExternalLink size={10} />
                                </a>
                              )}
                              {event.ticket_url && (
                                <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors">
                                  <Ticket size={12} /> Tickets <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>


                          {/* Contact & Admin */}
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Organizer Contact</h5>
                              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <User size={14} className="text-gray-400" />
                                  <span className="font-medium text-gray-900">{event.organizer_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail size={14} className="text-gray-400" />
                                  <a href={`mailto:${event.organizer_email}`} className="text-[#9E065D] hover:underline">{event.organizer_email}</a>
                                </div>
                                {event.organizer_phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone size={14} className="text-gray-400" />
                                    <a href={`tel:${event.organizer_phone}`} className="text-gray-700 hover:text-[#9E065D]">{event.organizer_phone}</a>
                                  </div>
                                )}
                                <p className="text-[10px] text-gray-400 pt-1">
                                  Submitted {new Date(event.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MessageSquare size={12} /> Admin Notes
                              </h5>
                              <textarea
                                value={adminNotes[event.id] || ''}
                                onChange={e => setAdminNotes(prev => ({ ...prev, [event.id]: e.target.value }))}
                                placeholder="Internal notes about this submission..."
                                rows={3}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9E065D]/20 focus:border-[#9E065D] transition-all resize-none"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                              {event.status !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(event.id, 'approved')}
                                  disabled={isLoading}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                                  Approve
                                </button>
                              )}
                              {event.status !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(event.id, 'rejected')}
                                  disabled={isLoading}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                                >
                                  <ThumbsDown size={14} />
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(event.id)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors ml-auto"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventAdmin;
