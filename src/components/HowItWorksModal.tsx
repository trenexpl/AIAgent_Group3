import React from 'react';
import { HelpCircle, Search, GitCompare, CheckCircle2, Navigation, Bell, Shield, X, Sparkles, Database, ExternalLink } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStartSearch: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onStartSearch }) => {
  return (
    <div
      id="how-it-works-modal"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
                Driver Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-black">How ParkSG Works</h2>
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
          <p className="text-base text-slate-900 font-semibold">
            ParkSG is built around one simple promise: <br />
            <span className="text-sky-700 font-extrabold italic">
              "Tell us where you're going. We'll help you find where to park."
            </span>
          </p>

          {/* 4 Core Steps */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black shrink-0">
                1
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Search Destination</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Type any shopping mall, office building, hospital or tourist spot, or click <strong>Near Me</strong> to use your real-time GPS location in Singapore.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black shrink-0">
                2
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Compare Live Availability &amp; Rates</h3>
                <p className="text-xs text-slate-600 mt-1">
                  View nearby HDB, URA, and private commercial carparks on an interactive map. Filter by covered parking, EV fast chargers, and hourly price caps.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shrink-0">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Smart Recommendation Engine</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Our algorithm calculates a multi-factor score: <strong>Availability + Distance + Price + Convenience</strong> to highlight the optimal carpark with transparent reasoning.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                4
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">1-Click Direct Navigation</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Deep-link directly to Google Maps, Apple Maps, Waze or Citymapper to receive turn-by-turn driving directions straight to the gantry entrance.
                </p>
              </div>
            </div>
          </div>

          {/* Occupancy Alerts Info */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm">80% Occupancy &amp; Low Lot Alerts</h4>
              <p className="text-xs text-amber-800">
                Enable alerts for hot destination carparks like Orchard or Marina Bay Sands to get notified if available spaces drop while you are en route.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Designed for Singapore drivers</span>
          <button
            onClick={() => {
              onClose();
              onStartSearch();
            }}
            className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            Start Finding Parking
          </button>
        </div>
      </div>
    </div>
  );
};
