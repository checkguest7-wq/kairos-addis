import { Zap, Crown, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onExploreVehicles: () => void;
  onBookTestDrive: () => void;
}

export function HeroSection({ onExploreVehicles, onBookTestDrive }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] lg:min-h-screen flex items-center overflow-hidden"
    >
      {/* Immersive Full-Bleed Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-[70%_center] sm:object-center filter brightness-[0.88] contrast-[1.05]"
        />

        {/* Sophisticated Dark Gradient Overlays for perfect typography contrast */}
        {/* Left-to-right fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090e] via-[#06090e]/85 to-transparent sm:via-[#06090e]/75 sm:to-transparent lg:w-2/3" />
        
        {/* Top subtle navbar shadow fade */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#06090e] via-[#06090e]/70 to-transparent" />
        
        {/* Bottom smooth blend into next section */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#06090e] via-[#06090e]/80 to-transparent" />

        {/* Subtle cyan & blue ambient floor glow */}
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[150px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Foreground Content positioned seamlessly over the scene */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-2xl">
          
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-3" id="hero-tagline">
            <span className="text-[13px] md:text-sm font-bold tracking-[0.25em] text-cyan-400 uppercase">
              THE FUTURE OF DRIVING
            </span>
          </div>

          {/* Display Heading */}
          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.92] mb-6 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          >
            HAS<br />
            <span>ARRIVED</span>
            <span className="text-blue-500">.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-lg font-normal leading-relaxed mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Premium electric vehicles for a new generation of Ethiopian drivers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button
              onClick={onExploreVehicles}
              id="hero-btn-explore"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-[13px] font-bold px-7 py-4 rounded-sm transition-all duration-200 tracking-wider shadow-[0_0_25px_rgba(37,99,235,0.55)] hover:shadow-[0_0_35px_rgba(37,99,235,0.8)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              EXPLORE VEHICLES
            </button>
            <button
              onClick={onBookTestDrive}
              id="hero-btn-test-drive"
              className="bg-slate-950/70 hover:bg-slate-900/90 text-white text-xs sm:text-[13px] font-bold px-7 py-4 rounded-sm border border-slate-600/80 hover:border-cyan-400 transition-all duration-200 tracking-wider backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              BOOK A TEST DRIVE
            </button>
          </div>

          {/* Bottom 3 Feature Badges Row */}
          <div className="pt-6 border-t border-slate-700/60 flex flex-wrap items-center gap-6 sm:gap-8 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span className="uppercase text-slate-200">100% ELECTRIC</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-slate-300" />
              <span className="uppercase text-slate-200">PREMIUM COMFORT</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="uppercase text-slate-200">BUILT FOR ETHIOPIA</span>
            </div>
          </div>

        </div>

        {/* Floating Flagship Model Badge on bottom right of the hero */}
        <div className="hidden md:flex absolute right-8 lg:right-12 bottom-12 items-center gap-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-sm shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold text-slate-200 tracking-widest uppercase">
            BYD TANG L &bull; FLAGSHIP AWD
          </span>
        </div>
      </div>
    </section>
  );
}
