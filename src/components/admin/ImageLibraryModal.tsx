import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  Search,
  Sparkles,
  Filter,
  Car,
  Building,
  Users,
  FolderOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';

export interface ImageAssetItem {
  id: string;
  name: string;
  category: 'vehicles' | 'showroom' | 'customers' | 'uploads' | 'branding';
  url: string;
  description?: string;
  dimensions?: string;
}

export const SHOWROOM_ASSET_LIBRARY: ImageAssetItem[] = [
  // Vehicles
  {
    id: 'byd_tang_l_hero',
    name: 'BYD Tang L (Flagship Front 3/4)',
    category: 'vehicles',
    url: '/images/hero_byd_tang_1788207021341.jpg',
    description: 'Flagship 7-seater luxury electric SUV in dark studio lighting',
    dimensions: '1920x1080',
  },
  {
    id: 'byd_tang_l_side',
    name: 'BYD Tang L (Profile View)',
    category: 'vehicles',
    url: '/images/byd_tang_side_1788207031619.jpg',
    description: 'Side profile aerodynamic view with alloy wheels',
    dimensions: '1920x1080',
  },
  {
    id: 'geely_galaxy_e5',
    name: 'Geely Galaxy E5 Crossover',
    category: 'vehicles',
    url: '/images/car_geely_e5_1788207068809.jpg',
    description: 'Smart modern electric crossover in showroom illumination',
    dimensions: '1920x1080',
  },
  {
    id: 'byd_song_plus',
    name: 'BYD Song Plus EV',
    category: 'vehicles',
    url: '/images/car_byd_song_1788207081795.jpg',
    description: 'Premium family electric SUV with Blade Battery badge',
    dimensions: '1920x1080',
  },
  {
    id: 'toyota_bz3x',
    name: 'Toyota bZ3X Electric',
    category: 'vehicles',
    url: '/images/car_toyota_bz3x_1788207093974.jpg',
    description: 'Pure electric Toyota crossover with advanced ADAS suite',
    dimensions: '1920x1080',
  },
  {
    id: 'geely_starwish',
    name: 'Geely Starwish Urban EV',
    category: 'vehicles',
    url: '/images/car_geely_starwish_1788207105482.jpg',
    description: 'Urban luxury electric hatchback for city commuting',
    dimensions: '1920x1080',
  },
  {
    id: 'cta_car_city',
    name: 'Electric Luxury in Addis Ababa',
    category: 'vehicles',
    url: '/images/cta_car_city_1788207055565.jpg',
    description: 'Dynamic road visual overlooking city horizon',
    dimensions: '1920x1080',
  },

  // Showroom & Facility
  {
    id: 'showroom_exterior_bole',
    name: 'Bole Wollo Sefer Showroom Exterior',
    category: 'showroom',
    url: '/images/showroom_building_exterior_1788210082036.jpg',
    description: 'Flagship showroom building facade directly infront of Ibex Hotel',
    dimensions: '1920x1080',
  },
  {
    id: 'showroom_exterior_alt',
    name: 'Showroom Glass Facade & Vehicles',
    category: 'showroom',
    url: '/images/showroom_exterior_1788207130284.jpg',
    description: 'Architectural showroom view with vehicle display floor',
    dimensions: '1920x1080',
  },
  {
    id: 'about_hero_showroom',
    name: 'Luxury Showroom Interior Hall',
    category: 'showroom',
    url: '/images/about_hero_showroom_1788210068828.jpg',
    description: 'Grand interior showroom hall with ambient lighting',
    dimensions: '1920x1080',
  },
  {
    id: 'ev_service_center',
    name: 'Bole Medhanialem EV Service Center',
    category: 'showroom',
    url: '/images/ev_service_center_1788209856424.jpg',
    description: 'High-voltage EV certified service center and diagnostic bay',
    dimensions: '1920x1080',
  },
  {
    id: 'ev_battery_chassis',
    name: 'YouGuard EV Battery & Chassis Rig',
    category: 'showroom',
    url: '/images/ev_battery_chassis_1788207043314.jpg',
    description: 'Advanced Blade Battery structural chassis diagnostic layout',
    dimensions: '1920x1080',
  },
  {
    id: 'showroom_bg_texture',
    name: 'Atmospheric Showroom Dark Texture',
    category: 'showroom',
    url: '/images/showroom_bg_texture_1788208293379.jpg',
    description: 'High-contrast textured background for luxury dark aesthetics',
    dimensions: '1920x1080',
  },
  {
    id: 'hero_full_bg',
    name: 'Showroom Ambient Glow Backdrop',
    category: 'showroom',
    url: '/images/hero_full_bg_1788208638008.jpg',
    description: 'Showroom backdrop with deep blue neon atmosphere',
    dimensions: '1920x1080',
  },

  // Customers & Reviews
  {
    id: 'customer_yonas',
    name: 'Customer Delivery - Yonas Bekele',
    category: 'customers',
    url: '/images/customer_yonas_1788207144792.jpg',
    description: 'BYD Tang L delivery at Bole Wollo Sefer Showroom',
    dimensions: '1200x800',
  },
  {
    id: 'customer_eden',
    name: 'Customer Delivery - Eden T.',
    category: 'customers',
    url: '/images/customer_eden_1788207132492.jpg',
    description: 'Geely Galaxy E5 handover celebration',
    dimensions: '1200x800',
  },
  {
    id: 'customer_alebachew',
    name: 'Customer Delivery - Alebachew M.',
    category: 'customers',
    url: '/images/customer_alebachew_1788207120222.jpg',
    description: 'BYD Song Plus handover in Addis Ababa',
    dimensions: '1200x800',
  },
];

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
  initialSelectedUrl?: string;
  targetType?: 'vehicle' | 'logo' | 'favicon' | 'general';
}

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select Asset from Image Library',
  initialSelectedUrl = '',
  targetType = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vehicles' | 'showroom' | 'customers' | 'uploads'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(initialSelectedUrl);
  const [customUrlInput, setCustomUrlInput] = useState('');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [userUploadedAssets, setUserUploadedAssets] = useState<ImageAssetItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const combinedLibrary = [...userUploadedAssets, ...SHOWROOM_ASSET_LIBRARY];

  const filteredAssets = combinedLibrary.filter((asset) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      asset.category === selectedCategory ||
      (selectedCategory === 'uploads' && asset.category === 'uploads');

    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleApplySelection = (urlToApply?: string) => {
    const finalUrl = urlToApply || selectedUrl;
    if (!finalUrl) return;
    onSelectImage(finalUrl);
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Accept JPG/JPEG and PNG images regardless of whether the browser
    // reports the MIME type or the file extension correctly.
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isJpg = file.type === 'image/jpeg' || extension === 'jpg' || extension === 'jpeg';
    const isPng = file.type === 'image/png' || extension === 'png';

    if (!isJpg && !isPng) {
      setUploadError('Only JPG/JPEG and PNG images are supported.');
      return;
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds maximum limit of 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await api.adminUploadMedia({
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data,
            category: targetType === 'logo' || targetType === 'favicon' ? 'branding' : 'vehicles',
          });

          const uploadedUrl = res.url || base64Data;
          const newAsset: ImageAssetItem = {
            id: `upload_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            category: 'uploads',
            url: uploadedUrl,
            description: `Uploaded ${new Date().toLocaleDateString()}`,
            dimensions: `${file.type.toUpperCase()} • ${(file.size / 1024).toFixed(0)} KB`,
          };

          setUserUploadedAssets((prev) => [newAsset, ...prev]);
          setSelectedUrl(uploadedUrl);
          setUploadSuccess('Image uploaded and processed successfully.');
        } catch (err: any) {
          setUploadError(err.message || 'Failed to upload image asset.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400">
                Choose high-resolution EV models, showroom exterior assets, or upload custom branding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close image library"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-950/30">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Showroom Library</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40">
                {combinedLibrary.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Image</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>External URL</span>
            </button>
          </div>

          {/* Search in Library */}
          {activeTab === 'library' && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models & assets..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Library Asset Browser */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Category Filter Pills */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                All Assets ({combinedLibrary.length})
              </button>
              <button
                onClick={() => setSelectedCategory('vehicles')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedCategory === 'vehicles'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                <Car className="w-3 h-3" /> Vehicles (
                {combinedLibrary.filter((a) => a.category === 'vehicles').length})
              </button>
              <button
                onClick={() => setSelectedCategory('showroom')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedCategory === 'showroom'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                <Building className="w-3 h-3" /> Showroom & Facility (
                {combinedLibrary.filter((a) => a.category === 'showroom').length})
              </button>
              <button
                onClick={() => setSelectedCategory('customers')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedCategory === 'customers'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                <Users className="w-3 h-3" /> Testimonials (
                {combinedLibrary.filter((a) => a.category === 'customers').length})
              </button>
              {userUploadedAssets.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('uploads')}
                  className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    selectedCategory === 'uploads'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                  }`}
                >
                  <Upload className="w-3 h-3" /> My Uploads ({userUploadedAssets.length})
                </button>
              )}
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[50vh]">
              {filteredAssets.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                  No images matching &ldquo;{searchQuery}&rdquo; found. Try adjusting your search query.
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedUrl === asset.url;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedUrl(asset.url)}
                      onDoubleClick={() => handleApplySelection(asset.url)}
                      className={`group relative rounded-xl border p-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative mb-2 flex items-center justify-center">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-600/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] font-mono text-cyan-300 border border-slate-800">
                          {asset.category.toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {asset.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{asset.description}</p>
                        {asset.dimensions && (
                          <p className="text-[9px] font-mono text-slate-500">{asset.dimensions}</p>
                        )}
                      </div>

                      {/* Select Button */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                          {asset.url.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySelection(asset.url);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Use Asset'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Custom Image */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all flex flex-col items-center justify-center space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {isUploading ? 'Uploading & Processing Image...' : 'Click to Browse or Drag & Drop Image'}
                </h3>
                <p className="text-xs text-slate-400">
                  Supports JPG/JPEG and PNG (Maximum size: 10MB)
                </p>
              </div>

              <div className="pt-2">
                <span className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                  Select File from Computer
                </span>
              </div>
            </div>

            {/* Status alerts */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {selectedUrl && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={selectedUrl}
                    alt="Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">Active Selected Image</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{selectedUrl}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplySelection()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Use This Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom External URL */}
        {activeTab === 'url' && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter Direct Image URL or Relative Path
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => {
                    setCustomUrlInput(e.target.value);
                    setSelectedUrl(e.target.value);
                  }}
                  placeholder="https://example.com/vehicle-hero.jpg or /src/assets/..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setSelectedUrl(customUrlInput)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Preview
                </button>
              </div>
            </div>

            {selectedUrl && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Live URL Preview:</p>
                <div className="w-full h-44 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                  <img
                    src={selectedUrl}
                    alt="Custom URL Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-hidden max-w-sm sm:max-w-md">
            {selectedUrl ? (
              <>
                <img
                  src={selectedUrl}
                  alt="Selected thumbnail"
                  className="w-8 h-8 rounded border border-slate-700 object-cover shrink-0"
                />
                <span className="text-[11px] font-mono text-cyan-400 truncate">{selectedUrl}</span>
              </>
            ) : (
              <span className="text-[11px] text-slate-500 italic">No image currently selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={() => handleApplySelection()}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Selection</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
