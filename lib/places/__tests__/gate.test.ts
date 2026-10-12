import { describe, expect, it } from 'vitest';
import { HOME_KEYWORDS, HOME_TITLE, homeDescription } from '@/components/home/content';
import { FACTS, FACT_IDS, isFactId } from '@/lib/content/facts';
import { formatNumber } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs } from '@/lib/jobs/registry';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  DIRECTIONS,
  DIRECTION_ADVERBS,
  DISTANCE_BAND_KM,
  RING_RADII_KM,
  compareToMedian,
  directionFromHeadquarters,
  groupStats,
  kreisStats,
  neighborsOf,
  rankByDistance,
  roadBandCounts,
  roadBandFloorKm,
  roadBandKm,
} from '../derive';
import { MEASUREMENT } from '../measurement';
import {
  EINSATZGEBIET_PATH,
  getHubKreise,
  getKreise,
  getPlaceKreis,
  getPublishedPlaces,
  getStadtteile,
  kreisPath,
  placePath,
} from '../registry';
import { MAX_ROAD_KM, type Place } from '../schema';
import {
  getEinsatzgebietPageText,
  getKreisPageText,
  getPlacePageText,
  sectionText,
  type PlacePageText,
  type TextSection,
} from '../text';
import { jaccard, maxSkeletonShare, numbersIn, sentences, shingles, skeleton, wordCount } from './gate-metrics';

/**
 * Einzigartigkeits-Gate der Ortsseiten (Plan „Einzigartigkeits-Gate“, U1–U8). Läuft auf dem Textmodell aller
 * veröffentlichten Orte. Besteht ein Ort nicht, bekommt er status 'merged' mit Grund und geht in der Kreis- bzw.
 * Gebietsseite auf; die Grenzwerte werden nie gelockert, um einen Ort zu halten.
 *
 * Gemessen am 2026-10-12 (55 Orte): Jaccard ganz max 0,368, nur `ort` max 0,210, `ort` min 146 Wörter und min
 * 64,9 % des Haupttexts, häufigstes Satzgerüst auf 25,5 % der Seiten (nur Ortsname ersetzt) bzw. 27,3 % (alle
 * Namen, Kreise und Richtungen ersetzt). Alle Werte liegen unter den Planwerten; keiner musste kalibriert werden.
 */
const GATE = Object.freeze({
  /** U1: eigene Werte je Seite. */
  minValues: 8,
  /** U2: Wörter in `ort`-Blöcken und ihr Anteil am Haupttext (ort + gemeinsam). */
  minOrtWords: 90,
  minOrtShare: 0.35,
  /** U3: Jaccard über 5-Wort-Shingles je Seitenpaar. */
  maxJaccardWhole: 0.45,
  maxJaccardOrt: 0.3,
  /** U4: Anteil der Seiten mit demselben `ort`-Satzgerüst, in beiden Lesarten (siehe unten). */
  maxSkeletonShare: 0.3,
  /** U7: eingehende Links je Orts- und Kreisseite, Klicktiefe ab der Startseite. */
  minInboundLinks: 3,
  maxClickDepth: 3,
});

/** Verbotene Arbeitszeit-Aussagen (fakten-abgleich B28): nur flexibleHours gilt. */
const FORBIDDEN = [/13[:.]30/, /16[:.]45/, /pünktlich/i, /feste arbeitszeit/i, /35[\s -]*(?:std|stunden)/i, /feierabend/i];

const jobs = getActiveJobs();
const places = getPublishedPlaces();
const pages: PlacePageText[] = places.map((place) => getPlacePageText(place, { jobs }));
const byId = new Map(places.map((place, i) => [place.id, { place, page: pages[i] }]));
const kreisPages = getHubKreise().map((kreis) => getKreisPageText(kreis, { jobs }));
const hubPage = getEinsatzgebietPageText({ jobs });

const ortText = (page: PlacePageText) => sectionText(page.sections, 'ort');
const wholeText = (page: PlacePageText) => sectionText(page.sections);
const allText = (sections: readonly TextSection[]) => sectionText(sections);

const eachPage = places.map((place, i) => [place.id, place, pages[i]] as const);

describe('Gate U1: eigene Werte', () => {
  it.each(eachPage)('%s zeigt ≥ 8 eigene Werte', (_id, _place, page) => {
    const surface = [wholeText(page), page.etikett, ...page.unterzeile, ...page.masse.map((m) => m.wert)].join(' ');
    expect(page.values.length).toBeGreaterThanOrEqual(GATE.minValues);
    for (const value of page.values) expect(surface, `${page.placeId}: ${value.label}`).toContain(value.value);
    const labels = page.values.map((v) => v.label);
    for (const label of ['Strecke', 'Fahrzeit', 'Luftlinie', 'Richtung', 'PLZ', 'Kreis', 'Nachbar 1', 'Abstand 1', 'Nachbar 2', 'Abstand 2']) {
      expect(labels).toContain(label);
    }
  });

  it('keine zwei Seiten haben dieselbe Wertekombination', () => {
    const keys = pages.map((page) => page.values.map((v) => v.value).join('|'));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Gate U2: Anteil Ortstext', () => {
  it.each(eachPage)('%s: ort ≥ 90 Wörter und ≥ 35 % des Haupttexts', (_id, _place, page) => {
    const ort = wordCount(ortText(page));
    const whole = wordCount(wholeText(page));
    expect(ort).toBeGreaterThanOrEqual(GATE.minOrtWords);
    expect(ort / whole).toBeGreaterThanOrEqual(GATE.minOrtShare);
  });
});

describe('Gate U3: Ähnlichkeit je Seitenpaar', () => {
  it('Jaccard (5-Wort-Shingles) ≤ 0,45 ganz und ≤ 0,30 nur Ortsblöcke', () => {
    const whole = pages.map((page) => shingles(wholeText(page)));
    const ort = pages.map((page) => shingles(ortText(page)));
    const tooSimilar: string[] = [];
    for (let i = 0; i < pages.length; i += 1) {
      for (let j = i + 1; j < pages.length; j += 1) {
        const w = jaccard(whole[i], whole[j]);
        const o = jaccard(ort[i], ort[j]);
        if (w > GATE.maxJaccardWhole || o > GATE.maxJaccardOrt) {
          tooSimilar.push(`${places[i].id}/${places[j].id}: ganz ${w.toFixed(3)}, ort ${o.toFixed(3)}`);
        }
      }
    }
    expect(tooSimilar).toEqual([]);
  });
});

describe('Gate U4: keine Vorlagensätze', () => {
  const ortSentences = pages.map((page) => sentences(ortText(page)));

  it('Lesart des Plans: Ortsname und Zahlen ersetzt, kein Satz auf mehr als 30 % der Seiten', () => {
    const skeletons = ortSentences.map((list, i) => list.map((s) => skeleton(s, [places[i].name])));
    const worst = maxSkeletonShare(skeletons);
    expect(worst.share, worst.skeleton).toBeLessThanOrEqual(GATE.maxSkeletonShare);
  });

  it('strenge Lesart: alle Orts-, Messpunkt- und Kreisnamen, Richtungen und Zahlen ersetzt', () => {
    const names = [...new Set(places.flatMap((p) => [p.name, ...(p.seat ? [p.seat] : [])]))];
    const kreisForms = getKreise().flatMap((k) => [k.genitive.replace(/^des /, ''), k.name, k.shortName]);
    const directionWords = [...DIRECTIONS, ...Object.values(DIRECTION_ADVERBS)];
    const strict = (sentence: string) =>
      skeleton(skeleton(skeleton(sentence, names), kreisForms, '⟨KREIS⟩'), directionWords, '⟨RICHTUNG⟩');
    const worst = maxSkeletonShare(ortSentences.map((list) => list.map(strict)));
    expect(worst.share, worst.skeleton).toBeLessThanOrEqual(GATE.maxSkeletonShare);
  });
});

/** Zahlen, wie die Texte sie schreiben: ganze Zahlen nach formatNumber, Luftlinien mit einer Nachkommastelle. */
function addNumber(set: Set<string>, value: number): void {
  set.add(formatNumber(value));
  set.add(value.toFixed(1).replace('.', ','));
}

/** Allowlist einer Ortsseite, unabhängig vom Text aus Daten, derive, Fakten und Stellen gebaut. */
function allowedNumbers(place: Place): Set<string> {
  const allowed = new Set<string>();
  const add = (...values: number[]) => values.forEach((v) => addNumber(allowed, v));
  const addFrom = (text: string) => numbersIn(text).forEach((n) => allowed.add(n));

  // Gebiet und Messung
  add(MAX_ROAD_KM, ...RING_RADII_KM, ...RING_RADII_KM.map(roadBandFloorKm), ...Object.values(DISTANCE_BAND_KM), places.length, getKreise().length);
  addFrom(MEASUREMENT.measuredOn.split('-').map(Number).join(' '));
  addFrom(`${SITE_CONFIG.headquarters.streetAddress} ${SITE_CONFIG.headquarters.postalCode}`);
  // Fakten und Stellen
  for (const id of FACT_IDS) addFrom(`${FACTS[id].short} ${FACTS[id].long} ${FACTS[id].value ?? ''}`);
  add(jobs.length);
  for (const job of jobs) if (job.salary) add(job.salary.min, job.salary.max);
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
  for (const n of neighborsOf(place, places)) {
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
  return allowed;
}

describe('Gate U5: jede Zahl hat eine Quelle', () => {
  it.each(eachPage)('%s nennt nur belegte Zahlen', (_id, place, page) => {
    const allowed = allowedNumbers(place);
    const text = [wholeText(page), page.meta.title, page.meta.description, page.meta.h1, page.etikett, ...page.unterzeile, ...page.masse.map((m) => m.wert)].join(' ');
    const unknown = numbersIn(text).filter((n) => !allowed.has(n));
    expect(unknown, `${page.placeId}: Zahlen ohne Quelle`).toEqual([]);
  });

  it('Kreis-Hubs und Gebietsseite nennen nur belegte Zahlen', () => {
    const allowed = new Set<string>();
    for (const place of places) for (const n of allowedNumbers(place)) allowed.add(n);
    for (const kreis of getKreise()) {
      const group = kreisStats(kreis.id, places);
      [group.count, group.medianMinutes, group.medianKm].forEach((v) => addNumber(allowed, v));
      Object.values(roadBandCounts(group.places)).forEach((v) => addNumber(allowed, v));
    }
    const area = groupStats(places);
    addNumber(allowed, area.medianMinutes);
    addNumber(allowed, area.medianKm);
    Object.values(roadBandCounts(places)).forEach((v) => addNumber(allowed, v));
    addNumber(allowed, getHubKreise().length);
    // Dazu Etikett, Maße und Zweitweg im Seitenkopf (E-028)
    const texts = [...kreisPages, hubPage].map((page) =>
      [allText(page.sections), page.meta.title, page.meta.description, page.meta.h1, page.etikett, page.zweitweg.label, ...page.masse.flatMap((m) => [m.wert, m.name])].join(' '),
    );
    texts.push(...hubPage.kleineKreise.map((section) => allText([section])));
    const unknown = texts.flatMap((text) => numbersIn(text)).filter((n) => !allowed.has(n));
    expect(unknown).toEqual([]);
  });
});

describe('Gate U6: nur bestätigte Fakten, keine festen Arbeitszeiten', () => {
  const everyText = [
    ...pages.flatMap((page) => [wholeText(page), page.meta.title, page.meta.description, page.meta.h1, page.etikett, ...page.unterzeile, page.whatsappGreeting]),
    ...kreisPages.flatMap((page) => [
      allText(page.sections),
      page.meta.title,
      page.meta.description,
      page.meta.h1,
      page.etikett,
      page.whatsappGreeting,
      ...page.masse.flatMap((m) => [m.wert, m.name]),
    ]),
    ...pages.map((page) => page.routeLabel),
    hubPage.etikett,
    ...hubPage.masse.flatMap((m) => [m.wert, m.name]),
    allText(hubPage.sections),
    ...hubPage.kleineKreise.map((section) => allText([section])),
    hubPage.meta.title,
    hubPage.meta.description,
    hubPage.meta.h1,
  ];

  it('keine verbotenen Arbeitszeit-Aussagen', () => {
    for (const text of everyText) for (const pattern of FORBIDDEN) expect(text, String(pattern)).not.toMatch(pattern);
  });

  it('jeder Fakt-Block verweist auf einen bestehenden, unbefristeten und freigegebenen Fakt', () => {
    const sections = [...pages.flatMap((p) => p.sections), ...kreisPages.flatMap((p) => p.sections), ...hubPage.sections];
    const ids = sections.flatMap((s) => s.blocks.flatMap((b) => b.factIds ?? []));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(isFactId(id), id).toBe(true);
      expect(FACTS[id].validUntil, id).toBeUndefined();
      expect(FACTS[id].pending, id).toBeUndefined();
    }
    for (const page of pages) for (const id of page.bandFactIds) expect(FACT_IDS).toContain(id);
  });
});

describe('Gate U7: Verlinkung', () => {
  /** Die Startseite verlinkt die Gebietsseite („Alle Orte im Einsatzgebiet“, Plan „Interne Links“). */
  const HOME_LINKS = [EINSATZGEBIET_PATH];
  const pagePath = (href: string) => href.split('#')[0];

  const graph = new Map<string, Set<string>>();
  graph.set('/', new Set(HOME_LINKS));
  for (const page of pages) graph.set(page.path, new Set(page.links.map((l) => pagePath(l.href))));
  for (const page of kreisPages) graph.set(page.path, new Set(page.links.map((l) => pagePath(l.href))));
  graph.set(hubPage.path, new Set(hubPage.links.map((l) => pagePath(l.href))));

  it('jede Orts- und Kreisseite hat ≥ 3 eingehende Links von anderen Seiten', () => {
    const targets = [...pages.map((p) => p.path), ...kreisPages.map((p) => p.path)];
    for (const target of targets) {
      const sources = [...graph].filter(([source, links]) => source !== target && links.has(target)).length;
      expect(sources, target).toBeGreaterThanOrEqual(GATE.minInboundLinks);
    }
  });

  it('jede Seite ist von / in ≤ 3 Klicks erreichbar, jeder Link zeigt auf eine bestehende Seite', () => {
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
    for (const path of graph.keys()) {
      expect(depth.get(path), path).toBeDefined();
      expect(depth.get(path)!, path).toBeLessThanOrEqual(GATE.maxClickDepth);
    }
    for (const links of graph.values()) for (const link of links) expect(graph.has(link), link).toBe(true);
  });

  it('Kreise ohne Hub sind ein Abschnitt der Gebietsseite', () => {
    const anchors = hubPage.kleineKreise.map((s) => s.id);
    for (const kreis of getKreise().filter((k) => !k.hasHub)) {
      expect(anchors).toContain(kreis.slug);
      expect(kreisPath(kreis)).toBe(`${EINSATZGEBIET_PATH}#${kreis.slug}`);
    }
  });
});

describe('Gate U8: eindeutige Titel, Descriptions und h1', () => {
  // Titel und h1 der bestehenden Seiten: /jobs und /bewerbung definieren sie in der Seite selbst (app/…/page.tsx,
  // nicht exportiert), darum hier wörtlich; Startseite und Stellen kommen aus ihren Modulen.
  const EXISTING_TITLES = [
    HOME_TITLE,
    'Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs',
    `Bewerben in ${FACTS.apply60s.value} Sekunden – ohne Lebenslauf | Bad & Energie`,
    ...ALL_JOBS.map((job) => job.seo.metaTitle),
  ];
  const EXISTING_H1 = ['Offene Stellen in Wetzlar und Umgebung', ...ALL_JOBS.map((job) => job.seo.h1)];
  const EXISTING_DESCRIPTIONS = [homeDescription(jobs), jobsHubDescription(jobs), ...ALL_JOBS.map((job) => job.seo.metaDescription)];

  const metas = [...pages.map((p) => p.meta), ...kreisPages.map((p) => p.meta), hubPage.meta];

  it('Title ≤ 60, Description ≤ 155 Zeichen', () => {
    for (const meta of metas) {
      expect(meta.title.length, meta.title).toBeLessThanOrEqual(60);
      expect(meta.description.length, meta.description).toBeLessThanOrEqual(155);
      expect(meta.description.length, meta.description).toBeGreaterThanOrEqual(50);
      expect(meta.description.endsWith('…'), meta.description).toBe(false);
    }
  });

  it.each([
    ['title', EXISTING_TITLES],
    ['description', EXISTING_DESCRIPTIONS],
    ['h1', EXISTING_H1],
  ] as const)('%s eindeutig über alle Orts-, Kreis- und bestehenden Seiten', (key, existing) => {
    const values = metas.map((meta) => meta[key]);
    expect(new Set(values).size).toBe(values.length);
    for (const value of values) expect(existing, value).not.toContain(value);
  });

  it('Keywords eindeutig; das Startseiten-Keyword „SHK Jobs Wetzlar“ bleibt bei der Startseite', () => {
    const keywords = metas.map((meta) => meta.primaryKeyword.toLowerCase());
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(keywords).not.toContain(HOME_KEYWORDS[0].toLowerCase());
    const wetzlar = byId.get('wetzlar')!.page.meta;
    for (const text of [wetzlar.title, wetzlar.h1, wetzlar.primaryKeyword]) expect(text).not.toMatch(/SHK[\s-]Jobs/i);
  });

  it('jeder Ort gehört zu einem Kreis mit Text', () => {
    for (const place of places) expect(getPlaceKreis(place).name.length).toBeGreaterThan(3);
    expect(placePath(places[0])).toMatch(/^\/einsatzgebiet\//);
  });
});
