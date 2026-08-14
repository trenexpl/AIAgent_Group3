import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Star, Compass, RefreshCw, Zap, Car, Navigation, Sparkles } from 'lucide-react';
import { SearchDestination, SavedCarparkItem, RecentSearchItem } from '../types/carpark';
import { SINGAPORE_DESTINATIONS } from '../data/singaporeDestinations';

interface HeroSearchProps {
  onSearch: (destination: SearchDestination | { name: string; latitude: number; longitude: number; address: string }) => void;
  onUseCurrentLocation: () => void;
  savedCarparks: SavedCarparkItem[];
  recentSearches: RecentSearchItem[];
  onSelectSavedCarpark: (carparkId: string) => void;
  isLoadingLocation?: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  onUseCurrentLocation,
  savedCarparks,
  recentSearches,
  onSelectSavedCarpark,
  isLoadingLocation = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<SearchDestination[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions as user types
  useEffect(() => {
    if (!query.trim()) {
      setFilteredDestinations(SINGAPORE_DESTINATIONS.slice(0, 6));
    } else {
      const q = query.toLowerCase();
      const results = SINGAPORE_DESTINATIONS.filter(
        (dest) =>
          dest.name.toLowerCase().includes(q) ||
          dest.address.toLowerCase().includes(q) ||
          dest.area.toLowerCase().includes(q) ||
          dest.category.toLowerCase().includes(q)
      );
      setFilteredDestinations(results);
    }
  }, [query]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDestination = (dest: SearchDestination) => {
    setQuery(dest.name);
    setIsOpenSuggestions(false);
    onSearch(dest);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onUseCurrentLocation();
      return;
    }

    const matched = SINGAPORE_DESTINATIONS.find(
      (d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.area.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      handleSelectDestination(matched);
    } else {
      onSearch({
        name: query.trim(),
        address: `${query.trim()}, Singapore`,
        latitude: 1.3040,
        longitude: 103.8318,
      });
      setIsOpenSuggestions(false);
    }
  };

  // Quick driver preset destinations
  const driverHotspots = [
    { name: 'Orchard Road', area: 'Central', id: 'orchard', icon: '🛍️' },
    { name: 'Marina Bay Sands', area: 'Downtown', id: 'mbs', icon: '🏙️' },
    { name: 'Raffles Place', area: 'CBD', id: 'raffles', icon: '💼' },
    { name: 'Bugis Junction', area: 'Central', id: 'bugis', icon: '🛍️' },
    { name: 'Suntec City', area: 'Marina Centre', id: 'suntec', icon: '🏬' },
    { name: 'VivoCity', area: 'HarbourFront', id: 'vivocity', icon: '🌊' },
    { name: 'Jurong East', area: 'West', id: 'jurong', icon: '🚆' },
    { name: 'Changi Airport', area: 'East', id: 'changi', icon: '✈️' },
  ];

  return (
    <div id="driver-hero-container" className="relative bg-gradient-to-b from-sky-50/80 via-white to-slate-50 border-b border-slate-200 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Driver Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-black mb-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span>What The Park • Real-Time Singapore Lots &amp; Rates</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-snug mb-2">
          Where are you driving to?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto mb-6">
          Search any Singapore location to view live lot availability and rates on an interactive map.
        </p>

        {/* Primary Driver Search Form */}
        <div className="relative max-w-2xl mx-auto z-30">
          <form onSubmit={handleCustomSubmit} className="relative flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/90 border-2 border-slate-300 focus-within:border-sky-600 transition-all">
            <div className="flex items-center w-full px-3 gap-3">
              <Search className="w-6 h-6 text-sky-600 shrink-0" />
              <input
                ref={searchInputRef}
                id="main-destination-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpenSuggestions(true);
                }}
                onFocus={() => setIsOpenSuggestions(true)}
                placeholder="Enter mall, street, or destination..."
                className="w-full py-2.5 text-slate-950 placeholder:text-slate-400 text-base sm:text-lg font-bold focus:outline-hidden bg-transparent"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions Inside Search Bar */}
            <div className="flex items-center w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2">
              <button
                type="button"
                id="btn-use-current-location"
                onClick={onUseCurrentLocation}
                disabled={isLoadingLocation}
                className="flex-1 sm:flex-initial py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 active:scale-95 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                {isLoadingLocation ? (
                  <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 text-emerald-700" />
                )}
                <span className="whitespace-nowrap">Near Me</span>
              </button>

              <button
                type="submit"
                id="btn-submit-search"
                className="flex-1 sm:flex-initial py-3 px-6 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Search Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {isOpenSuggestions && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-left max-h-80 overflow-y-auto animate-in fade-in-50 duration-150"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{query.trim() ? 'Search Results' : 'Suggested Singapore Destinations'}</span>
                <span className="text-[11px] text-slate-400">Tap to open map</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => handleSelectDestination(dest)}
                      className="p-3.5 hover:bg-sky-50/80 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-950 group-hover:text-sky-700">
                              {dest.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                              {dest.area}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md">
                            {dest.address}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        View Map <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No predefined destination found. Press <strong>Search Map</strong> to query nearby carparks.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fast 1-Tap Driver Hotspot Buttons */}
        <div className="mt-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Quick 1-Tap Hotspots:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {driverHotspots.map((spot) => {
              const matchedDest = SINGAPORE_DESTINATIONS.find((d) =>
                d.name.toLowerCase().includes(spot.name.toLowerCase())
              );
              return (
                <button
                  key={spot.id}
                  id={`hotspot-btn-${spot.id}`}
                  onClick={() => {
                    if (matchedDest) {
                      handleSelectDestination(matchedDest);
                    } else {
                      onSearch({
                        name: spot.name,
                        address: `${spot.name}, Singapore`,
                        latitude: 1.3040,
                        longitude: 103.8318,
                      });
                    }
                  }}
                  className="p-3 bg-white hover:bg-sky-50 active:scale-95 border-2 border-slate-200 hover:border-sky-300 rounded-2xl shadow-xs transition-all flex items-center gap-2.5 text-left group"
                >
                  <span className="text-xl shrink-0">{spot.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block truncate group-hover:text-sky-700">
                      {spot.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{spot.area}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequently Used / Recent Searches Chips */}
        {(savedCarparks.length > 0 || recentSearches.length > 0) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {savedCarparks.slice(0, 2).map((item) => (
              <button
                key={item.id}
                id={`chip-saved-${item.carparkId}`}
                onClick={() => onSelectSavedCarpark(item.carparkId)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>{item.carparkName.replace(' (URA)', '').replace(' MSCP (HDB)', '').replace(' Carpark', '')}</span>
              </button>
            ))}

            {recentSearches.slice(0, 2).map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  onSearch({
                    name: item.destinationName,
                    address: item.address,
                    latitude: item.latitude,
                    longitude: item.longitude,
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>{item.destinationName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
