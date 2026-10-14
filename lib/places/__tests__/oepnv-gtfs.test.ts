import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';

import {
  activeServiceIds,
  feedPeriod,
  formatClock,
  parseCsvLine,
  parseGtfsTime,
  readGtfsTable,
  readZipDirectory,
  shiftIsoDate,
} from '../../../scripts/places/gtfs.mjs';
import {
  ANKUNFT_BETRIEB_S,
  FENSTER,
  UMSTIEG_MAX_WEG_M,
  WERKTAG,
  beschreibe,
  leseTagesfahrplan,
  mitFussweg,
  parseArgs,
  rechteck,
  verkehrsmittel,
  weg,
  zugangKandidaten,
} from '../../../scripts/places/oepnv.mjs';
import { berlinNachUtc, ohneZugnummer, spaetesteGegenprobe, vergleiche } from '../../../scripts/places/oepnv-gegenprobe.mjs';
import { UMWEG_FAKTOR, baueFahrplan } from '../../../scripts/places/raptor.mjs';

/**
 * GTFS lesen und den Tagesfahrplan bauen (scripts/places/gtfs.mjs, oepnv.mjs; Paket W2a): ZIP ohne Bibliothek,
 * CSV mit Anführungszeichen, Verkehrstage mit Ausnahmen, Nachtfahrten des Vortags, zwei Feeds mit gleichen IDs.
 */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oepnv-gtfs-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

/** Minimale ZIP-Datei (deflate), wie sie gtfs.de liefert: lokale Köpfe, Verzeichnis, Endsatz. */
function zip(datei: string, eintraege: Record<string, string>): string {
  const teile: Buffer[] = [];
  const verzeichnis: Buffer[] = [];
  let offset = 0;
  for (const [name, inhalt] of Object.entries(eintraege)) {
    const roh = Buffer.from(inhalt, 'utf8');
    const daten = zlib.deflateRawSync(roh);
    const nameBuf = Buffer.from(name, 'utf8');
    const kopf = Buffer.alloc(30);
    kopf.writeUInt32LE(0x04034b50, 0);
    kopf.writeUInt16LE(20, 4);
    kopf.writeUInt16LE(8, 8);
    kopf.writeUInt32LE(daten.length, 18);
    kopf.writeUInt32LE(roh.length, 22);
    kopf.writeUInt16LE(nameBuf.length, 26);
    const zentral = Buffer.alloc(46);
    zentral.writeUInt32LE(0x02014b50, 0);
    zentral.writeUInt16LE(20, 4);
    zentral.writeUInt16LE(20, 6);
    zentral.writeUInt16LE(8, 10);
    zentral.writeUInt32LE(daten.length, 20);
    zentral.writeUInt32LE(roh.length, 24);
    zentral.writeUInt16LE(nameBuf.length, 28);
    zentral.writeUInt32LE(offset, 42);
    teile.push(kopf, nameBuf, daten);
    verzeichnis.push(zentral, nameBuf);
    offset += kopf.length + nameBuf.length + daten.length;
  }
  const dir = Buffer.concat(verzeichnis);
  const ende = Buffer.alloc(22);
  ende.writeUInt32LE(0x06054b50, 0);
  ende.writeUInt16LE(Object.keys(eintraege).length, 8);
  ende.writeUInt16LE(Object.keys(eintraege).length, 10);
  ende.writeUInt32LE(dir.length, 12);
  ende.writeUInt32LE(offset, 16);
  const pfad = path.join(tmp, datei);
  fs.writeFileSync(pfad, Buffer.concat([...teile, dir, ende]));
  return pfad;
}

const HQ = { lat: 50.5525, lng: 8.47465 };

/** Fahrt im Tagesfahrplan (leseTagesfahrplan). */
interface Fahrt {
  id: string;
  route: number;
  stops: number[];
  arr: number[];
  dep: number[];
  board: boolean[];
  alight: boolean[];
}

/** Nahverkehr: Bus 10 Steindorf → Wetzlar Bahnhof; dazu eine Nachtfahrt vom Montag und eine Zusatzfahrt. */
const NV = zip('nv.zip', {
  'feed_info.txt': 'feed_publisher_name,feed_version\n"gtfs.de - GTFS für Deutschland, Daten bereitgestellt von DELFI e.V.",latest-nv-free\n',
  'attributions.txt': 'attribution_id,organization_name\n1,DELFI e.V\n',
  'stops.txt':
    '\uFEFFstop_name,parent_station,stop_id,stop_lat,stop_lon,location_type\n' +
    'Wetzlar Bahnhof,,P1,50.5657,8.5042,1\n' +
    'Wetzlar Bahnhof NBahnhof,P1,S1,50.5657,8.5042,\n' +
    '"Steindorf, Friedhof",,S2,50.546,8.455,\n' +
    'Berlin Alexanderplatz,,S9,52.52,13.41,\n',
  'routes.txt': 'route_long_name,route_short_name,agency_id,route_type,route_id\n,10,1,3,1\n,200,1,3,2\n',
  'calendar.txt':
    'monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date,service_id\n' +
    '0,1,0,0,0,0,0,20261010,20261109,wk\n' +
    '1,0,0,0,0,0,0,20261010,20261109,mo\n',
  'calendar_dates.txt': 'service_id,exception_type,date\nwk,2,20261103\nextra,1,20261027\n',
  'trips.txt': 'route_id,service_id,trip_id\n1,wk,T1\n1,mo,T2\n1,extra,T3\n2,wk,T4\n',
  'stop_times.txt':
    'trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type\r\n' +
    'T1,07:10:00,07:10:00,S1,2,"Wetzlar, Bahnhof",,\r\n' +
    'T1,07:00:00,07:00:30,S2,1,"Wetzlar, Bahnhof",,1\r\n' +
    'T2,27:30:00,27:30:00,S2,1,,,\r\n' +
    'T2,27:40:00,27:40:00,S1,2,,,\r\n' +
    'T3,08:00:00,08:00:00,S2,1,,,\r\n' +
    'T3,08:10:00,08:10:00,S1,2,,,\r\n' +
    'T4,07:00:00,07:00:00,S9,1,,,\r\n',
});

/** Regionalverkehr: gleiche route_id und service_id wie im Nahverkehr, aber andere Bedeutung; S1 geteilt. */
const RV = zip('rv.zip', {
  'feed_info.txt': 'feed_publisher_name,feed_version\ngtfs.de,latest-rv-free\n',
  'stops.txt': 'stop_name,parent_station,stop_id,stop_lat,stop_lon,location_type\nWetzlar,P1,S1,50.5657,8.5042,\nHerborn,,S3,50.6847,8.3083,\n',
  'routes.txt': 'route_long_name,route_short_name,agency_id,route_type,route_id\n,RB40,9,2,1\n',
  'calendar.txt':
    'monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date,service_id\n0,1,0,0,0,0,0,20261012,20261108,wk\n',
  'calendar_dates.txt': 'service_id,exception_type,date\n',
  'trips.txt': 'route_id,service_id,trip_id\n1,wk,R1\n',
  'stop_times.txt': 'trip_id,arrival_time,departure_time,stop_id,stop_sequence\nR1,06:00:00,06:00:00,S3,1\nR1,06:30:00,06:31:00,S1,2\n',
});

describe('gtfs.mjs: ZIP und CSV', () => {
  it('liest das Verzeichnis einer ZIP-Datei', () => {
    const eintraege = readZipDirectory(NV);
    expect([...eintraege.keys()]).toContain('stop_times.txt');
    expect(eintraege.get('stops.txt').method).toBe(8);
  });

  it('bricht bei einer Datei ohne ZIP-Endsatz klar ab', () => {
    const kaputt = path.join(tmp, 'kaputt.zip');
    fs.writeFileSync(kaputt, 'kein zip');
    expect(() => readZipDirectory(kaputt)).toThrow(/kein ZIP-Endsatz/);
  });

  it('zerlegt CSV mit Anführungszeichen, Kommas im Feld und verdoppelten Anführungszeichen', () => {
    expect(parseCsvLine('a,b,,c')).toEqual(['a', 'b', '', 'c']);
    expect(parseCsvLine('"Wetzlar, Bahnhof",1,"Sag ""Hallo"""')).toEqual(['Wetzlar, Bahnhof', '1', 'Sag "Hallo"']);
  });

  it('liest Tabellen mit BOM und CRLF; der Schnellfilter sieht die Kopfzeile', async () => {
    const eintraege = readZipDirectory(NV);
    const halte: Record<string, string>[] = [];
    await readGtfsTable(NV, eintraege, 'stops.txt', (row: Record<string, string>) => halte.push(row));
    expect(halte[0].stop_name).toBe('Wetzlar Bahnhof');
    expect(halte[2].stop_name).toBe('Steindorf, Friedhof');
    const zeilen: Record<string, string>[] = [];
    const n = await readGtfsTable(NV, eintraege, 'stop_times.txt', (row: Record<string, string>) => zeilen.push(row), (kopf: string[]) => {
      expect(kopf[0]).toBe('trip_id');
      return (line: string) => line.startsWith('T1,');
    });
    expect(n).toBe(2);
    expect(zeilen.map((z) => z.drop_off_type)).toEqual(['', '1']);
  });

  it('fehlende Datei im Feed: klare Meldung', async () => {
    expect(() => readGtfsTable(RV, readZipDirectory(RV), 'transfers.txt', () => {})).toThrow(/transfers\.txt fehlt/);
  });
});

describe('gtfs.mjs: Zeiten und Verkehrstage', () => {
  it('GTFS-Zeiten über 24 h, Uhrzeit ohne Sekunden', () => {
    expect(parseGtfsTime('07:00:30')).toBe(7 * 3600 + 30);
    expect(parseGtfsTime('27:30:00')).toBe(27.5 * 3600);
    expect(parseGtfsTime('')).toBeNull();
    expect(formatClock(7 * 3600 + 59 * 60 + 59)).toBe('07:59');
  });

  it('Verkehrstage aus calendar und calendar_dates (1 = zusätzlich, 2 = entfällt)', () => {
    const cal = [
      { tuesday: '1', monday: '0', start_date: '20261010', end_date: '20261109', service_id: 'wk' },
      { tuesday: '1', monday: '0', start_date: '20261101', end_date: '20261109', service_id: 'spaeter' },
    ];
    const dates = [
      { service_id: 'wk', exception_type: '2', date: '20261103' },
      { service_id: 'extra', exception_type: '1', date: '20261027' },
    ];
    expect([...activeServiceIds(cal, dates, '2026-10-27')].sort()).toEqual(['extra', 'wk']);
    expect([...activeServiceIds(cal, dates, '2026-11-03')]).toEqual(['spaeter']);
    expect([...activeServiceIds(cal, dates, '2026-10-26')]).toEqual([]);
    expect(feedPeriod(cal, dates)).toEqual({ start: '2026-10-10', end: '2026-11-09' });
    expect(shiftIsoDate('2026-11-01', -1)).toBe('2026-10-31');
  });
});

describe('oepnv.mjs: Tagesfahrplan aus zwei Feeds', () => {
  it('Rechteck um den Firmensitz: 35 + 15 km in jede Richtung', () => {
    const box = rechteck(HQ, 50);
    expect(box.maxLat - HQ.lat).toBeCloseTo(50 / 111.32, 5);
    expect(box.maxLng - HQ.lng).toBeGreaterThan(0.7);
  });

  it('filtert Rechteck und Werktag, verschiebt Nachtfahrten des Vortags, trennt gleiche IDs der Feeds', async () => {
    const netz = await leseTagesfahrplan([NV, RV], '2026-10-27', HQ);
    expect(netz.feeds.map((f: { version: string }) => f.version)).toEqual(['latest-nv-free', 'latest-rv-free']);
    expect(netz.periode).toEqual({ start: '2026-10-12', end: '2026-11-08' });
    // S9 (Berlin) liegt außerhalb; S1 kommt in beiden Feeds vor und zählt einmal, mit dem Namen der Station.
    expect(netz.stops.map((s: { id: string; name: string }) => [s.id, s.name]).sort()).toEqual([
      ['S1', 'Wetzlar Bahnhof'],
      ['S2', 'Steindorf, Friedhof'],
      ['S3', 'Herborn'],
    ]);
    expect(netz.routes.map((r: { id: string; short: string }) => [r.id, r.short])).toEqual([
      ['nv:1', '10'],
      ['rv:1', 'RB40'],
    ]);
    const fahrten: Record<string, Fahrt> = Object.fromEntries(netz.trips.map((t: Fahrt) => [t.id, t]));
    expect(Object.keys(fahrten).sort()).toEqual(['nv:T1', 'nv:T2@vortag', 'nv:T3', 'rv:R1']);
    // Reihenfolge nach stop_sequence, Abfahrt mit Sekunden, Ausstiegsverbot übernommen.
    expect(fahrten['nv:T1'].dep).toEqual([7 * 3600 + 30, 7 * 3600 + 600]);
    expect(fahrten['nv:T1'].alight).toEqual([false, true]);
    expect(fahrten['nv:T2@vortag'].arr).toEqual([3.5 * 3600, 3.5 * 3600 + 600]);
    expect(netz.routes[fahrten['rv:R1'].route].type).toBe(2);
    expect(fahrten['rv:R1'].stops[1]).toBe(fahrten['nv:T1'].stops[1]);
  });

  it('Ausnahme „entfällt“ wirkt; Datum außerhalb der Periode bricht ab', async () => {
    // Dienstag 03.11.: T1 entfällt, die Nachtfahrt vom Montag (T2) fährt.
    const netz = await leseTagesfahrplan([NV], '2026-11-03', HQ);
    expect(netz.trips.map((t: { id: string }) => t.id)).toEqual(['nv:T2@vortag']);
    await expect(leseTagesfahrplan([NV], '2026-11-10', HQ)).rejects.toThrow(/außerhalb der Fahrplanperiode/);
  });

  it('Werktag und Zeitfenster wie dokumentiert', () => {
    expect(WERKTAG).toBe('2026-10-27');
    expect(FENSTER).toEqual({ vonS: 3 * 3600, bisS: 10 * 3600 });
    expect(ANKUNFT_BETRIEB_S).toBe(7.5 * 3600);
    expect(UMSTIEG_MAX_WEG_M).toBe(800);
  });
});

describe('oepnv.mjs: Hilfen', () => {
  it('Verkehrsmittel aus route_type (einfach und erweitert)', () => {
    expect(verkehrsmittel(2)).toBe('bahn');
    expect(verkehrsmittel(106)).toBe('bahn');
    expect(verkehrsmittel(109)).toBe('bahn');
    expect(verkehrsmittel(3)).toBe('bus');
    expect(verkehrsmittel(700)).toBe('bus');
    expect(verkehrsmittel(715)).toBe('bedarf');
    expect(verkehrsmittel(0)).toBe('tram');
    expect(verkehrsmittel(1)).toBe('u-bahn');
    expect(verkehrsmittel(4)).toBe('faehre');
    expect(verkehrsmittel(1700)).toBe('sonstige');
  });

  it('Argumente: mehrere --gtfs, Datum im ISO-Format, unbekannte Optionen brechen ab', () => {
    expect(parseArgs(['--gtfs', 'a.zip', '--gtfs', 'b.zip']).gtfs).toEqual(['a.zip', 'b.zip']);
    expect(parseArgs(['--gtfs', 'a.zip']).datum).toBe(WERKTAG);
    expect(() => parseArgs([])).toThrow(/GTFS-ZIP fehlt/);
    expect(() => parseArgs(['--gtfs', 'a.zip', '--datum', '27.10.2026'])).toThrow(/JJJJ-MM-TT/);
    expect(() => parseArgs(['--gtfs', 'a.zip', '--schnell', '1'])).toThrow(/Unbekannte Option/);
  });

  it('Fußweg: Wegelänge aus dem Netz, ohne Weg Luftlinie × 1,3; zu lange Wege fallen weg', () => {
    const kandidaten = [
      { stop: 1, m: 100 },
      { stop: 2, m: 200 },
      { stop: 3, m: 300 },
    ];
    expect(mitFussweg(kandidaten, [160, null, 5000], 2000)).toEqual([
      { stop: 1, m: 100, wegM: 160, s: 120 },
      { stop: 2, m: 200, wegM: 200 * UMWEG_FAKTOR, s: 240 },
    ]);
  });
});

describe('oepnv.mjs: weg() an einem kleinen Netz', () => {
  const h = (hhmm: string) => Number(hhmm.slice(0, 2)) * 3600 + Number(hhmm.slice(3, 5)) * 60;
  const stop = (id: string, lat: number, lng: number) => ({ id, name: id, lat, lng });
  const netz = {
    stops: [stop('Dorf', 50.6, 8.4), stop('Zentrum', 50.56, 8.48), stop('Fern', 50.7, 8.3)],
    routes: [{ id: 'nv:1', short: '185', long: '', type: 3 }],
    trips: [
      { id: 'a', route: 0, stops: [0, 1], arr: [h('06:00'), h('06:20')], dep: [h('06:00'), h('06:20')], board: [true, true], alight: [true, true] },
      { id: 'b', route: 0, stops: [0, 1], arr: [h('06:50'), h('07:10')], dep: [h('06:50'), h('07:10')], board: [true, true], alight: [true, true] },
      { id: 'c', route: 0, stops: [0, 1], arr: [h('07:30'), h('07:50')], dep: [h('07:30'), h('07:50')], board: [true, true], alight: [true, true] },
    ],
  };
  const fp = baueFahrplan(netz);
  const ziele = new Map([[1, 300]]);

  it('späteste Verbindung bis zur Frist, Verbindungen 06:00–08:00 gezählt', () => {
    const w = weg(fp, { quellen: [{ stop: 0, s: 120 }], zielStops: ziele, ankunftBisS: h('07:30'), luftlinieM: 9000 });
    expect(w.moeglich).toBe(true);
    expect(w.spaeteste).toMatchObject({ losgehen: '06:48', abfahrt: '06:50', ankunftHaltestelle: '07:10', ankunft: '07:15', fahrzeitMin: 20, reisezeitMin: 27, umstiege: 0 });
    expect(w.spaeteste?.linien).toEqual([{ name: '185', verkehrsmittel: 'bus' }]);
    expect(w.verbindungen.map((v: { ankunft: string }) => v.ankunft)).toEqual(['06:25', '07:15', '07:55']);
    expect(w.verbindungenMorgens).toBe(3);
    expect(w).not.toHaveProperty('direktZuFussMin');
  });

  it('eine Regel für beide Angaben: zur Abfahrt der spätesten Verbindung nennt die Liste dieselbe Ankunft und Umstiege', () => {
    // Gleiche Abfahrt 06:50 zweimal: direkt und langsam (an 07:25) oder mit Umstieg in „Knoten“ schneller (an 07:15).
    const zweiWege = {
      stops: [stop('Dorf', 50.6, 8.4), stop('Zentrum', 50.56, 8.48), stop('Knoten', 50.58, 8.44)],
      routes: [
        { id: 'nv:1', short: 'EV', long: '', type: 3 },
        { id: 'nv:2', short: '24', long: '', type: 3 },
        { id: 'nv:3', short: '12', long: '', type: 3 },
      ],
      trips: [
        { id: 'x', route: 0, stops: [0, 1], arr: [h('06:50'), h('07:25')], dep: [h('06:50'), h('07:25')], board: [true, true], alight: [true, true] },
        { id: 'y', route: 1, stops: [0, 2], arr: [h('06:50'), h('07:00')], dep: [h('06:50'), h('07:00')], board: [true, true], alight: [true, true] },
        { id: 'z', route: 2, stops: [2, 1], arr: [h('07:05'), h('07:15')], dep: [h('07:05'), h('07:15')], board: [true, true], alight: [true, true] },
      ],
    };
    const w = weg(baueFahrplan(zweiWege), { quellen: [{ stop: 0, s: 120 }], zielStops: ziele, ankunftBisS: h('07:30'), luftlinieM: 9000 });
    // Späteste: bei gleichem Losgehen weniger Umstiege (direkt, an 07:30 mit Fußweg)
    expect(w.spaeteste).toMatchObject({ losgehen: '06:48', abfahrt: '06:50', ankunft: '07:30', umstiege: 0 });
    // Die Liste nennt zu dieser Abfahrt dieselbe Variante, nicht die schnellere mit Umstieg (an 07:20)
    const gleicheAbfahrt = w.verbindungen.filter((v: { losgehen: string }) => v.losgehen === w.spaeteste!.losgehen);
    expect(gleicheAbfahrt).toEqual([{ losgehen: '06:48', abfahrt: '06:50', ankunft: '07:30', umstiege: 0 }]);
  });

  it('ohne Verbindung bis zur Frist: nicht möglich, mit der frühesten Ankunft als Grund', () => {
    const w = weg(fp, { quellen: [{ stop: 0, s: 120 }], zielStops: ziele, ankunftBisS: h('06:15'), luftlinieM: 9000 });
    expect(w).toMatchObject({ moeglich: false, grund: 'Keine Verbindung mit Ankunft bis 06:15; die früheste kommt um 06:25 an' });
    expect(w.spaeteste).toBeUndefined();
  });

  it('zu Fuß schneller: Verbindungen zählen nicht, Grund nennt den Fußweg', () => {
    const w = weg(fp, { quellen: [{ stop: 0, s: 120 }], zielStops: ziele, ankunftBisS: h('07:30'), luftlinieM: 900, direktWegM: 1200 });
    expect(w).toMatchObject({ moeglich: false, direktZuFussMin: 15, grund: 'Zu Fuß (15 Min.) schneller als jede Verbindung', verbindungenMorgens: 0 });
  });

  it('keine Start-Haltestelle: Grund statt Verbindung', () => {
    const w = weg(fp, { quellen: [], zielStops: ziele, ankunftBisS: h('07:30'), luftlinieM: 9000 });
    expect(w).toMatchObject({ moeglich: false, grund: 'Keine Haltestelle im Umkreis von 2,5 km', verbindungen: [] });
  });

  it('Start-Kandidaten: im Umkreis von 1,2 km, sonst die nächste bis 2,5 km', () => {
    expect(zugangKandidaten(fp, { lat: 50.6, lng: 8.4005 }).map((k: { stop: number }) => k.stop)).toEqual([0]);
    expect(zugangKandidaten(fp, { lat: 50.6, lng: 8.43 }).map((k: { stop: number }) => k.stop)).toEqual([0]);
    expect(zugangKandidaten(fp, { lat: 50.65, lng: 8.35 })).toEqual([]);
  });

  it('beschreibe: Dauer aus den angezeigten Uhrzeiten, Linien ohne Doppelte', () => {
    const v = {
      fahrten: 2,
      zugangS: 120,
      abfahrt: h('06:00') + 30,
      losgehen: h('06:00') + 30 - 120,
      ankunftHalt: h('07:10'),
      egressS: 300,
      ankunft: h('07:15'),
      teile: [
        { fahrt: netz.trips[0], von: 0, bis: 1 },
        { fahrt: netz.trips[1], von: 0, bis: 1, fussVorher: { von: 1, s: 240 } },
      ],
    };
    const b = beschreibe(fp, v);
    expect(b).toMatchObject({ losgehen: '05:58', abfahrt: '06:00', fahrzeitMin: 70, reisezeitMin: 77, umstiege: 1 });
    expect(b.linien).toHaveLength(1);
    expect(b.teilstrecken[1].umstiegZuFussMin).toBe(4);
  });
});

describe('oepnv-gegenprobe.mjs', () => {
  it('Ortszeit → UTC mit Sommer- und Winterzeit', () => {
    expect(berlinNachUtc('2026-10-27', '07:30')).toBe('2026-10-27T06:30:00.000Z');
    expect(berlinNachUtc('2026-07-01', '07:30')).toBe('2026-07-01T05:30:00.000Z');
  });

  it('Linienname ohne Zugnummer', () => {
    expect(ohneZugnummer('RB40 (24835)')).toBe('RB40');
    expect(ohneZugnummer('185')).toBe('185');
  });

  it('nimmt die späteste Verbindung ab 04:00 am Werktag mit Ankunft bis zur Frist', () => {
    const leg = (mode: string, name: string | undefined, von: string, start: string, ende: string) => ({
      mode,
      routeShortName: name,
      from: { name: von },
      startTime: start,
      endTime: ende,
    });
    const antwort = {
      itineraries: [
        // Vom Vorabend (Nachtwarten): zählt nicht
        { endTime: '2026-10-27T04:41:00Z', legs: [leg('BUS', '402', 'A', '2026-10-26T21:09:00Z', '2026-10-26T21:17:00Z')] },
        { endTime: '2026-10-27T06:05:00Z', legs: [leg('WALK', undefined, 'START', '2026-10-27T05:17:00Z', '2026-10-27T05:25:00Z'), leg('REGIONAL_RAIL', 'RE99 (15103)', 'Herborn Bahnhof', '2026-10-27T05:25:00Z', '2026-10-27T05:38:00Z'), leg('BUS', '10', 'Wetzlar Bahnhof/ZOB', '2026-10-27T05:46:00Z', '2026-10-27T05:58:00Z')] },
        // Zu spät
        { endTime: '2026-10-27T06:51:00Z', legs: [leg('BUS', '10', 'X', '2026-10-27T06:00:00Z', '2026-10-27T06:40:00Z')] },
      ],
    };
    expect(spaetesteGegenprobe(antwort, '2026-10-27', '2026-10-27T06:30:00.000Z')).toEqual({
      moeglich: true,
      abfahrt: '06:25',
      ab: 'Herborn Bahnhof',
      linien: ['RE99', '10'],
      ankunft: '07:05',
      umstiege: 1,
    });
    expect(spaetesteGegenprobe({ itineraries: [] }, '2026-10-27', '2026-10-27T06:30:00.000Z')).toEqual({ moeglich: false });
  });

  it('vergleicht Abfahrt und Linien; beide „nicht möglich“ ist gleich', () => {
    const a = { moeglich: true, abfahrt: '06:25', linien: ['RE99', '10'] };
    expect(vergleiche(a, { ...a })).toEqual({ ergebnis: 'gleich', abweichungMin: 0 });
    expect(vergleiche(a, { ...a, abfahrt: '06:20' })).toEqual({ ergebnis: 'abweichend', abweichungMin: 5 });
    expect(vergleiche(a, { ...a, linien: ['RB40', '10'] })).toEqual({ ergebnis: 'abweichend', abweichungMin: 0 });
    expect(vergleiche({ moeglich: false }, { moeglich: false })).toEqual({ ergebnis: 'gleich' });
    expect(vergleiche({ moeglich: false }, a)).toEqual({ ergebnis: 'abweichend', abweichungMin: null });
  });
});
