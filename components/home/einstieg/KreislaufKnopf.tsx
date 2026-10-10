'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AUFTAKT_KLASSE } from '@/lib/motion/head-script';

/** Attribut an der Szene, unter dem die Wiederholung läuft (einstieg.module.css). */
export const KREISLAUF_ATTR = 'data-kreislauf';

/**
 * Startet den Auftakt der Szene neu (Register `kreislauf-zeigen`): Die Klasse `auftakt` des Kopfskripts
 * endet, damit beide Auslöser nicht gleichzeitig greifen; dann wechselt die Szene von „ruhe“ auf „lauf“,
 * mit einer erzwungenen Stilberechnung dazwischen, damit die Abläufe von vorn beginnen.
 */
export function kreislaufStarten(szene: Element, html: Element): void {
  html.classList.remove(AUFTAKT_KLASSE);
  szene.setAttribute(KREISLAUF_ATTR, 'ruhe');
  void szene.getBoundingClientRect();
  szene.setAttribute(KREISLAUF_ATTR, 'lauf');
}

const leer = () => () => {};

export interface KreislaufKnopfProps {
  /** Icon und Beschriftung (vom Server gerendert, hält die Insel klein). */
  children: ReactNode;
  className: string;
  /** Bis zur Hydration unsichtbar, mit Platz (ohne Skript bleibt der Knopf verborgen). */
  wartetClassName: string;
  /** Dauer eines Durchlaufs (AUFTAKT_ENDE_MS); solange gilt aria-disabled. */
  dauerMs: number;
}

/**
 * Textknopf „Kreislauf zeigen“ (B Runde 1): spielt die Anlaufsequenz der Szene erneut ab. Während des
 * Laufs `aria-disabled`; bei reduzierter Bewegung blendet CSS ihn aus (die Szene steht im Endzustand).
 */
export function KreislaufKnopf({ children, className, wartetClassName, dauerMs }: KreislaufKnopfProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const bereit = useSyncExternalStore(leer, () => true, () => false);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    if (!laeuft) return;
    const timer = window.setTimeout(() => setLaeuft(false), dauerMs);
    return () => window.clearTimeout(timer);
  }, [laeuft, dauerMs]);

  const zeigen = () => {
    const szene = ref.current?.closest(`[${KREISLAUF_ATTR}]`);
    if (laeuft || !szene) return;
    kreislaufStarten(szene, document.documentElement);
    setLaeuft(true);
  };

  return (
    <button
      ref={ref}
      type="button"
      className={bereit ? className : `${className} ${wartetClassName}`}
      aria-disabled={laeuft || undefined}
      onClick={zeigen}
      data-motion="kreislauf-zeigen"
    >
      {children}
    </button>
  );
}
