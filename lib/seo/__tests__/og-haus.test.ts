import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { OG_BAUTEILE, OG_ERDLEITUNG_Y, OG_GERAET, OG_GIEBEL_MASS, OG_HAUS_RAHMEN, ogLeitungen, ogPfeile } from '@/lib/seo/og-haus';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import {
  BAUTEILE,
  GERAET_LAGE,
  GIEBEL_MASS,
  HAUSSCHNITT_ERDLEITUNG,
  HAUSSCHNITT_FROST,
  HAUSSCHNITT_RAHMEN,
  KNOPF_LEITUNG,
  KONDENSAT_LAGE,
  LEITUNGEN,
} from '@/lib/zeichnung/szenen/hausschnitt';

const ROOT = path.resolve(__dirname, '../../..');
const quelle = readFileSync(path.join(ROOT, 'lib/seo/og-render.tsx'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('Teilen-Bilder zeichnen den Hausschnitt der Website (E-029)', () => {
  it('dieselbe Geometrie aus lib/zeichnung: Rahmen, Bauteile, Gerät 110 × 80, Maß „35 km“ im Giebel', () => {
    expect(OG_HAUS_RAHMEN).toBe(HAUSSCHNITT_RAHMEN);
    expect(OG_BAUTEILE).toBe(BAUTEILE);
    expect(OG_GIEBEL_MASS).toBe(GIEBEL_MASS);
    // Höhe, auf der der Vorlauf links aus dem Schnitt zum Knopf läuft: wie am Desktop, zwischen Frosttiefe und Kiesbett
    expect(OG_ERDLEITUNG_Y).toBe(KNOPF_LEITUNG.desktopY);
    expect(OG_ERDLEITUNG_Y).toBeGreaterThan(HAUSSCHNITT_FROST);
    expect(OG_ERDLEITUNG_Y).toBeLessThan(KONDENSAT_LAGE.kiesbett);
    expect(OG_ERDLEITUNG_Y).toBeLessThan(HAUSSCHNITT_ERDLEITUNG.vorlauf);
    expect(OG_GERAET.lage).toBe(GERAET_LAGE);
    // Die Vorderansicht in mm, mit 1 : 10 eingesetzt: 1.100 × 800 mm werden 110 × 80 Einheiten
    expect(OG_GERAET.ansicht.breite * OG_GERAET.massstab).toBe(GERAET_LAGE.breite);
    expect(OG_GERAET.ansicht.hoehe * OG_GERAET.massstab).toBe(GERAET_LAGE.hoehe);
    expect(OG_GERAET.ansicht.breite).toBe(COMPRESS_AW_S.breite.mm);
  });

  it('mit Knopf läuft der Vorlauf aus der Anlage links aus dem Bild (Fassung des Desktops); ohne Knopf keine Leitung zur Bewerbung', () => {
    const mit = ogLeitungen(true);
    const ohne = ogLeitungen(false);
    for (const l of mit) expect(LEITUNGEN).toContain(l);
    // Das verdeckte T-Stück am Vorlauf-Anschluss und die Leitung des Desktops; nichts aus der Fassung des Handys
    expect(mit.filter((l) => l.nur).map((l) => l.id)).toEqual(['vorlauf-knopf-anschluss', 'vorlauf-knopf-desktop']);
    expect(mit.filter((l) => l.nur === 'knopf-mobil')).toEqual([]);
    expect(mit.find((l) => l.id === 'vorlauf-knopf-anschluss')!.verdeckt).toBe(true);
    expect(ohne.some((l) => l.nur)).toBe(false);
    const knopf = mit.find((l) => l.id === 'vorlauf-knopf-desktop')!;
    expect(knopf.medium).toBe('vorlauf');
    // In Fließrichtung: von der Anlage (rechts) zum linken Rand, wo die Leitung auf Papier zum Knopf weiterläuft
    expect(knopf.punkte[0].x).toBeGreaterThan(knopf.punkte.at(-1)!.x);
    expect(knopf.punkte.at(-1)!.x).toBe(0);
    expect(ogPfeile(false).some((p) => p.nur)).toBe(false);
    expect(ogPfeile(true).filter((p) => p.nur).map((p) => p.nur)).toEqual(['knopf-desktop']);
  });

  it('auf Papier läuft der Vorlauf vom Rand des Panels zum Knopf, nicht aus dem Knopf heraus (K-001)', () => {
    expect(quelle).toMatch(/const d =\s*`M\$\{PANEL_X\} \$\{ERD_Y\}H/);
    expect(quelle).toMatch(/H\$\{ende\}`;/);
  });

  it('kein Wärmebild, kein Zirkel, keine Rohrklammer, kein Heizkreis; Linien stumpf wie in den Zeichnungen', () => {
    expect(quelle).not.toMatch(/HAUS_BAENDER|HAUS_ZIRKEL|HAUS_MARKEN|Rohrklammer|Heizkreis|luefter|waerme/i);
    expect(quelle).not.toMatch(/strokeLinecap[=:]\s*['"{]*round/);
    expect(quelle).not.toMatch(/borderRadius: '24px/);
  });
});
