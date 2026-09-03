import React from 'react';
import {
  Users,
  ShoppingBag,
  Wrench,
  ShieldCheck,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  Car,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { AdminOverviewStats } from '../../types';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewViewProps {
  stats: AdminOverviewStats | null;
  recentActivities: any[];
  onSelectTab: (tab: AdminTab) => void;
  onRefresh: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  stats,
  recentActivities,
  onSelectTab,
  onRefresh,
}) => {
  return (
    <div id="admin-overview-view" className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-cyan-500/20 p-6 lg:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Operations Console
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white tracking-wide">
              Kairos Addis Automotive Management
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Real-time monitoring of EV import orders, Fayda & Driving Licence compliance verifications, YouGuard
              warranties, and Bole Medhanialem service center bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-quick-add-vehicle-btn"
              onClick={() => onSelectTab('vehicles')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Car className="w-4 h-4" />
              Manage Catalog
            </button>
            <button
              id="admin-quick-verify-btn"
              onClick={() => onSelectTab('verifications')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Verify Documents ({stats?.unverifiedDocuments || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Action Alerts */}
      {(stats?.unverifiedDocuments || 0) > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300">
                {stats?.unverifiedDocuments} Document(s) Awaiting Review
              </p>
              <p className="text-xs text-slate-400">
                Fayda National IDs and Driving Licences must be verified before vehicle import orders can be processed.
              </p>
            </div>
          </div>
          <button
            id="admin-alert-verify-btn"
            onClick={() => onSelectTab('verifications')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Review Now
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div
          onClick={() => onSelectTab('clients')}
          className="group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{stats?.totalClients || 0}</span>
            <span className="text-xs text-cyan-400 flex items-center gap-1">
              Registered Accounts <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onSelectTab('orders')}
          className="group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{stats?.pendingOrders || 0}</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              {stats?.acceptedOrders || 0} In Progress <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Active YouGuard Warranties */}
        <div
          onClick={() => onSelectTab('warranties')}
          className="group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active Warranties</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{stats?.activeWarrantiesCount || 0}</span>
            <span className="text-xs text-blue-400 flex items-center gap-1">
              YouGuard Certified <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* EV Services */}
        <div
          onClick={() => onSelectTab('services')}
          className="group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Service Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{stats?.scheduledServices || 0}</span>
            <span className="text-xs text-cyan-400 flex items-center gap-1">
              {stats?.pendingServices || 0} Pending <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Operational Quick Hub & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operational Workspaces */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Operational Modules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="admin-nav-orders-card"
                onClick={() => onSelectTab('orders')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all hover:bg-slate-800/40 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {stats?.pendingOrders || 0} pending
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Vehicle Order Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage import order milestones (1-6), verify compliance, and assign vehicle VINs.
                </p>
              </button>

              <button
                id="admin-nav-verifications-card"
                onClick={() => onSelectTab('verifications')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all hover:bg-slate-800/40 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {stats?.unverifiedDocuments || 0} pending
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Fayda & Licence Verifications
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect customer government IDs & licences with instant approve/reject controls.
                </p>
              </button>

              <button
                id="admin-nav-warranties-card"
                onClick={() => onSelectTab('warranties')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all hover:bg-slate-800/40 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {stats?.activeWarrantiesCount || 0} active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  YouGuard Warranty Manager
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Issue 5-year vehicle and 8-year battery certificates for confirmed buyers.
                </p>
              </button>

              <button
                id="admin-nav-testdrives-card"
                onClick={() => onSelectTab('test-drives')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all hover:bg-slate-800/40 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <CalendarCheck2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {stats?.upcomingTestDrives || 0} scheduled
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Test Drive Concierge
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule Bole Wollo Sefer showroom test drives and notify customers.
                </p>
              </button>
            </div>
          </div>

          {/* Showroom & Service Center Location Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Kairos Addis Service Center: Bole Medhanialem</h3>
              <p className="text-xs text-slate-400">
                Operating Hours: Monday – Saturday: 8:30 AM – 6:00 PM | Sunday: 10:00 AM – 4:00 PM
              </p>
              <p className="text-xs text-amber-400/90 font-mono">
                Concierge Hotline: +251 953 991 901 | info@kairosaddis.com
              </p>
            </div>
            <button
              onClick={() => onSelectTab('settings')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0"
            >
              Update Settings
            </button>
          </div>
        </div>

        {/* Right 1 Col: Recent Activities Live Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Activity Feed
            </h2>
            <button
              onClick={onRefresh}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {act.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{act.date}</span>
                  </div>
                  <p className="text-xs font-medium text-white truncate">{act.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[11px] text-amber-300 font-mono">{act.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent activities recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
