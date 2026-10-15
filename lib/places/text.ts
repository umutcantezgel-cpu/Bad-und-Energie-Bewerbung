/**
 * Alle Texte der lokalen Seiten: Ortsseiten, Kreis-Hubs und die Gebietsseite /einsatzgebiet. Reines Modul ohne
 * JSX, geprüft in lib/places/__tests__/text.test.ts und vom Einzigartigkeits-Gate (gate.test.ts).
 *
 * Regeln:
 * - Nur Ortsdaten (Messung), Werte aus derive.ts, Fakten aus lib/content/facts.ts (per ID), die Stellen aus der
 *   Stellen-Registry (seit E-030 ohne Betrag) und die Datenklassen aus lib/places/datenklassen.ts: Bus und Bahn sowie
 *   der Weg zur Berufsschule (lib/places/data/oepnv.json, berufsschule.json). Keine Einwohnerzahlen, keine
 *   Sehenswürdigkeiten, keine Straßen außer in den freigegebenen Kurzbeschreibungen, den Haltestellennamen und der
 *   Anschrift der Berufsschule.
 * - Blöcke aus einer Datenklasse tragen sie in `daten` (Gate I2/I3, lib/places/qualitaet.ts); Blöcke, die eine Frage
 *   beantworten, tragen sie in `frage` (sichtbar als Zwischenüberschrift, ohne FAQPage-Markup: FAQPage gibt es nur
 *   auf der Startseite, scripts/qa/check-graph.mjs Regel 5).
 * - Satzbau folgt echten Datenlagen (Entfernungsband, Streckenstufe, Richtung, Art des Orts, Kreis, Messpunkt, Rang im
 *   Kreis, Median, Nachbarorte, Startseitenkarte), nie einer Zufallsauswahl von Synonymen.
 * - `ort`-Blöcke sagen etwas, das nur für diesen Ort gilt; `gemeinsam`-Blöcke stehen auf jeder Ortsseite (Stellen,
 *   Fakten-Band, Messhinweis, Kontakt), Messhinweis und Kontakt mit dem Ortsnamen. Gemeinsamer Text bleibt kurz: Das
 *   gebaute HTML prüft scripts/qa/check-local-similarity.mjs (Jaccard ≤ 0,40 je Paar indexierbarer Seiten, I4), dort zählen
 *   Stellenkarten, Faktenband und Kontaktblock mit.
 * - Keine Arbeitszeit-Uhrzeiten: Es gilt nur der Fakt flexibleHours (fakten-abgleich B28).
 * - „Ring“ heißen nur die Kreise der Pläne, und die zeigen die Luftlinie. Stufen der Straßenstrecke heißen
 *   „bis 15 km Strecke“, „16 bis 25 km“, „26 bis 35 km“ (roadBandLabel); so widerspricht kein Satz der Zeichnung.
 */
import { FACTS, JE_NACH_STELLE, offenBei, type FactId } from '@/lib/content/facts';
import { OSM_LINK, OSM_NAMENSNENNUNG } from './osm';
import { formatNumber } from '@/lib/jobs/format';
import { getActiveJobs, type Job } from '@/lib/jobs/registry';
import { fitDescription } from '@/lib/seo/descriptions';
import { SITE_CONFIG } from '@/lib/seo/site-config';

import {
  DIRECTION_ADVERBS,
  RING_RADII_KM,
  bearingDeg,
  compareToMedian,
  detourCategory,
  directionFromHeadquarters,
  directionOf,
  directionToHeadquarters,
  distanceBand,
  groupStats,
  kreisStats,
  placeNeighbors,
  quadrantOf,
  rankByDistance,
  roadBandCounts,
  roadBandFloorKm,
  roadBandKm,
  type Direction,
  type GroupStats,
  type MedianComparison,
  type Neighbor,
  type Rank,
} from './derive';
import { FAHRPLAN_STAND, datenKlassen, fahrplanAktuell, titelStufe, type DatenKlasse, type TitelStufe } from './datenklassen';
import { KREIS_DEFS } from './kreise';
import { MEASUREMENT } from './measurement';
import {
  BERUFSSCHULE,
  OEPNV_META,
  OEPNV_QUELLE,
  type OepnvHaltestelle,
  type OepnvKurzverbindung,
  type OepnvOrt,
  type OepnvTeilstrecke,
  type OepnvVerbindung,
  type OepnvVerkehrsmittel,
  type OepnvWeg,
} from './oepnv';
import {
  EINSATZGEBIET_PATH,
  KREIS_HUB_MIN_PLACES,
  compareByDistance,
  getHubKreise,
  getKreise,
  getKreisPlaces,
  getPlaceById,
  getPlaceKreis,
  getPublishedPlaces,
  getStadtteile,
  kreisPath,
  placePath,
  type Kreis,
} from './registry';
import { MAX_ROAD_KM, STADTTEIL_PARENT_ID, type Place } from './schema';

// ─── Bausteine ──────────────────────────────────────────────────────────────

const NBSP = ' ';

export type BlockKind = 'ort' | 'gemeinsam';

export type { DatenKlasse, TitelStufe };

export interface TextBlock {
  /** `ort`: gilt nur für diese Seite · `gemeinsam`: steht auf allen Seiten der Art gleich. */
  kind: BlockKind;
  text: string;
  /** Fakten, deren Wortlaut der Block trägt. */
  factIds?: readonly FactId[];
  /** Datenklasse, aus der jeder Satz des Blocks stammt (Gate I2/I3); fehlt bei Messung, Lage, Fakten und Kontakt. */
  daten?: DatenKlasse;
  /** Frage, die der Block beantwortet; die Seite setzt sie als Zwischenüberschrift über den Block. */
  frage?: string;
}

export interface TextSection<Id extends string = string> {
  id: Id;
  heading: string;
  blocks: readonly TextBlock[];
}

export interface PageMeta {
  /** ≤ 60 Zeichen. */
  title: string;
  /** ≤ 155 Zeichen (fitDescription). */
  description: string;
  h1: string;
  primaryKeyword: string;
}

/** Maß im Seitenkopf, gleiche Form wie SeitenkopfMass. */
export interface Mass {
  wert: string;
  name: string;
}

/**
 * Wo ein Link auf der Ortsseite steht: Nachbarorte (Karten), weitere Orte derselben Richtung bzw. des kleinen Kreises
 * (eigene Zeile „Weiter in dieser Richtung“), Stadtteile, Elternort, Kreis, Gebietsseite.
 */
export type LinkGruppe = 'nachbar' | 'richtung' | 'kreisort' | 'stadtteil' | 'eltern' | 'kreis' | 'gebiet';

/** Interner Link einer Seite (Gate U7: eingehende Links, Klicktiefe). */
export interface PageLink {
  href: string;
  label: string;
  gruppe?: LinkGruppe;
}

/** Ein Wert, der nur zu diesem Ort gehört (Gate U1). */
export interface PlaceDataValue {
  label: string;
  value: string;
}

const ort = (text: string, factIds?: readonly FactId[]): TextBlock => ({ kind: 'ort', text, ...(factIds ? { factIds } : {}) });
/** Ortsblock aus einer Datenklasse, optional als Antwort auf eine Frage. */
const ausDaten = (daten: DatenKlasse, text: string, frage?: string): TextBlock => ({
  kind: 'ort',
  text,
  daten,
  ...(frage ? { frage } : {}),
});
const gemeinsam = (text: string, factIds?: readonly FactId[]): TextBlock => ({
  kind: 'gemeinsam',
  text,
  ...(factIds ? { factIds } : {}),
});

/** '8 km' mit geschütztem Leerzeichen. */
export function formatKm(km: number): string {
  return `${formatNumber(km)}${NBSP}km`;
}

/** Luftlinie mit einer Nachkommastelle nach DIN 5008: '4,5 km', '4,0 km'. */
export function formatAirKm(km: number): string {
  return `${km.toFixed(1).replace('.', ',')}${NBSP}km`;
}

export function formatMinutes(minutes: number): string {
  return `${formatNumber(minutes)}${NBSP}${minutes === 1 ? 'Minute' : 'Minuten'}`;
}

/** Kurzform für Maße: '12 min'. */
export function formatMin(minutes: number): string {
  return `${formatNumber(minutes)}${NBSP}min`;
}

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** '2026-10-12' → '12. Oktober 2026'. */
export function formatMeasuredOn(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day}. ${MONTHS[month - 1]} ${year}`;
}

/** „A“, „A und B“, „A, B und C“. */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

const numerus = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural);
const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** Zahlwörter bis zwölf (DIN 5008: kleine Zahlen im Fließtext ausgeschrieben). */
const ZAHLWORT = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Straße des Firmensitzes für Fließtext: „Siegmund-Hiepe-Straße“ (aus der Fakten-Adresse, ohne Hausnummer). */
const STREET = SITE_CONFIG.headquarters.streetAddress.replace(/\s*\d+\w*$/, '').replace(/Str\.$/, 'Straße');
const HQ_CITY = SITE_CONFIG.headquarters.addressLocality;
/** Ansprechpartner für WhatsApp (SITE_CONFIG.founder). */
const CONTACT_NAME = `${SITE_CONFIG.founder.givenName} ${SITE_CONFIG.founder.familyName}`;
const NEIGHBOR_COUNT = 4;
const NEIGHBOR_WORD = 'vier';
/** Ab so wenig Kilometern unter 35 km Straße gehört ein Ort zu den entferntesten mit eigener Seite. */
const EDGE_MARGIN_KM = 3;

/**
 * Fakten im Band (inverse) jeder Seite unter /einsatzgebiet; dazu die Kreis-Fakten (countyPartner im Lahn-Dill-Kreis).
 * Nicht radius35: Das Gebiet ist schon Thema der Seite. noFarAssembly passt zum Arbeitsweg („jeden Abend zu Hause“).
 * flexibleHours steht zuletzt: Belegt ist nur die Kurzform, der Fakt hat keinen weiteren Satz.
 */
export const BAND_FACT_IDS: readonly FactId[] = Object.freeze(['noFarAssembly', 'vacation30', 'flexibleHours']);

/**
 * Das Band heißt „Was überall gilt“: Ein Fakt, der für eine gezeigte Stelle offen ist (`offenFuer`, Urlaub und
 * Arbeitszeit fürs Büro, fakten-abgleich S5), fällt dort weg (Prüfung E-029, Runde 2). An seine Stelle tritt einmal
 * dieser Fakt, belegt für den ganzen Betrieb (B28), damit das Band nicht auf ein Kästchen schrumpft.
 */
export const BAND_ERSATZ: FactId = 'noWeekendOnCall';

/** Gilt der Fakt für alle gezeigten Stellen? (Sammelfläche, lib/content/facts.ts offenBei) */
const giltFuerAlle = (id: FactId, jobs: readonly Job[]) => offenBei(id, jobs).length === 0;

/**
 * Zusagen am Ende der Descriptions: „flexible Arbeitszeiten, 30 Tage Urlaub“, mit „Je nach Stelle“ davor, solange eine
 * gezeigte Stelle sie offen lässt (Bürofachkraft, fakten-abgleich S5), wie auf der Seite „Bezahlung und Extras“.
 */
export function zusagenKurz(jobs: readonly Job[]): string {
  const liste = `${lowerFirst(FACTS.flexibleHours.short)}, ${FACTS.vacation30.short}`;
  return (['flexibleHours', 'vacation30'] as const).every((id) => giltFuerAlle(id, jobs)) ? liste : `${JE_NACH_STELLE} ${liste}`;
}

/**
 * Schlusssätze der Descriptions in der Reihenfolge der Kandidaten: die Zusagen (zusagenKurz); sind sie eingeschränkt
 * und dadurch länger, danach die kurze Zusage, die für jede Stelle gilt („Keine Fernmontage“), bevor der Satz ganz
 * entfällt.
 */
function zusagenSaetze(jobs: readonly Job[]): string[] {
  const zusagen = upperFirst(zusagenKurz(jobs));
  return zusagen.startsWith(upperFirst(JE_NACH_STELLE)) && giltFuerAlle('noFarAssembly', jobs)
    ? [`${zusagen}.`, `${FACTS.noFarAssembly.short}.`]
    : [`${zusagen}.`];
}

/** Kandidaten für fitDescription: jeder Satzanfang mit dem ersten Schlusssatz, dann jeder mit dem nächsten. */
function kandidaten(anfaenge: readonly string[], jobs: readonly Job[]): [string, ...string[]] {
  return zusagenSaetze(jobs).flatMap((schluss) => anfaenge.map((anfang) => `${anfang} ${schluss}`)) as [string, ...string[]];
}

/** Satzanfang der WhatsApp-Nachricht, wie DEFAULT_WHATSAPP_MESSAGE in lib/utils/whatsapp-utils.ts. */
export const GREETING_START = `Guten Tag Herr ${SITE_CONFIG.founder.familyName}, `;
export const GREETING_END = 'und interessiere mich für eine Stelle bei Bad und Energie.';

/** Vorbereitete WhatsApp-Nachricht der Ortsseite. */
export function whatsappGreeting(place: Pick<Place, 'name'>): string {
  return `${GREETING_START}ich komme aus ${place.name} ${GREETING_END}`;
}

// ─── Kontext einer Ortsseite ────────────────────────────────────────────────

interface PlaceContext {
  place: Place;
  kreis: Kreis;
  published: readonly Place[];
  dirFromHq: Direction;
  dirToHq: Direction;
  /** Streckenstufe (15, 25 oder 35 km Straße), nur für den Satzbau. */
  band: number;
  neighbors: Neighbor[];
  kreisStats: GroupStats;
  kreisRank: Rank;
  kreisMedian: MedianComparison;
  areaRank: Rank;
  /** Stadtteile von Wetzlar (für Stadt und Stadtteile), nach Strecke. */
  stadtteile: Place[];
  jobs: readonly Job[];
  /** Datenklassen außer der Geometrie (datenklassen.ts) und die Titelstufe, die aus ihnen folgt. */
  klassen: DatenKlasse[];
  stufe: TitelStufe;
}

/** Kreis des Firmensitzes: der Kreis des Orts Wetzlar laut Messung. */
function headquartersKreisId(): string {
  return getPlaceById(STADTTEIL_PARENT_ID)?.kreisId ?? 'lahn-dill-kreis';
}

function placeContext(place: Place, jobs: readonly Job[]): PlaceContext {
  const published = getPublishedPlaces();
  const kreis = getPlaceKreis(place);
  const stats = kreisStats(place.kreisId, published);
  const parentId = place.kind === 'stadt' ? place.id : place.parentId;
  return {
    place,
    kreis,
    published,
    dirFromHq: directionFromHeadquarters(place),
    dirToHq: directionToHeadquarters(place),
    band: roadBandKm(place),
    neighbors: placeNeighbors(place, published, NEIGHBOR_COUNT),
    kreisStats: stats,
    kreisRank: rankByDistance(place, stats.places),
    kreisMedian: compareToMedian(place, stats),
    areaRank: rankByDistance(place, published),
    stadtteile: parentId ? getStadtteile(parentId) : [],
    jobs,
    klassen: datenKlassen(place),
    stufe: titelStufe(datenKlassen(place)),
  };
}

// ─── Seitenkopf ─────────────────────────────────────────────────────────────

function leadBlocks(c: PlaceContext): TextBlock[] {
  const { place, kreis } = c;
  const name = place.name;
  const km = formatKm(place.commute.distanceKm);
  const minutes = formatMinutes(place.commute.minutes);

  if (place.kind === 'stadt') {
    return [
      ort(
        `${name} ist der Sitz des Betriebs. Von der Ortsmitte bis zum Firmensitz in der ${STREET} sind es ${km}, rund ${minutes} mit dem Auto.`,
      ),
    ];
  }
  if (place.kind === 'stadtteil') {
    return [
      ort(
        `${name} gehört mit der Postleitzahl ${place.postalCode} zur Stadt ${HQ_CITY} und liegt ${DIRECTION_ADVERBS[c.dirFromHq]} des Firmensitzes: ${km} Straße, rund ${minutes}.`,
      ),
    ];
  }
  const band = distanceBand(place);
  if (band === 'nah') {
    const { closer, total } = c.areaRank;
    return [
      ort(
        `Aus ${name} ist der Weg kurz: ${km} bis zum Firmensitz in ${HQ_CITY}, rund ${minutes}. Nur ${closer} der ${total} Orte im Einsatzgebiet ${numerus(closer, 'liegt', 'liegen')} näher.`,
      ),
    ];
  }
  if (band === 'mittel') {
    return [
      ort(
        `${name} liegt ${DIRECTION_ADVERBS[c.dirFromHq]} von ${HQ_CITY}, ${km} vom Firmensitz entfernt. Der Routenplaner rechnet mit rund ${minutes}.`,
      ),
    ];
  }
  const adverb = DIRECTION_ADVERBS[c.dirFromHq];
  // Weite Wege (ab 20 km Straße): Satzbau nach Kreis und Streckenstufe; jede Zahl ist Straße, die Luftlinie nennt
  // der Arbeitsweg.
  const outer = c.band === MAX_ROAD_KM;
  if (kreis.id === headquartersKreisId()) {
    if (!outer) {
      return [
        ort(
          `${name} liegt ${adverb} von ${HQ_CITY} und wie der Firmensitz ${kreis.dative}: ${km} Straße, rund ${minutes} Fahrt.`,
        ),
      ];
    }
    return [
      ort(
        `Wie der Firmensitz gehört ${name} zum ${kreis.name}, liegt aber ${adverb} schon weit draußen: ${km} Straße, rund ${minutes}.`,
      ),
    ];
  }
  if (!outer) {
    return [
      ort(
        `${name}, ${adverb} von ${HQ_CITY}, gehört schon zum ${kreis.name}. Bis zum Firmensitz sind es trotzdem nur ${km} Straße, rund ${minutes}.`,
      ),
    ];
  }
  // Kritik 2, P1-3: Ob die 35 km des Fakts radius35 Straße oder Luftlinie meinen, ist offen (fakten-abgleich B33).
  // Der Satz beschreibt deshalb, wie diese Seiten ihre Orte auswählen, keine Grenze des Betriebs.
  if (MAX_ROAD_KM - place.commute.distanceKm <= EDGE_MARGIN_KM) {
    return [
      ort(
        `${name} liegt ${adverb} von ${HQ_CITY}, ${km} Straße vom Firmensitz entfernt, und gehört damit zu den entferntesten Orten auf diesen Seiten: Eine eigene Seite bekommt jeder Ort bis ${formatKm(MAX_ROAD_KM)} Straße. Rund ${minutes} dauert die Fahrt.`,
      ),
    ];
  }
  return [
    ort(
      `${name} ${kreis.dative} ist ${km} Straße vom Firmensitz entfernt. Mit rund ${minutes} Fahrt liegt der Ort ${adverb} von ${HQ_CITY} im äußeren Teil des Einsatzgebiets.`,
    ),
  ];
}

// ─── Arbeitsweg ─────────────────────────────────────────────────────────────

/** Richtung und Luftlinie: Satzbau nach Lage des Orts (Viertel) und Umweg der Straße. */
function routeSentence(c: PlaceContext): string {
  const { place } = c;
  const name = place.name;
  const km = formatKm(place.commute.distanceKm);
  const air = formatAirKm(place.commute.airKm);
  const toTarget = place.kind === 'gemeinde' ? `nach ${HQ_CITY}` : 'zum Firmensitz';

  const direction =
    place.kind === 'stadt'
      ? `Von der Ortsmitte aus liegt der Firmensitz im ${c.dirToHq}`
      : {
          nord: `Von ${name} aus liegt der Firmensitz im ${c.dirToHq}`,
          sued: `Von ${name} fährst du Richtung ${c.dirToHq} ${toTarget}`,
          ost: `${place.kind === 'gemeinde' ? HQ_CITY : 'Der Firmensitz'} liegt von ${name} aus im ${c.dirToHq}`,
          west: `Der Firmensitz liegt ${DIRECTION_ADVERBS[c.dirToHq]} von ${name}`,
        }[quadrantOf(c.dirFromHq)];

  const detour = {
    direkt: `: ${km} Straße bei ${air} Luftlinie, fast ohne Umweg.`,
    leicht: `: ${km} Straße bei ${air} Luftlinie.`,
    normal: `, ${air} Luftlinie oder ${km} auf der Straße.`,
    umweg: `: Luftlinie nur ${air}, doch die Straße macht mit ${km} einen deutlichen Bogen.`,
  }[detourCategory(place)];

  return `${direction}${detour}`;
}

/**
 * Messpunkt, wo er vom Ortsnamen abweicht oder ein Stadtteil-Mittelpunkt ist. Der Messpunkt einer Gemeinde ist ihr
 * `admin_centre` in OpenStreetMap; gegen die Anschrift des Rathauses ist er nicht geprüft, darum „laut OpenStreetMap“.
 */
function measuringPointSentence(c: PlaceContext): string | null {
  const { place } = c;
  if (place.kind === 'stadtteil') return `Startpunkt ist der Ortsmittelpunkt, den OpenStreetMap für ${place.name} führt.`;
  if (place.kind === 'stadt') return `Startpunkt ist die Ortsmitte, die OpenStreetMap für ${place.name} führt.`;
  if (!place.seat) return null;
  if (c.band === RING_RADII_KM[0]) {
    return `Startpunkt ist ${place.seat} (Hauptort laut OpenStreetMap). In anderen Ortsteilen von ${place.name} kann der Weg kürzer oder länger sein.`;
  }
  if (c.band < MAX_ROAD_KM) {
    return `Messpunkt ist ${place.seat}, laut OpenStreetMap der Hauptort von ${place.name}. Andere Ortsteile liegen näher oder weiter.`;
  }
  return `Die Messung startet in ${place.seat}, dem Hauptort laut OpenStreetMap. Aus anderen Ortsteilen von ${place.name} prüfst du deine Strecke am besten selbst im Routenplaner.`;
}

/** Ehrlicher Hinweis zur Messung (Kreis-Hubs, Gebietsseite, llms-full.txt). */
export const MEASUREMENT_NOTE = `Gemessen am ${formatMeasuredOn(MEASUREMENT.measuredOn)} mit OpenStreetMap (OSRM): Richtwert ohne Berufsverkehr.`;

/**
 * Derselbe Hinweis auf der Ortsseite. Nennt kein Satz davor den Startpunkt (Gemeinden, deren Hauptort wie die Gemeinde
 * heißt), steht der Ortsname in der Mitte: gleiche Angaben (Datum, Werkzeug, Richtwert), aber kein Satz, der auf allen
 * Ortsseiten wortgleich steht (scripts/qa/check-local-similarity.mjs). Sonst MEASUREMENT_NOTE, damit der Name nicht
 * zweimal hintereinander steht.
 */
export function measurementNote(place: Pick<Place, 'name'>, startpunktGenannt = false): string {
  if (startpunktGenannt) return MEASUREMENT_NOTE;
  return `Richtwert ohne Berufsverkehr, für ${place.name} gemessen am ${formatMeasuredOn(MEASUREMENT.measuredOn)} mit OpenStreetMap (OSRM).`;
}

function arbeitswegBlocks(c: PlaceContext): TextBlock[] {
  const blocks = [ort(routeSentence(c))];
  const point = measuringPointSentence(c);
  if (point) blocks.push(ort(point));
  blocks.push(gemeinsam(measurementNote(c.place, point !== null)));
  return blocks;
}

// ─── Bus und Bahn ───────────────────────────────────────────────────────────

/** '06:25' → '6:25': Stunde ohne führende Null, wie „7:30 Uhr“ im Plan. */
export function formatUhrzeit(hhmm: string): string {
  return `${Number(hhmm.slice(0, 2))}:${hhmm.slice(3, 5)}`;
}

/** '06:25' → '6:25 Uhr' mit geschütztem Leerzeichen. */
export function formatUhr(hhmm: string): string {
  return `${formatUhrzeit(hhmm)}${NBSP}Uhr`;
}

/** Fußweg in Metern: '150 m', '1.230 m'. */
export function formatMeter(meter: number): string {
  return `${formatNumber(meter)}${NBSP}m`;
}

/** Ansatz der Rechnung (scripts/places/oepnv.mjs): Ankunft bis 7:30 Uhr am Firmensitz, bis 7:45 Uhr an der Schule. */
export const ANKUNFT_BETRIEB = OEPNV_META.betrieb.ankunftBis;
export const ANKUNFT_SCHULE = OEPNV_META.schule.ankunftBis;

/** Zählfenster der Verbindungen am Morgen in vollen Stunden: „06:00–08:00“ → [6, 8]. */
const ZAEHLFENSTER = String(OEPNV_META.methode.zaehlfenster)
  .split(/[–-]/)
  .map((uhr) => Number(uhr.trim().slice(0, 2)));

/** Fahrzeug je Verkehrsmittel mit dem Artikel im Dativ („mit dem Bus 12“, „mit der Straßenbahn 1“). */
const FAHRZEUG: Readonly<Record<OepnvVerkehrsmittel, { name: string; dativ: 'dem' | 'der' }>> = Object.freeze({
  bus: { name: 'Bus', dativ: 'dem' },
  bahn: { name: 'Zug', dativ: 'dem' },
  tram: { name: 'Straßenbahn', dativ: 'der' },
  'u-bahn': { name: 'U-Bahn', dativ: 'der' },
  bedarf: { name: 'Rufbus', dativ: 'dem' },
  faehre: { name: 'Fähre', dativ: 'der' },
  sonstige: { name: 'Linie', dativ: 'der' },
});

/** „Bus 12“, „Zug RE99“: Fahrzeug und Linie mit geschütztem Leerzeichen (Fahrplanliste der Ortsseite). */
export function fahrzeugName(teil: Pick<OepnvTeilstrecke, 'linie' | 'verkehrsmittel'>): string {
  return `${FAHRZEUG[teil.verkehrsmittel].name}${NBSP}${teil.linie}`;
}

/** „dem Bus 12“. */
function fahrzeug(teil: Pick<OepnvTeilstrecke, 'linie' | 'verkehrsmittel'>): string {
  return `${FAHRZEUG[teil.verkehrsmittel].dativ} ${fahrzeugName(teil)}`;
}

export function mitFahrzeug(teil: Pick<OepnvTeilstrecke, 'linie' | 'verkehrsmittel'>): string {
  return `mit ${fahrzeug(teil)}`;
}

/** Zahl der Umstiege im Dativ: „ohne Umstieg“, „mit einem Umstieg“, „mit zwei Umstiegen“. */
function mitUmstiegen(anzahl: number): string {
  if (anzahl === 0) return 'ohne Umstieg';
  if (anzahl === 1) return 'mit einem Umstieg';
  return `mit ${ZAHLWORT[anzahl] ?? anzahl} Umstiegen`;
}

/** Umstiege einer Reihe von Verbindungen: „jede mit einem Umstieg“, „mit einem bis zwei Umstiegen“, „ohne oder mit einem Umstieg“. */
function umstiegeDerReihe(verbindungen: readonly OepnvKurzverbindung[]): string {
  const werte = [...new Set(verbindungen.map((v) => v.umstiege))].sort((a, b) => a - b);
  const min = werte[0];
  const max = werte[werte.length - 1];
  if (werte.length === 1) return min === 0 ? 'alle ohne Umstieg' : `jede ${mitUmstiegen(min)}`;
  if (min === 0) return max === 1 ? 'ohne oder mit einem Umstieg' : `ohne oder mit bis zu ${ZAHLWORT[max] ?? max} Umstiegen`;
  return `mit ${min === 1 ? 'einem' : (ZAHLWORT[min] ?? min)} bis ${ZAHLWORT[max] ?? max} Umstiegen`;
}

/**
 * Satzbau der Fahrplan-Antworten (Gate I4 und U4): Zwischen zwei Angaben dieses Orts (Haltestelle, Abfahrt, Fußweg,
 * Tür zu Tür) stehen höchstens vier feste Wörter, und jede Antwort ist ein Satz, der die Haltestellen des Orts trägt.
 * Orte einer Richtung fahren ab dem ersten Umstieg oft mit denselben Zügen und Bussen und kommen zur selben Zeit an;
 * darum nennt der Satz nach dem ersten Umstieg nur noch die Fahrzeuge. Den ganzen Verlauf mit allen Haltestellen und
 * Zeiten zeigt die Liste daneben (components/einsatzgebiet/Fahrplan.tsx).
 */
function verbindungSatz(v: OepnvVerbindung, frist: string, ankunft: string, vergleich = ''): string {
  const [erste, ...weitere] = v.teilstrecken;
  const zuFuss = v.gehMinStart > 0 ? `${formatMinutes(v.gehMinStart)} zu Fuß zur Haltestelle ${v.ab}` : `ab der Haltestelle ${v.ab}`;
  const fahrt = `um ${formatUhr(erste.abfahrt)} ${mitFahrzeug(erste)} bis ${erste.an}`;
  const umstiege = weitere.length > 0 ? `, dann mit ${joinList(weitere.map(fahrzeug))}` : ' ohne Umstieg';
  return `Um ${formatUhr(v.losgehen)}, für die Ankunft bis ${formatUhr(frist)}: ${zuFuss}, ${fahrt}${umstiege}; ${ankunft} um ${formatUhr(v.ankunft)}, ${formatMinutes(v.reisezeitMin)} Tür zu Tür${vergleich}.`;
}

/** Früheste Ankunft, wenn bis zur Frist keine Verbindung ankommt: aus der Liste am Morgen, sonst aus dem Grund der Datei. */
export function fruehesteAnkunft(weg: OepnvWeg): string | null {
  return weg.verbindungen[0]?.ankunft ?? /früheste kommt um (\d{2}:\d{2}) an/.exec(weg.grund ?? '')?.[1] ?? null;
}

/**
 * Keine Verbindung bis zur Frist: die früheste mit Abfahrt, Ankunft und Umstiegen; kommt auch zwischen 6 und 8 Uhr keine
 * an, steht das dabei und die früheste Ankunft aus dem Grund der Datei.
 */
function keineVerbindung(weg: OepnvWeg): string {
  const erste = weg.verbindungen[0];
  if (erste) {
    return `Nein, die früheste Verbindung fährt um ${formatUhr(erste.abfahrt)} und ist um ${formatUhr(erste.ankunft)} da, ${mitUmstiegen(erste.umstiege)}`;
  }
  const frueh = fruehesteAnkunft(weg);
  const fenster = `zwischen ${ZAEHLFENSTER[0]} und ${ZAEHLFENSTER[1]}${NBSP}Uhr kommt keine Verbindung an`;
  return frueh ? `Nein, ${fenster}, die früheste ist erst um ${formatUhr(frueh)} da` : `Nein, ${fenster}`;
}

/**
 * Ohne Verbindung bis zur Frist: der nächste Nachbarort (Luftlinie), aus dem eine fährt, mit Abfahrt, Haltestelle,
 * erstem Fahrzeug und Ankunft. Er zeigt, wo die nächste Verbindung beginnt; eine Empfehlung ist das nicht.
 */
function nachbarMitVerbindung(c: PlaceContext, ziel: 'betrieb' | 'schule'): string | null {
  const nachbar = c.neighbors.find((n) => n.place.oepnv?.[ziel].moeglich && n.place.oepnv[ziel].spaeteste);
  const v = nachbar?.place.oepnv?.[ziel].spaeteste;
  if (!nachbar || !v) return null;
  return `Aus ${labeled(nachbar.place.name, formatAirKm(nachbar.airKm))}: Abfahrt ${formatUhr(v.abfahrt)} ab ${v.ab} ${mitFahrzeug(v.teilstrecken[0])}, Ankunft ${formatUhr(v.ankunft)}.`;
}

/**
 * Die Verbindungen mit Ankunft im Zählfenster (6 bis 8 Uhr) als Paare aus Abfahrt und Ankunft, dazu ihre Umstiege. Die
 * Abfahrten sind die des Orts; die Ankunftszeiten teilt er oft mit den Orten derselben Strecke. Nach Zahl und Umstiegen
 * steht dasselbe Satzgerüst auf höchstens jeder neunten Seite (Gate U4).
 */
function morgensSatz(weg: OepnvWeg): string | null {
  const reihe = weg.verbindungen;
  if (!weg.moeglich || reihe.length === 0) return null;
  const paare = reihe.map((v) => `${formatUhr(v.abfahrt)} (an ${formatUhrzeit(v.ankunft)})`);
  if (reihe.length === 1) {
    const einzige = reihe[0].ankunft === weg.spaeteste?.ankunft ? 'nur diese' : 'nur eine';
    return `Abfahrt ${paare[0]}, ${einzige} Verbindung, ${mitUmstiegen(reihe[0].umstiege)}.`;
  }
  return `Abfahrt ${joinList(paare)}, ${umstiegeDerReihe(reihe)}.`;
}

/** Haltestellen nah am Startpunkt der Messung mit ihrem Fußweg. */
function haltestellenSatz(place: Place, haltestellen: readonly OepnvHaltestelle[]): string | null {
  if (haltestellen.length === 0) return null;
  const mitte = place.kind === 'stadtteil' ? 'Am Ortsmittelpunkt' : place.seat ? `In ${place.seat}` : 'An der Ortsmitte';
  const liste = haltestellen.map((h, i) => `${h.name} (${formatMeter(h.wegM)}${i === 0 ? ' zu Fuß' : ''})`);
  return `${mitte}: ${joinList(liste)}.`;
}

/** Fragen über den Antworten (Zwischenüberschriften der Ortsseite); die Frist steht in der Frage, nicht in der Antwort. */
export const OEPNV_FRAGEN = Object.freeze({
  los: (name: string) => `Wann musst du in ${name} los?`,
  ohneAuto: (name: string, bis: string) => `Kommst du aus ${name} bis ${formatUhr(bis)} mit Bus und Bahn hin?`,
  morgens: (von: number, bis: number) => `Was kommt zwischen ${von} und ${bis}${NBSP}Uhr an?`,
  haltestelle: 'Wo ist die nächste Haltestelle?',
  nachbar: (bis: string) => `Aus welchem Nachbarort geht es bis ${formatUhr(bis)}?`,
  schule: 'Welche Berufsschule ist zuständig?',
  schulweg: (name: string) => `Wann musst du in ${name} zur Schule los?`,
  schulwegOhne: (name: string, bis: string) => `Kommst du aus ${name} bis ${formatUhr(bis)} zur Schule?`,
  schulMorgens: 'Welche Verbindungen gibt es am Morgen?',
});

/**
 * Bus und Bahn zum Firmensitz (Datenklasse oepnv): die späteste Verbindung mit Ankunft bis 7:30 Uhr, die Verbindungen
 * am Morgen und die Haltestellen am Startpunkt. Gibt es keine Verbindung bis 7:30 Uhr, ist genau das die Auskunft, mit
 * der frühesten Ankunft und der Fahrzeit mit dem Auto (Plan §B).
 */
function oepnvBlocks(c: PlaceContext, oepnv: OepnvOrt): TextBlock[] {
  const { place } = c;
  const weg = oepnv.betrieb;
  const auto = `mit dem Auto ${formatMinutes(place.commute.minutes)}`;
  const blocks: TextBlock[] = [];
  if (weg.moeglich && weg.spaeteste) {
    const zuFuss = weg.direktZuFussMin ? `, zu Fuß ${formatMinutes(weg.direktZuFussMin)}` : '';
    blocks.push(ausDaten('oepnv', verbindungSatz(weg.spaeteste, weg.ankunftBis, 'am Firmensitz', `, ${auto}${zuFuss}`), OEPNV_FRAGEN.los(place.name)));
  } else {
    blocks.push(ausDaten('oepnv', `${keineVerbindung(weg)}; ${auto}.`, OEPNV_FRAGEN.ohneAuto(place.name, weg.ankunftBis)));
    const nachbar = nachbarMitVerbindung(c, 'betrieb');
    if (nachbar) blocks.push(ausDaten('oepnv', nachbar, OEPNV_FRAGEN.nachbar(weg.ankunftBis)));
  }
  const morgens = morgensSatz(weg);
  if (morgens) blocks.push(ausDaten('oepnv', morgens, OEPNV_FRAGEN.morgens(ZAEHLFENSTER[0], ZAEHLFENSTER[1])));
  const halte = haltestellenSatz(place, oepnv.startHaltestellen);
  if (halte) blocks.push(ausDaten('oepnv', halte, OEPNV_FRAGEN.haltestelle));
  return blocks;
}

// ─── Berufsschule ───────────────────────────────────────────────────────────

const SCHULE = BERUFSSCHULE.schule;

/**
 * Zuständigkeit laut Verordnung: für jeden Wohnort dieselbe Schule, weil der Ausbildungsort zählt. Der Wohnort steht in
 * der Mitte, damit der Satz nicht auf allen Ortsseiten wortgleich ist (wie measurementNote). Status `laut-verordnung`,
 * bis der Inhaber bestätigt (MENSCHEN M-024).
 */
export function berufsschuleZustaendig(place: Pick<Place, 'name' | 'kind'>): string {
  const { grundstufe, fachstufe } = BERUFSSCHULE.stufen;
  const stufen = grundstufe === fachstufe ? 'Grund- und Fachstufe' : `Grundstufe ${grundstufe}, Fachstufe ${fachstufe}`;
  const bestaetigung = BERUFSSCHULE.status === 'bestaetigt' ? 'Der Betrieb hat das bestätigt.' : 'Bestätigt hat der Betrieb das noch nicht.';
  // In Wetzlar und seinen Stadtteilen ist der Wohnort zugleich die Stadt des Ausbildungsorts
  const wohnort = place.kind === 'gemeinde' ? `nicht ${place.name} als Wohnort` : 'nicht der Stadtteil, in dem du wohnst';
  return `Laut Fachklassenverordnung die ${SCHULE.name}, ${SCHULE.strasse}, für ${stufen}: Es zählt der Ausbildungsort, ${wohnort}. ${bestaetigung}`;
}

/** Fakt zum Schulweg in der Ausbildung: Fahrtkostenzuschuss zur Berufsschule (travelAllowance). */
export const AZUBI_WEG_FACT_IDS: readonly FactId[] = Object.freeze(['travelAllowance']);

/**
 * Weg zur Berufsschule (Datenklasse berufsschule): späteste Verbindung mit Ankunft bis 7:45 Uhr und der Vergleich mit dem
 * Weg zum Firmensitz; ohne Verbindung die früheste Ankunft.
 */
function schulwegBlock(c: PlaceContext, oepnv: OepnvOrt): TextBlock {
  const { place } = c;
  const weg = oepnv.schule;
  if (!weg.moeglich || !weg.spaeteste) {
    const nachbar = nachbarMitVerbindung(c, 'schule');
    return ausDaten('berufsschule', `${keineVerbindung(weg)}.${nachbar ? ` ${nachbar}` : ''}`, OEPNV_FRAGEN.schulwegOhne(place.name, weg.ankunftBis));
  }
  const betrieb = oepnv.betrieb.spaeteste;
  const diff = betrieb ? weg.spaeteste.reisezeitMin - betrieb.reisezeitMin : null;
  const vergleich =
    diff === null ? '' : diff === 0 ? ', so lange wie zum Firmensitz' : `, ${formatMinutes(Math.abs(diff))} ${diff > 0 ? 'mehr' : 'weniger'} als zum Firmensitz`;
  const zuFuss = weg.direktZuFussMin ? `, zu Fuß ${formatMinutes(weg.direktZuFussMin)}` : '';
  return ausDaten('berufsschule', verbindungSatz(weg.spaeteste, weg.ankunftBis, 'an der Schule', `${vergleich}${zuFuss}`), OEPNV_FRAGEN.schulweg(place.name));
}

function schuleBlocks(c: PlaceContext, oepnv: OepnvOrt): TextBlock[] {
  const morgens = morgensSatz(oepnv.schule);
  return [
    { ...gemeinsam(berufsschuleZustaendig(c.place)), frage: OEPNV_FRAGEN.schule },
    schulwegBlock(c, oepnv),
    ...(morgens && oepnv.schule.verbindungen.length > 1 ? [ausDaten('berufsschule', morgens, OEPNV_FRAGEN.schulMorgens)] : []),
    gemeinsam(AZUBI_WEG_FACT_IDS.map((id) => FACTS[id].long).join(' '), AZUBI_WEG_FACT_IDS),
  ];
}

// ─── Quellen der Datenklassen (Bildunterschriften, nicht im Fließtext) ──────

/** Bearbeitungshinweis aus oepnv.json ohne den Skriptpfad in Klammern (CC BY 4.0, Abschnitt 3 a). */
const BEARBEITUNG = OEPNV_QUELLE.bearbeitung.replace(/\s*\([^)]*\)\s*$/, '');

/**
 * Namensnennung unter Bus und Bahn: Werktag und Stand, dazu der Wortlaut aus oepnv.json (CC BY 4.0 verlangt Urheber,
 * Lizenz und Hinweis auf die Bearbeitung; den Link auf die Lizenz setzt die Seite). Die Fußwege stammen aus
 * OpenStreetMap: eigene Nennung mit ODbL und Link auf openstreetmap.org/copyright (OEPNV_QUELLENLINKS; Prüfung E-029,
 * Runde 3). Die Fristen 7:30 und 7:45 Uhr nennen die Antworten selbst. Steht als Quellenzeile unter den Angaben, nicht
 * im Ortstext.
 */
export const OEPNV_QUELLENZEILE = `Fahrplan für ${OEPNV_META.wochentag}, ${formatMeasuredOn(OEPNV_META.werktag)}, Datenstand ${formatMeasuredOn(FAHRPLAN_STAND.stand)}: ${OEPNV_QUELLE.namensnennung}. ${BEARBEITUNG}. Fußwege: ${OSM_NAMENSNENNUNG}.`;

/** Links der Quellenzeile von Bus und Bahn: CC BY 4.0 des Fahrplans, Urheberrecht und ODbL der Fußwege (lib/places/osm.ts). */
export const OEPNV_QUELLENLINKS = Object.freeze([{ label: OEPNV_QUELLE.lizenz, href: OEPNV_QUELLE.lizenzUrl }, OSM_LINK]);

/** Kurzform des Gesetzblatts aus dem Titel der Verordnung: „GVBl. Hessen 2026 Nr. 21“. */
const GESETZBLATT = (() => {
  const treffer = /GVBl\.\s*(\d{4})\s*Nr\.\s*(\d+)/.exec(BERUFSSCHULE.quellen[0]?.titel ?? '');
  return treffer ? `GVBl. Hessen ${treffer[1]} Nr.${NBSP}${treffer[2]}` : (BERUFSSCHULE.quellen[0]?.titel ?? '');
})();

/** Fundstellen der Zuständigkeit und der Ansatz für den Schulweg (Unterrichtsbeginn nicht belegt). */
export const BERUFSSCHULE_QUELLENZEILE = `Zuständigkeit: Fachklassenverordnung (${GESETZBLATT}) und Schulbezirkssatzung ${KREIS_DEFS[BERUFSSCHULE.ausbildungsort.kreisId].genitive}. ${BERUFSSCHULE.unterrichtsbeginn ? `Unterrichtsbeginn ${formatUhr(BERUFSSCHULE.unterrichtsbeginn)}.` : 'Der Unterrichtsbeginn ist nicht belegt.'} Fahrplan wie oben.`;

// ─── Stellen ────────────────────────────────────────────────────────────────

/** Satz „Fahrt ab Wohnort“ aus dem Fakt vehicle (Plan: unter den Stellen, für den Kundendienst). */
const VEHICLE_FROM_HOME = FACTS.vehicle.long.split(/(?<=\.)\s+/).find((sentence) => sentence.includes('Wohnort')) ?? FACTS.vehicle.long;

/**
 * Einleitung über der Stellenliste: Zahl der Stellen und dass jede ihr Gehalt bzw. ihre Vergütung nennt. Die Beträge
 * stehen einmal, in der Liste darunter (JobAbgaenge), nicht noch einmal im Fließtext. Den Satz „Fahrt ab Wohnort“
 * (Fakt vehicle) tragen nur die Kreis-Hubs: Auf 54 Ortsseiten wäre er derselbe Satz und hübe die Ähnlichkeit der
 * gebauten Seiten (scripts/qa/check-local-similarity.mjs) über die Grenze.
 */
function stellenBlocks(jobs: readonly Job[], { vehicle = true }: { vehicle?: boolean } = {}): TextBlock[] {
  if (jobs.length === 0) {
    return [gemeinsam('Gerade ist keine Stelle ausgeschrieben. Eine Initiativbewerbung ist jederzeit möglich.')];
  }
  const paid = jobs.filter((job) => job.salary);
  const trainee = paid.filter((job) => job.employment.kind === 'ausbildung').length;
  const pay = trainee === 0 ? 'Gehalt' : trainee === paid.length ? 'Vergütung' : 'Gehalt bzw. Vergütung';
  const lead =
    jobs.length === 1
      ? `Offen ist eine Stelle${paid.length === 1 ? `, mit ${pay}` : ''}:`
      : `Offen sind ${ZAHLWORT[jobs.length] ?? jobs.length} Stellen${paid.length === jobs.length ? `, jede mit ${pay}` : ''}:`;
  const blocks = [gemeinsam(lead)];
  if (vehicle && jobs.some((job) => job.category === 'kundendienst')) {
    blocks.push(gemeinsam(`Im Kundendienst gilt: ${VEHICLE_FROM_HOME}`, ['vehicle']));
  }
  return blocks;
}

// ─── Nachbarorte ────────────────────────────────────────────────────────────

/**
 * Name mit Wert: „Lollar (26 km)“. Trägt der Name selbst eine Klammer („Waldbrunn (Westerwald)“), folgt der Wert mit
 * „mit“, damit er nicht wie ein Teil des Namens liest: „Waldbrunn (Westerwald) mit 27 km“.
 */
export function labeled(name: string, value: string): string {
  return / \(.+\)$/.test(name) ? `${name} mit ${value}` : `${name} (${value})`;
}

/**
 * Nachbarorte mit ihrer Luftlinie zum Ort der Seite. Der erste Wert eines Satzes sagt, wovon er zählt („Garbenheim
 * (2,8 km von Lahnau)“), die folgenden nur die Zahl: Neben „näher am Firmensitz“ liest sich eine nackte Zahl sonst
 * wie die Strecke zum Firmensitz.
 */
function neighborItems(place: Place): (neighbor: Neighbor) => string {
  let first = true;
  // In der Klammer ohne den Zusatz des Namens: „(5,4 km von Waldbrunn)“ statt doppelter Klammer.
  const reference = place.name.replace(/ \(.+\)$/, '');
  return (neighbor) => {
    const air = formatAirKm(neighbor.airKm);
    const value = first ? `${air} von ${reference}` : air;
    first = false;
    return labeled(neighbor.place.name, value);
  };
}

/** Wo die vier nächsten Orte im Vergleich zum Firmensitz liegen: näher, gleich weit, weiter weg. */
function neighborPositionSentence(c: PlaceContext): string {
  const { place, neighbors } = c;
  const km = place.commute.distanceKm;
  const closer = neighbors.filter((n) => n.distanceKm < km);
  const same = neighbors.filter((n) => n.distanceKm === km);
  const farther = neighbors.filter((n) => n.distanceKm > km);
  const neighborItem = neighborItems(place);

  if (closer.length === 0 && same.length === 0) {
    return `${place.name} liegt näher am Firmensitz als alle ${NEIGHBOR_WORD} Nachbarorte: ${joinList(neighbors.map(neighborItem))}.`;
  }
  if (farther.length === 0 && same.length === 0) {
    // „liegen näher“, nicht „haben es näher“: Orte fahren nicht (Kritik 2, P2-7)
    return `Alle ${NEIGHBOR_WORD} Nachbarorte liegen näher am Firmensitz als ${place.name}: ${joinList(neighbors.map(neighborItem))}.`;
  }
  const parts: string[] = [];
  if (closer.length > 0) {
    parts.push(`Näher am Firmensitz als ${place.name} ${numerus(closer.length, 'liegt', 'liegen')} ${joinList(closer.map(neighborItem))}`);
  } else {
    parts.push(`Gleich weit vom Firmensitz wie ${place.name} ${numerus(same.length, 'liegt', 'liegen')} ${joinList(same.map(neighborItem))}`);
  }
  if (closer.length > 0 && same.length > 0) parts.push(`gleich weit ${joinList(same.map(neighborItem))}`);
  if (farther.length > 0) parts.push(`weiter weg ${joinList(farther.map(neighborItem))}`);
  return `${parts.join(', ')}.`;
}

/** Himmelsrichtung von `from` nach `to` als Adverb: „nordwestlich“. */
const adverbBetween = (from: Place, to: Place) => DIRECTION_ADVERBS[directionOf(bearingDeg(from, to))];

/**
 * Der nächste Nachbar im Vergleich: Strecke und Fahrzeit zum Firmensitz. Ein Satzbau für alle Fälle, „Aus Rockenberg,
 * 4,6 km östlich, sind es …“ (Kritik 2, P2-7: „Rockenberg braucht genauso 27 Minuten“ machte den Ort zur Person, und
 * drei Muster standen nebeneinander). Die Lage bezieht sich auf den Ort der Seite.
 */
function nearestNeighborSentence(c: PlaceContext): string {
  const { place } = c;
  const nearest = c.neighbors[0];
  const dm = nearest.minutes - place.commute.minutes;
  const dk = nearest.distanceKm - place.commute.distanceKm;
  const aus = `Aus ${nearest.place.name}, ${formatAirKm(nearest.airKm)} ${adverbBetween(place, nearest.place)},`;
  const theirKm = formatKm(nearest.distanceKm);
  const theirMinutes = formatMinutes(nearest.minutes);

  if (dm === 0) return `${aus} sind es ebenfalls ${theirMinutes} zum Firmensitz.`;
  if (dm < 0 && dk < 0) {
    return `${aus} sind es ${theirKm} und ${theirMinutes} zum Firmensitz: ${-dm <= 3 ? 'nur ' : ''}${formatMinutes(-dm)} weniger als aus ${place.name}.`;
  }
  if (dm < 0) {
    return `${aus} ist die Strecke mit ${theirKm} ${dk === 0 ? 'gleich lang' : 'länger'}, laut Routenplaner bist du aber ${formatMinutes(-dm)} früher am Firmensitz.`;
  }
  if (dk > 0) return `${aus} sind es ${theirKm} und ${theirMinutes} zum Firmensitz: ${formatMinutes(dm)} mehr als aus ${place.name}.`;
  return `${aus} ist die Strecke mit ${theirKm} ${dk === 0 ? 'gleich lang' : 'kürzer'}, laut Routenplaner dauert die Fahrt aber ${formatMinutes(dm)} länger.`;
}

/**
 * Nachbarorte jenseits der Kreisgrenze. Satzbau nach Kreis des Firmensitzes: gleicher Kreis wie der Firmensitz,
 * Grenze aus Sicht des Firmensitz-Kreises oder Grenze zwischen zwei Nachbarkreisen.
 */
function kreisBorderSentences(c: PlaceContext): string[] {
  const byKreis = new Map<string, string[]>();
  for (const neighbor of c.neighbors) {
    if (neighbor.place.kreisId === c.place.kreisId) continue;
    byKreis.set(neighbor.place.kreisId, [...(byKreis.get(neighbor.place.kreisId) ?? []), neighbor.place.name]);
  }
  const hqKreis = headquartersKreisId();
  const kreisName = (kreisId: string) => getPlaceKreis({ kreisId: kreisId as Place['kreisId'] }).name;
  const sentences: string[] = [];
  const hqNames = byKreis.get(hqKreis);
  if (hqNames) {
    sentences.push(`${joinList(hqNames)} ${numerus(hqNames.length, 'gehört', 'gehören')} wie der Firmensitz zum ${kreisName(hqKreis)}.`);
  }
  const others = [...byKreis].filter(([kreisId]) => kreisId !== hqKreis);
  if (others.length === 0) return sentences;
  if (c.place.kreisId === hqKreis) {
    const parts = others.map(
      ([kreisId, names], i) => `${joinList(names)} ${i === 0 ? `${numerus(names.length, 'gehört', 'gehören')} ` : ''}zum ${kreisName(kreisId)}`,
    );
    sentences.push(`Über die Kreisgrenze: ${parts.join(', ')}.`);
  } else {
    // „Langgöns gehört schon zum Landkreis Gießen.“ bzw. „A gehört schon zum X, B zum Y.“
    const parts = others.map(
      ([kreisId, names], i) =>
        `${joinList(names)} ${i === 0 ? `${numerus(names.length, 'gehört', 'gehören')} schon ` : ''}zum ${kreisName(kreisId)}`,
    );
    sentences.push(`${parts.join(', ')}.`);
  }
  return sentences;
}

/**
 * Lage in der eigenen Himmelsrichtung ab Firmensitz (Sektor zu 45°): erster, äußerster oder mittlerer Ort, mit
 * dem direkt davor bzw. dahinter liegenden Ort. Innere Orte nennen den nächsten, äußere den vorigen: So führt
 * jede Richtung als Kette von Ort zu Ort. `named` sind die genannten (und verlinkten) Orte.
 */
function sectorSentence(c: PlaceContext): { text: string; named: Place[] } {
  const { place } = c;
  const sector = c.published.filter((p) => directionFromHeadquarters(p) === c.dirFromHq).sort(compareByDistance);
  const r = rankByDistance(place, sector);
  const others = sector.filter((p) => p.id !== place.id);
  const index = sector.findIndex((p) => p.id === place.id);
  const item = (p: Place) => labeled(p.name, formatKm(p.commute.distanceKm));
  const dir = `Richtung ${c.dirFromHq}`;
  if (others.length === 0) return { text: `${dir} ist ${place.name} der einzige Ort des Einsatzgebiets.`, named: [] };
  if (r.closer === 0 && r.farther === 0) {
    return { text: `${dir} liegen nur ${place.name} und ${joinList(r.sameAs.map((p) => p.name))} im Einsatzgebiet.`, named: r.sameAs };
  }
  const first = others[0];
  const last = others[others.length - 1];
  const prev = sector[index - 1];
  const next = sector[index + 1];

  // Reihenfolge nach Strecke (bei Gleichstand nach Fahrzeit); „näher“ und „weiter“ zählen nur echte Unterschiede.
  if (r.closer === 0 && r.same === 0) {
    return next.id === last.id
      ? { text: `${dir} ist ${place.name} der erste Ort ab dem Firmensitz; dahinter folgt nur noch ${item(last)}.`, named: [last] }
      : {
          text: `${dir} ist ${place.name} der erste Ort ab dem Firmensitz; dahinter folgen ${others.length} weitere, zuerst ${item(next)}, zuletzt ${item(last)}.`,
          named: [next, last],
        };
  }
  if (r.farther === 0 && r.same === 0) {
    return prev.id === first.id
      ? { text: `${dir} ist ${place.name} der äußerste Ort des Gebiets; davor liegt nur ${item(first)}.`, named: [first] }
      : {
          text: `${dir} ist ${place.name} der äußerste Ort des Gebiets; davor liegen ${others.length} weitere, zuerst ${item(first)}, direkt davor ${item(prev)}.`,
          named: [first, prev],
        };
  }
  if (r.closer === 1 && r.farther === 1 && r.same === 0) {
    return { text: `${dir} liegt ${place.name} zwischen ${item(first)} und ${item(last)}.`, named: [first, last] };
  }
  if (r.closer === 1 && r.same === 0 && next) {
    return {
      text: `${dir} liegt nur ${item(first)} näher am Firmensitz als ${place.name}; dahinter ${numerus(r.farther, 'folgt', 'folgen')} ${r.farther} ${numerus(r.farther, 'Ort', 'weitere')}, zuerst ${item(next)}, zuletzt ${item(last)}.`,
      named: [first, next, last].filter((p, i, list) => list.indexOf(p) === i),
    };
  }
  if (r.farther === 1 && r.same === 0 && prev) {
    return {
      text: `${dir} kommt hinter ${place.name} nur noch ${item(last)}; davor ${numerus(r.closer, 'liegt', 'liegen')} ${r.closer} ${numerus(r.closer, 'Ort', 'Orte')}, direkt davor ${item(prev)}.`,
      named: [last, prev],
    };
  }
  if (r.closer < r.farther && next) {
    return {
      text: `${dir} ${numerus(r.closer, 'liegt', 'liegen')} ${r.closer} ${numerus(r.closer, 'Ort', 'Orte')} vor ${place.name} und ${r.farther} dahinter, als nächster ${item(next)}, zuletzt ${item(last)}.`,
      named: [next, last],
    };
  }
  const sameNames = joinList(r.sameAs.map((p) => p.name));
  if (r.closer === 0) {
    return { text: `${dir} liegen ${place.name} und ${sameNames} gleichauf vorn; zuletzt kommt ${item(last)}.`, named: [...r.sameAs, last] };
  }
  if (r.farther === 0) {
    return { text: `${dir} liegen ${place.name} und ${sameNames} gleichauf ganz außen; zuerst kommt ${item(first)}.`, named: [...r.sameAs, first] };
  }
  const before = prev ?? first;
  const beforeClause = before.commute.distanceKm === place.commute.distanceKm ? `gleich weit ${item(before)}` : `direkt davor ${item(before)}`;
  return {
    text: `${dir} liegen ${r.closer} von ${sector.length} Orten näher als ${place.name}, ${beforeClause}; ganz außen liegt ${item(last)}.`,
    named: [before, last],
  };
}

function nachbarnBlocks(c: PlaceContext): TextBlock[] {
  return [neighborPositionSentence(c), nearestNeighborSentence(c), ...kreisBorderSentences(c), sectorSentence(c).text].map((text) =>
    ort(text),
  );
}

// ─── Stadtteile (nur Stadtseite) ────────────────────────────────────────────

function stadtteileBlocks(c: PlaceContext): TextBlock[] {
  const stadtteile = c.stadtteile;
  if (stadtteile.length === 0) return [];
  const stats = groupStats(stadtteile);
  const list = stadtteile.map((s) => labeled(s.name, formatKm(s.commute.distanceKm)));
  const names = (places: readonly Place[]) => joinList(places.map((p) => p.name));
  return [
    ort(`Zu ${c.place.name} gehören ${stadtteile.length} Stadtteile mit eigener Seite: ${joinList(list)}.`),
    ort(
      `Am schnellsten bist du aus ${names(stats.fastest)} am Firmensitz (${formatMinutes(stats.fastest[0].commute.minutes)}), am längsten brauchst du aus ${names(stats.slowest)} (${formatMinutes(stats.slowest[0].commute.minutes)}).`,
    ),
  ];
}

// ─── Kreis und Lage ─────────────────────────────────────────────────────────

/**
 * Rang nach Strecke im Kreis: nächster, weitester, sonst nach Viertel (vorderes, zweites, drittes, hinteres).
 * Gleich weite Orte werden mit Namen genannt.
 */
function kreisRankSentences(c: PlaceContext): string[] {
  const { place, kreis, kreisRank: r } = c;
  const km = formatKm(place.commute.distanceKm);
  const sameNames = joinList(r.sameAs.map((p) => p.name));
  const quarter = r.total / 4;

  if (r.closer === 0 && r.same === 0) {
    return [`${upperFirst(kreis.dative)} liegt kein Ort des Einsatzgebiets näher am Firmensitz als ${place.name}.`];
  }
  if (r.closer === 0) return [`${place.name} teilt sich mit ${sameNames} den kürzesten Weg ${kreis.genitive}: je ${km}.`];
  if (r.farther === 0 && r.same === 0) {
    return [`Kein Ort ${kreis.genitive} im Einsatzgebiet hat einen längeren Weg zum Firmensitz als ${place.name}.`];
  }
  if (r.farther === 0) return [`${place.name} teilt sich mit ${sameNames} den längsten Weg ${kreis.genitive}: je ${km}.`];

  // Kurze Sätze mit dem Ortsnamen in der Mitte: Gleich weite Orte eines Kreises bekommen sonst wortgleiche Sätze.
  let sentence: string;
  if (r.closer === 1 && r.farther === 1 && r.same === 0) {
    const [before, after] = c.kreisStats.places.filter((p) => p.id !== place.id);
    sentence = `${place.name} liegt ${kreis.dative} in der Mitte: ${before.name} ist näher am Firmensitz, ${after.name} weiter weg.`;
  } else if (r.closer <= quarter) {
    sentence = `Nur ${numerus(r.closer, 'einer', String(r.closer))} der ${r.total} Orte ${kreis.genitive} ${numerus(r.closer, 'hat', 'haben')} einen kürzeren Weg als ${place.name}.`;
  } else if (r.closer < r.farther) {
    sentence = `${place.name} gehört zur näheren Hälfte ${kreis.genitive}: ${r.closer} Orte liegen näher, ${r.farther} weiter weg.`;
  } else if (r.farther <= quarter) {
    sentence = `Einen noch längeren Weg als ${place.name} ${numerus(r.farther, 'hat', 'haben')} ${kreis.dative} nur ${numerus(r.farther, 'einer', String(r.farther))} von ${r.total} Orten.`;
  } else if (r.closer === r.farther) {
    sentence = `${place.name} liegt ${kreis.dative} in der Mitte: Je ${r.closer} Orte liegen näher und weiter weg.`;
  } else {
    sentence = `${place.name} gehört zur ferneren Hälfte ${kreis.genitive}: ${r.closer} Orte liegen näher, ${r.farther} weiter weg.`;
  }
  // Gleich weite Nachbarorte nennt schon der Abschnitt „Orte rund um …“.
  const neighborIds = new Set(c.neighbors.map((n) => n.place.id));
  const sameElsewhere = r.sameAs.filter((p) => !neighborIds.has(p.id));
  return sameElsewhere.length > 0
    ? [sentence, `Genauso weit wie aus ${place.name} fährst du aus ${joinList(sameElsewhere.map((p) => p.name))}.`]
    : [sentence];
}

/** Fahrzeit gegen den Median des Kreises: „Mit 11 Minuten liegt Lahnau 2 Minuten unter der mittleren Fahrzeit …“. */
function kreisMedianSentence(c: PlaceContext): string {
  const { place, kreis, kreisMedian: m } = c;
  const own = formatMinutes(place.commute.minutes);
  const median = formatMinutes(m.medianMinutes);
  if (m.relation === 'gleich') {
    return `Mit ${own} liegt ${place.name} genau auf der mittleren Fahrzeit ${kreis.dative}.`;
  }
  const where = m.relation === 'schneller' ? 'unter' : 'über';
  return `Mit ${own} liegt ${place.name} ${formatMinutes(m.diffMinutes)} ${where} der mittleren Fahrzeit ${kreis.dative} (${median}).`;
}

/** Kreise ohne Hub (< 3 Orte): Vergleich mit dem anderen Ort des Kreises. */
function smallKreisSentences(c: PlaceContext): string[] {
  const { place, kreis } = c;
  const all = c.kreisStats.places;
  const others = all.filter((p) => p.id !== place.id);
  if (others.length === 0) return [`${upperFirst(kreis.dative)} ist ${place.name} der einzige Ort im Einsatzgebiet.`];
  const sentences = [
    `${upperFirst(kreis.dative)} ${numerus(all.length, 'liegt', 'liegen')} nur ${ZAHLWORT[all.length] ?? all.length} Orte innerhalb von ${formatKm(MAX_ROAD_KM)} Straße: ${joinList(all.map((p) => p.name))}.`,
  ];
  for (const other of others) {
    const dk = other.commute.distanceKm - place.commute.distanceKm;
    const dm = other.commute.minutes - place.commute.minutes;
    // Orte fahren nicht: die Fahrt dauert länger, nicht „der Ort braucht länger“ (Kritik 2, P2-7)
    if (dk < 0 && dm > 0) {
      sentences.push(
        `${other.name} liegt ${formatKm(-dk)} näher am Firmensitz, laut Routenplaner dauert die Fahrt von dort aber ${formatMinutes(dm)} länger.`,
      );
    } else if (dk > 0 && dm < 0) {
      sentences.push(
        `${place.name} liegt ${formatKm(dk)} näher am Firmensitz als ${other.name}, laut Routenplaner dauert die Fahrt von hier aber ${formatMinutes(-dm)} länger.`,
      );
    } else {
      const strecke = dk === 0 ? 'gleich lang' : `${formatKm(Math.abs(dk))} ${dk < 0 ? 'kürzer' : 'länger'}`;
      const zeit = dm === 0 ? 'gleich lang' : `${formatMinutes(Math.abs(dm))} ${dm < 0 ? 'kürzer' : 'länger'}`;
      sentences.push(`Aus ${other.name} ist die Strecke ${strecke} und die Fahrt ${zeit}.`);
    }
  }
  return sentences;
}

/** Rang unter den Wetzlarer Stadtteilen (ersetzt für Stadtteile den Rang im Kreis). */
function stadtteilRankSentence(c: PlaceContext): string | null {
  const { place } = c;
  if (place.kind !== 'stadtteil' || c.stadtteile.length < 2) return null;
  const r = rankByDistance(place, c.stadtteile);
  const n = c.stadtteile.length;
  const km = formatKm(place.commute.distanceKm);
  const sameNames = joinList(r.sameAs.map((p) => p.name));
  const city = `${HQ_CITY}er`;
  if (r.closer === 0 && r.same === 0) return `Von den ${n} ${city} Stadtteilen mit eigener Seite liegt ${place.name} am nächsten am Firmensitz.`;
  if (r.closer === 0) return `${place.name} und ${sameNames} sind mit je ${km} die Stadtteile mit dem kürzesten Weg.`;
  if (r.farther === 0 && r.same === 0) return `${place.name} hat unter den ${n} ${city} Stadtteilen den längsten Weg.`;
  if (r.farther === 0) return `${place.name} und ${sameNames} haben mit je ${km} den längsten Weg der ${n} ${city} Stadtteile.`;
  const same = r.same > 0 ? `, ${sameNames} den gleichen` : '';
  return `Unter den ${n} ${city} Stadtteilen ${numerus(r.closer, 'hat', 'haben')} ${r.closer} einen kürzeren Weg als ${place.name}, ${r.farther} einen längeren${same}.`;
}

/**
 * Freigegebene Kurzbeschreibung (MENSCHEN M-016), wörtlich als eigener Satz. Orte ohne freigegebene Beschreibung
 * bekommen keinen Ersatz: Ein Verweis auf die Karte der Startseite sagt dem Leser nichts.
 */
function characterSentence(c: PlaceContext): string | null {
  const { place } = c;
  return place.character ? `${place.name} in Stichworten: ${place.character.text}.` : null;
}

function kreisBlocks(c: PlaceContext): TextBlock[] {
  const sentences: string[] = [];
  const stadtteil = stadtteilRankSentence(c);
  if (stadtteil) sentences.push(stadtteil);
  else if (c.kreis.hasHub) sentences.push(...kreisRankSentences(c));
  if (c.kreis.hasHub) sentences.push(kreisMedianSentence(c));
  else sentences.push(...smallKreisSentences(c));
  const character = characterSentence(c);
  if (character) sentences.push(character);
  return sentences.map((text) => ort(text));
}

// ─── Band und Kontakt ───────────────────────────────────────────────────────

/**
 * Fakten ohne eigenen Satz (der lange Text ist nur die Kurzform mit Punkt) tragen im Band den Satz eines belegten
 * Begleitfakts, wie die Zusage „Flexible Arbeitszeiten“ auf der Startseite (components/home/vorteile/vorteile-text.ts
 * ZUSAGEN): „Keine unbezahlten Überstunden.“ Keine neue Aussage, nur die Paarung der Startseite. Steht hier, weil das
 * Gate (I6) jeden Fakt prüft, den die Seite zeigt, auch den Begleiter (components/einsatzgebiet/Bausteine.tsx).
 */
export const FAKT_BEGLEITER: Readonly<Partial<Record<FactId, FactId>>> = Object.freeze({ flexibleHours: 'noUnpaidOvertime' });

/**
 * Fakten im Band einer Ortsseite oder eines Kreis-Hubs: nur, was für alle gezeigten Stellen gilt; fällt einer weg,
 * steht BAND_ERSATZ vor dem letzten.
 */
export function bandFactIds(kreis: Pick<Kreis, 'factIds'>, jobs: readonly Job[] = getActiveJobs()): FactId[] {
  const gilt = (id: FactId) => giltFuerAlle(id, jobs);
  const last = BAND_FACT_IDS[BAND_FACT_IDS.length - 1];
  const vorne = BAND_FACT_IDS.slice(0, -1).filter(gilt);
  const schluss = gilt(last) ? [last] : [];
  const ersatz = vorne.length + schluss.length < BAND_FACT_IDS.length && gilt(BAND_ERSATZ) ? [BAND_ERSATZ] : [];
  const kreisFacts = kreis.factIds.filter((id) => !BAND_FACT_IDS.includes(id) && id !== BAND_ERSATZ && gilt(id));
  return [...vorne, ...kreisFacts, ...ersatz, ...schluss];
}

/** Band (Etikettkasten): je Fakt die Kurzform; den ganzen Satz liefert FACTS[id].long über `factIds`. */
function bandBlocks(kreis: Pick<Kreis, 'factIds'>, jobs: readonly Job[]): TextBlock[] {
  return bandFactIds(kreis, jobs).map((id) => gemeinsam(FACTS[id].short, [id]));
}

/**
 * Sichtbarer Text des Kontakts: was in der vorbereiteten WhatsApp-Nachricht (whatsappGreeting) schon steht. Die
 * Nachricht selbst steht im Link, nicht auf der Seite. Den Ansprechpartner nennt der Kontaktblock darunter
 * (ContactOptions). Der Ortsname unterbricht den Text, der sonst auf jeder Ortsseite gleich wäre.
 */
export function kontaktText(place: Pick<Place, 'name'>): string {
  return `Lieber erst fragen? In der WhatsApp-Nachricht steht schon „ich komme aus ${place.name}“.`;
}

function kontaktBlocks(place: Place): TextBlock[] {
  return [gemeinsam(kontaktText(place))];
}

// ─── Ortsseite ──────────────────────────────────────────────────────────────

export type PlaceSectionId =
  | 'lead'
  | 'arbeitsweg'
  | 'oepnv'
  | 'schule'
  | 'stellen'
  | 'nachbarn'
  | 'stadtteile'
  | 'kreis'
  | 'band'
  | 'kontakt';

export interface PlacePageText {
  placeId: string;
  path: string;
  meta: PageMeta;
  /** Etikett über der h1: „35614 Aßlar · Lahn-Dill-Kreis“. */
  etikett: string;
  /** Maße im Seitenkopf: Strecke, Fahrzeit, Luftlinie, Richtung. */
  masse: Mass[];
  /** Unterzeile mit Rohrklammer im Seitenkopf, gleich der des Teilen-Bilds: „Rund 26 Minuten Fahrt. Flexible Arbeitszeiten.“ */
  unterzeile: readonly string[];
  /** Abschnitte in Seitenreihenfolge; leere Abschnitte fallen weg. */
  sections: TextSection<PlaceSectionId>[];
  bandFactIds: FactId[];
  /** Vorbereitete WhatsApp-Nachricht (steht im Link, nicht auf der Seite). */
  whatsappGreeting: string;
  /** Werte, die nur zu diesem Ort gehören (Gate U1). */
  values: PlaceDataValue[];
  /** Interne Links: Nachbarorte, Stadt bzw. Stadtteile, Kreis, Gebietsseite. */
  links: PageLink[];
  /** Linktext der Route ab Ortsmitte in Google Maps (neuer Tab). */
  routeLabel: string;
  /** Datenklassen außer der Geometrie, aus denen die Seite schöpft (Gate I2), und die Titelstufe, die aus ihnen folgt. */
  datenKlassen: DatenKlasse[];
  titelStufe: TitelStufe;
}

/**
 * Unterzeile der Ortsseite in zwei Sätzen: die Fahrzeit und der Fakt flexibleHours, mit „Je nach Stelle“, solange eine
 * gezeigte Stelle ihn offen lässt (Büro, S5). Steht im Seitenkopf (Rohrklammer) und auf dem Teilen-Bild (ogPlaceText
 * bekommt sie von der Seite), damit beide dasselbe sagen.
 */
export function placeSubline(place: Pick<Place, 'commute'>, jobs: readonly Job[] = getActiveJobs()): readonly string[] {
  const arbeitszeit = giltFuerAlle('flexibleHours', jobs)
    ? FACTS.flexibleHours.long
    : `${upperFirst(JE_NACH_STELLE)} ${lowerFirst(FACTS.flexibleHours.long)}`;
  return Object.freeze([`Rund ${formatMinutes(place.commute.minutes)} Fahrt.`, arbeitszeit]);
}

/** Linktext der Route ab dem Ort zum Firmensitz (Google Maps, ohne Tracking). */
export function routeLabel(place: Pick<Place, 'name'>): string {
  return `Route ab ${place.name} in Google Maps`;
}

/**
 * Metadaten mit normalen Leerzeichen: Title und Description landen in SERP, OG und JSON-LD; die Längen-
 * grenzen zählen Zeichen, und geschützte Leerzeichen bringen dort nichts.
 */
function plainMeta(meta: PageMeta): PageMeta {
  const plain = (value: string) => value.replace(/\u00A0/g, ' ');
  return {
    title: plain(meta.title),
    description: plain(meta.description),
    h1: plain(meta.h1),
    primaryKeyword: plain(meta.primaryKeyword),
  };
}

function placeMeta(c: PlaceContext): PageMeta {
  return plainMeta(placeMetaRaw(c));
}

function placeMetaRaw(c: PlaceContext): PageMeta {
  const { place } = c;
  if (place.kind === 'stadt') {
    const st = c.stadtteile;
    const minKm = st.length > 0 ? st[0].commute.distanceKm : place.commute.distanceKm;
    const maxKm = st.length > 0 ? st[st.length - 1].commute.distanceKm : place.commute.distanceKm;
    return {
      // Nicht „SHK Jobs Wetzlar“: Das Keyword gehört der Startseite (ROADMAP §10). Fokus: Stadtteile und Firmensitz
      // (Büro und Lager laut REGION.milestone; „Werkstatt“ ist nicht belegt).
      title: `${place.name} und Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz`,
      h1: `${place.name} und seine Stadtteile: dein Weg zum Firmensitz`,
      primaryKeyword: `Arbeitsweg ${place.name} Stadtteile`,
      description: fitDescription(
        ...kandidaten(
          [
            `${place.name} und ${st.length} Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz in der ${STREET}.`,
            `${place.name} und ${st.length} Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz.`,
          ],
          c.jobs,
        ),
      ),
    };
  }
  return c.stufe === 'arbeitsweg' ? arbeitswegMeta(place, c.jobs) : shkJobsMeta(place, c.jobs);
}

/**
 * Metadaten einer Gemeinde- oder Stadtteilseite für eine Titelstufe; die Seite nimmt die Stufe aus ihren Datenklassen
 * (titelStufe in datenklassen.ts). Wetzlar selbst behält seinen Titel mit den Stadtteilen.
 */
export function ortMeta(place: Place, stufe: TitelStufe, jobs: readonly Job[] = getActiveJobs()): PageMeta {
  return plainMeta(stufe === 'arbeitsweg' ? arbeitswegMeta(place, jobs) : shkJobsMeta(place, jobs));
}

/** Titelstufe „SHK-Jobs“ erst mit Einsatzdaten des Betriebs am Ort (MENSCHEN M-023): belegt durch echte Baustellen. */
function shkJobsMeta(place: Place, jobs: readonly Job[]): PageMeta {
  const km = formatKm(place.commute.distanceKm);
  const minutes = formatMinutes(place.commute.minutes);
  const titleTail = place.kind === 'stadtteil' ? `${km} zum Firmensitz` : `${km} bis ${HQ_CITY}`;
  const where = place.kind === 'stadtteil' ? `zum Firmensitz in ${HQ_CITY}` : `bis zum Firmensitz in ${HQ_CITY}`;
  return {
    title: `SHK-Jobs ${place.name}: ${titleTail}`,
    h1: `SHK-Jobs für ${place.name}`,
    primaryKeyword: `SHK Jobs ${place.name}`,
    description: fitDescription(
      ...kandidaten(
        [`SHK-Jobs für ${place.name}: ${km} und rund ${minutes} ${where}, gemessen mit OpenStreetMap.`, `SHK-Jobs für ${place.name}: ${km} und rund ${minutes} ${where}.`],
        jobs,
      ),
    ),
  };
}

/** Title der Titelstufe „Arbeitsweg“ (Plan §B): „Arbeitsweg Aßlar – Wetzlar: Auto und Bus“. */
export function arbeitswegTitel(place: Pick<Place, 'name'>): string {
  return `Arbeitsweg ${place.name} – ${HQ_CITY}: Auto und Bus`;
}

/**
 * Metadaten der Titelstufe „Arbeitsweg“, solange keine Einsatzdaten vorliegen (M-023): Was die Seite belegt, ist der
 * Weg, nicht die Baustellen am Ort. Die Description nennt Strecke, Fahrzeit und die späteste Verbindung mit Bus und
 * Bahn, ohne Bus und Bahn nur die Auskunft, dass bis 7:30 Uhr keine ankommt.
 */
function arbeitswegMeta(place: Place, jobs: readonly Job[]): PageMeta {
  const weg = place.oepnv?.betrieb;
  const bus =
    weg?.moeglich && weg.spaeteste
      ? `mit Bus und Bahn los um ${formatUhr(weg.spaeteste.losgehen)}, an ${formatUhr(weg.spaeteste.ankunft)}`
      : weg
        ? `mit Bus und Bahn keine Ankunft bis ${formatUhr(weg.ankunftBis)}`
        : null;
  const ziel = place.kind === 'stadtteil' ? `Firmensitz in ${HQ_CITY}` : HQ_CITY;
  const kopf = `Arbeitsweg ${place.name} – ${ziel}: ${formatKm(place.commute.distanceKm)}, rund ${formatMinutes(place.commute.minutes)} mit dem Auto`;
  const zusagen = zusagenSaetze(jobs);
  const liste = [
    ...(bus ? [...zusagen.map((z) => `${kopf}, ${bus}. ${z}`), `${kopf}, ${bus}.`] : []),
    ...zusagen.map((z) => `${kopf}. ${z}`),
    `${kopf}.`,
  ];
  return {
    title: arbeitswegTitel(place),
    h1: place.kind === 'stadtteil' ? `Von ${place.name} zur Arbeit am Firmensitz` : `Von ${place.name} zur Arbeit nach ${HQ_CITY}`,
    primaryKeyword: `Arbeitsweg ${place.name} ${HQ_CITY}`,
    description: fitDescription(...(liste as [string, ...string[]])),
  };
}

function placeValues(c: PlaceContext): PlaceDataValue[] {
  const { place } = c;
  const values: PlaceDataValue[] = [
    { label: 'Strecke', value: formatKm(place.commute.distanceKm) },
    { label: 'Fahrzeit', value: formatMinutes(place.commute.minutes) },
    { label: 'Luftlinie', value: formatAirKm(place.commute.airKm) },
    { label: 'Richtung', value: c.dirFromHq },
    { label: 'PLZ', value: place.postalCode },
    { label: 'Kreis', value: c.kreis.name },
  ];
  c.neighbors.forEach((neighbor, i) =>
    values.push({ label: `Nachbar ${i + 1}`, value: neighbor.place.name }, { label: `Abstand ${i + 1}`, value: formatAirKm(neighbor.airKm) }),
  );
  if (place.seat) values.push({ label: 'Messpunkt', value: place.seat });
  return values;
}

export interface PlaceTextOptions {
  /** Stellen, die die Seite zeigt (live zum Renderzeitpunkt); Standard: alle veröffentlichten. */
  jobs?: readonly Job[];
  /** Stichtag (Renderzeitpunkt) für das Ende der Fahrplandaten (Kreis-Hubs); Standard: jetzt. */
  now?: Date;
}

/** Alle Texte einer Ortsseite. */
export function getPlacePageText(place: Place, options: PlaceTextOptions = {}): PlacePageText {
  const c = placeContext(place, options.jobs ?? getActiveJobs());
  const name = place.name;
  const meta = placeMeta(c);
  const sections: TextSection<PlaceSectionId>[] = [
    { id: 'lead', heading: meta.h1, blocks: leadBlocks(c) },
    { id: 'arbeitsweg', heading: `Dein Weg aus ${name}`, blocks: arbeitswegBlocks(c) },
    { id: 'oepnv', heading: `Mit Bus und Bahn aus ${name}`, blocks: place.oepnv ? oepnvBlocks(c, place.oepnv) : [] },
    { id: 'schule', heading: `Zur Berufsschule aus ${name}`, blocks: place.oepnv ? schuleBlocks(c, place.oepnv) : [] },
    { id: 'stellen', heading: 'Offene Stellen', blocks: stellenBlocks(c.jobs, { vehicle: false }) },
    { id: 'nachbarn', heading: `Orte rund um ${name}`, blocks: nachbarnBlocks(c) },
    { id: 'stadtteile', heading: `Die Stadtteile von ${name}`, blocks: place.kind === 'stadt' ? stadtteileBlocks(c) : [] },
    { id: 'kreis', heading: place.kind === 'stadtteil' ? `${name} in ${HQ_CITY}` : `${name} ${c.kreis.dative}`, blocks: kreisBlocks(c) },
    { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(c.kreis, c.jobs) },
    { id: 'kontakt', heading: 'Direkt fragen', blocks: kontaktBlocks(place) },
  ];
  // Jeder Ort, den der Text nennt, ist verlinkt: Nachbarn, Orte derselben Richtung, im kleinen Kreis der andere Ort.
  // Die Stadtseite nennt ihre Stadtteile im eigenen Abschnitt; dort stehen sie einmal, nicht noch als Nachbarn.
  const stadtteilIds = new Set(place.kind === 'stadt' ? c.stadtteile.map((s) => s.id) : []);
  const link = (p: Place, gruppe: LinkGruppe): PageLink => ({ href: placePath(p), label: p.name, gruppe });
  const links: PageLink[] = [
    ...c.neighbors.filter((n) => !stadtteilIds.has(n.place.id)).map((n) => link(n.place, 'nachbar')),
    ...sectorSentence(c).named.filter((p) => !stadtteilIds.has(p.id)).map((p) => link(p, 'richtung')),
    ...(c.kreis.hasHub ? [] : c.kreisStats.places.filter((p) => p.id !== place.id).map((p) => link(p, 'kreisort'))),
    ...c.stadtteile.filter((s) => stadtteilIds.has(s.id)).map((s) => link(s, 'stadtteil')),
    ...(place.parentId ? [parentLink(place.parentId)].filter((l): l is PageLink => l !== null) : []),
    { href: kreisPath(c.kreis), label: c.kreis.shortName, gruppe: 'kreis' },
    { href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL, gruppe: 'gebiet' },
  ];
  return {
    placeId: place.id,
    path: placePath(place),
    meta,
    etikett:
      place.kind === 'stadtteil'
        ? `${place.postalCode} ${HQ_CITY}-${name} · Stadtteil`
        : `${place.postalCode} ${name} · ${c.kreis.shortName}`,
    masse: [
      { wert: formatKm(place.commute.distanceKm), name: 'Strecke' },
      { wert: formatMin(place.commute.minutes), name: 'Fahrzeit' },
      { wert: formatAirKm(place.commute.airKm), name: 'Luftlinie' },
      { wert: c.dirFromHq, name: 'Richtung ab Firmensitz' },
    ],
    unterzeile: placeSubline(place, c.jobs),
    sections: sections.filter((section) => section.blocks.length > 0),
    bandFactIds: bandFactIds(c.kreis, c.jobs),
    whatsappGreeting: whatsappGreeting(place),
    values: placeValues(c),
    links: links.filter((link, i) => links.findIndex((other) => other.href === link.href) === i),
    routeLabel: routeLabel(place),
    datenKlassen: c.klassen,
    titelStufe: c.stufe,
  };
}

/** Linktext zur Gebietsseite. */
export const EINSATZGEBIET_LINK_LABEL = 'Alle Orte im Einsatzgebiet';

function parentLink(parentId: string): PageLink | null {
  const parent = getPlaceById(parentId);
  return parent?.status === 'published' ? { href: placePath(parent), label: parent.name, gruppe: 'eltern' } : null;
}

// ─── Kreis-Hub ──────────────────────────────────────────────────────────────

export type KreisSectionId = 'lead' | 'zahlen' | 'oepnv' | 'orte' | 'stellen' | 'band' | 'kontakt';

/** Eine Zeile der Ortstabelle eines Kreises (Kreis-Hub) bzw. des Ortsverzeichnisses (Gebietsseite). */
export interface PlaceRow {
  placeId: string;
  name: string;
  href: string;
  postalCode: string;
  /** '27 km' */
  km: string;
  /** '26 min' */
  min: string;
  distanceKm: number;
  minutes: number;
}

export interface KreisPageText {
  kreisId: string;
  path: string;
  meta: PageMeta;
  /** Etikett über der h1: „26 Orte · 2 bis 35 km“. */
  etikett: string;
  /** Maße im Seitenkopf: nächster und weitester Ort, mittlere Fahrzeit, Zahl der Orte. */
  masse: Mass[];
  /** Zweitweg im Kopf: zur Ortstabelle. */
  zweitweg: PageLink;
  sections: TextSection<KreisSectionId>[];
  /** Orte des Kreises nach Strecke (Tabelle, Plan, Entfernungsleiste). */
  rows: PlaceRow[];
  bandFactIds: FactId[];
  /** Vorbereitete WhatsApp-Nachricht (steht im Link, nicht auf der Seite). */
  whatsappGreeting: string;
  /** Alle Orte des Kreises und die Gebietsseite. */
  links: PageLink[];
}

/** Anker der Ortstabelle auf Kreis-Hub und Gebietsseite. */
export const ORTE_ANKER = 'orte';

export function placeRow(place: Place): PlaceRow {
  return {
    placeId: place.id,
    name: place.name,
    href: placePath(place),
    postalCode: place.postalCode,
    km: formatKm(place.commute.distanceKm),
    min: formatMin(place.commute.minutes),
    distanceKm: place.commute.distanceKm,
    minutes: place.commute.minutes,
  };
}

/** WhatsApp-Nachricht eines Kreis-Hubs: „… ich komme aus dem Lahn-Dill-Kreis und …“. */
export function kreisWhatsappGreeting(kreis: Pick<Kreis, 'dative'>): string {
  return `${GREETING_START}ich komme aus ${kreis.dative.replace(/^im /, 'dem ')} ${GREETING_END}`;
}

/** Kontakt der Kreis-Hubs: wie auf den Ortsseiten, ohne Ortsnamen in der Nachricht. */
const KREIS_KONTAKT_TEXT = `Lieber erst fragen? Schreib ${CONTACT_NAME} per WhatsApp oder ruf an.`;

/** Streckenstufe als Text: „bis 15 km“, „16 bis 25 km“, „26 bis 35 km“ (Straße, siehe roadBandKm). */
export function roadBandLabel(bandKm: number): string {
  const floor = roadBandFloorKm(bandKm);
  return floor === 0 ? `bis ${formatKm(bandKm)}` : `${floor} bis ${formatKm(bandKm)}`;
}

/**
 * Orte je Streckenstufe, ausdrücklich als Strecke (Straße) und ohne „Ring“: „Bis 15 km Strecke: 18 Orte, 16 bis 25 km:
 * 14, 26 bis 35 km: 23.“ Die Stufen sind getrennte Bänder, keine laufenden Summen; leere Stufen fallen weg.
 */
function roadBandSentence(places: readonly Place[]): string {
  const counts = roadBandCounts(places);
  const filled = RING_RADII_KM.filter((radius) => counts[radius] > 0);
  if (filled.length === 1) {
    const label = roadBandLabel(filled[0]);
    return places.length === 1
      ? `Der Ort liegt ${label} Strecke vom Firmensitz entfernt.`
      : `Alle ${places.length} Orte liegen ${label} Strecke vom Firmensitz entfernt.`;
  }
  const parts = filled.map((radius, i) =>
    i === 0
      ? `${upperFirst(roadBandLabel(radius))} Strecke: ${counts[radius]} ${numerus(counts[radius], 'Ort', 'Orte')}`
      : `${roadBandLabel(radius)}: ${counts[radius]}`,
  );
  return `${parts.join(', ')}.`;
}

/**
 * Was die Ringe des Plans zeigen (Gebietsseite): Luftlinie, der weiteste Ort in Luftlinie und, wenn der äußere Ring
 * leer bleibt, warum: Eine eigene Seite bekommt jeder Ort bis 35 km Straße, und die Straße ist länger als die
 * Luftlinie. Das beschreibt die Auswahl dieser Seiten, keine Grenze des Betriebs (fakten-abgleich B33).
 */
function airRingSentence(places: readonly Place[]): string {
  const farthest = [...places].sort((a, b) => b.commute.airKm - a.commute.airKm || a.name.localeCompare(b.name, 'de'))[0];
  const air = farthest.commute.airKm;
  const ring = RING_RADII_KM.find((radius) => air <= radius) ?? MAX_ROAD_KM;
  const first = `Die drei Ringe im Plan messen die Luftlinie um den Firmensitz; am weitesten liegt ${farthest.name} mit ${formatAirKm(air)}.`;
  return ring < MAX_ROAD_KM
    ? `${first} Außerhalb des Rings bei ${formatKm(ring)} liegt kein Ort: Eine eigene Seite bekommt jeder Ort bis ${formatKm(MAX_ROAD_KM)} Straße, und die Straße ist länger als die Luftlinie.`
    : first;
}

/** Spanne der Luftlinie einer Gruppe: „In Luftlinie, wie im Plan, sind es 20,1 bis 23,4 km.“ */
function airSpanSentence(places: readonly Place[]): string {
  const airs = places.map((place) => place.commute.airKm);
  const min = Math.min(...airs);
  const max = Math.max(...airs);
  return min === max
    ? `In Luftlinie, wie im Plan, sind es ${formatAirKm(min)}.`
    : `In Luftlinie, wie im Plan, sind es ${formatAirKm(min).replace(`${NBSP}km`, '')} bis ${formatAirKm(max)}.`;
}

const placeListItem = (place: Place) =>
  labeled(place.name, `${formatKm(place.commute.distanceKm)}, ${formatMinutes(place.commute.minutes)}`);

/** Tür zu Tür der spätesten Verbindung zum Firmensitz bzw. zur Schule; null ohne Verbindung bis zur Frist. */
const reisezeit = (place: Place, ziel: 'betrieb' | 'schule'): number | null =>
  place.oepnv?.[ziel].moeglich && place.oepnv[ziel].spaeteste ? place.oepnv[ziel].spaeteste.reisezeitMin : null;

/**
 * Bus und Bahn im Kreis (Kreis-Hub, Datenklassen oepnv und berufsschule): aus wie vielen Orten eine Verbindung bis
 * 7:30 Uhr ankommt, aus welchen nicht, der kürzeste und der längste Weg Tür zu Tür und dasselbe zur Berufsschule.
 */
function kreisOepnvBlocks(kreis: Kreis, places: readonly Place[]): TextBlock[] {
  const mitDaten = places.filter((place) => place.oepnv);
  if (mitDaten.length === 0) return [];
  const anteil = (zahl: number) =>
    zahl === mitDaten.length ? `Aus allen ${zahl} Orten ${kreis.genitive}` : `Aus ${zahl} der ${mitDaten.length} Orte ${kreis.genitive}`;
  const names = (list: readonly Place[]) => joinList(list.map((p) => p.name));
  const blocks: TextBlock[] = [];

  const betrieb = mitDaten.filter((place) => reisezeit(place, 'betrieb') !== null);
  const ohne = mitDaten.filter((place) => reisezeit(place, 'betrieb') === null);
  blocks.push(
    ausDaten(
      'oepnv',
      `${anteil(betrieb.length)} kommst du an einem Werktag mit Bus und Bahn bis ${formatUhr(ANKUNFT_BETRIEB)} zum Firmensitz${ohne.length > 0 ? `, nicht aus ${names(ohne)}` : ''}.`,
    ),
  );
  if (betrieb.length > 1) {
    const zeiten = betrieb.map((place) => reisezeit(place, 'betrieb')!);
    const min = Math.min(...zeiten);
    const max = Math.max(...zeiten);
    const mit = (wert: number) => betrieb.filter((place) => reisezeit(place, 'betrieb') === wert).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    blocks.push(
      ausDaten(
        'oepnv',
        `Am kürzesten ist der Weg Tür zu Tür aus ${names(mit(min))} mit ${formatMinutes(min)}, am längsten aus ${names(mit(max))} mit ${formatMinutes(max)}.`,
      ),
    );
  }
  const schule = mitDaten.filter((place) => reisezeit(place, 'schule') !== null);
  if (schule.length > 0) {
    const zeiten = schule.map((place) => reisezeit(place, 'schule')!);
    const min = Math.min(...zeiten);
    const schnell = schule.filter((place) => reisezeit(place, 'schule') === min).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    blocks.push(
      ausDaten(
        'berufsschule',
        `${anteil(schule.length)} erreichst du die ${SCHULE.name} bis ${formatUhr(ANKUNFT_SCHULE)}, am schnellsten aus ${names(schnell)} mit ${formatMinutes(min)} Tür zu Tür.`,
      ),
    );
  }
  return blocks;
}

export function getKreisPageText(kreis: Kreis, options: PlaceTextOptions = {}): KreisPageText {
  const places = getKreisPlaces(kreis.id);
  const stats = groupStats(places);
  const nearest = stats.nearest[0];
  const farthest = stats.farthest[stats.farthest.length - 1];
  const jobs = options.jobs ?? getActiveJobs();
  const names = (list: readonly Place[]) => joinList(list.map((p) => p.name));

  const blocks: TextBlock[] = [
    ort(
      `${places.length} Orte ${kreis.dative} liegen höchstens ${formatKm(MAX_ROAD_KM)} Straße vom Firmensitz in ${HQ_CITY} entfernt. Am nächsten ${numerus(stats.nearest.length, 'ist', 'sind')} ${names(stats.nearest)} mit ${formatKm(nearest.commute.distanceKm)}, am weitesten ${names(stats.farthest)} mit ${formatKm(farthest.commute.distanceKm)}.`,
    ),
  ];
  if (kreis.id === headquartersKreisId()) {
    blocks.push(ort(`Der Firmensitz in der ${STREET} liegt selbst ${kreis.dative}.`));
  }
  const median = formatMinutes(stats.medianMinutes);
  return {
    kreisId: kreis.id,
    path: kreisPath(kreis),
    etikett: `${places.length}${NBSP}Orte · ${nearest.commute.distanceKm} bis ${formatKm(farthest.commute.distanceKm)}`,
    masse: [
      { wert: formatKm(nearest.commute.distanceKm), name: `Nächster Ort: ${nearest.name}` },
      { wert: formatKm(farthest.commute.distanceKm), name: `Weitester Ort: ${farthest.name}` },
      { wert: formatMin(stats.medianMinutes), name: 'Mittlere Fahrzeit' },
      { wert: formatKm(stats.medianKm), name: 'Mittlere Strecke' },
    ],
    zweitweg: { href: `#${ORTE_ANKER}`, label: `Alle ${places.length}${NBSP}Orte ansehen` },
    rows: places.map(placeRow),
    whatsappGreeting: kreisWhatsappGreeting(kreis),
    meta: plainMeta({
      title: `SHK-Jobs ${kreis.shortName}: ${places.length} Orte bis ${formatKm(MAX_ROAD_KM)}`,
      h1: `SHK-Jobs ${kreis.dative}`,
      primaryKeyword: `SHK Jobs ${kreis.shortName}`,
      description: fitDescription(
        ...kandidaten(
          [
            `SHK-Jobs ${kreis.dative}: ${places.length} Orte, ${nearest.commute.distanceKm} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz in ${HQ_CITY}.`,
            `SHK-Jobs ${kreis.dative}: ${places.length} Orte, ${nearest.commute.distanceKm} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz.`,
            `SHK-Jobs ${kreis.dative}: ${places.length} Orte mit ${formatKm(nearest.commute.distanceKm)} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz in ${HQ_CITY}.`,
          ],
          jobs,
        ),
      ),
    }),
    sections: ([
      { id: 'lead', heading: `SHK-Jobs ${kreis.dative}`, blocks },
      {
        id: 'zahlen',
        heading: 'Wege in Zahlen',
        blocks: [
          ort(
            `Die mittlere Fahrzeit (Median) liegt bei ${median}, die mittlere Strecke bei ${formatKm(stats.medianKm)}. Am schnellsten ${numerus(stats.fastest.length, 'ist', 'sind')} ${names(stats.fastest)} mit ${formatMinutes(stats.fastest[0].commute.minutes)}.`,
          ),
          ort(roadBandSentence(places)),
          ort(airSpanSentence(places)),
          gemeinsam(MEASUREMENT_NOTE),
        ],
      },
      // Nach dem Ende der Fahrplandaten (FAHRPLAN_STAND.gueltigBis) entfällt der Abschnitt samt Quellenzeile: Der Hub
      // bleibt indexiert und soll keinen abgelaufenen Fahrplan zeigen (Prüfung E-029)
      { id: 'oepnv', heading: 'Mit Bus und Bahn', blocks: fahrplanAktuell(options.now) ? kreisOepnvBlocks(kreis, places) : [] },
      {
        id: 'orte',
        heading: `Alle Orte ${kreis.dative}`,
        blocks: [ort(`Nach Strecke: ${joinList(places.map(placeListItem))}.`)],
      },
      { id: 'stellen', heading: 'Offene Stellen', blocks: stellenBlocks(jobs) },
      { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(kreis, jobs) },
      { id: 'kontakt', heading: 'Direkt fragen', blocks: [gemeinsam(KREIS_KONTAKT_TEXT)] },
    ] satisfies TextSection<KreisSectionId>[]).filter((section) => section.blocks.length > 0),
    bandFactIds: bandFactIds(kreis, jobs),
    links: [
      ...places.map((place) => ({ href: placePath(place), label: place.name })),
      { href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL },
    ],
  };
}

/** Abschnitt für einen Kreis ohne eigenen Hub (< 3 Orte) auf der Gebietsseite. */
export function kreisSectionText(kreis: Kreis): TextSection<string> {
  const places = getKreisPlaces(kreis.id);
  return {
    id: kreis.slug,
    heading: kreis.shortName,
    blocks: [
      ort(
        `${upperFirst(kreis.dative)} ${numerus(places.length, 'liegt', 'liegen')} ${places.length} ${numerus(places.length, 'Ort', 'Orte')} im Einsatzgebiet: ${joinList(places.map(placeListItem))}.`,
      ),
    ],
  };
}

// ─── Gebietsseite /einsatzgebiet ────────────────────────────────────────────

/**
 * Kreise ohne eigene Seite (weniger als KREIS_HUB_MIN_PLACES Orte): „Nur zwei Orte im Gebiet, deshalb ohne eigene
 * Kreisseite: Landkreis Marburg-Biedenkopf und Hochtaunuskreis.“ Bei verschiedenen Zahlen steht sie je Kreis dabei.
 */
function smallKreiseSentence(small: readonly Kreis[]): string {
  const counts = new Set(small.map((kreis) => kreis.placeCount));
  if (counts.size === 1) {
    const [n] = counts;
    const zahl = n === 1 ? 'ein Ort' : `${ZAHLWORT[n] ?? n} Orte`;
    return `${small.length > 1 ? 'Je nur' : 'Nur'} ${zahl} im Gebiet, deshalb ohne eigene Kreisseite: ${joinList(small.map((k) => k.name))}.`;
  }
  return `Weniger als ${ZAHLWORT[KREIS_HUB_MIN_PLACES]} Orte im Gebiet, deshalb ohne eigene Kreisseite: ${joinList(
    small.map((k) => `${k.name} (${k.placeCount} ${numerus(k.placeCount, 'Ort', 'Orte')})`),
  )}.`;
}

export type EinsatzgebietSectionId = 'lead' | 'ringe' | 'kreise' | 'band';

export interface EinsatzgebietPageText {
  path: string;
  meta: PageMeta;
  /** Etikett über der h1: „54 Orte · 6 Kreise“. */
  etikett: string;
  /** Maße im Seitenkopf: Radius, nächster und weitester Ort, mittlere Fahrzeit. */
  masse: Mass[];
  /** Alle Orte nach Strecke (Verzeichnis, Plan). */
  rows: PlaceRow[];
  /** Zweitweg im Kopf: zum Verzeichnis aller Orte. */
  zweitweg: PageLink;
  sections: TextSection<EinsatzgebietSectionId>[];
  /** Kreise ohne Hub als eigene Abschnitte (Anker = Kreis-Slug). */
  kleineKreise: TextSection<string>[];
  /** Kreis-Hubs und alle Ortsseiten. */
  links: PageLink[];
}

export function getEinsatzgebietPageText(options: PlaceTextOptions = {}): EinsatzgebietPageText {
  const places = getPublishedPlaces();
  const kreise = getKreise();
  const hubs = getHubKreise();
  const stats = groupStats(places);
  const jobs = options.jobs ?? getActiveJobs();
  const kreisItem = (kreis: Kreis) => `${kreis.name} (${kreis.placeCount} ${numerus(kreis.placeCount, 'Ort', 'Orte')})`;

  return {
    path: EINSATZGEBIET_PATH,
    etikett: `${places.length}${NBSP}Orte · ${kreise.length}${NBSP}Kreise`,
    masse: [
      { wert: formatKm(stats.nearest[0].commute.distanceKm), name: `Nächster Ort: ${stats.nearest[0].name}` },
      { wert: formatKm(stats.farthest[0].commute.distanceKm), name: `Weitester Ort: ${stats.farthest[stats.farthest.length - 1].name}` },
      { wert: formatMin(stats.medianMinutes), name: 'Mittlere Fahrzeit' },
      { wert: formatKm(stats.medianKm), name: 'Mittlere Strecke' },
    ],
    rows: places.map(placeRow),
    zweitweg: { href: `#${ORTE_ANKER}`, label: `Alle ${places.length}${NBSP}Orte ansehen` },
    meta: plainMeta({
      title: `Einsatzgebiet ${formatKm(MAX_ROAD_KM)} um ${HQ_CITY}: alle ${places.length} Orte`,
      h1: `Unser Einsatzgebiet: ${places.length} Orte bis ${formatKm(MAX_ROAD_KM)} um ${HQ_CITY}`,
      primaryKeyword: `Einsatzgebiet SHK ${HQ_CITY}`,
      description: fitDescription(
        ...kandidaten(
          [
            `${places.length} Orte in ${kreise.length} Kreisen, jeder mit gemessener Strecke und Fahrzeit zum Firmensitz in ${HQ_CITY}.`,
            `${places.length} Orte in ${kreise.length} Kreisen mit gemessener Fahrzeit zum Firmensitz in ${HQ_CITY}.`,
          ],
          jobs,
        ),
      ),
    }),
    sections: [
      {
        id: 'lead',
        heading: `Unser Einsatzgebiet`,
        blocks: [
          gemeinsam(FACTS.radius35.long, ['radius35']),
          ort(
            `Dazu gehören ${places.length} Orte in ${kreise.length} Kreisen. Jeder hat eine eigene Seite mit gemessener Strecke, Fahrzeit und den Nachbarorten: von ${joinList(stats.nearest.map((p) => p.name))} mit ${formatKm(stats.nearest[0].commute.distanceKm)} bis ${joinList(stats.farthest.map((p) => p.name))} mit ${formatKm(stats.farthest[0].commute.distanceKm)}.`,
          ),
        ],
      },
      {
        id: 'ringe',
        heading: 'Drei Ringe um den Firmensitz',
        blocks: [
          ort(airRingSentence(places)),
          ort(roadBandSentence(places)),
          ort(`Die mittlere Fahrzeit aller Orte (Median) liegt bei ${formatMinutes(stats.medianMinutes)}.`),
          gemeinsam(MEASUREMENT_NOTE),
        ],
      },
      {
        id: 'kreise',
        heading: 'Die Kreise',
        blocks: [
          // DIN 5008: kein Satzanfang mit Ziffer, kleine Zahlen ausgeschrieben
          ort(`${upperFirst(ZAHLWORT[hubs.length] ?? String(hubs.length))} Kreise haben eine eigene Seite: ${joinList(hubs.map(kreisItem))}.`),
          ...(kreise.length > hubs.length ? [ort(smallKreiseSentence(kreise.filter((k) => !k.hasHub)))] : []),
        ],
      },
      { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks({ factIds: [] }, jobs) },
    ],
    kleineKreise: kreise.filter((kreis) => !kreis.hasHub).map(kreisSectionText),
    links: [
      ...hubs.map((kreis) => ({ href: kreisPath(kreis), label: kreis.shortName })),
      ...places.map((place) => ({ href: placePath(place), label: place.name })),
    ],
  };
}

/** Ganzer Fließtext einer Seite (Blöcke in Reihenfolge), für Gate und Vorschauen. */
export function sectionText(sections: readonly TextSection[], kind?: BlockKind): string {
  return sections
    .flatMap((section) => section.blocks)
    .filter((block) => !kind || block.kind === kind)
    .map((block) => block.text)
    .join(' ');
}
