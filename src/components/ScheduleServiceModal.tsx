import { useState, FormEvent } from 'react';
import { X, Calendar, Clock, Wrench, CheckCircle, ShieldCheck, Car, User, Phone } from 'lucide-react';
import { VEHICLES } from '../data/vehicles';

interface ScheduleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleServiceModal({ isOpen, onClose }: ScheduleServiceModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('BYD TANG L');
  const [serviceType, setServiceType] = useState('10,000 KM Routine Inspection');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM - 12:00 PM)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0b1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 my-6 text-slate-200">
        
        {/* Top Highlight */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="modal-close-schedule-service"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-900/60 border border-blue-500 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(37,99,235,0.4)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              Service Appointment Requested!
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-4">
              Thank you, <span className="text-white font-semibold">{name || 'valued client'}</span>. Your appointment for your <span className="text-cyan-400 font-semibold">{vehicle}</span> ({serviceType}) has been logged.
            </p>
            <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto mb-6">
              Our service coordinator at the Bole Medhanialem EV Workshop will call <span className="text-white">{phone}</span> to confirm your time slot.
            </div>
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-sm tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.5)] cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">
                <Wrench className="w-3.5 h-3.5" />
                <span>AUTHORIZED EV SERVICE CENTER</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
                SCHEDULE <span className="text-blue-500">SERVICE</span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Book authorized maintenance, diagnostic checkups, or warranty repairs in Addis Ababa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 234 5678"
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Vehicle Model *
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {VEHICLES.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.brand})
                      </option>
                    ))}
                    <option value="Other EV Model">Other EV Model</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Service Required *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="10,000 KM Routine Inspection">10,000 KM Routine Inspection</option>
                    <option value="20,000 KM Maintenance & Filter">20,000 KM Maintenance & Filter</option>
                    <option value="40,000 KM Comprehensive Diagnostics">40,000 KM Comprehensive Diagnostics</option>
                    <option value="80,000 KM Major System Service">80,000 KM Major System Service</option>
                    <option value="High-Voltage Battery Diagnostic">High-Voltage Battery Diagnostic</option>
                    <option value="YouGuard Warranty Claim / Repair">YouGuard Warranty Claim / Repair</option>
                    <option value="Tire & Alignment Service">Tire & Alignment Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Late Afternoon (4:00 PM - 6:30 PM)">Late Afternoon (4:00 PM - 6:30 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Additional Notes / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe any issues or specific parts required..."
                  className="w-full bg-[#060a12] border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-schedule-service"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-sm transition-all duration-200 tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.45)] cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Service Booking</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
