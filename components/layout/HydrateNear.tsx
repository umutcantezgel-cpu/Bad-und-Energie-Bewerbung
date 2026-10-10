'use client';

import { Activity, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

/**
 * Vorlauf vor dem Bildschirm: Die Insel lädt rund eine Handyhöhe vorher, damit sie bedienbar ist, bevor
 * jemand sie erreicht.
 */
export const VORLAUF = '600px 0px';

/**
 * Pointer über der Insel oder Fokus darin (Tab): sofort laden, auch ohne Scrollen. Gehört wird auf `window` in
 * der Capture-Phase: React hält solche Ereignisse über einer noch entwässerten Grenze am Dokument an, ein
 * Zuhörer an der Insel selbst bekäme sie nie.
 */
const ANNAEHERUNG = ['focusin', 'pointerover'] as const;

type Ort = Pick<Location, 'href' | 'origin' | 'pathname' | 'search'>;

/**
 * Klick auf einen Link zu derselben Seite (`/#ablauf` im Kopf der Startseite, das Logo auf `/`): Bei dieser
 * Navigation wartet der Router, bis jede noch entwässerte Insel hydriert ist. Ohne offenes Tor bliebe der
 * Klick wirkungslos, bis jemand die Insel erreicht.
 */
export function linkAufDieseSeite(ziel: EventTarget | null, ort: Ort): boolean {
  if (!ziel || !('closest' in ziel) || typeof ziel.closest !== 'function') return false;
  const link = (ziel as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link) return false;
  const url = new URL(link.href, ort.href);
  return url.origin === ort.origin && url.pathname === ort.pathname && url.search === ort.search;
}

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
 * Bildschirm unter VORLAUF, Fokus oder Pointer darin, Klick auf einen Link zu derselben Seite. Gibt das
 * Aufräumen zurück.
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
  const beiNaehe = (event: Event) => {
    if (event.target && element.contains(event.target as Node)) ausloesen();
  };
  const beiKlick = (event: Event) => {
    if (linkAufDieseSeite(event.target, window.location)) ausloesen();
  };
  function aufraeumen() {
    beobachter.disconnect();
    for (const typ of ANNAEHERUNG) window.removeEventListener(typ, beiNaehe, { capture: true });
    window.removeEventListener('click', beiKlick, { capture: true });
    window.removeEventListener('hashchange', beiSprung);
  }
  function ausloesen() {
    aufraeumen();
    nah();
  }
  beobachter.observe(element);
  for (const typ of ANNAEHERUNG) window.addEventListener(typ, beiNaehe, { capture: true, passive: true });
  window.addEventListener('click', beiKlick, { capture: true });
  window.addEventListener('hashchange', beiSprung);
  return aufraeumen;
}

/** Lädt den Code der Insel im Leerlauf nach dem Hydrieren vor, ohne sie zu hydrieren. Gibt das Abbrechen zurück. */
export function imLeerlauf(laden: () => Promise<unknown>): () => void {
  const vorladen = () => {
    laden().catch(() => {});
  };
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(vorladen, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const zeit = window.setTimeout(vorladen, 2000);
  return () => window.clearTimeout(zeit);
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
 * Hydriert eine Client-Insel unter der Falz erst in Reichweite (V6-A2). Der Inhalt (ein React.lazy) steht
 * vollständig im Server-HTML, ohne JavaScript wie bisher. Bis zur Annäherung bleibt <Activity> beim Hydrieren
 * entwässert: React lässt das Server-HTML unverändert stehen (kein Platzhalter, kein CLS). `laden` (derselbe
 * Import wie im React.lazy) holt den Code im Leerlauf vorab, damit die Insel bei einem Sprung oder Klick ohne
 * Wartezeit auf das Netz hydriert und keine Eingabe verloren geht. Bewusst kein <Suspense>: React lagert große
 * Grenzen spät im Dokument aus (`<div hidden>`), ohne JavaScript bliebe die Insel dann unsichtbar.
 */
export function HydrateNear({ laden, children }: { laden: () => Promise<unknown>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tor] = useState(erstelleTor);

  useEffect(() => {
    const element = ref.current;
    return element ? beiAnnaeherung(element, tor.oeffnen) : undefined;
  }, [tor]);

  useEffect(() => imLeerlauf(laden), [laden]);

  return (
    <div ref={ref}>
      <Activity>
        <Tor offen={tor.offen}>{children}</Tor>
      </Activity>
    </div>
  );
}
