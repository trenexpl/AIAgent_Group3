import React from 'react';
import { Car, Navigation, Bookmark, Bell, HelpCircle, Database, Menu, X, MapPin, Search } from 'lucide-react';

interface HeaderProps {
  activeTab: 'search' | 'saved' | 'alerts' | 'how-it-works' | 'data-transparency';
  onSelectTab: (tab: 'search' | 'saved' | 'alerts' | 'how-it-works' | 'data-transparency') => void;
  savedCount: number;
  alertsCount: number;
  onQuickLocate?: () => void;
  onNewSearch?: () => void;
  isMapResultsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  alertsCount,
  onQuickLocate,
  onNewSearch,
  isMapResultsActive = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (tab: 'search' | 'saved' | 'alerts' | 'how-it-works' | 'data-transparency') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand: Header is "Get Parked", App Name is "What The Park" */}
          <div
            id="brand-logo-btn"
            onClick={() => {
              if (onNewSearch) {
                onNewSearch();
              } else {
                handleNav('search');
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-950">
                  Get <span className="text-sky-600">Parked</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse"></span>
                  LIVE SG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                what the park • driver companion
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-btn-search"
              onClick={() => {
                if (onNewSearch) {
                  onNewSearch();
                } else {
                  handleNav('search');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'search'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              {isMapResultsActive ? 'New Search' : 'Find Parking'}
            </button>

            <button
              id="nav-btn-saved"
              onClick={() => handleNav('saved')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'saved'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-sky-600 text-white rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-alerts"
              onClick={() => handleNav('alerts')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'alerts'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              Alerts
              {alertsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full">
                  {alertsCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-how-it-works"
              onClick={() => handleNav('how-it-works')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'how-it-works'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Rates Guide
            </button>

            <button
              id="nav-btn-data-sources"
              onClick={() => handleNav('data-transparency')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'data-transparency'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              LTA Data
            </button>
          </nav>

          {/* Right Action: Mobile-First Quick Actions */}
          <div className="flex items-center gap-2">
            {onQuickLocate && (
              <button
                id="btn-header-locate-near-me"
                onClick={onQuickLocate}
                className="py-2.5 px-3.5 sm:px-4 bg-slate-950 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Near Me</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1.5 shadow-xl animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              if (onNewSearch) {
                onNewSearch();
              } else {
                handleNav('search');
              }
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold ${
              activeTab === 'search' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-sky-600" />
              <span>{isMapResultsActive ? 'Search Another Destination' : 'Find Parking'}</span>
            </div>
            <span className="text-xs text-slate-400">Map View</span>
          </button>

          <button
            onClick={() => handleNav('saved')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold ${
              activeTab === 'saved' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-emerald-600" />
              <span>Saved Carparks</span>
            </div>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-black bg-sky-600 text-white rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('alerts')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold ${
              activeTab === 'alerts' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Occupancy Alerts</span>
            </div>
            {alertsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-black bg-amber-500 text-slate-900 rounded-full">
                {alertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('how-it-works')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold ${
              activeTab === 'how-it-works' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-slate-500" />
              <span>Rates &amp; Grace Period Guide</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('data-transparency')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold ${
              activeTab === 'data-transparency' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-teal-600" />
              <span>LTA &amp; URA Live Telemetry</span>
            </div>
          </button>
        </div>
      )}
    </header>
  );
};
