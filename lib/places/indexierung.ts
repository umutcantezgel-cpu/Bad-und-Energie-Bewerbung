import indexierungDatei from './data/indexierung.json';
import type { Place } from './schema';

/**
 * Laufzeit-Seite des Indexierungs-Gates (E-029): liest die Lock-Datei lib/places/data/indexierung.json, die
 * `bun run orte:gate` aus lib/places/qualitaet.ts schreibt. Seiten, Sitemap, IndexNow, llms.txt und die ItemLists fragen
 * nur hier, ob eine Ortsseite indexiert wird; das Gate selbst (Texte aller Orte, Ähnlichkeit) läuft nur in Tests und im
 * Skript. Ohne zod und ohne Texte, damit Sitemap und Metadaten leicht bleiben.
 *
 * I5 prüft hier das Datum: Endet das Fahrplanjahr der Daten (`gueltigBis`), fällt der Ort ohne Deploy auf
 * `noindex,follow` und aus der Sitemap; die Seiten rendern stündlich neu (revalidate). Neue Daten bringt der Ablauf in
 * docs/operations/orte-oepnv.md.
 */

export interface IndexierungEintrag {
  indexierbar: boolean;
  /** Letzter Tag, an dem die Daten als aktuell gelten (JJJJ-MM-TT); null ohne Datenklasse. */
  gueltigBis: string | null;
  gruende: string[];
}

interface Datei {
  zurueckgenommen: Record<string, { grund: string; seit: string }>;
  orte: Record<string, IndexierungEintrag>;
}

const DATEI = indexierungDatei as unknown as Datei;

const BERLIN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });

/** Kalendertag in Wetzlar (Europe/Berlin) als JJJJ-MM-TT. */
export function heuteInWetzlar(now: Date): string {
  return BERLIN.format(now);
}

/** Eintrag der Lock-Datei für einen Ort; undefined für Orte, die das Gate noch nicht kennt. */
export function indexierungEintrag(placeId: string): Readonly<IndexierungEintrag> | undefined {
  return Object.hasOwn(DATEI.orte, placeId) ? DATEI.orte[placeId] : undefined;
}

/**
 * Wird die Ortsseite indexiert? Nur veröffentlichte Orte, die das Gate bestanden haben und deren Daten am Tag `now`
 * noch gelten. Fehlt der Ort in der Lock-Datei, gilt `noindex`: Das Gate entscheidet, nicht der Zufall.
 */
export function istOrtIndexierbar(place: Pick<Place, 'id' | 'status'>, now: Date = new Date()): boolean {
  if (place.status !== 'published') return false;
  const eintrag = indexierungEintrag(place.id);
  if (!eintrag?.indexierbar) return false;
  return eintrag.gueltigBis === null || heuteInWetzlar(now) <= eintrag.gueltigBis;
}

/** Warum eine Ortsseite nicht indexiert wird (leer, wenn sie es wird): Gründe des Gates oder das Ende der Daten (I5). */
export function indexierungsGruende(place: Pick<Place, 'id' | 'status'>, now: Date = new Date()): string[] {
  if (place.status !== 'published') return [`Status ${place.status}`];
  const eintrag = indexierungEintrag(place.id);
  if (!eintrag) return ['nicht in lib/places/data/indexierung.json (bun run orte:gate)'];
  if (!eintrag.indexierbar) return [...eintrag.gruende];
  if (eintrag.gueltigBis !== null && heuteInWetzlar(now) > eintrag.gueltigBis) return [`I5: Daten gelten bis ${eintrag.gueltigBis}`];
  return [];
}
