interface FinalCtaSectionProps {
  onExploreVehicles: () => void;
  onBookTestDrive: () => void;
}

export function FinalCtaSection({ onExploreVehicles, onBookTestDrive }: FinalCtaSectionProps) {
  return (
    <section id="cta" className="relative py-20 lg:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Panoramic Banner Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090e17]">
          
          {/* Background Dusk City & Rear EV Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/cta_car_city_1788207055565.jpg"
              alt="Ready to Go Electric with Kairos Addis"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-right md:object-center filter brightness-90"
            />
            {/* Gradient Overlay to guarantee text legibility on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06090e] via-[#06090e]/85 to-transparent md:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090e] via-transparent to-transparent" />
          </div>

          {/* Content Block */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-xl">
            <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
              THE FUTURE IS ELECTRIC
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.0] mt-3 mb-4 uppercase">
              READY TO<br />
              <span className="text-white">GO ELECTRIC</span>
              <span className="text-blue-500">?</span>
            </h2>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-medium">
              Experience the future of driving with Kairos Addis.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreVehicles}
                id="cta-btn-explore-vehicles"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-[13px] font-bold px-6 py-3.5 rounded-sm transition-all duration-200 tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.65)] cursor-pointer"
              >
                EXPLORE VEHICLES
              </button>
              <button
                onClick={onBookTestDrive}
                id="cta-btn-book-test-drive"
                className="bg-black/50 hover:bg-slate-900/80 text-white text-xs sm:text-[13px] font-bold px-6 py-3.5 rounded-sm border border-slate-600 hover:border-slate-400 transition-all duration-200 tracking-wider backdrop-blur-sm cursor-pointer"
              >
                BOOK A TEST DRIVE
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
