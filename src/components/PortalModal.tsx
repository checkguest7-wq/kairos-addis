import React, { useState } from 'react';
import { X, User, KeyRound, ArrowRight, ShieldCheck, Wrench, FileText } from 'lucide-react';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortalModal({ isOpen, onClose }: PortalModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'demo'>('login');
  const [phoneNumber, setPhoneNumber] = useState('+251 9');
  const [vinNumber, setVinNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0c1424] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-8 text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="modal-close-portal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isLoggedIn ? (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                OWNER DASHBOARD
              </span>
              <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                Kairos Owner Portal
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Access your vehicle health diagnostics, warranty certificate, and schedule authorized maintenance.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Registered Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full bg-[#080d17] border border-slate-700 text-white rounded-lg px-3.5 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Vehicle VIN or Plate Number
                </label>
                <input
                  type="text"
                  required
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  placeholder="e.g. BYD-TANG-2025-089 or 2-B12345"
                  className="w-full bg-[#080d17] border border-slate-700 text-white rounded-lg px-3.5 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-sm transition-all duration-200 tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.45)]"
                >
                  <span>Access Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase">Welcome Back</span>
                <h3 className="text-xl font-bold text-white uppercase">Alebachew Abreham</h3>
                <span className="text-xs text-slate-400">BYD Tang L (7-Seater AWD)</span>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-semibold">
                Active Warranty
              </span>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3">
                <div className="text-slate-400 mb-1">Battery State of Health</div>
                <div className="text-lg font-bold text-emerald-400">99.4% (Optimal)</div>
              </div>
              <div className="bg-[#080d17] border border-slate-800 rounded-xl p-3">
                <div className="text-slate-400 mb-1">Next Service Due</div>
                <div className="text-lg font-bold text-cyan-400">In 4,200 km</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>5-Year Vehicle Warranty Certificate</span>
                </div>
                <span className="text-blue-400 font-semibold cursor-pointer">View PDF</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>Schedule Routine EV Inspection</span>
                </div>
                <span className="text-blue-400 font-semibold cursor-pointer">Book</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
