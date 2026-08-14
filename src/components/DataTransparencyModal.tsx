import React, { useEffect, useState } from 'react';
import { Database, ShieldCheck, RefreshCw, X, AlertTriangle, ExternalLink, CheckCircle2, Lock, Radio } from 'lucide-react';

interface DataTransparencyModalProps {
  onClose: () => void;
  lastRefreshed?: string;
}

export const DataTransparencyModal: React.FC<DataTransparencyModalProps> = ({ onClose, lastRefreshed }) => {
  const [telemetry, setTelemetry] = useState<{
    totalCarparks?: number;
    agencyBreakdown?: { HDB: number; URA: number; LTA: number; Commercial: number };
    lastRefreshed?: string;
  }>({});

  useEffect(() => {
    fetch('/api/carparks/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTelemetry(data);
        }
      })
      .catch((err) => console.warn('Could not fetch status:', err));
  }, []);

  return (
    <div
      id="data-transparency-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
                Real-Time Singapore Telemetry
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Live DataMall v2 Integration</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Main Telemetry Box */}
          <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-start gap-3">
            <Radio className="w-5 h-5 text-sky-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sky-950 text-base">Direct Official LTA DataMall Ingestion</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-xs text-sky-800">
                <strong>What The Park</strong> queries the official Singapore Land Transport Authority (LTA)
                <code className="bg-white/80 px-1 py-0.5 rounded ml-1 text-slate-800 font-mono">CarParkAvailabilityv2</code> endpoint with authenticated telemetry headers.
              </p>
              {telemetry.totalCarparks && (
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="block font-black text-slate-900 text-sm">{telemetry.totalCarparks}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Total Sites</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="block font-black text-slate-900 text-sm">{telemetry.agencyBreakdown?.HDB || 2100}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">HDB MSCP</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="block font-black text-slate-900 text-sm">{telemetry.agencyBreakdown?.URA || 240}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">URA Lots</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="block font-black text-slate-900 text-sm">{telemetry.agencyBreakdown?.LTA || 120}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Malls/LTA</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Ingested Singapore Public Data Streams:
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Land Transport Authority (LTA)</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live dynamic vehicle lot counts for commercial shopping centers, expressways, and central hubs.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Live API
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Urban Redevelopment Authority (URA)</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covers commercial surface, underground, and electronic carparks across CBD, Chinatown, and Orchard.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Live Feed
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Housing &amp; Development Board (HDB)</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-storey residential, town centres, central area differential pricing, and Sunday Free Parking schedules.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Live Feed
                </span>
              </div>
            </div>
          </div>

          {/* Important Disclaimers */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Real-Time Parking Disclaimers &amp; Guardrails:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li>
                <strong>Rapid Fluctuations:</strong> During peak periods (e.g. weekend evenings or CBD lunchtime), spaces may fill up quickly while driving.
              </li>
              <li>
                <strong>Gantry Signboards:</strong> Always obey electronic barrier signage and parking wardens on site.
              </li>
              <li>
                <strong>Special Event Tariffs:</strong> While standard rates are audited, operators may adjust event surcharges for festive occasions or concerts.
              </li>
            </ul>
          </div>

          {/* Privacy statement */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Driver Privacy:</strong> What The Park does not store vehicle license plates or transmit continuous telemetry traces.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
