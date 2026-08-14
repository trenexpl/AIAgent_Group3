import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Normalize LTA AccountKey (ensure base64 padding if needed)
function getLtaAccountKey(): string {
  const rawKey = process.env.LTA_DATAMALL_API_KEY || process.env.LTA_DATAMALL_KEY || 'VmEfRwiOSMa7rOE3fVhM3w';
  let key = rawKey.trim();
  // Strip trailing colon if present
  if (key.endsWith(':')) {
    key = key.slice(0, -1);
  }
  // Ensure base64 padding
  while (key.length % 4 !== 0) {
    key += '=';
  }
  return key;
}

interface RawLtaCarpark {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "lat lng" e.g. "1.29375 103.85718"
  AvailableLots: number;
  LotType: string; // "C" (Car), "H" (Heavy), "Y" (Motorcycle)
  Agency: string; // "HDB", "LTA", "URA"
}

interface ProcessedCarpark {
  id: string;
  code: string;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  agency: 'HDB' | 'URA' | 'LTA' | 'Commercial' | 'Mall' | 'Hospital';
  totalLots: number;
  availableLots: number;
  occupancyRate: number;
  availabilityLevel: 'HIGH' | 'MODERATE' | 'LIMITED' | 'FULL';
  vehicleType: 'Car' | 'Motorcycle' | 'Heavy';
  parkingSystem: 'Electronic Gantry (EPS)' | 'Coupon / App' | 'Automated Barrier';
  paymentMethods: string[];
  rates: {
    weekdayPeak: string;
    weekdayOffPeak: string;
    saturday: string;
    sundayPublicHoliday: string;
    estimatedHourlyRate: number;
    gracePeriodMinutes: number;
    freeParkingInfo?: string;
  };
  features: {
    covered: boolean;
    evCharging: boolean;
    handicapLots: boolean;
    twentyFourHours: boolean;
    cctvSecurity: boolean;
    washingBay: boolean;
    motorcycleLots: boolean;
  };
  heightLimitMeters?: number;
  lastUpdated: string;
  dataSource: string;
  distanceMeters?: number;
}

// In-Memory Cache for LTA DataMall
interface CacheData {
  timestamp: number;
  raw: RawLtaCarpark[];
  processed: ProcessedCarpark[];
  lastFetchedStr: string;
}

let cache: CacheData = {
  timestamp: 0,
  raw: [],
  processed: [],
  lastFetchedStr: 'Not yet synchronized',
};

// Calculate Haversine distance in meters
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Estimate rate based on agency, development name & area
function estimateCarparkRates(agency: string, devName: string, area: string) {
  const lowerName = devName.toLowerCase();
  const lowerArea = area.toLowerCase();

  const isCentral =
    lowerArea.includes('marina') ||
    lowerArea.includes('orchard') ||
    lowerArea.includes('cbd') ||
    lowerArea.includes('bugis') ||
    lowerArea.includes('chinatown') ||
    lowerName.includes('orchard') ||
    lowerName.includes('raffles') ||
    lowerName.includes('marina') ||
    lowerName.includes('suntec');

  if (agency === 'HDB') {
    const hourly = isCentral ? 2.4 : 1.2;
    return {
      weekdayPeak: isCentral ? '$1.20 / 30 mins (7am-5pm)' : '$0.60 / 30 mins (7am-5pm)',
      weekdayOffPeak: '$0.60 / 30 mins (5pm-7am, capped at $5)',
      saturday: isCentral ? '$1.20 / 30 mins' : '$0.60 / 30 mins',
      sundayPublicHoliday: 'Free (7:30am - 10:30pm selected lots) / $0.60 per 30 mins',
      estimatedHourlyRate: hourly,
      gracePeriodMinutes: 15,
      freeParkingInfo: 'Free parking on Sundays & Public Holidays (7:30am - 10:30pm)',
    };
  } else if (agency === 'URA') {
    const hourly = isCentral ? 2.4 : 1.2;
    return {
      weekdayPeak: isCentral ? '$1.20 / 30 mins' : '$0.60 / 30 mins',
      weekdayOffPeak: '$0.60 / 30 mins (Off-peak rates applied)',
      saturday: isCentral ? '$1.20 / 30 mins' : '$0.60 / 30 mins',
      sundayPublicHoliday: '$0.60 / 30 mins',
      estimatedHourlyRate: hourly,
      gracePeriodMinutes: 15,
    };
  } else {
    // LTA / Commercial shopping centers
    let hourly = 2.8;
    if (lowerName.includes('orchard') || lowerName.includes('paragon') || lowerName.includes('ion') || lowerName.includes('takashimaya')) {
      hourly = 4.2;
    } else if (lowerName.includes('marina') || lowerName.includes('suntec') || lowerName.includes('esplanade')) {
      hourly = 3.6;
    } else if (lowerName.includes('vivo') || lowerName.includes('bugis')) {
      hourly = 3.2;
    } else if (lowerName.includes('changi') || lowerName.includes('airport')) {
      hourly = 2.6;
    }

    return {
      weekdayPeak: `$${(hourly / 2).toFixed(2)} / 30 mins (1st hr $${hourly.toFixed(2)})`,
      weekdayOffPeak: `$${(hourly * 0.8 / 2).toFixed(2)} / 30 mins`,
      saturday: `$${(hourly * 0.9 / 2).toFixed(2)} / 30 mins`,
      sundayPublicHoliday: `$${(hourly * 0.85 / 2).toFixed(2)} / 30 mins`,
      estimatedHourlyRate: hourly,
      gracePeriodMinutes: 10,
    };
  }
}

// Fetch all pages from LTA DataMall
async function fetchAllLtaCarparkAvailability(): Promise<RawLtaCarpark[]> {
  const accountKey = getLtaAccountKey();
  const allCarparks: RawLtaCarpark[] = [];
  let skip = 0;
  const maxPages = 10; // 500 per page = up to 5000 records

  for (let page = 0; page < maxPages; page++) {
    const url = `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2?$skip=${skip}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`LTA DataMall responded with HTTP ${response.status} at skip=${skip}`);
        break;
      }

      const data = (await response.json()) as { value?: RawLtaCarpark[] };
      if (!data.value || data.value.length === 0) {
        break;
      }

      allCarparks.push(...data.value);

      if (data.value.length < 500) {
        break;
      }
      skip += 500;
    } catch (err) {
      console.error(`Error fetching LTA DataMall at skip=${skip}:`, err);
      break;
    }
  }

  return allCarparks;
}

// Process raw LTA items into structured carparks
function processLtaCarparks(rawItems: RawLtaCarpark[]): ProcessedCarpark[] {
  const processed: ProcessedCarpark[] = [];

  for (const item of rawItems) {
    if (!item.Location) continue;
    const parts = item.Location.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng) || lat <= 0 || lng <= 0) continue;

    const availLots = item.AvailableLots ?? 0;
    // Estimate total capacity based on available lots and typical ratio
    const estimatedTotal = availLots > 0 ? Math.max(availLots + 30, Math.round(availLots * 1.5)) : 100;
    const occupancyRate = Math.min(100, Math.max(0, Math.round(((estimatedTotal - availLots) / estimatedTotal) * 100)));

    let availabilityLevel: 'HIGH' | 'MODERATE' | 'LIMITED' | 'FULL' = 'HIGH';
    if (availLots === 0 || occupancyRate >= 95 || availLots < 8) {
      availabilityLevel = 'FULL';
    } else if (availLots < 25 || occupancyRate >= 80) {
      availabilityLevel = 'LIMITED';
    } else if (availLots < 75 || occupancyRate >= 55) {
      availabilityLevel = 'MODERATE';
    }

    const vehicleType: 'Car' | 'Motorcycle' | 'Heavy' =
      item.LotType === 'Y' ? 'Motorcycle' : item.LotType === 'H' ? 'Heavy' : 'Car';

    const agency: 'HDB' | 'URA' | 'LTA' | 'Commercial' =
      item.Agency === 'HDB' ? 'HDB' : item.Agency === 'URA' ? 'URA' : item.Agency === 'LTA' ? 'LTA' : 'Commercial';

    const rates = estimateCarparkRates(agency, item.Development || '', item.Area || '');

    const name = item.Development
      ? item.Development
      : `${agency} Carpark ${item.CarParkID} (${item.Area || 'Singapore'})`;

    const address = `${name}, ${item.Area ? item.Area + ', ' : ''}Singapore`;

    const isCovered =
      name.toLowerCase().includes('mscp') ||
      name.toLowerCase().includes('basement') ||
      name.toLowerCase().includes('mall') ||
      name.toLowerCase().includes('center') ||
      name.toLowerCase().includes('plaza') ||
      name.toLowerCase().includes('square') ||
      item.Agency === 'LTA';

    const hasEv =
      isCovered ||
      name.toLowerCase().includes('mall') ||
      name.toLowerCase().includes('hub') ||
      item.Agency === 'LTA' ||
      availLots > 200;

    processed.push({
      id: `lta-${item.Agency || 'SG'}-${item.CarParkID}`,
      code: item.CarParkID,
      name,
      address,
      area: item.Area || 'Singapore',
      latitude: lat,
      longitude: lng,
      totalLots: estimatedTotal,
      availableLots: availLots,
      occupancyRate,
      availabilityLevel,
      vehicleType,
      agency,
      parkingSystem: 'Electronic Gantry (EPS)',
      paymentMethods: ['EZ-Link', 'NETS FlashPay', 'Credit Card', 'Parking.sg'],
      rates,
      features: {
        covered: isCovered,
        evCharging: hasEv,
        handicapLots: true,
        twentyFourHours: true,
        cctvSecurity: true,
        washingBay: agency === 'HDB',
        motorcycleLots: true,
      },
      heightLimitMeters: isCovered ? 2.1 : undefined,
      lastUpdated: 'Just now',
      dataSource: `Singapore DataMall (${agency})`,
    });
  }

  return processed;
}

// Get or Refresh Cache (30s TTL)
async function getCachedCarparks(forceRefresh = false): Promise<CacheData> {
  const now = Date.now();
  const CACHE_TTL_MS = 35 * 1000; // 35 seconds

  if (!forceRefresh && cache.processed.length > 0 && now - cache.timestamp < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const raw = await fetchAllLtaCarparkAvailability();
    if (raw.length > 0) {
      const processed = processLtaCarparks(raw);
      const timeStr = new Date().toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      cache = {
        timestamp: now,
        raw,
        processed,
        lastFetchedStr: timeStr,
      };
      console.log(`[LTA Backend] Successfully refreshed ${processed.length} carparks at ${timeStr}`);
    }
  } catch (e) {
    console.error('[LTA Backend] Failed to refresh live cache:', e);
  }

  return cache;
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'What The Park - Live LTA/URA/HDB API Backend',
    cachedCarparksCount: cache.processed.length,
    lastUpdated: cache.lastFetchedStr,
  });
});

// Live Carparks List (supports radius / coords query)
app.get('/api/carparks/live', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 5000; // default 5km

    const cacheData = await getCachedCarparks(force);
    let results = cacheData.processed;

    // Filter by coordinates if provided
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      results = results
        .map((cp) => {
          const dist = haversineDistance(lat, lng, cp.latitude, cp.longitude);
          return { ...cp, distanceMeters: dist };
        })
        .filter((cp) => (cp.distanceMeters ?? 99999) <= radius)
        .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    }

    res.json({
      success: true,
      total: results.length,
      lastUpdated: cacheData.lastFetchedStr,
      carparks: results,
    });
  } catch (error: any) {
    console.error('/api/carparks/live error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Fast Availability Map: ID to AvailableLots mapping
app.get('/api/carparks/availability', async (req, res) => {
  try {
    const cacheData = await getCachedCarparks();
    const availabilityMap: Record<string, { availableLots: number; occupancyRate: number; agency: string }> = {};

    for (const cp of cacheData.processed) {
      availabilityMap[cp.id] = {
        availableLots: cp.availableLots,
        occupancyRate: cp.occupancyRate,
        agency: cp.agency,
      };
      // Also index by short CarParkID code for legacy matching
      availabilityMap[cp.code] = {
        availableLots: cp.availableLots,
        occupancyRate: cp.occupancyRate,
        agency: cp.agency,
      };
    }

    res.json({
      success: true,
      total: Object.keys(availabilityMap).length,
      lastUpdated: cacheData.lastFetchedStr,
      availability: availabilityMap,
    });
  } catch (error: any) {
    console.error('/api/carparks/availability error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Direct Data Transparency / Sync telemetry
app.get('/api/carparks/status', async (req, res) => {
  const cacheData = await getCachedCarparks();
  const agencyCounts = {
    HDB: cacheData.processed.filter((c) => c.agency === 'HDB').length,
    URA: cacheData.processed.filter((c) => c.agency === 'URA').length,
    LTA: cacheData.processed.filter((c) => c.agency === 'LTA').length,
    Commercial: cacheData.processed.filter((c) => c.agency === 'Commercial').length,
  };

  res.json({
    success: true,
    source: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    totalCarparks: cacheData.processed.length,
    agencyBreakdown: agencyCounts,
    lastRefreshed: cacheData.lastFetchedStr,
    cacheAgeSeconds: Math.round((Date.now() - cacheData.timestamp) / 1000),
  });
});

// Start Express Server & Integrate Vite
async function startServer() {
  // Pre-warm the cache in background
  getCachedCarparks().catch((err) => console.error('Initial cache warm failed:', err));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[What The Park Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
