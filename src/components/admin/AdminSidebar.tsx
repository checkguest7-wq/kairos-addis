import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  ShoppingBag,
  Wrench,
  ShieldCheck,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AdminOverviewStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';

export type AdminTab =
  | 'overview'
  | 'vehicles'
  | 'clients'
  | 'orders'
  | 'services'
  | 'warranties'
  | 'test-drives'
  | 'verifications'
  | 'messages'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  stats: AdminOverviewStats | null;
  onOpenHome: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  onOpenHome,
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
    {
      id: 'verifications',
      label: 'Doc Verifications',
      icon: FileCheck2,
      badgeCount: stats?.unverifiedDocuments,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'orders',
      label: 'Vehicle Orders',
      icon: ShoppingBag,
      badgeCount: stats?.pendingOrders,
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    },
    { id: 'vehicles', label: 'Showroom Catalog', icon: Car, badgeCount: stats?.totalCatalogVehicles },
    { id: 'clients', label: 'Client Directory', icon: Users, badgeCount: stats?.totalClients },
    {
      id: 'services',
      label: 'EV Service Center',
      icon: Wrench,
      badgeCount: stats?.pendingServices,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    },
    {
      id: 'warranties',
      label: 'YouGuard Warranties',
      icon: ShieldCheck,
      badgeCount: stats?.activeWarrantiesCount,
      badgeColor: 'bg-blue-500 text-white font-bold',
    },
    {
      id: 'test-drives',
      label: 'Test Drive Bookings',
      icon: CalendarCheck2,
      badgeCount: stats?.upcomingTestDrives,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    },
    {
      id: 'messages',
      label: 'Concierge Messages',
      icon: MessageSquare,
      badgeCount: stats?.unreadMessages,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    { id: 'settings', label: 'System & Branding', icon: Settings },
  ];

  return (
    <aside
      id="admin-sidebar"
      className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 text-slate-200 select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-between">
        <Logo />
        <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-bold">
          ADMIN
        </span>
      </div>

      {/* Admin User Info Pill */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Master Administrator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@kairosaddis.com'}</p>
          </div>
        </div>
        <button
          id="admin-logout-btn"
          onClick={() => logout()}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Operations Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`admin-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Switcher Action */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <button
          id="admin-switch-home-btn"
          onClick={onOpenHome}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700/60 cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            View Public Homepage
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </aside>
  );
};
