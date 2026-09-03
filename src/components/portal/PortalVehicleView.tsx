import React from 'react';
import { motion } from 'motion/react';
import {
  Car,
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Cpu,
  Calendar,
  Key,
  Wrench,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PortalVehicle } from '../../types';

interface PortalVehicleViewProps {
  vehicle: PortalVehicle | null;
  onBookService: () => void;
  onViewWarranty: () => void;
}

export const PortalVehicleView: React.FC<PortalVehicleViewProps> = ({
  vehicle,
  onBookService,
  onViewWarranty,
}) => {
  if (!vehicle) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Registered Vehicle Found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          If you recently purchased a vehicle from Kairos Addis, our sales operations team will link your VIN and registration number shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Car className="w-3.5 h-3.5" />
            REGISTERED ELECTRIC VEHICLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {vehicle.model}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plate: <span className="font-mono text-cyan-400 font-bold">{vehicle.registrationNumber}</span> • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-veh-book-service"
            onClick={onBookService}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Schedule Service
          </button>
          <button
            id="btn-veh-warranty"
            onClick={onViewWarranty}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors border border-slate-700"
          >
            View Warranty
          </button>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
                {vehicle.registrationNumber}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Warranty Status: {vehicle.warrantyStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Purchase Date</span>
                <span className="text-xs font-bold text-white mt-1 block">{vehicle.purchaseDate}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Total Mileage</span>
                <span className="text-xs font-bold text-cyan-400 font-mono mt-1 block">
                  {vehicle.mileageKm.toLocaleString()} KM
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Exterior Finish</span>
                <span className="text-xs font-bold text-white mt-1 block">{vehicle.color}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Battery Spec</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">{vehicle.batteryCapacity}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Software OS</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block truncate">v4.2.8 (Latest)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Telematics Sync</span>
                <span className="text-xs font-bold text-cyan-300 mt-1 block">Real-time (Online)</span>
              </div>
            </div>
          </div>

          {/* Right Vehicle Visualization & Charge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
            <div className="w-full text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-cyan-400 border-r-cyan-500 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  <BatteryCharging className="w-6 h-6 text-cyan-400 mb-1" />
                  <span className="text-2xl font-extrabold text-white font-mono">{vehicle.chargeStatusPercent}%</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Charged</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">
                  Estimated Range: <span className="text-cyan-400 font-bold font-mono">{vehicle.estimatedRangeKm} KM</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Battery State of Health (SoH): <strong className="text-emerald-400">{vehicle.batteryHealthPercent}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telematics & Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tire Pressure Monitor System (TPMS) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>TIRE PRESSURE MONITOR (TPMS)</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              All Optimal (36-38 PSI)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Front Left</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{vehicle.tirePressurePsi.frontLeft} PSI</div>
              <span className="text-[10px] text-emerald-400 font-medium">Nominal</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Front Right</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{vehicle.tirePressurePsi.frontRight} PSI</div>
              <span className="text-[10px] text-emerald-400 font-medium">Nominal</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Rear Left</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{vehicle.tirePressurePsi.rearLeft} PSI</div>
              <span className="text-[10px] text-emerald-400 font-medium">Nominal</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Rear Right</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{vehicle.tirePressurePsi.rearRight} PSI</div>
              <span className="text-[10px] text-emerald-400 font-medium">Nominal</span>
            </div>
          </div>
        </div>

        {/* High-Voltage Powertrain Diagnostics */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>HIGH-VOLTAGE POWERTRAIN STATUS</span>
            </div>
            <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Blade Battery Nominal
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">High-Voltage Thermal Loop</span>
              <span className="font-bold text-white font-mono">24.5 °C (Optimal)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Insulation Resistance</span>
              <span className="font-bold text-emerald-400 font-mono">500 MΩ (100% Pass)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">AC / DC Fast Charging Port</span>
              <span className="font-bold text-cyan-300">CCS2 / GB-T Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Regenerative Braking Status</span>
              <span className="font-bold text-white">Active (Standard Mode)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
