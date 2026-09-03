import { ShieldCheck, Zap, Wrench, Users } from 'lucide-react';
import { WhyFeature } from '../types';

interface WhyChooseUsSectionProps {
  features: WhyFeature[];
  onOpenWarrantyModal: () => void;
}

export function WhyChooseUsSection({ features, onOpenWarrantyModal }: WhyChooseUsSectionProps) {
  const renderIcon = (type: WhyFeature['iconType']) => {
    switch (type) {
      case 'warranty':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600/30 to-blue-900/40 border border-blue-400/30 shadow-[0_0_25px_rgba(59,130,246,0.35)] group-hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-sm" />
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
        );
      case 'expertise':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-600/30 to-blue-900/40 border border-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-sm" />
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 fill-cyan-400/20 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>
        );
      case 'service':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-700/30 to-indigo-900/40 border border-blue-400/30 shadow-[0_0_25px_rgba(59,130,246,0.35)] group-hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-sm" />
            <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
          </div>
        );
      case 'support':
        return (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-sky-600/30 to-blue-950/40 border border-sky-400/30 shadow-[0_0_25px_rgba(56,189,248,0.35)] group-hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/10 blur-sm" />
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
        );
    }
  };

  return (
    <section id="why-choose-us" className="relative py-20 bg-transparent overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-700/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[12px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
            WHY CHOOSE US
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 uppercase">
            WHY KAIROS ADDIS?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-normal">
            More than a car. A complete electric driving experience.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              onClick={item.iconType === 'warranty' ? onOpenWarrantyModal : undefined}
              id={`why-card-${item.id}`}
              className={`group relative rounded-2xl bg-gradient-to-b from-[#0c1424]/80 to-[#080d17]/90 border border-slate-800/90 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-[#0f1a30] hover:-translate-y-1 shadow-xl backdrop-blur-sm ${
                item.iconType === 'warranty' ? 'cursor-pointer' : ''
              }`}
            >
              {/* Icon Container with 3D glowing look */}
              <div className="mb-6">{renderIcon(item.iconType)}</div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wider uppercase mb-3 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>

              {item.iconType === 'warranty' && (
                <span className="mt-4 text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:text-blue-300">
                  View Coverage Details &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
