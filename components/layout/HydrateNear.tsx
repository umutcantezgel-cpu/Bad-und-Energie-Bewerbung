'use client';

import { Activity, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

/**
 * Vorlauf vor dem Bildschirm: Die Insel lädt rund eine Handyhöhe vorher, damit sie bedienbar ist, bevor
 * jemand sie erreicht.
 */
export const VORLAUF = '600px 0px';

/** Pointer über der Insel oder Fokus darin (Tab): sofort laden, auch ohne Scrollen. */
const ANNAEHERUNG = ['focusin', 'pointerover'] as const;

interface Tor {
  offen: Promise<void>;
  oeffnen: () => void;
}

/** Ein Versprechen, das genau einmal aufgeht; danach hydriert React die Insel. */
export function erstelleTor(): Tor {
  let oeffnen = () => {};
  const offen = new Promise<void>((resolve) => {
    oeffnen = resolve;
  });
  return { offen, oeffnen };
}

/** Die Adresse zeigt auf die Insel: auf ihre umgebende <section> (#bewerben, #einsatzgebiet) oder in sie hinein. */
export function hashZeigtAuf(element: Element, hash: string): boolean {
  if (hash.length < 2) return false;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return false;
  }
  const ziel = element.ownerDocument.getElementById(id);
  return ziel !== null && (ziel === element.closest('section') || element.contains(ziel));
}

/**
 * Ruft `nah` einmal auf, sobald die Insel in Reichweite kommt: Hash beim Laden oder per Sprung, Abstand zum
 * Bildschirm unter VORLAUF, Fokus oder Pointer darin. Gibt das Aufräumen zurück.
 */
export function beiAnnaeherung(element: HTMLElement, nah: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined' || hashZeigtAuf(element, window.location.hash)) {
    nah();
    return () => {};
  }
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      if (eintraege.some((eintrag) => eintrag.isIntersecting)) ausloesen();
    },
    { rootMargin: VORLAUF },
  );
  const beiSprung = () => {
    if (hashZeigtAuf(element, window.location.hash)) ausloesen();
  };
  function aufraeumen() {
    beobachter.disconnect();
    for (const typ of ANNAEHERUNG) element.removeEventListener(typ, ausloesen);
    window.removeEventListener('hashchange', beiSprung);
  }
  function ausloesen() {
    aufraeumen();
    nah();
  }
  beobachter.observe(element);
  for (const typ of ANNAEHERUNG) element.addEventListener(typ, ausloesen, { passive: true });
  window.addEventListener('hashchange', beiSprung);
  return aufraeumen;
}

// useSyncExternalStore liest auf dem Server und beim Hydrieren den Server-Wert, sonst den Client-Wert.
const keinAbo = () => () => {};
const clientWert = () => false;
const serverWert = () => true;

/**
 * Hält die Hydrierung an, bis das Tor offen ist. Gilt nur beim Hydrieren von Server-HTML: Auf dem Server
 * rendert der Inhalt sofort, bei einer Client-Navigation lädt er gleich (es gibt kein Server-HTML, das stehen bliebe).
 */
function Tor({ offen, children }: { offen: Promise<void>; children: ReactNode }) {
  const ausServerHtml = useSyncExternalStore(keinAbo, clientWert, serverWert);
  if (ausServerHtml && typeof window !== 'undefined') use(offen);
  return children;
}

/**
 * Lädt und hydriert eine Client-Insel unter der Falz erst in Reichweite (V6-A2). Der Inhalt (ein React.lazy)
 * steht vollständig im Server-HTML, ohne JavaScript wie bisher. Bis zur Annäherung bleibt <Activity> beim
 * Hydrieren entwässert: React lässt das Server-HTML unverändert stehen (kein Platzhalter, kein CLS) und lädt
 * den Code der Insel nicht. Bewusst kein <Suspense>: React lagert große Grenzen spät im Dokument aus
 * (`<div hidden>`), ohne JavaScript bliebe die Insel dann unsichtbar.
 */
export function HydrateNear({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tor] = useState(erstelleTor);

  useEffect(() => {
    const element = ref.current;
    return element ? beiAnnaeherung(element, tor.oeffnen) : undefined;
  }, [tor]);

  return (
    <div ref={ref}>
      <Activity>
        <Tor offen={tor.offen}>{children}</Tor>
      </Activity>
    </div>
  );
}
