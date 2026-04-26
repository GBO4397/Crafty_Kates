import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, LogOut, Eye, EyeOff, AlertCircle, Loader2, ChevronLeft,
  Shield, Calendar, ClipboardList, LayoutDashboard, ChevronRight,
  Menu, X, Ticket, UserCheck, Users, FileText, Star, Contact, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth, adminLogout, generateAdminToken } from '@/components/admin/AdminLoginGate';
import { useAdminPermissions, AdminPermission } from '@/hooks/useAdminPermissions';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;

const SponsorAdmin = lazy(() => import('./SponsorAdmin'));
const EventAdmin = lazy(() => import('./EventAdmin'));
const OrganizerChecklist = lazy(() => import('./OrganizerChecklist'));
const RegistrationAdmin = lazy(() => import('./RegistrationAdmin'));
const CheckInAdmin = lazy(() => import('./CheckInAdmin'));
const UserManagementAdmin = lazy(() => import('./UserManagementAdmin'));
const FollowUpPostsAdmin = lazy(() => import('./FollowUpPostsAdmin'));
const TestimonialsAdmin = lazy(() => import('./TestimonialsAdmin'));
const OrganizersAdmin = lazy(() => import('./OrganizersAdmin'));
const ColoringBookAdmin = lazy(() => import('./ColoringBookAdmin'));

type AdminTool =
  | 'sponsors'
  | 'events'
  | 'registrations'
  | 'checkin'
  | 'checklist'
  | 'users'
  | 'followup'
  | 'testimonials'
  | 'organizers'
  | 'coloringbooks';

interface ToolConfig {
  id: AdminTool;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  permission: AdminPermission;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'sponsors',
    label: 'Sponsor Admin',
    shortLabel: 'Sponsors',
    description: 'Manage sponsors & logos',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    permission: 'sponsor_admin',
  },
  {
    id: 'events',
    label: 'Event Admin',
    shortLabel: 'Events',
    description: 'Review community submissions',
    icon: Calendar,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    permission: 'event_admin',
  },
  {
    id: 'registrations',
    label: 'Registrations',
    shortLabel: 'Regs',
    description: 'Car show registration entries',
    icon: Ticket,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    permission: 'registrations',
  },
  {
    id: 'checkin',
    label: 'Check-In',
    shortLabel: 'Check-In',
    description: 'Day-of event check-in system',
    icon: UserCheck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    permission: 'checkin',
  },
  {
    id: 'organizers',
    label: 'Organizers',
    shortLabel: 'Organizers',
    description: 'Manage event organizer contacts',
    icon: Contact,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    permission: 'organizers',
  },
  {
    id: 'checklist',
    label: 'Organizer Checklist',
    shortLabel: 'Checklist',
    description: 'Car show planning tasks',
    icon: ClipboardList,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    permission: 'checklist',
  },
  {
    id: 'followup',
    label: 'Follow-up Posts',
    shortLabel: 'Follow-ups',
    description: 'Post-event recaps & highlights',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    permission: 'follow_up_posts',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    shortLabel: 'Testimonials',
    description: 'Manage testimonials by event',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    permission: 'testimonials',
  },
  {
    id: 'users',
    label: 'User Management',
    shortLabel: 'Users',
    description: 'Invite admins & assign access',
    icon: Users,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    permission: 'user_management',
  },
  {
    id: 'coloringbooks',
    label: 'Coloring Books',
    shortLabel: 'Coloring',
    description: 'Review & approve submissions',
    icon: BookOpen,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    permission: 'coloring_book_admin',
  },
];

// ─── Login Screen ────────────────────────────────────────────────
const AdminLogin: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
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
      const token = generateAdminToken();
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

      <div className="relative w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9E065D]/30">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Sign in to access all admin tools</p>
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
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            Protected area — authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-10 h-10 border-[3px] border-[#9E065D] border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-gray-500">Loading...</p>
  </div>
);

// ─── Main Admin Dashboard ────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTool, setActiveTool] = useState<AdminTool | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const permissions = useAdminPermissions();

  useEffect(() => {
    setIsAuthenticated(checkAdminAuth());
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setActiveTool(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center">
        <Loader2 size={32} className="text-[#FB50B1] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Determine which tools the user can see
  const visibleTools = TOOLS.filter(t => permissions.hasPermission(t.permission));

  if (!activeTool) {
    return (
      <div className="min-h-screen bg-gray-50/80">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#9E065D] transition-colors">
                  <ChevronLeft size={16} /> Home
                </Link>
                <div className="hidden sm:block w-px h-6 bg-gray-200" />
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={16} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900 leading-none">Admin Dashboard</h1>
                    <p className="text-xs text-gray-500">Select a tool to get started</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What would you like to work on?</h2>
            <p className="text-gray-500">Select an admin tool below to get started.</p>
          </div>

          {permissions.loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="text-[#9E065D] animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTools.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-[#FB50B1]/40 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#FB50B1]/5 hover:-translate-y-0.5"
                  >
                    <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={22} className={tool.color} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#9E065D] transition-colors">{tool.label}</h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                    <ChevronRight size={18} className="absolute top-6 right-5 text-gray-300 group-hover:text-[#FB50B1] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  const activeConfig = TOOLS.find(t => t.id === activeTool)!;
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
      >
        {sidebarOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-[56] lg:z-auto h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 leading-none truncate">Admin Panel</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Crafty Kates</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tools</p>
          <div className="space-y-0.5">
            {visibleTools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTool(tool.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FEE6F4] to-[#FEE6F4]/50 text-[#9E065D] shadow-sm border border-[#FB50B1]/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-[#9E065D]/10' : 'bg-gray-100'
                  }`}>
                    <Icon size={15} className={isActive ? 'text-[#9E065D]' : 'text-gray-500'} />
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-sm font-medium truncate ${isActive ? 'text-[#9E065D]' : ''}`}>{tool.label}</span>
                    <span className="block text-[10px] text-gray-400 truncate">{tool.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-100 px-3 py-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-[#9E065D] hover:bg-[#FEE6F4]/30 rounded-lg transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3 pl-14">
            <div className={`w-8 h-8 ${activeConfig.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <ActiveIcon size={15} className={activeConfig.color} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">{activeConfig.label}</h1>
              <p className="text-[11px] text-gray-500">{activeConfig.description}</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <div className="min-h-screen">
            {activeTool === 'sponsors' && <SponsorAdmin embedded />}
            {activeTool === 'events' && <EventAdmin embedded />}
            {activeTool === 'registrations' && <RegistrationAdmin embedded />}
            {activeTool === 'checkin' && <CheckInAdmin embedded />}
            {activeTool === 'checklist' && <OrganizerChecklist embedded />}
            {activeTool === 'users' && <UserManagementAdmin embedded />}
            {activeTool === 'followup' && <FollowUpPostsAdmin embedded />}
            {activeTool === 'testimonials' && <TestimonialsAdmin embedded />}
            {activeTool === 'organizers' && <OrganizersAdmin embedded />}
            {activeTool === 'coloringbooks' && <ColoringBookAdmin embedded />}
          </div>
        </Suspense>
      </main>
    </div>
  );
};

export default AdminDashboard;
