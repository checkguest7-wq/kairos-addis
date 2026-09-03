import { VehicleMedia } from './VehicleMedia';
import { useState } from 'react';
import {
  X,
  Gauge,
  Users,
  Zap,
  Shield,
  Sparkles,
  BatteryCharging,
  ArrowRight,
  Phone,
  RotateCw,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onBookTestDrive: (carId: string) => void;
  onContactKairos: (carName: string) => void;
}

export function VehicleDetailsModal({
  vehicle,
  onClose,
  onBookTestDrive,
  onContactKairos,
}: VehicleDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'features' | 'warranty'>('overview');
  const [viewAngle, setViewAngle] = useState<'side' | 'hero'>('side');
  const [isRotating, setIsRotating] = useState(false);

  if (!vehicle) return null;

  const currentDisplayImage =
    viewAngle === 'side'
      ? vehicle.sideImage || vehicle.thumbnail
      : vehicle.heroImage || vehicle.thumbnail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0b1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-6 text-slate-200">
        
        {/* Top Rim Glow */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="modal-close-vehicle-details"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Brand, Name & Primary CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-blue-950 border border-blue-600/50 text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase">
                {vehicle.brand}
              </span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                {vehicle.category}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
              {vehicle.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onBookTestDrive(vehicle.id);
              }}
              id="modal-btn-book-test-drive"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-sm tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              <span>Book Test Drive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onClose();
                onContactKairos(vehicle.name);
              }}
              id="modal-btn-contact-kairos"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-sm border border-slate-700 hover:border-slate-500 tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Kairos</span>
            </button>
          </div>
        </div>

        {/* 3D Interactive Vehicle Stage */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#080d16] via-[#0b1322] to-[#080d16] border border-slate-800 p-6 mb-6 flex flex-col items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[300px]">
          
          {/* 3D View Angle Switcher Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-slate-300 backdrop-blur-sm">
            <button
              onClick={() => setViewAngle(viewAngle === 'side' ? 'hero' : 'side')}
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Toggle Camera Angle"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>{viewAngle === 'side' ? '3/4 Angle' : 'Side Profile'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isRotating ? 'text-blue-400' : 'text-slate-400'
              }`}
              title="Toggle 3D Turntable"
            >
              <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">3D Stage</span>
            </button>
          </div>

          {/* Holographic Glowing Turntable Ring */}
          <div className="absolute bottom-2 w-4/5 h-16 pointer-events-none flex items-center justify-center">
            <div
              className={`w-full h-12 rounded-[100%] border border-cyan-500/40 bg-gradient-to-t from-blue-600/20 to-transparent ${
                isRotating ? 'animate-pulse' : ''
              }`}
              style={{ transform: 'perspective(400px) rotateX(75deg)' }}
            />
            <div className="absolute w-2/3 h-6 bg-cyan-400/20 rounded-full blur-lg" />
          </div>

          {/* Vehicle Visual */}
          <div className="relative z-10 w-full flex items-center justify-center py-2">
            <VehicleMedia
              imageSrc={currentDisplayImage}
              videoSrc={vehicle.video}
              alt={vehicle.name}
              className={`w-full max-h-56 sm:max-h-64 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] transition-all duration-500 ${
                isRotating ? 'scale-105' : ''
              }`}
              videoClassName={`w-full max-h-56 sm:max-h-64 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] transition-all duration-500 ${
                isRotating ? 'scale-105' : ''
              }`}
            />
          </div>

          <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 font-medium">
            Estimated Price: <span className="text-cyan-300 font-bold">{vehicle.priceFormatted}</span>
          </div>
        </div>

        {/* Key Specification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Gauge className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">NEDC Range</span>
            </div>
            <div className="text-lg font-bold text-white">{vehicle.rangeNEDC}</div>
          </div>

          <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">0-100 km/h</span>
            </div>
            <div className="text-lg font-bold text-white">{vehicle.acceleration}</div>
          </div>

          <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <BatteryCharging className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Battery</span>
            </div>
            <div className="text-xs font-bold text-white truncate px-1">
              {vehicle.batteryCapacity.split(' ')[0]} {vehicle.batteryCapacity.split(' ')[1]}
            </div>
          </div>

          <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Seating</span>
            </div>
            <div className="text-lg font-bold text-white">{vehicle.seats} Seats</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Specifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'features'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Features & Comfort
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`pb-2.5 px-3 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'warranty'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warranty & Service
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed sm:text-sm">
              {vehicle.description}
            </p>
            <div>
              <h4 className="text-white font-bold tracking-wider uppercase mb-2">Key Highlights</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
                {vehicle.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 bg-[#080d17] p-2.5 rounded-lg border border-slate-800/80">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Full Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Drive Architecture</span>
              <span className="text-white font-semibold text-sm">{vehicle.driveType}</span>
            </div>
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">DC Fast Charging</span>
              <span className="text-white font-semibold text-sm">{vehicle.chargingTime}</span>
            </div>
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Battery Chemistry & Capacity</span>
              <span className="text-white font-semibold text-sm">{vehicle.batteryCapacity}</span>
            </div>
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Top Speed</span>
              <span className="text-white font-semibold text-sm">{vehicle.topSpeed}</span>
            </div>
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Acceleration (0-100 km/h)</span>
              <span className="text-white font-semibold text-sm">{vehicle.acceleration}</span>
            </div>
            <div className="p-3 bg-[#080d17] rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">NEDC Certified Range</span>
              <span className="text-white font-semibold text-sm">{vehicle.rangeNEDC} ({vehicle.rangeKm} km)</span>
            </div>
          </div>
        )}

        {/* Tab 3: Features */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800">
              <h4 className="text-cyan-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Active Safety
              </h4>
              <ul className="space-y-2 text-slate-300">
                {vehicle.features.safety.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800">
              <h4 className="text-cyan-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cabin Comfort & Tech
              </h4>
              <ul className="space-y-2 text-slate-300">
                {vehicle.features.comfort.concat(vehicle.features.technology).slice(0, 5).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Warranty Information */}
        {activeTab === 'warranty' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gradient-to-r from-blue-950/40 to-[#080d17] p-4 rounded-xl border border-blue-600/40">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Kairos Addis Certified Warranty</span>
              </div>
              <p className="text-white font-semibold text-sm mb-2">
                {vehicle.warrantySummary || '8 Years / 150,000 km Battery Coverage + 5 Years Complete Service'}
              </p>
              <p className="text-slate-300 leading-relaxed">
                All vehicles imported through Kairos Addis receive comprehensive local diagnostics, certified technician support in Addis Ababa, and genuine OEM spare parts availability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800 text-center">
                <span className="text-cyan-400 font-bold block text-base">8 Years</span>
                <span className="text-[11px] text-slate-400">High-Voltage Battery</span>
              </div>
              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800 text-center">
                <span className="text-cyan-400 font-bold block text-base">5 Years</span>
                <span className="text-[11px] text-slate-400">Electric Drivetrain</span>
              </div>
              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800 text-center">
                <span className="text-cyan-400 font-bold block text-base">24/7</span>
                <span className="text-[11px] text-slate-400">Addis Roadside Assist</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Duty-free purchase and installment options available through Kairos Addis.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookTestDrive(vehicle.id);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-sm tracking-wider uppercase shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              Book a Test Drive
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
