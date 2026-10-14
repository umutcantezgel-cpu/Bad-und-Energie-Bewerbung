/**
 * Fußwege auf dem Wegenetz für scripts/places/oepnv.mjs: Ortsmitte → Start-Haltestellen und Ziel-Haltestellen →
 * Firmensitz bzw. Schule. Quelle ist der OSRM-Routenplaner mit Profil Fuß auf OpenStreetMap-Daten
 * (routing.openstreetmap.de, FOSSGIS), Dienst „table“: eine Anfrage je Punkt mit allen Haltestellen.
 * Die Länge zählt, nicht die Zeit des Dienstes; daraus wird mit 80 m/min gerechnet (raptor.mjs).
 *
 * Höchstens eine Anfrage je Sekunde. Mit Cache-Datei wird jede Strecke nur einmal angefragt.
 */

import fs from 'node:fs';

const OSRM_FUSS = 'https://routing.openstreetmap.de/routed-foot/table/v1/driving';
const USER_AGENT = 'karriere.bad-energie.de Ortsvermessung (https://karriere.bad-energie.de)';
/** So viele Ziele je Anfrage (der Dienst begrenzt die Größe einer Tabelle). */
const JE_ANFRAGE = 80;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let letzteAnfrage = 0;

async function frage(url) {
  for (let versuch = 1; versuch <= 4; versuch++) {
    const warten = letzteAnfrage + 1100 - Date.now();
    if (warten > 0) await sleep(warten);
    letzteAnfrage = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
      if (res.ok) {
        const json = await res.json();
        if (json.code === 'Ok') return json;
        throw new Error(`OSRM: ${json.code} ${json.message ?? ''}`);
      }
      if (res.status < 500 && res.status !== 429) throw new Error(`HTTP ${res.status} für ${url}`);
    } catch (err) {
      if (versuch === 4) throw err;
    }
    await sleep(2000 * versuch);
  }
  throw new Error(`keine Antwort: ${url}`);
}

const punktSchluessel = (p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

/**
 * Wegelängen in Metern von `punkt` zu jeder Haltestelle in `halte` ([{ id, lat, lng }]); null, wo der Dienst
 * keinen Weg findet. Der Abstand vom Punkt bzw. von der Haltestelle zum nächsten Weg (Einrasten) zählt mit.
 */
export async function wegelaengen(punkt, halte, cache) {
  const key = punktSchluessel(punkt);
  const bekannt = cache?.daten[key] ?? {};
  const fehlend = halte.filter((h) => !(h.id in bekannt));
  for (let i = 0; i < fehlend.length; i += JE_ANFRAGE) {
    const teil = fehlend.slice(i, i + JE_ANFRAGE);
    const koordinaten = [punkt, ...teil].map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
    const json = await frage(`${OSRM_FUSS}/${koordinaten}?sources=0&annotations=distance`);
    const einrastenStart = json.sources[0].distance ?? 0;
    teil.forEach((h, j) => {
      const d = json.distances[0][j + 1];
      bekannt[h.id] = d === null || d === undefined ? null : Math.round(d + einrastenStart + (json.destinations[j + 1].distance ?? 0));
    });
  }
  if (cache && fehlend.length) {
    cache.daten[key] = bekannt;
    cache.speichern();
  }
  return halte.map((h) => bekannt[h.id]);
}

/** Cache in einer JSON-Datei außerhalb des Repos (oder nur im Speicher ohne Pfad). */
export function oeffneCache(datei) {
  const daten = datei && fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, 'utf8')) : {};
  return {
    daten,
    speichern() {
      if (datei) fs.writeFileSync(datei, JSON.stringify(daten));
    },
  };
}
