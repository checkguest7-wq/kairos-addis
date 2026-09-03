import React from 'react';
import { motion } from 'motion/react';
import {
  Car,
  ShieldCheck,
  Wrench,
  ShoppingBag,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Gauge,
  BatteryCharging,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  MessageSquare,
  Star,
  Zap,
} from 'lucide-react';
import { PortalDashboardData } from '../../types';
import { PortalTab } from './PortalSidebar';
import { useDynamicWarranty } from '../../lib/warrantyCalculator';

interface PortalDashboardOverviewProps {
  data: PortalDashboardData;
  onNavigateTab: (tab: PortalTab) => void;
  onOpenBookService: () => void;
}

export const PortalDashboardOverview: React.FC<PortalDashboardOverviewProps> = ({
  data,
  onNavigateTab,
  onOpenBookService,
}) => {
  const { user, vehicle, warranty, serviceHistory, notifications, documents, orders, testDrives } = data;

  const unreadNotifs = notifications?.filter((n) => !n.read) || [];

  const {
    vehicleWarranty,
    batteryWarranty,
    batteryMileage,
    overallStatus,
  } = useDynamicWarranty(warranty, vehicle);

  const docCount = [
    documents?.faydaIdFront,
    documents?.faydaIdBack,
    documents?.drivingLicenceFront,
    documents?.drivingLicenceBack,
  ].filter(Boolean).length;

  const hasAllDocs = docCount === 4;

  const activeOrders = orders?.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') || [];

  return (
    <div className="space-y-8">
      {/* Top Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-blue-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AUTHENTICATED CUSTOMER PORTAL
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user.fullName}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Manage your electric vehicles, dynamic YouGuard warranty protection, custom import orders, verified documents, and certified maintenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dash-browse-vehicles-top"
              onClick={() => onNavigateTab('vehicles')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Car className="w-4 h-4" />
              <span>EXPLORE VEHICLES</span>
            </button>
            <button
              id="btn-dash-book-service-top"
              onClick={onOpenBookService}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>REQUEST SERVICE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary 3-Column Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. VEHICLE / CATALOG CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>VEHICLES & FLEET</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold">
                {vehicle ? 'REGISTERED' : 'CATALOG AVAILABLE'}
              </span>
            </div>

            {vehicle ? (
              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{vehicle.model}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Plate: <strong className="text-slate-200 font-mono">{vehicle.registrationNumber}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">VIN</span>
                    <p className="font-mono text-slate-300 truncate">{vehicle.vin}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Current Mileage</span>
                    <p className="text-slate-200 font-bold font-mono">{vehicle.mileageKm.toLocaleString()} KM</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Battery SoH</span>
                    <p className="text-emerald-400 font-bold">{vehicle.batteryHealthPercent}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Range</span>
                    <p className="text-cyan-300 font-bold">{vehicle.rangeRemainingKm} KM</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <p className="font-semibold text-white">Kairos Addis EV Lineup</p>
                  <p className="text-slate-400 mt-1">
                    Browse BYD Tang L, Geely Galaxy E5, and Toyota bZ4X with official duty-free import clearance.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-5">
            <button
              id="btn-dash-view-vehicles"
              onClick={() => onNavigateTab('vehicles')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
            >
              <span>BROWSE VEHICLES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* 2. DYNAMIC WARRANTY CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>DYNAMIC WARRANTY</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                  overallStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {warranty ? overallStatus : 'NOT REGISTERED'}
              </span>
            </div>

            {warranty ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">YouGuard Policy:</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {warranty.certificateNumber || 'YG-ETH-ACTIVE'}
                  </span>
                </div>

                {/* Dynamic Countdown Display */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                    Remaining Protection Period
                  </span>
                  <div className="text-sm font-extrabold text-white">
                    {vehicleWarranty.years} Years, {vehicleWarranty.months} Months, {vehicleWarranty.days} Days
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Calculated live from official start & expiration dates.
                  </div>
                </div>

                {/* Battery & Mileage */}
                <div className="space-y-1 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battery Mileage:</span>
                    <strong className="text-emerald-400 font-mono">
                      {vehicle?.mileageKm ? `${(160000 - vehicle.mileageKm).toLocaleString()} KM remaining` : '160,000 KM Limit'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No warranty registered yet.</p>
                <p className="text-[11px] text-slate-500">Links automatically upon vehicle delivery.</p>
              </div>
            )}
          </div>

          <div className="pt-5">
            <button
              id="btn-dash-view-warranty"
              onClick={() => onNavigateTab('warranty')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
            >
              <span>VIEW WARRANTY DETAILS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* 3. MY ORDERS & DOCUMENTS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>MY ORDERS & DOCS</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  hasAllDocs
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {hasAllDocs ? 'DOCS VERIFIED' : `${docCount}/4 DOCS`}
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {/* Document status preview */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Fayda ID & Licence
                  </span>
                  <span className="font-bold text-xs text-white">{docCount}/4 Complete</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      hasAllDocs ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(docCount / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Active Orders Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Active Vehicle Orders:</span>
                  <span className="font-bold text-cyan-300">{activeOrders.length}</span>
                </div>
                {activeOrders.length > 0 ? (
                  <p className="text-[11px] text-slate-300 font-medium truncate mt-1">
                    Latest: {activeOrders[0].vehicleName} ({activeOrders[0].orderNumber})
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    No active import orders currently in progress.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-5 grid grid-cols-2 gap-2">
            <button
              id="btn-dash-view-orders"
              onClick={() => onNavigateTab('orders')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider text-center transition-colors border border-slate-700/60"
            >
              MY ORDERS
            </button>
            <button
              id="btn-dash-view-docs"
              onClick={() => onNavigateTab('documents')}
              className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider text-center transition-colors border border-cyan-500/40"
            >
              DOCUMENTS
            </button>
          </div>
        </motion.div>
      </div>

      {/* Large Action Banner: BOOK A SERVICE */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase">
            <Wrench className="w-4 h-4" />
            <span>KAIROS ADDIS EV SERVICE CENTER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Need EV Maintenance, Diagnostics, or Software Update?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Our certified master technicians in Bole perform high-voltage battery optimization, brake inspection, software flashes, and multi-point safety checks.
          </p>
        </div>

        <button
          id="btn-dash-book-service-hero"
          onClick={onOpenBookService}
          className="shrink-0 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-2.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>REQUEST SERVICE</span>
        </button>
      </div>

      {/* Secondary Row: SERVICE HISTORY & NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SERVICE HISTORY PREVIEW */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>SERVICE HISTORY</span>
              </div>
              {serviceHistory?.length > 0 && (
                <button
                  onClick={() => onNavigateTab('service')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  See All ({serviceHistory.length})
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {serviceHistory && serviceHistory.length > 0 ? (
                serviceHistory.slice(0, 2).map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{record.serviceType}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{record.date}</span>
                        <span>•</span>
                        <span>{record.vehicle}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-3 bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
                  <p className="text-sm font-bold text-white">No Active Requests</p>
                  <p className="text-xs text-slate-400">You have no previous or pending service requests.</p>
                  <button
                    onClick={onOpenBookService}
                    className="mt-1 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider transition-colors border border-cyan-500/40 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Request Service</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              id="btn-dash-view-service-history"
              onClick={() => onNavigateTab('service')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
            >
              <span>VIEW FULL SERVICE LOGS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS & MESSAGES PREVIEW */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>NOTIFICATIONS & UPDATES</span>
              </div>
              {unreadNotifs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  {unreadNotifs.length} Unread
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {notifications && notifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab('notifications')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.read
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-950 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.08)]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.read ? 'bg-slate-600' : 'bg-cyan-400 animate-pulse'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 grid grid-cols-2 gap-2">
            <button
              id="btn-dash-messages"
              onClick={() => onNavigateTab('messages')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Messages</span>
            </button>
            <button
              id="btn-dash-view-all-notifications"
              onClick={() => onNavigateTab('notifications')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
