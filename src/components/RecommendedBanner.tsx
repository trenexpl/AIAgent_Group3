import React from 'react';
import { Carpark } from '../types/carpark';
import { Sparkles, Navigation, ArrowRight, ShieldCheck, Footprints, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDistance } from '../services/parkingService';

interface RecommendedBannerProps {
  carpark: Carpark;
  destinationName?: string;
  onNavigate: () => void;
  onViewDetails: () => void;
}

export const RecommendedBanner: React.FC<RecommendedBannerProps> = ({
  carpark,
  destinationName,
  onNavigate,
  onViewDetails,
}) => {
  return (
    <div
      id="recommended-carpark-banner"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-500/30 mb-6"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-white" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          {/* Badge & Agency */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              RECOMMENDED FOR YOU
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-sky-200 border border-white/10">
              {carpark.agency} #{carpark.code}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ★ Score: {carpark.recommendationScore ?? 94}/100
            </span>
          </div>

          {/* Carpark Name & Address */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
              {carpark.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-1">
              {carpark.address}
            </p>
          </div>

          {/* Explicit Reasoning Box */}
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs sm:text-sm text-sky-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Why this carpark:</strong>{' '}
              {carpark.recommendationReason ||
                `Best balance of space (${carpark.availableLots} lots available), only ${formatDistance(
                  carpark.distanceMeters || 0
                )} (${carpark.walkingMinutes} min walk) from ${destinationName || 'destination'}, and great rate at $${carpark.rates.estimatedHourlyRate.toFixed(2)}/hr.`}
            </p>
          </div>

          {/* Metrics summary */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span><strong>{carpark.availableLots}</strong> lots free ({carpark.totalLots - carpark.occupancyRate}% empty)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-sky-300" />
              <span><strong>{carpark.walkingMinutes ?? 3} mins</strong> walking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-300" />
              <span><strong>${carpark.rates.estimatedHourlyRate.toFixed(2)}</strong>/hr</span>
            </div>
          </div>
        </div>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-center">
          <button
            id="btn-recommended-navigate"
            onClick={onNavigate}
            className="py-3.5 px-6 bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Navigate Here Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-recommended-details"
            onClick={onViewDetails}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1"
          >
            <span>View Full Rate Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
