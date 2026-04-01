import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft, Lock, LogOut, Eye, EyeOff,
  AlertCircle, Loader2
} from 'lucide-react';

// ─── Shared Admin Password ──────────────────────────────────────
// All admin pages use this same password.
// For production, use an environment variable or edge function.
export const ADMIN_PASSWORD = 'CraftyKates2026!';

// Generate a simple token for session persistence
export function generateAdminToken(): string {
  return btoa(Date.now().toString(36) + Math.random().toString(36).slice(2));
}

// Check if user is currently authenticated
export function checkAdminAuth(): boolean {
  const token = localStorage.getItem('ck_admin_token');
  const expires = localStorage.getItem('ck_admin_expires');
  return !!(token && expires && new Date(expires) > new Date());
}

// Perform logout
export function adminLogout(): void {
  localStorage.removeItem('ck_admin_token');
  localStorage.removeItem('ck_admin_expires');
  supabase.functions.invoke('verify-admin', { body: { action: 'logout' } }).catch(() => {});
}

// ─── Admin Login Gate Component ─────────────────────────────────
interface AdminLoginGateProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  onAuthenticated: () => void;
}

const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  title,
  subtitle = 'Enter your admin password to continue',
  icon,
  backTo = '/',
  backLabel = 'Back to Home',
  onAuthenticated,
}) => {
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
      // Try edge function first (if deployed)
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        body: { password, action: 'login' },
      });

      if (!fnError && data?.success) {
        localStorage.setItem('ck_admin_token', data.token);
        localStorage.setItem('ck_admin_expires', data.expiresAt);
        onAuthenticated();
        return;
      }
    } catch (_) {
      // Edge function not available — fall through to client-side check
    }

    // Client-side password check (fallback)
    if (password === ADMIN_PASSWORD) {
      const token = generateAdminToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
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
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          {backLabel}
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9E065D]/30">
              {icon}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-white/40 text-sm">{subtitle}</p>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            Protected area — authorized personnel only
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/30 hover:text-white/50 text-xs transition-colors">
            Crafty Kates Promotions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginGate;
