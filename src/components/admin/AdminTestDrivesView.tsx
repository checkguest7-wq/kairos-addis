import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Search,
  CheckCircle2,
  Clock,
  X,
  MapPin,
  User,
  Car,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminTestDrivesView: React.FC = () => {
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Deletion Modal
  const [driveToDelete, setDriveToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestDrives = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetTestDrives();
      setTestDrives(res.testDrives || []);
    } catch (err: any) {
      console.error('[FETCH TEST DRIVES ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionError(null);
    try {
      await api.adminUpdateTestDrive(id, { status: newStatus });
      setActionSuccess(`Test drive booking marked as "${newStatus}". Customer notified.`);
      fetchTestDrives();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update test drive status.');
    }
  };

  const confirmDeleteDrive = async () => {
    if (!driveToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await api.adminDeleteTestDrive(driveToDelete.id);
      setActionSuccess('Test drive booking permanently deleted.');
      setDriveToDelete(null);
      fetchTestDrives();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete test drive booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDrives = testDrives.filter((td) => {
    const matchesFilter = statusFilter === 'ALL' || td.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (td.vehicleName && td.vehicleName.toLowerCase().includes(term)) ||
      (td.customer && td.customer.fullName && td.customer.fullName.toLowerCase().includes(term)) ||
      (td.location && td.location.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="admin-testdrives-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            Bole Wollo Sefer Concierge
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Test Drive Concierge Bookings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review incoming road trial requests, confirm showroom appointments, and assign EV specialists.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search car, client, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {['ALL', 'Pending Review', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading test drive queue...
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <CalendarCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No test drive requests found matching filter.</p>
          <p className="text-xs text-slate-500 mt-1">Check other status tabs or search with different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => {
            const isCancelled = drive.status === 'Cancelled';
            const isCompleted = drive.status === 'Completed';
            const isConfirmed = drive.status === 'Confirmed';
            const isPending = drive.status === 'Pending' || drive.status === 'Pending Review';

            return (
              <div
                key={drive.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">{drive.vehicleName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Client:{' '}
                          <span className="text-slate-200 font-semibold">
                            {drive.customer?.fullName || 'Registered Guest'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          isConfirmed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCompleted
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : isCancelled
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {drive.status}
                      </span>

                      {/* Delete Icon Button */}
                      <button
                        id={`btn-delete-testdrive-${drive.id}`}
                        onClick={() => setDriveToDelete(drive)}
                        title="Delete Test Drive Booking"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Preferred Slot</span>
                      <p className="text-white font-mono font-bold mt-0.5">{drive.preferredDate}</p>
                      <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">{drive.preferredTime || '11:00 AM'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Location / Hub</span>
                      <p className="text-white font-semibold mt-0.5 truncate">
                        {drive.location || 'Bole Wollo Sefer Showroom'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Kairos Concierge Hub</p>
                    </div>
                  </div>

                  {drive.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Client Note
                      </span>
                      <p className="italic text-slate-300">"{drive.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Actions: Strict workflow enforcement */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">ID: {drive.id}</span>

                  <div className="flex items-center gap-2">
                    {/* CANCELLED: Show ONLY Cancelled status label (no buttons) */}
                    {isCancelled && (
                      <span className="text-xs text-rose-400 font-semibold px-2 py-1 bg-rose-500/10 rounded border border-rose-500/20">
                        Booking Cancelled
                      </span>
                    )}

                    {/* COMPLETED: Show Completed status label (no buttons) */}
                    {isCompleted && (
                      <span className="text-xs text-blue-400 font-semibold px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                        Completed & Archived
                      </span>
                    )}

                    {/* CONFIRMED: Can Mark Done (Complete) or Cancel */}
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(drive.id, 'Completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          Mark Done
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(drive.id, 'Cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {/* PENDING: Can Confirm Slot or Cancel */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(drive.id, 'Confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
                        >
                          Confirm Slot
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(drive.id, 'Cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {driveToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white">Delete Test Drive Booking?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete the test drive booking for{' '}
                <span className="font-semibold text-white">{driveToDelete.vehicleName}</span> (
                {driveToDelete.customer?.fullName || 'Client'}) on{' '}
                <span className="font-mono text-cyan-400">{driveToDelete.preferredDate}</span>?
              </p>
              <p className="text-[11px] text-slate-500">
                This will delete only this test drive request record. The customer account and vehicle catalog remain untouched.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDriveToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteDrive}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
