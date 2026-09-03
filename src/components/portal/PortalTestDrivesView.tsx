import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Calendar, Clock, MapPin, PlusCircle, CheckCircle2, AlertCircle, Trash2, Car } from 'lucide-react';
import { TestDriveRequest } from '../../types';
import { api } from '../../lib/api';

interface PortalTestDrivesViewProps {
  testDrives: TestDriveRequest[];
  onRefresh: () => void;
}

export const PortalTestDrivesView: React.FC<PortalTestDrivesViewProps> = ({
  testDrives,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicleName, setVehicleName] = useState('Geely Galaxy E5 (Pure Electric SUV)');
  const [preferredDate, setPreferredDate] = useState('2026-09-25');
  const [preferredTime, setPreferredTime] = useState('02:30 PM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pending = sessionStorage.getItem('kairos_pending_intent');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed.type === 'test-drive') {
            if (parsed.carName) {
              setVehicleName(parsed.carName);
            } else if (parsed.carId) {
              const carMap: Record<string, string> = {
                'byd-tang-l': 'BYD Tang L (Flagship 7-Seat SUV)',
                'geely-galaxy-e5': 'Geely Galaxy E5 (Pure Electric SUV)',
                'byd-song-plus': 'BYD Song Plus EV (Luxury Crossover)',
                'toyota-bz3x': 'Toyota bZ3X (Pure Electric Crossover)',
                'geely-starwish': 'Geely Starwish (Urban Compact EV)',
              };
              if (carMap[parsed.carId]) {
                setVehicleName(carMap[parsed.carId]);
              }
            }
            setModalOpen(true);
            sessionStorage.removeItem('kairos_pending_intent');
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleCancelTestDrive = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this test drive request?')) {
      return;
    }

    try {
      await api.cancelTestDrive(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel test drive.');
    }
  };

  const handleBookTestDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.bookTestDrive({
        vehicleName,
        preferredDate,
        preferredTime,
        notes,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setModalOpen(false);
        onRefresh();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to book test drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            SHOWROOM EXPERIENCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Test Drive Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Experience our next-generation electric vehicle lineup at the Bole Wollo Sefer flagship showroom.
          </p>
        </div>

        <button
          id="btn-td-book-new"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>REQUEST TEST DRIVE</span>
        </button>
      </div>

      {/* Test Drives List */}
      <div className="space-y-4">
        {testDrives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testDrives.map((td) => (
              <div
                key={td.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Showroom Test Drive
                    </span>
                    <h4 className="text-lg font-bold text-white">{td.vehicleName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{td.preferredDate}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{td.preferredTime}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      td.status === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : td.status === 'Cancelled'
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {td.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{td.location}</span>
                  </div>
                  {td.notes && <p className="text-[11px] text-slate-500 italic mt-1">"{td.notes}"</p>}
                </div>

                {td.status !== 'Cancelled' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleCancelTestDrive(td.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Test Drives Booked</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Want to experience the Geely Galaxy E5, BYD Seal, or Toyota bZ3X? Book a test drive anytime.
            </p>
          </div>
        )}
      </div>

      {/* Book Test Drive Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Request a Test Drive</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {success ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Test Drive Scheduled!</h4>
                <p className="text-xs text-slate-300">We look forward to hosting you at our showroom.</p>
              </div>
            ) : (
              <form onSubmit={handleBookTestDrive} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Select Vehicle</label>
                  <select
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option>Geely Galaxy E5 (Pure Electric SUV)</option>
                    <option>BYD Tang L (7-Seater AWD Flagship)</option>
                    <option>BYD Han EV (Luxury Electric Sedan)</option>
                    <option>Toyota bZ3X (Smart Electric Crossover)</option>
                    <option>BYD Song Plus EV (Smart SUV)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Preferred Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                    <option>04:45 PM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Notes / Requests (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specific features or comparison interest..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
