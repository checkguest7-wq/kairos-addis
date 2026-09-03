import { Shield, BatteryCharging, Cog, Wrench } from 'lucide-react';
import { WarrantyItem } from '../types';

interface WarrantySectionProps {
  items: WarrantyItem[];
  onLearnMore: () => void;
}

export function WarrantySection({ items, onLearnMore }: WarrantySectionProps) {
  const getIcon = (type: WarrantyItem['iconType']) => {
    switch (type) {
      case 'shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'battery':
        return <BatteryCharging className="w-5 h-5 text-cyan-400" />;
      case 'drivetrain':
        return <Cog className="w-5 h-5 text-cyan-400" />;
      case 'service':
        return <Wrench className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="warranty" className="relative py-24 bg-transparent overflow-hidden border-t border-slate-900/80">
      {/* Background Lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase mb-2">
              WARRANTY & SERVICE
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.05] uppercase mb-4">
              YOUR EV.<br />
              <span>PROTECTED</span>
              <span className="text-blue-500">.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              Comprehensive warranty and reliable service for complete peace of mind.
            </p>
            <div>
              <button
                onClick={onLearnMore}
                id="btn-learn-about-warranty"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-[13px] font-bold px-6 py-3.5 rounded-sm transition-all duration-200 tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(37,99,235,0.65)] cursor-pointer"
              >
                LEARN ABOUT WARRANTY
              </button>
            </div>
          </div>

          {/* Center Column: Exploded Battery Chassis 3D Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full rounded-2xl overflow-hidden group">
              <img
                src="/images/ev_battery_chassis_1788207043314.jpg"
                alt="Kairos Addis EV Battery Platform and Chassis Cutaway"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06090e] via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* Right Column: 4 Warranty Items */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                id={`warranty-item-${item.id}`}
                className="flex items-start gap-4 group cursor-pointer"
                onClick={onLearnMore}
              >
                {/* Icon Glass Badge */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200">
                  {getIcon(item.iconType)}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                    {item.duration}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
