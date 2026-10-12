/**
 * Alle Texte der lokalen Seiten: Ortsseiten, Kreis-Hubs und die Gebietsseite /einsatzgebiet. Reines Modul ohne
 * JSX, geprüft in lib/places/__tests__/text.test.ts und vom Einzigartigkeits-Gate (gate.test.ts).
 *
 * Regeln:
 * - Nur Ortsdaten (Messung), Werte aus derive.ts, Fakten aus lib/content/facts.ts (per ID) und Gehälter aus
 *   der Stellen-Registry. Keine Einwohnerzahlen, keine Sehenswürdigkeiten, keine Straßen außer in den
 *   freigegebenen Kurzbeschreibungen.
 * - Satzbau folgt echten Datenlagen (Entfernungsband, Streckenstufe, Richtung, Art des Orts, Kreis, Messpunkt, Rang im
 *   Kreis, Median, Nachbarorte, Startseitenkarte), nie einer Zufallsauswahl von Synonymen.
 * - `ort`-Blöcke sagen etwas, das nur für diesen Ort gilt; `gemeinsam`-Blöcke stehen auf jeder Ortsseite (Stellen,
 *   Fakten-Band, Messhinweis, Kontakt), Messhinweis und Kontakt mit dem Ortsnamen. Gemeinsamer Text bleibt kurz: Das
 *   gebaute HTML prüft scripts/qa/check-local-similarity.mjs (Jaccard ≤ 0,45 je Paar), und dort zählen auch
 *   Stellenkarten, Faktenband und Kontaktblock mit.
 * - Keine Arbeitszeit-Uhrzeiten: Es gilt nur der Fakt flexibleHours (fakten-abgleich B28).
 * - „Ring“ heißen nur die Kreise der Pläne, und die zeigen die Luftlinie. Stufen der Straßenstrecke heißen
 *   „bis 15 km Strecke“, „16 bis 25 km“, „26 bis 35 km“ (roadBandLabel); so widerspricht kein Satz der Zeichnung.
 */
import { FACTS, type FactId } from '@/lib/content/facts';
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
import { MEASUREMENT } from './measurement';
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

export interface TextBlock {
  /** `ort`: gilt nur für diese Seite · `gemeinsam`: steht auf allen Seiten der Art gleich. */
  kind: BlockKind;
  text: string;
  /** Fakten, deren Wortlaut der Block trägt. */
  factIds?: readonly FactId[];
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

/** Fakten im Band einer Ortsseite oder eines Kreis-Hubs. */
export function bandFactIds(kreis: Pick<Kreis, 'factIds'>): FactId[] {
  const last = BAND_FACT_IDS[BAND_FACT_IDS.length - 1];
  const kreisFacts = kreis.factIds.filter((id) => !BAND_FACT_IDS.includes(id));
  return [...BAND_FACT_IDS.slice(0, -1), ...kreisFacts, last];
}

/** Band (Etikettkasten): je Fakt die Kurzform; den ganzen Satz liefert FACTS[id].long über `factIds`. */
function bandBlocks(kreis: Pick<Kreis, 'factIds'>): TextBlock[] {
  return bandFactIds(kreis).map((id) => gemeinsam(FACTS[id].short, [id]));
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

export type PlaceSectionId = 'lead' | 'arbeitsweg' | 'stellen' | 'nachbarn' | 'stadtteile' | 'kreis' | 'band' | 'kontakt';

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
}

/**
 * Unterzeile der Ortsseite in zwei Sätzen: die Fahrzeit und der Fakt flexibleHours. Steht im Seitenkopf (Rohrklammer)
 * und auf dem Teilen-Bild (ogPlaceText), damit beide dasselbe sagen.
 */
export function placeSubline(place: Pick<Place, 'commute'>): readonly string[] {
  return Object.freeze([`Rund ${formatMinutes(place.commute.minutes)} Fahrt.`, FACTS.flexibleHours.long]);
}

/** Linktext der Route ab dem Ort zum Firmensitz (Google Maps, ohne Tracking). */
export function routeLabel(place: Pick<Place, 'name'>): string {
  return `Route ab ${place.name} in Google Maps`;
}

/** Gehaltsspanne der Fachkräfte-Stellen (ohne Ausbildung) für Meta-Texte: „3.600–5.600 €“. */
function skilledSalarySpan(jobs: readonly Job[]): string | null {
  const salaries = jobs.filter((job) => job.employment.kind !== 'ausbildung' && job.salary?.unit === 'MONTH').map((job) => job.salary!);
  if (salaries.length === 0) return null;
  const min = Math.min(...salaries.map((s) => s.min));
  const max = Math.max(...salaries.map((s) => s.max));
  return `${formatNumber(min)}–${formatNumber(max)}${NBSP}€`;
}

const PERKS = `${lowerFirst(FACTS.flexibleHours.short)}, ${FACTS.vacation30.short}`;

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
  const km = formatKm(place.commute.distanceKm);
  const minutes = formatMinutes(place.commute.minutes);
  const salary = skilledSalarySpan(c.jobs);
  const salaryPart = salary ? `Gehalt ${salary} im Monat, ` : '';

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
        `${place.name} und ${st.length} Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz in der ${STREET}. ${upperFirst(salaryPart)}${PERKS}.`,
        `${place.name} und ${st.length} Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz. ${upperFirst(salaryPart)}${PERKS}.`,
        `${place.name} und ${st.length} Stadtteile: ${minKm} bis ${formatKm(maxKm)} zum Firmensitz in der ${STREET}. ${upperFirst(PERKS)}.`,
      ),
    };
  }
  const titleTail = place.kind === 'stadtteil' ? `${km} zum Firmensitz` : `${km} bis ${HQ_CITY}`;
  const where = place.kind === 'stadtteil' ? `zum Firmensitz in ${HQ_CITY}` : `bis zum Firmensitz in ${HQ_CITY}`;
  return {
    title: `SHK-Jobs ${place.name}: ${titleTail}`,
    h1: `SHK-Jobs für ${place.name}`,
    primaryKeyword: `SHK Jobs ${place.name}`,
    description: fitDescription(
      `SHK-Jobs für ${place.name}: ${km} und rund ${minutes} ${where}, gemessen mit OpenStreetMap. ${upperFirst(salaryPart)}${PERKS}.`,
      `SHK-Jobs für ${place.name}: ${km} und rund ${minutes} ${where}. ${upperFirst(salaryPart)}${PERKS}.`,
      `SHK-Jobs für ${place.name}: ${km} und rund ${minutes} ${where}. ${upperFirst(PERKS)}.`,
    ),
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
}

/** Alle Texte einer Ortsseite. */
export function getPlacePageText(place: Place, options: PlaceTextOptions = {}): PlacePageText {
  const c = placeContext(place, options.jobs ?? getActiveJobs());
  const name = place.name;
  const meta = placeMeta(c);
  const sections: TextSection<PlaceSectionId>[] = [
    { id: 'lead', heading: meta.h1, blocks: leadBlocks(c) },
    { id: 'arbeitsweg', heading: `Dein Weg aus ${name}`, blocks: arbeitswegBlocks(c) },
    { id: 'stellen', heading: 'Offene Stellen', blocks: stellenBlocks(c.jobs, { vehicle: false }) },
    { id: 'nachbarn', heading: `Orte rund um ${name}`, blocks: nachbarnBlocks(c) },
    { id: 'stadtteile', heading: `Die Stadtteile von ${name}`, blocks: place.kind === 'stadt' ? stadtteileBlocks(c) : [] },
    { id: 'kreis', heading: place.kind === 'stadtteil' ? `${name} in ${HQ_CITY}` : `${name} ${c.kreis.dative}`, blocks: kreisBlocks(c) },
    { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(c.kreis) },
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
    unterzeile: placeSubline(place),
    sections: sections.filter((section) => section.blocks.length > 0),
    bandFactIds: bandFactIds(c.kreis),
    whatsappGreeting: whatsappGreeting(place),
    values: placeValues(c),
    links: links.filter((link, i) => links.findIndex((other) => other.href === link.href) === i),
    routeLabel: routeLabel(place),
  };
}

/** Linktext zur Gebietsseite. */
export const EINSATZGEBIET_LINK_LABEL = 'Alle Orte im Einsatzgebiet';

function parentLink(parentId: string): PageLink | null {
  const parent = getPlaceById(parentId);
  return parent?.status === 'published' ? { href: placePath(parent), label: parent.name, gruppe: 'eltern' } : null;
}

// ─── Kreis-Hub ──────────────────────────────────────────────────────────────

export type KreisSectionId = 'lead' | 'zahlen' | 'orte' | 'stellen' | 'band' | 'kontakt';

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

export function getKreisPageText(kreis: Kreis, options: PlaceTextOptions = {}): KreisPageText {
  const places = getKreisPlaces(kreis.id);
  const stats = groupStats(places);
  const nearest = stats.nearest[0];
  const farthest = stats.farthest[stats.farthest.length - 1];
  const jobs = options.jobs ?? getActiveJobs();
  const salary = skilledSalarySpan(jobs);
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
        `SHK-Jobs ${kreis.dative}: ${places.length} Orte, ${nearest.commute.distanceKm} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz in ${HQ_CITY}. ${salary ? `Gehalt ${salary} im Monat, ` : ''}${PERKS}.`,
        `SHK-Jobs ${kreis.dative}: ${places.length} Orte, ${nearest.commute.distanceKm} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz. ${salary ? `Gehalt ${salary} im Monat, ` : ''}${PERKS}.`,
        `SHK-Jobs ${kreis.dative}: ${places.length} Orte mit ${formatKm(nearest.commute.distanceKm)} bis ${formatKm(farthest.commute.distanceKm)} zum Firmensitz in ${HQ_CITY}. ${upperFirst(PERKS)}.`,
      ),
    }),
    sections: [
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
      {
        id: 'orte',
        heading: `Alle Orte ${kreis.dative}`,
        blocks: [ort(`Nach Strecke: ${joinList(places.map(placeListItem))}.`)],
      },
      { id: 'stellen', heading: 'Offene Stellen', blocks: stellenBlocks(jobs) },
      { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(kreis) },
      { id: 'kontakt', heading: 'Direkt fragen', blocks: [gemeinsam(KREIS_KONTAKT_TEXT)] },
    ],
    bandFactIds: bandFactIds(kreis),
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
  const salary = skilledSalarySpan(jobs);
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
        `${places.length} Orte in ${kreise.length} Kreisen, jeder mit gemessener Strecke und Fahrzeit zum Firmensitz in ${HQ_CITY}. ${salary ? `Gehalt ${salary} im Monat, ` : ''}${PERKS}.`,
        `${places.length} Orte in ${kreise.length} Kreisen mit gemessener Fahrzeit zum Firmensitz in ${HQ_CITY}. ${salary ? `Gehalt ${salary} im Monat, ` : ''}${PERKS}.`,
        `${places.length} Orte in ${kreise.length} Kreisen, jeder mit gemessener Strecke und Fahrzeit zum Firmensitz in ${HQ_CITY}. ${upperFirst(PERKS)}.`,
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
      { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks({ factIds: [] }) },
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
