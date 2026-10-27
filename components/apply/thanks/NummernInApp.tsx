'use client';

import { useEffect, useState } from 'react';
import { inAppBrowser } from '@/lib/apply/in-app-browser';
import { SEITEN_TEXT } from './danke-text';

/**
 * Unter „Nummern speichern“, nur im Browser von Instagram, Facebook oder TikTok: Dort lädt die App die Kontaktdatei oft
 * nicht; die Nummern stehen im Satz darüber. Erst nach der Hydrierung, damit das statische HTML gleich bleibt.
 */
export function NummernInApp() {
  const [inApp, setInApp] = useState(false);
  useEffect(() => {
    setInApp(inAppBrowser(navigator.userAgent) !== null); // eslint-disable-line react-hooks/set-state-in-effect -- einmal nach der Hydrierung
  }, []);
  return inApp ? <p className="text-footnote text-ink-2">{SEITEN_TEXT.nummerInApp}</p> : null;
}
