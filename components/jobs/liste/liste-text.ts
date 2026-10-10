import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import type { Job } from '@/lib/jobs/registry';

/**
 * Texte der Stellenliste `/jobs` (R5-JOBS-01, E-023), nur aus belegten Quellen gebaut: lib/content/facts.ts,
 * lib/data/company.ts (über COMPANY) und die Stellendaten. Reines Modul, geprüft in
 * components/jobs/__tests__/liste.test.ts.
 *
 * Faktenverteilung im Kopf (ein Abschnitt nennt jeden Fakt einmal):
 * - 13:30 steht im Heizkreis der Zeichnung, nicht noch einmal in Unterzeile oder Einleitung;
 * - 30 Tage und 35 km stehen als Maße an der Zeichnung; „35 km“ kehrt nur in REGION.headline (Einsatzgebiet) wieder;
 * - 1926 steht in der Einleitung (Fakt founded1926), darum nicht als Maß.
 */

const NBSP = ' ';

/** Geschütztes Leerzeichen in Zahl-Wort-Paaren („30 Tage“, „35 km“, „60 Sekunden“; K-012). */
export function schuetzeZahlen(text: string): string {
  return text.replace(/(\d) (?=[\p{L}%€])/gu, `$1${NBSP}`);
}

/** Etikett über der h1, gezählt aus den Stellen, die gerade live sind: „4 Stellen · Wetzlar“. */
export function listenEtikett(anzahl: number): string {
  if (anzahl === 0) return `Initiativbewerbung · ${COMPANY.address.city}`;
  return `${anzahl}${NBSP}${anzahl === 1 ? 'Stelle' : 'Stellen'} · ${COMPANY.address.city}`;
}

/**
 * Unterzeile mit Rohrklammer (zwei Sätze, je eine Zeile). „Jede Stelle mit Gehaltsspanne.“ nur, wenn jede
 * Stelle der Liste eine Spanne trägt; sonst die Marke „Ehrliches Handwerk.“ (Zweitzeile der Startseite).
 */
export function listenUnterzeile(jobs: readonly Pick<Job, 'salary'>[]): [string, string] {
  const alleMitGehalt = jobs.length > 0 && jobs.every((job) => job.salary !== undefined && job.salary !== null);
  return [alleMitGehalt ? 'Jede Stelle mit Gehaltsspanne.' : 'Ehrliches Handwerk.', 'Pünktlich Feierabend.'];
}

/**
 * Orte der Baustellen in der Einleitung (V6-G1: Suchbegriffe des Seitentitels in den ersten 100 Wörtern), im
 * Wortlaut von REGION.summary („Du arbeitest in Wetzlar, Gießen und dem Lahn-Dill-Kreis …“).
 */
export const LISTEN_ORTE = 'Wetzlar und Gießen';

/**
 * Einleitung: „Stellenangebote im SHK-Handwerk“ (alle Stellen sind SHK, Stellendaten) mit den Orten der Baustellen
 * und Fakt founded1926, dann Tarif und Werkzeug (Fakten aboveTariff/azubiPay und hilti/azubiToolkit).
 */
export const LISTEN_EINLEITUNG = schuetzeZahlen(
  `Stellenangebote im SHK-Handwerk vom ${FACTS.founded1926.short}, mit Baustellen in ${LISTEN_ORTE}. Bezahlt über Tarif und mit persönlicher Hilti-Ausstattung.`,
);

/** Mikrotext unter dem Knopf (Fakten apply60s, noCvNeeded), wortgleich mit dem Einstieg der Startseite. */
export const LISTEN_MIKROTEXT = `Dauert ca. ${FACTS.apply60s.value}${NBSP}${FACTS.apply60s.label}. ${FACTS.noCvNeeded.short}.`;

/** Zweitweg: zur Liste (Anker #stellen) oder, ohne offene Stelle, zur Initiativbewerbung. */
export function listenZweitweg(anzahl: number): { href: string; label: string } {
  if (anzahl === 0) return { href: INITIATIVE_APPLY_PATH, label: 'Initiativ bewerben' };
  if (anzahl === 1) return { href: '#stellen', label: 'Zur offenen Stelle' };
  return { href: '#stellen', label: `Alle ${anzahl}${NBSP}Stellen ansehen` };
}

/** Der Heizkreis der Zeichnung: Freitag 13:30 (Fakt friday1330). */
export const HEIZKREIS = Object.freeze({ wert: FACTS.friday1330.value ?? '13:30', name: FACTS.friday1330.label ?? '' });

/** Die Maße an der Zeichnung: 30 Tage Urlaub, 35 km Einsatzradius (Fakten vacation30, radius35). */
export const LISTEN_MASSE = Object.freeze([
  { wert: schuetzeZahlen(FACTS.vacation30.value ?? ''), name: FACTS.vacation30.label ?? '' },
  { wert: schuetzeZahlen(FACTS.radius35.value ?? ''), name: 'Einsatzradius' },
]);

/**
 * Etiketten-Kästchen an der Zeichnung (Variante 3): die drei Gewerke, in denen der Betrieb Verstärkung sucht
 * (HERO.lead der Startseite: „Wärmepumpen, Heizungen und moderne Bäder“), mit ihren Familien-Icons.
 */
export const GEWERKE = Object.freeze([
  { name: 'Wärmepumpen', icon: 'waermepumpe' },
  { name: 'Heizungen', icon: 'flamme' },
  { name: 'Bäder', icon: 'tropfen' },
] as const);

/** Zugänglicher Name der Liste: „4 offene Stellen“. */
export function listenName(anzahl: number): string {
  return `${anzahl} offene ${anzahl === 1 ? 'Stelle' : 'Stellen'}`;
}

/** Leerzustand (K-011): erklärt, warum leer, und nennt den nächsten Schritt. */
export const LEER_TEXT = 'Gerade ist keine Stelle ausgeschrieben. Eine Initiativbewerbung ist trotzdem jederzeit möglich.';

/** Initiativband: Überschrift und Satz wie bisher auf /jobs, mit den Fakten noCvNeeded und quickResponse. */
export const INITIATIV = Object.freeze({
  titel: 'Initiativ bewerben',
  text: `Keine passende Stelle dabei? Bewirb dich trotzdem. ${FACTS.noCvNeeded.long} ${FACTS.quickResponse.long}`,
  knopf: 'Initiativ bewerben',
  auchMoeglich: 'Auch möglich:',
});

/** Einsatzgebiet: Weg zur Karte mit Pendelrechner auf der Startseite (Wortlaut wie im Fuß). */
export const GEBIET_LINK = Object.freeze({ href: '/#einsatzgebiet', label: 'Entfernung und Fahrzeit zu deinem Ort' });

/** Persönlicher Draht im Initiativband (wie das Schlussband der Startseite), Name und Rolle aus COMPANY. */
export const KONTAKT = Object.freeze({
  etikett: 'Persönlicher Austausch',
  titel: `Sprich direkt mit ${COMPANY.managingDirector.name.replace(/ /g, NBSP)}`,
  rolle: COMPANY.managingDirector.title,
});
