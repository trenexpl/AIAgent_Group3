import React, { useState, useEffect, useMemo } from 'react';
import { 
  Carpark, 
  SearchDestination, 
  SavedCarparkItem, 
  RecentSearchItem, 
  AlertSetting, 
  FilterOptions 
} from './types/carpark';
import { SINGAPORE_DESTINATIONS } from './data/singaporeDestinations';
import { SINGAPORE_CARPARKS } from './data/singaporeCarparks';
import { 
  getCarparksNearDestination, 
  filterAndSortCarparks, 
  formatDistance 
} from './services/parkingService';
import { storageService } from './services/storageService';

// Subcomponents
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { InteractiveMap } from './components/InteractiveMap';
import { CarparkCard } from './components/CarparkCard';
import { RecommendedBanner } from './components/RecommendedBanner';
import { CarparkComparison } from './components/CarparkComparison';
import { CarparkDetailsModal } from './components/CarparkDetailsModal';
import { AvailabilityAlertModal } from './components/AvailabilityAlertModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SavedCarparksView } from './components/SavedCarparksView';
import { AlertsManagerView } from './components/AlertsManagerView';
import { HowItWorksModal } from './components/HowItWorksModal';
import { DataTransparencyModal } from './components/DataTransparencyModal';
import { FiltersBar } from './components/FiltersBar';

// Icons
import { 
  Map, 
  List, 
  GitCompare, 
  Sparkles, 
  Navigation, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Layers, 
  ShieldAlert, 
  Info,
  Car,
  Search,
  ArrowLeft,
  DollarSign,
  MapPin,
  Compass,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const INITIAL_FILTERS: FilterOptions = {
  agency: 'all',
  maxPricePerHour: 10,
  maxDistanceMeters: 5000,
  minAvailableLots: 0,
  availabilityStatus: 'all',
  coveredOnly: false,
  evChargingOnly: false,
  handicapOnly: false,
  twentyFourHoursOnly: false,
  vehicleType: 'Car',
  sortBy: 'recommended',
};

export default function App() {
  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState<
    'search' | 'saved' | 'alerts' | 'how-it-works' | 'data-transparency'
  >('search');

  // Search Flow State: false = Simple Driver Search Hub; true = Available Carparks Map Page
  const [isMapPage, setIsMapPage] = useState<boolean>(false);

  // Search destination state (defaults to ION Orchard Singapore)
  const [activeDestination, setActiveDestination] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }>(SINGAPORE_DESTINATIONS[0]);

  // Carpark data pool with live simulated fluctuations
  const [carparkPool, setCarparkPool] = useState<Carpark[]>(SINGAPORE_CARPARKS);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');
  const [isRefreshingData, setIsRefreshingData] = useState<boolean>(false);

  // Selected carpark for map pan / focus
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);

  // Modals & Drawers state
  const [detailsCarpark, setDetailsCarpark] = useState<Carpark | null>(null);
  const [alertCarpark, setAlertCarpark] = useState<Carpark | null>(null);
  const [navigatingCarpark, setNavigatingCarpark] = useState<Carpark | null>(null);
  const [comparedCarparks, setComparedCarparks] = useState<Carpark[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Driver storage state
  const [savedCarparks, setSavedCarparks] = useState<SavedCarparkItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);

  // Filters & Sorting state
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);

  // View Mode in Map Page: 'map' (default) or 'list'
  const [mapPageViewMode, setMapPageViewMode] = useState<'map' | 'list'>('map');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [alertNotificationBanner, setAlertNotificationBanner] = useState<string | null>(null);

  // Load initial persistent storage
  useEffect(() => {
    setSavedCarparks(storageService.getSavedCarparks());
    setRecentSearches(storageService.getRecentSearches());
    setAlerts(storageService.getAlerts());
  }, []);

  // Compute carparks near destination
  const nearbyCarparks = useMemo(() => {
    return getCarparksNearDestination(
      activeDestination.latitude,
      activeDestination.longitude,
      carparkPool,
      4000
    );
  }, [activeDestination, carparkPool]);

  // Apply driver filters & sort
  const filteredCarparks = useMemo(() => {
    return filterAndSortCarparks(nearbyCarparks, filters);
  }, [nearbyCarparks, filters]);

  // Identify algorithm recommended carpark
  const recommendedCarpark = useMemo(() => {
    return (
      filteredCarparks.find((cp) => cp.recommendationBadge === 'best_overall') ||
      filteredCarparks[0] ||
      null
    );
  }, [filteredCarparks]);

  // Periodic simulated live occupancy update (simulates live LTA/URA telemetry feed updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setCarparkPool((prevPool) => {
        return prevPool.map((cp) => {
          const lotDelta = Math.floor(Math.random() * 7) - 3;
          const newAvail = Math.max(0, Math.min(cp.totalLots, cp.availableLots + lotDelta));
          const newOccupancy = Math.round(((cp.totalLots - newAvail) / cp.totalLots) * 100);

          const matchedAlert = alerts.find((a) => a.carparkId === cp.id && a.active);
          if (matchedAlert) {
            if (
              (matchedAlert.triggerWhen === 'above_occupancy' && newOccupancy >= matchedAlert.thresholdPercent) ||
              (matchedAlert.triggerWhen === 'below_lots' && newAvail <= (matchedAlert.thresholdLots || 20))
            ) {
              setAlertNotificationBanner(
                `🚨 Alert: ${cp.name} is now ${newOccupancy}% occupied (${newAvail} lots left)!`
              );
            }
          }

          return {
            ...cp,
            availableLots: newAvail,
            occupancyRate: newOccupancy,
            lastUpdated: 'Just now',
          };
        });
      });
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 28000);

    return () => clearInterval(interval);
  }, [alerts]);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    setIsRefreshingData(true);
    setTimeout(() => {
      setCarparkPool((prev) => [...prev]);
      setLastRefreshedTime('Just now');
      setIsRefreshingData(false);
    }, 400);
  };

  // Search Destination handler -> Immediately goes to Map Page with available carparks & rates!
  const handleSelectDestination = (
    dest: SearchDestination | { name: string; latitude: number; longitude: number; address: string }
  ) => {
    setActiveDestination({
      name: dest.name,
      address: dest.address,
      latitude: dest.latitude,
      longitude: dest.longitude,
    });
    setSelectedCarpark(null);
    setActiveTab('search');
    setIsMapPage(true); // Navigate to dedicated map view!

    storageService.addRecentSearch(
      dest.name,
      dest.name,
      dest.address,
      dest.latitude,
      dest.longitude
    );
    setRecentSearches(storageService.getRecentSearches());
  };

  // Use Current Geolocation
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setIsLoadingLocation(false);
          handleSelectDestination({
            name: 'Current Location',
            address: 'Singapore (GPS Location)',
            latitude: lat,
            longitude: lng,
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          handleSelectDestination(SINGAPORE_DESTINATIONS[0]);
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setIsLoadingLocation(false);
      handleSelectDestination(SINGAPORE_DESTINATIONS[0]);
    }
  };

  // Toggle Save Carpark
  const handleToggleSave = (cp: Carpark) => {
    storageService.toggleSaveCarpark(cp);
    setSavedCarparks(storageService.getSavedCarparks());
  };

  // Toggle Compare Carpark
  const handleToggleCompare = (cp: Carpark) => {
    setComparedCarparks((prev) => {
      const exists = prev.some((item) => item.id === cp.id);
      if (exists) {
        return prev.filter((item) => item.id !== cp.id);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, cp];
      }
    });
  };

  // Handle Save Alert
  const handleSaveAlert = (alertData: Omit<AlertSetting, 'id' | 'createdAt'>) => {
    storageService.saveAlert(alertData);
    setAlerts(storageService.getAlerts());
  };

  // Handle Remove Alert
  const handleRemoveAlert = (carparkId: string) => {
    storageService.removeAlert(carparkId);
    setAlerts(storageService.getAlerts());
  };

  // Handle Navigate to Carpark
  const handleNavigate = (cp: Carpark) => {
    storageService.recordNavigationUsage(cp.id);
    setNavigatingCarpark(cp);
  };

  // Return to Search Hub
  const handleBackToSearchHub = () => {
    setIsMapPage(false);
    setSelectedCarpark(null);
  };

  return (
    <div id="what-the-park-app" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header with "Get Parked" branding */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'search') {
            // keep current map page or allow user to browse
          }
        }}
        savedCount={savedCarparks.length}
        alertsCount={alerts.length}
        onQuickLocate={handleUseCurrentLocation}
        onNewSearch={handleBackToSearchHub}
        isMapResultsActive={isMapPage && activeTab === 'search'}
      />

      {/* Alert Notification Toast Banner if triggered */}
      {alertNotificationBanner && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-md flex items-center justify-between text-xs sm:text-sm font-black z-40 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 text-slate-950 shrink-0" />
            <span>{alertNotificationBanner}</span>
            <button
              onClick={() => setAlertNotificationBanner(null)}
              className="ml-auto p-1.5 text-slate-950 hover:bg-amber-600/30 rounded-lg text-xs font-black"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main App Content Body */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'search' && (
          <>
            {/* VIEW 1: Simple Driver Search Hub (When not yet viewing map results) */}
            {!isMapPage ? (
              <div className="flex-1 flex flex-col justify-start">
                <HeroSearch
                  onSearch={handleSelectDestination}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  savedCarparks={savedCarparks}
                  recentSearches={recentSearches}
                  onSelectSavedCarpark={(cpId) => {
                    const found = carparkPool.find((c) => c.id === cpId);
                    if (found) {
                      setSelectedCarpark(found);
                      setDetailsCarpark(found);
                      setIsMapPage(true);
                    }
                  }}
                  isLoadingLocation={isLoadingLocation}
                />

                {/* Quick Driver Tips / Live Availability Counter */}
                <div className="max-w-4xl mx-auto px-4 py-6 text-center">
                  <div className="inline-flex items-center gap-3 bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-200 text-xs sm:text-sm font-bold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Monitoring <strong>{SINGAPORE_CARPARKS.length}+ Singapore Carparks</strong> with live rates &amp; available lots</span>
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW 2: Available Carparks with Rates in Map Format */
              <div id="map-results-page" className="flex-1 flex flex-col bg-slate-100">
                {/* Driver Top Control Header Bar */}
                <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shadow-xs">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Destination Info & Change Search Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBackToSearchHub}
                        id="btn-back-to-search"
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Change</span>
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black uppercase text-slate-400">Showing carparks near:</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black">
                            {filteredCarparks.length} Available
                          </span>
                        </div>
                        <h2 className="text-base sm:text-xl font-black text-slate-950 truncate mt-0.5">
                          {activeDestination.name}
                        </h2>
                      </div>
                    </div>

                    {/* Right: Driver Action Controls & View Switcher */}
                    <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                      {/* Live refresh feed trigger */}
                      <button
                        onClick={handleManualRefresh}
                        title="Refresh live carpark availability"
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingData ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{lastRefreshedTime}</span>
                        <span className="sm:hidden">Refresh</span>
                      </button>

                      {/* Compare drawer trigger */}
                      {comparedCarparks.length > 0 && (
                        <button
                          onClick={() => setIsCompareModalOpen(true)}
                          className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <GitCompare className="w-4 h-4" />
                          <span>Compare ({comparedCarparks.length})</span>
                        </button>
                      )}

                      {/* Map / List View Toggle */}
                      <div className="inline-flex p-1 bg-slate-200 rounded-xl text-xs font-extrabold">
                        <button
                          onClick={() => setMapPageViewMode('map')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            mapPageViewMode === 'map'
                              ? 'bg-white text-slate-950 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Map className="w-4 h-4" />
                          <span>Map</span>
                        </button>
                        <button
                          onClick={() => setMapPageViewMode('list')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            mapPageViewMode === 'list'
                              ? 'bg-white text-slate-950 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <List className="w-4 h-4" />
                          <span>List</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Driver Quick Filter Pills Bar */}
                  <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-slate-400 font-black text-[10px] uppercase shrink-0">Quick Filter:</span>
                    
                    {/* All */}
                    <button
                      onClick={() => setFilters(INITIAL_FILTERS)}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.sortBy === 'recommended' && filters.maxPricePerHour === 10 && !filters.coveredOnly
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ★ Best Value
                    </button>

                    {/* Cheapest */}
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'price', maxPricePerHour: 10 })}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.sortBy === 'price'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      💰 Lowest Rate
                    </button>

                    {/* Nearest */}
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'distance' })}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.sortBy === 'distance'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📍 Nearest
                    </button>

                    {/* Most Lots */}
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'lots', minAvailableLots: 20 })}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.sortBy === 'lots'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🅿️ Most Free Lots
                    </button>

                    {/* Covered */}
                    <button
                      onClick={() => setFilters({ ...filters, coveredOnly: !filters.coveredOnly })}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.coveredOnly
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ☂️ Sheltered / Covered
                    </button>

                    {/* EV Charging */}
                    <button
                      onClick={() => setFilters({ ...filters, evChargingOnly: !filters.evChargingOnly })}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap border transition-all ${
                        filters.evChargingOnly
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ⚡ EV Fast Charge
                    </button>
                  </div>
                </div>

                {/* Map Format Container */}
                <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
                  {mapPageViewMode === 'map' ? (
                    <div className="flex-1 w-full min-h-[500px] flex flex-col">
                      <InteractiveMap
                        carparks={filteredCarparks}
                        selectedCarpark={selectedCarpark}
                        onSelectCarpark={(cp) => {
                          setSelectedCarpark(cp);
                        }}
                        destination={activeDestination}
                        onNavigate={handleNavigate}
                        onCompareToggle={handleToggleCompare}
                        comparedCarparkIds={comparedCarparks.map((c) => c.id)}
                        onOpenDetails={(cp) => setDetailsCarpark(cp)}
                      />
                    </div>
                  ) : (
                    /* High-Density Carpark List View */
                    <div className="space-y-4 max-w-3xl mx-auto w-full py-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                        <span>{filteredCarparks.length} Carparks Sorted by {filters.sortBy}</span>
                        <button
                          onClick={() => setMapPageViewMode('map')}
                          className="text-sky-600 font-extrabold hover:underline flex items-center gap-1"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>Switch to Map Format</span>
                        </button>
                      </div>

                      {filteredCarparks.map((cp) => (
                        <CarparkCard
                          key={cp.id}
                          carpark={cp}
                          isSelected={selectedCarpark?.id === cp.id}
                          isSaved={savedCarparks.some((s) => s.carparkId === cp.id)}
                          isCompared={comparedCarparks.some((c) => c.id === cp.id)}
                          hasAlert={alerts.some((a) => a.carparkId === cp.id)}
                          onSelect={() => {
                            setSelectedCarpark(cp);
                            setMapPageViewMode('map');
                          }}
                          onNavigate={() => handleNavigate(cp)}
                          onToggleSave={() => handleToggleSave(cp)}
                          onToggleCompare={() => handleToggleCompare(cp)}
                          onOpenAlert={() => setAlertCarpark(cp)}
                          onOpenDetails={() => setDetailsCarpark(cp)}
                          isCompareDisabled={
                            comparedCarparks.length >= 3 &&
                            !comparedCarparks.some((c) => c.id === cp.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* SAVED CARPARKS TAB */}
        {activeTab === 'saved' && (
          <SavedCarparksView
            savedItems={savedCarparks}
            allCarparks={carparkPool}
            onSelectCarpark={(cp) => {
              setSelectedCarpark(cp);
              setActiveTab('search');
              setIsMapPage(true);
            }}
            onRemoveSaved={(carparkId) => {
              const cp = carparkPool.find((c) => c.id === carparkId);
              if (cp) handleToggleSave(cp);
            }}
            onNavigate={handleNavigate}
            onOpenAlert={(cp) => setAlertCarpark(cp)}
          />
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <AlertsManagerView
            alerts={alerts}
            allCarparks={carparkPool}
            onRemoveAlert={handleRemoveAlert}
            onOpenCreateAlert={(cp) => setAlertCarpark(cp)}
            onViewOnMap={(cp) => {
              setSelectedCarpark(cp);
              setActiveTab('search');
              setIsMapPage(true);
            }}
          />
        )}

        {/* HOW IT WORKS / RATES GUIDE TAB */}
        {activeTab === 'how-it-works' && (
          <HowItWorksModal
            isOpen={true}
            onClose={() => setActiveTab('search')}
          />
        )}

        {/* DATA TRANSPARENCY TAB */}
        {activeTab === 'data-transparency' && (
          <DataTransparencyModal
            isOpen={true}
            onClose={() => setActiveTab('search')}
            lastRefreshed={lastRefreshedTime}
          />
        )}
      </main>

      {/* MODALS & DRAWERS */}
      {/* 1. Turn-by-Turn Navigation Launch Drawer */}
      {navigatingCarpark && (
        <NavigationDrawer
          carpark={navigatingCarpark}
          destinationName={activeDestination.name}
          onClose={() => setNavigatingCarpark(null)}
          isSaved={savedCarparks.some((s) => s.carparkId === navigatingCarpark.id)}
          onToggleSave={handleToggleSave}
          onOpenAlert={(cp) => {
            setNavigatingCarpark(null);
            setAlertCarpark(cp);
          }}
          onRecordUsage={(id) => storageService.recordNavigationUsage(id)}
        />
      )}

      {/* 2. Detailed Rates & Rules Modal */}
      {detailsCarpark && (
        <CarparkDetailsModal
          carpark={detailsCarpark}
          onClose={() => setDetailsCarpark(null)}
          onNavigate={(cp) => {
            setDetailsCarpark(null);
            handleNavigate(cp);
          }}
          isSaved={savedCarparks.some((s) => s.carparkId === detailsCarpark.id)}
          onToggleSave={handleToggleSave}
          onOpenAlert={(cp) => {
            setDetailsCarpark(null);
            setAlertCarpark(cp);
          }}
        />
      )}

      {/* 3. Availability Alert Setting Modal */}
      {alertCarpark && (
        <AvailabilityAlertModal
          carpark={alertCarpark}
          onClose={() => setAlertCarpark(null)}
          onSaveAlert={handleSaveAlert}
          existingAlert={alerts.find((a) => a.carparkId === alertCarpark.id)}
        />
      )}

      {/* 4. Side-by-Side Carpark Comparison Modal */}
      {isCompareModalOpen && (
        <CarparkComparison
          comparedCarparks={comparedCarparks}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={(cpId) =>
            setComparedCarparks((prev) => prev.filter((c) => c.id !== cpId))
          }
          onNavigate={(cp) => {
            setIsCompareModalOpen(false);
            handleNavigate(cp);
          }}
          onViewDetails={(cp) => {
            setIsCompareModalOpen(false);
            setDetailsCarpark(cp);
          }}
        />
      )}
    </div>
  );
}
