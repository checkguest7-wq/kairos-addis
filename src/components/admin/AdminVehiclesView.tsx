import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Zap,
  BatteryCharging,
  Gauge,
  X,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Calendar,
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { api } from '../../lib/api';
import { ImageLibraryModal } from './ImageLibraryModal';

interface AdminVehiclesViewProps {
  onCatalogUpdated?: () => void;
}

export const AdminVehiclesView: React.FC<AdminVehiclesViewProps> = ({ onCatalogUpdated }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetVehicles();
      setVehicles(res.vehicles || []);
    } catch (err: any) {
      console.error('[ADMIN VEHICLES FETCH ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getVehicleImage = (veh: any): string => {
    return (
      veh.thumbnail ||
      veh.heroImage ||
      veh.image ||
      veh.sideImage ||
      veh.imageUrl ||
      '/images/hero_byd_tang_1788207021341.jpg'
    );
  };

  const getVehicleRange = (veh: any): string => {
    return veh.rangeNEDC || veh.specs?.rangeNEDC || (veh.rangeKm ? `${veh.rangeKm} km` : '530 km');
  };

  const getVehicleBattery = (veh: any): string => {
    return veh.batteryCapacity || veh.specs?.batteryCapacity || 'Ultra-Safe Battery';
  };

  const getVehicleAcceleration = (veh: any): string => {
    return veh.acceleration || veh.specs?.acceleration || '4.4s (0-100)';
  };

  const getVehicleBodyType = (veh: any): string => {
    return veh.bodyType || veh.category || veh.type || 'Electric SUV';
  };

  const handleOpenAddModal = () => {
    setEditingVehicle({
      id: '',
      name: '',
      brand: 'BYD',
      year: 2025,
      category: 'Premium Electric SUV',
      bodyType: 'SUV',
      tagline: 'Flagship electric luxury with cutting-edge range and safety.',
      priceETB: null,
      priceFormattedETB: 'ETB Price Pending Configuration',
      priceFormatted: 'ETB Price Pending Configuration',
      rangeNEDC: '530 km',
      rangeKm: 530,
      batteryCapacity: '108.8 kWh Blade Battery',
      acceleration: '4.4s (0-100 km/h)',
      topSpeed: '180 km/h',
      chargingTime: '30 min (30% - 80% DC)',
      driveType: 'Intelligent AWD (Dual Motor)',
      seats: 7,
      thumbnail: '/images/hero_byd_tang_1788207021341.jpg',
      heroImage: '/images/hero_byd_tang_1788207021341.jpg',
      sideImage: '/images/byd_tang_side_1788207031619.jpg',
      warrantySummary: '8 Years / 160,000 km Battery Warranty + 5 Years Bumper-to-Bumper',
      highlights: [
        'BYD Ultra-Safe Blade Battery Technology',
        'YouGuard 8-Year / 160,000 KM High-Voltage Coverage',
        '0% Customs Duty & Reduced Ethiopian Tariff',
        'Dynaudio 12-Speaker Surround Sound System',
      ],
      features: {
        safety: ['Blade Battery Cell-to-Pack Safety', '360° Surround Camera', 'DiPilot L2+ ADAS'],
        comfort: ['Nappa Leather Heated/Ventilated Seats', 'Three-Zone Climate Control', 'Panoramic Glass Roof'],
        technology: ['15.6-inch Intelligent Rotating Touchscreen', 'OTA Updates', 'Vehicle-to-Load (V2L) Power'],
      },
      description:
        'Luxury high-performance electric vehicle imported with full YouGuard warranty coverage and specialized service support in Addis Ababa.',
    });
    setIsNewVehicle(true);
    setIsEditModalOpen(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOpenEditModal = (veh: Vehicle) => {
    const img = getVehicleImage(veh);
    setEditingVehicle({
      ...veh,
      bodyType: veh.bodyType || (veh as any).type || 'SUV',
      thumbnail: img,
      heroImage: veh.heroImage || img,
      rangeNEDC: getVehicleRange(veh),
      batteryCapacity: getVehicleBattery(veh),
      acceleration: getVehicleAcceleration(veh),
      seats: veh.seats || 5,
      year: veh.year || 2025,
      priceETB: veh.priceETB || null,
      priceFormattedETB: veh.priceFormattedETB || veh.priceFormatted || 'ETB Price Pending Configuration',
    });
    setIsNewVehicle(false);
    setIsEditModalOpen(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDeleteVehicle = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the Showroom Catalog?`)) {
      return;
    }

    try {
      await api.adminDeleteVehicle(id);
      setSuccessMsg(`Vehicle "${name}" removed from catalog.`);
      fetchVehicles();
      onCatalogUpdated?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete vehicle.');
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !editingVehicle.name || !editingVehicle.brand) {
      setErrorMsg('Vehicle name and brand are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const etbVal = editingVehicle.priceETB ? Number(editingVehicle.priceETB) : null;
      const formattedETB = etbVal && etbVal > 0 ? `ETB ${etbVal.toLocaleString()}` : 'ETB Price Pending Configuration';

      const payload: Vehicle = {
        ...editingVehicle,
        id: editingVehicle.id || editingVehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        priceETB: etbVal,
        priceFormattedETB: formattedETB,
        priceFormatted: formattedETB,
        rangeNEDC: editingVehicle.rangeNEDC || '530 km',
        rangeKm: Number(editingVehicle.rangeKm) || parseInt(editingVehicle.rangeNEDC) || 530,
        batteryCapacity: editingVehicle.batteryCapacity || 'Blade Battery',
        acceleration: editingVehicle.acceleration || '4.4s (0-100 km/h)',
        bodyType: editingVehicle.bodyType || 'SUV',
        category: editingVehicle.category || `${editingVehicle.bodyType} Electric Vehicle`,
        seats: Number(editingVehicle.seats) || 5,
        year: Number(editingVehicle.year) || 2025,
        thumbnail: editingVehicle.thumbnail || editingVehicle.heroImage || '/images/hero_byd_tang_1788207021341.jpg',
        sideImage: editingVehicle.sideImage || editingVehicle.thumbnail || '/images/byd_tang_side_1788207031619.jpg',
        heroImage: editingVehicle.heroImage || editingVehicle.thumbnail || '/images/hero_byd_tang_1788207021341.jpg',
        highlights: Array.isArray(editingVehicle.highlights) ? editingVehicle.highlights : ['Ultra-Safe Battery', 'YouGuard Warranty'],
        features: editingVehicle.features || { safety: [], comfort: [], technology: [] },
        description: editingVehicle.description || 'Premium electric vehicle available in Ethiopia.',
      };

      if (isNewVehicle) {
        await api.adminAddVehicle(payload);
        setSuccessMsg(`Vehicle "${payload.name}" added successfully.`);
      } else {
        await api.adminUpdateVehicle(payload.id, payload);
        setSuccessMsg(`Vehicle "${payload.name}" updated successfully.`);
      }
      setIsEditModalOpen(false);
      fetchVehicles();
      onCatalogUpdated?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      (v.bodyType && v.bodyType.toLowerCase().includes(term)) ||
      (v.category && v.category.toLowerCase().includes(term));
    const matchesBrand = selectedBrand === 'ALL' || v.brand.toUpperCase() === selectedBrand.toUpperCase();
    return matchesSearch && matchesBrand;
  });

  return (
    <div id="admin-vehicles-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Car className="w-3.5 h-3.5" />
            Showroom Inventory & Catalog
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Showroom Vehicle Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your real electric vehicle models, pricing, technical specifications, and showroom inventory.
          </p>
        </div>

        <button
          id="admin-add-vehicle-btn"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Vehicle
        </button>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {errorMsg}
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model, brand, body type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'BYD', 'GEELY', 'TOYOTA'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedBrand === brand
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading showroom catalog...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No vehicles match your search.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter or adding a new vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((veh) => {
            const imgSrc = getVehicleImage(veh);
            const range = getVehicleRange(veh);
            const battery = getVehicleBattery(veh);
            const accel = getVehicleAcceleration(veh);
            const bodyType = getVehicleBodyType(veh);

            return (
              <div
                key={veh.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-xl group"
              >
                {/* Vehicle Image Banner */}
                <div className="relative h-52 bg-slate-950 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={veh.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_byd_tang_1788207021341.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30" />

                  {/* Brand & Duty Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow">
                      {veh.brand}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider shadow">
                      0% Customs Duty
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] font-mono font-semibold">
                      {bodyType} · {veh.year || 2025}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Header */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-md">{veh.name}</h3>
                      <p className="text-xs text-cyan-400 font-mono font-bold">
                        {veh.priceFormattedETB || veh.priceFormatted || (veh.priceETB ? `ETB ${veh.priceETB.toLocaleString()}` : 'ETB Price Pending')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content & Specs */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Technical Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3 text-cyan-400" /> Range
                      </span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">{range}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                        <BatteryCharging className="w-3 h-3 text-emerald-400" /> Battery
                      </span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block truncate px-1">
                        {battery}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> 0-100
                      </span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">{accel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {veh.description || veh.tagline}
                  </p>

                  {/* Warranty Tag */}
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">YouGuard 8-Year Battery & 5-Year Vehicle Warranty</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: <span className="text-slate-200">{veh.id}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        id={`admin-edit-veh-${veh.id}`}
                        onClick={() => handleOpenEditModal(veh)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Specs
                      </button>
                      <button
                        id={`admin-del-veh-${veh.id}`}
                        onClick={() => handleDeleteVehicle(veh.id, veh.name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Vehicle Modal */}
      {isEditModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isNewVehicle ? 'Add New Showroom Vehicle' : `Edit Vehicle: ${editingVehicle.name}`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update pricing, technical data, battery capacity, and showroom assets.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.name || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. BYD Tang L Flagship"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Brand *</label>
                  <select
                    value={editingVehicle.brand || 'BYD'}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BYD">BYD Auto</option>
                    <option value="Geely">Geely Galaxy</option>
                    <option value="Toyota">Toyota bZ</option>
                    <option value="Other">Other EV Brand</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Official Price (ETB)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000 (Leave blank if pending)"
                    value={editingVehicle.priceETB ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      const formatted = val && val > 0 ? `ETB ${val.toLocaleString()}` : 'ETB Price Pending Configuration';
                      setEditingVehicle({
                        ...editingVehicle,
                        priceETB: val,
                        priceFormattedETB: formatted,
                        priceFormatted: formatted,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Customer-facing currency is Ethiopian Birr (ETB). Standard format: ETB 5,000,000.
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">Year & Body Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editingVehicle.year || 2025}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, year: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={editingVehicle.bodyType || 'SUV'}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, bodyType: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Crossover">Crossover</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">EV Technical Specs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">NEDC Range</label>
                    <input
                      type="text"
                      value={editingVehicle.rangeNEDC || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, rangeNEDC: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-500"
                      placeholder="e.g. 530 km"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Battery Capacity</label>
                    <input
                      type="text"
                      value={editingVehicle.batteryCapacity || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, batteryCapacity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-500"
                      placeholder="e.g. 108.8 kWh Blade Battery"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">0-100 Acceleration</label>
                    <input
                      type="text"
                      value={editingVehicle.acceleration || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, acceleration: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-500"
                      placeholder="e.g. 4.4s"
                    />
                  </div>
                </div>
              </div>

              {/* Image Asset URL with Image Library Browser */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-semibold block">Vehicle Image Asset</label>
                  <button
                    type="button"
                    onClick={() => setIsImagePickerOpen(true)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Choose from Image Library</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingVehicle.thumbnail || editingVehicle.heroImage || ''}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      thumbnail: e.target.value,
                      heroImage: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="/images/hero_byd_tang_1788207021341.jpg or choose from library"
                />
                
                {/* Visual Image Preview & Quick Action */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {editingVehicle.thumbnail || editingVehicle.heroImage ? (
                        <img
                          src={editingVehicle.thumbnail || editingVehicle.heroImage}
                          alt="Vehicle Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 overflow-hidden">
                      <p className="font-semibold text-slate-200 truncate">
                        {editingVehicle.thumbnail || editingVehicle.heroImage ? 'Asset Selected' : 'No Asset Selected'}
                      </p>
                      <p className="text-[10px] truncate">
                        {editingVehicle.thumbnail || editingVehicle.heroImage || 'Select from library or enter URL'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImagePickerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Browse Assets
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Vehicle Description</label>
                <textarea
                  rows={3}
                  value={editingVehicle.description || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Describe vehicle features, comfort, and performance..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Library Picker Modal */}
      <ImageLibraryModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={(url) => {
          if (editingVehicle) {
            setEditingVehicle({
              ...editingVehicle,
              thumbnail: url,
              heroImage: url,
              sideImage: url,
            });
          }
        }}
        title="Select Vehicle Image Asset"
        targetType="vehicle"
        initialSelectedUrl={editingVehicle?.thumbnail || editingVehicle?.heroImage || ''}
      />
    </div>
  );
};
