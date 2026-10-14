import { heuteInWetzlar } from './indexierung';
import { BERUFSSCHULE, OEPNV_META, OEPNV_QUELLE } from './oepnv';
import type { Place } from './schema';

/**
 * Datenklassen der Ortsseiten außer der Geometrie (Plan §B, ROADMAP §10.1): Was eine Ortsseite über Strecke und Lage
 * hinaus sagt, kommt aus einer dieser Klassen, jede mit Quelle und Stand. Das Gate (lib/places/qualitaet.ts) zählt sie
 * (I2), misst ihren Anteil am Ortstext (I3) und prüft ihr Alter (I5); die Titelstufe hängt an ihnen (M-023).
 * Ohne zod und ohne Texte: Seiten, Gate und Lock-Datei lesen dieselben Belege.
 */

/**
 * oepnv: Bus und Bahn zum Firmensitz (gtfs.de) · berufsschule: Weg zur zuständigen Berufsschule (Verordnung und
 * Fahrplan) · einsaetze: Einsätze je Ort aus dem Auftragsbuch (M-023, noch keine Daten; nur Bänder ab 5).
 */
export const DATENKLASSEN = ['oepnv', 'berufsschule', 'einsaetze'] as const;
export type DatenKlasse = (typeof DATENKLASSEN)[number];

export interface DatenBeleg {
  klasse: DatenKlasse;
  /** Wer die Daten herausgibt, wie auf der Seite genannt. */
  quelle: string;
  /** Stand der Daten (JJJJ-MM-TT). */
  stand: string;
  /** Letzter Tag, an dem die Daten als aktuell gelten (I5), JJJJ-MM-TT. */
  gueltigBis: string;
}

/** Einsätze gelten 15 Monate ab ihrem Stand (I5, Plan §B). */
export const EINSAETZE_GUELTIG_MONATE = 15;

const iso = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Fahrplanwechsel eines Jahres: der zweite Sonntag im Dezember (europaweit einheitlich), z. B. 2026-12-13.
 * Ab diesem Tag gilt der neue Fahrplan, die Daten des alten Fahrplanjahres sind veraltet.
 */
export function fahrplanwechsel(jahr: number): string {
  const ersterDezember = new Date(Date.UTC(jahr, 11, 1));
  const ersterSonntag = 1 + ((7 - ersterDezember.getUTCDay()) % 7);
  return iso(new Date(Date.UTC(jahr, 11, ersterSonntag + 7)));
}

/** Letzter Tag des Fahrplanjahres, zu dem ein Werktag gehört: der Samstag vor dem nächsten Fahrplanwechsel. */
export function fahrplanjahrEnde(werktag: string): string {
  const jahr = Number(werktag.slice(0, 4));
  const wechsel = werktag < fahrplanwechsel(jahr) ? fahrplanwechsel(jahr) : fahrplanwechsel(jahr + 1);
  const tagDavor = new Date(`${wechsel}T00:00:00Z`);
  tagDavor.setUTCDate(tagDavor.getUTCDate() - 1);
  return iso(tagDavor);
}

/** Stand plus volle Monate, als letzter gültiger Tag (für Einsätze: 15 Monate). */
export function monateSpaeter(stand: string, monate: number): string {
  const [jahr, monat, tag] = stand.split('-').map(Number);
  return iso(new Date(Date.UTC(jahr, monat - 1 + monate, tag)));
}

/** Stand der Fahrplandaten und letzter Tag ihres Fahrplanjahres (gilt für Bus und Bahn und den Schulweg). */
export const FAHRPLAN_STAND = Object.freeze({
  stand: OEPNV_QUELLE.stand,
  werktag: OEPNV_META.werktag,
  gueltigBis: fahrplanjahrEnde(OEPNV_META.werktag),
});

/**
 * Gelten die Fahrplandaten am Tag `now` (Kalendertag in Wetzlar) noch? Danach zeigen die Kreis-Hubs keine Sätze zu
 * Bus und Bahn mehr, und die Ortsseiten gehen per Gate I5 auf noindex (lib/places/indexierung.ts).
 */
export function fahrplanAktuell(now: Date = new Date()): boolean {
  return heuteInWetzlar(now) <= FAHRPLAN_STAND.gueltigBis;
}

/**
 * Belege eines Orts: Bus und Bahn, wenn die Fahrplandaten den Ort führen; Berufsschule, wenn dazu der Schulweg und die
 * Fundstellen der Zuständigkeit vorliegen. Eine Klasse zählt auch, wenn es keine Verbindung gibt: „kein Bus vor
 * 7:30 Uhr“ ist eine belegte Auskunft (Plan §B).
 */
export function datenBelege(place: Pick<Place, 'oepnv'>): DatenBeleg[] {
  const belege: DatenBeleg[] = [];
  if (!place.oepnv) return belege;
  belege.push({ klasse: 'oepnv', quelle: OEPNV_QUELLE.namensnennung, stand: FAHRPLAN_STAND.stand, gueltigBis: FAHRPLAN_STAND.gueltigBis });
  const verordnung = BERUFSSCHULE.quellen[0]?.titel;
  if (verordnung) {
    belege.push({
      klasse: 'berufsschule',
      quelle: `${verordnung}; ${OEPNV_QUELLE.namensnennung}`,
      stand: BERUFSSCHULE.geprueftAm,
      gueltigBis: FAHRPLAN_STAND.gueltigBis,
    });
  }
  return belege;
}

/** Klassen eines Orts, in fester Reihenfolge. */
export function datenKlassen(place: Pick<Place, 'oepnv'>): DatenKlasse[] {
  const klassen = new Set(datenBelege(place).map((beleg) => beleg.klasse));
  return DATENKLASSEN.filter((klasse) => klassen.has(klasse));
}

/**
 * Titelstufe der Ortsseite (Plan §B, MENSCHEN M-023): „SHK-Jobs {Ort}“ nur, wenn echte Einsätze des Betriebs am Ort
 * belegt sind; sonst „Arbeitsweg {Ort} – Wetzlar: Auto und Bus“ aus den offenen Daten.
 */
export type TitelStufe = 'arbeitsweg' | 'shk-jobs';

export function titelStufe(klassen: readonly DatenKlasse[]): TitelStufe {
  return klassen.includes('einsaetze') ? 'shk-jobs' : 'arbeitsweg';
}
