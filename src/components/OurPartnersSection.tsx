import { ReactNode } from 'react';

interface Partner {
  id: string;
  name: string;
  category: string;
  logo: ReactNode;
}

export function OurPartnersSection() {
  const partners: Partner[] = [
    {
      id: 'ti-group',
      name: 'TI Automotive',
      category: 'Automotive & Fluid Systems',
      logo: (
        <div className="flex items-center justify-center">
          {/* Bold stylized TI monogram from reference */}
          <div className="flex items-center justify-center bg-slate-900 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-inner">
            <span className="text-white font-black text-2xl tracking-tighter leading-none font-mono">
              T<span className="text-cyan-400">i</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'geely-auto',
      name: 'Geely Auto',
      category: 'Smart Mobility Pioneer',
      logo: (
        <div className="flex flex-col items-center justify-center">
          {/* Stylized Geely 6-grid shield crest */}
          <div className="w-14 h-7 border border-slate-300 rounded-sm grid grid-cols-3 grid-rows-2 gap-[1px] p-[2px] bg-slate-800/40">
            <div className="bg-slate-300/80 rounded-[1px]" />
            <div className="bg-slate-600 rounded-[1px]" />
            <div className="bg-slate-300/80 rounded-[1px]" />
            <div className="bg-slate-600 rounded-[1px]" />
            <div className="bg-slate-300/80 rounded-[1px]" />
            <div className="bg-slate-600 rounded-[1px]" />
          </div>
          <span className="text-white font-extrabold tracking-[0.25em] text-xs mt-2 uppercase">
            GEELY
          </span>
        </div>
      ),
    },
    {
      id: 'xcmg-group',
      name: 'XCMG Group',
      category: 'Heavy Machinery & Logistics Partner',
      logo: (
        <div className="flex items-center gap-1.5 justify-center">
          {/* Stylized XCMG Hexagonal gear badge */}
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_12px_rgba(37,99,235,0.6)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 3.3L18.7 8 12 11.7 5.3 8 12 5.3zm-7 4.9l6 3.3v6.7l-6-3.3V10.2zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
            </svg>
          </div>
          <span className="text-white font-black tracking-wider text-lg italic">
            XCMG
          </span>
        </div>
      ),
    },
    {
      id: 'gsez-zone',
      name: 'Gada Special Economic Zone',
      category: 'Industrial Infrastructure & Logistics',
      logo: (
        <div className="flex items-center gap-2 justify-center">
          {/* Stylized GSEZ Mountain/Arch emblem */}
          <div className="w-7 h-7 bg-red-600/90 rounded flex items-center justify-center text-white font-black text-[10px] shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            <span>GSEZ</span>
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
              Gada SEZ
            </span>
            <span className="text-[9px] text-slate-400">
              Special Economic Zone
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="partners" className="relative py-20 bg-transparent overflow-hidden border-t border-slate-900/60">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[250px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Centered Section Header matching prompt specification */}
        <div className="text-center mb-12">
          <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Our Partners
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 uppercase">
            Trusted Brands We Work With
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-normal">
            Partnering with world-class manufacturers, energy pioneers, and national infrastructure leaders.
          </p>
        </div>

        {/* Row of 4 Partner Cards matching prompt specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {partners.map((partner) => (
            <div
              key={partner.id}
              id={`partner-card-${partner.id}`}
              className="group relative rounded-2xl bg-gradient-to-b from-[#0c1424]/80 to-[#080d17]/90 border border-slate-800/90 hover:border-blue-500/50 hover:bg-[#0e192f] p-8 min-h-[140px] flex flex-col items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-sm hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.25)]"
            >
              {/* Subtle card top glow on hover */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/0 group-hover:via-cyan-400/40 to-transparent transition-all duration-500" />

              {/* Centered Logo Display */}
              <div className="w-full flex items-center justify-center h-16 transition-transform duration-300 group-hover:scale-105">
                {partner.logo}
              </div>

              {/* Hover category indicator */}
              <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium tracking-wide mt-2 text-center opacity-80 transition-opacity">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
