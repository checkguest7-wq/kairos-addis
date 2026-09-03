import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AdminOverviewStats } from '../../types';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminVehiclesView } from './AdminVehiclesView';
import { AdminClientsView } from './AdminClientsView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminServicesView } from './AdminServicesView';
import { AdminWarrantiesView } from './AdminWarrantiesView';
import { AdminTestDrivesView } from './AdminTestDrivesView';
import { AdminVerificationsView } from './AdminVerificationsView';
import { AdminMessagesView } from './AdminMessagesView';
import { AdminSettingsView } from './AdminSettingsView';
import { Logo } from '../Logo';
import {
  ShieldCheck,
  ShieldAlert,
  LogIn,
  Lock,
  Mail,
  ChevronLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface AdminAppProps {
  onOpenHome: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onOpenHome }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Admin login credentials state (never exposed to visitors)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchOverview = async () => {
    setIsLoadingStats(true);
    try {
      const res = await api.adminGetOverview();
      setStats(res.stats);
      setRecentActivities(res.recentActivities || []);
    } catch (err: any) {
      console.warn('[ADMIN OVERVIEW FETCH ERROR]', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOverview();
    }
  }, [isAuthenticated, user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await login(adminEmail.trim(), adminPassword);
    } catch (err: any) {
      if (err.notFound) {
        setLoginError('Account not found');
      } else {
        setLoginError(err.message || 'Invalid credentials.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated or not an admin: Show Executive Admin Sign-In Screen
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Background Ambience aligned with main portal theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-700/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            id="admin-btn-back-to-site"
            onClick={onOpenHome}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Kairos Addis Showroom
          </button>

          <div className="flex items-center gap-4">
            <Logo />
          </div>
        </header>

        {/* Main Admin Login Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Header matching Picture 1 */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-5">
                  <Logo className="justify-center" imgClassName="h-12 w-auto max-h-14 object-contain" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Admin Portal
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  Sign in to manage your website
                </p>
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </motion.div>
              )}

              {isAuthenticated && user?.role !== 'admin' && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Logged in as customer ({user.email}). Please sign in with administrator credentials.</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-5">
                {/* Admin Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-login-email-input"
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@kairosaddis.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-4 text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>AUTHENTICATE & ACCESS CONSOLE</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </main>

        {/* Bottom Footer Info */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
          <p>© 2026 Kairos Addis Automotive PLC · Bole Medhanialem & Bole Wollo Sefer</p>
        </footer>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        stats={stats}
        onOpenHome={onOpenHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/20">
              {currentTab.toUpperCase().replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOverview}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="text-right">
              <span className="text-[11px] font-bold text-white block">{user?.fullName || 'Master Administrator'}</span>
              <span className="text-[10px] text-cyan-400 font-mono block">Executive Admin</span>
            </div>
          </div>
        </header>

        {/* View Content Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          {currentTab === 'overview' && (
            <AdminOverviewView
              stats={stats}
              recentActivities={recentActivities}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onRefresh={fetchOverview}
            />
          )}
          {currentTab === 'vehicles' && <AdminVehiclesView onCatalogUpdated={fetchOverview} />}
          {currentTab === 'clients' && <AdminClientsView />}
          {currentTab === 'orders' && <AdminOrdersView />}
          {currentTab === 'services' && <AdminServicesView />}
          {currentTab === 'warranties' && <AdminWarrantiesView />}
          {currentTab === 'test-drives' && <AdminTestDrivesView />}
          {currentTab === 'verifications' && <AdminVerificationsView />}
          {currentTab === 'messages' && <AdminMessagesView />}
          {currentTab === 'settings' && <AdminSettingsView />}
        </div>
      </main>
    </div>
  );
};
