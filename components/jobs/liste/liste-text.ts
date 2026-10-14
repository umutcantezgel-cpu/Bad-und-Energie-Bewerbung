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
 * - im Heizkreis der Zeichnung steht der Einsatzradius 35 km (bis 2026-10-12 stand dort 13:30, bis 2026-10-14 die
 *   Gehaltsspanne der Fachkräfte; seit E-030 nennt keine Seite mehr einen Betrag);
 * - „Lohn auf Anfrage.“ (Fakt payOnRequest) und „Flexible Arbeitszeiten.“ (Fakt flexibleHours) stehen in der Unterzeile;
 * - 30 Tage stehen als Maß an der Zeichnung; „35 km“ kehrt nur in REGION.headline (Einsatzgebiet) wieder;
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
 * Unterzeile mit Rohrklammer (zwei Sätze, je eine Zeile). „Lohn auf Anfrage.“ (Fakt payOnRequest, E-030), wenn eine
 * Stelle der Liste etwas zur Bezahlung sagt; sonst die Marke „Ehrliches Handwerk.“ (Zweitzeile der Startseite). Der
 * zweite Satz ist der Fakt flexibleHours, wie in der h1 der Startseite.
 */
export function listenUnterzeile(jobs: readonly Pick<Job, 'pay'>[]): [string, string] {
  const mitLohn = jobs.some((job) => job.pay === 'auf-anfrage');
  return [mitLohn ? `${FACTS.payOnRequest.short}.` : 'Ehrliches Handwerk.', FACTS.flexibleHours.long];
}

/**
 * Orte der Baustellen in der Einleitung (V6-G1: Suchbegriffe des Seitentitels in den ersten 100 Wörtern), im
 * Wortlaut von REGION.summary („Du arbeitest in Wetzlar, Gießen, im Lahn-Dill-Kreis …“).
 */
export const LISTEN_ORTE = 'Wetzlar und Gießen';

/**
 * Einleitung: „Stellenangebote im SHK-Handwerk“ (alle Stellen sind SHK, Stellendaten) mit den Orten der Baustellen
 * und Fakt founded1926, dann Tarif und Werkzeug für die Stellen auf der Baustelle (Fakten aboveTariff/azubiPay,
 * Paketzeile „Vergütung“ des Quereinstiegs; hilti/azubiToolkit und Hilti-Basisausstattung, je ab dem ersten Tag laut
 * Ablauf). Seit 2026-10-14 gibt es auch das Büro (keine Tarifaussage belegt, S5) und das Schülerpraktikum (kein Wort zu
 * Geld, S4): Darum nennt der Satz, für wen er gilt.
 */
export const LISTEN_EINLEITUNG = schuetzeZahlen(
  `Stellenangebote im SHK-Handwerk vom ${FACTS.founded1926.short}, mit Baustellen in ${LISTEN_ORTE}. Fachkräfte, Azubis und Quereinsteiger bezahlen wir über Tarif, mit Hilti-Ausstattung ab dem ersten Tag.`,
);

/** Mikrotext unter dem Knopf (Fakten apply60s, noCvNeeded), wortgleich mit dem Einstieg der Startseite. */
export const LISTEN_MIKROTEXT = `Dauert ca. ${FACTS.apply60s.value}${NBSP}${FACTS.apply60s.label}. ${FACTS.noCvNeeded.short}.`;

/** Zweitweg: zur Liste (Anker #stellen) oder, ohne offene Stelle, zur Initiativbewerbung. */
export function listenZweitweg(anzahl: number): { href: string; label: string } {
  if (anzahl === 0) return { href: INITIATIVE_APPLY_PATH, label: 'Initiativ bewerben' };
  if (anzahl === 1) return { href: '#stellen', label: 'Zur offenen Stelle' };
  return { href: '#stellen', label: `Alle ${anzahl}${NBSP}Stellen ansehen` };
}

export interface ListenMass {
  wert: string;
  name: string;
}

const URLAUB_MASS: ListenMass = { wert: schuetzeZahlen(FACTS.vacation30.value ?? ''), name: FACTS.vacation30.label ?? '' };
const RADIUS_MASS: ListenMass = { wert: schuetzeZahlen(FACTS.radius35.value ?? ''), name: 'Einsatzradius' };

/**
 * Zeichnung des Kopfs: im Heizkreis der Einsatzradius 35 km (Fakt radius35), daneben das Maß 30 Tage Urlaub (Fakt
 * vacation30). Bis 2026-10-14 stand im Heizkreis die Gehaltsspanne der Fachkräfte; seit E-030 gibt es keinen Betrag.
 */
export function listenZeichnung(): { heizkreis: ListenMass; masse: readonly ListenMass[] } {
  return { heizkreis: RADIUS_MASS, masse: [URLAUB_MASS] };
}

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

/**
 * Einsatzgebiet: Weg zur Gebietsseite mit allen gemessenen Orten, Entfernung und Fahrzeit (E-028; vorher die Karte
 * der Startseite). Eigener Wortlaut, weil er hier sagt, was die Gebietsseite für die Stellen bringt; der Fuß und die
 * Ortsseiten nennen dasselbe Ziel „Alle Orte im Einsatzgebiet“ (EINSATZGEBIET_LINK_LABEL). Jeder Ankertext hat genau
 * ein Ziel (e2e/seo.spec.ts); ein Ziel darf mehrere Ankertexte haben.
 */
export const GEBIET_LINK = Object.freeze({ href: '/einsatzgebiet', label: 'Entfernung und Fahrzeit zu deinem Ort' });

/** Persönlicher Draht im Initiativband (wie das Schlussband der Startseite), Name und Rolle aus COMPANY. */
export const KONTAKT = Object.freeze({
  etikett: 'Persönlicher Austausch',
  titel: `Sprich direkt mit ${COMPANY.managingDirector.name.replace(/ /g, NBSP)}`,
  rolle: COMPANY.managingDirector.title,
});
