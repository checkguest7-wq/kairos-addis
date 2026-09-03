import { VehicleMedia } from './VehicleMedia';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  X,
  Gauge,
  Users,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Car,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Battery,
} from 'lucide-react';
import { Vehicle } from '../types';

interface VehiclesPageProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenTestDrive: (carId?: string) => void;
  onContactKairos: (carName?: string) => void;
}

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'range' | 'newest';

export function VehiclesPage({
  vehicles,
  onSelectVehicle,
  onOpenTestDrive,
  onContactKairos,
}: VehiclesPageProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedMinRange, setSelectedMinRange] = useState<string>('all');
  const [selectedSeats, setSelectedSeats] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Available unique brands & body types
  const brands = useMemo(() => {
    const unique = Array.from(new Set(vehicles.map((v) => v.brand)));
    return ['all', ...unique];
  }, [vehicles]);

  const bodyTypes = useMemo(() => {
    const unique = Array.from(new Set(vehicles.map((v) => v.bodyType)));
    return ['all', ...unique];
  }, [vehicles]);

  // Filter & Search Logic
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        // Search text matching (name, brand, category, description, tags)
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const matchName = vehicle.name.toLowerCase().includes(query);
          const matchBrand = vehicle.brand.toLowerCase().includes(query);
          const matchCat = vehicle.category.toLowerCase().includes(query);
          const matchDesc = vehicle.description.toLowerCase().includes(query);
          const matchTagline = vehicle.tagline.toLowerCase().includes(query);
          if (!matchName && !matchBrand && !matchCat && !matchDesc && !matchTagline) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'all' && vehicle.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Vehicle Type filter
        if (selectedBodyType !== 'all' && vehicle.bodyType.toLowerCase() !== selectedBodyType.toLowerCase()) {
          return false;
        }

        // Seats filter
        if (selectedSeats !== 'all') {
          const seatNum = parseInt(selectedSeats, 10);
          if (vehicle.seats !== seatNum) return false;
        }

        // Range filter
        if (selectedMinRange !== 'all') {
          const minRange = parseInt(selectedMinRange, 10);
          if (vehicle.rangeKm < minRange) return false;
        }

        // Price / status filter
        if (selectedPriceRange !== 'all') {
          if (selectedPriceRange === 'configured' && (!vehicle.priceETB || vehicle.priceETB <= 0)) return false;
          if (selectedPriceRange === 'pending' && vehicle.priceETB && vehicle.priceETB > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.priceETB || 0) - (b.priceETB || 0);
        if (sortBy === 'price-desc') return (b.priceETB || 0) - (a.priceETB || 0);
        if (sortBy === 'range') return b.rangeKm - a.rangeKm;
        if (sortBy === 'newest') return b.year - a.year;
        return 0; // 'recommended' uses natural order
      });
  }, [
    vehicles,
    searchTerm,
    selectedBrand,
    selectedBodyType,
    selectedPriceRange,
    selectedMinRange,
    selectedSeats,
    sortBy,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBrand !== 'all') count++;
    if (selectedBodyType !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedMinRange !== 'all') count++;
    if (selectedSeats !== 'all') count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  }, [selectedBrand, selectedBodyType, selectedPriceRange, selectedMinRange, selectedSeats, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedBodyType('all');
    setSelectedPriceRange('all');
    setSelectedMinRange('all');
    setSelectedSeats('all');
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 pt-24 pb-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header matching exact specification */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-cyan-400 mb-3 tracking-[0.25em] uppercase">
            <Sparkles className="w-3 h-3" />
            <span>OUR COLLECTION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight uppercase leading-tight mb-4">
            VEHICLE <span className="text-blue-500">CATALOG</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg font-normal leading-relaxed">
            Discover premium electric vehicles designed for Ethiopian roads and lifestyle.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>{vehicles.length} Flagship Models</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>100% Zero-Emission</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Local Warranty & Service</span>
            </span>
          </div>
        </div>

        {/* Large Search Bar & Filter Section */}
        <div className="bg-gradient-to-b from-[#0c1424]/90 to-[#080e1a]/95 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-10">
          
          {/* Main Search Input */}
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicles by name, brand, or features (e.g., BYD Tang, 7 Seats, 530km)..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#060a12] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Row (Brand, Vehicle Type, Price, Range, Seats, Sorting) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Brand Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-[#060a12] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Brands</option>
                {brands
                  .filter((b) => b !== 'all')
                  .map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </div>

            {/* 2. Vehicle Type Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Vehicle Type
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full bg-[#060a12] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="SUV">SUV</option>
                <option value="Crossover">Crossover</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            {/* 3. Price Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Price
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-[#060a12] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="configured">Price Configured</option>
                <option value="pending">Showroom Quotation</option>
              </select>
            </div>

            {/* 4. Range Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Range (NEDC)
              </label>
              <select
                value={selectedMinRange}
                onChange={(e) => setSelectedMinRange(e.target.value)}
                className="w-full bg-[#060a12] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Any Range</option>
                <option value="400">400+ km</option>
                <option value="500">500+ km</option>
                <option value="530">530+ km</option>
              </select>
            </div>

            {/* 5. Seats Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Seats
              </label>
              <select
                value={selectedSeats}
                onChange={(e) => setSelectedSeats(e.target.value)}
                className="w-full bg-[#060a12] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Seats</option>
                <option value="5">5 Seats</option>
                <option value="7">7 Seats</option>
              </select>
            </div>

            {/* 6. Sorting */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort By</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-[#0b1220] border border-blue-600/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-semibold"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="range">Range (Highest)</option>
                <option value="newest">Newest Model</option>
              </select>
            </div>

          </div>

          {/* Active Filter Badges & Reset Bar */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedBrand !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Brand: {selectedBrand}
                    <button onClick={() => setSelectedBrand('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedBodyType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Type: {selectedBodyType}
                    <button onClick={() => setSelectedBodyType('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedPriceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Price: {selectedPriceRange}
                    <button onClick={() => setSelectedPriceRange('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedMinRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Range: {selectedMinRange}+ km
                    <button onClick={() => setSelectedMinRange('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSeats !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/40 border border-blue-700/50 text-cyan-300">
                    Seats: {selectedSeats}
                    <button onClick={() => setSelectedSeats('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold tracking-wider uppercase text-[11px] transition-colors ml-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{filteredVehicles.length}</span> of {vehicles.length} vehicles
          </div>
          {filteredVehicles.length > 0 && (
            <div className="hidden sm:block text-slate-500">
              Click any vehicle card to view 3D angles & technical specifications
            </div>
          )}
        </div>

        {/* Vehicle Cards Grid / Empty State */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredVehicles.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl bg-gradient-to-b from-[#0c1424] via-[#090f1a] to-[#070b14] border border-slate-800 hover:border-blue-500/70 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_15px_40px_-10px_rgba(37,99,235,0.35)] hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Top Subtle Hover Glowing Line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400 group-to-transparent transition-all duration-500" />

                <div>
                  {/* Card Header: Brand Badge & Year / Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/80 text-[11px] font-extrabold tracking-widest text-cyan-300 uppercase">
                      {car.brand}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {car.year} Model
                    </span>
                  </div>

                  {/* Vehicle Name & Category */}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                    {car.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 mb-4 line-clamp-1">
                    {car.category}
                  </p>

                  {/* Large Vehicle Image Container */}
                  <div 
                    onClick={() => onSelectVehicle(car)}
                    className="relative w-full h-48 sm:h-52 bg-gradient-to-b from-[#070b13]/80 to-[#0b1322]/80 rounded-xl border border-slate-800/80 p-3 mb-5 flex items-center justify-center overflow-hidden cursor-pointer group-hover:border-blue-500/30"
                  >
                    {/* Radial Glow behind car */}
                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/15 rounded-xl transition-all duration-500" />
                    
                    <VehicleMedia
                      imageSrc={car.sideImage || car.thumbnail}
                      videoSrc={car.video}
                      alt={car.name}
                      className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                      videoClassName="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Quick 3D Perspective Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-slate-300 flex items-center gap-1 border border-slate-700/50">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>3D View</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-slate-300 text-xs leading-relaxed mb-5 line-clamp-2">
                    {car.tagline}
                  </p>

                  {/* Spec Chips (Range, Seats, Battery, Acceleration) */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                    <div className="flex items-center gap-2 bg-[#060a12] p-2.5 rounded-lg border border-slate-800/80">
                      <Gauge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase leading-none">Range (NEDC)</span>
                        <span className="font-bold text-white text-xs">{car.rangeNEDC}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#060a12] p-2.5 rounded-lg border border-slate-800/80">
                      <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase leading-none">Capacity</span>
                        <span className="font-bold text-white text-xs">{car.seats} Seats</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#060a12] p-2.5 rounded-lg border border-slate-800/80">
                      <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase leading-none">0-100 km/h</span>
                        <span className="font-bold text-white text-xs">{car.acceleration.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#060a12] p-2.5 rounded-lg border border-slate-800/80">
                      <Battery className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase leading-none">Drive</span>
                        <span className="font-bold text-white text-xs truncate max-w-[80px]">{car.driveType.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-slate-400 font-medium">Estimated Price</span>
                    <span className="text-sm font-bold text-cyan-300">{car.priceFormatted}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectVehicle(car)}
                      id={`btn-view-details-catalog-${car.id}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-sm transition-all duration-200 tracking-wider uppercase text-center shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onOpenTestDrive(car.id)}
                      className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-sm border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-wider uppercase text-center cursor-pointer"
                    >
                      Test Drive
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State when no matching vehicles found */
          <div className="bg-gradient-to-b from-[#0c1424]/80 to-[#080d17]/90 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-blue-950/80 border border-blue-600/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Car className="w-8 h-8 opacity-70" />
            </div>

            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              No vehicles found
            </h3>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Try adjusting your search or filters.
            </p>

            <button
              onClick={handleResetFilters}
              id="btn-reset-filters-empty"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-sm transition-all duration-200 tracking-wider uppercase inline-flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
