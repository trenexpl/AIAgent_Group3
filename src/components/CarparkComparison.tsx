import React from 'react';
import { Carpark } from '../types/carpark';
import { X, Navigation, Check, Sparkles, Footprints, DollarSign, Shield, Zap, Clock, ArrowRight } from 'lucide-react';
import { formatDistance } from '../services/parkingService';

interface CarparkComparisonProps {
  carparks: Carpark[];
  onRemove: (carparkId: string) => void;
  onClearAll: () => void;
  onChooseAndNavigate: (carpark: Carpark) => void;
  onClose: () => void;
}

export const CarparkComparison: React.FC<CarparkComparisonProps> = ({
  carparks,
  onRemove,
  onClearAll,
  onChooseAndNavigate,
  onClose,
}) => {
  if (carparks.length === 0) return null;

  // Identify best option in this subset
  const highestScored = [...carparks].sort(
    (a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0)
  )[0];

  return (
    <div
      id="comparison-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-500 text-slate-950 uppercase">
                Direct Comparison
              </span>
              <span className="text-xs text-slate-400">
                Comparing {carparks.length} / 3 selected carparks
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">Compare Parking Options</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[650px] md:min-w-0">
            {carparks.map((cp) => {
              const isWinner = cp.id === highestScored?.id;
              const freePercent = cp.totalLots > 0 ? Math.round((cp.availableLots / cp.totalLots) * 100) : 0;

              return (
                <div
                  key={cp.id}
                  id={`comparison-card-${cp.id}`}
                  className={`relative rounded-2xl p-4 sm:p-5 border-2 flex flex-col justify-between transition-all ${
                    isWinner
                      ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20 shadow-lg'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(cp.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    {/* Winner Badge */}
                    {isWinner && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-600 text-white text-[11px] font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                        Strongest Option
                      </div>
                    )}

                    <div className="pr-8">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {cp.agency}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1 leading-tight">
                        {cp.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cp.address}</p>
                    </div>

                    {/* Metric Comparison Rows */}
                    <div className="mt-4 divide-y divide-slate-100 text-xs space-y-2">
                      {/* Availability */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Availability</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">
                            {cp.availableLots} lots free
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              cp.availabilityLevel === 'HIGH'
                                ? 'text-emerald-600'
                                : cp.availabilityLevel === 'MODERATE'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {freePercent}% available
                          </span>
                        </div>
                      </div>

                      {/* Hourly Price */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Estimated Rate</span>
                        <div className="text-right">
                          <span className="font-black text-sm text-slate-900">
                            ${cp.rates.estimatedHourlyRate.toFixed(2)}/hr
                          </span>
                          {cp.rates.perEntryRate && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                              {cp.rates.perEntryRate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Distance & Walking */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Walking Distance</span>
                        <div className="text-right font-bold text-slate-800">
                          <span>{cp.distanceMeters ? formatDistance(cp.distanceMeters) : 'Nearby'}</span>
                          <span className="text-[11px] text-slate-500 block">
                            ~{cp.walkingMinutes ?? 3} min walk
                          </span>
                        </div>
                      </div>

                      {/* Grace Period */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Grace Period</span>
                        <span className="font-bold text-teal-700">
                          {cp.rates.gracePeriodMinutes} mins free
                        </span>
                      </div>

                      {/* Key Features */}
                      <div className="pt-2 space-y-1">
                        <span className="text-slate-500 font-medium block">Amenities:</span>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {cp.features.covered ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              Covered
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 line-through">
                              Open-air
                            </span>
                          )}
                          {cp.features.evCharging && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                              EV Charger
                            </span>
                          )}
                          {cp.features.twentyFourHours && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">24/7</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Choose This Carpark */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      id={`btn-choose-compare-${cp.id}`}
                      onClick={() => onChooseAndNavigate(cp)}
                      className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                        isWinner
                          ? 'bg-sky-600 hover:bg-sky-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Choose This Carpark</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <p>
            Tip: Rates and real-time availability update continuously. Always verify entry gantries upon arrival.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors"
          >
            Back to Map &amp; List
          </button>
        </div>
      </div>
    </div>
  );
};
