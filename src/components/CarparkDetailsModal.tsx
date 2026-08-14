import React from 'react';
import { Carpark } from '../types/carpark';
import { 
  X, 
  Navigation, 
  Bookmark, 
  BookmarkCheck, 
  Bell, 
  Clock, 
  Footprints, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  Layers,
  MapPin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { formatDistance, getNavigationLinks } from '../services/parkingService';

interface CarparkDetailsModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  onNavigate: (carpark: Carpark) => void;
  isSaved: boolean;
  onToggleSave: (carpark: Carpark) => void;
  onOpenAlert: (carpark: Carpark) => void;
  isCompared: boolean;
  onToggleCompare: (carpark: Carpark) => void;
}

export const CarparkDetailsModal: React.FC<CarparkDetailsModalProps> = ({
  carpark,
  onClose,
  onNavigate,
  isSaved,
  onToggleSave,
  onOpenAlert,
  isCompared,
  onToggleCompare,
}) => {
  if (!carpark) return null;

  const freePercentage =
    carpark.totalLots > 0
      ? Math.round((carpark.availableLots / carpark.totalLots) * 100)
      : 0;

  const navLinks = getNavigationLinks(carpark);

  return (
    <div
      id="carpark-details-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {carpark.agency} Carpark
              </span>
              <span className="text-xs text-slate-400 font-mono">Code: {carpark.code}</span>
              {carpark.recommendationBadge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  Recommended
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{carpark.address}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Availability Overview Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Live Lot Availability
              </span>
              <span className="text-xs text-slate-400 font-medium">Updated: {carpark.lastUpdated}</span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-3xl font-black text-slate-900">{carpark.availableLots}</span>
                <span className="text-sm text-slate-500 font-medium"> / {carpark.totalLots} total lots free</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  carpark.availabilityLevel === 'HIGH'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : carpark.availabilityLevel === 'MODERATE'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {carpark.availabilityLevel === 'HIGH'
                  ? 'High Availability'
                  : carpark.availabilityLevel === 'MODERATE'
                  ? 'Moderate Availability'
                  : 'Limited / Nearly Full'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  carpark.availabilityLevel === 'HIGH'
                    ? 'bg-emerald-500'
                    : carpark.availabilityLevel === 'MODERATE'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, freePercentage))}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{carpark.totalLots - carpark.availableLots} lots occupied ({carpark.occupancyRate}%)</span>
              <span className="font-semibold text-sky-700">{freePercentage}% available</span>
            </div>
          </div>

          {/* Detailed Parking Rates Breakdown */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Full Parking Rates Breakdown</span>
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
              <div className="p-3.5 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Weekday Day / Peak:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.weekdayPeak}</span>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Weekday Evening / Off-Peak:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.weekdayOffPeak}</span>
              </div>

              <div className="p-3.5 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Saturday:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.saturday}</span>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-700">Sunday &amp; Public Holidays:</span>
                <span className="font-medium text-xs text-slate-900">{carpark.rates.sundayPublicHoliday}</span>
              </div>

              {carpark.rates.freeParkingInfo && (
                <div className="p-3.5 bg-emerald-50 text-emerald-900 flex items-start gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{carpark.rates.freeParkingInfo}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Grace Period:</strong> {carpark.rates.gracePeriodMinutes} minutes free entry. No charge if you exit within grace time.
              </span>
            </div>
          </div>

          {/* Operating Info, Gantry & Amenities */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Operating System &amp; Facilities</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">System</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block">{carpark.parkingSystem}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">Height Limit</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                  {carpark.heightLimitMeters ? `${carpark.heightLimitMeters} meters` : 'Standard clearance'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase font-semibold">Payment</span>
                <span className="font-bold text-xs text-slate-800 mt-0.5 block truncate">
                  {carpark.paymentMethods.join(', ')}
                </span>
              </div>
            </div>

            {/* Feature Badges list */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className={`px-2.5 py-1 rounded-lg border font-medium ${carpark.features.covered ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'}`}>
                {carpark.features.covered ? '✓ Covered Multi-Storey' : 'Open-Air / Surface'}
              </span>

              {carpark.features.evCharging && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  EV Fast Charging Available
                </span>
              )}

              {carpark.features.handicapLots && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  Accessible / Handicap Lots
                </span>
              )}

              {carpark.features.twentyFourHours && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  24/7 Gantry Access
                </span>
              )}
            </div>
          </div>

          {/* Official Source Transparency notice */}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
            <span>Data source: {carpark.dataSource}</span>
            <span>Availability may fluctuate rapidly during peak hours</span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Save */}
            <button
              id="details-btn-save"
              onClick={() => onToggleSave(carpark)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved' : 'Save Carpark'}</span>
            </button>

            {/* Alert */}
            <button
              id="details-btn-alert"
              onClick={() => onOpenAlert(carpark)}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 text-sky-600" />
              <span>Set Alert</span>
            </button>

            {/* Compare */}
            <button
              id="details-btn-compare"
              onClick={() => onToggleCompare(carpark)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <span>{isCompared ? '✓ Compared' : '+ Compare'}</span>
            </button>
          </div>

          {/* Primary CTA Navigate */}
          <button
            id="details-btn-navigate-primary"
            onClick={() => onNavigate(carpark)}
            className="py-3 px-6 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 ml-auto"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigate Here Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
