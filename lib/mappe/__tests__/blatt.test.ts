import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AKZENT_FARBEN } from '@/lib/mappe/blatt/design';
import { SCHLICHT } from '@/lib/mappe/blatt/schlicht';

/**
 * Die PDF (lib/mappe/pdf/blatt.tsx) und das Blatt der Vorschau (components/mappe/mappe.module.css) teilen ihre Maße:
 * Satzspiegel, Spalten, Schriftstufen, Zeilenhöhen und die Farben von .paper. Ändert sich eins, muss das andere mit.
 */

const CSS = readFileSync(path.join(process.cwd(), 'components/mappe/mappe.module.css'), 'utf8');

function variable(name: string): string {
  const treffer = new RegExp(`--${name}:\\s*([^;]+);`).exec(CSS);
  if (!treffer) throw new Error(`--${name} fehlt in mappe.module.css`);
  return treffer[1].trim();
}

function paperFarbe(name: string): string {
  const paper = /\.paper\s*\{([^}]*)\}/.exec(CSS)?.[1] ?? '';
  const treffer = new RegExp(`--${name}:\\s*([^;]+);`).exec(paper);
  if (!treffer) throw new Error(`--${name} fehlt in .paper`);
  return treffer[1].trim().toUpperCase();
}

describe('Design „Schlicht“: PDF und Vorschau mit denselben Maßen', () => {
  it('Satzspiegel und Spalten (mm)', () => {
    expect(variable('blatt-rand-oben')).toBe(`${SCHLICHT.rand.oben}mm`);
    expect(variable('blatt-rand-rechts')).toBe(`${SCHLICHT.rand.rechts}mm`);
    expect(variable('blatt-rand-unten')).toBe(`${SCHLICHT.rand.unten}mm`);
    expect(variable('blatt-rand-links')).toBe(`${SCHLICHT.rand.links}mm`);
    expect(variable('blatt-spalte-zeit')).toBe(`${SCHLICHT.spalteZeit}mm`);
    expect(variable('blatt-spalte-abstand')).toBe(`${SCHLICHT.spalteAbstand}mm`);
    expect(variable('blatt-band-rand')).toBe(`${SCHLICHT.bandRand}mm`);
    expect(variable('blatt-seitenspalte')).toBe(`${SCHLICHT.seitenspalte}mm`);
  });

  it('Schriftstufen (pt) und Zeilenhöhen', () => {
    for (const stufe of ['name', 'gross', 'kopf', 'text', 'klein'] as const) {
      expect(variable(`blatt-schrift-${stufe}`), stufe).toBe(`${SCHLICHT.schrift[stufe]}pt`);
    }
    for (const stufe of ['name', 'kopf', 'text', 'klein'] as const) {
      expect(Number(variable(`blatt-zeile-${stufe}`)), stufe).toBe(SCHLICHT.zeile[stufe]);
    }
  });

  it('Farben des Blatts (.paper)', () => {
    expect(paperFarbe('surface')).toBe(SCHLICHT.farbe.papier);
    expect(paperFarbe('ink')).toBe(SCHLICHT.farbe.tinte);
    expect(paperFarbe('ink-muted')).toBe(SCHLICHT.farbe.tinteLeise);
    // Die Marke des Blatts ist die Akzentfarbe des Designs, ohne Angabe Navy (= Marke von „Schlicht“)
    expect(paperFarbe('brand')).toBe(`VAR(--BLATT-AKZENT, ${SCHLICHT.farbe.marke})`);
    expect(AKZENT_FARBEN.navy.farbe).toBe(SCHLICHT.farbe.marke);
    expect(paperFarbe('line')).toBe(SCHLICHT.farbe.linie);
    expect(paperFarbe('line-strong')).toBe(SCHLICHT.farbe.linieStark);
  });
});
