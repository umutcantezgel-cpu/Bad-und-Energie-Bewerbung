import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { anlagenschemaSvg, hausschnittSvg } from '@/lib/zeichnung/kopf-svg';
import { LINIENARTEN, type LinienartId } from '@/lib/zeichnung/norm';

/**
 * Linienarten je Selektor (E-031, KERN 1.3 K-008/K-010): Leitungen haben runde Enden und Ecken, Konturen stumpfe Enden
 * und runde Ecken, feine, Maß-, verdeckte und Mittellinien bleiben stumpf und spitz nach DIN. Jede Umsetzung (CSS der
 * Zeichnungen, Kopfbild-Dateien, Teilen-Bilder, Einstieg) folgt genau der Tabelle in lib/zeichnung/norm.ts.
 */

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

type Wirkung = { enden: string; ecken: string };

/** Wirkung einer Klasse in einem Stylesheet: alle Regeln, deren Selektorliste genau `.klasse` enthält, in Reihenfolge. */
function wirkung(css: string, klasse: string): Wirkung {
  const w: Wirkung = { enden: 'butt', ecken: 'miter' };
  for (const [, selektoren, rumpf] of ohneKommentare(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const liste = selektoren.split(',').map((s) => s.trim().replace(/^.*>/, ''));
    if (!liste.includes(klasse)) continue;
    const enden = rumpf.match(/stroke-linecap:\s*([a-z]+)/)?.[1];
    const ecken = rumpf.match(/stroke-linejoin:\s*([a-z]+)/)?.[1];
    if (enden) w.enden = enden;
    if (ecken) w.ecken = ecken;
  }
  return w;
}

const soll = (id: LinienartId): Wirkung => ({ enden: LINIENARTEN[id].enden, ecken: LINIENARTEN[id].ecken });

describe('Linienarten je Selektor (E-031)', () => {
  it('die Tabelle: nur die Leitung hat runde Enden; runde Ecken haben Leitung und Kontur', () => {
    const rundeEnden = (Object.keys(LINIENARTEN) as LinienartId[]).filter((id) => LINIENARTEN[id].enden === 'round');
    const rundeEcken = (Object.keys(LINIENARTEN) as LinienartId[]).filter((id) => LINIENARTEN[id].ecken === 'round');
    expect(rundeEnden).toEqual(['leitung', 'icon']);
    expect(rundeEcken).toEqual(['leitung', 'kontur', 'icon']);
  });

  it('technik.module.css: jede Klasse wirkt genau wie ihre Linienart (Schraffur = fein)', () => {
    const css = quelle('components/zeichnung/technik/technik.module.css');
    const zuordnung: Array<[string, LinienartId]> = [
      ['.leitung', 'leitung'],
      ['.kontur', 'kontur'],
      ['.fein', 'fein'],
      ['.mass', 'mass'],
      ['.verdeckt', 'verdeckt'],
      ['.mittellinie', 'mittellinie'],
      ['.schraffur', 'fein'],
    ];
    for (const [klasse, id] of zuordnung) {
      const w = wirkung(css, klasse);
      expect(w.enden, klasse).toBe(soll(id).enden);
      // Die Schraffur sind gerade Striche ohne Ecken: dort zählt nur das Ende
      if (klasse !== '.schraffur') expect(w.ecken, klasse).toBe(soll(id).ecken);
    }
    // Das Strichmuster der Dauerbewegung bleibt stumpf (es wandert über die Leitung)
    expect(wirkung(css, '.band path').enden).toBe('butt');
  });

  it('Kopfbild-Dateien: dieselbe Zuordnung in den Buchstaben-Klassen (l, k, f, v, m, s)', () => {
    for (const svg of [anlagenschemaSvg(), hausschnittSvg()]) {
      const stil = svg.match(/<style>([\s\S]*?)<\/style>/)![1].replace(/@media[^{]*\{([^{}]*\{[^{}]*\})\}/g, '');
      const zuordnung: Array<[string, LinienartId]> = [
        ['.l', 'leitung'],
        ['.k', 'kontur'],
        ['.f', 'fein'],
        ['.v', 'verdeckt'],
        ['.m', 'mittellinie'],
      ];
      for (const [klasse, id] of zuordnung) expect(wirkung(stil, klasse), klasse).toEqual(soll(id));
      expect(wirkung(stil, '.s').enden).toBe('butt');
    }
  });

  it('zeichnung.module.css: der Strich der Leitungen ist die Linienart leitung', () => {
    const css = quelle('components/zeichnung/zeichnung.module.css');
    expect(wirkung(css, '.strich')).toEqual(soll('leitung'));
    // Der Kreis der Danke-Seite zeichnet sich über stroke-dashoffset: stumpf, sonst bliebe ein Punkt stehen
    expect(wirkung(css, '.kreisStrich').enden).toBe('butt');
  });

  it('Einstieg: Rohre in Ruhe rund, während des Auftakts stumpf (pathLength-Zeichnen ließe sonst Punkte stehen)', () => {
    const css = ohneKommentare(quelle('components/home/einstieg/einstieg.module.css'));
    expect(css).toMatch(/\n\.rohr \{[^}]*stroke-linecap: round;[^}]*stroke-linejoin: round;/);
    expect(css).toMatch(/\.rohrD line,\s*\.rohrD path \{[^}]*stroke-linecap: round;/);
    // Stumpf nur unter .auftakt, und genau für diese Rohre
    const stumpf = [...css.matchAll(/([^{}]+)\{[^{}]*stroke-linecap: butt;[^{}]*\}/g)].map((m) => m[1].trim().split(/,\s*/));
    expect(stumpf).toEqual([[':global(.auftakt) .held .rohr', ':global(.auftakt) .held .rohrD line', ':global(.auftakt) .held .rohrD path']]);
    // Die Sonne ist ein Bedienzeichen (--m-icon) und bleibt rund
    expect(wirkung(css, '.sonne').enden).toBe('round');
    // Nur diese drei Stellen runden Enden: Rohr, Desktop-Leitung, Sonne
    const rund = [...css.matchAll(/([^{}]+)\{[^{}]*stroke-linecap: round;/g)].map((m) => m[1].trim().replace(/\s+/g, ' '));
    expect(rund).toEqual(['.rohr', '.sonne', '.rohrD line, .rohrD path']);
  });

  it('Teilen-Bilder: Leitungspfade rund, Konturen mit runden Ecken, die übrigen Linienarten stumpf und spitz', () => {
    const tsx = quelle('lib/seo/og-render.tsx');
    expect(tsx).toMatch(/const stumpf = \{ strokeLinecap: 'butt', strokeLinejoin: 'miter', fill: 'none' \} as const;/);
    expect(tsx).toMatch(/const kontur = \{ \.\.\.stumpf, strokeLinejoin: 'round', stroke: NAVY\.kontur, strokeWidth: vb\(2\) \} as const;/);
    expect(tsx).toMatch(/const fein = \{ \.\.\.stumpf, stroke: NAVY\.kontur, strokeWidth: vb\(1\) \} as const;/);
    const leitungen = [...tsx.matchAll(/<path\b[^>]*strokeWidth=\{(?:vb\()?LEITUNG\)?\}[^>]*>/g)].map((m) => m[0]);
    expect(leitungen).toHaveLength(2);
    for (const p of leitungen) {
      expect(p).toContain('strokeLinecap="round"');
      expect(p).toContain('strokeLinejoin="round"');
    }
  });
});
