'use client';

import { useEffect } from 'react';

import { captureAttribution } from '@/lib/attribution/store';

/**
 * Erfasst beim ersten Laden UTM-Parameter, `ref` und den Referrer-Host (nur im Arbeitsspeicher,
 * siehe lib/attribution/store.ts). Keine Cookies, kein Storage, keine Netzwerkanfrage.
 * Referrer derselben Website werden in captureAttribution() verworfen.
 */
export function AttributionCapture(): null {
  useEffect(() => {
    captureAttribution({ url: window.location.href, referrer: document.referrer });
  }, []);

  return null;
}

export default AttributionCapture;
