'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import type { InteractiveMapProps } from './InteractiveMap';

const InteractiveMap = dynamic(
  () => import('./InteractiveMap').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] bg-slate-100/80 rounded-3xl animate-pulse flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        <span>Standortkarte &amp; Einsatzgebiet werden geladen...</span>
      </div>
    ),
  }
);

export function InteractiveMapClientWrapper(props: InteractiveMapProps) {
  return <InteractiveMap {...props} />;
}
