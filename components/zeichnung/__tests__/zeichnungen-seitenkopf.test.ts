import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, type FunctionComponent, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOTION_IDS } from '@/lib/motion/register';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import * as zeichnung from '..';
import { HausKlein } from '../HausKlein';
import { Aussengeraet, geraetTitel } from '../technik/Aussengeraet';
import {
  Etikettkasten,
  Heizkreis,
  KreisGeschlossen,
  Leitungspaar,
  Masskette,
  OFFENE_LEITUNG_TITEL,
  OffeneLeitung,
  fortschrittsAnteil,
  schrittstand,
} from '..';

const css = readFileSync(path.resolve(__dirname, '..', 'zeichnung.module.css'), 'utf8');
/** Komponenten mit verschiedenen Props über eine lose Signatur rendern. */
const r = (komponente: unknown, props: Record<string, unknown> = {}, ...kinder: ReactNode[]) =>
  renderToStaticMarkup(createElement(komponente as FunctionComponent<Record<string, unknown>>, props, ...kinder));
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('Zeichnungen für den Seitenkopf (SEITENKOPF-01)', () => {
  it('SVG-Zeichnungen: dekorativ ohne Titel, role="img" mit <title> mit Titel', () => {
    for (const k of [HausKlein, KreisGeschlossen]) {
      expect(r(k)).toMatch(/^<svg [^>]*aria-hidden="true"/);
      const mit = r(k, { titel: 'Probe' });
      expect(mit).toMatch(/^<svg [^>]*role="img"/);
      expect(mit).toContain('<title>Probe</title>');
      expect(mit).not.toContain('aria-hidden');
    }
    expect(r(OffeneLeitung)).toContain(`<title>${OFFENE_LEITUNG_TITEL}</title>`);
    expect(r(OffeneLeitung, { titel: null })).toMatch(/^<svg [^>]*aria-hidden="true"/);
  });

  it('Offene Leitung: Vorlauf und Rücklauf knicken um 45° um --paar (12) und enden offen', () => {
    const html = r(OffeneLeitung);
    const [vl, rl] = [...html.matchAll(/class="[^"]*(?:vorlauf|ruecklauf)[^"]*" d="([^"]+)"/g)].map((m) => m[1]);
    expect(vl).toBe('M4 100H120L132 112H222');
    expect(rl).toBe('M4 112H115L127 124H222');
  });

  it('Kreis schließt sich: zwei Halbkreise mit Kennung kreis-schliessen, Endzustand ohne Animation geschlossen', () => {
    const html = r(KreisGeschlossen);
    expect(html.match(/data-motion="kreis-schliessen"/g)).toHaveLength(2);
    expect(MOTION_IDS).toContain('kreis-schliessen');
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.kreis \[data-motion="kreis-schliessen"\] \{\s*animation: schliessen var\(--d-3\) var\(--k-wechsel\) backwards;/);
    expect(css).toMatch(/\.kreis \[data-motion="kreis-schliessen"\] \{\s*stroke-dasharray: 1;\s*stroke-dashoffset: 0;/);
  });

  it('Heizkreis und Maßkette: Zahl als echter Text in font-mass, Name mit Leerzeichen getrennt', () => {
    const hk = r(Heizkreis, { wert: '13:30', name: 'Freitags Feierabend' });
    expect(hk).toMatch(/<span class="[^"]*font-mass[^"]*">13:30<\/span>/);
    expect(plain(hk)).toBe('13:30 Freitags Feierabend');
    const mk = r(Masskette, { wert: '35 km', name: 'Einsatzradius' });
    expect(plain(mk)).toBe('35 km Einsatzradius');
    expect(mk).toMatch(/aria-hidden="true"/);
  });

  it('Etikettkasten: Text in text-etikett, Familien-Icon dekorativ', () => {
    const html = r(Etikettkasten, { icon: 'waermepumpe' }, 'Wärmepumpen');
    expect(html).toContain('text-etikett');
    expect(html).toMatch(/<svg [^>]*aria-hidden="true"/);
    expect(plain(html)).toBe('Wärmepumpen');
  });

  it('E-029, Befund 12: der Sammelexport zieht kein technik/ und kein technik.module.css in die Seiten', () => {
    const wurzel = path.resolve(__dirname, '..', '..', '..');
    const aufloesen = (von: string, ziel: string): string | null => {
      const basis = ziel.startsWith('@/') ? path.join(wurzel, ziel.slice(2)) : path.resolve(path.dirname(von), ziel);
      for (const kandidat of [basis, `${basis}.ts`, `${basis}.tsx`, path.join(basis, 'index.ts'), path.join(basis, 'index.tsx')]) {
        if (existsSync(kandidat) && /\.(tsx?|css)$/.test(kandidat)) return kandidat;
      }
      return null;
    };
    // Alle Dateien, die der Sammelexport zur Laufzeit lädt (ohne `import type` und `export type`)
    const geladen = new Set<string>();
    const offen = [path.resolve(__dirname, '..', 'index.ts')];
    while (offen.length > 0) {
      const datei = offen.pop()!;
      if (geladen.has(datei)) continue;
      geladen.add(datei);
      if (datei.endsWith('.css')) continue;
      const quelle = readFileSync(datei, 'utf8');
      for (const [, ziel] of quelle.matchAll(/^(?:import|export)(?! type\b)[^'"]*?(?:from\s+)?['"]([^'"]+)['"]/gm)) {
        if (!ziel.startsWith('.') && !ziel.startsWith('@/')) continue;
        const aufgeloest = aufloesen(datei, ziel);
        if (aufgeloest) offen.push(aufgeloest);
      }
    }
    const namen = [...geladen].map((d) => path.relative(wurzel, d));
    // Gegenprobe: der Weg folgt den Exporten bis in die Einzeldateien und ihr CSS
    expect(namen).toContain(path.join('components', 'zeichnung', 'Masskette.tsx'));
    expect(namen).toContain(path.join('components', 'zeichnung', 'zeichnung.module.css'));
    expect(namen.filter((n) => n.includes(`${path.sep}technik${path.sep}`) || n.endsWith('technik.module.css'))).toEqual([]);
    expect(Object.keys(zeichnung)).not.toContain('HausKlein');
  });

  it('Wärmebild entfällt (E-029): an seiner Stelle die Außeneinheit, statisch ohne `bewegt`, mit Titel aus den Maßen', () => {
    expect(Object.keys(zeichnung)).not.toContain('Waermebild');
    expect(existsSync(path.resolve(__dirname, '..', 'Waermebild.tsx'))).toBe(false);
    const html = r(Aussengeraet, { ansicht: 'vorne', massketten: 'haupt', schriftfeld: false, titel: geraetTitel(COMPRESS_AW_S, 'vorne') });
    expect(html).not.toMatch(/<canvas|data-motion|<script|Gradient|data-tone/);
    expect(html).toContain(`role="img" aria-label="${geraetTitel(COMPRESS_AW_S, 'vorne')}"`);
    expect(html).toContain(`viewBox="0 0 ${COMPRESS_AW_S.breite.mm} ${COMPRESS_AW_S.hoehe.mm}"`);
    // Keine Isothermen, keine Etiketten Wärmepumpen/Heizungen/Bäder mehr
    expect(plain(html)).not.toMatch(/Heizungen|Bäder/);
  });

  it('Leitungspaar: Anteil je Schritt (1 von 4 = 25 %), Stand der Knoten, begrenzt', () => {
    expect(fortschrittsAnteil(1, 4)).toBe(0.25);
    expect(fortschrittsAnteil(4, 4)).toBe(1);
    expect(fortschrittsAnteil(9, 4)).toBe(1);
    expect(fortschrittsAnteil(0, 4)).toBe(0.25);
    expect(fortschrittsAnteil(2, 0)).toBe(0);
    expect([0, 1, 2, 3].map((i) => schrittstand(i, 2))).toEqual(['erledigt', 'aktuell', 'offen', 'offen']);
  });

  it('Leitungspaar: progressbar mit Zähler und Schrittname, Kennung fortschritt, reduziert ohne Übergang', () => {
    const html = r(Leitungspaar, { schritte: ['Stelle', 'Kenntnisse', 'Konditionen', 'Kontakt'], aktuell: 2 });
    expect(html).toMatch(/role="progressbar"/);
    expect(html).toContain('aria-valuenow="2"');
    expect(html).toContain('aria-valuemax="4"');
    expect(html).toContain('aria-valuetext="Schritt 2 von 4: Kenntnisse"');
    expect(html).toContain('--anteil:0.5');
    expect(html.match(/data-motion="fortschritt"/g)).toHaveLength(2);
    expect(html.match(/data-stand="/g)).toHaveLength(4);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.lpFuellung \{\s*transition: none;/);
  });

  it('Formsystem: ein Strich (--m-strich), nur Rollenfarben, keine Hexwerte', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/--p-[a-z]/);
    expect(css).toMatch(/\.fest \{\s*vector-effect: non-scaling-stroke;/);
  });
});
