import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Eye,
  X,
  UserCheck,
  ShieldCheck,
  Clock,
  Download,
  Maximize2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CustomerDocumentItem, CustomerDocuments } from '../../types';

interface VerificationItem {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  docType: string;
  document: CustomerDocumentItem;
}

interface ClientDocSummary {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  documents: CustomerDocuments;
  uploadedCount: number;
  verifiedCount: number;
}

export const AdminVerificationsView: React.FC = () => {
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [clientSummaries, setClientSummaries] = useState<ClientDocSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Preview / Inspection Modal State
  const [activeItem, setActiveItem] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const [verifRes, clientsRes] = await Promise.all([
        api.adminGetVerifications(),
        api.adminGetClients(),
      ]);

      const verifList: VerificationItem[] = verifRes.verifications || [];
      setVerifications(verifList);

      // Build customer-grouped summaries with all 4 document slots
      const clients = clientsRes.clients || [];
      const summaries: ClientDocSummary[] = clients.map((c: any) => {
        // Find docs in verification list or dossier
        const userDocs: CustomerDocuments = {
          faydaIdFront: null,
          faydaIdBack: null,
          drivingLicenceFront: null,
          drivingLicenceBack: null,
        };

        verifList
          .filter((v) => v.userId === c.id)
          .forEach((v) => {
            if (v.docType in userDocs) {
              userDocs[v.docType as keyof CustomerDocuments] = v.document;
            }
          });

        const uploadedCount = Object.values(userDocs).filter(Boolean).length;
        const verifiedCount = Object.values(userDocs).filter((d) => d?.status === 'Verified').length;

        return {
          userId: c.id,
          customerName: c.fullName,
          customerEmail: c.email,
          customerPhone: c.phone,
          documents: userDocs,
          uploadedCount,
          verifiedCount,
        };
      });

      setClientSummaries(summaries);
    } catch (err: any) {
      console.error('[FETCH VERIFICATIONS ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (action: 'verify' | 'reject') => {
    if (!activeItem) return;
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please specify a rejection reason so the customer can upload a corrected document.');
      return;
    }

    setIsProcessing(true);
    try {
      await api.adminVerificationAction({
        userId: activeItem.userId,
        docType: activeItem.docType,
        action,
        rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
      });

      setActionSuccess(
        `Document for ${activeItem.customerName} marked as ${action === 'verify' ? 'Verified' : 'Rejected'}.`
      );
      setActiveItem(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (err: any) {
      alert(err.message || 'Failed to update document status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocLabel = (type: string) => {
    switch (type) {
      case 'faydaIdFront':
        return 'Fayda National ID — Front';
      case 'faydaIdBack':
        return 'Fayda National ID — Back';
      case 'drivingLicenceFront':
        return 'Driving Licence — Front';
      case 'drivingLicenceBack':
        return 'Driving Licence — Back';
      default:
        return 'Government Document';
    }
  };

  const filteredSummaries = clientSummaries.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone && c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Fully Verified') return c.verifiedCount === 4;
    if (filterStatus === 'Pending Review') {
      return Object.values(c.documents).some((d) => d && ((d as CustomerDocumentItem).status === 'Uploaded' || (d as CustomerDocumentItem).status === 'Pending Review'));
    }
    if (filterStatus === 'Incomplete') return c.uploadedCount < 4;
    return true;
  });

  return (
    <div id="admin-verifications-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide">
            Profile Verification & Document Vault
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Authenticate Ethiopian Fayda National IDs and Driving Licences required for vehicle title transfer and customs clearance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Success banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {['ALL', 'Pending Review', 'Fully Verified', 'Incomplete'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'grouped' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Vault
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Queue ({verifications.length})
          </button>
        </div>
      </div>

      {/* Customer Document Vault (Grouped by Customer with all 4 document slots) */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading document verification vault...</div>
      ) : viewMode === 'grouped' ? (
        filteredSummaries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No customer accounts found matching current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSummaries.map((client) => {
              const docSlots: Array<{ key: keyof CustomerDocuments; label: string }> = [
                { key: 'faydaIdFront', label: 'Fayda National ID — Front' },
                { key: 'faydaIdBack', label: 'Fayda National ID — Back' },
                { key: 'drivingLicenceFront', label: 'Driving Licence — Front' },
                { key: 'drivingLicenceBack', label: 'Driving Licence — Back' },
              ];

              return (
                <div
                  key={client.userId}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
                >
                  {/* Customer Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                        {client.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{client.customerName}</h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {client.customerEmail} {client.customerPhone ? `· ${client.customerPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 ${
                          client.verifiedCount === 4
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : client.uploadedCount > 0
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {client.verifiedCount === 4 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Verified (4/4)
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> {client.verifiedCount}/4 Verified ({client.uploadedCount}/4 Uploaded)
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 4 Document Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {docSlots.map(({ key, label }) => {
                      const doc = client.documents[key];
                      const isUploaded = !!doc;
                      const status = doc?.status || 'Not uploaded';

                      return (
                        <div
                          key={key}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                            isUploaded
                              ? status === 'Verified'
                                ? 'bg-slate-950/70 border-emerald-500/30'
                                : status === 'Rejected'
                                ? 'bg-slate-950/70 border-rose-500/30'
                                : 'bg-slate-950/70 border-amber-500/30'
                              : 'bg-slate-950/40 border-slate-800/80 border-dashed'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-semibold text-white leading-tight">{label}</span>
                            </div>

                            {isUploaded ? (
                              <div className="space-y-1.5">
                                {/* Thumbnail preview if image */}
                                {(() => {
                                  const previewSrc = doc.fileUrl || doc.dataUrl || `/api/admin/documents/${client.userId}/${key}/view`;
                                  const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf');
                                  if (isPdf) {
                                    return (
                                      <a
                                        href={`/api/admin/documents/${client.userId}/${key}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-20 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 text-[11px] gap-1 transition-colors"
                                      >
                                        <FileText className="w-6 h-6 text-cyan-400" />
                                        <span>Open PDF Document</span>
                                      </a>
                                    );
                                  }
                                  return (
                                    <div
                                      onClick={() => setZoomImage(previewSrc)}
                                      className="h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative group cursor-pointer"
                                    >
                                      <img
                                        src={previewSrc}
                                        alt={label}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                                        <Maximize2 className="w-3.5 h-3.5" /> Enlarge
                                      </div>
                                    </div>
                                  );
                                })()}

                                <p className="text-[10px] text-slate-400 font-mono truncate">{doc.fileName}</p>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                      status === 'Verified'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : status === 'Rejected'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {status}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{doc.uploadedAt}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center space-y-1">
                                <span className="inline-block px-2 py-1 rounded bg-slate-800/80 text-slate-400 text-[11px] font-semibold">
                                  Not uploaded
                                </span>
                                <p className="text-[10px] text-slate-500">Awaiting customer submission</p>
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          {isUploaded && (
                            <div className="pt-3 mt-2 border-t border-slate-800/80">
                              <button
                                id={`admin-inspect-${client.userId}-${key}`}
                                onClick={() => {
                                  setActiveItem({
                                    userId: client.userId,
                                    customerName: client.customerName,
                                    customerEmail: client.customerEmail,
                                    customerPhone: client.customerPhone,
                                    docType: key,
                                    document: doc,
                                  });
                                  setRejectionReason(doc.rejectionReason || '');
                                }}
                                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Inspect & Decide
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Flat Queue List Table */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Uploaded File</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {verifications.map((item, idx) => (
                <tr key={`${item.userId}-${item.docType}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-white text-xs">{item.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.customerEmail}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{getDocLabel(item.docType)}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                      {item.document.fileName}
                    </p>
                    <span className="text-[10px] text-slate-400">{item.document.uploadedAt}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        item.document.status === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.document.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.document.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setActiveItem(item);
                        setRejectionReason(item.document.rejectionReason || '');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Document Inspection & Decision Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white font-serif">{getDocLabel(activeItem.docType)}</h2>
                <p className="text-xs text-slate-400">
                  Uploaded by {activeItem.customerName} ({activeItem.customerEmail})
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Box with Image or File details */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              {(() => {
                const previewSrc = activeItem.document.fileUrl || activeItem.document.dataUrl || `/api/admin/documents/${activeItem.userId}/${activeItem.docType}/view`;
                const isPdf = activeItem.document.fileName?.toLowerCase().endsWith('.pdf');
                if (isPdf) {
                  return (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                        <FileCheck2 className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-white">{activeItem.document.fileName}</p>
                      <a
                        href={`/api/admin/documents/${activeItem.userId}/${activeItem.docType}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                      >
                        Open PDF in New Tab
                      </a>
                    </div>
                  );
                }
                return (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center max-h-72">
                    <img
                      src={previewSrc}
                      alt={getDocLabel(activeItem.docType)}
                      referrerPolicy="no-referrer"
                      className="max-h-72 w-auto object-contain cursor-pointer"
                      onClick={() => setZoomImage(previewSrc)}
                    />
                    <button
                      onClick={() => setZoomImage(previewSrc)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-sm transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
                    </button>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-mono">
                  {activeItem.document.fileSize || 'Image Document'} · Uploaded {activeItem.document.uploadedAt}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Status: {activeItem.document.status}
                </div>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-semibold block">
                Rejection Reason (Guides the client to re-upload if rejected):
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {[
                  'Image is blurry or illegible',
                  'Expired ID / Licence',
                  'Corner cut or incomplete view',
                  'Name does not match vehicle registration title',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Enter specific guidance for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('reject')}
                  className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Reject with Reason
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('verify')}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isProcessing ? 'Verifying...' : 'Approve & Verify'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={zoomImage} alt="Enlarged Document" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
