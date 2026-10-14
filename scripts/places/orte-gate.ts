#!/usr/bin/env bun
/**
 * Indexierungs-Gate der Ortsseiten (E-029, ROADMAP §10.1): rechnet I1–I6 für alle veröffentlichten Orte
 * (lib/places/qualitaet.ts) und schreibt das Ergebnis nach lib/places/data/indexierung.json. Von Hand gepflegt bleibt
 * dort nur `zurueckgenommen` (120-Tage-Regel, docs/operations/orte-monitoring.md); das Skript übernimmt es.
 *
 *   bun run orte:gate            # schreibt die Lock-Datei und den Bericht
 *   bun run orte:gate --pruefen  # schreibt nichts, Exit 1, wenn die Datei nicht der Rechnung entspricht
 *
 * Läuft mit bun, weil das Gate die Texte der Seiten aus TypeScript-Modulen rechnet (Pfade mit @/ wie in tsconfig.json).
 * Den Gleichstand erzwingt auch lib/places/__tests__/qualitaet.test.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GATE, indexierungDatei, pruefeOrte, type IndexierungDatei } from '../../lib/places/qualitaet';

const DATEI = fileURLToPath(new URL('../../lib/places/data/indexierung.json', import.meta.url));

function lies(): IndexierungDatei | null {
  try {
    return JSON.parse(readFileSync(DATEI, 'utf8')) as IndexierungDatei;
  } catch {
    return null;
  }
}

const bisher = lies();
const zurueckgenommen = bisher?.zurueckgenommen ?? {};
const ergebnisse = pruefeOrte({ zurueckgenommen });
const neu = `${JSON.stringify(indexierungDatei(ergebnisse, zurueckgenommen), null, 2)}\n`;

const bestanden = ergebnisse.filter((e) => e.indexierbar);
const fmt = (wert: number) => wert.toFixed(3);
const top = (key: 'jaccardGanz' | 'jaccardOrt') =>
  [...ergebnisse]
    .sort((a, b) => b.werte[key] - a.werte[key])
    .slice(0, 3)
    .map((e) => `${e.placeId} ${fmt(e.werte[key])}`)
    .join(', ');
const knapp = [...ergebnisse].sort((a, b) => a.werte.datenAnteil - b.werte.datenAnteil)[0];

console.log(`Gate der Ortsseiten: ${bestanden.length}/${ergebnisse.length} indexierbar.`);
console.log(`  I4 Textmodell, höchste Jaccard-Werte unter Indexierbaren: ganz ${top('jaccardGanz')} (Grenze ${GATE.maxJaccardWholeIndexierbar}); Ortsblöcke ${top('jaccardOrt')} (Grenze ${GATE.maxJaccardOrtIndexierbar}).`);
console.log(`  I3 knappster Anteil aus Daten: ${knapp.placeId} ${(knapp.werte.datenAnteil * 100).toFixed(1)} % (${knapp.werte.datenWoerter} Wörter).`);
console.log(`  I5 Daten gelten bis ${[...new Set(ergebnisse.map((e) => e.gueltigBis))].join(', ')}.`);
for (const e of ergebnisse.filter((x) => !x.indexierbar)) console.log(`  noindex ${e.placeId}: ${e.gruende.join(' · ')}`);
console.log('  Das gebaute HTML prüft danach bun run build && bun run test:similarity (Grenze 0,40).');

if (process.argv.includes('--pruefen')) {
  if (bisher === null || `${JSON.stringify(bisher, null, 2)}\n` !== neu) {
    console.error('lib/places/data/indexierung.json entspricht nicht der Rechnung: bun run orte:gate ausführen und den Diff prüfen.');
    process.exit(1);
  }
  console.log('lib/places/data/indexierung.json ist aktuell.');
} else {
  writeFileSync(DATEI, neu);
  console.log(`Geschrieben: ${path.relative(process.cwd(), DATEI)}`);
}
