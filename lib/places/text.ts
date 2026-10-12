/**
 * Alle Texte der lokalen Seiten: Ortsseiten, Kreis-Hubs und die Gebietsseite /einsatzgebiet. Reines Modul ohne
 * JSX, geprüft in lib/places/__tests__/text.test.ts und vom Einzigartigkeits-Gate (gate.test.ts).
 *
 * Regeln:
 * - Nur Ortsdaten (Messung), Werte aus derive.ts, Fakten aus lib/content/facts.ts (per ID) und Gehälter aus
 *   der Stellen-Registry. Keine Einwohnerzahlen, keine Sehenswürdigkeiten, keine Straßen außer in den
 *   freigegebenen Kurzbeschreibungen.
 * - Satzbau folgt echten Datenlagen (Entfernungsband, Ring, Richtung, Art des Orts, Kreis, Messpunkt, Rang im
 *   Kreis, Median, Nachbarorte, Startseitenkarte), nie einer Zufallsauswahl von Synonymen.
 * - `ort`-Blöcke sagen etwas, das nur für diesen Ort gilt; `gemeinsam`-Blöcke stehen auf jeder Ortsseite gleich
 *   (Stellen, Fakten-Band, Messhinweis, Kontakt).
 * - Keine Arbeitszeit-Uhrzeiten: Es gilt nur der Fakt flexibleHours (fakten-abgleich B28).
 */
import { FACTS, type FactId } from '@/lib/content/facts';
import { formatNumber, formatSalaryAmount, formatSalaryRange } from '@/lib/jobs/format';
import { getActiveJobs, type Job } from '@/lib/jobs/registry';
import { fitDescription } from '@/lib/seo/descriptions';
import { SITE_CONFIG } from '@/lib/seo/site-config';

import {
  DIRECTION_ADVERBS,
  DISTANCE_BAND_KM,
  RING_RADII_KM,
  averageSpeedKmh,
  bearingDeg,
  compareToMedian,
  detourCategory,
  directionFromHeadquarters,
  directionOf,
  directionToHeadquarters,
  distanceBand,
  fasterRoutes,
  groupStats,
  kreisStats,
  neighborsOf,
  quadrantOf,
  rankByDistance,
  ringCounts,
  ringKm,
  speedCategory,
  type Direction,
  type GroupStats,
  type MedianComparison,
  type Neighbor,
  type Rank,
} from './derive';
import { MEASUREMENT } from './measurement';
import {
  EINSATZGEBIET_PATH,
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

/** Interner Link einer Seite (Gate U7: eingehende Links, Klicktiefe). */
export interface PageLink {
  href: string;
  label: string;
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

export function formatSpeed(kmh: number): string {
  return `${formatNumber(kmh)}${NBSP}km/h`;
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
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** Straße des Firmensitzes für Fließtext: „Siegmund-Hiepe-Straße“ (aus der Fakten-Adresse, ohne Hausnummer). */
const STREET = SITE_CONFIG.headquarters.streetAddress.replace(/\s*\d+\w*$/, '').replace(/Str\.$/, 'Straße');
const HQ_CITY = SITE_CONFIG.headquarters.addressLocality;
/** Ansprechpartner für WhatsApp (SITE_CONFIG.founder). */
const CONTACT_NAME = `${SITE_CONFIG.founder.givenName} ${SITE_CONFIG.founder.familyName}`;
const NEIGHBOR_COUNT = 4;
const NEIGHBOR_WORD = 'vier';
/** Ab so wenig Kilometern Abstand zur 35-km-Grenze liegt ein Ort „am Rand“ des Gebiets. */
const EDGE_MARGIN_KM = 3;

/** Fakten im Band (inverse) jeder Ortsseite; dazu die Kreis-Fakten (countyPartner im Lahn-Dill-Kreis). */
export const BAND_FACT_IDS: readonly FactId[] = Object.freeze(['radius35', 'flexibleHours', 'vacation30']);

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
  ring: number;
  speed: number;
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
    ring: ringKm(place),
    speed: averageSpeedKmh(place),
    neighbors: neighborsOf(place, published, NEIGHBOR_COUNT),
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
  if (kreis.id === headquartersKreisId()) {
    if (c.ring < MAX_ROAD_KM) {
      return [
        ort(
          `${name} liegt ${adverb} von ${HQ_CITY} und wie der Firmensitz ${kreis.dative}: ${km}, noch im Ring bis ${formatKm(c.ring)}. Die Fahrt dauert rund ${minutes}.`,
        ),
      ];
    }
    return [
      ort(
        `Wie der Firmensitz gehört ${name} zum ${kreis.name}, liegt aber ${adverb} im äußeren Ring bis ${formatKm(c.ring)}: ${km}, rund ${minutes}.`,
      ),
    ];
  }
  if (c.ring < MAX_ROAD_KM) {
    return [
      ort(
        `${name}, ${adverb} von ${HQ_CITY}, gehört schon zum ${kreis.name}. Bis zum Firmensitz sind es trotzdem nur ${km}, rund ${minutes}: noch im Ring bis ${formatKm(c.ring)}.`,
      ),
    ];
  }
  if (MAX_ROAD_KM - place.commute.distanceKm <= EDGE_MARGIN_KM) {
    return [
      ort(
        `Mit ${km} Straße liegt ${name} am ${EDGE_PREFIX[c.dirFromHq]}rand des Einsatzgebiets, die Grenze sind ${formatKm(MAX_ROAD_KM)}. Rund ${minutes} dauert die Fahrt nach ${HQ_CITY}.`,
      ),
    ];
  }
  return [
    ort(
      `${name} ${kreis.dative} ist ${km} vom Firmensitz entfernt. Mit rund ${minutes} Fahrt liegt der Ort ${adverb} von ${HQ_CITY} im äußeren Ring bis ${formatKm(c.ring)}.`,
    ),
  ];
}

/** Vorsilbe für „Nordrand“, „Südwestrand“ usw. */
const EDGE_PREFIX: Readonly<Record<Direction, string>> = Object.freeze({
  Norden: 'Nord',
  Nordosten: 'Nordost',
  Osten: 'Ost',
  Südosten: 'Südost',
  Süden: 'Süd',
  Südwesten: 'Südwest',
  Westen: 'West',
  Nordwesten: 'Nordwest',
});

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
    normal: `, ${air} Luftlinie oder ${km} auf der Straße.`,
    umweg: `: Luftlinie nur ${air}, doch die Straße macht mit ${km} einen deutlichen Bogen.`,
  }[detourCategory(place)];

  return `${direction}${detour}`;
}

/** Tempo der gemessenen Route: Satzbau nach Tempo-Stufe, Länge und Ring. */
function speedSentence(c: PlaceContext): string {
  const { place } = c;
  const km = formatKm(place.commute.distanceKm);
  const minutes = formatMinutes(place.commute.minutes);
  const speed = formatSpeed(c.speed);

  switch (speedCategory(place)) {
    case 'gemaechlich':
      return `Auf so kurzen Wegen bleibt der Schnitt niedrig: ${speed} laut Routenplaner.`;
    case 'mittel': {
      if (distanceBand(place) !== 'weit') return `Der Routenplaner rechnet im Schnitt mit ${speed}.`;
      // Vergleich mit allen Wegen ab 20 km: wie viele davon schneller sind.
      const longer = c.published.filter((p) => p.id !== place.id && distanceBand(p) === 'weit');
      const faster = longer.filter((p) => averageSpeedKmh(p) > c.speed).length;
      const vergleich = `auf ${faster} der ${longer.length + 1} Wege ab ${formatKm(DISTANCE_BAND_KM.weit)} geht es schneller`;
      return faster * 2 > longer.length
        ? `Für ${km} ist das eher gemächlich: im Schnitt ${speed}, ${vergleich}.`
        : `Im Schnitt sind das ${speed}; ${vergleich}.`;
    }
    case 'zuegig':
      if (place.commute.minutes === place.commute.distanceKm) {
        return `Für ${km} rechnet der Routenplaner genau ${minutes}: ein Kilometer pro Minute, also ${speed}.`;
      }
      return c.ring < MAX_ROAD_KM
        ? `Im Schnitt sind das ${speed}, ein zügiger Weg.`
        : `Trotz der ${km} bleibt es bei ${minutes}, im Schnitt sind ${speed} drin.`;
    case 'schnell': {
      const faster = fasterRoutes(place, c.published);
      const total = c.published.length;
      return faster === 0
        ? `Mit ${speed} im Schnitt hat der Weg aus ${place.name} das höchste Tempo aller ${total} Orte im Einsatzgebiet.`
        : `Mit ${speed} im Schnitt gehört der Weg aus ${place.name} zu den schnellsten: Nur ${faster} der ${total} Orte ${numerus(faster, 'kommt', 'kommen')} auf mehr.`;
    }
  }
}

/** Messpunkt, wo er vom Ortsnamen abweicht (Verwaltungssitz) oder ein Stadtteil-Mittelpunkt ist. */
function measuringPointSentence(c: PlaceContext): string | null {
  const { place } = c;
  if (place.kind === 'stadtteil') return `Gemessen ab dem Ortsmittelpunkt, den OpenStreetMap für ${place.name} führt.`;
  if (place.kind === 'stadt') return `Gemessen ab der Ortsmitte, die OpenStreetMap für ${place.name} führt.`;
  if (!place.seat) return null;
  if (c.ring === RING_RADII_KM[0]) {
    return `Messpunkt ist ${place.seat}, der Verwaltungssitz von ${place.name}. In anderen Ortsteilen kann der Weg kürzer oder länger sein.`;
  }
  if (c.ring < MAX_ROAD_KM) {
    return `Gemessen ab ${place.seat}, dem Verwaltungssitz der Gemeinde ${place.name}. Andere Ortsteile liegen näher oder weiter.`;
  }
  return `Die Messung startet in ${place.seat}, dem Verwaltungssitz. Aus anderen Ortsteilen von ${place.name} prüfst du deine Strecke am besten selbst im Routenplaner.`;
}

/** Ehrlicher Hinweis zur Messung, auf jeder Ortsseite gleich. */
export const MEASUREMENT_NOTE = `Gemessen am ${formatMeasuredOn(MEASUREMENT.measuredOn)} mit OpenStreetMap (OSRM): Richtwert ohne Berufsverkehr.`;

function arbeitswegBlocks(c: PlaceContext): TextBlock[] {
  const blocks = [ort(routeSentence(c)), ort(speedSentence(c))];
  const point = measuringPointSentence(c);
  if (point) blocks.push(ort(point));
  blocks.push(gemeinsam(MEASUREMENT_NOTE));
  return blocks;
}

// ─── Stellen ────────────────────────────────────────────────────────────────

/** Satz „Fahrt ab Wohnort“ aus dem Fakt vehicle (Plan: unter den Stellen, für den Kundendienst). */
const VEHICLE_FROM_HOME = FACTS.vehicle.long.split(/(?<=\.)\s+/).find((sentence) => sentence.includes('Wohnort')) ?? FACTS.vehicle.long;

function stellenBlocks(jobs: readonly Job[]): TextBlock[] {
  if (jobs.length === 0) {
    return [gemeinsam('Gerade ist keine Stelle ausgeschrieben. Eine Initiativbewerbung ist jederzeit möglich.')];
  }
  // Alle Gehälter im Monat: die Einheit einmal vorne, sonst je Stelle.
  const monthly = jobs.every((job) => !job.salary || job.salary.unit === 'MONTH');
  const list = jobs.map((job) => {
    const salary = monthly ? formatSalaryAmount(job) : formatSalaryRange(job);
    return salary ? `${job.shortTitle} ${salary}` : job.shortTitle;
  });
  const offen = `Offen ${numerus(jobs.length, 'ist', 'sind')} ${jobs.length} ${numerus(jobs.length, 'Stelle', 'Stellen')}`;
  const blocks = [gemeinsam(`${offen}, ${monthly ? 'Gehalt im Monat' : 'mit Gehalt'}: ${joinList(list)}.`)];
  if (jobs.some((job) => job.category === 'kundendienst')) {
    blocks.push(gemeinsam(`Im Kundendienst gilt: ${VEHICLE_FROM_HOME}`, ['vehicle']));
  }
  return blocks;
}

// ─── Nachbarorte ────────────────────────────────────────────────────────────

/**
 * „Lollar (26 km)“; steckt im Namen schon eine Klammer, kommt der Wert hinein: „Allendorf (Lumda, 14 km)“.
 */
export function labeled(name: string, value: string): string {
  const inner = name.match(/^(.*) \((.+)\)$/);
  return inner ? `${inner[1]} (${inner[2]}, ${value})` : `${name} (${value})`;
}

const neighborItem = (neighbor: Neighbor) => labeled(neighbor.place.name, formatAirKm(neighbor.airKm));

/** Wo die vier nächsten Orte im Vergleich zum Firmensitz liegen: näher, gleich weit, weiter weg. */
function neighborPositionSentence(c: PlaceContext): string {
  const { place, neighbors } = c;
  const km = place.commute.distanceKm;
  const closer = neighbors.filter((n) => n.distanceKm < km);
  const same = neighbors.filter((n) => n.distanceKm === km);
  const farther = neighbors.filter((n) => n.distanceKm > km);
  const target = place.kind === 'gemeinde' ? HQ_CITY : 'zum Firmensitz';

  if (closer.length === 0 && same.length === 0) {
    return `${place.name} liegt näher am Firmensitz als alle ${NEIGHBOR_WORD} Nachbarorte: ${joinList(neighbors.map(neighborItem))}.`;
  }
  if (farther.length === 0 && same.length === 0) {
    const toward = place.kind === 'gemeinde' ? `nach ${target}` : target;
    return `Alle ${NEIGHBOR_WORD} Nachbarorte haben es näher ${toward} als ${place.name}: ${joinList(neighbors.map(neighborItem))}.`;
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

/** Der nächste Nachbar im Vergleich: Strecke und Fahrzeit zum Firmensitz. */
function nearestNeighborSentence(c: PlaceContext): string {
  const { place } = c;
  const nearest = c.neighbors[0];
  const dm = nearest.minutes - place.commute.minutes;
  const dk = nearest.distanceKm - place.commute.distanceKm;
  const other = nearest.place.name;
  const where = `${formatAirKm(nearest.airKm)} ${adverbBetween(place, nearest.place)}`;
  const theirKm = formatKm(nearest.distanceKm);
  const theirMinutes = formatMinutes(nearest.minutes);

  if (dm === 0) return `${other}, ${where} von ${place.name}, braucht genauso ${theirMinutes} zum Firmensitz.`;
  if (dm < 0 && dk < 0) {
    return -dm <= 3
      ? `Aus ${other}, ${where} von ${place.name}, sind es ${theirKm} und ${theirMinutes} zum Firmensitz: nur ${formatMinutes(-dm)} weniger.`
      : `Wer im ${where} gelegenen ${other} wohnt, ist nach ${theirMinutes} am Firmensitz, ${formatMinutes(-dm)} früher als aus ${place.name}.`;
  }
  if (dm < 0) {
    return `${other} liegt ${where} und hat mit ${theirKm} ${dk === 0 ? 'die gleiche' : 'eine längere'} Strecke, ist laut Routenplaner aber ${formatMinutes(-dm)} schneller am Firmensitz.`;
  }
  if (dk > 0) {
    return `Wer in ${other} wohnt, ${where} von ${place.name}, braucht ${theirMinutes} zum Firmensitz: ${formatMinutes(dm)} mehr.`;
  }
  return `${other} liegt ${where} und hat mit ${theirKm} ${dk === 0 ? 'die gleiche' : 'eine kürzere'} Strecke, braucht laut Routenplaner aber ${formatMinutes(dm)} länger.`;
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
  } else if (others.length === 1) {
    const [[kreisId, names]] = others;
    sentences.push(`Nebenan beginnt der ${kreisName(kreisId)}: ${joinList(names)}.`);
  } else {
    sentences.push(`Nebenan beginnen ${joinList(others.map(([kreisId, names]) => `der ${kreisName(kreisId)} mit ${joinList(names)}`))}.`);
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
    text: `Von den ${sector.length} Orten ${dir} sind ${r.closer} näher am Firmensitz als ${place.name}, ${beforeClause}; am weitesten draußen liegt ${item(last)}.`,
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

  let sentence: string;
  if (r.closer === 1 && r.farther === 1 && r.same === 0) {
    const [before, after] = c.kreisStats.places.filter((p) => p.id !== place.id);
    sentence = `${place.name} liegt ${kreis.dative} in der Mitte: ${before.name} ist näher am Firmensitz, ${after.name} weiter weg.`;
  } else if (r.closer <= quarter) {
    sentence = `Von den ${r.total} Orten ${kreis.dative} ${numerus(r.closer, 'hat', 'haben')} nur ${r.closer} einen kürzeren Weg zum Firmensitz, ${r.farther} einen längeren.`;
  } else if (r.closer < r.farther) {
    sentence = `${place.name} gehört zur näheren Hälfte ${kreis.genitive}: ${r.closer} Orte haben einen kürzeren Weg, ${r.farther} einen längeren.`;
  } else if (r.farther <= quarter) {
    sentence = `Nur ${r.farther} der ${r.total} Orte ${kreis.genitive} ${numerus(r.farther, 'liegt', 'liegen')} noch weiter vom Firmensitz entfernt als ${place.name}, ${r.closer} näher.`;
  } else {
    sentence = `${r.closer} der ${r.total} Orte ${kreis.genitive} ${numerus(r.closer, 'liegt', 'liegen')} näher an ${HQ_CITY}, ${r.farther} weiter weg.`;
  }
  // Gleich weite Nachbarorte nennt schon der Abschnitt „Orte rund um …“.
  const neighborIds = new Set(c.neighbors.map((n) => n.place.id));
  const sameElsewhere = r.sameAs.filter((p) => !neighborIds.has(p.id));
  return sameElsewhere.length > 0
    ? [sentence, `Genauso weit wie aus ${place.name} fährst du aus ${joinList(sameElsewhere.map((p) => p.name))}.`]
    : [sentence];
}

/** Fahrzeit gegen den Median des Kreises. */
function kreisMedianSentence(c: PlaceContext): string {
  const { place, kreis, kreisMedian: m } = c;
  const median = formatMinutes(m.medianMinutes);
  if (m.relation === 'schneller') {
    return `Aus ${place.name} bist du ${formatMinutes(m.diffMinutes)} schneller am Firmensitz als die mittlere Fahrzeit ${kreis.genitive} (Median: ${median}).`;
  }
  if (m.relation === 'langsamer') {
    return `Die mittlere Fahrzeit ${kreis.genitive} liegt bei ${median} (Median), aus ${place.name} sind es ${formatMinutes(m.diffMinutes)} mehr.`;
  }
  return `${place.name} liegt mit ${formatMinutes(place.commute.minutes)} genau auf der mittleren Fahrzeit ${kreis.genitive} (Median).`;
}

/** Kreise ohne Hub (< 3 Orte): Vergleich mit dem anderen Ort des Kreises. */
function smallKreisSentences(c: PlaceContext): string[] {
  const { place, kreis } = c;
  const all = c.kreisStats.places;
  const others = all.filter((p) => p.id !== place.id);
  if (others.length === 0) return [`${upperFirst(kreis.dative)} ist ${place.name} der einzige Ort im Einsatzgebiet.`];
  const sentences = [
    `${upperFirst(kreis.dative)} ${numerus(all.length, 'liegt', 'liegen')} nur ${all.length} Orte innerhalb von ${formatKm(MAX_ROAD_KM)} Straße: ${joinList(all.map((p) => p.name))}.`,
  ];
  for (const other of others) {
    const dk = other.commute.distanceKm - place.commute.distanceKm;
    const dm = other.commute.minutes - place.commute.minutes;
    if (dk < 0 && dm > 0) {
      sentences.push(`${other.name} ist ${formatKm(-dk)} näher am Firmensitz, braucht laut Routenplaner aber ${formatMinutes(dm)} länger.`);
    } else if (dk > 0 && dm < 0) {
      sentences.push(
        `${place.name} ist ${formatKm(dk)} näher am Firmensitz, braucht laut Routenplaner aber ${formatMinutes(-dm)} länger als ${other.name}.`,
      );
    } else {
      const strecke = dk === 0 ? 'liegt gleich weit' : `liegt ${formatKm(Math.abs(dk))} ${dk < 0 ? 'näher' : 'weiter'}`;
      const zeit = dm === 0 ? 'braucht gleich lang' : `braucht ${formatMinutes(Math.abs(dm))} ${dm < 0 ? 'weniger' : 'mehr'}`;
      sentences.push(`${other.name} ${strecke} und ${zeit}.`);
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

/** Startseitenkarte: freigegebene Kurzbeschreibung oder nur der Hinweis auf den Punkt. */
function homeMapSentence(c: PlaceContext): string | null {
  const { place } = c;
  if (place.character) return `Auf der Karte der Startseite steht ${place.name} für „${place.character.text}“.`;
  if (place.homeMap) {
    const count = c.published.filter((p) => p.homeMap).length;
    return `${place.name} ist einer der ${count} Orte auf der Karte der Startseite.`;
  }
  return null;
}

function kreisBlocks(c: PlaceContext): TextBlock[] {
  const sentences: string[] = [];
  const stadtteil = stadtteilRankSentence(c);
  if (stadtteil) sentences.push(stadtteil);
  else if (c.kreis.hasHub) sentences.push(...kreisRankSentences(c));
  if (c.kreis.hasHub) sentences.push(kreisMedianSentence(c));
  else sentences.push(...smallKreisSentences(c));
  const homeMap = homeMapSentence(c);
  if (homeMap) sentences.push(homeMap);
  return sentences.map((text) => ort(text));
}

// ─── Band und Kontakt ───────────────────────────────────────────────────────

/** Fakten im Band einer Ortsseite oder eines Kreis-Hubs. */
export function bandFactIds(kreis: Pick<Kreis, 'factIds'>): FactId[] {
  return [...BAND_FACT_IDS, ...kreis.factIds.filter((id) => !BAND_FACT_IDS.includes(id))];
}

/** Band (Etikettkasten): je Fakt die Kurzform; den ganzen Satz liefert FACTS[id].long über `factIds`. */
function bandBlocks(kreis: Pick<Kreis, 'factIds'>): TextBlock[] {
  return bandFactIds(kreis).map((id) => gemeinsam(FACTS[id].short, [id]));
}

/**
 * Sichtbarer Text des Kontakts. Die vorbereitete Nachricht (whatsappGreeting) steht im WhatsApp-Link, nicht
 * auf der Seite, und zählt darum nicht zum Seitentext.
 */
const KONTAKT_TEXT = `Lieber erst fragen? Schreib ${CONTACT_NAME} per WhatsApp, die Nachricht nennt schon deinen Ort.`;

function kontaktBlocks(): TextBlock[] {
  return [gemeinsam(KONTAKT_TEXT)];
}

// ─── Ortsseite ──────────────────────────────────────────────────────────────

export type PlaceSectionId = 'lead' | 'arbeitsweg' | 'stellen' | 'nachbarn' | 'stadtteile' | 'kreis' | 'band' | 'kontakt';

export interface PlacePageText {
  placeId: string;
  path: string;
  meta: PageMeta;
  /** Etikett über der h1: „35614 Aßlar · Lahn-Dill-Kreis“. */
  etikett: string;
  /** Maße im Seitenkopf: Strecke, Fahrzeit, Luftlinie, Richtung, Ring. */
  masse: Mass[];
  /** Abschnitte in Seitenreihenfolge; leere Abschnitte fallen weg. */
  sections: TextSection<PlaceSectionId>[];
  bandFactIds: FactId[];
  /** Vorbereitete WhatsApp-Nachricht (steht im Link, nicht auf der Seite). */
  whatsappGreeting: string;
  /** Werte, die nur zu diesem Ort gehören (Gate U1). */
  values: PlaceDataValue[];
  /** Interne Links: Nachbarorte, Stadt bzw. Stadtteile, Kreis, Gebietsseite. */
  links: PageLink[];
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
      // Nicht „SHK Jobs Wetzlar“: Das Keyword gehört der Startseite (ROADMAP §10). Fokus: Stadtteile und Werkstatt.
      title: `${place.name} und Stadtteile: ${minKm} bis ${formatKm(maxKm)} zur Werkstatt`,
      h1: `${place.name} und seine Stadtteile: dein Weg zur Werkstatt`,
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
    { label: 'Ring', value: formatKm(c.ring) },
    { label: 'Tempo', value: formatSpeed(c.speed) },
    { label: 'PLZ', value: place.postalCode },
    { label: 'Kreis', value: c.kreis.name },
  ];
  c.neighbors.forEach((neighbor, i) => values.push({ label: `Nachbar ${i + 1}`, value: neighborItem(neighbor) }));
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
    { id: 'stellen', heading: 'Offene Stellen', blocks: stellenBlocks(c.jobs) },
    { id: 'nachbarn', heading: `Orte rund um ${name}`, blocks: nachbarnBlocks(c) },
    { id: 'stadtteile', heading: `Die Stadtteile von ${name}`, blocks: place.kind === 'stadt' ? stadtteileBlocks(c) : [] },
    { id: 'kreis', heading: place.kind === 'stadtteil' ? `${name} in ${HQ_CITY}` : `${name} ${c.kreis.dative}`, blocks: kreisBlocks(c) },
    { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(c.kreis) },
    { id: 'kontakt', heading: 'Direkt fragen', blocks: kontaktBlocks() },
  ];
  // Jeder Ort, den der Text nennt, ist verlinkt: Nachbarn, Orte derselben Richtung, im kleinen Kreis der andere Ort.
  const named = [
    ...c.neighbors.map((n) => n.place),
    ...sectorSentence(c).named,
    ...(c.kreis.hasHub ? [] : c.kreisStats.places.filter((p) => p.id !== place.id)),
  ];
  const links: PageLink[] = [
    ...named.map((p) => ({ href: placePath(p), label: p.name })),
    ...(place.kind === 'stadt' ? c.stadtteile.map((s) => ({ href: placePath(s), label: s.name })) : []),
    ...(place.parentId ? [parentLink(place.parentId)].filter((link): link is PageLink => link !== null) : []),
    { href: kreisPath(c.kreis), label: c.kreis.shortName },
    { href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL },
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
      { wert: formatKm(c.ring), name: 'Ring' },
    ],
    sections: sections.filter((section) => section.blocks.length > 0),
    bandFactIds: bandFactIds(c.kreis),
    whatsappGreeting: whatsappGreeting(place),
    values: placeValues(c),
    links: links.filter((link, i) => links.findIndex((other) => other.href === link.href) === i),
  };
}

/** Linktext zur Gebietsseite. */
export const EINSATZGEBIET_LINK_LABEL = 'Alle Orte im Einsatzgebiet';

function parentLink(parentId: string): PageLink | null {
  const parent = getPlaceById(parentId);
  return parent?.status === 'published' ? { href: placePath(parent), label: parent.name } : null;
}

// ─── Kreis-Hub ──────────────────────────────────────────────────────────────

export type KreisSectionId = 'lead' | 'zahlen' | 'orte' | 'band';

export interface KreisPageText {
  kreisId: string;
  path: string;
  meta: PageMeta;
  sections: TextSection<KreisSectionId>[];
  bandFactIds: FactId[];
  /** Alle Orte des Kreises und die Gebietsseite. */
  links: PageLink[];
}

/** „Bis 15 km: 4 Orte, bis 25 km: 6, bis 35 km: 3.“ ohne leere Ringe. */
function ringSentence(places: readonly Place[]): string {
  const counts = ringCounts(places);
  const filled = RING_RADII_KM.filter((radius) => counts[radius] > 0);
  if (filled.length === 1) {
    const radius = filled[0];
    return `${numerus(places.length, 'Der Ort liegt', `Alle ${places.length} Orte liegen`)} im Ring bis ${formatKm(radius)}.`;
  }
  return `${filled.map((radius, i) => `${i === 0 ? 'Bis' : 'bis'} ${formatKm(radius)}: ${counts[radius]} ${numerus(counts[radius], 'Ort', 'Orte')}`).join(', ')}.`;
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
  return {
    kreisId: kreis.id,
    path: kreisPath(kreis),
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
            `Die mittlere Fahrzeit (Median) liegt bei ${formatMinutes(stats.medianMinutes)}, die mittlere Strecke bei ${formatKm(stats.medianKm)}. Am schnellsten ${numerus(stats.fastest.length, 'ist', 'sind')} ${names(stats.fastest)} mit ${formatMinutes(stats.fastest[0].commute.minutes)}.`,
          ),
          ort(ringSentence(places)),
          gemeinsam(MEASUREMENT_NOTE),
        ],
      },
      {
        id: 'orte',
        heading: `Alle Orte ${kreis.dative}`,
        blocks: [ort(`Nach Strecke: ${joinList(places.map(placeListItem))}.`)],
      },
      { id: 'band', heading: 'Was überall gilt', blocks: bandBlocks(kreis) },
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

export type EinsatzgebietSectionId = 'lead' | 'ringe' | 'kreise' | 'band';

export interface EinsatzgebietPageText {
  path: string;
  meta: PageMeta;
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
          ort(ringSentence(places)),
          ort(`Die mittlere Fahrzeit aller Orte (Median) liegt bei ${formatMinutes(stats.medianMinutes)}.`),
          gemeinsam(MEASUREMENT_NOTE),
        ],
      },
      {
        id: 'kreise',
        heading: 'Die Kreise',
        blocks: [
          ort(`${hubs.length} Kreise haben eine eigene Seite: ${joinList(hubs.map(kreisItem))}.`),
          ...(kreise.length > hubs.length
            ? [
                ort(
                  `Mit weniger Orten stehen hier: ${joinList(kreise.filter((k) => !k.hasHub).map(kreisItem))}.`,
                ),
              ]
            : []),
        ],
      },
      { id: 'band', heading: 'Was überall gilt', blocks: BAND_FACT_IDS.map((id) => gemeinsam(FACTS[id].short, [id])) },
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
