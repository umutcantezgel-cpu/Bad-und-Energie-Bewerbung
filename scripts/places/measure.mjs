#!/usr/bin/env node
/**
 * Ortsvermessung für die Ortsseiten (docs/operations/orte-messung.md). Läuft nur von Hand, nie im
 * Build oder zur Laufzeit; das Ergebnis wird committet: lib/places/data/messung.json.
 *
 * Methode:
 * 1. Kandidaten: alle Gemeinden der Kreise um Wetzlar (CANDIDATES) und die Wetzlarer Stadtteile.
 * 2. Verortung über Nominatim (OpenStreetMap): Ortsmitte (Ortsknoten bzw. Mittelpunkt der Gemeinde),
 *    Kreis und Postleitzahl aus den OSM-Adressdaten. Ein Kandidat zählt nur, wenn OSM den erwarteten
 *    Kreis bestätigt (bei Stadtteilen: die Stadt Wetzlar).
 * 3. Strecke und Fahrzeit mit dem OSRM-Routenplaner (OpenStreetMap, Profil Auto), Ortsmitte →
 *    Firmensitz Siegmund-Hiepe-Str. 20, 35578 Wetzlar. Gerundet auf ganze km und ganze Minuten.
 * 4. Gegenprobe: Straßenstrecke ≥ 0,95 × Luftlinie. Aufgenommen wird nur, was ≤ 35 km Straße liegt
 *    (Fakt radius35); weiter entfernte Orte stehen mit Grund in der Tabelle.
 *
 * Nutzung: node scripts/places/measure.mjs  (≈ 3 Minuten; Nominatim erlaubt 1 Anfrage je Sekunde)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_JSON = path.join(ROOT, 'lib/places/data/messung.json');
const OUT_MD = path.join(ROOT, 'docs/operations/orte-messung.md');
const USER_AGENT = 'karriere.bad-energie.de Ortsvermessung (https://karriere.bad-energie.de)';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OSRM = 'https://router.project-osrm.org';
const MAX_ROAD_KM = 35;
const HQ_QUERY = { street: 'Siegmund-Hiepe-Straße 20', city: 'Wetzlar', postalcode: '35578' };

/** Kreise mit ihrer Schreibweise in OSM (county) und dem Slug der späteren Kreisseite. */
const KREISE = {
  'lahn-dill-kreis': 'Lahn-Dill-Kreis',
  'landkreis-giessen': 'Landkreis Gießen',
  'landkreis-marburg-biedenkopf': 'Landkreis Marburg-Biedenkopf',
  'landkreis-limburg-weilburg': 'Landkreis Limburg-Weilburg',
  wetteraukreis: 'Wetteraukreis',
  hochtaunuskreis: 'Hochtaunuskreis',
  vogelsbergkreis: 'Vogelsbergkreis',
};

/** Gemeinden je Kreis (amtliche Namen). Wetzlar selbst steht als Stadt bei den Stadtteilen. */
const CANDIDATES = {
  'lahn-dill-kreis': [
    'Aßlar', 'Bischoffen', 'Braunfels', 'Breitscheid', 'Dietzhölztal', 'Dillenburg', 'Driedorf', 'Ehringshausen',
    'Eschenburg', 'Greifenstein', 'Haiger', 'Herborn', 'Hohenahr', 'Hüttenberg', 'Lahnau', 'Leun', 'Mittenaar',
    'Schöffengrund', 'Siegbach', 'Sinn', 'Solms', 'Waldsolms',
  ],
  'landkreis-giessen': [
    'Allendorf (Lumda)', 'Biebertal', 'Buseck', 'Fernwald', 'Gießen', 'Grünberg', 'Heuchelheim an der Lahn', 'Hungen',
    'Langgöns', 'Laubach', 'Lich', 'Linden', 'Lollar', 'Pohlheim', 'Rabenau', 'Reiskirchen', 'Staufenberg', 'Wettenberg',
  ],
  'landkreis-marburg-biedenkopf': [
    'Angelburg', 'Bad Endbach', 'Biedenkopf', 'Breidenbach', 'Cölbe', 'Dautphetal', 'Ebsdorfergrund', 'Fronhausen',
    'Gladenbach', 'Lahntal', 'Lohra', 'Marburg', 'Steffenberg', 'Weimar (Lahn)', 'Wetter (Hessen)', 'Amöneburg',
  ],
  'landkreis-limburg-weilburg': [
    'Beselich', 'Löhnberg', 'Mengerskirchen', 'Merenberg', 'Runkel', 'Villmar', 'Weilburg', 'Weilmünster', 'Weinbach',
    'Waldbrunn (Westerwald)', 'Limburg an der Lahn',
  ],
  wetteraukreis: ['Butzbach', 'Münzenberg', 'Rockenberg', 'Ober-Mörlen', 'Wölfersheim', 'Bad Nauheim', 'Friedberg (Hessen)'],
  hochtaunuskreis: ['Grävenwiesbach', 'Weilrod', 'Usingen', 'Neu-Anspach', 'Wehrheim'],
  vogelsbergkreis: ['Mücke'],
};

/** Stadt Wetzlar und ihre Stadtteile (OSM: suburb/village innerhalb der Stadt). */
const WETZLAR = ['Blasbach', 'Dutenhofen', 'Garbenheim', 'Hermannstein', 'Münchholzhausen', 'Nauborn', 'Naunheim', 'Steindorf'];

/** Abweichende Schreibweise in OSM (Stand der Messung): amtlicher Name → Name in OSM. */
const OSM_SPELLING = { Münchholzhausen: 'Müchholzhausen' };

/**
 * Einzelne Korrekturen nach der Messung, mit Datum (stehen im Protokoll). Der Wert steht korrigiert in messung.json;
 * die übrigen Orte bleiben wie gemessen.
 */
const CORRECTIONS = [
  {
    date: '2026-10-12',
    name: 'Allendorf (Lumda)',
    text:
      'Die erste Messung hatte den Gießener Stadtteil Allendorf verortet (OSM-Name „Allendorf“, relation/13774226, PLZ 35398, 14 km). ' +
      'Neu verortet über die Gemeindegrenze (OSM relation/418611, Verwaltungssitz Allendorf (Lumda), PLZ 35469) und neu ' +
      'gemessen: 38 km Straße, 34 Minuten. Damit liegt die Stadt außerhalb der 35 km und hat keine Seite.',
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastNominatim = 0;

async function getJson(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de' } });
      if (res.ok) return await res.json();
      if (res.status < 500 && res.status !== 429) throw new Error(`HTTP ${res.status} für ${url}`);
    } catch (err) {
      if (attempt === 4) throw err;
    }
    await sleep(2000 * attempt);
  }
  throw new Error(`keine Antwort: ${url}`);
}

async function nominatim(pathAndQuery) {
  const wait = lastNominatim + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastNominatim = Date.now();
  return getJson(`${NOMINATIM}${pathAndQuery}`);
}

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\(([^)]*)\)/g, '$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function haversineKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const SETTLEMENT_TYPES = new Set(['city', 'town', 'village', 'municipality', 'suburb', 'city_district', 'borough', 'quarter', 'hamlet']);

/** Bestes Nominatim-Ergebnis für eine Gemeinde bzw. einen Stadtteil. */
async function locate(name, { county, city }) {
  const plain = OSM_SPELLING[name] ?? name.replace(/\s*\(.*\)$/, '');
  const params = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', limit: '8', countrycodes: 'de' });
  // Voller amtlicher Name in der Suche: ohne Klammerzusatz findet Nominatim gleichnamige Ortsteile anderer Gemeinden.
  const query = OSM_SPELLING[name] ?? name;
  params.set('q', city ? `${query}, ${city}` : `${query}, ${county}`);
  const results = await nominatim(`/search?${params}`);
  const fits = (r) => {
    const a = r.address ?? {};
    if (!SETTLEMENT_TYPES.has(r.addresstype) && r.type !== 'administrative') return false;
    // Das OSM-Objekt muss den amtlichen Namen tragen (bzw. seine Schreibweise in OSM): „Allendorf (Lumda)“ ist
    // nicht der Gießener Stadtteil „Allendorf“, auch wenn beide im Landkreis Gießen liegen (Korrektur 2026-10-12).
    if (r.name !== (OSM_SPELLING[name] ?? name)) return false;
    if (city) {
      const inCity = [a.municipality, a.city, a.town].includes(city);
      return inCity && [a.suburb, a.city_district, a.village, a.quarter, a.hamlet].includes(plain);
    }
    return a.county === county;
  };
  // Ortsknoten (Stadt, Dorf) vor der Gemeindefläche: Er liegt in der Ortsmitte und trägt meist die PLZ.
  const match =
    results.find((r) => fits(r) && ['city', 'town', 'village'].includes(r.addresstype)) ?? results.find(fits);
  if (!match) return null;
  let postcode = match.address?.postcode;
  if (!postcode) {
    const rev = await nominatim(`/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${match.lat}&lon=${match.lon}`);
    postcode = rev.address?.postcode;
  }
  const osm = `${match.osm_type}/${match.osm_id}`;
  const seat = city ? null : await adminCentre(osm);
  return {
    lat: seat?.lat ?? Number(Number(match.lat).toFixed(5)),
    lng: seat?.lng ?? Number(Number(match.lon).toFixed(5)),
    seat: seat?.name ?? null,
    postcode: postcode ?? null,
    osm,
    osmName: match.name,
    county: match.address?.county ?? null,
  };
}

const OSM_API = 'https://api.openstreetmap.org/api/0.6';

/**
 * Verwaltungssitz einer Gemeinde: Mitglied `admin_centre` der OSM-Gemeindegrenze. Gemeinden ohne
 * gleichnamigen Ort (z. B. Biebertal) haben in OSM nur einen Gemeindepunkt; gemessen wird dann ab
 * dem Sitz der Verwaltung, nicht ab einem Punkt im Wald.
 */
async function adminCentre(osm) {
  const [type, id] = osm.split('/');
  if (type !== 'relation') return null;
  const relation = (await getJson(`${OSM_API}/relation/${id}.json`)).elements?.[0];
  await sleep(500);
  const ref = relation?.members?.find((m) => m.type === 'node' && m.role === 'admin_centre')?.ref;
  if (!ref) return null;
  const node = (await getJson(`${OSM_API}/node/${ref}.json`)).elements?.[0];
  await sleep(500);
  return node ? { lat: Number(node.lat.toFixed(5)), lng: Number(node.lon.toFixed(5)), name: node.tags?.name ?? null } : null;
}

async function route(from, to) {
  const url = `${OSRM}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
  const data = await getJson(url);
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error(`OSRM: ${data.code}`);
  await sleep(700);
  return { km: Math.round(data.routes[0].distance / 1000), minutes: Math.round(data.routes[0].duration / 60) };
}

async function main() {
  const measuredOn = new Date().toISOString().slice(0, 10);
  const hqResults = await nominatim(`/search?${new URLSearchParams({ ...HQ_QUERY, country: 'Deutschland', format: 'jsonv2', limit: '1' })}`);
  if (!hqResults[0]) throw new Error('Firmensitz nicht gefunden');
  const hq = { lat: Number(Number(hqResults[0].lat).toFixed(5)), lng: Number(Number(hqResults[0].lon).toFixed(5)) };
  console.log(`Firmensitz: ${hq.lat}, ${hq.lng}`);

  const jobs = [
    { name: 'Wetzlar', kreisId: 'lahn-dill-kreis', kind: 'stadt', query: { county: KREISE['lahn-dill-kreis'] } },
    ...WETZLAR.map((name) => ({ name, kreisId: 'lahn-dill-kreis', kind: 'stadtteil', query: { city: 'Wetzlar' } })),
    ...Object.entries(CANDIDATES).flatMap(([kreisId, names]) =>
      names.map((name) => ({ name, kreisId, kind: 'gemeinde', query: { county: KREISE[kreisId] } })),
    ),
  ];

  const places = [];
  for (const job of jobs) {
    const base = { id: slugify(job.name), name: job.name, kind: job.kind, kreisId: job.kreisId };
    try {
      const located = await locate(job.name, job.query);
      if (!located) {
        places.push({ ...base, included: false, reason: 'nicht eindeutig in OSM gefunden' });
        console.log(`– ${job.name}: nicht gefunden`);
        continue;
      }
      const air = haversineKm(located, hq);
      const road = air > MAX_ROAD_KM + 2 ? null : await route(located, hq);
      const entry = {
        ...base,
        lat: located.lat,
        lng: located.lng,
        postalCode: located.postcode,
        ...(located.seat && located.seat !== job.name ? { seat: located.seat } : {}),
        osm: located.osm,
        osmName: located.osmName,
        airKm: Math.round(air * 10) / 10,
        ...(road ? { distanceKm: road.km, minutes: road.minutes } : {}),
      };
      if (!road) Object.assign(entry, { included: false, reason: `Luftlinie ${entry.airKm} km > ${MAX_ROAD_KM} km` });
      else if (road.km > MAX_ROAD_KM) Object.assign(entry, { included: false, reason: `Straße ${road.km} km > ${MAX_ROAD_KM} km` });
      else if (road.km < 0.95 * air && air > 1) Object.assign(entry, { included: false, reason: 'Gegenprobe Luftlinie fehlgeschlagen' });
      else if (!located.postcode) Object.assign(entry, { included: false, reason: 'keine Postleitzahl in OSM' });
      else entry.included = true;
      places.push(entry);
      console.log(`${entry.included ? '✓' : '–'} ${job.name}: ${road ? `${road.km} km, ${road.minutes} min` : `${entry.airKm} km Luftlinie`}${entry.reason ? ` (${entry.reason})` : ''}`);
    } catch (err) {
      places.push({ ...base, included: false, reason: `Fehler: ${err.message}` });
      console.log(`! ${job.name}: ${err.message}`);
    }
  }

  const result = {
    measuredOn,
    method: 'OpenStreetMap: Verortung über Nominatim, Strecke und Fahrzeit über OSRM (Profil Auto), Ortsmitte → Firmensitz; gerundet auf ganze km und Minuten',
    headquarters: { address: 'Siegmund-Hiepe-Str. 20, 35578 Wetzlar', ...hq },
    maxRoadKm: MAX_ROAD_KM,
    kreise: KREISE,
    osmSpelling: OSM_SPELLING,
    places,
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(OUT_MD, renderMarkdown(result));
  const included = places.filter((p) => p.included);
  console.log(`\n${included.length} Orte aufgenommen, ${places.length - included.length} nicht. Geschrieben: ${path.relative(ROOT, OUT_JSON)}, ${path.relative(ROOT, OUT_MD)}`);
}

function renderMarkdown(r) {
  const row = (p) =>
    `| ${p.name} | ${p.seat ?? '–'} | ${p.kind} | ${p.postalCode ?? '–'} | ${p.distanceKm ?? '–'} | ${p.minutes ?? '–'} | ${p.airKm ?? '–'} | ${p.included ? 'ja' : `nein: ${p.reason}`} |`;
  const byKreis = Object.keys(r.kreise).map((kreisId) => {
    const list = r.places.filter((p) => p.kreisId === kreisId);
    if (list.length === 0) return '';
    return [`### ${r.kreise[kreisId]}`, '', '| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |', '|---|---|---|---|---|---|---|---|', ...list.map(row), ''].join('\n');
  });
  const included = r.places.filter((p) => p.included).length;
  return `# Ortsvermessung für die Ortsseiten

Stand: ${r.measuredOn} · erzeugt mit \`node scripts/places/measure.mjs\` · Daten: \`lib/places/data/messung.json\`

Quelle aller Strecken, Fahrzeiten, Postleitzahlen und Kreise auf den Ortsseiten (\`/einsatzgebiet/…\`). Die Seite nennt nur, was hier steht. **Freigabe des Inhabers:** offen (Liste prüfen, Orte streichen oder bestätigen). Bis zur Freigabe werden die Ortsseiten nicht gemergt (Plan „Messmethode“, Schritt 4; \`docs/ROADMAP.md\`).

## Methode

- **Firmensitz:** ${r.headquarters.address} (OSM: ${r.headquarters.lat}, ${r.headquarters.lng}).
- **Kandidaten:** alle Gemeinden der Kreise um Wetzlar und die Wetzlarer Stadtteile (Liste im Skript).
- **Verortung:** Nominatim (OpenStreetMap). Messpunkt ist bei Gemeinden der Verwaltungssitz (\`admin_centre\` der Gemeindegrenze in OSM, Spalte „Messpunkt“, wenn er anders heißt als die Gemeinde), bei Wetzlarer Stadtteilen der Ortsmittelpunkt in OSM. Kreis und Postleitzahl kommen aus den OSM-Adressdaten; ein Kandidat zählt nur, wenn OSM den erwarteten Kreis bestätigt.
- **Strecke und Fahrzeit:** OSRM-Routenplaner (OpenStreetMap, Profil Auto, ohne Verkehrslage), Messpunkt → Firmensitz. Gerundet auf ganze Kilometer und ganze Minuten.
- **Regeln:** Aufgenommen wird nur, was höchstens ${r.maxRoadKm} km Straße entfernt liegt (Fakt \`radius35\`). Gegenprobe: Straßenstrecke ≥ 0,95 × Luftlinie.
- **Schreibweise:** ${Object.entries(OSM_SPELLING).map(([name, osm]) => `${name} heißt in OSM „${osm}“`).join('; ')}; die Seite nennt den amtlichen Namen.
- **Gegenprobe Name:** Das OSM-Objekt muss den amtlichen Namen tragen (Feld \`osmName\` in \`messung.json\`, Test in \`lib/places/__tests__/schema.test.ts\`). Gesucht wird mit dem vollen Namen samt Klammerzusatz.
- **Grenzen:** Die Fahrzeit ist ein Richtwert ohne Berufsverkehr. Gemeinden mit mehreren Ortsteilen werden ab dem Verwaltungssitz gemessen; einzelne Ortsteile können näher oder weiter liegen. Der Verwaltungssitz ist der Ort, den OpenStreetMap als \`admin_centre\` der Gemeinde führt; er ist nicht gegen die Anschrift des Rathauses geprüft.

## Korrekturen

${CORRECTIONS.map((c) => `- **${c.date}, ${c.name}:** ${c.text}`).join('\n')}

## Ergebnis

${included} Orte aufgenommen.

${byKreis.join('\n')}
`;
}

// --render-only: nur docs/operations/orte-messung.md aus der vorhandenen messung.json neu schreiben.
const run = process.argv.includes('--render-only')
  ? async () => fs.writeFileSync(OUT_MD, renderMarkdown(JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))))
  : main;

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
