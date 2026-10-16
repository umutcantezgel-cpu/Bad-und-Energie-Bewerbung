'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { OHNE_UEBERLAGERUNG } from '@/lib/motion/prefers';
import {
  AUFDECKEN_NETZ_MS,
  AUFTAKT,
  HALTEN_MS,
  KLICK_ZU_MS,
  RUHE_BILDER,
  RUHE_MS,
  WECHSEL_NETZ_MS,
  frontMass,
  frontZiel,
  imBewerbungsweg,
  klickPunkt,
  klickZiel,
  linkPfad,
} from '@/lib/motion/seitenwechsel';
import styles from './waermefront.module.css';

/** Ablauf der Front: abdecken → warten (Wechsel beauftragt) → aufdecken; 0 = Ruhe (Zahlen: kürzer im Bündel). */
const AB = 1;
const WARTEN = 2;
const AUF = 3;
type Phase = 0 | typeof AB | typeof WARTEN | typeof AUF;

/** Schließt eine Überlagerung; ohne data-auf steht sie beim nächsten Öffnen wieder voll da (ohne Übergang). */
const zu = (el: HTMLElement) => {
  delete el.dataset.auf;
  if (el.matches(':popover-open')) el.hidePopover();
};

/**
 * Klick-Wärme und Wärmefront (E-031, KERN K-009, Logik lib/motion/seitenwechsel.ts, CSS waermefront.module.css), einmal
 * im Layout. Zwei Überlagerungen als popover="manual" (oberste Ebene, auch über dem offenen Menü), aria-hidden und
 * inert; ohne Popover-Unterstützung, bei reduzierter Bewegung und in erzwungenen Farben (forced-colors, Prüfrunde 3
 * C3-4: dort würden aus den Schichten schwarze Zielscheiben auf weißer Fläche) zeigt die Insel nichts und jeder Klick
 * wirkt sofort. Beide sind sanft (Owner-Feedback 16.10.2026): nichts springt, nichts blitzt, alles blendet.
 *
 * - Klick-Wärme: ein Klick-Listener in der Erfassungsphase am Dokument; an Bedienelementen (nicht in Formularen, nicht
 *   im Bewerbungsweg und nicht auf dem Weg dorthin) stehen drei Ringe um die Box des Elements (--x, --y Mitte, --w, --h
 *   Größe; Prüfrunde 5 A5-4: die Beschriftung bleibt frei). Steht der äußere Ring (animationend), verklingen alle
 *   gemeinsam (data-auf); am Ende dieses Übergangs (transitionend) ist sie zu, sonst nach dem Netz (Prüfrunde 5 C5-3),
 *   spätestens beim Wechsel in den Bewerbungsweg. Die Überlagerung trägt den Ton der getroffenen Fläche (data-tone,
 *   Prüfrunde 3 A3-1). Führt der Klick zur Wärmefront, ist sie die Rückmeldung.
 * - Wärmefront: Führt ein einfacher Klick zu einer Erzählseite (frontZiel), hält die Insel den Wechsel an
 *   (preventDefault – next/link bricht dann ab), lädt das Ziel vor und legt vom Klickpunkt aus einen Wärmeschleier über
 *   die Seite (frontMass: Grundgröße --s, Faktor --m bis zur fernsten Ecke, Startmaßstab --z). Deckt die Seitenfarbe
 *   das Fenster (animationend der letzten Schicht, spätestens nach dem Netz), wechselt router.push die Seite. Mit dem
 *   neuen Pfad hebt die Insel <main> auf eine eigene Ebene, unsichtbar und ein Stück tiefer (.h: ein angehaltener
 *   Ablauf), und zählt Bilder ohne Änderung im Dokument (die Front selbst zählt nicht), ohne ladendes Bild und ohne
 *   laufenden endlichen Ablauf der Seite; sind es RUHE_BILDER, spätestens nach `ruhe` (ohne neuen Pfad nach `halten`),
 *   deckt sie auf: Die Front verblasst (data-auf), und <main> taucht auf und steigt an seinen Platz (.a: der Ablauf
 *   läuft). Nachladende Bereiche wartet sie nicht ab, sie warten auf die Front (nachDerFront, Prüfrunde 5 C5-2). Ist
 *   die Front verblasst (transitionend), ist sie zu. Zurück/vor, die Rückkehr aus dem bfcache und ein Klick auf einen
 *   anderen Link beenden sie sofort. Die neue Seite steht oben: <html data-scroll-behavior="smooth"> (app/layout.tsx)
 *   lässt Next beim Wechsel ohne weiches Scrollen springen.
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
    const haupt = document.querySelector('main')!.classList;
    let phase: Phase = 0;
    let ziel = '';
    let uhr: ReturnType<typeof setTimeout> | undefined;
    let klickUhr: ReturnType<typeof setTimeout> | undefined;
    // Ruhe der neuen Seite: Bilder in Folge ohne Änderung im Dokument (jede Änderung malt die Seite neu)
    let still = 0;
    const beob = new MutationObserver(() => (still = 0));

    const aus = () => {
      // Eine noch ausstehende Ruheprüfung endet von selbst (phase)
      clearTimeout(uhr);
      beob.disconnect();
      phase = 0;
      haupt.remove(styles.h, styles.a);
      zu(front);
    };
    const aufdecken = () => {
      if (phase !== WARTEN) return;
      phase = AUF;
      clearTimeout(uhr);
      uhr = setTimeout(aus, AUFDECKEN_NETZ_MS);
      // Die Front verblasst, <main> taucht auf und steigt (je ein Takt + d-3 mit k-wechsel)
      front.dataset.auf = '';
      haupt.add(styles.a);
    };
    const wechseln = () => {
      if (phase !== AB) return;
      phase = WARTEN;
      clearTimeout(uhr);
      uhr = setTimeout(aufdecken, HALTEN_MS);
      // Ab hier zählt jede Änderung der neuen Seite gegen die Ruhe (auch das Nachladen vor dem neuen Pfad)
      still = 0;
      beob.observe(document.body, { subtree: true, childList: true, attributes: true });
      // Unter der deckenden Front: Die neue Seite steht im Endzustand (kein Auftakt nach einem Wechsel)
      document.documentElement.classList.remove(AUFTAKT);
      router.push(ziel);
    };
    // Je Bild: ruht die neue Seite RUHE_BILDER Bilder lang (nichts geändert, kein Bild lädt – Bilder mit loading="lazy"
    // laden erst bei Annäherung –, kein endlicher Ablauf der Seite läuft, an dessen Ende sie neu malte; die Schichten der
    // Front zählen nicht, Schleifen auch nicht), deckt die Front auf; sonst weiter warten, höchstens bis `ruhe`
    const ruhe = () => {
      if (phase !== WARTEN) return;
      still =
        [...document.images].some((i) => !i.complete && i.loading !== 'lazy') ||
        document.getAnimations().some((a) => a.playState === 'running' && a.effect!.getTiming().iterations! < Infinity && (a.effect as KeyframeEffect).target!.closest('main'))
          ? 0
          : still + 1;
      if (still >= RUHE_BILDER) aufdecken();
      else requestAnimationFrame(ruhe);
    };
    // Neuer Pfad: Die neue Seite malt unter der Front; <main> wird eine Ebene (malt jetzt, nicht beim Aufdecken) und
    // wartet unsichtbar ein Stück tiefer. Im Bewerbungsweg keine Wärme.
    neuerPfad.current = () => {
      if (imBewerbungsweg(location.pathname)) zu(klick);
      if (phase !== WARTEN) return;
      haupt.add(styles.h);
      clearTimeout(uhr);
      uhr = setTimeout(aufdecken, RUHE_MS);
      requestAnimationFrame(ruhe);
    };
    /** Zeigt eine Überlagerung neu, mit ihren Variablen; ihre Abläufe beginnen von vorn. */
    const zeige = (el: HTMLElement, css: string) => {
      el.style.cssText = css;
      zu(el);
      void el.offsetWidth;
      el.showPopover();
    };

    const klickZu = () => zu(klick);
    const beiKlick = (event: MouseEvent) => {
      const start = event.target;
      if (!(start instanceof Element)) return;
      const link = start.closest('a[href]');
      const neu = link ? frontZiel(event, link, location) : null;
      if (phase && link) {
        // Noch einmal zum selben Ziel: Der Wechsel läuft schon. Ein anderer Link: Er gilt, die Front endet sofort.
        if (neu === ziel && phase !== AUF) {
          event.preventDefault();
          return;
        }
        aus();
      }
      if (matchMedia(OHNE_UEBERLAGERUNG).matches) return;
      const bedien = klickZiel(start, location.pathname, link ? linkPfad(link, location) : null) as Element | null;
      const element = bedien ?? link;
      if (!element) return;
      const box = element.getBoundingClientRect();
      if (neu) {
        // Die Front ist zu (Ruhe oder eben beendet, siehe oben); Mittelpunkt, Grundgröße, Faktor und Startmaßstab
        event.preventDefault();
        router.prefetch(neu);
        ziel = neu;
        phase = AB;
        const [x, y] = klickPunkt(event, box);
        const [grund, faktor, start] = frontMass(x, y, innerWidth, innerHeight);
        zeige(front, `--x:${x}px;--y:${y}px;--s:${grund}px;--m:${faktor};--z:${start}`);
        uhr = setTimeout(wechseln, WECHSEL_NETZ_MS);
      } else if (bedien) {
        // Ton der getroffenen Fläche (Papier, Navy-Band, Wärmebereich): Die Rollen der Ringe folgen ihm (theme.css)
        klick.dataset.tone = bedien.closest<HTMLElement>('[data-tone]')?.dataset.tone ?? '';
        zeige(klick, `--x:${box.left + box.width / 2}px;--y:${box.top + box.height / 2}px;--w:${box.width}px;--h:${box.height}px`);
        clearTimeout(klickUhr);
        klickUhr = setTimeout(klickZu, KLICK_ZU_MS);
      }
    };
    // Ende eines Ablaufs: Die letzte Schicht der Front (die Seitenfarbe deckt, das Wachsen ist am Ziel) – wechseln; der
    // äußere Ring der Klick-Wärme steht – alle verklingen. Ende eines Übergangs (nur das Verblassen): zu.
    const beiEnde = (event: AnimationEvent) => {
      if (event.target === front.lastElementChild) wechseln();
      else if (event.target === klick.firstElementChild) klick.dataset.auf = '';
    };
    document.addEventListener('click', beiKlick, true);
    front.addEventListener('animationend', beiEnde);
    klick.addEventListener('animationend', beiEnde);
    front.addEventListener('transitionend', aus);
    klick.addEventListener('transitionend', klickZu);
    addEventListener('popstate', aus);
    addEventListener('pageshow', aus);
    return () => {
      document.removeEventListener('click', beiKlick, true);
      front.removeEventListener('animationend', beiEnde);
      klick.removeEventListener('animationend', beiEnde);
      front.removeEventListener('transitionend', aus);
      klick.removeEventListener('transitionend', klickZu);
      removeEventListener('popstate', aus);
      removeEventListener('pageshow', aus);
      // neuerPfad bleibt stehen: Ohne die Insel läuft auch ihr useLayoutEffect nicht mehr
      clearTimeout(klickUhr);
      zu(klick);
      aus();
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
      <div ref={frontRef} popover="manual" className={`${styles.e} ${styles.f}`} aria-hidden="true" inert data-motion="seitenwechsel">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
