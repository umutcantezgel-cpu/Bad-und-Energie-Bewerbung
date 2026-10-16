// JSON-LD-Werkzeug (Auftrag E0). Liest je Seite alle <script type="application/ld+json">-Blöcke aus dem
// ausgelieferten HTML (reiner HTTP-Abruf), listet die Knoten des @graph nach @type auf und vergleicht optional
// mit einem früheren Stand (--vergleich <alte jsonld.json>).
import { readFile } from 'node:fs/promises';
import {
  abrufen,
  alsHauptprogramm,
  attribute,
  ausgabeOrdner,
  ausschreiben,
  basisAus,
  listeAus,
  pflicht,
  projektAus,
  seitenliste,
} from './gemeinsam.mjs';

const NUTZUNG = `JSON-LD-Werkzeug (Auftrag E0): alle ld+json-Blöcke je Seite, Knoten des @graph nach @type,
WebSite-Knoten vollständig; optional Vergleich mit einem früheren Stand.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/jsonld.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0 --seiten /,/jobs
Vergleich: --vergleich _werkstatt/nennung/protokolle/roh/e0/jsonld.json (der frühere Stand)
Ohne --seiten werden alle Seiten der Seitenliste geprüft.
Ausgabe: jsonld.json (alle Knoten vollständig, Feld knoten) und bei --vergleich jsonld-vergleich.md.`;

function typVon(knoten) {
  if (!knoten || typeof knoten !== 'object') return '(kein Objekt)';
  const typ = knoten['@type'];
  if (Array.isArray(typ)) return typ.join('+');
  return typeof typ === 'string' ? typ : '(ohne @type)';
}

function idVon(knoten) {
  return knoten && typeof knoten === 'object' && typeof knoten['@id'] === 'string' ? knoten['@id'] : '';
}

/** Knoten eines JSON-LD-Dokuments: das Array, der @graph oder das Objekt selbst. */
function knotenVon(daten) {
  if (Array.isArray(daten)) return daten.flatMap(knotenVon);
  if (daten && typeof daten === 'object' && Array.isArray(daten['@graph'])) return daten['@graph'];
  return [daten];
}

/** Alle JSON-LD-Blöcke einer Seite; ein Block mit Syntaxfehler bleibt sichtbar, statt zu verschwinden. */
export function jsonLdBloecke(html) {
  const bloecke = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const typ = (attribute(m[1]).type ?? '').split(';')[0].trim().toLowerCase();
    if (typ !== 'application/ld+json') continue;
    const nr = bloecke.length + 1;
    let daten;
    try {
      daten = JSON.parse(m[2]);
    } catch (fehler) {
      bloecke.push({ nr, fehler: fehler.message, anfang: m[2].trim().slice(0, 160), typen: [], knoten: [] });
      continue;
    }
    const knoten = knotenVon(daten).map((k) => ({ typ: typVon(k), id: idVon(k), daten: k }));
    bloecke.push({
      nr,
      fehler: '',
      kontext: daten && typeof daten === 'object' ? (daten['@context'] ?? null) : null,
      typen: knoten.map((k) => k.typ),
      knoten,
    });
  }
  return bloecke;
}

/** Knoten einer Seite nach Typ und @id; gleiche Schlüssel bekommen #2, #3 … */
function schluesselKnoten(seite) {
  const zaehler = new Map();
  const karte = new Map();
  for (const block of seite.bloecke) {
    for (const k of block.knoten) {
      const basis = `${k.typ}|${k.id}`;
      const n = (zaehler.get(basis) ?? 0) + 1;
      zaehler.set(basis, n);
      karte.set(n === 1 ? basis : `${basis}#${n}`, k.daten);
    }
  }
  return karte;
}

/** Verschachtelten Wert in Pfad → Textwert auflösen, damit Felder einzeln verglichen werden können. */
function flach(wert, pfad = '', ziel = {}) {
  if (Array.isArray(wert)) {
    if (wert.length === 0) ziel[pfad] = '[]';
    wert.forEach((eintrag, index) => flach(eintrag, `${pfad}[${index}]`, ziel));
  } else if (wert && typeof wert === 'object') {
    const namen = Object.keys(wert).sort();
    if (namen.length === 0) ziel[pfad] = '{}';
    for (const name of namen) flach(wert[name], pfad ? `${pfad}.${name}` : name, ziel);
  } else {
    ziel[pfad] = JSON.stringify(wert) ?? 'undefined';
  }
  return ziel;
}

const kurz = (text) => (text.length > 160 ? `${text.slice(0, 157)}…` : text);

function vergleichMd(alt, neu, altDatei) {
  const altSeiten = new Map(alt.seiten.map((s) => [s.seite, s]));
  const neuSeiten = new Map(neu.seiten.map((s) => [s.seite, s]));
  const alle = [...new Set([...altSeiten.keys(), ...neuSeiten.keys()])];
  let mitUnterschied = 0;
  const abschnitte = [];
  for (const seite of alle) {
    const a = altSeiten.get(seite);
    const n = neuSeiten.get(seite);
    const punkte = [];
    if (!a) {
      punkte.push('- Seite nur im neuen Stand');
    } else if (!n) {
      punkte.push('- Seite nur im alten Stand');
    } else {
      if (a.status !== n.status) punkte.push(`- Status ${a.status} → ${n.status}`);
      if (a.bloecke.length !== n.bloecke.length) punkte.push(`- Anzahl JSON-LD-Blöcke ${a.bloecke.length} → ${n.bloecke.length}`);
      const fehlerAlt = a.bloecke.filter((b) => b.fehler).length;
      const fehlerNeu = n.bloecke.filter((b) => b.fehler).length;
      if (fehlerAlt !== fehlerNeu) punkte.push(`- Blöcke mit Syntaxfehler ${fehlerAlt} → ${fehlerNeu}`);
      const knotenAlt = schluesselKnoten(a);
      const knotenNeu = schluesselKnoten(n);
      for (const schluessel of [...new Set([...knotenAlt.keys(), ...knotenNeu.keys()])].sort()) {
        if (!knotenAlt.has(schluessel)) {
          punkte.push(`- neuer Knoten ${schluessel}`);
          continue;
        }
        if (!knotenNeu.has(schluessel)) {
          punkte.push(`- entfernter Knoten ${schluessel}`);
          continue;
        }
        const feldA = flach(knotenAlt.get(schluessel));
        const feldN = flach(knotenNeu.get(schluessel));
        for (const feld of [...new Set([...Object.keys(feldA), ...Object.keys(feldN)])].sort()) {
          if (feldA[feld] === feldN[feld]) continue;
          punkte.push(
            `- Knoten ${schluessel}, Feld \`${feld || '(Wurzel)'}\`: ${kurz(feldA[feld] ?? '(fehlt)')} → ${kurz(feldN[feld] ?? '(fehlt)')}`,
          );
        }
      }
    }
    if (punkte.length) mitUnterschied += 1;
    abschnitte.push(`## ${seite}`, ...(punkte.length ? punkte : ['- keine Unterschiede']), '');
  }
  return [
    '# JSON-LD-Vergleich',
    '',
    `- Alt: ${altDatei} (Stand ${alt.erstellt ?? 'unbekannt'}, Basis ${alt.basis ?? 'unbekannt'})`,
    `- Neu: ${neu.basis} (Stand ${neu.erstellt})`,
    `- Seiten verglichen: ${alle.length}; mit Unterschieden: ${mitUnterschied}`,
    '',
    ...abschnitte,
  ].join('\n');
}

/** Ausgabe der WebSite-Knoten vollständig; gleiche Knoten werden einmal gezeigt, mit der Liste ihrer Seiten. */
function websiteAusgabe(seiten) {
  const gruppen = new Map();
  for (const seite of seiten) {
    for (const block of seite.bloecke) {
      for (const k of block.knoten) {
        if (k.typ !== 'WebSite') continue;
        const json = JSON.stringify(k.daten, null, 2);
        if (!gruppen.has(json)) gruppen.set(json, []);
        gruppen.get(json).push(seite.seite);
      }
    }
  }
  if (gruppen.size === 0) console.log('WebSite-Knoten: keine gefunden');
  for (const [json, orte] of gruppen) {
    console.log(`WebSite-Knoten auf ${orte.length} Seite(n) (${orte.join(', ')}):\n${json}`);
  }
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  // Der alte Stand wird vor dem Schreiben gelesen, falls er im selben Ordner liegt.
  const altDatei = args.vergleich === undefined ? null : pflicht(args, 'vergleich');
  const alt = altDatei ? JSON.parse(await readFile(altDatei, 'utf8')) : null;

  const pfade =
    args.seiten === undefined
      ? (await seitenliste({ basis, projekt: projektAus(args) })).seiten.map((s) => s.pfad)
      : listeAus(args.seiten, '/');
  const seiten = [];
  for (const pfad of pfade) {
    const url = `${basis}${pfad}`;
    const antwort = await abrufen(url);
    const bloecke = jsonLdBloecke(antwort.text);
    seiten.push({ seite: pfad, url, status: antwort.status, bloecke });
    const fehlerzahl = bloecke.filter((b) => b.fehler).length;
    console.log(`${pfad}  Status ${antwort.status}  Blöcke ${bloecke.length}  Syntaxfehler ${fehlerzahl}`);
  }

  const ergebnis = { erstellt: new Date().toISOString(), basis, seiten };
  await ausschreiben(aus, 'jsonld.json', `${JSON.stringify(ergebnis, null, 2)}\n`);
  websiteAusgabe(seiten);
  if (alt) await ausschreiben(aus, 'jsonld-vergleich.md', vergleichMd(alt, ergebnis, altDatei));
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
