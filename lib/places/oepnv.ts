import berufsschuleDatei from './data/berufsschule.json';
import oepnvDatei from './data/oepnv.json';
import type { KreisId } from './kreise';

/**
 * Bus und Bahn je Ort und die zuständige Berufsschule (Plan §B, Paket W2a), aus lib/places/data/oepnv.json und
 * berufsschule.json. Erzeugt offline mit scripts/places/oepnv.mjs (Protokoll scripts/places/README.md); hier wird
 * nur gelesen. Ohne zod (wie measurement.ts): Die Form prüfen die Schemas in schema.ts im Test
 * (lib/places/__tests__/oepnv.test.ts), und die Typen hier sind dort gegen die Schemas gehalten.
 *
 * oepnv.json ist rund 250 KB groß: nur in Server-Komponenten und beim Bauen lesen, nicht in ein Client-Modul ziehen.
 */

export type OepnvVerkehrsmittel = 'bahn' | 'bus' | 'tram' | 'u-bahn' | 'bedarf' | 'faehre' | 'sonstige';

export interface OepnvTeilstrecke {
  /** route_short_name, sonst route_long_name. */
  linie: string;
  verkehrsmittel: OepnvVerkehrsmittel;
  ab: string;
  /** „HH:MM“ am Werktag. */
  abfahrt: string;
  an: string;
  ankunft: string;
  /** Fußweg vor dieser Teilstrecke, wenn der Umstieg die Haltestelle wechselt. */
  umstiegZuFussMin?: number;
}

export interface OepnvLinie {
  name: string;
  verkehrsmittel: OepnvVerkehrsmittel;
}

/** Verbindung Ortsmitte → Ziel. Zeiten „HH:MM“, Dauer in Minuten. */
export interface OepnvVerbindung {
  /** Losgehen an der Ortsmitte (Messpunkt). */
  losgehen: string;
  gehMinStart: number;
  /** Start-Haltestelle und Abfahrt des ersten Fahrzeugs. */
  ab: string;
  abfahrt: string;
  /** Ziel-Haltestelle und Ankunft dort. */
  an: string;
  ankunftHaltestelle: string;
  gehMinZiel: number;
  /** Ankunft am Ziel nach dem Fußweg. */
  ankunft: string;
  fahrzeitMin: number;
  reisezeitMin: number;
  umstiege: number;
  linien: OepnvLinie[];
  teilstrecken: OepnvTeilstrecke[];
}

export interface OepnvKurzverbindung {
  losgehen: string;
  abfahrt: string;
  ankunft: string;
  umstiege: number;
}

/** Weg zum Betrieb oder zur Schule. `moeglich: false` mit `grund` ist auch eine Auskunft („kein Bus vor 7:30“). */
export interface OepnvWeg {
  moeglich: boolean;
  ankunftBis: string;
  /** Späteste Verbindung mit Ankunft bis `ankunftBis` (nur wenn möglich). */
  spaeteste?: OepnvVerbindung;
  /** Warum es keine Verbindung gibt (nur wenn nicht möglich). */
  grund?: string;
  /** Nicht überholte Verbindungen mit Ankunft im Zählfenster 06:00–08:00. */
  verbindungenMorgens: number;
  verbindungen: OepnvKurzverbindung[];
  /** Direkter Fußweg, wenn der Ort nah am Ziel liegt. */
  direktZuFussMin?: number;
}

export interface OepnvHaltestelle {
  name: string;
  /** Fußweg auf dem Wegenetz in Metern (auf 10 m gerundet). */
  wegM: number;
  gehMin: number;
}

export interface OepnvOrt {
  name: string;
  /** Messpunkt, wenn er anders heißt als der Ort. */
  messpunkt?: string;
  startHaltestellen: OepnvHaltestelle[];
  betrieb: OepnvWeg;
  schule: OepnvWeg;
}

interface OepnvZiel {
  lat: number;
  lng: number;
  ankunftBis: string;
  /** Haltestellen bis 600 m um das Ziel mit Fußweg dorthin. */
  zielHaltestellen: OepnvHaltestelle[];
}

export interface OepnvBetrieb extends OepnvZiel {
  adresse: string;
}

export interface OepnvSchulZiel extends OepnvZiel {
  name: string;
}

export interface OepnvDatei {
  _kommentar: string;
  quelle: {
    name: string;
    herausgeber: string;
    urls: string[];
    lizenz: 'CC BY 4.0';
    lizenzUrl: string;
    namensnennung: string;
    /** Hinweis auf die Bearbeitung, den CC BY 4.0 verlangt. */
    bearbeitung: string;
    feeds: string[];
    /** Stand der GTFS-Daten (Veröffentlichung bei gtfs.de). */
    stand: string;
  };
  fusswege: { dienst: string; daten: string; methode: string };
  fahrplanperiode: { von: string; bis: string };
  /** Gerechneter Werktag (ISO) und sein Name. */
  werktag: string;
  wochentag: 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag';
  methode: Record<string, string | number>;
  betrieb: OepnvBetrieb;
  schule: OepnvSchulZiel;
  /** Orts-ID (= Slug) → Bus und Bahn. */
  orte: Record<string, OepnvOrt>;
}

export type BerufsschuleStatus = 'laut-verordnung' | 'bestaetigt';

export interface Berufsschule {
  _kommentar: string;
  beruf: string;
  /** laut-verordnung, bis der Inhaber bestätigt (MENSCHEN M-024). */
  status: BerufsschuleStatus;
  bestaetigung: string;
  geprueftAm: string;
  massgeblich: 'ausbildungsort';
  ausbildungsort: {
    gemeinde: string;
    kreisId: KreisId;
    schulbezirk: string;
  };
  geltung: string;
  schule: {
    name: string;
    strasse: string;
    postleitzahl: string;
    ort: string;
    lat: number;
    lng: number;
    koordinatenQuelle: string;
    adresseQuelle: string;
    website: string;
  };
  stufen: { grundstufe: string; fachstufe: string };
  unterrichtsbeginn: string | null;
  ankunftBis: string;
  ankunftHinweis: string;
  vorbehalt: string;
  andereAusbildungsorte: { gilt: string; schule: string; fundstelle: string }[];
  quellen: { titel: string; url: string; fundstelle: string }[];
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const OEPNV = deepFreeze(oepnvDatei as unknown as OepnvDatei);

/** Zuständige Berufsschule für Anlagenmechaniker SHK (Status laut-verordnung bis zur Bestätigung, M-024). */
export const BERUFSSCHULE: Readonly<Berufsschule> = deepFreeze(berufsschuleDatei as unknown as Berufsschule);

/** Quelle, Lizenz und Stand für die Namensnennung unter jeder Tabelle („© gtfs.de, CC BY 4.0, Datenbasis DELFI e.V. …“). */
export const OEPNV_QUELLE = OEPNV.quelle;

/** Kopf der Datei ohne die Orte: Fahrplanperiode, Werktag, Methode, Ziel-Haltestellen. */
export const OEPNV_META = Object.freeze({
  fusswege: OEPNV.fusswege,
  fahrplanperiode: OEPNV.fahrplanperiode,
  werktag: OEPNV.werktag,
  wochentag: OEPNV.wochentag,
  methode: OEPNV.methode,
  betrieb: OEPNV.betrieb,
  schule: OEPNV.schule,
});

/** Bus und Bahn für einen Ort (Orts-ID wie in lib/places/data/messung.json); undefined für unbekannte IDs. */
export function getOepnv(placeId: string): OepnvOrt | undefined {
  return Object.hasOwn(OEPNV.orte, placeId) ? OEPNV.orte[placeId] : undefined;
}

/** Alle Orts-IDs mit Daten, alphabetisch (wie in der Datei). */
export function getOepnvOrtIds(): string[] {
  return Object.keys(OEPNV.orte);
}
