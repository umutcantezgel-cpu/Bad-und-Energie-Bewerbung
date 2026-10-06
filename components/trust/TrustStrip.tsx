'use client';

import React from 'react';
import { ShieldCheck, Award, Clock, Wrench, Truck, HeartHandshake } from 'lucide-react';

export function TrustStrip() {
  const items = [
    { icon: Award, text: 'Innungs Meisterbetrieb seit 1926' },
    { icon: ShieldCheck, text: 'Handwerkskammer Wiesbaden eingetragen' },
    { icon: Clock, text: 'Freitags ab 13:30 Uhr ins Wochenende' },
    { icon: Wrench, text: 'Persönliche Hilti Werkzeugausstattung' },
    { icon: Truck, text: 'Servicefahrzeug mit Privatnutzung' },
    { icon: HeartHandshake, text: '30 Tage garantierter Urlaub' },
  ];

  const track = [...items, ...items];

  return (
    <div
      aria-label="Garantierte Vorteile und Zertifizierungen"
      className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xs py-3.5 px-4 flex items-center overflow-hidden relative z-20 w-full"
    >
      <div className="flex w-full overflow-hidden group">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
          {track.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 shrink-0 px-4 sm:px-6"
            >
              <div className="w-7 h-7 rounded-xl bg-sky-50 text-[#0369a1] flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-xs text-slate-800 whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
