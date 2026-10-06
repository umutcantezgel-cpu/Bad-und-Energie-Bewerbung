'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SalaryCalculator = dynamic(
  () => import('./SalaryCalculator').then((mod) => mod.SalaryCalculator),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        Vorteils-Paket wird vorbereitet...
      </div>
    ),
  }
);

export function SalaryCalculatorClientWrapper() {
  return <SalaryCalculator />;
}
