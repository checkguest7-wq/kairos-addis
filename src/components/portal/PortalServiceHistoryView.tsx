import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  UserCheck,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ServiceRecord } from '../../types';

interface PortalServiceHistoryViewProps {
  serviceHistory: ServiceRecord[];
  onBookService: () => void;
}

export const PortalServiceHistoryView: React.FC<PortalServiceHistoryViewProps> = ({
  serviceHistory,
  onBookService,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(serviceHistory[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            MAINTENANCE & INSPECTION LOGS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Service History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete digital maintenance records verified by certified Kairos Addis master EV technicians.
          </p>
        </div>

        <button
          id="btn-service-hist-book"
          onClick={onBookService}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>BOOK A SERVICE</span>
        </button>
      </div>

      {/* Service List */}
      <div className="space-y-4">
        {serviceHistory.length > 0 ? (
          serviceHistory.map((record) => {
            const isExpanded = expandedId === record.id;

            return (
              <div
                key={record.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-lg hover:border-slate-700"
              >
                {/* Summary Header */}
                <div
                  onClick={() => toggleExpand(record.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1 sm:mt-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{record.serviceType}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          {record.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {record.date}
                        </span>
                        <span>•</span>
                        <span>{record.vehicle}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300 font-semibold">{record.mileage.toLocaleString()} KM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right sm:block hidden">
                      <div className="text-xs font-bold text-emerald-400">
                        {record.costETB === 0 ? 'Complimentary (YouGuard)' : `${record.costETB.toLocaleString()} ETB`}
                      </div>
                      <div className="text-[10px] text-slate-500">{record.facility}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/60 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Service Center</span>
                        <p className="text-slate-200 mt-0.5">{record.facility}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Lead Master Tech</span>
                        <p className="text-slate-200 mt-0.5">{record.technician}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Total Billed</span>
                        <p className="text-emerald-400 font-bold mt-0.5">
                          {record.costETB === 0 ? '0.00 ETB (Included in Warranty)' : `${record.costETB} ETB`}
                        </p>
                      </div>
                    </div>

                    {/* Check items */}
                    <div className="space-y-2">
                      <span className="font-semibold text-slate-300 block">Procedures & Serviced Items:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.itemsServiced.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technician Notes */}
                    {record.notes && (
                      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-slate-300 text-[11px]">
                        <span className="font-semibold text-cyan-400 block mb-1">Technician Inspection Report:</span>
                        <p>{record.notes}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No Active Requests</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have no previous or active service requests logged in your account.
              </p>
            </div>
            <div className="pt-2">
              <button
                id="btn-service-request-empty"
                onClick={onBookService}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request Service</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
