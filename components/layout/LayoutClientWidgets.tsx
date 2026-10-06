'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const CookieConsent = dynamic(
  () => import('@/components/CookieConsent').then((mod) => mod.CookieConsent),
  { ssr: false }
);

const QuickApplySidebar = dynamic(
  () => import('@/components/QuickApplySidebar').then((mod) => mod.QuickApplySidebar),
  { ssr: false }
);

const FloatingWhatsAppWidget = dynamic(
  () => import('@/components/contact/FloatingWhatsAppWidget').then((mod) => mod.FloatingWhatsAppWidget),
  { ssr: false }
);

const BackToTop = dynamic(
  () => import('@/components/ui/BackToTop').then((mod) => mod.BackToTop),
  { ssr: false }
);

export function LayoutClientWidgets() {
  return (
    <>
      <QuickApplySidebar />
      <CookieConsent />
      <FloatingWhatsAppWidget />
      <BackToTop />
    </>
  );
}
