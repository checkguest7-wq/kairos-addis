import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Bell,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { PortalDashboardData, Appointment } from '../../types';
import { PortalSidebar, PortalTab } from './PortalSidebar';
import { PortalDashboardOverview } from './PortalDashboardOverview';
import { PortalVehiclesCatalogView } from './PortalVehiclesCatalogView';
import { PortalOrdersView } from './PortalOrdersView';
import { PortalDocumentsSection } from './PortalDocumentsSection';
import { PortalWarrantyView } from './PortalWarrantyView';
import { PortalServiceHistoryView } from './PortalServiceHistoryView';
import { PortalBookServiceModal } from './PortalBookServiceModal';
import { PortalTestDrivesView } from './PortalTestDrivesView';
import { PortalMessagesView } from './PortalMessagesView';
import { PortalTestimonialsView } from './PortalTestimonialsView';
import { PortalNotificationsView } from './PortalNotificationsView';
import { PortalProfileView } from './PortalProfileView';

interface PortalDashboardProps {
  initialTab?: PortalTab;
  onBackToWebsite: () => void;
}

export const PortalDashboard: React.FC<PortalDashboardProps> = ({
  initialTab = 'dashboard',
  onBackToWebsite,
}) => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<PortalTab>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookServiceModalOpen, setBookServiceModalOpen] = useState(false);
  const [messageInitialTopic, setMessageInitialTopic] = useState<string | undefined>(undefined);

  const [data, setData] = useState<PortalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('[PORTAL DATA FETCH ERROR]', err);
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleServiceBooked = () => {
    fetchDashboardData();
  };

  const handleNavigateToMessages = (contextTopic?: string) => {
    setMessageInitialTopic(contextTopic);
    setCurrentTab('messages');
  };

  const unreadNotifsCount = data?.notifications?.filter((n) => !n.read).length || 0;
  const unreadMessagesCount = data?.messages?.filter((m) => !m.read && m.senderRole === 'ADMIN').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Loading Customer Portal...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 max-w-md">
          <p className="text-sm font-semibold">{error || 'Unable to connect to portal service.'}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <PortalSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        unreadNotificationsCount={unreadNotifsCount}
        unreadMessagesCount={unreadMessagesCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onBackToWebsite={onBackToWebsite}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Kairos Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-cyan-400 capitalize font-medium">{currentTab.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('messages')}
              className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab('notifications')}
              className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-slate-950">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-semibold hidden sm:inline">{user?.fullName?.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'dashboard' && (
                <PortalDashboardOverview
                  data={data}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenBookService={() => setBookServiceModalOpen(true)}
                />
              )}

              {currentTab === 'vehicles' && (
                <PortalVehiclesCatalogView
                  documents={data.documents}
                  onNavigateToDocuments={() => setCurrentTab('documents')}
                  onNavigateToOrders={() => setCurrentTab('orders')}
                  onNavigateToTestDrives={() => setCurrentTab('test-drives')}
                  onRefreshData={fetchDashboardData}
                  onOrderPlaced={() => {
                    fetchDashboardData();
                    setCurrentTab('orders');
                  }}
                />
              )}

              {currentTab === 'orders' && (
                <PortalOrdersView
                  orders={data.orders || []}
                  onNavigateToVehicles={() => setCurrentTab('vehicles')}
                  onNavigateToMessages={handleNavigateToMessages}
                />
              )}

              {currentTab === 'documents' && (
                <PortalDocumentsSection
                  documents={data.documents}
                  onRefresh={fetchDashboardData}
                  onNavigateToVehicles={() => setCurrentTab('vehicles')}
                />
              )}

              {currentTab === 'warranty' && (
                <PortalWarrantyView
                  warranty={data.warranty}
                  vehicle={data.vehicle}
                  onBookInspection={() => setBookServiceModalOpen(true)}
                />
              )}

              {currentTab === 'service' && (
                <PortalServiceHistoryView
                  serviceHistory={data.serviceHistory}
                  onBookService={() => setBookServiceModalOpen(true)}
                />
              )}

              {currentTab === 'test-drives' && (
                <PortalTestDrivesView
                  testDrives={data.testDrives}
                  onRefresh={fetchDashboardData}
                />
              )}

              {currentTab === 'messages' && (
                <PortalMessagesView
                  messages={data.messages || []}
                  onRefresh={fetchDashboardData}
                  initialTopic={messageInitialTopic}
                />
              )}

              {(currentTab === 'testimonials' || currentTab === 'testimonial') && (
                <PortalTestimonialsView
                  testimonials={data.testimonials || []}
                  onRefresh={fetchDashboardData}
                />
              )}

              {currentTab === 'notifications' && (
                <PortalNotificationsView
                  notifications={data.notifications}
                  onRefresh={fetchDashboardData}
                />
              )}

              {currentTab === 'profile' && (
                <PortalProfileView
                  documents={data.documents}
                  onRefresh={fetchDashboardData}
                  onNavigateToVehicles={() => setCurrentTab('vehicles')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Book Service Modal */}
      <PortalBookServiceModal
        vehicle={data.vehicle}
        isOpen={bookServiceModalOpen}
        onClose={() => setBookServiceModalOpen(false)}
        onAppointmentBooked={handleServiceBooked}
      />
    </div>
  );
};
