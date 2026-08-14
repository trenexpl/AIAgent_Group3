import React from 'react';
import { Database, ShieldCheck, RefreshCw, X, AlertTriangle, ExternalLink, CheckCircle2, Lock } from 'lucide-react';

interface DataTransparencyModalProps {
  onClose: () => void;
}

export const DataTransparencyModal: React.FC<DataTransparencyModalProps> = ({ onClose }) => {
  return (
    <div
      id="data-transparency-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
                Trust &amp; Accuracy
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Data Sources &amp; Transparency</h2>
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
          {/* Main Statement */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-teal-900 text-base">Where does our parking data come from?</h3>
              <p className="text-xs text-teal-800">
                ParkSG aggregates official real-time availability and tariff data published by Singapore government statutory boards and connected private operators.
              </p>
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Connected Official &amp; Open Datasets:
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Land Transport Authority (LTA) DataMall</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provides dynamic vehicle lot counts for shopping malls, expressways and central areas.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Real-Time API
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Urban Redevelopment Authority (URA) API</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covers commercial surface, underground and coupon/electronic carparks across the Central Business District.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Every 1-2 Mins
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Housing &amp; Development Board (HDB) InfoWEB</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-storey residential &amp; town centre carparks, central area rates and Sunday Free Parking rules.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Live Feed
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/50 flex items-start justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">CapitaLand, Lendlease, Mapletree &amp; Private Mall Feeds</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Private gantry sensor data and per-entry evening flat rates.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-100 text-sky-800 shrink-0">
                  Direct Ingest
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
                <strong>Availability Fluctuations:</strong> In peak hours (e.g. Saturday evening in Orchard or weekday lunch in Tanjong Pagar), spaces can fill within minutes between departure and arrival.
              </li>
              <li>
                <strong>Gantry Signboards:</strong> Always obey electronic entry barrier signs and marshals on site.
              </li>
              <li>
                <strong>Rates &amp; Peak Surges:</strong> While rates are audited regularly, carpark operators may adjust special event tariffs during concert or festive days.
              </li>
            </ul>
          </div>

          {/* Privacy statement */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Driver Privacy:</strong> ParkSG does not store personal vehicle registration numbers or transmit your continuous GPS track. Location is requested only for computing nearest carparks.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
