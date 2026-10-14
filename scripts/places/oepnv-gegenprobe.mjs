#!/usr/bin/env node
/**
 * Gegenprobe für lib/places/data/oepnv.json (Paket W2a, Auftrag Punkt 5): eine Stichprobe von Orten gegen eine
 * zweite Auskunft, Transitous (api.transitous.org, Routenplaner MOTIS, Fahrplandaten der Verkehrsverbünde über
 * DELFI). Eigene Rechnung und Gegenprobe teilen die Datenbasis DELFI, nicht aber Aufbereitung und Routing.
 *
 * Verglichen wird je Ort und Ziel die späteste Verbindung mit Ankunft bis 07:30 (Betrieb) bzw. 07:45 (Schule):
 * Abfahrt des ersten Fahrzeugs, Einstieg, Linien. Fußwege zählen nicht, weil Transitous eigene Gehzeiten rechnet.
 * Ergebnis: lib/places/data/oepnv-gegenprobe.json (wird committet; lib/places/__tests__/oepnv.test.ts prüft,
 * dass sie zum aktuellen oepnv.json passt).
 *
 * Nutzung: node scripts/places/oepnv-gegenprobe.mjs [--orte herborn,bischoffen,…] [--aus <datei>]
 * (eine Anfrage je 2 Sekunden; ohne --aus wird die Datei im Repo überschrieben)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OEPNV = path.join(ROOT, 'lib/places/data/oepnv.json');
const MESSUNG = path.join(ROOT, 'lib/places/data/messung.json');
const OUT = path.join(ROOT, 'lib/places/data/oepnv-gegenprobe.json');
const API = 'https://api.transitous.org/api/v1/plan';
const USER_AGENT = 'karriere.bad-energie.de Plausibilitaetspruefung (https://karriere.bad-energie.de)';
/** Nah- und Regionalverkehr wie in oepnv.mjs, ohne Fernverkehr. */
const MODES = 'BUS,TRAM,SUBWAY,METRO,REGIONAL_RAIL,REGIONAL_FAST_RAIL,SUBURBAN';
/**
 * Stichprobe (14 Orte, je Betrieb und Schule): Zug (Herborn, Weilburg), Dorf mit Bus und Zug (Bischoffen,
 * Grävenwiesbach), Städte mit Umstiegen (Gießen, Lich, Butzbach), direkter Bus (Braunfels, Solms, Steindorf), Wetzlar
 * selbst, Naunheim (Umweg über Waldgirmes) und die beiden Orte ohne Verbindung bis 07:30 (Greifenstein, Weilrod).
 */
const STICHPROBE = [
  'herborn',
  'bischoffen',
  'giessen',
  'braunfels',
  'greifenstein',
  'weilrod',
  'naunheim',
  'wetzlar',
  'steindorf',
  'solms',
  'lich',
  'weilburg',
  'butzbach',
  'graevenwiesbach',
];

/**
 * Geprüfte Abweichungen (`ort:ziel`): Erklärung nach Blick in beide Verbindungen. Eine neue Abweichung ohne
 * Eintrag hier fällt im Test auf (lib/places/__tests__/oepnv.test.ts).
 */
const HINWEISE = {
  'giessen:schule':
    'Dieselbe Fahrt Bus 24 (Gießen Mühlstraße 06:49, Schützenstraße 06:51). Die Gegenprobe geht 8 Minuten zu Fuß zur Mühlstraße und los um 06:41; die eigene Rechnung fährt ab Marktplatz 06:45 mit Bus 7 zur Schützenstraße und geht erst um 06:44 los. Abweichung nur im Zugang, nicht im Fahrplan.',
  'wetzlar:betrieb':
    'Dieselbe Fahrt Bus 185 (Wetzlar Bahnhof/ZOB 07:00, Braunfelser Straße 07:09). Die Gegenprobe geht 15 Minuten zum Leitzplatz und fährt mit Bus 170 zum ZOB (los 06:38); die eigene Rechnung geht 13 Minuten zum Neuen Rathaus und steigt dort in den Bus 185 (los 06:51). Abweichung nur im Zugang.',
  'solms:betrieb':
    'Dieselbe Fahrt Bus 185 (an Wetzlar Braunfelser Straße 07:15), Einstieg an verschiedenen Haltestellen in Burgsolms: eigene Rechnung Post 06:56, Gegenprobe Hüttenplatz 06:57. Abweichung nur im Zugang.',
  'lich:schule':
    'Gleiche erste Fahrt (EV 06:14 nach Gießen Bahnhof). Bei gleichem Losgehen nimmt die eigene Rechnung die Verbindung mit weniger Umstiegen (Bus 24 ab Gießen, an 07:35), die Gegenprobe die schnellere (RE99 und Bus 24 über Wetzlar, an 07:27). Abweichung in der Auswahlregel, nicht im Fahrplan.',
  'butzbach:schule':
    'Gleiche erste Fahrt (RB41 06:24 nach Gießen). Bei gleichem Losgehen nimmt die eigene Rechnung die Verbindung mit weniger Umstiegen (Bus 24 ab Gießen, an 07:35), die Gegenprobe die schnellere (RB40 und Bus 12 über Wetzlar, an 07:10). Abweichung in der Auswahlregel, nicht im Fahrplan.',
  'graevenwiesbach:betrieb':
    'Umstieg in Weilburg: X89 an ZOB 06:17, RE25 ab Bahnhof 06:21. Die Gegenprobe rechnet 3 Minuten Fußweg (109 m zwischen ihren Haltepositionen), die eigene Rechnung 4 Minuten (260 m Weg zum Bahnhofspunkt von gtfs.de) plus 1 Minute Puffer und verwirft den Umstieg. Darum geht die eigene späteste Verbindung früher los (04:29 über Frankfurt, 4 Umstiege) als die der Gegenprobe (05:08 über Weilburg, 2 Umstiege). Die eigene Rechnung ist hier vorsichtiger als nötig.',
  'graevenwiesbach:schule':
    'Gleiche erste Fahrt (X89 05:18). Wie beim Betrieb verwirft die eigene Rechnung den Umstieg in Weilburg auf den RE25 06:21 (4 Minuten Fußweg plus 1 Minute Puffer) und nimmt die RB45 06:55; an 07:40 statt 07:10.',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** „HH:MM“ in Europe/Berlin zu einem Zeitpunkt. */
function uhrzeit(iso) {
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}

/** Kalendertag in Europe/Berlin zu einem Zeitpunkt. */
function tag(iso) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date(iso));
}

/** Ortszeit „HH:MM“ am Datum → ISO in UTC (Versatz von Europe/Berlin an diesem Tag). */
export function berlinNachUtc(datum, hhmm) {
  const mittag = new Date(`${datum}T12:00:00Z`);
  const versatz = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', timeZoneName: 'longOffset' })
    .formatToParts(mittag)
    .find((p) => p.type === 'timeZoneName').value.replace('GMT', '') || '+00:00';
  return new Date(`${datum}T${hhmm}:00${versatz}`).toISOString();
}

/** Linienname ohne Zugnummer: „RB40 (24835)“ → „RB40“. */
export const ohneZugnummer = (name) => (name ?? '').replace(/\s*\(\d+\)\s*$/, '').trim();

async function plane(von, nach, zeitUtc) {
  const params = new URLSearchParams({
    fromPlace: `${von.lat},${von.lng}`,
    toPlace: `${nach.lat},${nach.lng}`,
    time: zeitUtc,
    arriveBy: 'true',
    transitModes: MODES,
    maxTransfers: '4',
  });
  for (let versuch = 1; versuch <= 3; versuch++) {
    const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) return res.json();
    if (versuch === 3) throw new Error(`Transitous: HTTP ${res.status}`);
    await sleep(5000 * versuch);
  }
  return null;
}

/** Späteste Verbindung der Gegenprobe: erstes Fahrzeug am Werktag ab 04:00, Ankunft bis zur Frist. */
export function spaetesteGegenprobe(antwort, werktag, fristUtc) {
  const kandidaten = (antwort.itineraries ?? [])
    .map((it) => ({ it, fahrten: it.legs.filter((l) => l.mode !== 'WALK') }))
    .filter(({ it, fahrten }) => fahrten.length > 0 && Date.parse(it.endTime) <= Date.parse(fristUtc))
    .filter(({ fahrten }) => tag(fahrten[0].startTime) === werktag && uhrzeit(fahrten[0].startTime) >= '04:00')
    .sort((a, b) => Date.parse(b.fahrten[0].startTime) - Date.parse(a.fahrten[0].startTime));
  if (kandidaten.length === 0) return { moeglich: false };
  const { it, fahrten } = kandidaten[0];
  return {
    moeglich: true,
    abfahrt: uhrzeit(fahrten[0].startTime),
    ab: fahrten[0].from.name,
    linien: fahrten.map((l) => ohneZugnummer(l.routeShortName)),
    ankunft: uhrzeit(it.endTime),
    umstiege: fahrten.length - 1,
  };
}

const minutenAus = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Vergleich: gleich, wenn beide keine Verbindung haben oder Abfahrt und Linien übereinstimmen. */
export function vergleiche(unsere, gegen) {
  if (!unsere.moeglich || !gegen.moeglich) {
    return unsere.moeglich === gegen.moeglich ? { ergebnis: 'gleich' } : { ergebnis: 'abweichend', abweichungMin: null };
  }
  const abweichungMin = minutenAus(unsere.abfahrt) - minutenAus(gegen.abfahrt);
  const gleicheLinien = unsere.linien.join('|') === gegen.linien.join('|');
  return { ergebnis: abweichungMin === 0 && gleicheLinien ? 'gleich' : 'abweichend', abweichungMin };
}

async function run() {
  const option = (name) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const ids = option('--orte')?.split(',') ?? STICHPROBE;
  const aus = option('--aus') ?? OUT;
  const oepnv = JSON.parse(fs.readFileSync(OEPNV, 'utf8'));
  const messung = JSON.parse(fs.readFileSync(MESSUNG, 'utf8'));
  const ziele = {
    betrieb: { lat: oepnv.betrieb.lat, lng: oepnv.betrieb.lng, ankunftBis: oepnv.betrieb.ankunftBis },
    schule: { lat: oepnv.schule.lat, lng: oepnv.schule.lng, ankunftBis: oepnv.schule.ankunftBis },
  };
  const vergleiche_ = [];
  for (const id of ids) {
    const ort = messung.places.find((p) => p.id === id && p.included);
    if (!ort) throw new Error(`Ort ${id} fehlt in messung.json`);
    for (const [zielName, ziel] of Object.entries(ziele)) {
      const fristUtc = berlinNachUtc(oepnv.werktag, ziel.ankunftBis);
      const antwort = await plane({ lat: ort.lat, lng: ort.lng }, ziel, fristUtc);
      await sleep(2000);
      const w = oepnv.orte[id][zielName];
      const unsere = w.moeglich
        ? {
            moeglich: true,
            abfahrt: w.spaeteste.abfahrt,
            ab: w.spaeteste.ab,
            linien: w.spaeteste.teilstrecken.map((t) => t.linie),
            ankunft: w.spaeteste.ankunft,
            umstiege: w.spaeteste.umstiege,
          }
        : { moeglich: false };
      const gegen = spaetesteGegenprobe(antwort, oepnv.werktag, fristUtc);
      const v = { ort: id, ziel: zielName, ankunftBis: ziel.ankunftBis, unsere, gegenprobe: gegen, ...vergleiche(unsere, gegen) };
      const hinweis = HINWEISE[`${id}:${zielName}`];
      if (v.ergebnis !== 'gleich' && hinweis) v.hinweis = hinweis;
      vergleiche_.push(v);
      process.stderr.write(`${id} ${zielName}: ${v.ergebnis} (unsere ${unsere.abfahrt ?? '–'} ${unsere.linien?.join('/') ?? ''}, Gegenprobe ${gegen.abfahrt ?? '–'} ${gegen.linien?.join('/') ?? ''})\n`);
    }
  }
  const datei = {
    _kommentar:
      'Erzeugt mit scripts/places/oepnv-gegenprobe.mjs. Gegenprobe der spätesten Verbindung je Ort und Ziel aus oepnv.json gegen Transitous; Fußwege bleiben außen vor (eigene Gehzeiten der Gegenprobe). Jede Abweichung trägt einen geprüften Hinweis (HINWEISE im Skript).',
    quelle: 'Transitous (api.transitous.org), Routenplaner MOTIS, Fahrplandaten über DELFI; nur Nah- und Regionalverkehr',
    abgerufenAm: new Date().toISOString().slice(0, 10),
    werktag: oepnv.werktag,
    vergleiche: vergleiche_,
  };
  fs.writeFileSync(aus, `${JSON.stringify(datei, null, 2)}\n`);
  const abweichend = vergleiche_.filter((v) => v.ergebnis !== 'gleich').length;
  process.stderr.write(`${aus}: ${vergleiche_.length} Vergleiche, ${abweichend} abweichend\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    process.stderr.write(`${err.stack ?? err}\n`);
    process.exit(1);
  });
}
