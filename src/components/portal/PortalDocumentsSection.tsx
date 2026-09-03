import React, { useState } from 'react';
import {
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { CustomerDocuments, CustomerDocumentItem } from '../../types';
import { api } from '../../lib/api';

interface PortalDocumentsSectionProps {
  documents: CustomerDocuments;
  onRefresh: () => void;
  onNavigateToVehicles?: () => void;
  isStandalonePage?: boolean;
}

type DocType = 'faydaIdFront' | 'faydaIdBack' | 'drivingLicenceFront' | 'drivingLicenceBack';

interface DocConfig {
  type: DocType;
  title: string;
  category: 'Fayda ID (National Digital ID)' | 'Driving Licence';
  side: 'Front' | 'Back';
  description: string;
}

const DOC_CONFIGS: DocConfig[] = [
  {
    type: 'faydaIdFront',
    title: 'Fayda National ID (Front)',
    category: 'Fayda ID (National Digital ID)',
    side: 'Front',
    description: 'Front side containing FIN, full name, and biometric photograph.',
  },
  {
    type: 'faydaIdBack',
    title: 'Fayda National ID (Back)',
    category: 'Fayda ID (National Digital ID)',
    side: 'Back',
    description: 'Back side showing digital barcode and residence registration.',
  },
  {
    type: 'drivingLicenceFront',
    title: 'Driving Licence (Front)',
    category: 'Driving Licence',
    side: 'Front',
    description: 'Official Ethiopian driving permit front side with vehicle categories.',
  },
  {
    type: 'drivingLicenceBack',
    title: 'Driving Licence (Back)',
    category: 'Driving Licence',
    side: 'Back',
    description: 'Back side with traffic endorsement notes and expiry stamps.',
  },
];

export const PortalDocumentsSection: React.FC<PortalDocumentsSectionProps> = ({
  documents,
  onRefresh,
  onNavigateToVehicles,
  isStandalonePage = false,
}) => {
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<CustomerDocumentItem | null>(null);

  const docCount = [
    documents?.faydaIdFront,
    documents?.faydaIdBack,
    documents?.drivingLicenceFront,
    documents?.drivingLicenceBack,
  ].filter(Boolean).length;

  const hasAllDocs = docCount === 4;

  const handleFileUpload = async (type: DocType, file: File) => {
    setError(null);
    setSuccess(null);
    setUploadingType(type);

    try {
      // Convert file to Base64 data URL for preview/persistence
      const reader = new FileReader();
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      await api.uploadDocument({
        docType: type,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: fileDataUrl,
      });

      setSuccess(`Successfully uploaded ${file.name}`);
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (type: DocType) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    setError(null);
    try {
      await api.deleteDocument(type);
      setSuccess('Document removed successfully.');
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header if Standalone */}
      {isStandalonePage && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              CUSTOMER VERIFICATION PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Identity & Driving Documents
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload your official Fayda ID and driving licence to verify your account and unlock EV reservations.
            </p>
          </div>

          {hasAllDocs && onNavigateToVehicles && (
            <button
              onClick={onNavigateToVehicles}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
            >
              Browse Vehicles
            </button>
          )}
        </div>
      )}

      {/* Global Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          hasAllDocs
            ? 'bg-emerald-950/40 border-emerald-500/40'
            : 'bg-amber-950/40 border-amber-500/40'
        }`}
      >
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              hasAllDocs
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {hasAllDocs ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3
              className={`text-base font-extrabold ${
                hasAllDocs ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {hasAllDocs
                ? 'All 4 Required Documents Verified'
                : `Document Verification Pending (${docCount}/4 Uploaded)`}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              {hasAllDocs
                ? 'Your Fayda ID and Driving Licence are fully verified. You are eligible to place official orders across the entire EV lineup.'
                : 'Please upload both front and back sides of your Fayda National ID and Driving Licence. Vehicle ordering requires full verification.'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              hasAllDocs
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {docCount} / 4 COMPLETED
          </span>
        </div>
      </div>

      {/* Notification Alerts */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DOC_CONFIGS.map((config) => {
          const docItem = documents?.[config.type];
          const isUploaded = Boolean(docItem);
          const isUploading = uploadingType === config.type;

          return (
            <div
              key={config.type}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isUploaded
                  ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-900/50 border-dashed border-slate-700/80 hover:border-cyan-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      {config.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{config.title}</h4>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isUploaded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isUploaded ? 'Verified' : 'Missing'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Uploaded state details */}
              {isUploaded && docItem ? (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate text-slate-300">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate font-mono">{docItem.fileName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {docItem.uploadedAt}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    {(docItem.fileUrl || docItem.dataUrl || docItem.storagePath) && (
                      <button
                        onClick={() => setPreviewDoc(docItem)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 px-2.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    )}

                    <label className="cursor-pointer p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1.5 px-2.5 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(config.type, file);
                        }}
                      />
                    </label>

                    <button
                      onClick={() => handleDelete(config.type)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs flex items-center gap-1 px-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Input Area */
                <label className="cursor-pointer p-6 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center text-center space-y-2 group">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
                      {isUploading ? 'Uploading file...' : `Upload ${config.title}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      JPG, PNG, WebP or PDF (Max 10MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isUploading}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(config.type, file);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                {previewDoc.fileName}
              </h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 gap-3">
              {(previewDoc.fileUrl || previewDoc.dataUrl) &&
              !(previewDoc.fileName.toLowerCase().endsWith('.pdf')) ? (
                <img
                  src={previewDoc.fileUrl || previewDoc.dataUrl}
                  alt={previewDoc.fileName}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[55vh] object-contain rounded-lg border border-slate-800"
                />
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-cyan-400" />
                  <p className="text-xs font-mono text-slate-300">{previewDoc.fileName}</p>
                  <p className="text-xs text-slate-400">PDF Document securely stored in Kairos Addis encrypted vault.</p>
                  <a
                    href={`/api/portal/documents/view/${previewDoc.docType}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    Open Document in New Tab
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
