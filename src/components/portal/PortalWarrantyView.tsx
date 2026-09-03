import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Activity,
  Gauge,
  Timer,
} from 'lucide-react';
import { WarrantyDetails, PortalVehicle } from '../../types';
import { useDynamicWarranty } from '../../lib/warrantyCalculator';

interface PortalWarrantyViewProps {
  warranty: WarrantyDetails | null;
  vehicle?: PortalVehicle | null;
  onBookInspection: () => void;
}

export const PortalWarrantyView: React.FC<PortalWarrantyViewProps> = ({
  warranty,
  vehicle,
  onBookInspection,
}) => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimType, setClaimType] = useState('Battery Performance Scan');
  const [claimNotes, setClaimNotes] = useState('');

  const {
    vehicleWarranty,
    batteryWarranty,
    batteryMileage,
    vehicleMileage,
  } = useDynamicWarranty(warranty, vehicle);

  if (!vehicle || !warranty) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xl font-bold text-white">No warranty registered.</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Your warranty will appear here once your vehicle is registered by our team.
        </p>
      </div>
    );
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
    setTimeout(() => {
      setClaimSubmitted(false);
      setClaimModalOpen(false);
      setClaimNotes('');
    }, 2000);
  };

  const vehicleStartDate = warranty.vehicleWarrantyStartDate || warranty.startDate || 'Initial Registration';
  const batteryStartDate = warranty.batteryWarrantyStartDate || warranty.startDate || 'Initial Registration';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            YOUGUARD OFFICIAL WARRANTY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Warranty & Protection Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Certificate ID: <strong className="font-mono text-cyan-300">{warranty.certificateNumber}</strong> • Partner: {warranty.partner}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-warranty-claim"
            onClick={() => setClaimModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            File Warranty Inquiry
          </button>
          <button
            id="btn-warranty-book-inspect"
            onClick={onBookInspection}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Schedule Inspection
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Live Countdown Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-300">
                LIVE TRACTION BATTERY COUNTDOWN (8-YEAR POLICY)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {batteryWarranty.isExpired ? (
                <span className="text-red-400">Coverage Period Expired</span>
              ) : (
                <span>{batteryWarranty.formattedDetailed} Remaining</span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Valid through <span className="text-white font-semibold">{warranty.batteryWarrantyEndDate}</span> or{' '}
              <span className="text-cyan-300 font-semibold">{batteryMileage.limitKm.toLocaleString()} KM</span> (whichever occurs first).
            </p>
          </div>

          {/* Dynamic Digital Clock Ticker */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {batteryWarranty.years}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                Years
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {batteryWarranty.months}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                Months
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {batteryWarranty.days}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                Days
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono block">
                {String(batteryWarranty.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                Hours
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono block">
                {String(batteryWarranty.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                Mins
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center min-w-[64px] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono block animate-pulse">
                {String(batteryWarranty.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-semibold block">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Coverage Cards with Dynamic Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. VEHICLE WARRANTY CARD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  COMPREHENSIVE VEHICLE WARRANTY
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {warranty.vehicleWarrantyYears} Years Bumper-to-Bumper
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  vehicleWarranty.isExpired
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {vehicleWarranty.isExpired ? 'EXPIRED' : warranty.status}
              </span>
            </div>

            {/* Dynamic Time Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Coverage Timeline (Year {vehicleWarranty.currentYearOfTotal} of {warranty.vehicleWarrantyYears})
                </span>
                <span className="text-cyan-400 font-bold">
                  {vehicleWarranty.percentElapsed}% Elapsed ({vehicleWarranty.formattedRemaining} left)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vehicleWarranty.percentElapsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Start: <strong className="text-slate-300">{vehicleStartDate}</strong></span>
                <span>Expiry: <strong className="text-slate-200">{warranty.vehicleWarrantyEndDate}</strong></span>
              </div>
            </div>

            {/* Dynamic Mileage Allowance for Vehicle */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vehicle Mileage Coverage ({vehicleMileage.limitKm.toLocaleString()} KM Limit)</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">
                  {vehicleMileage.percentUsed}% Used
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vehicleMileage.percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Current: <strong className="text-white font-mono">{vehicleMileage.currentKm.toLocaleString()} KM</strong></span>
                <span>{vehicleMileage.formattedRemaining}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-300">Protected Systems:</div>
              <ul className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Onboard Charging Hub</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Electric Drive Motors</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Cabin HVAC & Thermal</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Smart Cockpit & Sensors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. BATTERY & POWERTRAIN WARRANTY */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  HIGH-VOLTAGE TRACTION BATTERY & DRIVE
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {warranty.batteryWarrantyYears} Years / {batteryMileage.limitKm.toLocaleString()} KM
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  batteryWarranty.isExpired || batteryMileage.isExceeded
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {batteryWarranty.isExpired || batteryMileage.isExceeded ? 'EXPIRED' : 'ACTIVE'}
              </span>
            </div>

            {/* Dynamic Battery Time Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Time Remaining: <strong className="text-cyan-300">{batteryWarranty.formattedDetailed}</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  {batteryWarranty.percentRemaining}% Remaining
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${batteryWarranty.percentElapsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Start: <strong className="text-slate-300">{batteryStartDate}</strong></span>
                <span>Expiry: <strong className="text-slate-200">{warranty.batteryWarrantyEndDate}</strong></span>
              </div>
            </div>

            {/* Dynamic Battery Mileage Allowance */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mileage Allowance: {batteryMileage.formattedUsed}</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">
                  {batteryMileage.percentUsed}% Used
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    batteryMileage.percentUsed > 85
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  }`}
                  style={{ width: `${batteryMileage.percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Guaranteed Min. 70% SoH</span>
                <span className="text-cyan-300 font-semibold">{batteryMileage.formattedRemaining}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-300">High-Voltage Battery Guarantees:</div>
              <ul className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Blade Cell Replacement</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>BMS Module Recalibration</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Cooling Circuit Seals</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Zero Degradation Surcharge</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Covered Components Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>COVERED COMPONENTS BREAKDOWN</span>
          </div>
          <span className="text-xs text-slate-400">Policy: YouGuard Gold Coverage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Component / Subsystem</th>
                <th className="py-3 px-4">Coverage Duration</th>
                <th className="py-3 px-4">Labor Cost</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {warranty.coveredComponents.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.coveragePeriod}</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-semibold">100% Covered</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claims History */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>RECENT WARRANTY CLAIMS & INQUIRIES</span>
          </div>
          <span className="text-xs text-slate-400">Total Claims: {warranty.recentClaims.length}</span>
        </div>

        {warranty.recentClaims.length > 0 ? (
          <div className="space-y-3">
            {warranty.recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{claim.id}</span>
                    <span className="text-xs font-bold text-white">• {claim.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{claim.resolution || 'Claim under review.'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500">{claim.date}</span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No claims filed. Your vehicle is operating with zero warranty issues.
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">File Warranty Inquiry</h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {claimSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Submitted</h4>
                <p className="text-xs text-slate-300">
                  Your YouGuard case has been assigned. Our service manager will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Inquiry Type
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option>Battery Performance Scan</option>
                    <option>Drive Inverter Diagnostic</option>
                    <option>Onboard Charger Calibration</option>
                    <option>Suspension / Air Strut Check</option>
                    <option>General YouGuard Warranty Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Describe Observation or Issue
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    placeholder="Provide details about symptoms, warning codes, or questions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
