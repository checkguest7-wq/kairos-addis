import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ShoppingBag,
  Wrench,
  ShieldCheck,
  CalendarCheck2,
  MessageSquare,
  ChevronRight,
  X,
  Send,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AdminClientSummary, AdminClientDossier } from '../../types';
import { api } from '../../lib/api';

export const AdminClientsView: React.FC = () => {
  const [clients, setClients] = useState<AdminClientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<AdminClientDossier | null>(null);
  const [isDossierLoading, setIsDossierLoading] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);

  // Quick message composer inside dossier
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetClients();
      setClients(res.clients || []);
    } catch (err: any) {
      console.error('[FETCH CLIENTS ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenDossier = async (clientId: string) => {
    setIsDossierLoading(true);
    setDossierError(null);
    try {
      const res = await api.adminGetClientDossier(clientId);
      setSelectedDossier(res.dossier);
    } catch (err: any) {
      setDossierError(err.message || 'Failed to load client dossier.');
    } finally {
      setIsDossierLoading(false);
    }
  };

  const handleDocumentAction = async (docType: string, action: 'verify' | 'reject', reason?: string) => {
    if (!selectedDossier) return;
    try {
      await api.adminVerificationAction({
        userId: selectedDossier.user.id,
        docType,
        action,
        rejectionReason: reason,
      });
      setActionSuccess(`Document ${action === 'verify' ? 'verified' : 'rejected'} successfully.`);
      // Reload dossier
      handleOpenDossier(selectedDossier.user.id);
      fetchClients();
    } catch (err: any) {
      alert(err.message || 'Failed to update document status.');
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      await api.adminReplyMessage({
        userId: selectedDossier.user.id,
        content: replyText.trim(),
      });
      setReplyText('');
      setActionSuccess('Message sent to customer portal.');
      handleOpenDossier(selectedDossier.user.id);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div id="admin-clients-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide">
            Client Directory & Dossiers
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Full customer registry with identity compliance (Fayda & Driving Licence), order histories, and warranties.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Clients Table */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading client records...</div>
      ) : filteredClients.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No client accounts found matching search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Compliance (Docs)</th>
                <th className="p-4">Vehicle / Orders</th>
                <th className="p-4">YouGuard Warranty</th>
                <th className="p-4">Test Drives</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{client.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{client.email}</p>
                        {client.phone && <p className="text-[10px] text-slate-400 font-mono">{client.phone}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {client.documentsVerifiedCount === 4 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Fully Verified (4/4)
                          </span>
                        ) : client.documentsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {client.documentsVerifiedCount}/4 Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            No Documents
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Fayda & Driving Licence</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{client.vehicleName || '—'}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {client.ordersCount} Order(s)
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    {client.warrantyActive ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Unregistered</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="text-slate-300 font-mono">{client.testDrivesCount}</span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      id={`admin-open-dossier-${client.id}`}
                      onClick={() => handleOpenDossier(client.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complete Client Dossier Modal / Drawer */}
      {(selectedDossier || isDossierLoading) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-0 sm:p-4">
          <div className="bg-slate-900 border-l sm:border border-slate-800 w-full max-w-3xl h-full sm:h-[95vh] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slideLeft">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {selectedDossier?.user.fullName.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-serif">
                    {selectedDossier?.user.fullName || 'Loading Dossier...'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">{selectedDossier?.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Content Body */}
            {isDossierLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Fetching client records...
              </div>
            ) : selectedDossier ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Action feedback */}
                {actionSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <span>{actionSuccess}</span>
                    <button onClick={() => setActionSuccess(null)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Profile Overview Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Contact & Account</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone Number</span>
                      <span className="font-mono text-white">{selectedDossier.user.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email Status</span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedDossier.user.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Member Since</span>
                      <span className="text-slate-300">{selectedDossier.user.createdAt?.split('T')[0] || '2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Documents Compliance Review Section */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Government ID & Licence Verification
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        selectedDossier.hasAllDocs
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {selectedDossier.hasAllDocs ? 'All 4 Uploaded' : 'Pending Uploads'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'faydaIdFront', label: 'Fayda ID (Front)', doc: selectedDossier.documents.faydaIdFront },
                      { key: 'faydaIdBack', label: 'Fayda ID (Back)', doc: selectedDossier.documents.faydaIdBack },
                      {
                        key: 'drivingLicenceFront',
                        label: 'Driving Licence (Front)',
                        doc: selectedDossier.documents.drivingLicenceFront,
                      },
                      {
                        key: 'drivingLicenceBack',
                        label: 'Driving Licence (Back)',
                        doc: selectedDossier.documents.drivingLicenceBack,
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{item.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              item.doc?.status === 'Verified'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.doc?.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.doc
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.doc?.status || 'Not Uploaded'}
                          </span>
                        </div>

                        {item.doc ? (
                          <div className="space-y-2">
                            <p className="text-[11px] text-slate-400 truncate">{item.doc.fileName}</p>
                            {item.doc.rejectionReason && (
                              <p className="text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                                Reason: {item.doc.rejectionReason}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleDocumentAction(item.key, 'verify')}
                                className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason for customer:', 'Image is unclear. Please re-upload a clean copy.');
                                  if (reason) handleDocumentAction(item.key, 'reject', reason);
                                }}
                                className="flex-1 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Awaiting customer upload</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders History */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Orders Placed ({selectedDossier.orders.length})
                  </h3>
                  {selectedDossier.orders.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDossier.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{ord.vehicleName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              #{ord.orderNumber} · {ord.orderDate} · {ord.selectedColor}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            {ord.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No orders placed yet.</p>
                  )}
                </div>

                {/* YouGuard Warranty Details */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YouGuard Warranty
                  </h3>
                  {selectedDossier.warranty ? (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300">
                          {selectedDossier.warranty.certificateNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {selectedDossier.warranty.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Vehicle Coverage</span>
                          {selectedDossier.warranty.vehicleWarrantyYears} Yrs / {selectedDossier.warranty.vehicleWarrantyKm?.toLocaleString()} KM
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Blade Battery Coverage</span>
                          {selectedDossier.warranty.batteryWarrantyYears} Yrs / {selectedDossier.warranty.batteryWarrantyKm?.toLocaleString()} KM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No active YouGuard warranty certificate registered.</p>
                  )}
                </div>

                {/* Quick Message to Customer */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send Concierge Message
                  </h3>
                  <form onSubmit={handleSendDirectMessage} className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder={`Type message to ${selectedDossier.user.fullName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSendingReply || !replyText.trim()}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSendingReply ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
