'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Clock,
  Car,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layers,
  Info,
} from 'lucide-react';
import {
  HEADQUARTERS_COORDINATES,
  MAP_POIS,
  MapPOI,
  APPLE_SILVER_MAP_STYLE,
  MIDNIGHT_MEISTER_MAP_STYLE,
  MAX_SERVICE_RADIUS_KM,
  GMP_ATTRIBUTION_IDS,
} from '@/lib/maps/google-maps-config';
import { loadGoogleMapsScript, resolveGoogleMapsApiKey, hasGoogleMapsKey } from '@/lib/maps/google-maps-loader';

export interface InteractiveMapProps {
  className?: string;
  height?: string;
  defaultRadiusKm?: number;
}

type MapTheme = 'porcelain' | 'satellite' | 'midnight';

export function InteractiveMap({
  className = '',
  height = '640px',
  defaultRadiusKm = 35,
}: InteractiveMapProps) {
  const [selectedPoi, setSelectedPoi] = useState<MapPOI>(MAP_POIS[0]);
  const [radiusKm, setRadiusKm] = useState<number>(defaultRadiusKm);
  const [mapTheme, setMapTheme] = useState<MapTheme>('porcelain');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const [hasResolvedKey, setHasResolvedKey] = useState<boolean>(hasGoogleMapsKey());
  const [commuteOriginId, setCommuteOriginId] = useState<string>('loc-giessen');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const googleCircleInstance = useRef<google.maps.Circle | null>(null);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);

  // Resolve API key asynchronously (handles both NEXT_PUBLIC_ and server-side GOOGLE_MAPS_API_KEY)
  useEffect(() => {
    let isMounted = true;
    resolveGoogleMapsApiKey().then((key) => {
      if (isMounted && key) {
        setHasResolvedKey(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update Google Maps Circle overlay
  const updateGoogleMapsCircle = useCallback((map: google.maps.Map, radiusMeters: number, theme: MapTheme) => {
    if (googleCircleInstance.current) {
      googleCircleInstance.current.setMap(null);
    }
    const isDark = theme === 'midnight';
    googleCircleInstance.current = new window.google.maps.Circle({
      map,
      center: HEADQUARTERS_COORDINATES,
      radius: radiusMeters,
      fillColor: isDark ? '#0284c7' : '#0ea5e9',
      fillOpacity: isDark ? 0.12 : 0.08,
      strokeColor: isDark ? '#38bdf8' : '#0284c7',
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
    });
  }, []);

  // Update Google Maps Map Type & Style
  const applyThemeToGoogleMap = useCallback((map: google.maps.Map, theme: MapTheme) => {
    if (theme === 'satellite') {
      map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      map.setOptions({ styles: [] });
    } else if (theme === 'midnight') {
      map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: MIDNIGHT_MEISTER_MAP_STYLE });
    } else {
      map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: APPLE_SILVER_MAP_STYLE });
    }
  }, []);

  // Initialize live Google Maps instance when key is resolved and ready
  useEffect(() => {
    if (!hasResolvedKey || !mapElementRef.current) return;

    let isMounted = true;

    loadGoogleMapsScript().then((loaded) => {
      if (!loaded || !isMounted || !mapElementRef.current || !window.google?.maps) return;

      try {
        const map = new window.google.maps.Map(mapElementRef.current, {
          center: HEADQUARTERS_COORDINATES,
          zoom: 11,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          backgroundColor: '#f8fafc',
          ...({ internalUsageAttributionIds: GMP_ATTRIBUTION_IDS } as Record<string, unknown>),
        });

        googleMapInstance.current = map;
        applyThemeToGoogleMap(map, mapTheme);
        updateGoogleMapsCircle(map, radiusKm * 1000, mapTheme);

        // Add Markers
        MAP_POIS.forEach((poi) => {
          const isHq = poi.type === 'headquarters';
          const marker = new window.google.maps.Marker({
            position: poi.coordinates,
            map,
            title: poi.name,
            icon: isHq
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#C51E1E',
                  fillOpacity: 1,
                  strokeWeight: 3,
                  strokeColor: '#ffffff',
                }
              : {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#0A1E3A',
                  fillOpacity: 0.9,
                  strokeWeight: 2,
                  strokeColor: '#ffffff',
                },
          });

          marker.addListener('click', () => {
            setSelectedPoi(poi);
            map.panTo(poi.coordinates);
            setIsSidebarOpen(true);
          });

          googleMarkersRef.current.push(marker);
        });

        setIsGoogleMapsReady(true);
      } catch (err) {
        console.warn('[Google Maps Init]', err);
      }
    });

    return () => {
      isMounted = false;
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];
    };
  }, [hasResolvedKey, applyThemeToGoogleMap, mapTheme, radiusKm, updateGoogleMapsCircle]);

  // Sync theme changes with live Google Map
  useEffect(() => {
    if (googleMapInstance.current && isGoogleMapsReady) {
      applyThemeToGoogleMap(googleMapInstance.current, mapTheme);
      updateGoogleMapsCircle(googleMapInstance.current, radiusKm * 1000, mapTheme);
    }
  }, [mapTheme, radiusKm, isGoogleMapsReady, applyThemeToGoogleMap, updateGoogleMapsCircle]);

  // Reset View to HQ
  const handleResetToHq = () => {
    setSelectedPoi(MAP_POIS[0]);
    if (googleMapInstance.current && window.google?.maps) {
      googleMapInstance.current.setZoom(11);
      googleMapInstance.current.panTo(HEADQUARTERS_COORDINATES);
    }
  };

  // Select POI and pan
  const handleSelectPoi = (poi: MapPOI) => {
    setSelectedPoi(poi);
    if (googleMapInstance.current && window.google?.maps) {
      googleMapInstance.current.panTo(poi.coordinates);
      googleMapInstance.current.setZoom(12);
    }
    setIsSidebarOpen(true);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Commute Calculation
  const selectedCommutePoi = MAP_POIS.find((p) => p.id === commuteOriginId) || MAP_POIS[1];

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-white flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height, minHeight: isFullscreen ? '100vh' : '580px' }}
    >
      {/* =========================================================================
          APPLE CONTROL HUD HEADER
         ========================================================================= */}
      <div className="relative z-30 px-4 py-3 sm:px-6 sm:py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-slate-800">
        {/* Left: Location & API Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A1E3A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-4.5 h-4.5 text-sky-400" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-base font-extrabold text-[#0A1E3A] tracking-tight">
                Einsatzgebiet &amp; Standorte Mittelhessen
              </h4>
              {hasResolvedKey ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Google Maps Live
                </span>
              ) : (
                <span
                  title="Google Maps API-Key in Vercel oder .env hinterlegen (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-[#0284C7]"
                >
                  <Sparkles className="w-3 h-3 text-[#0284C7]" />
                  Vektor-Modus aktiv
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Siegmund-Hiepe-Str. 20 · 35578 Wetzlar · Max. {radiusKm} km Aktionsradius
            </p>
          </div>
        </div>

        {/* Center: Map Theme Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMapTheme('porcelain')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              mapTheme === 'porcelain'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Porzellan
          </button>
          <button
            type="button"
            onClick={() => setMapTheme('satellite')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              mapTheme === 'satellite'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellit
          </button>
          <button
            type="button"
            onClick={() => setMapTheme('midnight')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              mapTheme === 'midnight'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Midnight
          </button>
        </div>

        {/* Right: Quick Action Buttons & Radius Controls */}
        <div className="flex items-center gap-2">
          {/* Radius Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 uppercase">Radius:</span>
            {[15, 25, 35].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  radiusKm === km
                    ? 'bg-[#0A1E3A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetToHq}
            title="Auf Firmensitz Wetzlar zentrieren"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden md:inline">Zentrieren</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Details ausblenden' : 'Details einblenden'}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden lg:inline">{isSidebarOpen ? 'Panel verbergen' : 'Details'}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Vollbild umschalten"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAP CANVAS (LIVE GOOGLE MAP OR HIGH-FIDELITY VECTOR TOPOLOGY)
         ========================================================================= */}
      <div className="relative flex-1 w-full overflow-hidden bg-slate-50">
        {/* LIVE GOOGLE MAPS CONTAINER (Activated when API Key is present) */}
        {hasResolvedKey && (
          <div ref={mapElementRef} className="absolute inset-0 w-full h-full z-0" />
        )}

        {/* HIGH-FIDELITY INTERACTIVE VECTOR TOPOLOGY MAP (Fallback when no key is configured) */}
        {(!hasResolvedKey || !isGoogleMapsReady) && (
          <div
            className={`absolute inset-0 w-full h-full z-0 transition-colors duration-500 ${
              mapTheme === 'midnight'
                ? 'bg-[#0A1E3A] text-white'
                : mapTheme === 'satellite'
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-[#f8fafc] text-slate-800'
            }`}
          >
            {/* Topography Grid Pattern */}
            <div
              className={`absolute inset-0 [background-size:28px_28px] opacity-40 ${
                mapTheme === 'midnight'
                  ? 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)]'
                  : 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)]'
              }`}
            />

            {/* Stylized Lahn & Dill River Vector */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
              preserveAspectRatio="none"
              viewBox="0 0 1000 600"
            >
              {/* Lahn Flusslauf (Biebertal -> Wetzlar -> Braunfels) */}
              <path
                d="M 960 170 Q 750 230, 500 300 T 240 440 T 40 540"
                fill="none"
                stroke={mapTheme === 'midnight' ? '#0284c7' : '#93c5fd'}
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Dill Flusslauf (Herborn -> Aßlar -> Wetzlar) */}
              <path
                d="M 310 20 Q 370 140, 480 290"
                fill="none"
                stroke={mapTheme === 'midnight' ? '#0369a1' : '#bae6fd'}
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Autobahn A45 & B49 Hauptachsen */}
              <path
                d="M 100 30 L 480 300 L 900 560"
                fill="none"
                stroke={mapTheme === 'midnight' ? '#475569' : '#fed7aa'}
                strokeWidth="6"
                strokeDasharray="8 4"
              />
              <path
                d="M 180 500 L 500 300 L 990 190"
                fill="none"
                stroke={mapTheme === 'midnight' ? '#475569' : '#fed7aa'}
                strokeWidth="6"
                strokeDasharray="8 4"
              />
            </svg>

            {/* Dynamic Geofence Pulse Rings centered on Wetzlar (Coordinates ~50%, 50%) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {/* Radar pulse wave */}
              <div
                className="rounded-full border border-sky-400/30 animate-ping"
                style={{
                  width: `${Math.min(radiusKm * 18, 560)}px`,
                  height: `${Math.min(radiusKm * 18, 560)}px`,
                  animationDuration: '4s',
                }}
              />
              {/* Radius Circle Area */}
              <div
                className={`rounded-full transition-all duration-500 ${
                  mapTheme === 'midnight'
                    ? 'border-2 border-sky-400/40 bg-sky-500/10'
                    : 'border-2 border-sky-500/50 bg-sky-400/10 shadow-inner'
                }`}
                style={{
                  width: `${Math.min(radiusKm * 16, 520)}px`,
                  height: `${Math.min(radiusKm * 16, 520)}px`,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              />
            </div>

            {/* Interactive Vector POI Pins */}
            <div className="absolute inset-0 z-10">
              {MAP_POIS.map((poi) => {
                const isSelected = selectedPoi.id === poi.id;
                const isHq = poi.type === 'headquarters';

                const latDiff = (poi.coordinates.lat - 50.56499) * 110;
                const lngDiff = (poi.coordinates.lng - 8.49842) * 70;
                const topPercent = 50 - latDiff * 3.5;
                const leftPercent = 50 + lngDiff * 4.2;

                return (
                  <div
                    key={poi.id}
                    onClick={() => handleSelectPoi(poi)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      top: `${Math.max(12, Math.min(88, topPercent))}%`,
                      left: `${Math.max(10, Math.min(90, leftPercent))}%`,
                    }}
                  >
                    {/* Pulsing ring on HQ */}
                    {isHq && (
                      <span className="absolute -inset-2 rounded-full bg-[#C51E1E] opacity-60 animate-ping" />
                    )}

                    {/* Marker Badge */}
                    <div
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-md transition-all duration-200 group-hover:scale-110 ${
                        isHq
                          ? 'bg-[#C51E1E] text-white border-white ring-4 ring-red-200'
                          : isSelected
                            ? 'bg-[#0A1E3A] text-white border-white ring-4 ring-sky-200 scale-105'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-sky-400'
                      }`}
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          isHq ? 'text-white' : isSelected ? 'text-sky-400' : 'text-[#0284C7]'
                        }`}
                        strokeWidth={2}
                      />
                      <span className="text-xs font-bold whitespace-nowrap">
                        {poi.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Distance Badge */}
                    {!isHq && (
                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-mono whitespace-nowrap opacity-80 group-hover:opacity-100">
                        {poi.commuteMinutes} Min.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            SIDE-DOCK COMMAND DRAWER (INTEGRATED ON RIGHT SIDE, NON-BLOCKING)
           ========================================================================= */}
        {isSidebarOpen && (
          <div className="absolute top-4 right-4 bottom-4 w-92 max-w-[calc(100%-2rem)] z-20 flex flex-col pointer-events-none">
            <div className="pointer-events-auto h-full flex flex-col justify-between p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl text-slate-900 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Drawer Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
                      {selectedPoi.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0A1E3A] tracking-tight mt-1.5">
                      {selectedPoi.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="Panel schließen"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Location Details */}
                <div className="space-y-2 text-xs">
                  <div className="text-slate-500 font-mono text-[11px]">
                    📍 {selectedPoi.address}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedPoi.description}
                  </p>
                </div>

                {/* Commute Time Metrics */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Entfernung Werkstatt:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedPoi.distanceKm === 0 ? 'Firmensitz' : `${selectedPoi.distanceKm} km`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Fahrzeit ab Wetzlar:</span>
                    <span className="font-mono font-bold text-[#059669]">
                      {selectedPoi.commuteMinutes === 0
                        ? '0 Minuten'
                        : `ca. ${selectedPoi.commuteMinutes} Minuten`}
                    </span>
                  </div>
                </div>

                {/* Commute Calculator for Candidate */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label
                    htmlFor="commute-origin-select"
                    className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block"
                  >
                    Pendlerrechner: Dein Wohnort
                  </label>
                  <select
                    id="commute-origin-select"
                    aria-label="Pendlerrechner: Dein Wohnort"
                    value={commuteOriginId}
                    onChange={(e) => {
                      setCommuteOriginId(e.target.value);
                      const matched = MAP_POIS.find((p) => p.id === e.target.value);
                      if (matched) handleSelectPoi(matched);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-[#0284C7]"
                  >
                    {MAP_POIS.slice(1).map((poi) => (
                      <option key={poi.id} value={poi.id}>
                        {poi.name} ({poi.commuteMinutes} Min. Fahrzeit)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Actions & Trust Guarantee */}
              <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Garantiert keine Fernmontage · Pünktlicher Feierabend</span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoi.coordinates.lat},${selectedPoi.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route in Google Maps öffnen</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Info Trigger Button (When Drawer is Closed) */}
        {!isSidebarOpen && (
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-[#0A1E3A] hover:bg-white flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#0284C7]" />
              <span>Standortdetails &amp; Pendlerrechner</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
