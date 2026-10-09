import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMotionIds } from '../../../scripts/qa/check-design-tokens.mjs';
import {
  AUFTAKT_ENDE_MS,
  DAUER_MS,
  MOTION_IDS,
  MOTION_REGISTER,
  TAKT_MS,
  isMotionId,
  maxDauerMs,
  maxVerzoegerungMs,
  motionEntry,
  type MotionId,
} from '../register';

/** KERN K-009: Tabelle aus BEGRUENDUNG §9 und die vier Ergänzungen. */
const KERN_K009 = [
  'luft',
  'luefter',
  'vorlauf-haus',
  'waerme',
  'ruecklauf-haus',
  'erdleitung',
  'erdleitung-d',
  'pfeile',
  'uhr',
  'menue-oeffnen',
  'menue-leitung',
  'menue-eintrag',
  'unterstrich',
  'flaeche',
  'druck',
  'kreislauf-zeigen',
  'fortschritt',
  'kreis-schliessen',
  'seitenwechsel',
];

describe('Bewegungsregister', () => {
  it('enthält genau die Kennungen aus KERN K-009, jede einmal und mit Eintrag', () => {
    expect([...MOTION_IDS].sort()).toEqual([...KERN_K009].sort());
    expect(new Set(MOTION_IDS).size).toBe(MOTION_IDS.length);
    expect(Object.keys(MOTION_REGISTER).sort()).toEqual([...MOTION_IDS].sort());
  });

  it('nutzt nur Kebab-Kennungen ohne Umlaute (data-motion, CSS-Selektoren)', () => {
    for (const id of MOTION_IDS) expect(id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
  });

  it('nennt für jede Kennung Zweck und reduzierte Fassung', () => {
    for (const id of MOTION_IDS) {
      const entry = motionEntry(id);
      expect(entry.zweck.length, id).toBeGreaterThan(10);
      expect(entry.reduziert.length, id).toBeGreaterThan(3);
      expect(entry.ausloeser.length, id).toBeGreaterThan(0);
    }
  });

  it('animiert nur transform, opacity und stroke-dashoffset (dazu den View-Übergang)', () => {
    for (const id of MOTION_IDS) {
      for (const property of MOTION_REGISTER[id].eigenschaften) {
        expect(['transform', 'opacity', 'stroke-dashoffset', 'view-transition'], id).toContain(property);
      }
    }
    const viewTransition = MOTION_IDS.filter((id) => MOTION_REGISTER[id].eigenschaften.includes('view-transition'));
    expect(viewTransition).toEqual(['seitenwechsel']);
  });

  it('verzögert nur in halben oder ganzen Takten und hält Dauern auf den vier Stufen', () => {
    for (const id of MOTION_IDS) {
      const entry = MOTION_REGISTER[id];
      for (const takte of entry.verzoegerungTakte) expect(Number.isInteger(takte * 2), id).toBe(true);
      for (const token of entry.dauer) expect(Object.keys(DAUER_MS), id).toContain(token);
    }
    expect(DAUER_MS).toEqual({ 'd-1': 120, 'd-2': 240, 'd-3': 400, 'd-4': 600 });
    expect(TAKT_MS).toBe(80);
  });

  it('beendet den Auftakt nach höchstens 1.120 ms; die Uhr rastet zuletzt ein', () => {
    const auftakt = MOTION_IDS.filter((id) => MOTION_REGISTER[id].ausloeser.includes('auftakt'));
    expect(auftakt.length).toBe(9);
    for (const id of auftakt) {
      const entry = MOTION_REGISTER[id];
      expect(entry.endeMs, id).toBeDefined();
      expect(entry.endeMs!, id).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
      // Ein Teil kann nicht vor Verzögerung + kürzester Dauer enden
      expect(entry.endeMs!, id).toBeGreaterThanOrEqual(maxVerzoegerungMs(entry) + Math.min(...entry.dauer.map((t) => DAUER_MS[t])));
      if (entry.dauer.length === 1) expect(entry.endeMs, id).toBe(maxVerzoegerungMs(entry) + maxDauerMs(entry));
    }
    expect(Math.max(...auftakt.map((id) => MOTION_REGISTER[id].endeMs!))).toBe(AUFTAKT_ENDE_MS);
    expect(MOTION_REGISTER.uhr.endeMs).toBe(AUFTAKT_ENDE_MS);
  });

  it('hält Signaturmomente auf Erzählseiten (K-011)', () => {
    for (const id of ['luft', 'luefter', 'vorlauf-haus', 'waerme', 'uhr', 'kreislauf-zeigen', 'seitenwechsel'] as MotionId[]) {
      expect(MOTION_REGISTER[id].seitenart, id).toBe('erzaehlseiten');
    }
    expect(MOTION_REGISTER.fortschritt.seitenart).toBe('alle');
  });

  it('führt Ein- und Ausgänge nach der Regel: Eingang d-2/k-aus, Ausgang d-1/k-ein', () => {
    for (const id of ['unterstrich', 'flaeche', 'druck', 'menue-oeffnen'] as MotionId[]) {
      expect(MOTION_REGISTER[id].dauer, id).toEqual(['d-2', 'd-1']);
      expect(MOTION_REGISTER[id].kurve, id).toEqual(['k-aus', 'k-ein']);
    }
  });

  it('erkennt Kennungen', () => {
    expect(isMotionId('uhr')).toBe(true);
    expect(isMotionId('konfetti')).toBe(false);
    expect(isMotionId(3)).toBe(false);
  });

  it('ist für den Design-Guard lesbar (gleiche Liste wie MOTION_IDS)', () => {
    const source = readFileSync(path.resolve(__dirname, '../register.ts'), 'utf8');
    expect(parseMotionIds(source)).toEqual([...MOTION_IDS]);
  });
});
