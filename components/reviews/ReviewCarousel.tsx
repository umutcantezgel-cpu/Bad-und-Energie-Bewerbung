'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const KineticReviewCarousel = dynamic(
  () => import('./KineticReviewCarousel').then((mod) => mod.KineticReviewCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-slate-500 font-sans text-xs">
        Mitarbeiterbewertungen werden geladen...
      </div>
    ),
  }
);

export function ReviewCarousel() {
  return <KineticReviewCarousel />;
}
