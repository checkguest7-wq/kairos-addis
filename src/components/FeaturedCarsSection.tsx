import { VehicleMedia } from './VehicleMedia';
import { useState, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Gauge, Users } from 'lucide-react';
import { Vehicle } from '../types';

interface FeaturedCarsSectionProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenTestDrive: (carId?: string) => void;
}

export function FeaturedCarsSection({
  vehicles,
  onSelectVehicle,
  onOpenTestDrive,
}: FeaturedCarsSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Interactive 3D Tilt based on mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const showcaseRef = useRef<HTMLDivElement>(null);

  const activeCar = vehicles[selectedIndex] || vehicles[0];

  const handlePrev = () => {
    setDirection(-1);
    setSelectedIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setSelectedIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };

  const handleSelectThumb = (index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!showcaseRef.current) return;
    const rect = showcaseRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 3D Motion Variants for the car transition
  const carVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 180 : -180,
      y: 0,
      z: -160,
      rotateY: dir > 0 ? 35 : -35,
      rotateX: 5,
      scale: 0.8,
      opacity: 0,
      filter: 'blur(4px)',
    }),
    center: {
      x: 0,
      y: 0,
      z: 0,
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        rotateY: { type: 'spring', stiffness: 220, damping: 25 },
        scale: { duration: 0.45 },
        opacity: { duration: 0.35 },
        filter: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -180 : 180,
      y: 0,
      z: -160,
      rotateY: dir > 0 ? -35 : 35,
      rotateX: -5,
      scale: 0.8,
      opacity: 0,
      filter: 'blur(4px)',
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
      },
    }),
  };

  const currentImage = activeCar.sideImage || activeCar.heroImage || activeCar.thumbnail;

  return (
    <section id="vehicles" className="relative py-24 bg-[#06090e]/95 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
            OUR LINEUP
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 uppercase">
            EXPLORE OUR <span className="text-blue-500">VEHICLES</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-normal">
            Choose the perfect electric vehicle for your lifestyle.
          </p>
        </div>

        {/* Interactive 3D Showcase Turntable Stage */}
        <div
          ref={showcaseRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-2xl bg-gradient-to-b from-[#0c1322]/90 via-[#0a101d]/95 to-[#070b13] border border-slate-700/70 p-6 sm:p-10 lg:p-12 mb-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(37,99,235,0.15)] backdrop-blur-xl overflow-hidden"
          style={{ perspective: '1400px' }}
        >
          {/* Top subtle rim light highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            id="featured-cars-prev-btn"
            aria-label="Previous Vehicle"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700/90 text-slate-200 hover:text-white hover:border-cyan-400 hover:bg-blue-600/30 hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            id="featured-cars-next-btn"
            aria-label="Next Vehicle"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700/90 text-slate-200 hover:text-white hover:border-cyan-400 hover:bg-blue-600/30 hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-2 sm:px-6">
            
            {/* Left Specs & Details with smooth AnimatePresence */}
            <div className="lg:col-span-4 flex flex-col justify-center relative z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCar.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight">
                    {activeCar.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 mb-6">
                    {activeCar.category}
                  </p>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                    <div className="flex items-start gap-3 bg-[#080d17]/80 p-3 rounded-xl border border-slate-800">
                      <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-700/50 text-cyan-400 mt-0.5">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {activeCar.rangeNEDC}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Range (NEDC)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#080d17]/80 p-3 rounded-xl border border-slate-800">
                      <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-700/50 text-cyan-400 mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {activeCar.seats}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Seats
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View Details & Test Drive CTAs */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onSelectVehicle(activeCar)}
                      id={`btn-view-details-${activeCar.id}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-sm transition-all duration-200 tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.45)] hover:shadow-[0_0_22px_rgba(37,99,235,0.7)] cursor-pointer"
                    >
                      VIEW DETAILS
                    </button>
                    <button
                      onClick={() => onOpenTestDrive(activeCar.id)}
                      className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold px-4 py-3 rounded-sm border border-slate-700 hover:border-slate-500 transition-all duration-200 tracking-wider cursor-pointer"
                    >
                      TEST DRIVE
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Large 3D Vehicle Turntable Stage */}
            <div className="lg:col-span-8 relative flex items-center justify-center min-h-[320px] sm:min-h-[390px] py-4">
              
              {/* 3D Holographic Turntable Stage Platform */}
              <div className="absolute bottom-2 inset-x-4 sm:inset-x-12 h-28 pointer-events-none flex items-center justify-center">
                {/* Outer glowing cyan ellipse */}
                <div
                  className="w-full h-24 rounded-[100%] border border-cyan-500/40 bg-gradient-to-t from-blue-600/20 via-blue-900/10 to-transparent shadow-[0_0_40px_rgba(6,182,212,0.3)] transform -rotate-x-60 animate-pulse"
                  style={{
                    transform: 'perspective(600px) rotateX(72deg)',
                  }}
                />
                {/* Inner bright blue ring */}
                <div
                  className="absolute w-3/4 h-16 rounded-[100%] border border-blue-400/60 shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                  style={{
                    transform: 'perspective(600px) rotateX(72deg)',
                  }}
                />
                {/* Center stage floor reflection glow */}
                <div className="absolute w-2/3 h-10 bg-cyan-400/20 rounded-full blur-xl" />
              </div>

              {/* Dynamic 3D Rotating Vehicle Container */}
              <div 
                className="relative w-full h-full flex items-center justify-center z-10 py-6"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 4}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={activeCar.id}
                    custom={direction}
                    variants={carVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="relative w-full flex items-center justify-center"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Vehicle image, with video fallback when no image is available */}
                    <VehicleMedia
                      imageSrc={currentImage}
                      videoSrc={activeCar.video}
                      alt={`${activeCar.name} 3D Showcase`}
                      className="w-full max-h-[300px] sm:max-h-[360px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] select-none pointer-events-none"
                      videoClassName="w-full max-h-[300px] sm:max-h-[360px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] select-none pointer-events-none"
                    />

                    {/* Ground contact shadow */}
                    <div className="absolute -bottom-4 w-4/5 h-6 bg-black/80 rounded-full blur-md -z-10" />
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom 5 Car Selector Thumbnails Row with 3D Active State */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {vehicles.map((car, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={car.id}
                onClick={() => handleSelectThumb(index)}
                id={`car-thumb-selector-${car.id}`}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 cursor-pointer text-left overflow-hidden group ${
                  isSelected
                    ? 'bg-[#0e172a] border-2 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.45)] scale-[1.02]'
                    : 'bg-[#090e18]/80 border border-slate-800 hover:border-slate-700 hover:bg-[#0c1424] hover:-translate-y-1'
                }`}
              >
                {/* Active Indicator Top Glow */}
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
                )}

                {/* Thumbnail Image */}
                <div className="w-full h-24 sm:h-28 flex items-center justify-center overflow-hidden mb-2">
                  <VehicleMedia
                    imageSrc={car.thumbnail}
                    videoSrc={car.video}
                    alt={car.name}
                    className={`w-full h-full object-contain drop-shadow-md transition-all duration-500 ${
                      isSelected ? 'scale-110 drop-shadow-[0_5px_15px_rgba(59,130,246,0.4)]' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'
                    }`}
                    videoClassName={`w-full h-full object-contain drop-shadow-md transition-all duration-500 ${
                      isSelected ? 'scale-110 drop-shadow-[0_5px_15px_rgba(59,130,246,0.4)]' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'
                    }`}
                  />
                </div>

                {/* Car Name Label */}
                <span
                  className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                    isSelected ? 'text-cyan-300 font-extrabold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {car.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
