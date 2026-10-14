import { FACTS, isFactId, type FactId } from '@/lib/content/facts';
import { formatNumber } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, type Job } from '@/lib/jobs/registry';
import { SITE_CONFIG } from '@/lib/seo/site-config';

import { datenBelege, type DatenKlasse } from './datenklassen';
import {
  DIRECTIONS,
  DIRECTION_ADVERBS,
  DISTANCE_BAND_KM,
  RING_RADII_KM,
  compareToMedian,
  directionFromHeadquarters,
  groupStats,
  kreisStats,
  placeNeighbors,
  rankByDistance,
  roadBandFloorKm,
  roadBandKm,
} from './derive';
import { MEASUREMENT } from './measurement';
import { jaccard, numbersIn, sentences, shingles, skeleton, wordCount } from './metriken';
import { BERUFSSCHULE, OEPNV_META, OEPNV_QUELLE, type OepnvOrt, type OepnvVerbindung, type OepnvWeg } from './oepnv';
import { EINSATZGEBIET_PATH, compareByDistance, getHubKreise, getKreise, getPublishedPlaces, getStadtteile } from './registry';
import { MAX_ROAD_KM, type Place } from './schema';
import {
  FAKT_BEGLEITER,
  fruehesteAnkunft,
  getEinsatzgebietPageText,
  getKreisPageText,
  getPlacePageText,
  sectionText,
  type PageMeta,
  type PlacePageText,
} from './text';

/**
 * Indexierungs-Gate der Ortsseiten (E-029, ROADMAP §10.1, Plan §B). Eine Ortsseite ist nur indexierbar, wenn alle
 * Bedingungen gelten:
 * - I1: U1–U8, das Einzigartigkeits-Gate aus E-028 (eigene Werte, Ortstext, Ähnlichkeit, Satzgerüste, belegte Zahlen,
 *   nur bestätigte Fakten, Verlinkung, eindeutige Metadaten);
 * - I2: mindestens zwei Datenklassen außer der Geometrie, jede mit Quelle (lib/places/datenklassen.ts);
 * - I3: mindestens 60 Wörter und 30 % des Ortstexts aus diesen Daten;
 * - I4: Jaccard gegen die indexierbaren Geschwisterseiten ≤ 0,30 ganz und ≤ 0,20 für die Ortsblöcke (das gebaute HTML
 *   prüft scripts/qa/check-local-similarity.mjs mit ≤ 0,40);
 * - I5: Daten aktuell (Fahrplanjahr; Einsätze ≤ 15 Monate): Das Gate legt `gueltigBis` fest, die Seiten prüfen das Datum
 *   bei jedem Rendern (lib/places/indexierung.ts);
 * - I6: kein `pending`-Fakt auf der Seite.
 *
 * Das Ergebnis steht in lib/places/data/indexierung.json (`bun run orte:gate`); qualitaet.test.ts erzwingt, dass die
 * Datei der Rechnung entspricht. Die Schwellen werden nie gelockert, um einen Ort zu halten (G7): Wer durchfällt, bekommt
 * `noindex,follow` und bleibt erreichbar. Gerechnet wird mit allen veröffentlichten Stellen (getActiveJobs), nicht mit
 * den heute live geschalteten: So hängt das Ergebnis an den Daten und nicht am Kalender.
 */

export const GATE = Object.freeze({
  /** U1: eigene Werte je Seite. */
  minValues: 8,
  /** U2: Wörter in `ort`-Blöcken und ihr Anteil am Haupttext (ort + gemeinsam). */
  minOrtWords: 90,
  minOrtShare: 0.35,
  /** U3: Jaccard über 5-Wort-Shingles je Seitenpaar (alle Ortsseiten). */
  maxJaccardWhole: 0.45,
  maxJaccardOrt: 0.3,
  /** U4: Anteil der Seiten mit demselben `ort`-Satzgerüst, in beiden Lesarten. */
  maxSkeletonShare: 0.3,
  /** U7: eingehende Links je Orts- und Kreisseite, Klicktiefe ab der Startseite. */
  minInboundLinks: 3,
  maxClickDepth: 3,
  /** U8: Längen der Metadaten. */
  maxTitle: 60,
  minDescription: 50,
  maxDescription: 155,
  /** I2: Datenklassen außer der Geometrie. */
  minDatenKlassen: 2,
  /** I3: Wörter aus Daten und ihr Anteil am Ortstext. */
  minDatenWoerter: 60,
  minDatenAnteil: 0.3,
  /** I4: Jaccard gegen indexierbare Geschwisterseiten (Textmodell). */
  maxJaccardWholeIndexierbar: 0.3,
  maxJaccardOrtIndexierbar: 0.2,
  /** I4 im gebauten HTML (scripts/qa/check-local-similarity.mjs, MAX_JACCARD). */
  maxJaccardHtml: 0.4,
});

/** Verbotene Arbeitszeit-Aussagen (fakten-abgleich B28): nur flexibleHours gilt. */
export const FORBIDDEN_HOURS: readonly RegExp[] = Object.freeze([
  /13[:.]30/,
  /16[:.]45/,
  /pünktlich/i,
  /feste arbeitszeit/i,
  /35[\s -]*(?:std|stunden)/i,
  /feierabend/i,
]);

/** Von Hand zurückgenommene Orte in der Lock-Datei (120-Tage-Regel, docs/operations/orte-monitoring.md). */
export interface Zuruecknahme {
  grund: string;
  /** JJJJ-MM-TT */
  seit: string;
}

export interface OrtWerte {
  datenKlassen: DatenKlasse[];
  datenWoerter: number;
  datenAnteil: number;
  /** Höchste Jaccard-Werte gegen die übrigen indexierbaren Ortsseiten (I4). */
  jaccardGanz: number;
  jaccardOrt: number;
}

export interface OrtErgebnis {
  placeId: string;
  indexierbar: boolean;
  /** Gründe, warum der Ort nicht indexiert wird (leer, wenn er besteht), z. B. „I3: 52 Wörter aus Daten (mindestens 60)“. */
  gruende: string[];
  /** Letzter Tag, an dem die Daten als aktuell gelten (I5); null ohne Datenklasse. */
  gueltigBis: string | null;
  werte: OrtWerte;
}

export interface GateOptionen {
  /** Stellen, mit denen die Seiten gerechnet werden; Standard: alle veröffentlichten. */
  jobs?: readonly Job[];
  /** Zurückgenommene Orte (Lock-Datei, Feld `zurueckgenommen`). */
  zurueckgenommen?: Readonly<Record<string, Zuruecknahme>>;
}

const fmt = (wert: number) => wert.toFixed(3).replace('.', ',');
const prozent = (wert: number) => `${Math.round(wert * 100)}${' '}%`;

// ─── Text einer Ortsseite ───────────────────────────────────────────────────

export const ortText = (page: PlacePageText) => sectionText(page.sections, 'ort');
export const ganzText = (page: PlacePageText) => sectionText(page.sections);

/** Ortsblöcke aus einer Datenklasse (I3). */
export function datenText(page: PlacePageText): string {
  return page.sections
    .flatMap((section) => section.blocks)
    .filter((block) => block.kind === 'ort' && block.daten !== undefined)
    .map((block) => block.text)
    .join(' ');
}

/** Alles, was die Seite an Text zeigt und das Gate prüft (U5, U6). */
export function seitenText(page: PlacePageText): string[] {
  return [
    ganzText(page),
    page.meta.title,
    page.meta.description,
    page.meta.h1,
    page.etikett,
    ...page.unterzeile,
    ...page.masse.map((mass) => mass.wert),
    page.whatsappGreeting,
    page.routeLabel,
    ...page.sections.flatMap((section) => section.blocks.flatMap((block) => (block.frage ? [block.frage] : []))),
  ];
}

/** Jeder Fakt, den die Seite zeigt: Blöcke, Band und die Begleitfakten des Bands (I6). */
export function seitenFakten(page: PlacePageText): FactId[] {
  const ids = [...page.sections.flatMap((section) => section.blocks.flatMap((block) => block.factIds ?? [])), ...page.bandFactIds];
  const begleiter = page.bandFactIds.flatMap((id) => {
    const partner = FAKT_BEGLEITER[id];
    return partner ? [partner] : [];
  });
  return [...new Set([...ids, ...begleiter])];
}

// ─── U5: belegte Zahlen ─────────────────────────────────────────────────────

/** Zahlen, wie die Texte sie schreiben: ganze Zahlen nach formatNumber, Luftlinien mit einer Nachkommastelle. */
export function addNumber(set: Set<string>, value: number): void {
  set.add(formatNumber(value));
  set.add(value.toFixed(1).replace('.', ','));
}

/** Uhrzeit „06:25“ so, wie die Seiten sie schreiben („6:25“): Stunde ohne führende Null, Minuten zweistellig. */
function addUhrzeit(set: Set<string>, hhmm: string): void {
  set.add(String(Number(hhmm.slice(0, 2))));
  set.add(hhmm.slice(3, 5));
}

function addVerbindung(set: Set<string>, v: OepnvVerbindung): void {
  [v.losgehen, v.abfahrt, v.ankunftHaltestelle, v.ankunft].forEach((uhr) => addUhrzeit(set, uhr));
  [v.gehMinStart, v.gehMinZiel, v.fahrzeitMin, v.reisezeitMin, v.umstiege].forEach((n) => addNumber(set, n));
  for (const teil of v.teilstrecken) {
    addUhrzeit(set, teil.abfahrt);
    addUhrzeit(set, teil.ankunft);
    if (teil.umstiegZuFussMin) addNumber(set, teil.umstiegZuFussMin);
    for (const n of [...numbersIn(teil.linie), ...numbersIn(teil.ab), ...numbersIn(teil.an)]) set.add(n);
  }
}

function addWeg(set: Set<string>, weg: OepnvWeg): void {
  addUhrzeit(set, weg.ankunftBis);
  addNumber(set, weg.verbindungenMorgens);
  if (weg.spaeteste) addVerbindung(set, weg.spaeteste);
  if (weg.direktZuFussMin) addNumber(set, weg.direktZuFussMin);
  const frueh = fruehesteAnkunft(weg);
  if (frueh) addUhrzeit(set, frueh);
  for (const v of weg.verbindungen) {
    [v.losgehen, v.abfahrt, v.ankunft].forEach((uhr) => addUhrzeit(set, uhr));
    addNumber(set, v.umstiege);
  }
}

/** Zahlen aus Bus und Bahn eines Orts: Haltestellen, Wege zum Betrieb und zur Schule, ihr Unterschied. */
export function addOepnv(set: Set<string>, oepnv: OepnvOrt): void {
  for (const h of oepnv.startHaltestellen) {
    addNumber(set, h.wegM);
    addNumber(set, h.gehMin);
    numbersIn(h.name).forEach((n) => set.add(n));
  }
  addWeg(set, oepnv.betrieb);
  addWeg(set, oepnv.schule);
  const b = oepnv.betrieb.spaeteste;
  const s = oepnv.schule.spaeteste;
  if (b && s) addNumber(set, Math.abs(s.reisezeitMin - b.reisezeitMin));
}

/**
 * Allowlist einer Ortsseite, unabhängig vom Text aus Messung, derive.ts, Fakten, Stellen und den Datenklassen gebaut:
 * Jede Zahl, die die Seite nennt, muss hier stehen (U5). Bus und Bahn mit den Daten des Orts und seiner Nachbarn
 * (Nachbarorte mit Verbindung, wenn der Ort selbst keine hat), dazu Zählfenster, Fristen und die Anschrift der Schule.
 */
export function belegteZahlen(place: Place, places: readonly Place[], jobs: readonly Job[]): Set<string> {
  const allowed = new Set<string>();
  const add = (...values: number[]) => values.forEach((v) => addNumber(allowed, v));
  const addFrom = (text: string) => numbersIn(text).forEach((n) => allowed.add(n));

  // Gebiet und Messung
  add(MAX_ROAD_KM, ...RING_RADII_KM, ...RING_RADII_KM.map(roadBandFloorKm), ...Object.values(DISTANCE_BAND_KM), places.length, getKreise().length);
  addFrom(MEASUREMENT.measuredOn.split('-').map(Number).join(' '));
  addFrom(`${SITE_CONFIG.headquarters.streetAddress} ${SITE_CONFIG.headquarters.postalCode}`);
  // Fakten und Stellen
  for (const id of Object.keys(FACTS) as FactId[]) addFrom(`${FACTS[id].short} ${FACTS[id].long} ${FACTS[id].value ?? ''}`);
  add(jobs.length);
  // Messwerte aller Orte (Listen nennen andere Orte mit ihrer Strecke)
  for (const p of places) {
    add(p.commute.distanceKm, p.commute.minutes, p.commute.airKm);
    allowed.add(p.postalCode);
  }
  if (place.character) addFrom(place.character.text);
  // Abgeleitete Werte dieses Orts
  const kreisGroup = kreisStats(place.kreisId, places);
  const kreisRank = rankByDistance(place, kreisGroup.places);
  const areaRank = rankByDistance(place, places);
  const median = compareToMedian(place, kreisGroup);
  add(roadBandKm(place));
  add(kreisGroup.count, kreisGroup.medianMinutes, median.diffMinutes);
  add(kreisRank.closer, kreisRank.farther, kreisRank.same, kreisRank.total);
  add(areaRank.closer, areaRank.total);
  add(places.filter((p) => p.homeMap).length);
  const neighbors = placeNeighbors(place, places);
  for (const n of neighbors) {
    add(n.airKm, Math.abs(n.minutes - place.commute.minutes), Math.abs(n.distanceKm - place.commute.distanceKm));
  }
  for (const other of kreisGroup.places) {
    add(Math.abs(other.commute.minutes - place.commute.minutes), Math.abs(other.commute.distanceKm - place.commute.distanceKm));
  }
  const sector = places.filter((p) => directionFromHeadquarters(p) === directionFromHeadquarters(place));
  const sectorRank = rankByDistance(place, sector);
  add(sector.length, sector.length - 1, sectorRank.closer, sectorRank.farther, sectorRank.same);
  const parentId = place.kind === 'stadt' ? place.id : place.parentId;
  if (parentId) {
    const stadtteile = getStadtteile(parentId);
    const r = place.kind === 'stadtteil' ? rankByDistance(place, stadtteile) : null;
    add(stadtteile.length, ...(r ? [r.closer, r.farther, r.same] : []));
    const stats = groupStats(stadtteile);
    add(stats.fastest[0].commute.minutes, stats.slowest[0].commute.minutes);
  }
  // Bus und Bahn, Berufsschule (Plan §B)
  if (place.oepnv) addOepnv(allowed, place.oepnv);
  for (const n of neighbors) if (n.place.oepnv) addOepnv(allowed, n.place.oepnv);
  String(OEPNV_META.methode.zaehlfenster)
    .split(/[–-]/)
    .forEach((uhr) => addUhrzeit(allowed, uhr.trim()));
  addFrom(BERUFSSCHULE.schule.strasse);
  return allowed;
}

// ─── U7: Verlinkung der lokalen Seiten ──────────────────────────────────────

/** Die Startseite verlinkt die Gebietsseite („Alle Orte im Einsatzgebiet“, Plan „Interne Links“). */
const HOME_LINKS = [EINSATZGEBIET_PATH];
const pagePath = (href: string) => href.split('#')[0];

export interface LinkGraph {
  graph: Map<string, Set<string>>;
  depth: Map<string, number>;
}

export function lokalerLinkGraph(pages: readonly PlacePageText[], jobs: readonly Job[]): LinkGraph {
  const graph = new Map<string, Set<string>>();
  graph.set('/', new Set(HOME_LINKS));
  for (const page of pages) graph.set(page.path, new Set(page.links.map((l) => pagePath(l.href))));
  for (const page of getHubKreise().map((kreis) => getKreisPageText(kreis, { jobs }))) {
    graph.set(page.path, new Set(page.links.map((l) => pagePath(l.href))));
  }
  const hub = getEinsatzgebietPageText({ jobs });
  graph.set(hub.path, new Set(hub.links.map((l) => pagePath(l.href))));
  const depth = new Map<string, number>([['/', 0]]);
  const queue = ['/'];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of graph.get(current) ?? []) {
      if (!depth.has(next)) {
        depth.set(next, depth.get(current)! + 1);
        queue.push(next);
      }
    }
  }
  return { graph, depth };
}

// ─── Gate ───────────────────────────────────────────────────────────────────

/** Eine Ortsseite für das Gate: Ort, Textmodell und die Shingles für die Ähnlichkeit. */
export interface Seite {
  place: Place;
  page: PlacePageText;
  ganz: Set<string>;
  ort: Set<string>;
}

export function seiteVon(place: Place, page: PlacePageText): Seite {
  return { place, page, ganz: shingles(ganzText(page)), ort: shingles(ortText(page)) };
}

/** Satzgerüste der Ortsblöcke in beiden Lesarten (U4): Ortsname ersetzt bzw. alle Namen, Kreise und Richtungen. */
function skeletonLesarten(seiten: readonly Seite[]): ((sentence: string, place: Place) => string)[] {
  const names = [...new Set(seiten.flatMap(({ place: p }) => [p.name, ...(p.seat ? [p.seat] : [])]))];
  const kreisForms = getKreise().flatMap((k) => [k.genitive.replace(/^des /, ''), k.name, k.shortName]);
  const directionWords = [...DIRECTIONS, ...Object.values(DIRECTION_ADVERBS)];
  return [
    (sentence, place) => skeleton(sentence, [place.name]),
    (sentence) => skeleton(skeleton(skeleton(sentence, names), kreisForms, '⟨KREIS⟩'), directionWords, '⟨RICHTUNG⟩'),
  ];
}

/** Gründe aus U1–U8 je Ort (I1), gerechnet über alle übergebenen Ortsseiten. */
export function pruefeEinzigartigkeit(seiten: readonly Seite[], jobs: readonly Job[]): Map<string, string[]> {
  const gruende = new Map(seiten.map(({ place }) => [place.id, [] as string[]]));
  const melde = (id: string, grund: string) => gruende.get(id)!.push(grund);
  const places = seiten.map((s) => s.place);

  // U1: eigene Werte, jeder sichtbar, keine zweite Seite mit derselben Kombination
  const kombis = new Map<string, number>();
  for (const { page } of seiten) {
    const key = page.values.map((v) => v.value).join('|');
    kombis.set(key, (kombis.get(key) ?? 0) + 1);
  }
  const PFLICHT = ['Strecke', 'Fahrzeit', 'Luftlinie', 'Richtung', 'PLZ', 'Kreis', 'Nachbar 1', 'Abstand 1', 'Nachbar 2', 'Abstand 2'];
  for (const { place, page } of seiten) {
    const surface = [ganzText(page), page.etikett, ...page.unterzeile, ...page.masse.map((m) => m.wert)].join(' ');
    if (page.values.length < GATE.minValues) melde(place.id, `U1: ${page.values.length} eigene Werte (mindestens ${GATE.minValues})`);
    const unsichtbar = page.values.filter((v) => !surface.includes(v.value)).map((v) => v.label);
    if (unsichtbar.length > 0) melde(place.id, `U1: Werte ohne Text: ${unsichtbar.join(', ')}`);
    const fehlt = PFLICHT.filter((label) => !page.values.some((v) => v.label === label));
    if (fehlt.length > 0) melde(place.id, `U1: Werte fehlen: ${fehlt.join(', ')}`);
    if ((kombis.get(page.values.map((v) => v.value).join('|')) ?? 0) > 1) melde(place.id, 'U1: dieselbe Wertekombination wie eine andere Seite');
  }

  // U2: Anteil Ortstext
  for (const { place, page } of seiten) {
    const ort = wordCount(ortText(page));
    const ganz = wordCount(ganzText(page));
    if (ort < GATE.minOrtWords) melde(place.id, `U2: ${ort} Wörter Ortstext (mindestens ${GATE.minOrtWords})`);
    if (ganz > 0 && ort / ganz < GATE.minOrtShare) melde(place.id, `U2: Ortstext ${prozent(ort / ganz)} (mindestens ${prozent(GATE.minOrtShare)})`);
  }

  // U3: Ähnlichkeit gegen jede andere Ortsseite
  for (let i = 0; i < seiten.length; i += 1) {
    for (let j = i + 1; j < seiten.length; j += 1) {
      const w = jaccard(seiten[i].ganz, seiten[j].ganz);
      const o = jaccard(seiten[i].ort, seiten[j].ort);
      if (w > GATE.maxJaccardWhole || o > GATE.maxJaccardOrt) {
        const werte = `(ganz ${fmt(w)}, Ortsblöcke ${fmt(o)})`;
        melde(seiten[i].place.id, `U3: zu ähnlich wie ${seiten[j].place.id} ${werte}`);
        melde(seiten[j].place.id, `U3: zu ähnlich wie ${seiten[i].place.id} ${werte}`);
      }
    }
  }

  // U4: kein Satzgerüst auf mehr als 30 % der Seiten
  for (const lesart of skeletonLesarten(seiten)) {
    const gerueste = seiten.map(({ place, page }) => new Set(sentences(ortText(page)).map((s) => lesart(s, place))));
    const zahl = new Map<string, number>();
    for (const set of gerueste) for (const g of set) zahl.set(g, (zahl.get(g) ?? 0) + 1);
    gerueste.forEach((set, i) => {
      for (const g of set) {
        const anteil = (zahl.get(g) ?? 0) / seiten.length;
        if (anteil > GATE.maxSkeletonShare) melde(seiten[i].place.id, `U4: Satzgerüst auf ${prozent(anteil)} der Seiten: „${g.slice(0, 80)}“`);
      }
    });
  }

  // U5: jede Zahl hat eine Quelle
  for (const { place, page } of seiten) {
    const allowed = belegteZahlen(place, places, jobs);
    const unbelegt = [...new Set(seitenText(page).flatMap(numbersIn))].filter((n) => !allowed.has(n));
    if (unbelegt.length > 0) melde(place.id, `U5: Zahlen ohne Quelle: ${unbelegt.join(', ')}`);
  }

  // U6: keine festen Arbeitszeiten, nur bestehende, unbefristete und bestätigte Fakten
  for (const { place, page } of seiten) {
    const texte = seitenText(page);
    for (const muster of FORBIDDEN_HOURS) if (texte.some((t) => muster.test(t))) melde(place.id, `U6: verbotene Arbeitszeit-Aussage ${muster}`);
    for (const id of seitenFakten(page)) {
      if (!isFactId(id)) melde(place.id, `U6: unbekannter Fakt ${id}`);
      else if (FACTS[id].validUntil) melde(place.id, `U6: befristeter Fakt ${id}`);
    }
  }

  // U7: Verlinkung
  const { graph, depth } = lokalerLinkGraph(
    seiten.map((s) => s.page),
    jobs,
  );
  for (const { place, page } of seiten) {
    const eingehend = [...graph].filter(([source, links]) => source !== page.path && links.has(page.path)).length;
    if (eingehend < GATE.minInboundLinks) melde(place.id, `U7: ${eingehend} eingehende Links (mindestens ${GATE.minInboundLinks})`);
    const tiefe = depth.get(page.path);
    if (tiefe === undefined || tiefe > GATE.maxClickDepth) melde(place.id, `U7: Klicktiefe ${tiefe ?? '∞'} (höchstens ${GATE.maxClickDepth})`);
    const tot = page.links.map((l) => pagePath(l.href)).filter((href) => !graph.has(href));
    if (tot.length > 0) melde(place.id, `U7: Links ohne Seite: ${tot.join(', ')}`);
  }

  // U8: Längen und Eindeutigkeit von Title, Description, h1 und Keyword
  const kreisMetas = getHubKreise().map((kreis) => getKreisPageText(kreis, { jobs }).meta);
  const andere: PageMeta[] = [...kreisMetas, getEinsatzgebietPageText({ jobs }).meta];
  const stellen = ALL_JOBS.flatMap((job) => [job.seo.metaTitle, job.seo.h1, job.seo.metaDescription]);
  const alleMetas = [...seiten.map((s) => s.page.meta), ...andere];
  for (const { place, page } of seiten) {
    const { meta } = page;
    if (meta.title.length > GATE.maxTitle) melde(place.id, `U8: Title ${meta.title.length} Zeichen (höchstens ${GATE.maxTitle})`);
    if (meta.description.length > GATE.maxDescription || meta.description.length < GATE.minDescription || meta.description.endsWith('…')) {
      melde(place.id, `U8: Description ${meta.description.length} Zeichen (${GATE.minDescription}–${GATE.maxDescription}, ohne „…“)`);
    }
    for (const key of ['title', 'description', 'h1'] as const) {
      const gleich = alleMetas.filter((other) => other[key] === meta[key]).length;
      if (gleich > 1 || stellen.includes(meta[key])) melde(place.id, `U8: ${key} nicht eindeutig`);
    }
    const keyword = meta.primaryKeyword.toLowerCase();
    if (alleMetas.filter((other) => other.primaryKeyword.toLowerCase() === keyword).length > 1) melde(place.id, 'U8: Keyword nicht eindeutig');
  }
  return gruende;
}

/**
 * I4 unter den Kandidaten: Solange ein Paar über der Grenze liegt, fällt aus dem ähnlichsten Paar der Ort mit mehr
 * Überschreitungen heraus, bei Gleichstand der weiter entfernte (feste Reihenfolge, kein Zufall). Danach zählen nur die
 * verbliebenen Seiten als Geschwister.
 */
export function aehnlichkeitUnterIndexierbaren(kandidaten: readonly Seite[]): {
  raus: Map<string, string>;
  maxima: Map<string, { ganz: number; ort: number }>;
} {
  const raus = new Map<string, string>();
  let aktiv = [...kandidaten];
  for (;;) {
    const paare: { a: Seite; b: Seite; ganz: number; ort: number; ueber: number }[] = [];
    for (let i = 0; i < aktiv.length; i += 1) {
      for (let j = i + 1; j < aktiv.length; j += 1) {
        const ganz = jaccard(aktiv[i].ganz, aktiv[j].ganz);
        const ort = jaccard(aktiv[i].ort, aktiv[j].ort);
        const ueber = Math.max(ganz - GATE.maxJaccardWholeIndexierbar, ort - GATE.maxJaccardOrtIndexierbar);
        if (ueber > 0) paare.push({ a: aktiv[i], b: aktiv[j], ganz, ort, ueber });
      }
    }
    if (paare.length === 0) break;
    const zaehle = (seite: Seite) => paare.filter((p) => p.a === seite || p.b === seite).length;
    paare.sort((x, y) => y.ueber - x.ueber || compareByDistance(x.a.place, y.a.place) || compareByDistance(x.b.place, y.b.place));
    const { a, b, ganz, ort } = paare[0];
    const weg = zaehle(a) !== zaehle(b) ? (zaehle(a) > zaehle(b) ? a : b) : compareByDistance(a.place, b.place) > 0 ? a : b;
    const anderer = weg === a ? b : a;
    raus.set(
      weg.place.id,
      `I4: zu ähnlich wie ${anderer.place.id} (ganz ${fmt(ganz)}, höchstens ${fmt(GATE.maxJaccardWholeIndexierbar)}; Ortsblöcke ${fmt(ort)}, höchstens ${fmt(GATE.maxJaccardOrtIndexierbar)})`,
    );
    aktiv = aktiv.filter((seite) => seite !== weg);
  }
  const maxima = new Map<string, { ganz: number; ort: number }>();
  for (const seite of kandidaten) {
    const geschwister = aktiv.filter((other) => other !== seite);
    maxima.set(seite.place.id, {
      ganz: Math.max(0, ...geschwister.map((other) => jaccard(seite.ganz, other.ganz))),
      ort: Math.max(0, ...geschwister.map((other) => jaccard(seite.ort, other.ort))),
    });
  }
  return { raus, maxima };
}

/** I2, I3, I5 (Stand der Daten) und I6 für eine Ortsseite; leer, wenn sie besteht. */
export function pruefeDaten(place: Place, page: PlacePageText): string[] {
  const gruende: string[] = [];
  // I2: Datenklassen mit Quelle
  const belege = datenBelege(place).filter((beleg) => beleg.quelle.trim().length > 0);
  if (belege.length < GATE.minDatenKlassen) gruende.push(`I2: ${belege.length} Datenklassen mit Quelle (mindestens ${GATE.minDatenKlassen})`);
  // I3: Wörter und Anteil aus Daten
  const daten = wordCount(datenText(page));
  const ort = wordCount(ortText(page));
  if (daten < GATE.minDatenWoerter) gruende.push(`I3: ${daten} Wörter aus Daten (mindestens ${GATE.minDatenWoerter})`);
  if (ort > 0 && daten / ort < GATE.minDatenAnteil) {
    gruende.push(`I3: ${prozent(daten / ort)} des Ortstexts aus Daten (mindestens ${prozent(GATE.minDatenAnteil)})`);
  }
  // I5 (Stand): Werktag in der Fahrplanperiode und nicht vor dem Stand der Daten; das Datum prüft indexierung.ts
  const { werktag, fahrplanperiode } = OEPNV_META;
  if (place.oepnv && (werktag < fahrplanperiode.von || werktag > fahrplanperiode.bis || OEPNV_QUELLE.stand > werktag)) {
    gruende.push(`I5: Werktag ${werktag} außerhalb der Fahrplanperiode ${fahrplanperiode.von} bis ${fahrplanperiode.bis}`);
  }
  // I6: kein pending-Fakt
  const offen = seitenFakten(page).filter((id) => isFactId(id) && FACTS[id].pending);
  if (offen.length > 0) gruende.push(`I6: unbestätigte Fakten: ${offen.join(', ')}`);
  return gruende;
}

/** Prüft alle veröffentlichten Orte (I1–I6) und liefert je Ort das Ergebnis, in der Reihenfolge der Strecke. */
export function pruefeOrte(optionen: GateOptionen = {}): OrtErgebnis[] {
  const jobs = optionen.jobs ?? getActiveJobs();
  const zurueck = optionen.zurueckgenommen ?? {};
  const seiten = getPublishedPlaces().map((place) => seiteVon(place, getPlacePageText(place, { jobs })));
  const i1 = pruefeEinzigartigkeit(seiten, jobs);

  const vorab = new Map<string, string[]>();
  for (const { place, page } of seiten) {
    const gruende = [...(i1.get(place.id) ?? []), ...pruefeDaten(place, page)];
    // Von Hand zurückgenommen (120-Tage-Regel)
    const zurueckgenommen = zurueck[place.id];
    if (zurueckgenommen) gruende.push(`zurückgenommen seit ${zurueckgenommen.seit}: ${zurueckgenommen.grund}`);
    vorab.set(place.id, gruende);
  }

  const { raus, maxima } = aehnlichkeitUnterIndexierbaren(seiten.filter(({ place }) => vorab.get(place.id)!.length === 0));
  return seiten.map(({ place, page }) => {
    const gruende = [...vorab.get(place.id)!, ...(raus.has(place.id) ? [raus.get(place.id)!] : [])];
    const belege = datenBelege(place);
    const daten = wordCount(datenText(page));
    const ort = wordCount(ortText(page));
    const max = maxima.get(place.id) ?? { ganz: 0, ort: 0 };
    return {
      placeId: place.id,
      indexierbar: gruende.length === 0,
      gruende,
      gueltigBis: belege.length > 0 ? belege.map((beleg) => beleg.gueltigBis).sort()[0] : null,
      werte: {
        datenKlassen: page.datenKlassen,
        datenWoerter: daten,
        datenAnteil: ort > 0 ? daten / ort : 0,
        jaccardGanz: max.ganz,
        jaccardOrt: max.ort,
      },
    };
  });
}

// ─── Lock-Datei ─────────────────────────────────────────────────────────────

export interface IndexierungDatei {
  _kommentar: string;
  gate: string;
  zurueckgenommen: Record<string, Zuruecknahme>;
  orte: Record<string, { indexierbar: boolean; gueltigBis: string | null; gruende: string[] }>;
}

export const INDEXIERUNG_KOMMENTAR =
  'Lock-Datei des Indexierungs-Gates (E-029, ROADMAP §10.1): Je Ortsseite, ob sie indexiert wird, bis wann ihre Daten gelten (I5) und warum sie durchfällt. Erzeugt mit bun run orte:gate aus lib/places/qualitaet.ts; lib/places/__tests__/qualitaet.test.ts erzwingt den Gleichstand. Von Hand nur das Feld zurueckgenommen pflegen (120-Tage-Regel, docs/operations/orte-monitoring.md), danach orte:gate neu laufen lassen.';

/** Inhalt der Lock-Datei aus dem Ergebnis des Gates, Orte nach ID sortiert (stabiler Diff). */
export function indexierungDatei(ergebnisse: readonly OrtErgebnis[], zurueckgenommen: Readonly<Record<string, Zuruecknahme>> = {}): IndexierungDatei {
  const orte: IndexierungDatei['orte'] = {};
  for (const e of [...ergebnisse].sort((a, b) => a.placeId.localeCompare(b.placeId))) {
    orte[e.placeId] = { indexierbar: e.indexierbar, gueltigBis: e.gueltigBis, gruende: e.gruende };
  }
  const zurueck: Record<string, Zuruecknahme> = {};
  for (const id of Object.keys(zurueckgenommen).sort()) zurueck[id] = { ...zurueckgenommen[id] };
  return { _kommentar: INDEXIERUNG_KOMMENTAR, gate: 'lib/places/qualitaet.ts', zurueckgenommen: zurueck, orte };
}
