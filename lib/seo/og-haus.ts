/**
 * Zeichnung der Teilen-Bilder (lib/seo/og-render.tsx) seit E-029: derselbe Hausschnitt wie im Einstieg der Startseite,
 * aus denselben Modulen (lib/zeichnung/szenen/hausschnitt.ts, 1 Einheit = 10 mm; Außeneinheit aus
 * lib/zeichnung/geraete/ansicht.ts mit den Maßen von compress-aw-s.ts; Pumpe aus lib/zeichnung/symbole.ts). Hier
 * stehen nur die Auswahl und die Umrechnung für next/og: Das Teilen-Bild kennt kein non-scaling-stroke und keine
 * verschachtelte viewBox, darum liegt die Außeneinheit als Gruppe mit Maßstab 1 : 10 im Schnitt.
 *
 * Abgelöst (E-029): das Haus im Wärmebild aus Variante 3 mit gezeichneten Isothermen, Zirkelzeichen im Giebel, Lüfter
 * als Windrad und dem Vorlauf aus dem Knopf in die Wärmepumpe. Jetzt läuft der Vorlauf von der Außeneinheit zum Knopf
 * (K-001). Seit E-031 steht im Raum das berechnete Wärmefeld still (lib/zeichnung/szenen/waermefeld.ts), im Endzustand
 * wie auf der Website; Heizkörper, Inneneinheit, Leitungen und Pfeile im Raum in den Rollen des Wärmebereichs.
 */
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { vorderansicht } from '@/lib/zeichnung/geraete/ansicht';
import { MASSSTAB } from '@/lib/zeichnung/norm';
import {
  BAUTEILE,
  GERAET_LAGE,
  GIEBEL_MASS,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  INNENEINHEIT_LAGE,
  KNOPF_LEITUNG,
  LEITUNGEN,
  PFEILE,
  type Leitung,
  type Pfeil,
} from '@/lib/zeichnung/szenen/hausschnitt';
import { SYMBOLE } from '@/lib/zeichnung/symbole';
import { WAERMEFELDER } from '@/lib/zeichnung/szenen/waermefeld';
import { WAERMEFELD_AN } from '@/lib/zeichnung/waerme/schalter';
import { TOKENS } from '@/lib/tokens';

/**
 * Rahmen des Hausschnitts (Einheiten) und die Höhe, auf der der Vorlauf zum Knopf links aus dem Schnitt läuft (wie am
 * Desktop: `KNOPF_LEITUNG.desktopY`, zwischen Frosttiefe und Kiesbett).
 */
export const OG_HAUS_RAHMEN = HAUSSCHNITT_RAHMEN;
export const OG_ERDLEITUNG_Y = KNOPF_LEITUNG.desktopY;

/** Schnittflächen, Erdreich und Gelände wie im Einstieg. */
export const OG_BAUTEILE = BAUTEILE;

/** Fassung des Teilen-Bilds: die des Desktops (`knopf-desktop`) und die gemeinsamen Stücke (`knopf`). */
const imBild = (nur: Leitung['nur']) => nur === 'knopf' || nur === 'knopf-desktop';

/**
 * Leitungen und feste Fließpfeile des Teilen-Bilds: der Hausschnitt ohne die Leitungen zur Bewerbung; mit Knopf dazu
 * der Abzweig (T-Stück hinter dem Gehäuse, verdeckt), der links aus dem Bild zum Knopf läuft (die Fassung des Desktops).
 */
export function ogLeitungen(knopf: boolean): readonly Leitung[] {
  return LEITUNGEN.filter((l) => !l.nur || (knopf && imBild(l.nur)));
}

export function ogPfeile(knopf: boolean): readonly Pfeil[] {
  return PFEILE.filter((p) => !p.nur || (knopf && imBild(p.nur)));
}

/** Außeneinheit von vorn in der einfachen Detailstufe (mm), eingesetzt mit 1 : 10 an ihrer Lage im Schnitt. */
export const OG_GERAET = Object.freeze({
  ansicht: vorderansicht(COMPRESS_AW_S, { detail: 'einfach', massketten: false }),
  lage: GERAET_LAGE,
  massstab: 1 / MASSSTAB.haus,
});

/** Inneneinheit (Systemgrenze, Modell offen) mit der Umwälzpumpe als Normsymbol, Flachheizkörper 600 × 1.000 mm. */
export const OG_INNENEINHEIT = INNENEINHEIT_LAGE;
export const OG_PUMPE = Object.freeze({ formen: SYMBOLE.pumpe.formen, massstab: 1.4 });
export const OG_HEIZKOERPER = HEIZKOERPER_LAGE;

/** Lage des Maßes „35 km“ im Giebel (Mitte der Schrift). */
export const OG_GIEBEL_MASS = GIEBEL_MASS;

/**
 * Wärmefeld im Raum (E-031): die Bänder des Hausschnitts aus den Daten, Band 0 bis 4 in der hellen Wärmerampe (das
 * Teilen-Bild ist immer hell); `null` mit dem Notschalter WAERMEFELD_AN = false.
 */
export const OG_WAERMEFELD = WAERMEFELD_AN ? WAERMEFELDER.hausschnitt : null;
export const OG_WAERME_RAMPE = TOKENS.waerme.hell;
