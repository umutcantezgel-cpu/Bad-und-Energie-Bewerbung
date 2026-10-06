'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, ChevronRight, Car } from 'lucide-react';

export interface RegionalNode {
  name: string;
  xPercent: number;
  yPercent: number;
  isHub?: boolean;
  driveTime: string;
  distanceKm: number;
  routeDesc: string;
}

const REGIONAL_NODES: RegionalNode[] = [
  {
    name: 'Wetzlar Siegmund Hiepe Str.',
    xPercent: 48,
    yPercent: 48,
    isHub: true,
    driveTime: '0 Min',
    distanceKm: 0,
    routeDesc: 'Firmensitz und Meisterbüro',
  },
  {
    name: 'Hermannstein',
    xPercent: 46,
    yPercent: 28,
    driveTime: '7 Min',
    distanceKm: 4,
    routeDesc: 'Über B277 und A480',
  },
  {
    name: 'Nauborn',
    xPercent: 52,
    yPercent: 68,
    driveTime: '8 Min',
    distanceKm: 5,
    routeDesc: 'Über L3451 direkt nach Wetzlar',
  },
  {
    name: 'Garbenheim',
    xPercent: 64,
    yPercent: 42,
    driveTime: '6 Min',
    distanceKm: 4,
    routeDesc: 'Über Garbenheimer Weg',
  },
  {
    name: 'Dutenhofen',
    xPercent: 74,
    yPercent: 46,
    driveTime: '10 Min',
    distanceKm: 7,
    routeDesc: 'Über B49 Schnellstraße',
  },
  {
    name: 'Aßlar',
    xPercent: 32,
    yPercent: 26,
    driveTime: '9 Min',
    distanceKm: 6,
    routeDesc: 'Über B277 Dilltal',
  },
  {
    name: 'Gießen Zentrum',
    xPercent: 88,
    yPercent: 40,
    driveTime: '16 Min',
    distanceKm: 15,
    routeDesc: 'Über B49 Ausfahrt Wetzlar Ost',
  },
  {
    name: 'Braunfels',
    xPercent: 24,
    yPercent: 72,
    driveTime: '18 Min',
    distanceKm: 14,
    routeDesc: 'Über L3020 Schlossstraße',
  },
];

export function EdgeNetworkMap({
  className = '',
  nodes = REGIONAL_NODES,
}: {
  className?: string;
  nodes?: RegionalNode[];
}) {
  const [selectedNode, setSelectedNode] = useState<RegionalNode>(nodes[6]); // Default Gießen
  const hubNode = nodes.find((n) => n.isHub) || nodes[0];

  return (
    <div
      className={`relative w-full h-88 min-h-[360px] rounded-3xl bg-slate-50 border border-slate-200/90 overflow-hidden flex flex-col justify-between p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Background Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] opacity-45" />

      {/* Header Info Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-[#0A1E3A]">
          <div className="w-7 h-7 rounded-lg bg-[#0A1E3A] text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            Regionales Einsatznetzwerk Wetzlar
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
          <span>Maximal 20 Minuten Anfahrt</span>
        </div>
      </div>

      {/* Interactive SVG Network Vectors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodes
          .filter((n) => !n.isHub)
          .map((n, i) => {
            const isSelected = selectedNode.name === n.name;
            return (
              <line
                key={i}
                x1={`${hubNode.xPercent}%`}
                y1={`${hubNode.yPercent}%`}
                x2={`${n.xPercent}%`}
                y2={`${n.yPercent}%`}
                stroke={isSelected ? '#0284C7' : '#cbd5e1'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                strokeDasharray={isSelected ? 'none' : '4 4'}
                className="transition-all duration-300"
              />
            );
          })}
      </svg>

      {/* Interactive Nodes Canvas */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {nodes.map((node, i) => {
          const isSelected = selectedNode.name === node.name;
          const isHub = node.isHub;

          return (
            <div
              key={i}
              onClick={() => setSelectedNode(node)}
              className="absolute pointer-events-auto group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
            >
              {/* Pulse Ring on Hub */}
              {isHub && (
                <span className="absolute -inset-2 rounded-full animate-ping opacity-60 bg-[#C51E1E]" />
              )}

              {/* Node Circle Pin */}
              <div
                className={`relative rounded-full border-2 border-white shadow-md transition-all duration-200 group-hover:scale-125 flex items-center justify-center ${
                  isHub
                    ? 'w-6 h-6 bg-[#C51E1E] ring-4 ring-red-100'
                    : isSelected
                      ? 'w-5 h-5 bg-[#0284C7] ring-4 ring-sky-100 scale-115'
                      : 'w-4 h-4 bg-[#0A1E3A]'
                }`}
              >
                {isHub && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* Tooltip Badge */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-xl shadow-lg text-xs font-semibold whitespace-nowrap transition-all pointer-events-none ${
                  isSelected
                    ? 'bg-[#0A1E3A] text-white opacity-100'
                    : 'bg-white text-slate-800 border border-slate-200 opacity-0 group-hover:opacity-100'
                }`}
              >
                <div className="font-bold text-[11px]">{node.name.split(' ')[0]}</div>
                <div className="text-[10px] text-sky-400 font-mono font-normal">
                  {node.driveTime} · {node.distanceKm} km
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Selected Route Info Bar */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0 border border-sky-100">
            <Car className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-extrabold text-[#0A1E3A]">
              Strecke: Wetzlar ↔ {selectedNode.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {selectedNode.routeDesc} · {selectedNode.distanceKm} km
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-[#059669] text-sm">
            {selectedNode.driveTime}
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Fahrzeit
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 pt-2.5 mt-2">
        <span>Feste Kundendiensttouren im Lahn Dill Kreis</span>
        <span className="flex items-center gap-1.5 font-bold text-[#059669]">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          Pünktlicher Feierabend garantiert
        </span>
      </div>
    </div>
  );
}
