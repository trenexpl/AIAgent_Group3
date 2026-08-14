import React from 'react';
import { Carpark, AvailabilityLevel } from '../types/carpark';
import { 
  Navigation, 
  Bookmark, 
  BookmarkCheck, 
  Bell, 
  Sparkles, 
  Clock, 
  Footprints, 
  Zap, 
  Shield, 
  Info, 
  Check, 
  ChevronRight,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { formatDistance } from '../services/parkingService';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isSaved: boolean;
  isCompared: boolean;
  hasAlert: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onToggleSave: () => void;
  onToggleCompare: () => void;
  onOpenAlert: () => void;
  onOpenDetails: () => void;
  isCompareDisabled?: boolean;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isSaved,
  isCompared,
  hasAlert,
  onSelect,
  onNavigate,
  onToggleSave,
  onToggleCompare,
  onOpenAlert,
  onOpenDetails,
  isCompareDisabled = false,
}) => {
  const freePercentage =
    carpark.totalLots > 0
      ? Math.round((carpark.availableLots / carpark.totalLots) * 100)
      : 0;

  // Accessibility & Visual theme for Availability
  const getAvailabilityBadge = (level: AvailabilityLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'High Availability',
          occupancyText: `${carpark.availableLots} lots available (${freePercentage}% free)`,
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Moderate Availability',
          occupancyText: `${carpark.availableLots} lots available (${freePercentage}% free)`,
        };
      case 'LIMITED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          label: 'Limited Availability',
          occupancyText: `${carpark.availableLots} lots left (${freePercentage}% free)`,
        };
      case 'FULL':
        return {
          bg: 'bg-red-100 text-red-900 border-red-400 font-bold',
          dot: 'bg-red-600',
          label: 'Nearly Full / Full',
          occupancyText: `${carpark.availableLots} lots remaining`,
        };
    }
  };

  const badgeInfo = getAvailabilityBadge(carpark.availabilityLevel);

  return (
    <div
      id={`carpark-card-${carpark.id}`}
      className={`relative bg-white rounded-2xl border-2 transition-all duration-200 shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Smart Recommendation Banner if present */}
      {carpark.recommendationBadge && (
        <div className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-t-xl flex items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="font-extrabold uppercase tracking-wide text-[11px]">
              {carpark.recommendationBadge === 'best_overall'
                ? 'Recommended for You'
                : carpark.recommendationBadge === 'cheapest'
                ? 'Best Value (Lowest Rate)'
                : carpark.recommendationBadge === 'closest'
                ? 'Closest to Destination'
                : 'Highest Free Lots'}
            </span>
          </div>
          <span className="text-[11px] opacity-90 font-mono">Score: {carpark.recommendationScore}/100</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top Header: Agency, Title, Price */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {carpark.agency}
              </span>
              <span className="text-xs text-slate-400 font-mono">#{carpark.code}</span>
              {carpark.rates.gracePeriodMinutes > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                  {carpark.rates.gracePeriodMinutes}m Grace
                </span>
              )}
            </div>

            <h3
              onClick={onSelect}
              className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug cursor-pointer hover:text-sky-600 transition-colors"
            >
              {carpark.name}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-1">{carpark.address}</p>
          </div>

          {/* Pricing Box */}
          <div className="text-right shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Estimated</span>
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-xl font-black text-slate-900">
                ${carpark.rates.estimatedHourlyRate.toFixed(2)}
              </span>
              <span className="text-xs text-slate-600 font-medium">/hr</span>
            </div>
            {carpark.rates.perEntryRate && (
              <span className="text-[10px] text-sky-700 font-semibold block mt-0.5 truncate max-w-[120px]">
                {carpark.rates.perEntryRate}
              </span>
            )}
          </div>
        </div>

        {/* Concrete Recommendation Reasoning */}
        {carpark.recommendationReason && (
          <div className="mb-3.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{carpark.recommendationReason}</span>
          </div>
        )}

        {/* Availability Bar & Key Metrics Grid */}
        <div className="mb-3.5 space-y-2">
          {/* Availability Status Badge & Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-xs" style={{ background: 'inherit' }}>
                <span className={`w-2 h-2 rounded-full ${badgeInfo.dot}`}></span>
                <span className={`font-bold ${badgeInfo.bg.includes('emerald') ? 'text-emerald-800' : badgeInfo.bg.includes('amber') ? 'text-amber-800' : 'text-rose-800'}`}>
                  {badgeInfo.label}
                </span>
              </div>
              <span className="font-bold text-slate-800">
                {carpark.availableLots} / {carpark.totalLots} Lots Free
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  carpark.availabilityLevel === 'HIGH'
                    ? 'bg-emerald-500'
                    : carpark.availabilityLevel === 'MODERATE'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(8, freePercentage))}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Metrics: Distance, Walking Time, Vehicle & System */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                <Navigation className="w-3 h-3 text-slate-400" />
                Distance
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {carpark.distanceMeters ? formatDistance(carpark.distanceMeters) : 'Nearby'}
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                <Footprints className="w-3 h-3 text-slate-400" />
                Walking
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {carpark.walkingMinutes ?? 3} min walk
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Updated
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {carpark.lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px] text-slate-600 font-medium">
          {carpark.features.covered && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Covered</span>
          )}
          {carpark.features.evCharging && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              EV Charging
            </span>
          )}
          {carpark.features.twentyFourHours && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">24/7 Access</span>
          )}
          {carpark.heightLimitMeters && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              Ht: {carpark.heightLimitMeters}m
            </span>
          )}
        </div>

        {/* Primary & Secondary Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              id={`card-compare-btn-${carpark.id}`}
              onClick={onToggleCompare}
              disabled={!isCompared && isCompareDisabled}
              title={isCompared ? 'Remove from comparison' : 'Add to compare (up to 3)'}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : isCompareDisabled
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Compared</span>
                </>
              ) : (
                <>
                  <span>+ Compare</span>
                </>
              )}
            </button>

            {/* Save / Favorite */}
            <button
              id={`card-save-btn-${carpark.id}`}
              onClick={onToggleSave}
              title={isSaved ? 'Remove from saved' : 'Save carpark'}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-300'
              }`}
              aria-label="Save carpark"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Set Alert */}
            <button
              id={`card-alert-btn-${carpark.id}`}
              onClick={onOpenAlert}
              title="Set Availability Alert"
              className={`p-2 rounded-xl border transition-all ${
                hasAlert
                  ? 'bg-sky-50 text-sky-700 border-sky-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-300'
              }`}
              aria-label="Set availability alert"
            >
              <Bell className={`w-4 h-4 ${hasAlert ? 'fill-sky-600 text-sky-600' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Details */}
            <button
              id={`card-details-btn-${carpark.id}`}
              onClick={onOpenDetails}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              Details
            </button>

            {/* Navigate Direct */}
            <button
              id={`card-navigate-btn-${carpark.id}`}
              onClick={onNavigate}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
