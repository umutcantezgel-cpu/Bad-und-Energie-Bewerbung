'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motionAllowed } from '@/lib/motion/prefers';
import { ZEITPLAN, frontDurchmesser, frontZiel, klickPunkt, klickZiel } from '@/lib/motion/seitenwechsel';
import styles from './waermefront.module.css';

/** Ablauf der Front: abdecken → warten (Wechsel beauftragt) → aufdecken; null = Ruhe. */
type Phase = 'ab' | 'warten' | 'auf' | null;

const offen = (el: HTMLElement) => el.matches(':popover-open');
const zu = (el: HTMLElement) => {
  if (offen(el)) el.hidePopover();
};

/**
 * Klick-Wärme und Wärmefront (E-031, KERN K-009, Logik lib/motion/seitenwechsel.ts, CSS waermefront.module.css), einmal
 * im Layout. Zwei Überlagerungen als popover="manual" (oberste Ebene, auch über dem offenen Menü), aria-hidden und
 * inert; ohne Popover-Unterstützung oder bei reduzierter Bewegung zeigt die Insel nichts und jeder Klick wirkt sofort.
 *
 * - Klick-Wärme: ein Klick-Listener in der Erfassungsphase am Dokument; an Bedienelementen (nicht in Formularen, nicht
 *   im Bewerbungsweg) wachsen drei Scheiben am Zeiger, mit der Tastatur in der Mitte des Elements; nach 480 ms zu.
 *   Führt der Klick zur Wärmefront, ist sie die Rückmeldung (dieselben Schichten vom selben Punkt, nur bis zur Ecke).
 * - Wärmefront: Führt ein einfacher Klick zu einer Erzählseite (frontZiel), hält die Insel den Wechsel an
 *   (preventDefault – next/link bricht dann ab), lädt das Ziel vor und deckt vom Klickpunkt aus ab. Nach dem letzten
 *   Band (spätestens nach dem Netz) wechselt router.push die Seite; sobald der neue Pfad steht, nach zwei Bildern, deckt
 *   die Front auf, spätestens nach `halten`. Zurück/vor, die Rückkehr aus dem bfcache und ein Klick auf einen anderen
 *   Link beenden sie sofort.
 *
 * Reihenfolge: Der Listener sitzt in der Erfassungsphase am Dokument, wo React schon beim Hydrieren seine Listener
 * anmeldet. So hat ein onClickCapture der Seite (etwa nach einem Zug im Bewertungsband) den Klick schon abgefangen
 * (defaultPrevented), und next/link (onClick, Blasenphase) sieht unser preventDefault und wechselt nicht selbst.
 */
export function Waermefront() {
  const router = useRouter();
  const pfad = usePathname();
  const frontRef = useRef<HTMLDivElement>(null);
  const klickRef = useRef<HTMLDivElement>(null);
  const neuerPfad = useRef<() => void>(() => {});

  useEffect(() => {
    const front = frontRef.current;
    const klick = klickRef.current;
    if (!front || !klick || typeof front.showPopover !== 'function') return;
    let phase: Phase = null;
    let ziel = '';
    let uhr = 0;
    let klickUhr = 0;
    let bild = 0;

    const aus = () => {
      clearTimeout(uhr);
      cancelAnimationFrame(bild);
      phase = null;
      delete front.dataset.auf;
      zu(front);
    };
    const aufdecken = () => {
      if (phase !== 'warten') return;
      phase = 'auf';
      clearTimeout(uhr);
      uhr = window.setTimeout(aus, ZEITPLAN.aufdeckenNetz);
      front.dataset.auf = '';
    };
    const wechseln = () => {
      if (phase !== 'ab') return;
      phase = 'warten';
      clearTimeout(uhr);
      uhr = window.setTimeout(aufdecken, ZEITPLAN.halten);
      router.push(ziel);
    };
    // Neuer Pfad: zwei Bilder warten, damit die neue Seite unter der Front gemalt ist
    neuerPfad.current = () => {
      if (phase === 'warten') bild = requestAnimationFrame(() => (bild = requestAnimationFrame(aufdecken)));
    };
    /** Zeigt eine Überlagerung am Punkt neu; ihre Abläufe beginnen von vorn. */
    const zeige = (el: HTMLElement, x: number, y: number, durchmesser?: number) => {
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
      if (durchmesser) el.style.setProperty('--s', `${durchmesser}px`);
      zu(el);
      void el.offsetWidth;
      el.showPopover();
    };

    const beiKlick = (event: MouseEvent) => {
      const start = event.target;
      if (!(start instanceof Element)) return;
      const link = start.closest('a[href]');
      const neu = link ? frontZiel(event, link, location) : null;
      if (phase && link) {
        // Noch einmal zum selben Ziel: Der Wechsel läuft schon. Ein anderer Link: Er gilt, die Front endet sofort.
        if (neu === ziel && phase !== 'auf') {
          event.preventDefault();
          return;
        }
        aus();
      }
      if (!motionAllowed()) return;
      const bedien = klickZiel(start, location.pathname) as Element | null;
      const element = bedien ?? link;
      if (!element) return;
      const [x, y] = klickPunkt(event, element.getBoundingClientRect());
      if (neu) {
        event.preventDefault();
        router.prefetch(neu);
        aus();
        ziel = neu;
        phase = 'ab';
        zeige(front, x, y, frontDurchmesser(x, y, innerWidth, innerHeight));
        uhr = window.setTimeout(wechseln, ZEITPLAN.abdeckenNetz);
      } else if (bedien) {
        zeige(klick, x, y);
        clearTimeout(klickUhr);
        klickUhr = window.setTimeout(() => zu(klick), ZEITPLAN.klick);
      }
    };
    const beiEnde = (event: AnimationEvent) => {
      if (event.target === front.lastElementChild) wechseln();
      else if (event.target === front && phase === 'auf') aus();
    };

    document.addEventListener('click', beiKlick, true);
    front.addEventListener('animationend', beiEnde);
    addEventListener('popstate', aus);
    addEventListener('pageshow', aus);
    return () => {
      document.removeEventListener('click', beiKlick, true);
      front.removeEventListener('animationend', beiEnde);
      removeEventListener('popstate', aus);
      removeEventListener('pageshow', aus);
      clearTimeout(klickUhr);
      zu(klick);
      aus();
      neuerPfad.current = () => {};
    };
  }, [router]);

  useEffect(() => neuerPfad.current(), [pfad]);

  return (
    <>
      <div ref={klickRef} popover="manual" className={`${styles.e} ${styles.k}`} aria-hidden="true" inert data-motion="klick-waerme">
        <i />
        <i />
        <i />
      </div>
      <div ref={frontRef} popover="manual" className={styles.e} aria-hidden="true" inert data-motion="seitenwechsel">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
