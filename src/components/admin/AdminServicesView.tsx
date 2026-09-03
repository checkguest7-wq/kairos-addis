import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  DollarSign,
  X,
  Trash2,
  MapPin,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminServicesView: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Schedule New Service Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [vehicleName, setVehicleName] = useState('BYD Tang L (AA 3-84920)');
  const [serviceType, setServiceType] = useState('Scheduled High-Voltage System Diagnostics');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('10:00 AM');
  const [technician, setTechnician] = useState('Yonas Getachew (Master EV Tech)');
  const [costETB, setCostETB] = useState('0');
  const [serviceNotes, setServiceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Deletion Modal / State
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const [srvRes, cliRes] = await Promise.all([api.adminGetServices(), api.adminGetClients()]);
      setAppointments(srvRes.appointments || []);
      setClients(cliRes.clients || []);
    } catch (err: any) {
      console.error('[FETCH SERVICES ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !serviceDate) {
      setActionError('Please select a customer and service date.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.adminCreateService({
        userId: selectedUser,
        vehicle: vehicleName,
        serviceType,
        date: serviceDate,
        time: serviceTime,
        technician,
        costETB: Number(costETB),
        notes: serviceNotes,
      });

      setActionSuccess('Service appointment scheduled and customer notified.');
      setIsCreateOpen(false);
      fetchServices();
    } catch (err: any) {
      setActionError(err.message || 'Failed to schedule service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.adminUpdateService(id, { status: newStatus });
      setActionSuccess(`Service appointment marked as "${newStatus}".`);
      fetchServices();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update service status.');
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await api.adminDeleteService(serviceToDelete.id);
      setActionSuccess('Service appointment permanently deleted.');
      setServiceToDelete(null);
      fetchServices();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete service record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = statusFilter === 'ALL' || apt.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (apt.vehicle && apt.vehicle.toLowerCase().includes(term)) ||
      (apt.serviceType && apt.serviceType.toLowerCase().includes(term)) ||
      (apt.customer && apt.customer.fullName && apt.customer.fullName.toLowerCase().includes(term)) ||
      (apt.customer && apt.customer.email && apt.customer.email.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="admin-services-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" />
            Bole Medhanialem EV Facility
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            EV Service Center Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage high-voltage battery diagnostic scans, maintenance work orders, and technician assignments.
          </p>
        </div>

        <button
          id="admin-schedule-service-btn"
          onClick={() => {
            setIsCreateOpen(true);
            setServiceDate(new Date().toISOString().split('T')[0]);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Service Appointment
        </button>
      </div>

      {/* Success Notification */}
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

      {/* Error Notification */}
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Pending', 'Confirmed', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, vehicle, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading service records...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No service appointments found.</p>
          <p className="text-xs text-slate-500 mt-1">Try changing the status filter or schedule a new service appointment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const isCompleted = apt.status === 'Completed';
            const isCancelled = apt.status === 'Cancelled';
            const isInProgress = apt.status === 'In Progress';

            return (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block">
                        {apt.serviceType}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">{apt.vehicle}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCancelled
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isInProgress
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {apt.status}
                      </span>

                      {/* Delete Icon Button */}
                      <button
                        id={`btn-delete-service-${apt.id}`}
                        onClick={() => setServiceToDelete(apt)}
                        title="Delete Service Appointment"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Customer</span>
                      <p className="text-white font-bold mt-0.5">{apt.customer?.fullName || 'Registered Client'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        {apt.customer?.phone || apt.customer?.email || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Appointment Date</span>
                      <p className="text-white font-mono font-bold mt-0.5">{apt.date}</p>
                      <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">{apt.time || '10:00 AM'}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-slate-200">Facility:</span> {apt.facility || 'Kairos Addis Bole Medhanialem Center'}
                    </div>
                    {apt.message && (
                      <p className="text-[11px] italic text-slate-400 pt-1 border-t border-slate-800/60">
                        "{apt.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">ID: {apt.id}</span>

                  <div className="flex items-center gap-2">
                    {!isCompleted && !isCancelled && (
                      <>
                        {apt.status !== 'In Progress' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'In Progress')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                          >
                            Start Service
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                        >
                          Cancel
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
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white">Delete Service Appointment?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete the service appointment for{' '}
                <span className="font-semibold text-white">{serviceToDelete.vehicle}</span> (
                {serviceToDelete.customer?.fullName || 'Client'}) scheduled for{' '}
                <span className="font-mono text-cyan-400">{serviceToDelete.date}</span>?
              </p>
              <p className="text-[11px] text-slate-500">
                This will delete only this service request. Client accounts, orders, and warranty certificates are preserved.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteService}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Service Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Schedule Service Appointment</h2>
                <p className="text-xs text-slate-400">Kairos Addis EV Service Center (Bole Medhanialem)</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Customer Account *</label>
                <select
                  required
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="">-- Choose registered customer --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Vehicle Description</label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Scheduled High-Voltage System Diagnostics">Scheduled High-Voltage System Diagnostics</option>
                  <option value="YouGuard Routine 20,000 KM Inspection">YouGuard Routine 20,000 KM Inspection</option>
                  <option value="Battery Health & Thermal Loop Service">Battery Health & Thermal Loop Service</option>
                  <option value="Brake & Regeneration Calibration">Brake & Regeneration Calibration</option>
                  <option value="OTA Firmware & Cockpit Software Update">OTA Firmware & Cockpit Software Update</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Lead EV Technician</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cost (ETB - 0 if YouGuard)</label>
                  <input
                    type="number"
                    value={costETB}
                    onChange={(e) => setCostETB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Technician Notes</label>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Inspect blade battery module balance and perform high-voltage calibration"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
