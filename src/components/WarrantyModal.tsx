import { X, ShieldCheck, BatteryCharging, Wrench, CheckCircle2 } from 'lucide-react';
import { WARRANTY_ITEMS } from '../data/features';

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService: () => void;
}

export function WarrantyModal({ isOpen, onClose, onBookService }: WarrantyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c1424] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-8 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="modal-close-warranty"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
            PEACE OF MIND GUARANTEED
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
            Kairos Addis EV Warranty Protection
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Every vehicle delivered by Kairos Addis is backed by comprehensive manufacturer-certified warranties tailored for Ethiopian conditions.
          </p>
        </div>

        {/* 4 Warranty Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {WARRANTY_ITEMS.map((item) => (
            <div key={item.id} className="bg-[#080d17] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-1">
                  {item.label}
                </div>
                <div className="text-lg font-extrabold text-white mb-1">
                  {item.duration}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* What's Covered List */}
        <div className="bg-[#080d17] border border-slate-800 rounded-xl p-4 mb-6 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            What is Included
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Full High-Voltage Battery Cell Health Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Electric Motors & Inverter Control Units</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Genuine OEM Parts & Factory Diagnostic Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>24/7 Roadside Assistance in Addis Ababa Metro</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            Questions about our warranty? Speak with our team.
          </span>
          <button
            onClick={() => {
              onClose();
              onBookService();
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-sm tracking-wider uppercase shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Contact Service Team
          </button>
        </div>

      </div>
    </div>
  );
}
