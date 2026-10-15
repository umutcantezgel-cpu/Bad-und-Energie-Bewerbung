#!/usr/bin/env bun
/**
 * Wärmefeld-Löser (E-031, KERN K-010) – PLATZHALTER aus Paket W0. Paket W1 ersetzt dieses Skript durch den Löser, der
 * lib/zeichnung/szenen/waermefeld.ts mit Herkunftskopf schreibt.
 *
 *   bun run zeichnung:waermefeld            # später: rechnet und schreibt die Datei
 *   bun run zeichnung:waermefeld --pruefen  # schreibt nichts, Exit 1, wenn die Datei nicht der Rechnung entspricht
 *
 * Bis dahin prüft `--pruefen` nur die Form der Platzhalter-Datei (drei Felder, Herkunft aus diesem Skript, vier Bänder
 * je Feld) und schreibt nichts. Ohne `--pruefen` bricht das Skript mit Exit 1 ab: Es kann noch nichts rechnen.
 */
import { WAERMEFELDER, type WaermefeldId } from '../../lib/zeichnung/szenen/waermefeld';

const SKRIPT = 'scripts/zeichnung/waermefeld.ts';
const IDS: readonly WaermefeldId[] = ['hausschnitt', 'raum-heizkoerper', 'raum-fussboden'];

if (!process.argv.includes('--pruefen')) {
  console.error('zeichnung:waermefeld: Der Löser fehlt noch (Paket W1); nichts geschrieben.');
  process.exit(1);
}

const fehler: string[] = [];
const ids = Object.keys(WAERMEFELDER).sort();
if (ids.join() !== [...IDS].sort().join()) fehler.push(`Felder ${ids.join(', ')} statt ${IDS.join(', ')}`);
for (const id of IDS) {
  const feld = WAERMEFELDER[id];
  if (!feld) continue;
  if (feld.id !== id) fehler.push(`${id}: id ${feld.id}`);
  if (feld.herkunft.skript !== SKRIPT) fehler.push(`${id}: Herkunft ${feld.herkunft.skript}`);
  if (feld.herkunft.raster !== 2) fehler.push(`${id}: Raster ${feld.herkunft.raster}`);
  if (feld.baender.map((b) => b.stufe).join() !== '1,2,3,4') fehler.push(`${id}: Stufen ${feld.baender.map((b) => b.stufe).join()}`);
}

if (fehler.length > 0) {
  for (const f of fehler) console.error(`❌ ${f}`);
  process.exit(1);
}
console.log(`✅ zeichnung:waermefeld --pruefen: ${IDS.length} Felder in der Form des Vertrags (Platzhalter, eingabeHash ${WAERMEFELDER.hausschnitt.herkunft.eingabeHash}).`);
