/**
 * Zeichnung der Teilen-Bilder (lib/seo/og-render.tsx) seit E-029: derselbe Hausschnitt wie im Einstieg der Startseite,
 * aus denselben Modulen (lib/zeichnung/szenen/hausschnitt.ts, 1 Einheit = 10 mm; Außeneinheit aus
 * lib/zeichnung/geraete/ansicht.ts mit den Maßen von compress-aw-s.ts; Pumpe aus lib/zeichnung/symbole.ts). Hier
 * stehen nur die Auswahl und die Umrechnung für next/og: Das Teilen-Bild kennt kein non-scaling-stroke und keine
 * verschachtelte viewBox, darum liegt die Außeneinheit als Gruppe mit Maßstab 1 : 10 im Schnitt.
 *
 * Abgelöst (E-029): das Haus im Wärmebild aus Variante 3 mit Isothermen, Zirkelzeichen im Giebel, Lüfter als Windrad
 * und dem Vorlauf aus dem Knopf in die Wärmepumpe. Jetzt läuft der Vorlauf von der Außeneinheit zum Knopf (K-001).
 */
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { vorderansicht } from '@/lib/zeichnung/geraete/ansicht';
import { MASSSTAB } from '@/lib/zeichnung/norm';
import {
  BAUTEILE,
  GERAET_LAGE,
  GIEBEL_MASS,
  HAUSSCHNITT_ERDLEITUNG,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  INNENEINHEIT_LAGE,
  LEITUNGEN,
  PFEILE,
  type Leitung,
  type Pfeil,
} from '@/lib/zeichnung/szenen/hausschnitt';
import { SYMBOLE } from '@/lib/zeichnung/symbole';

/** Rahmen des Hausschnitts (Einheiten) und die Höhe der Erdleitung, auf der der Vorlauf zum Knopf läuft. */
export const OG_HAUS_RAHMEN = HAUSSCHNITT_RAHMEN;
export const OG_ERDLEITUNG_Y = HAUSSCHNITT_ERDLEITUNG.vorlauf;

/** Schnittflächen, Erdreich und Gelände wie im Einstieg. */
export const OG_BAUTEILE = BAUTEILE;

/**
 * Leitungen und feste Fließpfeile des Teilen-Bilds: der Hausschnitt ohne die Leitungen zur Bewerbung; mit Knopf dazu
 * der Abzweig, der links aus dem Bild zum Knopf läuft (die Fassung des Desktops, `knopf-desktop`).
 */
export function ogLeitungen(knopf: boolean): readonly Leitung[] {
  return LEITUNGEN.filter((l) => !l.nur || (knopf && l.nur === 'knopf-desktop'));
}

export function ogPfeile(knopf: boolean): readonly Pfeil[] {
  return PFEILE.filter((p) => !p.nur || (knopf && p.nur === 'knopf'));
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
