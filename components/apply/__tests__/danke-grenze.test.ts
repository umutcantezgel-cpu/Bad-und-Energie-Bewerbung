import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Grenze vor dem CSS der Danke-Seite (E-031, Prüfrunde 2 C2-1), wie components/themen/__tests__/stil.test.ts:
 * danke.module.css kommt nur über components/apply/thanks/stil.ts, und dort steht unmittelbar davor die leere globale
 * Grenze danke-grenze.css. Die Wirkung (die Regeln stehen nur auf /bewerbung/danke) prüft der Build
 * (scripts/qa/check-css-chunks.mjs); hier steht, dass die Voraussetzung im Quelltext hält.
 */
const WURZEL = path.resolve(__dirname, '../../..');
const ORDNER = path.join(WURZEL, 'components/apply/thanks');

function quellen(dir: string, out: string[] = []): string[] {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '__tests__'].includes(eintrag.name) || eintrag.name.startsWith('.')) continue;
    const voll = path.join(dir, eintrag.name);
    if (eintrag.isDirectory()) quellen(voll, out);
    else if (/\.(tsx?|mjs|css)$/.test(eintrag.name)) out.push(voll);
  }
  return out;
}

describe('Danke-Seite: CSS nur über stil.ts mit der Grenze davor', () => {
  const alle = ['app', 'components', 'lib'].flatMap((d) => quellen(path.join(WURZEL, d)));

  it('stil.ts importiert zuerst die Grenze, unmittelbar danach danke.module.css', () => {
    const stil = readFileSync(path.join(ORDNER, 'stil.ts'), 'utf8');
    const importe = [...stil.matchAll(/^import\s+(?:[\w{}\s,*]+\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
    expect(importe).toEqual(['./danke-grenze.css', './danke.module.css']);
  });

  it('niemand sonst importiert danke.module.css oder die Grenze; die Danke-Bausteine holen ihre Klassen über stil.ts', () => {
    const fremd = alle.filter((datei) => {
      if (datei === path.join(ORDNER, 'stil.ts')) return false;
      return /['"][^'"]*(?:danke\.module\.css|danke-grenze\.css)['"]/.test(readFileSync(datei, 'utf8'));
    });
    expect(fremd.map((d) => path.relative(WURZEL, d))).toEqual([]);
    const ueberStil = readdirSync(ORDNER).filter((name) => /from '\.\/stil'/.test(readFileSync(path.join(ORDNER, name), 'utf8')));
    expect(ueberStil.sort()).toEqual(['DankeAblauf.tsx', 'DankeErfolg.tsx', 'DankeLeer.tsx', 'FollowUpForm.tsx']);
  });

  it('die Grenze ist global, aber ohne Regeln (nur Kommentar)', () => {
    const grenze = readFileSync(path.join(ORDNER, 'danke-grenze.css'), 'utf8');
    expect(grenze.replace(/\/\*[\s\S]*?\*\//g, '').trim()).toBe('');
  });
});
