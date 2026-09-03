import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, PlusCircle, CheckCircle2, AlertCircle, Wrench, RefreshCw, XCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { api } from '../../lib/api';

interface PortalAppointmentsViewProps {
  appointments: Appointment[];
  onOpenBookModal: () => void;
  onRefresh: () => void;
}

export const PortalAppointmentsView: React.FC<PortalAppointmentsViewProps> = ({
  appointments,
  onOpenBookModal,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'upcoming') return apt.status === 'Confirmed' || apt.status === 'Pending';
    if (filter === 'completed') return apt.status === 'Completed';
    if (filter === 'cancelled') return apt.status === 'Cancelled';
    return true;
  });

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this service appointment?')) {
      return;
    }

    try {
      await api.cancelAppointment(id);
      setActionSuccess('Appointment cancelled.');
      setTimeout(() => setActionSuccess(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setNewDate(apt.date || '2026-09-20');
    setNewTime(apt.time || '09:00 AM');
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;

    setIsUpdating(true);
    try {
      await api.updateAppointment(rescheduleApt.id, {
        date: newDate,
        time: newTime,
        status: 'Confirmed',
      });
      setActionSuccess('Appointment rescheduled successfully.');
      setRescheduleApt(null);
      setTimeout(() => setActionSuccess(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule appointment.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            MAINTENANCE SCHEDULE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Service Appointments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage upcoming diagnostics, scheduled maintenance, and YouGuard inspection bookings.
          </p>
        </div>

        <button
          id="btn-book-new-appointment"
          onClick={onOpenBookModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>SCHEDULE SERVICE</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            {tab === 'all' ? `All Appointments (${appointments.length})` : tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      EV Service Booking
                    </span>
                    <h3 className="text-lg font-bold text-white">{apt.serviceType}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{apt.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{apt.time}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      apt.status === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : apt.status === 'Completed'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : apt.status === 'Cancelled'
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{apt.location}</span>
                  </div>
                  {apt.vehicle && (
                    <div className="text-[11px] text-slate-500">
                      Vehicle: <span className="text-slate-300">{apt.vehicle}</span>
                    </div>
                  )}
                  {apt.message && (
                    <p className="text-[11px] text-slate-500 italic mt-1">"{apt.message}"</p>
                  )}
                </div>

                {/* Actions */}
                {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/40">
                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Appointments Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You currently have no service appointments scheduled. Click Schedule Service above to book a time.
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Reschedule Service Appointment</h3>
              <button
                onClick={() => setRescheduleApt(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  Service Type
                </span>
                <p className="text-white font-semibold">{rescheduleApt.serviceType}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option>09:00 AM</option>
                  <option>10:30 AM</option>
                  <option>02:00 PM</option>
                  <option>03:30 PM</option>
                  <option>04:30 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
