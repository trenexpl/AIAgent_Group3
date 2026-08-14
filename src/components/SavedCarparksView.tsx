import React from 'react';
import { SavedCarparkItem, RecentSearchItem, Carpark } from '../types/carpark';
import { 
  Bookmark, 
  Trash2, 
  Navigation, 
  History, 
  Star, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Compass, 
  PlusCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';

interface SavedCarparksViewProps {
  savedCarparks: SavedCarparkItem[];
  recentSearches: RecentSearchItem[];
  onRemoveSaved: (carparkId: string) => void;
  onClearRecentSearches: () => void;
  onNavigateToCarpark: (carpark: Carpark) => void;
  onSearchDestination: (search: { name: string; latitude: number; longitude: number; address: string }) => void;
  onOpenSearchTab: () => void;
}

export const SavedCarparksView: React.FC<SavedCarparksViewProps> = ({
  savedCarparks,
  recentSearches,
  onRemoveSaved,
  onClearRecentSearches,
  onNavigateToCarpark,
  onSearchDestination,
  onOpenSearchTab,
}) => {
  // Match with real carpark objects for live data
  const getLiveCarpark = (id: string): Carpark | undefined => {
    return SINGAPORE_CARPARKS.find((cp) => cp.id === id);
  };

  return (
    <div id="saved-carparks-container" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Driver Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Saved &amp; Frequently Used Carparks
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            Quick 1-tap navigation and real-time lot availability for your regular parking destinations.
          </p>
        </div>

        <button
          onClick={onOpenSearchTab}
          className="py-3 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Find New Carparks</span>
        </button>
      </div>

      {/* Frequently Used / Saved Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-black text-slate-900">Your Saved Parking Spots</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {savedCarparks.length}
            </span>
          </div>
        </div>

        {savedCarparks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCarparks.map((item) => {
              const liveData = getLiveCarpark(item.carparkId);
              const total = liveData?.totalLots || 300;
              const avail = liveData?.availableLots || 120;
              const freePct = Math.round((avail / total) * 100);

              return (
                <div
                  key={item.id}
                  id={`saved-carpark-item-${item.carparkId}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {liveData?.agency || 'SG'} Carpark
                          </span>
                          {item.frequencyCount > 1 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Used {item.frequencyCount} times
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {item.carparkName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.address}</p>
                      </div>

                      <button
                        onClick={() => onRemoveSaved(item.carparkId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Live Availability Bar */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Live Availability</span>
                        <span className="font-bold text-slate-900">
                          {avail} / {total} lots ({freePct}% free)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            freePct > 40 ? 'bg-emerald-500' : freePct > 15 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, freePct))}%` }}
                        ></div>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic mt-2.5">"{item.notes}"</p>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-700">
                      Rate: <strong>${liveData?.rates.estimatedHourlyRate.toFixed(2) || '2.00'}</strong>/hr
                    </div>

                    <button
                      id={`btn-navigate-saved-${item.carparkId}`}
                      onClick={() => {
                        if (liveData) {
                          onNavigateToCarpark(liveData);
                        }
                      }}
                      className="py-2 px-4 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate Direct</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No saved carparks yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Save your frequent parking locations while browsing to check live lots and navigate in 1 click.
            </p>
          </div>
        )}
      </div>

      {/* Recent Searches Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-black text-slate-900">Recent Destination Searches</h2>
          </div>

          {recentSearches.length > 0 && (
            <button
              onClick={onClearRecentSearches}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {recentSearches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentSearches.map((rec) => (
              <div
                key={rec.id}
                onClick={() =>
                  onSearchDestination({
                    name: rec.destinationName,
                    address: rec.address,
                    latitude: rec.latitude,
                    longitude: rec.longitude,
                  })
                }
                className="p-3.5 bg-white hover:bg-sky-50/60 rounded-xl border border-slate-200 shadow-2xs hover:border-sky-300 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                      {rec.destinationName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{rec.address}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Your recent searches will appear here automatically.</p>
        )}
      </div>
    </div>
  );
};
