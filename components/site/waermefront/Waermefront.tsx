'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { OHNE_UEBERLAGERUNG } from '@/lib/motion/prefers';
import {
  AUFDECKEN_NETZ_MS,
  AUFTAKT,
  HALTEN_MS,
  KLICK_ZU_MS,
  LAEDT,
  RUHE_BILDER,
  WECHSEL_NETZ_MS,
  frontMass,
  frontSteigen,
  frontZiel,
  imBewerbungsweg,
  klickPunkt,
  klickZiel,
  linkPfad,
} from '@/lib/motion/seitenwechsel';
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
 * inert; ohne Popover-Unterstützung, bei reduzierter Bewegung und in erzwungenen Farben (forced-colors, Prüfrunde 3
 * C3-4: dort würden aus den Schichten schwarze Zielscheiben auf weißer Fläche) zeigt die Insel nichts und jeder Klick
 * wirkt sofort.
 *
 * - Klick-Wärme: ein Klick-Listener in der Erfassungsphase am Dokument; an Bedienelementen (nicht in Formularen, nicht
 *   im Bewerbungsweg und nicht auf dem Weg dorthin) wachsen drei Ringe am Zeiger, mit der Tastatur in der Mitte des
 *   Elements; nach 480 ms zu, spätestens beim Wechsel in den Bewerbungsweg. Die Überlagerung trägt den Ton der
 *   getroffenen Fläche (data-tone, Prüfrunde 3 A3-1): Die Ringe heben sich auf Papier, Nacht und Navy gleich ab.
 *   Führt der Klick zur Wärmefront, ist sie die Rückmeldung (dieselben Schichten vom selben Punkt, nur bis zur Ecke).
 * - Wärmefront (Prüfrunde 4 A4-2, A4-3): Führt ein einfacher Klick zu einer Erzählseite (frontZiel), hält die Insel den
 *   Wechsel an (preventDefault – next/link bricht dann ab), lädt das Ziel vor und deckt vom Klickpunkt aus ab: Die
 *   Schichten stehen ab dem ersten Bild als eigene Ebenen in der Startgröße (will-change) und wachsen erst nach dem
 *   Vorlauf (--v, ½ Takt), so sind sie gerastert, bevor sie groß werden. Deckt die erste Scheibe das Fenster
 *   (animationend, spätestens nach dem Netz), wechselt router.push die Seite; die übrigen Schichten wachsen weiter, zuletzt
 *   die in der Seitenfarbe. Deckt sie das Fenster, blendet die Insel die warmen Schichten darunter aus (--o: 0). Ab dem
 *   neuen Pfad zählt die Insel Bilder ohne Änderung im Dokument (die Front selbst zählt nicht), ohne nachladenden
 *   Bereich (LAEDT), ohne ladendes Bild und ohne endlichen Ablauf der Seite; sind es RUHE_BILDER und deckt die
 *   Seitenfarbe, steigt die Front aus dem Bild (--h), spätestens nach `halten`; ist sie oben angekommen
 *   (transitionend), ist sie zu. Zurück/vor, die Rückkehr aus dem bfcache und ein Klick auf einen anderen Link beenden
 *   sie sofort. Die neue Seite steht oben: <html data-scroll-behavior="smooth"> (app/layout.tsx) lässt Next beim
 *   Wechsel ohne weiches Scrollen springen.
 * - Auftakt: Jeder Wechsel innerhalb der Seite nimmt die Klasse `auftakt` weg, bevor die neue Seite gemalt wird
 *   (useLayoutEffect); sie steht dann im Endzustand, und kein Auftakt bricht am Sicherheitsnetz mitten im Lauf ab.
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
    // Beide Überlagerungen stehen im selben Markup; ohne Popover-Unterstützung keine von beiden
    const klick = klickRef.current!;
    if (!front?.showPopover) return;
    let phase: Phase = null;
    let ziel = '';
    // Deckt die letzte Schicht (Seitenfarbe) das Fenster?
    let voll = false;
    let uhr: ReturnType<typeof setTimeout> | undefined;
    let klickUhr: ReturnType<typeof setTimeout> | undefined;
    let bild = 0;
    // Ruhe der neuen Seite: Bilder in Folge ohne Änderung im Dokument (jede Änderung malt die Seite neu)
    let still = 0;
    const beob = new MutationObserver(() => (still = 0));

    const aus = () => {
      clearTimeout(uhr);
      cancelAnimationFrame(bild);
      beob.disconnect();
      phase = null;
      delete front.dataset.auf;
      zu(front);
    };
    const aufdecken = () => {
      if (phase !== 'warten') return;
      phase = 'auf';
      clearTimeout(uhr);
      uhr = setTimeout(aus, AUFDECKEN_NETZ_MS);
      front.dataset.auf = '';
      // Die Scheiben steigen um --h aus dem Bild (translate, d-2 mit k-aus)
      front.style.cssText += ';--u:1';
    };
    const wechseln = () => {
      if (phase !== 'ab') return;
      phase = 'warten';
      clearTimeout(uhr);
      uhr = setTimeout(aufdecken, HALTEN_MS);
      // Ab hier zählt jede Änderung der neuen Seite gegen die Ruhe (auch das Nachladen vor dem neuen Pfad)
      still = 0;
      beob.observe(document.body, { subtree: true, childList: true, attributes: true });
      // Unter der deckenden Front: Die neue Seite steht im Endzustand (kein Auftakt nach einem Wechsel)
      document.documentElement.classList.remove(AUFTAKT);
      router.push(ziel);
    };
    // Je Bild: ruht die neue Seite RUHE_BILDER Bilder lang (nichts geändert, kein Bereich lädt nach – Platzhalter tragen
    // data-laedt –, kein Bild lädt; Bilder mit loading="lazy" laden erst bei Annäherung; kein endlicher Ablauf der Seite
    // läuft, an dessen Ende sie neu malte – die Schichten der Front zählen nicht, Schleifen auch nicht) und deckt die
    // Seitenfarbe das Fenster, deckt die Front auf; sonst weiter warten, höchstens bis `halten`
    const ruhe = () => {
      if (phase !== 'warten') return;
      still =
        document.querySelector(LAEDT) ||
        [...document.images].some((i) => !i.complete && i.loading !== 'lazy') ||
        document.getAnimations().some((a) => a.playState === 'running' && a.effect!.getTiming().iterations! < Infinity && (a.effect as KeyframeEffect).target!.closest('main'))
          ? 0
          : still + 1;
      if (still >= RUHE_BILDER && voll) aufdecken();
      else bild = requestAnimationFrame(ruhe);
    };
    // Neuer Pfad: Die neue Seite malt unter der Front; im Bewerbungsweg keine Wärme
    neuerPfad.current = () => {
      if (imBewerbungsweg(location.pathname)) zu(klick);
      if (phase === 'warten') bild = requestAnimationFrame(ruhe);
    };
    /**
     * Zeigt eine Überlagerung am Punkt neu; ihre Abläufe beginnen von vorn. Die Front: Scheiben in der Grundgröße
     * (--s), die per transform auf den Durchmesser bis zur fernsten Ecke wachsen (frontMass: immer ein Kreis, kleine
     * Ebenen), nach dem Vorlauf (CSS --v).
     */
    const zeige = (el: HTMLElement, x: number, y: number, mass?: { grund: number; faktor: number }) => {
      // Nur diese Variablen stehen inline: Mittelpunkt, bei der Front Grundgröße, Weg nach oben und Faktor
      el.style.cssText = `--x:${x}px;--y:${y}px` + (mass ? `;--s:${mass.grund}px;--h:${frontSteigen(y, mass)}px;--m:${mass.faktor}` : '');
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
      if (matchMedia(OHNE_UEBERLAGERUNG).matches) return;
      const bedien = klickZiel(start, location.pathname, link ? linkPfad(link, location) : null) as Element | null;
      const element = bedien ?? link;
      if (!element) return;
      const [x, y] = klickPunkt(event, element.getBoundingClientRect());
      if (neu) {
        // Die Front ist zu (Ruhe oder eben beendet, siehe oben)
        event.preventDefault();
        router.prefetch(neu);
        ziel = neu;
        phase = 'ab';
        voll = false;
        zeige(front, x, y, frontMass(x, y, innerWidth, innerHeight));
        uhr = setTimeout(wechseln, WECHSEL_NETZ_MS);
      } else if (bedien) {
        // Ton der getroffenen Fläche (Papier, Navy-Band, Wärmebereich): Die Rollen der Ringe folgen ihm (theme.css)
        klick.dataset.tone = bedien.closest<HTMLElement>('[data-tone]')?.dataset.tone ?? '';
        zeige(klick, x, y);
        clearTimeout(klickUhr);
        klickUhr = setTimeout(() => zu(klick), KLICK_ZU_MS);
      }
    };
    // Ende der ersten Schicht beim Abdecken (sie deckt das Fenster): wechseln. Ende der letzten (die Seitenfarbe deckt
    // das Fenster): die warmen Schichten darunter ausblenden; diese eigene Änderung zählt nicht gegen die Ruhe. Das
    // Steigen (der einzige Übergang der Schichten) ist zu Ende (transitionend): Die Front ist aus dem Bild, sie schließt.
    const beiEnde = (event: AnimationEvent) => {
      if (event.target === front.firstElementChild) wechseln();
      else if (event.target === front.lastElementChild) {
        voll = true;
        front.style.cssText += ';--o:0';
        beob.takeRecords();
      }
    };

    document.addEventListener('click', beiKlick, true);
    front.addEventListener('animationend', beiEnde);
    front.addEventListener('transitionend', aus);
    addEventListener('popstate', aus);
    addEventListener('pageshow', aus);
    return () => {
      document.removeEventListener('click', beiKlick, true);
      front.removeEventListener('animationend', beiEnde);
      front.removeEventListener('transitionend', aus);
      removeEventListener('popstate', aus);
      removeEventListener('pageshow', aus);
      clearTimeout(klickUhr);
      zu(klick);
      aus();
      neuerPfad.current = () => {};
    };
  }, [router]);

  // Wechsel innerhalb der Seite (nicht beim Hydrieren): Auftakt weg, bevor die neue Seite gemalt wird; dann die Front
  const vorher = useRef(pfad);
  useLayoutEffect(() => {
    if (vorher.current === pfad) return;
    vorher.current = pfad;
    document.documentElement.classList.remove(AUFTAKT);
    neuerPfad.current();
  }, [pfad]);

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
