import { SavedCarparkItem, RecentSearchItem, AlertSetting, Carpark } from '../types/carpark';

const SAVED_CARPARKS_KEY = 'parksg_saved_carparks_v1';
const FREQUENT_CARPARKS_KEY = 'parksg_frequent_carparks_v1';
const RECENT_SEARCHES_KEY = 'parksg_recent_searches_v1';
const ALERTS_KEY = 'parksg_alerts_v1';

// Initial starter frequent/saved carparks for Singapore drivers
const DEFAULT_SAVED_CARPARKS: SavedCarparkItem[] = [
  {
    id: 'fav-1',
    carparkId: 'cp-orchard-angullia-ura',
    carparkName: 'Angullia Park Open Carpark (URA)',
    address: 'Angullia Park (off Orchard Blvd), Singapore 239973',
    savedAt: new Date().toISOString(),
    frequencyCount: 12,
    notes: 'Cheapest open-air parking near ION Orchard & Wisma Atria',
  },
  {
    id: 'fav-2',
    carparkId: 'cp-mb-suntec',
    carparkName: 'Suntec City Carpark (Basement 1)',
    address: '3 Temasek Boulevard, Singapore 038983',
    savedAt: new Date().toISOString(),
    frequencyCount: 9,
    notes: 'Near Tower 3 / Yellow Zone, $3.30 per entry after 5pm',
  },
  {
    id: 'fav-3',
    carparkId: 'cp-jurong-imm',
    carparkName: 'IMM Outlet Mall Carpark',
    address: '2 Jurong East Street 21, Singapore 609601',
    savedAt: new Date().toISOString(),
    frequencyCount: 7,
    notes: '1st hour FREE on weekdays!',
  },
];

const DEFAULT_RECENT_SEARCHES: RecentSearchItem[] = [
  {
    id: 'rec-1',
    query: 'ION Orchard',
    destinationName: 'ION Orchard',
    address: '2 Orchard Turn, Singapore 238801',
    latitude: 1.3040,
    longitude: 103.8318,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'rec-2',
    query: 'Marina Bay Sands',
    destinationName: 'Marina Bay Sands & Shoppes',
    address: '10 Bayfront Avenue, Singapore 018956',
    latitude: 1.2834,
    longitude: 103.8607,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'rec-3',
    query: 'Bugis Junction',
    destinationName: 'Bugis Junction & Bugis+',
    address: '200 Victoria Street, Singapore 188021',
    latitude: 1.3000,
    longitude: 103.8553,
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
  },
];

export const storageService = {
  // Saved Carparks
  getSavedCarparks(): SavedCarparkItem[] {
    try {
      const stored = localStorage.getItem(SAVED_CARPARKS_KEY);
      if (!stored) {
        localStorage.setItem(SAVED_CARPARKS_KEY, JSON.stringify(DEFAULT_SAVED_CARPARKS));
        return DEFAULT_SAVED_CARPARKS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SAVED_CARPARKS;
    }
  },

  isCarparkSaved(carparkId: string): boolean {
    const saved = this.getSavedCarparks();
    return saved.some((s) => s.carparkId === carparkId);
  },

  toggleSaveCarpark(carpark: Carpark, notes?: string): boolean {
    const saved = this.getSavedCarparks();
    const existingIndex = saved.findIndex((s) => s.carparkId === carpark.id);

    if (existingIndex >= 0) {
      // Remove
      const filtered = saved.filter((s) => s.carparkId !== carpark.id);
      localStorage.setItem(SAVED_CARPARKS_KEY, JSON.stringify(filtered));
      return false;
    } else {
      // Add
      const newItem: SavedCarparkItem = {
        id: `saved-${Date.now()}`,
        carparkId: carpark.id,
        carparkName: carpark.name,
        address: carpark.address,
        savedAt: new Date().toISOString(),
        frequencyCount: 1,
        notes: notes || `Saved for quick access in ${carpark.area}`,
      };
      saved.unshift(newItem);
      localStorage.setItem(SAVED_CARPARKS_KEY, JSON.stringify(saved));
      return true;
    }
  },

  removeSavedCarpark(carparkId: string) {
    const saved = this.getSavedCarparks();
    const filtered = saved.filter((s) => s.carparkId !== carparkId);
    localStorage.setItem(SAVED_CARPARKS_KEY, JSON.stringify(filtered));
  },

  recordNavigationUsage(carparkId: string) {
    const saved = this.getSavedCarparks();
    const item = saved.find((s) => s.carparkId === carparkId);
    if (item) {
      item.frequencyCount = (item.frequencyCount || 0) + 1;
      localStorage.setItem(SAVED_CARPARKS_KEY, JSON.stringify(saved));
    }
  },

  // Recent Searches
  getRecentSearches(): RecentSearchItem[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(DEFAULT_RECENT_SEARCHES));
        return DEFAULT_RECENT_SEARCHES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RECENT_SEARCHES;
    }
  },

  addRecentSearch(query: string, destName: string, address: string, lat: number, lng: number) {
    const searches = this.getRecentSearches().filter((s) => s.destinationName.toLowerCase() !== destName.toLowerCase());
    const newItem: RecentSearchItem = {
      id: `search-${Date.now()}`,
      query,
      destinationName: destName,
      address,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
    };
    searches.unshift(newItem);
    // Keep max 8 recent searches
    const trimmed = searches.slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  },

  clearRecentSearches() {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([]));
  },

  // Alerts
  getAlerts(): AlertSetting[] {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveAlert(alert: Omit<AlertSetting, 'id' | 'createdAt'>): AlertSetting {
    const alerts = this.getAlerts();
    const existingIndex = alerts.findIndex((a) => a.carparkId === alert.carparkId);
    
    const newAlert: AlertSetting = {
      ...alert,
      id: existingIndex >= 0 ? alerts[existingIndex].id : `alert-${Date.now()}`,
      createdAt: existingIndex >= 0 ? alerts[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      alerts[existingIndex] = newAlert;
    } else {
      alerts.push(newAlert);
    }

    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    return newAlert;
  },

  removeAlert(carparkId: string) {
    const alerts = this.getAlerts().filter((a) => a.carparkId !== carparkId);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  },

  getAlertForCarpark(carparkId: string): AlertSetting | undefined {
    return this.getAlerts().find((a) => a.carparkId === carparkId);
  },
};
