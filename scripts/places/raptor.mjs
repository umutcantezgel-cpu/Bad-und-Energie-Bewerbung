/**
 * Routing für scripts/places/oepnv.mjs: RAPTOR (Delling, Pajor, Werneck 2012) über einen Tagesfahrplan,
 * mit Fußwegen zwischen nahen Haltestellen. Rein und ohne Dateizugriff, damit es Vitest prüfen kann
 * (lib/places/__tests__/oepnv-raptor.test.ts).
 *
 * Zeiten sind Sekunden seit Mitternacht des gewählten Werktags. Ein Netz besteht aus
 * - stops:  [{ id, name, lat, lng }]
 * - routes: [{ id, short, type }]
 * - trips:  [{ id, route, stops: [Index], arr: [s], dep: [s], board: [bool], alight: [bool] }]
 *   (`board`/`alight` falsch, wo GTFS pickup_type bzw. drop_off_type = 1 sagt: kein Ein- bzw. Ausstieg).
 */

/** Gehgeschwindigkeit 80 m/min (4,8 km/h), wie im Auftrag. */
export const GEH_M_PRO_MIN = 80;
/** Fußwege laufen nie gerade: Luftlinie × 1,3 (Umwegzuschlag, konservativ). */
export const UMWEG_FAKTOR = 1.3;
/** Umstieg zu Fuß nur bis zu dieser Luftlinie zwischen zwei Haltestellen. */
export const UMSTIEG_MAX_M = 400;
/** Mindestzeit für jeden Umstieg, auch am selben Steig. */
export const UMSTIEG_MIN_S = 120;
/**
 * Umstieg zu einer anderen Haltestelle: Gehzeit plus eine Minute, um den Steig zu finden. Ohne den Puffer rechnete
 * die Gegenprobe (scripts/places/oepnv-gegenprobe.mjs) knappe Umstiege, die Transitous nicht anbietet (Wetzlar: Zug
 * an 07:26, Bus ab 07:29), und stimmte seltener überein (20 statt 21 von 28 Vergleichen).
 */
export const UMSTIEG_PUFFER_S = 60;
/** Höchstens so viele Fahrten (Fahrzeuge) je Verbindung, also 4 Umstiege. */
export const MAX_FAHRTEN = 5;

const NIE = Number.POSITIVE_INFINITY;

export function haversineM(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** Gehzeit für eine Luftlinie in Metern, aufgerundet auf volle Minuten (in Sekunden). */
export function gehSekunden(luftlinieM) {
  return gehSekundenWeg(luftlinieM * UMWEG_FAKTOR);
}

/** Gehzeit für einen Weg auf dem Wegenetz (Länge in Metern, schon mit allen Umwegen), aufgerundet auf volle Minuten. */
export function gehSekundenWeg(wegM) {
  return Math.ceil(wegM / GEH_M_PRO_MIN) * 60;
}

/** Haltestellen in der Nähe eines Punkts, nach Entfernung (Raster aus ~1 km großen Zellen). */
export function bauePunktsuche(stops) {
  const zelle = (lat, lng) => `${Math.floor(lat * 100)}:${Math.floor(lng * 70)}`;
  const raster = new Map();
  stops.forEach((stop, index) => {
    const key = zelle(stop.lat, stop.lng);
    if (!raster.has(key)) raster.set(key, []);
    raster.get(key).push(index);
  });
  return function inDerNaehe(punkt, maxM) {
    const ringe = Math.ceil(maxM / 1000) + 1;
    const la = Math.floor(punkt.lat * 100);
    const ln = Math.floor(punkt.lng * 70);
    const treffer = [];
    for (let i = -ringe; i <= ringe; i++) {
      for (let j = -ringe; j <= ringe; j++) {
        for (const index of raster.get(`${la + i}:${ln + j}`) ?? []) {
          const m = haversineM(punkt, stops[index]);
          if (m <= maxM) treffer.push({ stop: index, m });
        }
      }
    }
    return treffer.sort((a, b) => a.m - b.m || a.stop - b.stop);
  };
}

/** Fährt `b` an keiner Haltestelle vor `a` ab bzw. kommt früher an (kein Überholen)? */
function folgtAuf(a, b) {
  for (let i = 0; i < a.dep.length; i++) if (b.dep[i] < a.dep[i] || b.arr[i] < a.arr[i]) return false;
  return true;
}

/**
 * Bereitet ein Netz für RAPTOR vor: Fahrten mit gleicher Haltestellenfolge und gleichen Ein-/Ausstiegsverboten
 * werden zu Mustern, sortiert nach Abfahrt; überholt eine Fahrt eine andere, bekommt sie ein eigenes Muster
 * (RAPTOR setzt die Reihenfolge voraus). Dazu die Fußwege zwischen Haltestellen bis UMSTIEG_MAX_M Luftlinie;
 * oepnv.mjs ersetzt sie an Bahnhöfen durch Wege aus dem Wegenetz.
 */
export function baueFahrplan(netz) {
  const gruppen = new Map();
  const flags = (liste) => liste.map((erlaubt) => (erlaubt ? '1' : '0')).join('');
  for (const trip of netz.trips) {
    if (trip.stops.length < 2) continue;
    // Gleiche Halte und gleiche Ein-/Ausstiegsverbote: Sonst nähme RAPTOR die früheste Fahrt, die am Ziel nicht hält.
    const key = `${trip.stops.join(',')}|${flags(trip.board)}|${flags(trip.alight)}`;
    if (!gruppen.has(key)) gruppen.set(key, []);
    gruppen.get(key).push(trip);
  }
  const muster = [];
  for (const key of [...gruppen.keys()].sort()) {
    const trips = gruppen.get(key).sort((a, b) => a.dep[0] - b.dep[0] || a.arr.at(-1) - b.arr.at(-1) || (a.id < b.id ? -1 : 1));
    const teile = [];
    for (const trip of trips) {
      const teil = teile.find((t) => folgtAuf(t.at(-1), trip));
      if (teil) teil.push(trip);
      else teile.push([trip]);
    }
    for (const teil of teile) muster.push({ stops: teil[0].stops, trips: teil });
  }

  const musterAnHalt = Array.from({ length: netz.stops.length }, () => []);
  muster.forEach((m, mi) => m.stops.forEach((stop, i) => musterAnHalt[stop].push([mi, i])));

  const inDerNaehe = bauePunktsuche(netz.stops);
  const fusswege = netz.stops.map((stop, index) =>
    inDerNaehe(stop, UMSTIEG_MAX_M)
      .filter((t) => t.stop !== index)
      .map((t) => ({ stop: t.stop, s: gehSekunden(t.m) })),
  );

  return { netz, muster, musterAnHalt, fusswege, inDerNaehe };
}

/**
 * RAPTOR für eine Abfahrtszeit. `quellen`: [{ stop, s }] Haltestellen am Start mit Gehzeit ab Ortsmitte;
 * `ziele`: Map Haltestelle → Gehzeit bis zum Ziel. Liefert je Runde (Zahl der Fahrten 1 … maxFahrten) die
 * früheste Ankunft am Ziel mit den Teilstrecken, sofern sie früher ist als in den Runden davor.
 *
 * Herkunftszeiger tragen ihre Runde: Ein Wert, der aus einer früheren Runde übernommen wurde, führt bei der
 * Rückverfolgung in genau diese Runde zurück. Fußwege gehen nur von Haltestellen aus, die in derselben Runde
 * per Fahrzeug erreicht wurden (eine Stufe, keine Ketten).
 */
export function raptor(fahrplan, { abfahrt, quellen, ziele, maxFahrten = MAX_FAHRTEN }) {
  const { netz, muster, musterAnHalt, fusswege } = fahrplan;
  const n = netz.stops.length;
  /** bereit[k][s]: früheste Zeit, ab der man nach höchstens k Fahrten an s in ein Fahrzeug steigen kann. */
  const bereit = [new Float64Array(n).fill(NIE)];
  const herkunft = [new Array(n).fill(null)];
  const besteBereit = new Float64Array(n).fill(NIE);
  let markiert = new Set();

  for (const quelle of quellen) {
    const t = abfahrt + quelle.s;
    if (t < bereit[0][quelle.stop]) {
      bereit[0][quelle.stop] = t;
      besteBereit[quelle.stop] = t;
      herkunft[0][quelle.stop] = { art: 'zugang', s: quelle.s };
      markiert.add(quelle.stop);
    }
  }

  const ergebnisse = [];
  let besteAnkunft = NIE;

  for (let k = 1; k <= maxFahrten && markiert.size > 0; k++) {
    const vorher = bereit[k - 1];
    const jetzt = Float64Array.from(vorher);
    const herkunftJetzt = herkunft[k - 1].slice();
    bereit.push(jetzt);
    herkunft.push(herkunftJetzt);

    const warteschlange = new Map();
    for (const stop of markiert) {
      for (const [mi, i] of musterAnHalt[stop]) {
        const bisher = warteschlange.get(mi);
        if (bisher === undefined || i < bisher) warteschlange.set(mi, i);
      }
    }
    /** In dieser Runde per Fahrzeug erreicht: Haltestelle → Herkunft (Stand vor den Fußwegen). */
    const perFahrt = new Map();
    let zielRunde = null;

    for (const mi of [...warteschlange.keys()].sort((a, b) => a - b)) {
      const m = muster[mi];
      let fahrt = null;
      let einstieg = -1;
      for (let i = warteschlange.get(mi); i < m.stops.length; i++) {
        const stop = m.stops[i];
        if (fahrt && fahrt.alight[i]) {
          const an = fahrt.arr[i];
          const umstieg = an + UMSTIEG_MIN_S;
          if (umstieg < besteBereit[stop] && an < besteAnkunft) {
            const h = { art: 'fahrt', runde: k, fahrt, von: einstieg, bis: i, an };
            jetzt[stop] = umstieg;
            besteBereit[stop] = umstieg;
            herkunftJetzt[stop] = h;
            perFahrt.set(stop, h);
          }
          const egress = ziele.get(stop);
          // Bei gleicher Ankunft am Ziel gewinnt in derselben Runde der kürzere Fußweg (später aussteigen).
          const kuerzer = zielRunde !== null && an + egress === besteAnkunft && egress < zielRunde.egress;
          if (egress !== undefined && (an + egress < besteAnkunft || kuerzer)) {
            besteAnkunft = an + egress;
            zielRunde = { art: 'fahrt', runde: k, fahrt, von: einstieg, bis: i, an, stop, egress };
          }
        }
        const t = vorher[stop];
        if (t < NIE && (!fahrt || t <= fahrt.dep[i])) {
          // Früheste Fahrt des Musters, die hier noch erreichbar ist und Einstieg erlaubt (Muster überholen nicht).
          for (const kandidat of m.trips) {
            if (kandidat.dep[i] >= t && kandidat.board[i]) {
              if (!fahrt || kandidat.dep[i] < fahrt.dep[i]) {
                fahrt = kandidat;
                einstieg = i;
              }
              break;
            }
          }
        }
      }
    }

    const neu = new Set(perFahrt.keys());
    for (const [stop, h] of perFahrt) {
      for (const weg of fusswege[stop]) {
        const t = h.an + Math.max(UMSTIEG_MIN_S, weg.s + UMSTIEG_PUFFER_S);
        if (t < besteBereit[weg.stop] && t < besteAnkunft) {
          jetzt[weg.stop] = t;
          besteBereit[weg.stop] = t;
          herkunftJetzt[weg.stop] = { art: 'fuss', runde: k, von: stop, s: weg.s, ueber: h };
          neu.add(weg.stop);
        }
      }
    }

    if (zielRunde) ergebnisse.push(rekonstruiere(herkunft, zielRunde, abfahrt));
    markiert = neu;
  }
  return ergebnisse;
}

/** Teilstrecken einer Verbindung rückwärts aus den Herkunftszeigern. */
function rekonstruiere(herkunft, ziel, abfahrt) {
  const teile = [];
  let leg = ziel;
  for (;;) {
    /** @type {{ fahrt: any, von: number, bis: number, fussVorher?: { von: number, s: number } }} */
    const teil = { fahrt: leg.fahrt, von: leg.von, bis: leg.bis };
    teile.unshift(teil);
    let h = herkunft[leg.runde - 1][leg.fahrt.stops[leg.von]];
    if (h && h.art === 'fuss') {
      teil.fussVorher = { von: h.von, s: h.s };
      h = h.ueber;
    }
    if (!h) throw new Error('RAPTOR: Herkunft fehlt');
    if (h.art === 'zugang') {
      const erste = teile[0];
      const abfahrtHalt = erste.fahrt.dep[erste.von];
      return {
        fahrten: teile.length,
        zugangS: h.s,
        abfahrt: abfahrtHalt,
        losgehen: abfahrtHalt - h.s,
        suchbeginn: abfahrt,
        ankunftHalt: ziel.an,
        zielStop: ziel.stop,
        egressS: ziel.egress,
        ankunft: ziel.an + ziel.egress,
        teile,
      };
    }
    leg = h;
  }
}

/**
 * Alle Verbindungen eines Orts in einem Zeitfenster: RAPTOR für jede mögliche Abfahrt an den Start-Haltestellen
 * (Losgehen ab Ortsmitte zwischen vonS und bisS). `alle` enthält jede gefundene Verbindung, `profil` nur die
 * nicht überholten (nichtUeberholt).
 */
export function verbindungsprofil(fahrplan, { quellen, ziele, vonS, bisS, maxFahrten = MAX_FAHRTEN }) {
  const { muster, musterAnHalt } = fahrplan;
  const startzeiten = new Set();
  for (const quelle of quellen) {
    for (const [mi, i] of musterAnHalt[quelle.stop]) {
      for (const fahrt of muster[mi].trips) {
        const los = fahrt.dep[i] - quelle.s;
        if (fahrt.board[i] && los >= vonS && los <= bisS) startzeiten.add(los);
      }
    }
  }
  const alle = [];
  for (const start of [...startzeiten].sort((a, b) => b - a)) {
    for (const v of raptor(fahrplan, { abfahrt: start, quellen, ziele, maxFahrten })) alle.push(v);
  }
  return { alle, profil: nichtUeberholt(alle) };
}

/**
 * Nur Verbindungen, die keine andere überholt: Keine geht später los und kommt früher oder gleich an. Bei gleicher
 * Ab- und Ankunft bleibt die mit weniger Fahrten. Ergebnis nach Losgehen aufsteigend.
 */
export function nichtUeberholt(verbindungen) {
  const sortiert = [...verbindungen].sort((a, b) => b.losgehen - a.losgehen || a.ankunft - b.ankunft || a.fahrten - b.fahrten);
  const profil = [];
  let besteAnkunft = NIE;
  for (const v of sortiert) {
    if (v.ankunft < besteAnkunft) {
      profil.push(v);
      besteAnkunft = v.ankunft;
    }
  }
  return profil.reverse();
}
