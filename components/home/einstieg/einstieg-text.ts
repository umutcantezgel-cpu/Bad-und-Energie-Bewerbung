import { COMPANY } from '@/lib/content/company';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { geraetTitel } from '@/lib/zeichnung/geraete/titel';
import { FACTS, isFactActive } from '@/lib/content/facts';
import { PROCESS_STEPS } from '@/lib/content/process';
import type { Job } from '@/lib/jobs/registry';
import { HERO, HERO_RADIUS_LABEL, heroStats, type HeroStat } from '../content';

/**
 * Texte des Einstiegs (R3-HOME-01), nur aus belegten Quellen gebaut: content.ts (HERO, HERO_STATS),
 * lib/content/facts.ts, lib/content/process.ts, lib/data/company.ts (über FACTS/COMPANY).
 * Reines Modul, geprüft in components/home/__tests__/einstieg-text.test.ts.
 */

const NBSP = ' ';

/** Geschütztes Leerzeichen in Zahl-Wort-Paaren („100 Jahre“, „35 km“; K-012). */
export function schuetzeZahlen(text: string): string {
  return text.replace(/(\d) (?=[\p{L}%€])/gu, `$1${NBSP}`);
}

/**
 * Erklärsatz zur Wärmepumpe unter der Zeichnung: TEXTVORSCHLAEGE T-001 wörtlich, vom Auftraggeber mit dem
 * Bild von B Runde 1 freigegeben (E-021). Allgemeines Fachwissen, keine Betriebsbehauptung; der Hausschnitt zeigt
 * es seit E-029 fachlich richtig (Vorlauf von der Anlage ins Haus, Rücklauf zurück).
 */
export const KREISLAUF_SATZ =
  'So arbeitet eine Wärmepumpe: Luft liefert die Wärme, der rote Vorlauf bringt sie ins Haus, der blaue Rücklauf kehrt zurück.';

/**
 * Einzelheit „X“ (E-029): Beschriftung neben dem Knopf „Anhalten“ und zugänglicher Name der Zeichnung. Maße aus dem
 * Geräte-Modul (lib/zeichnung/geraete/compress-aw-s.ts), keine Betriebsbehauptung.
 */
export const EINZELHEIT_TEXT = 'Einzelheit X · Maße in mm';
export const EINZELHEIT_TITEL = `Einzelheit X: ${geraetTitel(COMPRESS_AW_S, 'vorne')}`;

/** Firmensitz (Wegweiser aus B Runde 1; die Szene nach Variante 3 zeigt keinen Wegweiser mehr). */
export const WEGWEISER = COMPANY.address.city;

/** Zweiter Weg neben der Hauptaktion (Plattform-Wortlaut aus dem bisherigen Hero). */
export const ZWEITWEG = { label: 'Offene Stellen ansehen', href: '#stellen' } as const;

/** Jubiläumsjahr (E-START-002): bis einschließlich `validUntil` des Fakts anniversary100 (31.12.2026). */
export function jubilaeumAktiv(now: Date): boolean {
  return isFactActive('anniversary100', now);
}

/**
 * Ortsmarke über der h1 (E-START-002): im Jubiläumsjahr „100 Jahre Meisterbetrieb (1926–2026)“ wörtlich
 * aus dem Fakt anniversary100; ab dem 01.01.2027 wieder HERO.eyebrow („Seit 1926 · Wetzlar“).
 */
export function ortsmarke(now: Date): string {
  return schuetzeZahlen(jubilaeumAktiv(now) ? FACTS.anniversary100.short : HERO.eyebrow);
}

export interface Jahreskette {
  /** Anfang und Ende der Kette (Gründungsjahr, Ende des Jubiläumsjahrs). */
  von: string;
  bis: string;
}

/**
 * Jahres-Maßkette (nur Desktop): „2026“ am Ende der Maßlinie von „1926 Gegründet“, die 100 Jahre als Maß
 * „1926 … 2026“ ohne Wortlaut (E-023: „100 Jahre Meisterbetrieb“ steht schon als Ortsmarke über der h1, ein
 * Abschnitt nennt den Fakt einmal). Nach dem Jubiläumsjahr entfällt sie; „1926 Gegründet“ bleibt als Maß stehen.
 */
export function jahreskette(now: Date): Jahreskette | null {
  if (!jubilaeumAktiv(now)) return null;
  const bis = FACTS.anniversary100.validUntil?.slice(0, 4);
  if (!bis) return null;
  return { von: String(COMPANY.foundingYear), bis };
}

/**
 * Etikett am Maß „35 km“ (Leitmotiv E-027): Fakt radius35 („Alle Baustellen liegen im Umkreis von 35 km
 * um Wetzlar“, fakten-abgleich B29) in Worten der Zeichnung; dasselbe Etikett trägt das OG-Bild der Startseite.
 */
export const RADIUS_ETIKETT = HERO_RADIUS_LABEL;

/**
 * Die drei Maße am Haus in fester Reihenfolge (HERO_STATS: 35 km, 30, 1926), mit Stellenbezug am Namen, solange ein Fakt
 * für eine der gezeigten Stellen offen ist (heroStats: „Tage Urlaub je nach Stelle“).
 */
export function einstiegMasse(stellen: readonly Pick<Job, 'category'>[]): Record<'radius' | 'urlaub' | 'gruendung', HeroStat> {
  const stats = heroStats(stellen);
  const byId = (id: HeroStat['factId']) => {
    const stat = stats.find((s) => s.factId === id);
    if (!stat) throw new Error(`HERO_STATS ohne ${id}`);
    return stat;
  };
  return {
    radius: byId('radius35'),
    urlaub: byId('vacation30'),
    gruendung: byId('founded1926'),
  };
}

export interface Vertrauenspunkt {
  id: string;
  /** Reihe in der Zeile: Aussagen über den Betrieb, dann die Herstellerpartner. */
  gruppe: 'betrieb' | 'partner';
  text: string;
  /** Herkunft des Wortlauts (für Prüfung und Abnahme). */
  quelle: string;
}

/** „Partnerbetrieb (Partnerurkunde 2026, …)“ → „Partnerbetrieb“: die Klammerzusätze gehören in den Abschnitt Betrieb. */
function ohneKlammer(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

const KENNENLERNEN = PROCESS_STEPS.find((step) => step.id === 'kennenlernen');

/**
 * Vertrauenszeile unter dem Einstieg (E-START-021, mit E-START-010 und E-START-011): ruhig, statisch,
 * alle Punkte sichtbar. Auswahl nach der Faktenverteilung E-023 (je Abschnitt eine Nennung, höchstens
 * zwei Abschnitte je Seite):
 * - nicht hier: 35 km, 30 Tage, 1926/100 Jahre (Einstieg), flexible Arbeitszeiten (h1), Werkzeug (Vorteile), 15 Leute und
 *   Lahn-Dill-Kreis (Abschnitt Betrieb), Fahrzeug und Urlaub (Vorteile);
 * - nicht hier: „Keine Fernmontage“ (steht in REGION.headline und in der FAQ, beides Bestand);
 * - „Innungsbetrieb“ ohne Prozentzahl (E-START-011, COMPANY.innung);
 * - Diskretion schon oberhalb von #ablauf (E-START-010), Wortlaut des Ablaufschritts „Kennenlernen“;
 * - Herstellerpartner in der abgestuften, belegten Fassung der Partner-Säulen (nicht die Pauschalform
 *   „Zertifizierter Fachpartner für …“), ohne die Säule Lahn-Dill-Kreis.
 */
export function vertrauenspunkte(): Vertrauenspunkt[] {
  const punkte: Vertrauenspunkt[] = [];
  if (COMPANY.innung) punkte.push({ id: 'innung', gruppe: 'betrieb', text: 'Innungsbetrieb', quelle: 'COMPANY.innung' });
  if (KENNENLERNEN) {
    punkte.push({ id: 'diskretion', gruppe: 'betrieb', text: schuetzeZahlen(KENNENLERNEN.highlight), quelle: 'PROCESS_STEPS.kennenlernen.highlight (Fakt discretion)' });
  }
  const saeulen = FACTS.partners5.list ?? [];
  saeulen
    .filter((saeule) => !saeule.includes('Lahn-Dill-Kreis'))
    .forEach((saeule, i) => punkte.push({ id: `partner-${i + 1}`, gruppe: 'partner', text: ohneKlammer(saeule), quelle: 'FACTS.partners5.list' }));
  return punkte;
}

/** Zugänglicher Name der Vertrauenszeile (Liste ohne sichtbare Überschrift; Mikrotext, K-012). */
export const VERTRAUEN_LABEL = 'Betrieb und Partner';
