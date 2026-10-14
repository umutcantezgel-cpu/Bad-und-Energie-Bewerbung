#!/usr/bin/env node
/**
 * Bus und Bahn für die Ortsseiten (Plan §B, Paket W2a). Läuft nur von Hand, nie im Build oder zur Laufzeit;
 * das Ergebnis wird committet: lib/places/data/oepnv.json. Protokoll, Parameter und Gegenprobe:
 * scripts/places/README.md.
 *
 * Methode:
 * 1. Fahrplan: GTFS von gtfs.de (CC BY 4.0, Datenbasis DELFI e.V.), „Deutschland Nahverkehr“ (Bus, Tram) und
 *    „Deutschland Regionalverkehr“ (RB, RE, S-Bahn), je als ZIP-Pfad übergeben. Gelesen wird nur ein Rechteck um
 *    den Firmensitz (35 km Einsatzgebiet + 15 km Rand) und nur ein Werktag (--datum, Standard WERKTAG) samt den
 *    Nachtfahrten des Vortags. Fernverkehr (IC, ICE) bleibt außen vor.
 * 2. Routing mit RAPTOR (scripts/places/raptor.mjs): Start an den Haltestellen um den Messpunkt des Orts
 *    (lib/places/data/messung.json), Ziel die Haltestellen um den Firmensitz bzw. um die Berufsschule
 *    (lib/places/data/berufsschule.json). Fußwege und Umstiege nach den Werten in raptor.mjs.
 * 3. Je Ort und Ziel: späteste Verbindung mit Ankunft am Ziel (Haltestelle + Fußweg) bis 07:30 (Betrieb) bzw.
 *    07:45 (Schule), Fahrzeit, Umstiege, Linien und die Zahl der Verbindungen mit Ankunft 06:00–08:00.
 *    Ohne Verbindung steht `moeglich: false` mit Grund – auch das ist eine Auskunft.
 *
 * Nutzung:
 *   node scripts/places/oepnv.mjs --gtfs <pfad/de_nv.zip> --gtfs <pfad/de_rv.zip> [--datum 2026-10-27]
 *     [--stand 2026-10-10] [--cache <ordner>] [--aus <datei>]
 * Die ZIPs sind fremde Eingabe: nur lesen und parsen, nie entpacken oder ausführen. Mit --cache landet der
 * gefilterte Tagesfahrplan als JSON in diesem Ordner (außerhalb des Repos) und spart beim nächsten Lauf das
 * Lesen von stop_times.txt (über 2 GB entpackt).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  activeServiceIds,
  feedPeriod,
  formatClock,
  parseGtfsTime,
  readGtfsTable,
  readZipDirectory,
  shiftIsoDate,
} from './gtfs.mjs';
import {
  GEH_M_PRO_MIN,
  MAX_FAHRTEN,
  UMSTIEG_MAX_M,
  UMSTIEG_MIN_S,
  UMSTIEG_PUFFER_S,
  UMWEG_FAKTOR,
  baueFahrplan,
  gehSekundenWeg,
  haversineM,
  nichtUeberholt,
  verbindungsprofil,
} from './raptor.mjs';
import { oeffneCache, wegelaengen } from './fusswege.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MESSUNG = path.join(ROOT, 'lib/places/data/messung.json');
const BERUFSSCHULE = path.join(ROOT, 'lib/places/data/berufsschule.json');
const OUT_JSON = path.join(ROOT, 'lib/places/data/oepnv.json');

/**
 * Repräsentativer Werktag: Dienstag in der Mitte der Fahrplanperiode (10.10.–09.11.2026), nach den hessischen
 * Herbstferien (05.–17.10.2026, Schulbusse fahren), nach der Zeitumstellung (25.10.) und an keinem Feiertag.
 * Der 10.11.2026 aus dem Auftrag liegt hinter dem Ende der Periode, dort fährt laut Datensatz nichts.
 */
export const WERKTAG = '2026-10-27';
/** Einsatzgebiet (Fakt radius35) plus Rand, damit Wege über Orte knapp außerhalb möglich bleiben. */
export const RECHTECK_KM = 35 + 15;
/** Fahrten, die in diesem Fenster (Sekunden ab Mitternacht) mindestens einmal halten, kommen in den Tagesfahrplan. */
export const FENSTER = { vonS: 3 * 3600, bisS: 10 * 3600 };

/** Ankunft am Betrieb (Haltestelle + Fußweg) spätestens um 07:30. */
export const ANKUNFT_BETRIEB_S = 7 * 3600 + 30 * 60;
/** Zählfenster für die Verbindungen am Morgen: Ankunft am Ziel zwischen 06:00 und 08:00. */
export const ZAEHLFENSTER = { vonS: 6 * 3600, bisS: 8 * 3600 };
/** Frühestes Losgehen ab Ortsmitte: keine Verbindungen aus der Nacht. */
export const FRUEHESTES_LOSGEHEN_S = 4 * 3600;

/** Start-Haltestellen: alle bis zu dieser Luftlinie um den Messpunkt des Orts … */
export const ZUGANG_MAX_M = 1200;
/** … und ohne eine solche die nächste bis zu dieser Luftlinie. */
export const ZUGANG_NOTFALL_M = 2500;
/** Start-Haltestellen mit längerem Fußweg auf dem Wegenetz fallen weg (≈ 25 Min. zu Fuß). */
export const ZUGANG_MAX_WEG_M = 2000;
/** Ziel-Haltestellen: alle bis zu dieser Luftlinie um den Firmensitz bzw. die Schule … */
export const ZIEL_MAX_M = 600;
/** … mit höchstens so langem Fußweg auf dem Wegenetz (≈ 12 Min.). */
export const ZIEL_MAX_WEG_M = 1000;
/** Umstieg an einem Bahnhof: höchstens so langer Weg auf dem Wegenetz (≈ 10 Min.). */
export const UMSTIEG_MAX_WEG_M = 800;
/** Direkter Fußweg wird mit ausgegeben, wenn der Ort so nah am Ziel liegt (Luftlinie). */
export const DIREKT_ZU_FUSS_MAX_M = 3000;
/** So viele Start-Haltestellen (verschiedene Namen) nennt die Datei je Ort. */
export const START_HALTESTELLEN = 3;

const QUELLE = Object.freeze({
  name: 'GTFS Deutschland Nahverkehr und Deutschland Regionalverkehr',
  herausgeber: 'gtfs.de – GTFS für Deutschland, Daten bereitgestellt von DELFI e.V.',
  urls: ['https://download.gtfs.de/germany/nv_free/latest.zip', 'https://download.gtfs.de/germany/rv_free/latest.zip'],
  lizenz: 'CC BY 4.0',
  lizenzUrl: 'https://creativecommons.org/licenses/by/4.0/deed.de',
  namensnennung: '© gtfs.de, CC BY 4.0, Datenbasis DELFI e.V. und OpenStreetMap-Mitwirkende',
  /** CC BY 4.0 verlangt den Hinweis auf Änderungen. */
  bearbeitung: 'Auf das Gebiet um Wetzlar und einen Werktag gefiltert und mit eigenem Routing ausgewertet (scripts/places/oepnv.mjs)',
});

const FUSSWEGE_QUELLE = Object.freeze({
  dienst: 'OSRM, Profil Fuß (routing.openstreetmap.de, FOSSGIS e.V.)',
  daten: '© OpenStreetMap-Mitwirkende, ODbL',
  methode:
    'Wegelänge Ortsmitte → Start-Haltestelle, Ziel-Haltestelle → Firmensitz bzw. Schule und Umstiege an Bahnhöfen; übrige Umstiege zwischen Haltestellen über die Luftlinie mit Umwegzuschlag',
});

/** Verkehrsmittel nach GTFS route_type (einfach und erweitert, Europe Extended Route Types). */
export function verkehrsmittel(routeType) {
  const t = Number(routeType);
  if (t === 2 || (t >= 100 && t < 200)) return 'bahn';
  if (t === 0 || t === 900 || (t > 900 && t < 1000)) return 'tram';
  if (t === 1 || (t >= 400 && t < 500)) return 'u-bahn';
  if (t === 715 || t === 1500 || t === 1501 || t === 1502) return 'bedarf';
  if (t === 3 || (t >= 200 && t < 300) || (t >= 700 && t < 800)) return 'bus';
  if (t === 4 || t === 1000 || t === 1200) return 'faehre';
  return 'sonstige';
}

export function parseArgs(argv) {
  const args = { gtfs: [], datum: WERKTAG, aus: OUT_JSON };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--gtfs') args.gtfs.push(value);
    else if (key === '--datum') args.datum = value;
    else if (key === '--cache') args.cache = value;
    else if (key === '--stand') args.stand = value;
    else if (key === '--aus') args.aus = value;
    else throw new Error(`Unbekannte Option ${key}`);
    i++;
  }
  if (args.gtfs.length === 0) throw new Error('Pfad zur GTFS-ZIP fehlt: --gtfs <pfad/de_nv.zip> [--gtfs <pfad/de_rv.zip>]');
  for (const [name, value] of [['--datum', args.datum], ['--stand', args.stand]]) {
    if (value !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${name} ${value}: Format JJJJ-MM-TT`);
  }
  return args;
}

/** Rechteck um einen Punkt (± km in Nord-Süd und Ost-West). */
export function rechteck(mitte, km) {
  const dLat = km / 111.32;
  const dLng = km / (111.32 * Math.cos((mitte.lat * Math.PI) / 180));
  return { minLat: mitte.lat - dLat, maxLat: mitte.lat + dLat, minLng: mitte.lng - dLng, maxLng: mitte.lng + dLng };
}

const imRechteck = (box, lat, lng) => lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
const log = (text) => process.stderr.write(`${text}\n`);

/**
 * Ein GTFS-Feed, gefiltert auf Rechteck und Werktag: Haltepositionen, Linien und Fahrten mit ihren Halten im
 * Rechteck. Linien-, Verkehrstage- und Fahrten-IDs gelten nur innerhalb des Feeds (gtfs.de vergibt sie je Feed
 * neu) und bekommen darum den Feed-Schlüssel vorangestellt.
 */
async function leseFeed(zip, datum, box, nummer) {
  const entries = readZipDirectory(zip);
  const feedInfo = [];
  await readGtfsTable(zip, entries, 'feed_info.txt', (row) => feedInfo.push(row));
  const version = feedInfo[0]?.feed_version ?? `feed-${nummer}`;
  const key = /-(\w+)-free$/.exec(version)?.[1] ?? `f${nummer}`;
  const attributions = [];
  if (entries.has('attributions.txt')) await readGtfsTable(zip, entries, 'attributions.txt', (row) => attributions.push(row));

  const calendar = [];
  const calendarDates = [];
  await readGtfsTable(zip, entries, 'calendar.txt', (row) => calendar.push(row));
  await readGtfsTable(zip, entries, 'calendar_dates.txt', (row) => calendarDates.push(row));
  const periode = feedPeriod(calendar, calendarDates);
  if (datum < periode.start || datum > periode.end) {
    throw new Error(`${version}: --datum ${datum} liegt außerhalb der Fahrplanperiode ${periode.start} bis ${periode.end}`);
  }
  const heute = activeServiceIds(calendar, calendarDates, datum);
  const vortag = activeServiceIds(calendar, calendarDates, shiftIsoDate(datum, -1));
  log(`${version}: Periode ${periode.start} bis ${periode.end}; Verkehrstage am ${datum}: ${heute.size}, am Vortag: ${vortag.size}`);

  const stationsname = new Map();
  const halte = new Map();
  await readGtfsTable(zip, entries, 'stops.txt', (row) => {
    const lat = Number(row.stop_lat);
    const lng = Number(row.stop_lon);
    if (!imRechteck(box, lat, lng)) return;
    if (row.location_type === '1') stationsname.set(row.stop_id, row.stop_name.trim());
    else if (row.location_type === '' || row.location_type === '0') {
      halte.set(row.stop_id, { id: row.stop_id, name: row.stop_name.trim(), station: row.parent_station || null, lat, lng });
    }
  });
  for (const halt of halte.values()) halt.name = (halt.station && stationsname.get(halt.station)) || halt.name;

  const linien = new Map();
  await readGtfsTable(zip, entries, 'routes.txt', (row) => {
    linien.set(row.route_id, {
      id: `${key}:${row.route_id}`,
      short: row.route_short_name.trim(),
      long: row.route_long_name.trim(),
      type: Number(row.route_type),
    });
  });

  /** trip_id → { route, versatz }: 0 für den Werktag, −86400 für Fahrten des Vortags nach Mitternacht. */
  const fahrten = new Map();
  await readGtfsTable(zip, entries, 'trips.txt', (row) => {
    const versatz = [];
    if (heute.has(row.service_id)) versatz.push(0);
    if (vortag.has(row.service_id)) versatz.push(-86400);
    if (versatz.length) fahrten.set(row.trip_id, { route: row.route_id, versatz });
  });

  const halteJeFahrt = new Map();
  let gelesen = 0;
  await readGtfsTable(
    zip,
    entries,
    'stop_times.txt',
    (row) => {
      gelesen++;
      if (!halte.has(row.stop_id)) return;
      const arr = parseGtfsTime(row.arrival_time);
      const dep = parseGtfsTime(row.departure_time);
      if (arr === null && dep === null) return;
      if (!halteJeFahrt.has(row.trip_id)) halteJeFahrt.set(row.trip_id, []);
      halteJeFahrt
        .get(row.trip_id)
        .push([Number(row.stop_sequence), row.stop_id, arr ?? dep, dep ?? arr, row.pickup_type !== '1', row.drop_off_type !== '1']);
    },
    (header) => {
      // Schnellfilter vor dem Zerlegen: nur Fahrten des Tages (bei gtfs.de steht trip_id in der ersten Spalte).
      if (header[0] !== 'trip_id') return null;
      return (line) => fahrten.has(line.slice(0, line.indexOf(',')));
    },
  );

  const trips = [];
  for (const [tripId, liste] of [...halteJeFahrt.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    liste.sort((a, b) => a[0] - b[0]);
    const fahrt = fahrten.get(tripId);
    for (const versatz of fahrt.versatz) {
      const arr = liste.map((h) => h[2] + versatz);
      const dep = liste.map((h) => h[3] + versatz);
      const imFenster = (t) => t >= FENSTER.vonS && t <= FENSTER.bisS;
      if (!arr.some(imFenster) && !dep.some(imFenster)) continue;
      if (arr.some((t) => t < 0)) continue;
      trips.push({
        id: `${key}:${tripId}${versatz === 0 ? '' : '@vortag'}`,
        route: linien.get(fahrt.route),
        stopIds: liste.map((h) => h[1]),
        arr,
        dep,
        board: liste.map((h) => h[4]),
        alight: liste.map((h) => h[5]),
      });
    }
  }
  log(`${version}: ${gelesen} Halte des Tages gelesen, ${trips.length} Fahrten im Rechteck und im Fenster`);
  return { key, version, publisher: feedInfo[0]?.feed_publisher_name ?? '', attributions, periode, halte, trips };
}

/**
 * Tagesfahrplan aus einer oder mehreren GTFS-ZIPs: Haltepositionen im Rechteck (gleiche stop_id und gleiche Lage
 * in mehreren Feeds = dieselbe Haltestelle), Linien und jede Fahrt des Werktags (bzw. die Nachtfahrt des Vortags,
 * Zeiten − 24 h), die im Rechteck hält und im FENSTER unterwegs ist – gekürzt auf ihre Halte im Rechteck.
 */
export async function leseTagesfahrplan(zips, datum, mitte) {
  const box = rechteck(mitte, RECHTECK_KM);
  const feeds = [];
  const stops = [];
  const stopIndex = new Map();
  const routes = [];
  const routeIndex = new Map();
  const trips = [];

  for (const [nummer, zip] of zips.entries()) {
    const feed = await leseFeed(zip, datum, box, nummer);
    feeds.push({ version: feed.version, publisher: feed.publisher, periode: feed.periode, attributions: feed.attributions });
    const lokal = new Map();
    const index = (stopId) => {
      if (lokal.has(stopId)) return lokal.get(stopId);
      const halt = feed.halte.get(stopId);
      let id = stopId;
      const vorhanden = stopIndex.get(id);
      if (vorhanden !== undefined && haversineM(stops[vorhanden], halt) > 10) id = `${feed.key}:${stopId}`;
      if (!stopIndex.has(id)) {
        stopIndex.set(id, stops.length);
        stops.push({ id, name: halt.name, lat: halt.lat, lng: halt.lng });
      }
      lokal.set(stopId, stopIndex.get(id));
      return stopIndex.get(id);
    };
    for (const trip of feed.trips) {
      if (!routeIndex.has(trip.route.id)) {
        routeIndex.set(trip.route.id, routes.length);
        routes.push(trip.route);
      }
      const { stopIds, route, ...rest } = trip;
      trips.push({ ...rest, route: routeIndex.get(route.id), stops: stopIds.map(index) });
    }
  }
  const periode = {
    start: feeds.map((f) => f.periode.start).sort().at(-1),
    end: feeds.map((f) => f.periode.end).sort()[0],
  };
  log(`Tagesfahrplan ${datum}: ${stops.length} Haltepositionen, ${routes.length} Linien, ${trips.length} Fahrten`);
  return { datum, periode, feeds, box, stops, routes, trips };
}

export async function ladeTagesfahrplan(args, mitte) {
  const cacheDatei = args.cache ? path.join(args.cache, `tagesfahrplan-${args.datum}-${args.gtfs.length}feeds.json`) : null;
  if (cacheDatei && fs.existsSync(cacheDatei)) return JSON.parse(fs.readFileSync(cacheDatei, 'utf8'));
  const netz = await leseTagesfahrplan(args.gtfs, args.datum, mitte);
  if (cacheDatei) {
    fs.mkdirSync(args.cache, { recursive: true });
    fs.writeFileSync(cacheDatei, JSON.stringify(netz));
  }
  return netz;
}

const minuten = (sekunden) => Math.round(sekunden / 60);
/** Minute der angezeigten Uhrzeit (formatClock schneidet Sekunden ab). */
const uhrMinute = (sekunden) => Math.floor(sekunden / 60);
const aufZehn = (m) => Math.round(m / 10) * 10;

/** Linienname für die Ausgabe: Kurzname, sonst Langname. */
function linienname(route) {
  return (route.short || route.long || route.id).replace(/\s+/g, ' ');
}

/**
 * Haltestellen um einen Punkt mit Fußweg: Kandidaten nach Luftlinie, Gehzeit nach der Wegelänge auf dem Wegenetz
 * (fusswege.mjs). Ohne Weg im Netz (null) gilt die Luftlinie mit Umwegzuschlag; liegt der Weg über `maxWegM`,
 * fällt die Haltestelle weg (z. B. ein Ufer ohne Brücke).
 */
export function mitFussweg(kandidaten, laengen, maxWegM) {
  return kandidaten
    .map((k, i) => {
      const wegM = laengen[i] ?? k.m * UMWEG_FAKTOR;
      return { stop: k.stop, m: k.m, wegM, s: gehSekundenWeg(wegM) };
    })
    .filter((k) => k.wegM <= maxWegM);
}

/** Start-Kandidaten: alle Haltepositionen bis ZUGANG_MAX_M Luftlinie, ohne solche die nächste bis ZUGANG_NOTFALL_M. */
export function zugangKandidaten(fahrplan, punkt) {
  const treffer = fahrplan.inDerNaehe(punkt, ZUGANG_MAX_M);
  return treffer.length ? treffer : fahrplan.inDerNaehe(punkt, ZUGANG_NOTFALL_M).slice(0, 1);
}

/** Haltestellen zusammengefasst nach Namen (Steige derselben Haltestelle zählen einmal), nach Fußweg. */
function nachNamen(fahrplan, halte) {
  const namen = new Map();
  for (const h of halte) {
    const name = fahrplan.netz.stops[h.stop].name;
    if (!namen.has(name) || h.s < namen.get(name).s || (h.s === namen.get(name).s && h.wegM < namen.get(name).wegM)) {
      namen.set(name, { name, wegM: h.wegM, s: h.s });
    }
  }
  return [...namen.values()]
    .sort((a, b) => a.s - b.s || a.wegM - b.wegM || a.name.localeCompare(b.name, 'de'))
    .map((h) => ({ name: h.name, wegM: aufZehn(h.wegM), gehMin: minuten(h.s) }));
}

/** Eine Verbindung für die Datei: Uhrzeiten als „HH:MM“, Dauer in Minuten, Teilstrecken mit Linie. */
export function beschreibe(fahrplan, v) {
  const { stops, routes } = fahrplan.netz;
  const teilstrecken = v.teile.map((t) => {
    const route = routes[t.fahrt.route];
    return {
      linie: linienname(route),
      verkehrsmittel: verkehrsmittel(route.type),
      ab: stops[t.fahrt.stops[t.von]].name,
      abfahrt: formatClock(t.fahrt.dep[t.von]),
      an: stops[t.fahrt.stops[t.bis]].name,
      ankunft: formatClock(t.fahrt.arr[t.bis]),
      ...(t.fussVorher ? { umstiegZuFussMin: minuten(t.fussVorher.s) } : {}),
    };
  });
  const linien = [];
  for (const t of teilstrecken) {
    if (!linien.some((l) => l.name === t.linie && l.verkehrsmittel === t.verkehrsmittel)) {
      linien.push({ name: t.linie, verkehrsmittel: t.verkehrsmittel });
    }
  }
  return {
    losgehen: formatClock(v.losgehen),
    gehMinStart: minuten(v.zugangS),
    ab: teilstrecken[0].ab,
    abfahrt: formatClock(v.abfahrt),
    an: teilstrecken.at(-1).an,
    ankunftHaltestelle: formatClock(v.ankunftHalt),
    gehMinZiel: minuten(v.egressS),
    ankunft: formatClock(v.ankunft),
    // Dauer aus den angezeigten Uhrzeiten (volle Minuten), damit Text und Zahl zusammenpassen.
    fahrzeitMin: uhrMinute(v.ankunftHalt) - uhrMinute(v.abfahrt),
    reisezeitMin: uhrMinute(v.ankunft) - uhrMinute(v.losgehen),
    umstiege: v.fahrten - 1,
    linien,
    teilstrecken,
  };
}

/** Feste Reihenfolge bei Gleichstand: Fahrten und Halte der Teilstrecken. */
const schluessel = (v) => v.teile.map((t) => `${t.fahrt.id}:${t.von}-${t.bis}`).join('|');

/**
 * Weg von einem Ort zu einem Ziel. `quellen`: Start-Haltestellen mit Gehzeit; `zielStops`: Ziel-Haltestelle →
 * Gehzeit; `direktWegM`: Fußweg Ort → Ziel auf dem Wegenetz. Ergebnis: späteste Verbindung mit Ankunft bis
 * `ankunftBisS` (bei Gleichstand weniger Umstiege, dann frühere Ankunft) und die nicht überholten Verbindungen mit
 * Ankunft im ZAEHLFENSTER. Verbindungen, die länger dauern als der direkte Fußweg, zählen nicht.
 *
 * @param {any} fahrplan
 * @param {{ quellen: { stop: number, s: number }[], zielStops: Map<number, number>, ankunftBisS: number,
 *   luftlinieM: number, direktWegM?: number | null }} ziel
 * @returns {import('../../lib/places/oepnv').OepnvWeg}
 */
export function weg(fahrplan, { quellen, zielStops, ankunftBisS, luftlinieM, direktWegM }) {
  const ankunftBis = formatClock(ankunftBisS);
  const direktS = luftlinieM <= DIREKT_ZU_FUSS_MAX_M ? gehSekundenWeg(direktWegM ?? luftlinieM * UMWEG_FAKTOR) : undefined;
  const direkt = direktS === undefined ? {} : { direktZuFussMin: minuten(direktS) };
  const zielStopSet = new Set(zielStops.keys());
  const start = quellen.filter((q) => !zielStopSet.has(q.stop));
  if (start.length === 0) {
    return {
      moeglich: false,
      ankunftBis,
      grund: `Keine Haltestelle im Umkreis von ${(ZUGANG_NOTFALL_M / 1000).toLocaleString('de-DE')} km`,
      verbindungenMorgens: 0,
      verbindungen: [],
      ...direkt,
    };
  }
  const gefunden = verbindungsprofil(fahrplan, {
    quellen: start,
    ziele: zielStops,
    vonS: FRUEHESTES_LOSGEHEN_S,
    bisS: ZAEHLFENSTER.bisS,
  }).alle;
  // Wer zu Fuß schneller ist, fährt nicht: solche Verbindungen zählen nicht.
  const alle = direktS === undefined ? gefunden : gefunden.filter((v) => v.ankunft - v.losgehen < direktS);
  const profil = nichtUeberholt(alle);

  const passend = alle
    .filter((v) => v.ankunft <= ankunftBisS)
    .sort(
      (a, b) =>
        b.losgehen - a.losgehen ||
        a.fahrten - b.fahrten ||
        a.ankunft - b.ankunft ||
        (schluessel(a) < schluessel(b) ? -1 : schluessel(a) > schluessel(b) ? 1 : 0),
    );
  const verbindungen = profil
    .filter((v) => v.ankunft >= ZAEHLFENSTER.vonS && v.ankunft <= ZAEHLFENSTER.bisS)
    .map((v) => ({
      losgehen: formatClock(v.losgehen),
      abfahrt: formatClock(v.abfahrt),
      ankunft: formatClock(v.ankunft),
      umstiege: v.fahrten - 1,
    }));

  if (passend.length === 0) {
    const erste = profil.length ? profil.reduce((a, b) => (b.ankunft < a.ankunft ? b : a)) : null;
    let grund = `Keine Verbindung mit Ankunft bis ${formatClock(ZAEHLFENSTER.bisS)} (Losgehen ab ${formatClock(FRUEHESTES_LOSGEHEN_S)}, höchstens ${MAX_FAHRTEN - 1} Umstiege)`;
    if (erste) grund = `Keine Verbindung mit Ankunft bis ${ankunftBis}; die früheste kommt um ${formatClock(erste.ankunft)} an`;
    else if (gefunden.length > 0) grund = `Zu Fuß (${direkt.direktZuFussMin} Min.) schneller als jede Verbindung`;
    return { moeglich: false, ankunftBis, grund, verbindungenMorgens: verbindungen.length, verbindungen, ...direkt };
  }
  return {
    moeglich: true,
    ankunftBis,
    spaeteste: beschreibe(fahrplan, passend[0]),
    verbindungenMorgens: verbindungen.length,
    verbindungen,
    ...direkt,
  };
}

/**
 * Umstiege an Bahnhöfen über das Wegenetz: Für jede Haltestelle mit Zughalt ersetzt die Wegelänge (fusswege.mjs)
 * die Luftlinie zu den Nachbarn bis UMSTIEG_MAX_M, in beide Richtungen. Die Luftlinie täuscht gerade dort, wo
 * Gleise und Unterführungen liegen (Wetzlar: 125 m Luftlinie, 430 m Weg vom Bahnsteig zum ZOB). Wege über
 * UMSTIEG_MAX_WEG_M fallen weg (kein Übergang über die Gleise).
 */
export async function bahnUmstiege(fahrplan, cache) {
  const { netz, fusswege } = fahrplan;
  const bahn = new Set();
  for (const trip of netz.trips) {
    if (verkehrsmittel(netz.routes[trip.route].type) === 'bahn') for (const stop of trip.stops) bahn.add(stop);
  }
  const laenge = new Map();
  for (const stop of [...bahn].sort((a, b) => a - b)) {
    const nachbarn = fusswege[stop];
    if (nachbarn.length === 0) continue;
    const laengen = await wegelaengen(netz.stops[stop], nachbarn.map((n) => netz.stops[n.stop]), cache);
    nachbarn.forEach((n, i) => {
      if (laengen[i] === null) return;
      laenge.set(`${stop}>${n.stop}`, laengen[i]);
      laenge.set(`${n.stop}>${stop}`, laengen[i]);
    });
  }
  let ersetzt = 0;
  fusswege.forEach((liste, von) => {
    fusswege[von] = liste.flatMap((weg) => {
      const m = laenge.get(`${von}>${weg.stop}`);
      if (m === undefined) return [weg];
      ersetzt++;
      return m > UMSTIEG_MAX_WEG_M ? [] : [{ stop: weg.stop, s: gehSekundenWeg(m) }];
    });
  });
  log(`Umstiege an ${bahn.size} Bahnhöfen: ${ersetzt} Fußwege über das Wegenetz`);
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const messung = JSON.parse(fs.readFileSync(MESSUNG, 'utf8'));
  const berufsschule = JSON.parse(fs.readFileSync(BERUFSSCHULE, 'utf8'));
  const hq = { lat: messung.headquarters.lat, lng: messung.headquarters.lng };
  const schule = { lat: berufsschule.schule.lat, lng: berufsschule.schule.lng };
  const [h, m] = berufsschule.ankunftBis.split(':').map(Number);
  const ankunftSchuleS = h * 3600 + m * 60;

  const netz = await ladeTagesfahrplan(args, hq);
  const fahrplan = baueFahrplan(netz);
  const cache = oeffneCache(args.cache ? path.join(args.cache, 'fusswege.json') : null);
  const halt = (stop) => netz.stops[stop];
  await bahnUmstiege(fahrplan, cache);

  /** Ziel-Haltestellen bis ZIEL_MAX_M Luftlinie, Gehzeit über das Wegenetz (Haltestelle → Ziel, gleiche Länge). */
  async function ziel(punkt) {
    const kandidaten = fahrplan.inDerNaehe(punkt, ZIEL_MAX_M);
    const laengen = await wegelaengen(punkt, kandidaten.map((k) => halt(k.stop)), cache);
    const halte = mitFussweg(kandidaten, laengen, ZIEL_MAX_WEG_M);
    if (halte.length === 0) throw new Error(`Keine Haltestelle bis ${ZIEL_MAX_M} m um ${punkt.lat}, ${punkt.lng}`);
    return { stops: new Map(halte.map((z) => [z.stop, z.s])), namen: nachNamen(fahrplan, halte) };
  }
  const zielBetrieb = await ziel(hq);
  const zielSchule = await ziel(schule);

  const orte = {};
  const aufgenommen = messung.places.filter((p) => p.included).sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const ort of aufgenommen) {
    const punkt = { lat: ort.lat, lng: ort.lng };
    const kandidaten = zugangKandidaten(fahrplan, punkt);
    const ziele = [
      { id: 'ziel:betrieb', ...hq },
      { id: 'ziel:schule', ...schule },
    ];
    const laengen = await wegelaengen(punkt, [...kandidaten.map((k) => halt(k.stop)), ...ziele], cache);
    const quellen = mitFussweg(kandidaten, laengen.slice(0, kandidaten.length), ZUGANG_MAX_WEG_M);
    const [wegBetriebM, wegSchuleM] = laengen.slice(kandidaten.length);
    orte[ort.id] = {
      name: ort.name,
      ...(ort.seat ? { messpunkt: ort.seat } : {}),
      startHaltestellen: nachNamen(fahrplan, quellen).slice(0, START_HALTESTELLEN),
      betrieb: weg(fahrplan, {
        quellen,
        zielStops: zielBetrieb.stops,
        ankunftBisS: ANKUNFT_BETRIEB_S,
        luftlinieM: haversineM(punkt, hq),
        direktWegM: wegBetriebM,
      }),
      schule: weg(fahrplan, {
        quellen,
        zielStops: zielSchule.stops,
        ankunftBisS: ankunftSchuleS,
        luftlinieM: haversineM(punkt, schule),
        direktWegM: wegSchuleM,
      }),
    };
    const b = orte[ort.id].betrieb;
    const s = orte[ort.id].schule;
    const kurz = (w) => (w.moeglich ? `${w.spaeteste.losgehen}→${w.spaeteste.ankunft} ${w.spaeteste.umstiege} Umst.` : w.grund);
    log(`${ort.id.padEnd(24)} Betrieb ${kurz(b)} · ${b.verbindungenMorgens} | Schule ${kurz(s)} · ${s.verbindungenMorgens}`);
  }

  const stand = args.stand ?? netz.feeds.map((f) => f.periode.start).sort()[0];
  const datei = {
    _kommentar:
      'Erzeugt mit scripts/places/oepnv.mjs (Protokoll scripts/places/README.md), nicht von Hand ändern. Schlüssel von orte: Orts-ID aus lib/places/data/messung.json (= Slug). Zeiten HH:MM am Werktag, Dauer in Minuten, wegM = Fußweg in Metern.',
    quelle: { ...QUELLE, feeds: netz.feeds.map((f) => f.version), stand },
    fusswege: FUSSWEGE_QUELLE,
    fahrplanperiode: { von: netz.periode.start, bis: netz.periode.end },
    werktag: args.datum,
    wochentag: WOCHENTAGE[new Date(`${args.datum}T12:00:00Z`).getUTCDay()],
    methode: {
      routing: 'RAPTOR über den Tagesfahrplan (Bus, Tram, Regionalverkehr; ohne Fernverkehr)',
      rechteckKm: RECHTECK_KM,
      gehenMProMin: GEH_M_PRO_MIN,
      umwegFaktor: UMWEG_FAKTOR,
      umstiegMaxM: UMSTIEG_MAX_M,
      umstiegBahnhofMaxWegM: UMSTIEG_MAX_WEG_M,
      umstiegMinMin: UMSTIEG_MIN_S / 60,
      umstiegPufferMin: UMSTIEG_PUFFER_S / 60,
      maxUmstiege: MAX_FAHRTEN - 1,
      zugangMaxM: ZUGANG_MAX_M,
      zugangNotfallM: ZUGANG_NOTFALL_M,
      zugangMaxWegM: ZUGANG_MAX_WEG_M,
      zielMaxM: ZIEL_MAX_M,
      zielMaxWegM: ZIEL_MAX_WEG_M,
      fruehestesLosgehen: formatClock(FRUEHESTES_LOSGEHEN_S),
      zaehlfenster: `${formatClock(ZAEHLFENSTER.vonS)}–${formatClock(ZAEHLFENSTER.bisS)}`,
    },
    betrieb: {
      adresse: messung.headquarters.address,
      lat: hq.lat,
      lng: hq.lng,
      ankunftBis: formatClock(ANKUNFT_BETRIEB_S),
      zielHaltestellen: zielBetrieb.namen,
    },
    schule: {
      name: berufsschule.schule.name,
      lat: schule.lat,
      lng: schule.lng,
      ankunftBis: berufsschule.ankunftBis,
      zielHaltestellen: zielSchule.namen,
    },
    orte,
  };
  fs.writeFileSync(args.aus, `${JSON.stringify(datei, null, 2)}\n`);
  log(`${args.aus}: ${Object.keys(orte).length} Orte, ${fs.statSync(args.aus).size} Bytes`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    process.stderr.write(`${err.stack ?? err}\n`);
    process.exit(1);
  });
}
