'use client';

import React, { useState } from 'react';
import { MapPin, ShieldCheck, CheckCircle2, Navigation2, Zap } from 'lucide-react';
import { MAP_POIS } from '@/lib/maps/google-maps-config';

export interface LocalDominanceMapProps {
  className?: string;
  centerCity?: string;
  defaultRadiusKm?: number;
  topRankings?: string[];
}

export function LocalDominanceMap({
  className = '',
  centerCity = 'Wetzlar Siegmund-Hiepe-Str.',
  defaultRadiusKm = 35,
  topRankings = ['Meisterbetrieb seit 1926', 'Innung SHK Lahn Dill', 'Maximal 35 km Einsatzgebiet'],
}: LocalDominanceMapProps) {
  const [activeRadius, setActiveRadius] = useState<number>(defaultRadiusKm);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // Filter regional nodes within active radius
  const visibleNodes = MAP_POIS.slice(1).filter((poi) => poi.distanceKm <= activeRadius);

  return (
    <div
      className={`relative w-full h-88 min-h-[360px] rounded-3xl bg-slate-50 border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-xs ${className}`}
    >
      {/* Background Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:18px_18px] opacity-50" />

      {/* Dynamic Animated Radar Wave */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div
          className="rounded-full border border-sky-400/30 animate-ping"
          style={{
            width: `${Math.min(activeRadius * 9, 320)}px`,
            height: `${Math.min(activeRadius * 9, 320)}px`,
            animationDuration: '3.5s',
          }}
        />
        <div
          className="rounded-full border border-sky-500/40 bg-sky-400/5 transition-all duration-300"
          style={{
            width: `${Math.min(activeRadius * 8.5, 300)}px`,
            height: `${Math.min(activeRadius * 8.5, 300)}px`,
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      </div>

      {/* Top Bar: Radius Switcher & Ranking Pills */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-col gap-1.5">
          {topRankings.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 border border-slate-200/90 text-[11px] font-semibold text-slate-800 shadow-xs backdrop-blur-sm w-fit"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#047857] shrink-0" strokeWidth={1.5} />
              <span>{badge}</span>
            </div>
          ))}
        </div>

        {/* Radius Quick Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 border border-slate-200 shadow-xs backdrop-blur-sm">
          {[15, 25, 35].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setActiveRadius(km)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRadius === km
                  ? 'bg-[#0A1E3A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* Center Business Pin with Coordinates */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <div className="relative">
          <span className="absolute -inset-2 rounded-full bg-[#C51E1E] opacity-50 animate-ping" />
          <div className="relative p-3.5 rounded-full bg-[#C51E1E] text-white shadow-lg shadow-red-950/20 ring-4 ring-red-100 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
        </div>
        <div className="mt-2.5 px-3.5 py-1 rounded-full bg-white border border-slate-200/90 text-xs font-bold text-[#0A1E3A] shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Zentrum: {centerCity}</span>
        </div>
      </div>

      {/* Orbiting Regional Nodes */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {visibleNodes.slice(0, 6).map((node, i) => {
          const angles = [35, 120, 210, 290, 75, 160];
          const angle = angles[i % angles.length] * (Math.PI / 180);
          const distancePercent = 22 + (node.distanceKm / activeRadius) * 20;
          const leftPercent = 50 + Math.cos(angle) * distancePercent;
          const topPercent = 50 + Math.sin(angle) * distancePercent;

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              onMouseEnter={() => setActiveHoverId(node.id)}
              onMouseLeave={() => setActiveHoverId(null)}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#0A1E3A] border-2 border-white shadow-sm transition-transform group-hover:scale-125" />
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2 py-1 rounded-lg bg-[#0A1E3A] text-white text-[10px] font-bold shadow-md transition-opacity pointer-events-none ${
                  activeHoverId === node.id ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
                }`}
              >
                {node.name} · {node.commuteMinutes} Min.
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-20 p-4 sm:p-5 pt-0 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Navigation2 className="w-3.5 h-3.5 text-[#0369a1]" />
          <span>Feste Kundendiensttouren im Lahn Dill Kreis</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
          <span>Max. {activeRadius} km Radius · Keine Fernmontage</span>
        </div>
      </div>
    </div>
  );
}
