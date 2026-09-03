import { VehicleMedia } from '../VehicleMedia';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Car,
  BatteryCharging,
  Gauge,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  X,
  FileCheck,
  Eye,
  ShoppingBag,
  ExternalLink,
  Compass,
  Calendar,
  Clock,
} from 'lucide-react';
import { Vehicle, CustomerDocuments } from '../../types';
import { VEHICLES } from '../../data/vehicles';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface PortalVehiclesCatalogViewProps {
  documents: CustomerDocuments;
  onNavigateToDocuments: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToTestDrives?: () => void;
  onOrderPlaced?: () => void;
  onRefreshData?: () => void;
}

export const PortalVehiclesCatalogView: React.FC<PortalVehiclesCatalogViewProps> = ({
  documents,
  onNavigateToDocuments,
  onNavigateToOrders,
  onNavigateToTestDrives,
  onOrderPlaced,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('All');
  
  // Detail Modal
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);

  // Test Drive Modal
  const [selectedVehicleForTestDrive, setSelectedVehicleForTestDrive] = useState<Vehicle | null>(null);
  const [tdPreferredDate, setTdPreferredDate] = useState('2026-09-25');
  const [tdPreferredTime, setTdPreferredTime] = useState('02:30 PM');
  const [tdNotes, setTdNotes] = useState('');
  const [isSubmittingTestDrive, setIsSubmittingTestDrive] = useState(false);
  const [testDriveSuccess, setTestDriveSuccess] = useState(false);
  const [testDriveError, setTestDriveError] = useState<string | null>(null);

  // Order Modal
  const [selectedVehicleForOrder, setSelectedVehicleForOrder] = useState<Vehicle | null>(null);
  const [selectedColor, setSelectedColor] = useState('Obsidian Black Pearl');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Check if customer has all 4 required documents
  const hasAllDocs = Boolean(
    documents?.faydaIdFront &&
    documents?.faydaIdBack &&
    documents?.drivingLicenceFront &&
    documents?.drivingLicenceBack
  );

  // Brands & Body Types
  const brands = useMemo(() => {
    const set = new Set<string>();
    VEHICLES.forEach((v) => set.add(v.brand));
    return ['All', ...Array.from(set)];
  }, []);

  const bodyTypes = useMemo(() => {
    const set = new Set<string>();
    VEHICLES.forEach((v) => set.add(v.bodyType));
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return VEHICLES.filter((vehicle) => {
      const matchSearch =
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.tagline.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBrand = selectedBrand === 'All' || vehicle.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchBody = selectedBodyType === 'All' || vehicle.bodyType.toLowerCase() === selectedBodyType.toLowerCase();

      return matchSearch && matchBrand && matchBody;
    });
  }, [searchTerm, selectedBrand, selectedBodyType]);

  const handleStartOrder = (vehicle: Vehicle) => {
    setSelectedVehicleForOrder(vehicle);
    setSelectedColor('Obsidian Black Pearl');
    setOrderNotes('');
    setOrderError(null);
    setOrderSuccess(null);
  };

  const handleStartTestDrive = (vehicle: Vehicle) => {
    setSelectedVehicleForTestDrive(vehicle);
    setTdPreferredDate('2026-09-25');
    setTdPreferredTime('02:30 PM');
    setTdNotes('');
    setTestDriveError(null);
    setTestDriveSuccess(false);
  };

  const handleSubmitTestDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForTestDrive) return;

    setIsSubmittingTestDrive(true);
    setTestDriveError(null);

    try {
      await api.bookTestDrive({
        vehicleName: selectedVehicleForTestDrive.name,
        preferredDate: tdPreferredDate,
        preferredTime: tdPreferredTime,
        notes: tdNotes,
      });

      setTestDriveSuccess(true);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setTestDriveError(err.message || 'Failed to submit test drive request. Please try again.');
    } finally {
      setIsSubmittingTestDrive(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForOrder) return;

    if (!hasAllDocs) {
      setOrderError('Required documents missing. Please upload your Fayda ID and driving licence before ordering.');
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      const res = await api.createOrder({
        vehicleId: selectedVehicleForOrder.id,
        vehicleName: selectedVehicleForOrder.name,
        vehicleBrand: selectedVehicleForOrder.brand,
        vehicleImage: selectedVehicleForOrder.thumbnail || selectedVehicleForOrder.heroImage || '',
        priceETB: selectedVehicleForOrder.priceETB,
        priceFormattedETB: selectedVehicleForOrder.priceFormattedETB || selectedVehicleForOrder.priceFormatted,
        priceFormatted: selectedVehicleForOrder.priceFormattedETB || selectedVehicleForOrder.priceFormatted,
        selectedColor,
        notes: orderNotes,
      });

      setOrderSuccess({ orderNumber: res.order.orderNumber });
      if (onRefreshData) onRefreshData();
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setOrderError(err.message || 'Failed to submit vehicle order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Car className="w-3.5 h-3.5" />
            OFFICIAL KAIROS ADDIS EV CATALOG
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore & Order Electric Vehicles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our imported high-efficiency EV lineup with official YouGuard warranty coverage and full customs clearance.
          </p>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-3">
          {hasAllDocs ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ordering Eligibility: <strong>Verified</strong></span>
            </div>
          ) : (
            <button
              onClick={onNavigateToDocuments}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Documents Incomplete • <strong>Upload Now</strong></span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-vehicle-search"
              type="text"
              placeholder="Search BYD Tang L, Geely Galaxy E5, Toyota bZ4X..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Brand:</span>
            <div className="flex items-center gap-1.5">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedBrand.toLowerCase() === brand.toLowerCase()
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body Type Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Body Style:</span>
          <div className="flex items-center gap-1.5">
            {bodyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBodyType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedBodyType.toLowerCase() === type.toLowerCase()
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-500 whitespace-nowrap">
            Showing <strong>{filteredVehicles.length}</strong> model{filteredVehicles.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or removing filters to view the full inventory.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBrand('All');
              setSelectedBodyType('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all flex flex-col group shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Vehicle Thumbnail */}
              <div className="relative h-52 bg-slate-950 overflow-hidden">
                <VehicleMedia
                  imageSrc={vehicle.thumbnail || vehicle.heroImage || vehicle.sideImage}
                  videoSrc={vehicle.video}
                  alt={vehicle.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  videoClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Brand Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur border border-slate-700 text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider">
                    {vehicle.brand}
                  </span>
                </div>

                {/* Body Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur border border-slate-800 text-[11px] font-medium text-slate-300">
                    {vehicle.bodyType}
                  </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider block">Estimated Price</span>
                    <span className="text-base sm:text-lg font-black text-white">{vehicle.priceFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {vehicle.tagline}
                  </p>
                </div>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80">
                  <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Range</span>
                    <span className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1 mt-0.5">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      {vehicle.rangeNEDC}
                    </span>
                  </div>

                  <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">0-100 km/h</span>
                    <span className="text-xs font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <Gauge className="w-3 h-3 text-blue-400" />
                      {vehicle.acceleration.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Seats</span>
                    <span className="text-xs font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-purple-400" />
                      {vehicle.seats} Seats
                    </span>
                  </div>
                </div>

                {/* Warranty Summary Text */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-cyan-950/30 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Includes YouGuard 8-Year Battery Protection</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-view-details-${vehicle.id}`}
                      onClick={() => setSelectedVehicleForDetails(vehicle)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700/60"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <button
                      id={`btn-order-vehicle-${vehicle.id}`}
                      onClick={() => handleStartOrder(vehicle)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Order Vehicle
                    </button>
                  </div>

                  <button
                    id={`btn-book-test-drive-${vehicle.id}`}
                    onClick={() => handleStartTestDrive(vehicle)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Book Test Drive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* VEHICLE DETAILS MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedVehicleForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVehicleForDetails(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <VehicleMedia
                  imageSrc={selectedVehicleForDetails.thumbnail || selectedVehicleForDetails.heroImage}
                  videoSrc={selectedVehicleForDetails.video}
                  alt={selectedVehicleForDetails.name}
                  className="w-full sm:w-64 h-40 object-cover rounded-xl border border-slate-800"
                  videoClassName="w-full sm:w-64 h-40 object-cover rounded-xl border border-slate-800"
                />
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest">
                    {selectedVehicleForDetails.brand} • {selectedVehicleForDetails.category}
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedVehicleForDetails.name}</h2>
                  <p className="text-xs text-slate-400">{selectedVehicleForDetails.tagline}</p>
                  <div className="text-xl font-extrabold text-cyan-300 pt-1">
                    {selectedVehicleForDetails.priceFormatted}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {selectedVehicleForDetails.description}
              </div>

              {/* Key Technical Specs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Electric Range</span>
                    <span className="text-sm font-bold text-cyan-300">{selectedVehicleForDetails.rangeNEDC}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Battery Capacity</span>
                    <span className="text-sm font-bold text-white">{selectedVehicleForDetails.batteryCapacity}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Charging Time</span>
                    <span className="text-sm font-bold text-white">{selectedVehicleForDetails.chargingTime}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Drive Architecture</span>
                    <span className="text-sm font-bold text-white">{selectedVehicleForDetails.driveType}</span>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Vehicle Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedVehicleForDetails.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedVehicleForDetails(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
                <button
                  id={`btn-details-book-test-drive-${selectedVehicleForDetails.id}`}
                  onClick={() => {
                    const veh = selectedVehicleForDetails;
                    setSelectedVehicleForDetails(null);
                    handleStartTestDrive(veh);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Book Test Drive</span>
                </button>
                <button
                  onClick={() => {
                    const veh = selectedVehicleForDetails;
                    setSelectedVehicleForDetails(null);
                    handleStartOrder(veh);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                >
                  Proceed to Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* VEHICLE TEST DRIVE MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedVehicleForTestDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVehicleForTestDrive(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {testDriveSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Test Drive Scheduled!</h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                      Your test drive for <strong className="text-cyan-300">{selectedVehicleForTestDrive.name}</strong> on{' '}
                      <strong className="text-white">{tdPreferredDate}</strong> at <strong className="text-white">{tdPreferredTime}</strong> is confirmed.
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Location: <strong>Kairos Addis Bole Wollo Sefer Flagship Showroom</strong> (In front of Ibex Hotel).
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedVehicleForTestDrive(null);
                        setTestDriveSuccess(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider"
                    >
                      Close
                    </button>
                    {onNavigateToTestDrives && (
                      <button
                        onClick={() => {
                          setSelectedVehicleForTestDrive(null);
                          setTestDriveSuccess(false);
                          onNavigateToTestDrives();
                        }}
                        className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        View Test Drives
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTestDrive} className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                      <Compass className="w-3.5 h-3.5" />
                      SHOWROOM TEST DRIVE BOOKING
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      Book Test Drive: {selectedVehicleForTestDrive.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Experience this EV with our product specialist at the Bole Wollo Sefer showroom.
                    </p>
                  </div>

                  {testDriveError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{testDriveError}</span>
                    </div>
                  )}

                  {/* Selected Vehicle Overview */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3.5">
                    <VehicleMedia
                      imageSrc={selectedVehicleForTestDrive.thumbnail || selectedVehicleForTestDrive.heroImage}
                      videoSrc={selectedVehicleForTestDrive.video}
                      alt={selectedVehicleForTestDrive.name}
                      className="w-20 h-14 object-cover rounded-lg border border-slate-800 shrink-0"
                      videoClassName="w-20 h-14 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedVehicleForTestDrive.name}</h4>
                      <span className="text-[11px] text-cyan-300 font-semibold block">{selectedVehicleForTestDrive.brand} • {selectedVehicleForTestDrive.category}</span>
                      <span className="text-[10px] text-slate-400">{selectedVehicleForTestDrive.rangeNEDC} Range • {selectedVehicleForTestDrive.acceleration}</span>
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        value={tdPreferredDate}
                        onChange={(e) => setTdPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Preferred Time
                      </label>
                      <select
                        value={tdPreferredTime}
                        onChange={(e) => setTdPreferredTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                      >
                        <option>10:00 AM</option>
                        <option>11:30 AM</option>
                        <option>02:00 PM</option>
                        <option>03:30 PM</option>
                        <option>04:45 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Requests or Comparison Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Specific Inquiries / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={tdNotes}
                      onChange={(e) => setTdNotes(e.target.value)}
                      placeholder="e.g., Interested in comparing with Geely Galaxy E5, testing AWD acceleration..."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForTestDrive(null)}
                      disabled={isSubmittingTestDrive}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTestDrive}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50"
                    >
                      {isSubmittingTestDrive ? 'Booking...' : 'Confirm Test Drive'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* VEHICLE ORDER MODAL (WITH DOCUMENT CHECK) */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedVehicleForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVehicleForOrder(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Order Success State */}
              {orderSuccess ? (
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Order Submitted Successfully!</h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                      Your order for <strong className="text-cyan-300">{selectedVehicleForOrder.name}</strong> has been registered under order number:
                    </p>
                    <div className="inline-block px-4 py-2 bg-slate-950 border border-cyan-500/40 rounded-xl font-mono text-cyan-300 font-bold text-lg">
                      {orderSuccess.orderNumber}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Our sales concierge at Bole Wollo Sefer has received your verified documents and will contact you via phone (<span className="text-white">{user?.phone}</span>) to finalize delivery and payment timelines.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        setSelectedVehicleForOrder(null);
                        setOrderSuccess(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicleForOrder(null);
                        setOrderSuccess(null);
                        onNavigateToOrders();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      Track in My Orders
                    </button>
                  </div>
                </div>
              ) : !hasAllDocs ? (
                /* MISSING DOCUMENTS BLOCKING VIEW */
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-amber-300">
                        Required documents missing
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Please upload your Fayda ID and driving licence documents in your Profile before ordering a vehicle.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Required Documents Checklist:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        documents?.faydaIdFront ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span>1. Fayda ID (Front)</span>
                        <span className="font-bold">{documents?.faydaIdFront ? '✓ Uploaded' : '✗ Missing'}</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        documents?.faydaIdBack ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span>2. Fayda ID (Back)</span>
                        <span className="font-bold">{documents?.faydaIdBack ? '✓ Uploaded' : '✗ Missing'}</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        documents?.drivingLicenceFront ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span>3. Driving Licence (Front)</span>
                        <span className="font-bold">{documents?.drivingLicenceFront ? '✓ Uploaded' : '✗ Missing'}</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        documents?.drivingLicenceBack ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span>4. Driving Licence (Back)</span>
                        <span className="font-bold">{documents?.drivingLicenceBack ? '✓ Uploaded' : '✗ Missing'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSelectedVehicleForOrder(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicleForOrder(null);
                        onNavigateToDocuments();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      <FileCheck className="w-4 h-4" />
                      Go to Profile / Upload Documents
                    </button>
                  </div>
                </div>
              ) : (
                /* ORDER FORM WITH VERIFIED DOCUMENTS */
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DOCUMENTS VERIFIED • READY TO ORDER
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      Confirm Order for {selectedVehicleForOrder.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your order will be linked to your customer account and reviewed by the Kairos Addis import team.
                    </p>
                  </div>

                  {orderError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* Vehicle Summary Box */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
                    <VehicleMedia
                      imageSrc={selectedVehicleForOrder.thumbnail || selectedVehicleForOrder.heroImage}
                      videoSrc={selectedVehicleForOrder.video}
                      alt={selectedVehicleForOrder.name}
                      className="w-24 h-16 object-cover rounded-lg border border-slate-800"
                      videoClassName="w-24 h-16 object-cover rounded-lg border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedVehicleForOrder.name}</h4>
                      <span className="text-xs text-cyan-300 font-semibold block">{selectedVehicleForOrder.priceFormatted}</span>
                      <span className="text-[10px] text-slate-400">Includes 8-Year YouGuard Battery Warranty</span>
                    </div>
                  </div>

                  {/* Customer Real Account Info */}
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Customer Account Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Name:</span>
                        <strong className="text-white">{user?.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Email:</span>
                        <strong className="text-white">{user?.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Phone:</span>
                        <strong className="text-white">{user?.phone}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Color Preference */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Exterior Color Preference
                    </label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Obsidian Black Pearl">Obsidian Black Pearl</option>
                      <option value="Glacier White Metallic">Glacier White Metallic</option>
                      <option value="Titanium Silver Satin">Titanium Silver Satin</option>
                      <option value="Emperor Red Multi-Coat">Emperor Red Multi-Coat</option>
                      <option value="Cosmic Blue Metallic">Cosmic Blue Metallic</option>
                    </select>
                  </div>

                  {/* Custom Configuration Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Custom Options or Inquiries (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Inquire about 7-seat configuration, custom home wallbox installation, or duty-free tax clearance..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForOrder(null)}
                      disabled={isSubmittingOrder}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50"
                    >
                      {isSubmittingOrder ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Submit Official Order</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
