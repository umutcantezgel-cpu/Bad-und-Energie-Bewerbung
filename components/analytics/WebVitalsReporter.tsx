'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!['LCP', 'CLS', 'INP', 'FCP', 'TTFB'].includes(metric.name)) return;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[CWV] ${metric.name}:`, Math.round(metric.value), metric.rating);
    }
  });

  return null;
}
