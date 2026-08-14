import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, AvailabilityLevel } from '../types/carpark';
import { Navigation, Layers, Compass, Crosshair, Sparkles, ExternalLink, Check, Car, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface InteractiveMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  destination: { name: string; latitude: number; longitude: number; address: string } | null;
  onNavigate: (carpark: Carpark) => void;
  onCompareToggle?: (carpark: Carpark) => void;
  comparedCarparkIds?: string[];
  onOpenDetails?: (carpark: Carpark) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  destination,
  onNavigate,
  onCompareToggle,
  comparedCarparkIds = [],
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'light'>('light');

  // Helper for availability badge color in pins
  const getPinTheme = (level: AvailabilityLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-700',
          text: 'text-white',
          dot: 'bg-emerald-300',
          label: 'High Lots',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          text: 'text-slate-950',
          dot: 'bg-amber-100',
          label: 'Filling Up',
        };
      case 'LIMITED':
      case 'FULL':
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-700',
          text: 'text-white',
          dot: 'bg-rose-200',
          label: 'Almost Full',
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = destination
        ? [destination.latitude, destination.longitude]
        : [1.3040, 103.8318]; // Orchard Road

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl =
        mapLayer === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control
        .attribution({ position: 'bottomright', prefix: '© OpenStreetMap, LTA/URA SG' })
        .addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // clean up on unmount handled
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl =
      mapLayer === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
  }, [mapLayer]);

  // Update Markers & Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersRef.current) return;

    markersRef.current.clearLayers();

    // 1. Destination Marker
    if (destination) {
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
      }

      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full pointer-events-none">
            <div class="absolute -top-1 w-9 h-9 bg-sky-500 rounded-full animate-ping opacity-30"></div>
            <div class="relative flex flex-col items-center">
              <div class="px-3 py-1 bg-slate-950 text-white text-xs font-black rounded-xl shadow-xl border-2 border-sky-400 whitespace-nowrap flex items-center gap-1.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>${destination.name}</span>
              </div>
              <div class="w-7 h-7 rounded-full bg-sky-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black">
                ★
              </div>
              <div class="w-1.5 h-2 bg-slate-900"></div>
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 48],
      });

      destMarkerRef.current = L.marker([destination.latitude, destination.longitude], {
        icon: destIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // 2. Carpark Pins with prominent Rates & Lots
    const bounds: [number, number][] = [];
    if (destination) {
      bounds.push([destination.latitude, destination.longitude]);
    }

    carparks.forEach((cp) => {
      bounds.push([cp.latitude, cp.longitude]);
      const isSelected = selectedCarpark?.id === cp.id;
      const theme = getPinTheme(cp.availabilityLevel);

      const rateDisplay = `$${cp.rates.estimatedHourlyRate.toFixed(2)}/h`;
      const lotsDisplay = `${cp.availableLots} lots`;

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-150 ${isSelected ? 'scale-110 z-50' : 'hover:scale-105'}">
          <div class="flex flex-col items-center">
            ${
              cp.recommendationBadge
                ? `<span class="px-2 py-0.5 mb-0.5 text-[10px] font-black tracking-tight bg-slate-950 text-amber-300 rounded-full shadow-lg border border-amber-400 whitespace-nowrap flex items-center gap-0.5">
                    ★ ${cp.recommendationBadge === 'best_overall' ? 'Best Value' : cp.recommendationBadge === 'cheapest' ? 'Cheapest' : 'Nearest'}
                   </span>`
                : ''
            }
            <div class="px-2.5 py-1.5 ${theme.bg} ${theme.text} rounded-xl shadow-xl border-2 ${
              isSelected ? 'border-sky-300 ring-4 ring-sky-400/60' : 'border-white'
            } flex items-center gap-1.5 text-xs font-black whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${theme.dot}"></span>
              <span class="font-black">${lotsDisplay}</span>
              <span class="bg-black/20 px-1.5 py-0.5 rounded-md font-mono text-[11px]">${rateDisplay}</span>
            </div>
            <div class="w-2.5 h-2.5 ${theme.bg} rotate-45 -mt-1 border-r-2 border-b-2 ${
              isSelected ? 'border-sky-300' : 'border-white'
            }"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: markerHtml,
        iconSize: [140, 56],
        iconAnchor: [70, 50],
      });

      const marker = L.marker([cp.latitude, cp.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : cp.recommendationBadge ? 600 : 200,
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      markersRef.current?.addLayer(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
      });
    }
  }, [carparks, selectedCarpark, destination, comparedCarparkIds]);

  // Pan to selected carpark when changed
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedCarpark.latitude, selectedCarpark.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedCarpark]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && destination) {
      mapInstanceRef.current.setView([destination.latitude, destination.longitude], 15, {
        animate: true,
      });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || carparks.length === 0) return;
    const bounds: [number, number][] = carparks.map((cp) => [cp.latitude, cp.longitude]);
    if (destination) bounds.push([destination.latitude, destination.longitude]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Next / Prev carpark navigation
  const currentIndex = selectedCarpark ? carparks.findIndex((c) => c.id === selectedCarpark.id) : 0;
  const handlePrevCarpark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carparks.length === 0) return;
    const prevIdx = (currentIndex - 1 + carparks.length) % carparks.length;
    onSelectCarpark(carparks[prevIdx]);
  };
  const handleNextCarpark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carparks.length === 0) return;
    const nextIdx = (currentIndex + 1) % carparks.length;
    onSelectCarpark(carparks[nextIdx]);
  };

  // Active carpark to show in bottom drawer (selected or first carpark)
  const activeDrawerCarpark = selectedCarpark || carparks[0] || null;

  return (
    <div id="interactive-map-wrapper" className="relative w-full h-full min-h-[460px] sm:min-h-[560px] rounded-3xl overflow-hidden shadow-md border-2 border-slate-200 bg-slate-100 flex flex-col">
      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[560px] z-0" />

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          id="map-btn-recenter"
          onClick={handleRecenter}
          title="Center on Destination"
          className="p-3 bg-white/95 backdrop-blur-md text-slate-800 hover:text-sky-600 rounded-2xl shadow-lg border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="Center map on destination"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        <button
          id="map-btn-fit-all"
          onClick={handleFitAll}
          title="Fit All Nearby Carparks"
          className="p-3 bg-white/95 backdrop-blur-md text-slate-800 hover:text-sky-600 rounded-2xl shadow-lg border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="View all carparks"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          id="map-btn-toggle-layer"
          onClick={() => setMapLayer((prev) => (prev === 'light' ? 'streets' : 'light'))}
          title="Toggle Map Style"
          className="p-3 bg-white/95 backdrop-blur-md text-slate-800 hover:text-sky-600 rounded-2xl shadow-lg border border-slate-200 hover:bg-white transition-all flex items-center justify-center active:scale-95"
          aria-label="Toggle map layer style"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Map Legend (Top Left) */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-slate-800 text-[11px]">Lots Free</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-bold text-slate-800 text-[11px]">Filling</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span className="font-bold text-slate-800 text-[11px]">Full</span>
        </div>
      </div>

      {/* Driver Bottom Action Drawer */}
      {activeDrawerCarpark && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 max-w-xl mx-auto z-20 bg-white/98 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-sky-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Row: Title, Tag, and Stepper */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                  {activeDrawerCarpark.agency}
                </span>
                {activeDrawerCarpark.recommendationBadge && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {activeDrawerCarpark.recommendationBadge === 'best_overall'
                      ? 'Recommended'
                      : activeDrawerCarpark.recommendationBadge === 'cheapest'
                      ? 'Cheapest Rate'
                      : 'Nearest'}
                  </span>
                )}
                {activeDrawerCarpark.features.evCharging && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-emerald-600" /> EV
                  </span>
                )}
              </div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg leading-tight truncate">
                {activeDrawerCarpark.name}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{activeDrawerCarpark.address}</p>
            </div>

            {/* Next / Prev Stepper */}
            {carparks.length > 1 && (
              <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={handlePrevCarpark}
                  className="p-1 text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-all"
                  title="Previous Carpark"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-black text-slate-700 px-1">
                  {currentIndex + 1}/{carparks.length}
                </span>
                <button
                  onClick={handleNextCarpark}
                  className="p-1 text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-all"
                  title="Next Carpark"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Key Metrics: Rate, Lots, Distance */}
          <div className="grid grid-cols-3 gap-2 py-2.5 my-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="p-1">
              <span className="text-[10px] text-slate-500 block uppercase font-extrabold tracking-wider">Rate</span>
              <span className="text-base sm:text-lg font-black text-slate-950 block">
                ${activeDrawerCarpark.rates.estimatedHourlyRate.toFixed(2)}
                <span className="text-[11px] font-normal text-slate-500">/hr</span>
              </span>
            </div>
            <div className="p-1 border-x border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-extrabold tracking-wider">Available</span>
              <span
                className={`text-base sm:text-lg font-black block ${
                  activeDrawerCarpark.availableLots > 30
                    ? 'text-emerald-600'
                    : activeDrawerCarpark.availableLots > 10
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {activeDrawerCarpark.availableLots} lots
              </span>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-500 block uppercase font-extrabold tracking-wider">Distance</span>
              <span className="text-base sm:text-lg font-black text-slate-900 block">
                {activeDrawerCarpark.distanceMeters ? `${activeDrawerCarpark.distanceMeters}m` : 'Nearby'}
              </span>
            </div>
          </div>

          {/* Big Touch Target Driver Action Button */}
          <div className="flex items-center gap-2">
            <button
              id={`map-drawer-nav-btn-${activeDrawerCarpark.id}`}
              onClick={() => onNavigate(activeDrawerCarpark)}
              className="flex-1 py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-black rounded-2xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <Navigation className="w-5 h-5 fill-white" />
              <span>🚗 Start Navigation</span>
            </button>

            {onOpenDetails && (
              <button
                id={`map-drawer-details-btn-${activeDrawerCarpark.id}`}
                onClick={() => onOpenDetails(activeDrawerCarpark)}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold rounded-2xl border border-slate-300 transition-all text-xs sm:text-sm whitespace-nowrap"
              >
                Details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
