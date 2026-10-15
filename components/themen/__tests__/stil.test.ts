import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Grenze vor dem CSS der Themenseiten (Prüfung E-029, Runde 2, Befund 9): themen.module.css kommt nur über stil.ts, und
 * dort steht unmittelbar davor die leere globale Grenze themen-grenze.css. Die Wirkung prüft der Build
 * (scripts/qa/check-css-chunks.mjs); hier steht, dass die Voraussetzung im Quelltext hält.
 */
const WURZEL = path.resolve(__dirname, '../../..');
const ORDNER = path.resolve(__dirname, '..');

function quellen(dir: string, out: string[] = []): string[] {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '__tests__'].includes(eintrag.name) || eintrag.name.startsWith('.')) continue;
    const voll = path.join(dir, eintrag.name);
    if (eintrag.isDirectory()) quellen(voll, out);
    else if (/\.(tsx?|mjs|css)$/.test(eintrag.name)) out.push(voll);
  }
  return out;
}

describe('Themenseiten: CSS nur über stil.ts mit der Grenze davor', () => {
  const alle = ['app', 'components', 'lib'].flatMap((d) => quellen(path.join(WURZEL, d)));

  it('stil.ts importiert zuerst die Grenze, unmittelbar danach themen.module.css', () => {
    const stil = readFileSync(path.join(ORDNER, 'stil.ts'), 'utf8');
    const importe = [...stil.matchAll(/^import\s+(?:[\w{}\s,*]+\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
    expect(importe).toEqual(['./themen-grenze.css', './themen.module.css']);
  });

  it('niemand sonst importiert themen.module.css oder die Grenze', () => {
    const fremd = alle.filter((datei) => {
      if (datei === path.join(ORDNER, 'stil.ts')) return false;
      return /['"][^'"]*(?:themen\.module\.css|themen-grenze\.css)['"]/.test(readFileSync(datei, 'utf8'));
    });
    expect(fremd.map((d) => path.relative(WURZEL, d))).toEqual([]);
    // Gegenprobe: die Themen-Komponenten holen ihre Klassen über stil.ts
    const ueberStil = alle.filter((datei) => /from '\.\/stil'/.test(readFileSync(datei, 'utf8')));
    expect(ueberStil.length).toBeGreaterThanOrEqual(10);
  });

  it('die Grenze ist global, aber ohne Regeln (nur Kommentar)', () => {
    const grenze = readFileSync(path.join(ORDNER, 'themen-grenze.css'), 'utf8');
    expect(grenze.replace(/\/\*[\s\S]*?\*\//g, '').trim()).toBe('');
  });
});

describe('Themen als Leitungsabgänge: Kennwerte in einer Spalte (Prüfrunde 2 A2-7)', () => {
  it('ab 48em hat die Wertspalte eine feste Breite (jede Zeile ist ihr eigenes Raster, „auto“ schöbe sie je Wert)', () => {
    const css = readFileSync(path.join(ORDNER, 'themen.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const breit = css.match(/@media \(min-width: 48em\) \{\s*\.abgangZeile \{([^}]*)\}/)?.[1] ?? '';
    const spalten = breit.match(/grid-template-columns:\s*([^;]+);/)?.[1].trim().split(/\s+(?![^(]*\))/) ?? [];
    expect(spalten).toHaveLength(4);
    expect(spalten[2]).toMatch(/^\d+(?:\.\d+)?rem$/);
  });
});
