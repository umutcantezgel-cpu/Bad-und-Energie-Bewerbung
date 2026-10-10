import { describe, expect, it } from 'vitest';
import {
  AUSLAUF_MS,
  STILL_MS,
  WURF_MAX_KARTEN,
  ansage,
  lageBei,
  naechsterIndex,
  rastpunkte,
  wurfGeschwindigkeit,
  wurfZiel,
  zaehlung,
} from '../ziehen';

// Reihe aus 13 Karten zu je 300 px Schritt, sichtbar 900 px: Maximum 13 · 300 − 16 − 900
const KANTEN = Array.from({ length: 13 }, (_, i) => i * 300);
const MAX = 13 * 300 - 16 - 900;

describe('Rastpunkte der Stimmen-Reihe (E-START-046)', () => {
  it('setzt je Karte einen Punkt und fasst die Karten am Ende auf dem Maximum zusammen', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    expect(punkte[0]).toBe(0);
    expect(punkte[punkte.length - 1]).toBe(MAX);
    expect(punkte).toHaveLength(11);
    expect([...punkte].sort((a, b) => a - b)).toEqual(punkte);
    expect(rastpunkte([], 0)).toEqual([0]);
  });

  it('findet die nächste Karte', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    expect(naechsterIndex(punkte, 0)).toBe(0);
    expect(naechsterIndex(punkte, 140)).toBe(0);
    expect(naechsterIndex(punkte, 160)).toBe(1);
    expect(naechsterIndex(punkte, 99999)).toBe(punkte.length - 1);
  });
});

describe('Ziehen mit Auslaufen', () => {
  it('misst die Wurfgeschwindigkeit nur im letzten Zeitfenster', () => {
    expect(wurfGeschwindigkeit([])).toBe(0);
    expect(wurfGeschwindigkeit([{ t: 0, x: 0 }])).toBe(0);
    // langsamer Anfang, schneller Schluss: zählt nur der Schluss
    const proben = [
      { t: 0, x: 0 },
      { t: 400, x: 10 },
      { t: 450, x: 60 },
      { t: 500, x: 110 },
    ];
    expect(wurfGeschwindigkeit(proben)).toBeCloseTo(1, 5);
    // Maus ruht vor dem Loslassen: kein Wurf
    expect(wurfGeschwindigkeit(proben, undefined, 520)).toBeCloseTo(1, 5);
    expect(wurfGeschwindigkeit(proben, undefined, 500 + STILL_MS + 1)).toBe(0);
  });

  it('ruhiges Loslassen rastet auf der nächsten Karte ein', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    expect(wurfZiel(punkte, 320, 0)).toBe(1);
    expect(wurfZiel(punkte, 440, 0.05)).toBe(1);
    expect(wurfZiel(punkte, 460, -0.05)).toBe(2);
  });

  it('ein Wurf bewegt die Reihe mindestens eine Karte weiter, auch knapp vor der Mitte', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    // 100 px nach Karte 1 losgelassen, langsam nach rechts geworfen: Karte 2
    expect(wurfZiel(punkte, 400, 0.25)).toBe(2);
    // dasselbe nach links: Karte 1 (die angeschnittene Karte links rastet ein)
    expect(wurfZiel(punkte, 400, -0.25)).toBe(1);
  });

  it('ein schneller Wurf läuft weit aus, aber höchstens WURF_MAX_KARTEN und nie über das Ende', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    const weit = wurfZiel(punkte, 0, 3);
    expect(weit).toBe(Math.min(WURF_MAX_KARTEN, punkte.length - 1));
    expect(wurfZiel(punkte, MAX, 3)).toBe(punkte.length - 1);
    expect(wurfZiel(punkte, 0, -3)).toBe(0);
    // projiziert: 1 px/ms · AUSLAUF_MS
    expect(wurfZiel(punkte, 0, 1)).toBe(naechsterIndex(punkte, AUSLAUF_MS));
  });

  it('reduzierte Bewegung: kein Schwung, nur die nächste Karte', () => {
    const punkte = rastpunkte(KANTEN, MAX);
    expect(wurfZiel(punkte, 400, 3, false)).toBe(1);
  });
});

describe('Lage aus dem letzten Maß (ohne DOM-Abfrage beim Scrollen)', () => {
  // 13 Karten zu 284 px, Schritt 300 px, sichtbar 900 px: drei Karten ganz im Bild
  const MASS = { links: KANTEN, rechts: KANTEN.map((k) => k + 284), breite: 900, max: MAX };
  const punkte = rastpunkte(KANTEN, MAX);

  it('zählt die Karten, die ganz im Bild stehen (1 px Spiel), am Anfang und am Ende', () => {
    expect(lageBei(MASS, punkte, 0)).toEqual({ erste: 1, letzte: 3, atStart: true, atEnd: false });
    expect(lageBei(MASS, punkte, 301)).toEqual({ erste: 2, letzte: 4, atStart: false, atEnd: false });
    expect(lageBei(MASS, punkte, MAX)).toEqual({ erste: 11, letzte: 13, atStart: false, atEnd: true });
  });

  it('steht keine Karte ganz im Bild, zählt die nächste', () => {
    const schmal = { ...MASS, breite: 200 };
    expect(lageBei(schmal, punkte, 160)).toMatchObject({ erste: 2, letzte: 2 });
    expect(lageBei({ links: [], rechts: [], breite: 0, max: 0 }, [0], 0)).toEqual({ erste: 1, letzte: 1, atStart: true, atEnd: true });
  });
});

describe('Zählung und Ansage', () => {
  it('zählt als Maß zweistellig, mit Bereich, wenn mehrere Karten ganz im Bild stehen', () => {
    expect(zaehlung(1, 1, 13)).toBe('01 / 13');
    expect(zaehlung(1, 3, 13)).toBe('01–03 / 13');
  });

  it('sagt die Lage in Worten an', () => {
    expect(ansage(1, 1, 13)).toBe('Stimme 1 von 13');
    expect(ansage(4, 6, 13)).toBe('Stimmen 4 bis 6 von 13');
    expect(ansage(1, 1, 0)).toBe('');
  });
});
