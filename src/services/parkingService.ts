import { Carpark, AvailabilityLevel, SearchDestination, FilterOptions } from '../types/carpark';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';

/**
 * Computes Haversine distance between two coordinates in meters.
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
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

/**
 * Format distance in a human readable string.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculate walking duration in minutes (average 80m/min walking speed in SG).
 */
export function calculateWalkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 75));
}

/**
 * Calculate driving duration in minutes (estimated city driving + traffic).
 */
export function calculateDrivingMinutes(meters: number): number {
  return Math.max(2, Math.round(meters / 350) + 1);
}

/**
 * Determine availability tier based on free lots and occupancy percentage.
 */
export function determineAvailabilityLevel(availableLots: number, totalLots: number): AvailabilityLevel {
  if (totalLots === 0) return 'LIMITED';
  const freePercent = (availableLots / totalLots) * 100;
  if (availableLots === 0 || freePercent < 5 || availableLots < 8) {
    return 'FULL';
  }
  if (freePercent < 20 || availableLots < 25) {
    return 'LIMITED';
  }
  if (freePercent < 45 || availableLots < 80) {
    return 'MODERATE';
  }
  return 'HIGH';
}

/**
 * Enhances carparks relative to a target destination or coordinates,
 * computing distance, walking time, driving time, recommendation score & human reason.
 */
export function getCarparksNearDestination(
  destLat: number,
  destLng: number,
  carparks: Carpark[] = SINGAPORE_CARPARKS,
  maxDistanceRadiusMeters = 3500
): Carpark[] {
  const enhancedList = carparks.map((cp) => {
    const dist = calculateDistanceInMeters(destLat, destLng, cp.latitude, cp.longitude);
    const walkMin = calculateWalkingMinutes(dist);
    const driveMin = calculateDrivingMinutes(dist);
    const freePct = cp.totalLots > 0 ? (cp.availableLots / cp.totalLots) * 100 : 0;
    const availLevel = determineAvailabilityLevel(cp.availableLots, cp.totalLots);

    // Scoring algorithm weights:
    // Distance (40 pts): closer is better (< 300m = 40, > 2000m = 5)
    let distScore = Math.max(0, 40 - (dist / 1500) * 35);
    if (dist < 300) distScore = 40;

    // Availability (35 pts): high percentage & buffer lots
    let availScore = (freePct / 100) * 25;
    if (cp.availableLots > 100) availScore += 10;
    else if (cp.availableLots > 40) availScore += 6;
    else if (cp.availableLots < 15) availScore -= 10;

    // Price (20 pts): lower hourly rate is better ($1.20 vs $4.00)
    const priceScore = Math.max(0, 20 - (cp.rates.estimatedHourlyRate / 4.5) * 18);

    // Amenities (5 pts): covered + EV + grace period
    let amenityScore = 0;
    if (cp.features.covered) amenityScore += 2;
    if (cp.features.evCharging) amenityScore += 1;
    if (cp.rates.gracePeriodMinutes >= 15) amenityScore += 2;

    const totalScore = Math.round(distScore + availScore + priceScore + amenityScore);

    return {
      ...cp,
      distanceMeters: dist,
      walkingMinutes: walkMin,
      drivingMinutes: driveMin,
      availabilityLevel: availLevel,
      recommendationScore: totalScore,
    };
  });

  // Filter within reasonable radius
  const nearby = enhancedList.filter((cp) => (cp.distanceMeters ?? 99999) <= maxDistanceRadiusMeters);

  // If no carpark is within radius (e.g. searching remote location), take nearest 6
  const candidateList = nearby.length >= 3 ? nearby : enhancedList.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)).slice(0, 8);

  // Identify standout carparks for smart badges:
  // 1. Highest Recommendation Score -> 'best_overall'
  // 2. Lowest estimated rate -> 'cheapest'
  // 3. Closest distance -> 'closest'
  // 4. Highest available lots -> 'highest_availability'
  const sortedByScore = [...candidateList].sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  const bestOverall = sortedByScore[0];

  const sortedByPrice = [...candidateList].sort((a, b) => a.rates.estimatedHourlyRate - b.rates.estimatedHourlyRate);
  const cheapest = sortedByPrice[0];

  const sortedByDist = [...candidateList].sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  const closest = sortedByDist[0];

  const sortedByAvail = [...candidateList].sort((a, b) => b.availableLots - a.availableLots);
  const highestAvail = sortedByAvail[0];

  return candidateList.map((cp) => {
    let badge: Carpark['recommendationBadge'];
    let reason = '';

    if (bestOverall && cp.id === bestOverall.id) {
      badge = 'best_overall';
      reason = `Best balance: only ${formatDistance(cp.distanceMeters || 0)} (${cp.walkingMinutes} min walk), ${cp.availableLots} lots open, and affordable $${cp.rates.estimatedHourlyRate.toFixed(2)}/hr rate.`;
    } else if (cheapest && cp.id === cheapest.id && cp.rates.estimatedHourlyRate < (bestOverall?.rates.estimatedHourlyRate || 99)) {
      badge = 'cheapest';
      reason = `Most economical option at $${cp.rates.estimatedHourlyRate.toFixed(2)}/hr (${formatDistance(cp.distanceMeters || 0)} away).`;
    } else if (closest && cp.id === closest.id && (cp.distanceMeters ?? 999) < ((bestOverall?.distanceMeters ?? 0) - 100)) {
      badge = 'closest';
      reason = `Closest parking to destination at just ${formatDistance(cp.distanceMeters || 0)} (${cp.walkingMinutes} min walk).`;
    } else if (highestAvail && cp.id === highestAvail.id && cp.availableLots > (bestOverall?.availableLots || 0) + 100) {
      badge = 'highest_availability';
      reason = `Largest capacity with ${cp.availableLots} lots available (${cp.totalLots - cp.occupancyRate}% free).`;
    } else {
      reason = `${formatDistance(cp.distanceMeters || 0)} away • ${cp.availableLots} available lots • $${cp.rates.estimatedHourlyRate.toFixed(2)}/hr`;
    }

    return {
      ...cp,
      recommendationBadge: badge,
      recommendationReason: reason,
    };
  });
}

/**
 * Filters and sorts carpark list based on active driver preferences.
 */
export function filterAndSortCarparks(
  carparks: Carpark[],
  filters: FilterOptions
): Carpark[] {
  let list = [...carparks];

  // Vehicle Type
  if (filters.vehicleType) {
    list = list.filter((cp) => cp.vehicleType === filters.vehicleType);
  }

  // Agency
  if (filters.agency !== 'all') {
    list = list.filter((cp) => cp.agency.toLowerCase() === filters.agency.toLowerCase());
  }

  // Max Hourly Price
  if (filters.maxPricePerHour > 0) {
    list = list.filter((cp) => cp.rates.estimatedHourlyRate <= filters.maxPricePerHour);
  }

  // Max Distance
  if (filters.maxDistanceMeters > 0) {
    list = list.filter((cp) => (cp.distanceMeters ?? 0) <= filters.maxDistanceMeters);
  }

  // Min Available Lots
  if (filters.minAvailableLots > 0) {
    list = list.filter((cp) => cp.availableLots >= filters.minAvailableLots);
  }

  // Availability Status
  if (filters.availabilityStatus === 'high') {
    list = list.filter((cp) => cp.availabilityLevel === 'HIGH');
  } else if (filters.availabilityStatus === 'moderate') {
    list = list.filter((cp) => cp.availabilityLevel === 'HIGH' || cp.availabilityLevel === 'MODERATE');
  }

  // Features
  if (filters.coveredOnly) {
    list = list.filter((cp) => cp.features.covered);
  }
  if (filters.evChargingOnly) {
    list = list.filter((cp) => cp.features.evCharging);
  }
  if (filters.handicapOnly) {
    list = list.filter((cp) => cp.features.handicapLots);
  }
  if (filters.twentyFourHoursOnly) {
    list = list.filter((cp) => cp.features.twentyFourHours);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'recommended':
      list.sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
      break;
    case 'distance':
      list.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
      break;
    case 'price':
      list.sort((a, b) => a.rates.estimatedHourlyRate - b.rates.estimatedHourlyRate);
      break;
    case 'availability':
      list.sort((a, b) => (b.totalLots > 0 ? b.availableLots / b.totalLots : 0) - (a.totalLots > 0 ? a.availableLots / a.totalLots : 0));
      break;
    case 'lots':
      list.sort((a, b) => b.availableLots - a.availableLots);
      break;
  }

  return list;
}

/**
 * Generate navigation deep links for all major navigation services.
 */
export function getNavigationLinks(carpark: Carpark, destName?: string) {
  const lat = carpark.latitude;
  const lng = carpark.longitude;
  const encodedName = encodeURIComponent(`${carpark.name} (${carpark.address})`);

  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}&travelmode=driving`,
    appleMaps: `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    citymapper: `https://citymapper.com/directions?endcoord=${lat},${lng}&endname=${encodedName}`,
    onemap: `https://www.onemap.gov.sg/main/v2/?lat=${lat}&lng=${lng}`,
  };
}
