import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Award,
  Calendar,
  Zap,
  Car,
  X,
  FileText,
  Printer,
  Shield,
} from 'lucide-react';
import { WarrantyDetails } from '../../types';
import { api } from '../../lib/api';

export const AdminWarrantiesView: React.FC = () => {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [vehicleWarrantyYears, setVehicleWarrantyYears] = useState(5);
  const [vehicleWarrantyKm, setVehicleWarrantyKm] = useState(100000);
  const [batteryWarrantyYears, setBatteryWarrantyYears] = useState(8);
  const [batteryWarrantyKm, setBatteryWarrantyKm] = useState(160000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Certificate Modal Preview
  const [activeCertificate, setActiveCertificate] = useState<any | null>(null);

  const fetchWarrantiesAndClients = async () => {
    setIsLoading(true);
    try {
      const [warRes, cliRes] = await Promise.all([api.adminGetWarranties(), api.adminGetClients()]);
      setWarranties(warRes.warranties || []);
      setClients(cliRes.clients || []);
    } catch (err: any) {
      console.error('[FETCH WARRANTIES ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarrantiesAndClients();
  }, []);

  const handleRegisterWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      setSubmitError('Please select a customer.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.adminCreateWarranty({
        userId: selectedClient,
        vehicleWarrantyYears,
        vehicleWarrantyKm,
        batteryWarrantyYears,
        batteryWarrantyKm,
      });

      setSubmitSuccess(`Warranty certificate registered successfully: #${res.warranty.certificateNumber}`);
      setIsRegisterOpen(false);
      fetchWarrantiesAndClients();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to issue warranty certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWarranties = warranties.filter((w) => {
    const custName = w.customer?.fullName || '';
    const cert = w.certificateNumber || '';
    const veh = w.vehicleModel || '';
    return (
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div id="admin-warranties-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            YouGuard Warranty Management
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Official YouGuard partnership: Issue 5-year bumper-to-bumper and 8-year Blade Battery warranty certificates.
          </p>
        </div>

        <button
          id="admin-issue-warranty-btn"
          onClick={() => {
            setIsRegisterOpen(true);
            setSubmitError(null);
            setSubmitSuccess(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Issue New YouGuard Certificate
        </button>
      </div>

      {/* Alerts */}
      {submitSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {submitSuccess}
          </span>
          <button onClick={() => setSubmitSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Warranties Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading warranty registry...</div>
      ) : filteredWarranties.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No registered YouGuard warranties found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWarranties.map((war) => (
            <div
              key={war.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block">
                    YouGuard Certificate
                  </span>
                  <h3 className="text-base font-bold text-white font-mono">{war.certificateNumber}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {war.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Customer</span>
                  <p className="text-white font-bold">{war.customer?.fullName || 'Client'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{war.customer?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Vehicle Model</span>
                  <p className="text-amber-300 font-semibold">{war.vehicleModel}</p>
                  <p className="text-[11px] text-slate-400">Since {war.startDate}</p>
                </div>
              </div>

              {/* Coverage Pillars */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Car className="w-3 h-3 text-amber-400" /> Bumper-to-Bumper
                  </span>
                  <p className="text-white font-bold font-mono">
                    {war.vehicleWarrantyYears} Years / {war.vehicleWarrantyKm?.toLocaleString()} KM
                  </p>
                  <span className="text-[10px] text-slate-400">Exp: {war.vehicleWarrantyEndDate}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3 text-emerald-400" /> Traction Battery
                  </span>
                  <p className="text-white font-bold font-mono">
                    {war.batteryWarrantyYears} Years / {war.batteryWarrantyKm?.toLocaleString()} KM
                  </p>
                  <span className="text-[10px] text-slate-400">Exp: {war.batteryWarrantyEndDate}</span>
                </div>
              </div>

              {/* Certificate Viewer Trigger */}
              <div className="flex justify-end pt-1">
                <button
                  id={`admin-view-cert-${war.id}`}
                  onClick={() => setActiveCertificate(war)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" /> View Digital Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Warranty Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white font-serif">Issue YouGuard Warranty Certificate</h2>
                <p className="text-xs text-slate-400">
                  Enforces vehicle ownership and accepted order validation before issuance.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterWarranty} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Select Customer Account *</label>
                <select
                  required
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="">-- Choose registered customer --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email}) {c.ordersCount > 0 ? `· ${c.ordersCount} Order(s)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Vehicle Warranty (Years)</label>
                  <input
                    type="number"
                    value={vehicleWarrantyYears}
                    onChange={(e) => setVehicleWarrantyYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Vehicle KM Limit</label>
                  <input
                    type="number"
                    value={vehicleWarrantyKm}
                    onChange={(e) => setVehicleWarrantyKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Blade Battery (Years)</label>
                  <input
                    type="number"
                    value={batteryWarrantyYears}
                    onChange={(e) => setBatteryWarrantyYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Battery KM Limit</label>
                  <input
                    type="number"
                    value={batteryWarrantyKm}
                    onChange={(e) => setBatteryWarrantyKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Certificate Preview Modal */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl w-full max-w-xl p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold font-serif">
                  K
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wider">KAIROS ADDIS AUTOMOTIVE PLC</h3>
                  <p className="text-[10px] text-amber-400 uppercase tracking-widest">
                    YouGuard Official Warranty Partnership
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCertificate(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-1 py-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Certificate of Coverage</span>
              <h2 className="text-xl font-bold font-mono text-amber-300">{activeCertificate.certificateNumber}</h2>
              <p className="text-xs text-slate-300">
                Issued to: <strong className="text-white">{activeCertificate.customer?.fullName}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Covered Vehicle</span>
                <span className="text-white font-bold">{activeCertificate.vehicleModel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Registration Date</span>
                <span className="text-white font-mono">{activeCertificate.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Bumper-to-Bumper</span>
                <span className="text-amber-300 font-bold">
                  {activeCertificate.vehicleWarrantyYears} Yrs / {activeCertificate.vehicleWarrantyKm?.toLocaleString()} KM
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Blade Traction Battery</span>
                <span className="text-emerald-400 font-bold">
                  {activeCertificate.batteryWarrantyYears} Yrs / {activeCertificate.batteryWarrantyKm?.toLocaleString()} KM
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Authorized Service Center: Bole Medhanialem, Addis Ababa, Ethiopia. Coverage is valid nationwide in
              accordance with YouGuard standard terms and conditions.
            </p>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
