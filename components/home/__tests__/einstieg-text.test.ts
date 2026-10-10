import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { PROCESS_STEPS } from '@/lib/content/process';
import { HERO, HERO_STATS } from '../content';
import {
  KREISLAUF_KNOPF,
  KREISLAUF_SATZ,
  WEGWEISER,
  einstiegMasse,
  jahreskette,
  jubilaeumAktiv,
  ortsmarke,
  schuetzeZahlen,
  vertrauenspunkte,
} from '../einstieg/einstieg-text';

const plain = (text: string) => text.replace(/ /g, ' ');
const HEUTE = new Date('2026-10-09T09:00:00Z');
const LETZTER_TAG = new Date('2026-12-31T22:59:00Z');
const NEUJAHR = new Date('2027-01-01T00:00:00Z');

describe('Einstieg-Texte (R3-HOME-01)', () => {
  it('E-START-002: Jubiläum „100 Jahre Meisterbetrieb (1926–2026)“ bis 31.12.2026, ab 2027 „Seit 1926“', () => {
    expect(jubilaeumAktiv(HEUTE)).toBe(true);
    expect(jubilaeumAktiv(LETZTER_TAG)).toBe(true);
    expect(jubilaeumAktiv(NEUJAHR)).toBe(false);

    expect(plain(ortsmarke(HEUTE))).toBe('100 Jahre Meisterbetrieb (1926–2026)');
    expect(plain(ortsmarke(LETZTER_TAG))).toBe(plain(FACTS.anniversary100.short));
    expect(ortsmarke(NEUJAHR)).toBe(HERO.eyebrow);
    expect(ortsmarke(NEUJAHR)).toMatch(/^Seit 1926/);
  });

  it('die Jahres-Maßkette gilt nur im Jubiläumsjahr und misst 1926 bis 2026', () => {
    expect(jahreskette(HEUTE)).toEqual({ text: '100 Jahre Meisterbetrieb', von: '1926', bis: '2026' });
    expect(jahreskette(NEUJAHR)).toBeNull();
  });

  it('T-001 steht wörtlich (TEXTVORSCHLAEGE, freigegeben E-021), der Knopf sagt, was passiert', () => {
    expect(KREISLAUF_SATZ).toBe(
      'So arbeitet eine Wärmepumpe: Luft liefert die Wärme, der rote Vorlauf bringt sie ins Haus, der blaue Rücklauf kehrt zurück.',
    );
    expect(KREISLAUF_KNOPF).toBe('Kreislauf zeigen');
    expect(WEGWEISER).toBe('Wetzlar');
  });

  it('die vier Maße kommen unverändert aus HERO_STATS (13:30, 30, 35 km, 1926)', () => {
    const m = einstiegMasse();
    expect([m.freitag, m.urlaub, m.radius, m.gruendung]).toEqual([...HERO_STATS]);
    expect(plain(m.radius.value)).toBe('35 km');
    expect(m.freitag.value).toBe('13:30');
  });

  it('schützt Zahl-Wort-Paare mit geschütztem Leerzeichen', () => {
    expect(schuetzeZahlen('100 Jahre und 100 % und 35 km')).toBe('100 Jahre und 100 % und 35 km');
    expect(schuetzeZahlen('Seit 1926 · Wetzlar')).toBe('Seit 1926 · Wetzlar');
  });
});

describe('Vertrauenszeile (E-START-021, E-START-010, E-START-011)', () => {
  const punkte = vertrauenspunkte();
  const texte = punkte.map((p) => plain(p.text));

  it('nennt „Innungsbetrieb“ ohne Prozentzahl davor (E-START-011)', () => {
    expect(texte).toContain('Innungsbetrieb');
    expect(texte.join(' · ')).not.toMatch(/%\s*Innung/);
  });

  it('nennt die Diskretion schon über #ablauf, im Wortlaut des Ablaufschritts (E-START-010)', () => {
    const kennenlernen = PROCESS_STEPS.find((s) => s.id === 'kennenlernen')!;
    expect(texte).toContain(plain(kennenlernen.highlight));
    expect(texte.some((t) => /Diskretion|vertraulich/.test(t))).toBe(true);
  });

  it('nennt feste Baustellen (Fakt noFarAssembly) und die Partner in der abgestuften Fassung, nie pauschal', () => {
    expect(texte).toContain(FACTS.noFarAssembly.short);
    expect(texte).toEqual(
      expect.arrayContaining([
        'Buderus & Bosch Partnerbetrieb',
        'NIBE Effizienzpartner',
        'Alpha Innotec zertifizierter Inbetriebnahme-Partner',
        'Viessmann Fachbetrieb',
      ]),
    );
    const alles = texte.join(' · ');
    expect(alles).not.toMatch(/Zertifizierter Fachpartner/i);
    expect(alles).not.toMatch(/\(/);
  });

  it('wiederholt keine Fakten, die der Einstieg oder andere Abschnitte schon zweimal tragen', () => {
    const alles = texte.join(' · ');
    for (const verboten of ['13:30', '30 Tage', '35 km', '1926', '100 Jahre', 'Hilti', '15', 'Lahn-Dill-Kreis', 'Servicefahrzeug']) {
      expect(alles, verboten).not.toContain(verboten);
    }
  });

  it('jeder Punkt hat eine eindeutige Kennung, eine Reihe und eine Quelle; Betrieb vor Partnern', () => {
    expect(new Set(punkte.map((p) => p.id)).size).toBe(punkte.length);
    expect(punkte.every((p) => p.quelle.length > 0 && p.text.length > 0)).toBe(true);
    const gruppen = punkte.map((p) => p.gruppe);
    expect(gruppen.lastIndexOf('betrieb')).toBeLessThan(gruppen.indexOf('partner'));
    expect(punkte).toHaveLength(7);
  });
});
