import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMotionIds } from '../../../scripts/qa/check-design-tokens.mjs';
import {
  AUFTAKT_ENDE_MS,
  DAUER_IDS,
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

/** KERN K-009 (Stand 1.2, E-029): Tabelle aus BEGRUENDUNG §9 mit den Ergänzungen. */
const KERN_K009 = [
  'vorlauf-haus',
  'ruecklauf-haus',
  'erdleitung',
  'erdleitung-d',
  'pfeile',
  // E-027: ersetzt 'uhr' (13:30); seit E-029 nur noch die Überblendung des Maßes „35 km“ im Giebel
  'radius-einrasten',
  // E-028: Signaturen der lokalen Seiten (Ortsseiten und Gebietsseite)
  'pendel-zeichnen',
  'ringe-zeichnen',
  'menue-oeffnen',
  'menue-leitung',
  'menue-eintrag',
  'unterstrich',
  'flaeche',
  'druck',
  'fortschritt',
  'kreis-schliessen',
  'seitenwechsel',
  // E-029: Dauerbewegung in Produkt- und Prozesszeichnungen
  'rotor-dreht',
  'wasser-fliesst',
  'kaeltemittel-fliesst',
];

/** Mit E-029 entfallen (Effekte ohne Aussage bzw. ersetzt durch „Anhalten“/„Abspielen“). */
const ENTFALLEN = ['luft', 'luefter', 'waerme', 'kreislauf-zeigen', 'uhr'];

describe('Bewegungsregister', () => {
  it('enthält genau die Kennungen aus KERN K-009, jede einmal und mit Eintrag', () => {
    expect([...MOTION_IDS].sort()).toEqual([...KERN_K009].sort());
    expect(new Set(MOTION_IDS).size).toBe(MOTION_IDS.length);
    expect(Object.keys(MOTION_REGISTER).sort()).toEqual([...MOTION_IDS].sort());
    for (const id of ENTFALLEN) expect(MOTION_IDS as readonly string[], id).not.toContain(id);
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

  it('beendet den Auftakt nach höchstens 1.120 ms; das Maß „35 km“ blendet zuletzt ein', () => {
    const auftakt = MOTION_IDS.filter((id) => MOTION_REGISTER[id].ausloeser.includes('auftakt'));
    expect(auftakt.length).toBe(8);
    for (const id of auftakt) {
      const entry = MOTION_REGISTER[id];
      expect(entry.endeMs, id).toBeDefined();
      expect(entry.endeMs!, id).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
      // Ein Teil kann nicht vor Verzögerung + kürzester Dauer enden
      expect(entry.endeMs!, id).toBeGreaterThanOrEqual(maxVerzoegerungMs(entry) + Math.min(...entry.dauer.map((t) => DAUER_MS[t])));
      if (entry.dauer.length === 1) expect(entry.endeMs, id).toBe(maxVerzoegerungMs(entry) + maxDauerMs(entry));
      // Auftakt und Schleife schließen einander aus
      expect(entry.schleife, id).toBeUndefined();
    }
    expect(Math.max(...auftakt.map((id) => MOTION_REGISTER[id].endeMs!))).toBe(AUFTAKT_ENDE_MS);
    expect(MOTION_REGISTER['radius-einrasten'].endeMs).toBe(AUFTAKT_ENDE_MS);
  });

  it('hält Signaturmomente und alle Schleifen auf Erzählseiten (K-011)', () => {
    for (const id of ['vorlauf-haus', 'radius-einrasten', 'pendel-zeichnen', 'ringe-zeichnen', 'seitenwechsel', ...DAUER_IDS] as MotionId[]) {
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

  it('Leitmotiv „35 km“ (E-027, E-029): radius-einrasten ist nur noch eine Überblendung, reduziert steht das Maß', () => {
    expect(MOTION_IDS).not.toContain('uhr' as MotionId);
    const mass = MOTION_REGISTER['radius-einrasten'];
    expect(mass.dauer).toEqual(['d-2']);
    expect(mass.verzoegerungTakte).toEqual([11]);
    expect(mass.kurve).toEqual(['k-aus']);
    expect(mass.ausloeser).toEqual(['auftakt']);
    // Keine Skalierung, kein Zeichnen mehr: nur opacity
    expect(mass.eigenschaften).toEqual(['opacity']);
    expect(mass.endeMs).toBe(AUFTAKT_ENDE_MS);
    expect(mass.reduziert).toMatch(/35 km“ steht/);
    expect(`${mass.zweck} ${mass.reduziert}`).not.toMatch(/13:30|Feierabend|Freitag/);
  });

  it('Desktop der Startseite (E-029): der Vorlauf läuft aus der Anlage in den Knopf, vier Stücke nacheinander', () => {
    const d = MOTION_REGISTER['erdleitung-d'];
    expect(d.zweck).toMatch(/aus der Anlage zur Hauptaktion/);
    expect(d.zweck).not.toMatch(/aus der Hauptaktion/);
    expect(d.verzoegerungTakte).toHaveLength(4);
    expect(d.verzoegerungTakte).toEqual([...d.verzoegerungTakte].sort((a, b) => a - b));
    // Jedes Stück beginnt, wenn das vorige fertig ist (d-1 = 1,5 Takte)
    for (let i = 1; i < d.verzoegerungTakte.length; i += 1) {
      expect((d.verzoegerungTakte[i] - d.verzoegerungTakte[i - 1]) * TAKT_MS).toBe(DAUER_MS['d-1']);
    }
    // Der Vorlauf im Haus ist vorher fertig
    expect(d.verzoegerungTakte[0] * TAKT_MS).toBe(MOTION_REGISTER['vorlauf-haus'].endeMs);
  });

  it('Signaturen der lokalen Seiten (E-028): nur stroke-dashoffset, einmal, vor dem Schlusstakt fertig, reduziert statisch', () => {
    const pendel = MOTION_REGISTER['pendel-zeichnen'];
    expect(pendel.eigenschaften).toEqual(['stroke-dashoffset']);
    expect(pendel.ausloeser).toEqual(['auftakt']);
    expect(pendel.verzoegerungTakte).toHaveLength(2);
    expect(pendel.verzoegerungTakte[1]).toBeGreaterThan(pendel.verzoegerungTakte[0]);
    expect(pendel.endeMs!).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
    expect(pendel.reduziert).toMatch(/stehen|steht/);

    const ringe = MOTION_REGISTER['ringe-zeichnen'];
    expect(ringe.eigenschaften).toEqual(['stroke-dashoffset']);
    // 15 → 25 → 35 km: drei Ringe, gleichmäßig gestaffelt
    expect(ringe.verzoegerungTakte).toHaveLength(3);
    expect(ringe.verzoegerungTakte).toEqual([...ringe.verzoegerungTakte].sort((a, b) => a - b));
    expect(ringe.zweck).toMatch(/15.*25.*35/);
    expect(ringe.endeMs!).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
  });

  it('Dauerbewegung (E-029): genau Rotor, Wasser, Kältemittel; jede pausierbar, nur im Sichtfeld, Periode ≥ 400 ms', () => {
    expect([...DAUER_IDS].sort()).toEqual(['kaeltemittel-fliesst', 'rotor-dreht', 'wasser-fliesst']);
    for (const id of MOTION_IDS) {
      const entry = MOTION_REGISTER[id];
      const dauer = entry.ausloeser.includes('dauer');
      // Schleife genau bei Auslöser dauer, und dauer nie zusammen mit einem anderen Auslöser
      expect(entry.schleife !== undefined, id).toBe(dauer);
      if (!dauer) continue;
      expect(entry.ausloeser, id).toEqual(['dauer']);
      const s = entry.schleife!;
      expect(s.pausierbar, id).toBe(true);
      expect(s.nurSichtbar, id).toBe(true);
      expect(s.periodeMs, id).toBeGreaterThanOrEqual(400);
      // Periode auf dem halben Takt (40 ms), damit CSS sie aus --takt oder den Dauerstufen bildet
      expect(Number.isInteger(s.periodeMs / (TAKT_MS / 2)), id).toBe(true);
      // Gleichmäßig (linear), kein Pulsieren und kein Skalieren: nur transform (Drehung) oder stroke-dashoffset
      expect(entry.kurve, id).toEqual(['linear']);
      expect(entry.eigenschaften.length, id).toBe(1);
      expect(entry.endeMs, id).toBeUndefined();
      // Standbild in der reduzierten Fassung
      expect(entry.reduziert, id).toMatch(/Standbild/);
    }
    // Rotor: ein Blattabstand je 600 ms (d-4), als Drehung
    const rotor = MOTION_REGISTER['rotor-dreht'];
    expect(rotor.eigenschaften).toEqual(['transform']);
    expect(rotor.schleife!.periodeMs).toBe(DAUER_MS['d-4']);
    expect(rotor.dauer).toEqual(['d-4']);
    // Wasser und Kältemittel: das Strichmuster wandert per transform auf eigenen HTML-Ebenen (Compositor), nicht mehr
    // per stroke-dashoffset, das je Bild neu malte (Prüfung E-029, Befund 10: Malzeit unter 2 ms)
    for (const id of ['wasser-fliesst', 'kaeltemittel-fliesst'] as MotionId[]) {
      expect(MOTION_REGISTER[id].eigenschaften, id).toEqual(['transform']);
      expect(MOTION_REGISTER[id].zweck, id).toMatch(/HTML-Ebene/);
      expect(MOTION_REGISTER[id].reduziert, id).toMatch(/Fließpfeil/);
    }
  });

  it('erkennt Kennungen', () => {
    expect(isMotionId('radius-einrasten')).toBe(true);
    expect(isMotionId('rotor-dreht')).toBe(true);
    expect(isMotionId('uhr')).toBe(false);
    expect(isMotionId('luefter')).toBe(false);
    expect(isMotionId('konfetti')).toBe(false);
    expect(isMotionId(3)).toBe(false);
  });

  it('ist für den Design-Guard lesbar (gleiche Liste wie MOTION_IDS)', () => {
    const source = readFileSync(path.resolve(__dirname, '../register.ts'), 'utf8');
    expect(parseMotionIds(source)).toEqual([...MOTION_IDS]);
  });
});
