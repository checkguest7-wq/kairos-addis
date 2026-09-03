import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wrench, X, CheckCircle2, AlertCircle, Hash, Info } from 'lucide-react';
import { api } from '../../lib/api';
import { Appointment, PortalVehicle } from '../../types';

interface PortalBookServiceModalProps {
  vehicle: PortalVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onRefreshData?: () => void;
}

export const PortalBookServiceModal: React.FC<PortalBookServiceModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onAppointmentBooked,
  onRefreshData,
}) => {
  const [vin, setVin] = useState(vehicle?.vin || 'LC0CE40E8N0184920');
  const [date, setDate] = useState('2026-09-18');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setVin(vehicle.vin || '');
    }
  }, [vehicle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Please select a preferred date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bookServiceRequest({
        vin: vin.trim(),
        vehicle: vehicle ? `${vehicle.model} (${vehicle.registrationNumber || 'Registered'})` : undefined,
        serviceType: 'Certified EV Periodic Maintenance & Inspection',
        date,
        description,
      });

      setSuccess(true);
      if (onAppointmentBooked) onAppointmentBooked(res.appointment);
      if (onRefreshData) onRefreshData();

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to book service appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden my-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Book a Service Appointment</h3>
              <p className="text-xs text-slate-400">Kairos Addis Bole Medhanialem Certified EV Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-extrabold text-white">Service Request Confirmed!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your service request has been logged and linked to your customer records. Our Bole service desk will prepare for your visit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Vehicle VIN with Helpful Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                VIN
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Enter 17-digit Vehicle Identification Number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-cyan-400/90 flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>You can find the VIN on your registration documents or vehicle.</span>
              </p>
            </div>

            {/* Preferred Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention any specific concerns, noise, or software questions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                id="btn-submit-book-service"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Submit Service Booking'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

