import React from 'react';
import { FilterOptions, VehicleType } from '../types/carpark';
import { Filter, SlidersHorizontal, ArrowUpDown, Zap, Check, RotateCcw } from 'lucide-react';

interface FiltersBarProps {
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalResultsCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeFiltersCount = [
    filters.agency !== 'all',
    filters.maxPricePerHour < 10,
    filters.maxDistanceMeters < 5000,
    filters.minAvailableLots > 0,
    filters.coveredOnly,
    filters.evChargingOnly,
    filters.twentyFourHoursOnly,
  ].filter(Boolean).length;

  return (
    <div id="carpark-filters-bar" className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
      {/* Quick Row: Sorting, Quick Pills, Expand Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Quick vehicle & filter button */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Vehicle type toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-bold">
            {(['Car', 'Motorcycle'] as VehicleType[]).map((v) => (
              <button
                key={v}
                onClick={() => onChangeFilters({ ...filters, vehicleType: v })}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filters.vehicleType === v
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Quick covered pill */}
          <button
            onClick={() => onChangeFilters({ ...filters, coveredOnly: !filters.coveredOnly })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.coveredOnly
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filters.coveredOnly ? '✓ Covered Only' : 'Covered'}
          </button>

          {/* Quick EV charging pill */}
          <button
            onClick={() => onChangeFilters({ ...filters, evChargingOnly: !filters.evChargingOnly })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
              filters.evChargingOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>EV Fast Charge</span>
          </button>

          {/* Filter expansion button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFiltersCount > 0
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-sky-800 text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Sort:</span>
          <select
            id="select-sort-by"
            value={filters.sortBy}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                sortBy: e.target.value as FilterOptions['sortBy'],
              })
            }
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500"
          >
            <option value="recommended">★ Recommended (Smart Score)</option>
            <option value="distance">Nearest Distance</option>
            <option value="price">Lowest Hourly Rate</option>
            <option value="availability">Highest Availability %</option>
            <option value="lots">Most Available Lots</option>
          </select>
        </div>
      </div>

      {/* Expanded Advanced Filters Drawer */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in-50 duration-150">
          {/* Agency Filter */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
              Agency / Operator
            </label>
            <select
              value={filters.agency}
              onChange={(e) => onChangeFilters({ ...filters, agency: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="all">All Operators (HDB, URA, Malls)</option>
              <option value="HDB">HDB Only</option>
              <option value="URA">URA Only</option>
              <option value="Mall">Shopping Malls Only</option>
              <option value="Commercial">Commercial / Office Towers</option>
            </select>
          </div>

          {/* Max Distance */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
              Max Distance
            </label>
            <select
              value={filters.maxDistanceMeters}
              onChange={(e) =>
                onChangeFilters({ ...filters, maxDistanceMeters: Number(e.target.value) })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value={5000}>Any Distance</option>
              <option value={500}>Within 500m (&lt; 6 min walk)</option>
              <option value={1000}>Within 1.0 km</option>
              <option value={2000}>Within 2.0 km</option>
            </select>
          </div>

          {/* Max Hourly Rate */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
              Max Hourly Rate
            </label>
            <select
              value={filters.maxPricePerHour}
              onChange={(e) =>
                onChangeFilters({ ...filters, maxPricePerHour: Number(e.target.value) })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value={10}>Any Price</option>
              <option value={1.5}>Under $1.50 / hr</option>
              <option value={2.5}>Under $2.50 / hr</option>
              <option value={3.5}>Under $3.50 / hr</option>
            </select>
          </div>

          {/* Min Available Lots */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
              Lot Buffer
            </label>
            <select
              value={filters.minAvailableLots}
              onChange={(e) =>
                onChangeFilters({ ...filters, minAvailableLots: Number(e.target.value) })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value={0}>Any available lots</option>
              <option value={20}>At least 20 lots free</option>
              <option value={50}>At least 50 lots free</option>
              <option value={100}>At least 100 lots free</option>
            </select>
          </div>

          {/* Bottom Filter Controls */}
          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">
              Showing <strong>{totalResultsCount}</strong> matching carparks
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
