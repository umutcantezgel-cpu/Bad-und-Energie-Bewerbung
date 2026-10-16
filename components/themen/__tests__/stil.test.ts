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

describe('Themen als Leitungsabgänge: Kennwerte in einer Spalte (Prüfrunde 2 A2-7, Prüfrunde 4 A4-5)', () => {
  const css = readFileSync(path.join(ORDNER, 'themen.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const breit = css.match(/@media \(min-width: 48em\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  const regel = (selektor: string) => {
    const flucht = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = breit.match(new RegExp(`(?:^|\\})\\s*${flucht}\\s*\\{([^}]*)\\}`));
    if (!m) throw new Error(`Regel ${selektor} fehlt ab 48em`);
    return Object.fromEntries(m[1].split(';').map((d) => d.trim()).filter(Boolean).map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
  };

  it('ab 48em ist die Liste das Raster; Eintrag und Zeile übernehmen seine Spalten (subgrid), so steht jeder Kennwert in derselben Spalte', () => {
    const liste = regel('.abgaenge');
    expect(liste.display).toBe('grid');
    const spalten = liste['grid-template-columns'].split(/\s+(?![^(]*\))/);
    expect(spalten).toHaveLength(4);
    // Die Wertspalte ist so breit wie der längste Wert aller Zeilen
    expect(spalten[2]).toBe('max-content');
    const zeile = regel('.abgang,\n  .abgangZeile');
    expect(zeile).toMatchObject({ display: 'grid', 'grid-column': '1 / -1', 'grid-template-columns': 'subgrid' });
    expect(regel('.abgangWert')).toMatchObject({ 'grid-column': '3', 'grid-row': '1' });
  });

  it('kein Kennwert bricht um („Voll- oder Teilzeit“ war in 11rem zweizeilig, die Zeile dreizeilig)', () => {
    expect(regel('.abgangWert')['white-space']).toBe('nowrap');
    // Keine feste Breite mehr, an der ein langer Wert umbräche
    expect(breit).not.toMatch(/grid-template-columns:[^;]*\d+(?:\.\d+)?rem/);
  });
});

describe('Kästchenband: die Kästchen einer Reihe sind gleich hoch (Prüfrunde 4 A4-5)', () => {
  it('das Etikettkästchen füllt die gemeinsame erste Zeile des Subgrids', () => {
    const css = readFileSync(path.join(ORDNER, 'themen.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const kaestchen = css.match(/\.kasten \[data-zeichnung="etikettkasten"\] \{([^}]*)\}/)?.[1] ?? '';
    expect(kaestchen).toMatch(/align-self: stretch;/);
    const kasten = css.match(/(?:^|\})\s*\.kasten \{([^}]*)\}/)?.[1] ?? '';
    expect(kasten).toMatch(/grid-template-rows: subgrid;/);
  });
});
