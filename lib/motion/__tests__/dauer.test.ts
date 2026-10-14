import { describe, expect, it } from 'vitest';
import { DAUER_KNOPF, DAUER_RUHE, dauerLaeuft, dauerWert, knopfSichtbar, knopfText, type DauerZustand } from '../dauer';

const BEDINGUNGEN = ['skript', 'sichtbar', 'tabSichtbar', 'reduziert', 'angehalten'] as const;

/** Alle 32 Kombinationen der fünf Bedingungen. */
function alleZustaende(): DauerZustand[] {
  return Array.from({ length: 2 ** BEDINGUNGEN.length }, (_, n) =>
    Object.fromEntries(BEDINGUNGEN.map((name, i) => [name, Boolean(n & (1 << i))])) as unknown as DauerZustand,
  );
}

describe('Startbedingung der Dauerbewegung (K-009, E-029)', () => {
  const zustaende = alleZustaende();

  it('prüft alle 32 Kombinationen: läuft nur, wenn Skript, Sichtfeld, Tab sichtbar, nicht reduziert und nicht angehalten', () => {
    expect(zustaende).toHaveLength(32);
    const laufend = zustaende.filter(dauerLaeuft);
    expect(laufend).toEqual([{ skript: true, sichtbar: true, tabSichtbar: true, reduziert: false, angehalten: false }]);
    for (const z of zustaende) {
      const erwartet = z.skript && z.sichtbar && z.tabSichtbar && !z.reduziert && !z.angehalten;
      expect(dauerLaeuft(z), JSON.stringify(z)).toBe(erwartet);
      expect(dauerWert(z), JSON.stringify(z)).toBe(erwartet ? 'an' : 'aus');
    }
  });

  it('jede einzelne Bedingung hält die Schleife an (aus dem laufenden Zustand eine kippen)', () => {
    const laeuft: DauerZustand = { skript: true, sichtbar: true, tabSichtbar: true, reduziert: false, angehalten: false };
    expect(dauerLaeuft(laeuft)).toBe(true);
    for (const name of BEDINGUNGEN) {
      expect(dauerLaeuft({ ...laeuft, [name]: !laeuft[name] }), name).toBe(false);
    }
  });

  it('der Ruhezustand (Server, ohne Skript) ist das Standbild', () => {
    expect(dauerWert(DAUER_RUHE)).toBe('aus');
    expect(knopfSichtbar(DAUER_RUHE)).toBe(false);
    expect(Object.isFrozen(DAUER_RUHE)).toBe(true);
  });

  it('der Knopf erscheint nur mit Skript und ohne reduzierte Bewegung, unabhängig von Sichtfeld, Tab und Anhalten', () => {
    for (const z of zustaende) expect(knopfSichtbar(z), JSON.stringify(z)).toBe(z.skript && !z.reduziert);
  });

  it('der Knopf sagt, was passiert: „Anhalten“ während es läuft, „Abspielen“ nach dem Anhalten', () => {
    expect(DAUER_KNOPF).toEqual({ anhalten: 'Anhalten', abspielen: 'Abspielen' });
    expect(knopfText(false)).toBe('Anhalten');
    expect(knopfText(true)).toBe('Abspielen');
  });
});
