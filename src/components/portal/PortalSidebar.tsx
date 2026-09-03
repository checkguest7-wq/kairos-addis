import React from 'react';
import {
  LayoutDashboard,
  Car,
  ShieldCheck,
  Wrench,
  Compass,
  Bell,
  User,
  LogOut,
  X,
  ExternalLink,
  ShoppingBag,
  FileCheck,
  MessageSquare,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';

export type PortalTab =
  | 'dashboard'
  | 'vehicles'
  | 'vehicle'
  | 'orders'
  | 'documents'
  | 'service'
  | 'warranty'
  | 'test-drives'
  | 'messages'
  | 'testimonial'
  | 'testimonials'
  | 'notifications'
  | 'profile';

interface PortalSidebarProps {
  currentTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onBackToWebsite: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
  mobileOpen,
  onCloseMobile,
  onBackToWebsite,
}) => {
  const { user, logout } = useAuth();

  const menuItems: { id: PortalTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'service', label: 'Service History', icon: Wrench },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { id: 'test-drives', label: 'Test Drives', icon: Compass },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'testimonial', label: 'Testimonial', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tab: PortalTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 text-white selection:bg-cyan-500/30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <Logo imgClassName="h-8 w-auto max-h-10 object-contain" />

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              id={`sidebar-nav-${item.id}`}
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Showroom Links
        </div>

        {user?.role === 'admin' && (
          <button
            id="sidebar-admin-console-btn"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/admin';
              }
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm mb-1"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Executive Admin Console
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
              ADMIN
            </span>
          </button>
        )}

        <button
          onClick={onBackToWebsite}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            Main Website
          </span>
        </button>
      </nav>

      {/* User Profile & Log Out Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-cyan-500/30">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Customer'}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email || ''}</div>
          </div>
        </div>

        <button
          id="btn-sidebar-logout"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-500/30 transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          <span>LOG OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide Over) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
