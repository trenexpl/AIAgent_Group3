export type Agency = 'HDB' | 'URA' | 'LTA' | 'Commercial' | 'Mall' | 'Hospital';

export type VehicleType = 'Car' | 'Motorcycle' | 'Heavy';

export type AvailabilityLevel = 'HIGH' | 'MODERATE' | 'LIMITED' | 'FULL';

export interface ParkingRateDetails {
  weekdayPeak: string; // e.g. "$1.20 / 30 mins (7am - 5pm)"
  weekdayOffPeak: string; // e.g. "$0.60 / 30 mins (5pm - 7am)"
  saturday: string;
  sundayPublicHoliday: string;
  estimatedHourlyRate: number; // For sorting and fast comparison ($/hr)
  gracePeriodMinutes: number; // e.g. 10 or 15 mins
  freeParkingInfo?: string; // e.g. "Free parking on Sundays & PH 7am-10:30pm"
  perEntryRate?: string; // e.g. "$3.50 per entry after 6pm"
}

export interface Carpark {
  id: string;
  code: string; // e.g. "ACB", "OR01", "HDB-TP1"
  name: string;
  address: string;
  area: string; // e.g. "Orchard", "Marina Bay", "Jurong East"
  latitude: number;
  longitude: number;
  agency: Agency;
  totalLots: number;
  availableLots: number;
  occupancyRate: number; // 0 - 100 percentage
  availabilityLevel: AvailabilityLevel;
  vehicleType: VehicleType;
  parkingSystem: 'Electronic Gantry (EPS)' | 'Coupon / App' | 'Automated Barrier';
  paymentMethods: string[]; // e.g. ["EZ-Link", "NETS FlashPay", "Credit Card", "Parking.sg"]
  rates: ParkingRateDetails;
  heightLimitMeters?: number; // e.g. 2.15
  features: {
    covered: boolean;
    evCharging: boolean;
    handicapLots: boolean;
    twentyFourHours: boolean;
    cctvSecurity: boolean;
    washingBay: boolean;
    motorcycleLots: boolean;
  };
  lastUpdated: string; // ISO or relative timestamp
  dataSource: string; // e.g. "LTA DataMall & URA Open Data"
  
  // Computed runtime fields relative to active search target
  distanceMeters?: number;
  walkingMinutes?: number;
  drivingMinutes?: number;
  recommendationScore?: number;
  recommendationBadge?: 'best_overall' | 'cheapest' | 'closest' | 'highest_availability';
  recommendationReason?: string;
}

export interface SearchDestination {
  id: string;
  name: string;
  category: 'Shopping' | 'Attraction' | 'Business / CBD' | 'Hospital' | 'Transport Hub' | 'Residential / Hub' | 'Dining / Food Centre';
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  popularSearches?: number;
}

export interface AlertSetting {
  id: string;
  carparkId: string;
  carparkName: string;
  thresholdPercent: number; // e.g. 80 for 80% occupancy
  triggerWhen: 'above_occupancy' | 'below_lots';
  thresholdLots?: number;
  active: boolean;
  createdAt: string;
  lastNotified?: string;
  soundEnabled: boolean;
}

export interface FilterOptions {
  agency: string; // 'all' or specific agency
  maxPricePerHour: number; // e.g. 10 (no limit) or 2, 4
  maxDistanceMeters: number; // e.g. 500, 1000, 2000, 5000
  minAvailableLots: number; // 0, 10, 30, 50
  availabilityStatus: string; // 'all', 'high', 'moderate'
  coveredOnly: boolean;
  evChargingOnly: boolean;
  handicapOnly: boolean;
  twentyFourHoursOnly: boolean;
  vehicleType: VehicleType;
  sortBy: 'recommended' | 'distance' | 'price' | 'availability' | 'lots';
}

export interface SavedCarparkItem {
  id: string;
  carparkId: string;
  carparkName: string;
  address: string;
  savedAt: string;
  frequencyCount: number;
  notes?: string;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  destinationName: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
