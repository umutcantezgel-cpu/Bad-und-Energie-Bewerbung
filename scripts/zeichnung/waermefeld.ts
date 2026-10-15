#!/usr/bin/env bun
/**
 * Wärmefeld-Löser (E-031, KERN K-010): rechnet die Wärmefelder des Hausschnitts und der beiden Vergleichsräume
 * (lib/zeichnung/waerme/rechnung.ts) und schreibt lib/zeichnung/szenen/waermefeld.ts mit Herkunft.
 *
 *   bun run zeichnung:waermefeld            # rechnet und schreibt die Datei
 *   bun run zeichnung:waermefeld --pruefen  # schreibt nichts, Exit 1, wenn die Datei nicht der Rechnung entspricht
 *
 * Bitgleich in bun und Node/V8 (nur +, −, ×, ÷ und sqrt), darum prüft auch der Lock-Test in vitest gegen dieselbe
 * Rechnung. Bricht ab, wenn das heißeste Band nicht zuerst ankommt oder zwei Bänder auf denselben halben Takt fallen.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { DATEI, berechneWaermefelder, dateiText } from '../../lib/zeichnung/waerme/rechnung';

const pruefen = process.argv.includes('--pruefen');
const ziel = fileURLToPath(new URL(`../../${DATEI}`, import.meta.url));

const beginn = performance.now();
let rechnung: ReturnType<typeof berechneWaermefelder>;
try {
  rechnung = berechneWaermefelder();
} catch (fehler) {
  console.error(`❌ zeichnung:waermefeld: ${fehler instanceof Error ? fehler.message : String(fehler)}`);
  process.exit(1);
}
const dauer = Math.round(performance.now() - beginn);
const text = dateiText(rechnung.felder);

for (const f of rechnung.felder) {
  const gz = gzipSync(Buffer.from(f.baender.map((b) => b.d).join('')), { level: 9 }).length;
  console.log(
    `  ${f.id}: Schwellen ${f.baender.map((b) => b.schwelle).join(' / ')}, Start ${f.baender.map((b) => b.startTakte).join(' / ')} Takte, ` +
      `${f.herkunft.iterationen} ${f.herkunft.iterationen === 1 ? 'Lösung' : 'Lösungen'}, Rest ${f.herkunft.residuum.toExponential(1)}, Pfade ${gz} B gzip`,
  );
}

if (pruefen) {
  const vorhanden = readFileSync(ziel, 'utf8');
  if (vorhanden !== text) {
    console.error(`❌ zeichnung:waermefeld --pruefen: ${DATEI} entspricht nicht der Rechnung (bun run zeichnung:waermefeld).`);
    process.exit(1);
  }
  console.log(`✅ zeichnung:waermefeld --pruefen: ${DATEI} entspricht der Rechnung (eingabeHash ${rechnung.felder[0].herkunft.eingabeHash}, ${dauer} ms).`);
} else {
  writeFileSync(ziel, text);
  console.log(`✅ zeichnung:waermefeld: ${DATEI} geschrieben (eingabeHash ${rechnung.felder[0].herkunft.eingabeHash}, ${dauer} ms).`);
}
