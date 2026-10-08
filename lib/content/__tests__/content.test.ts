import { describe, expect, it } from 'vitest';
import { companyData } from '@/lib/data/company';
import { regionalLocations } from '@/lib/data/locations';
import { teamData } from '@/lib/data/team';
import {
  COMPANY,
  FACTS,
  FACT_IDS,
  FAQ_ITEMS,
  JOB_FAQ_IDS,
  PROCESS_STEPS,
  REGION,
  TEAM_QUOTES,
  TEAM_QUOTE_IDS,
  getFact,
  getFaqItems,
  getProcessSteps,
  isFactActive,
  isFactId,
} from '..';

const REQUIRED_FACTS = [
  'friday1330',
  'vacation30',
  'radius35',
  'founded1926',
  'anniversary100',
  'employees15',
  'aboveTariff',
  'hilti',
  'vehicle',
  'noWeekendOnCall',
  'noFarAssembly',
  'partners5',
  'discretion',
  'noCvNeeded',
] as const;

/** Großgeschriebenes Sie/Du mitten im Satz deutet auf alte Anrede hin. */
const OLD_ADDRESS = /[a-zäöüß,]\s(Du|Dich|Dir|Dein|Deine|Deinen|Deinem|Deiner|Sie|Ihnen|Ihr|Ihre)\b/;

describe('FACTS', () => {
  it('enthält alle Pflicht-Fakten mit Quelle', () => {
    for (const id of REQUIRED_FACTS) {
      const fact = getFact(id);
      expect(fact.id).toBe(id);
      expect(fact.short.length).toBeGreaterThan(2);
      expect(fact.long.length).toBeGreaterThan(fact.short.length - 10);
      expect(fact.source).toMatch(/^(app|lib|components|docs)\/[^@\s]+\.(?:tsx?|md|txt)@[0-9a-f]{7,40}$/);
    }
  });

  it('jede Quelle ist auf einen festen Commit gepinnt', () => {
    for (const id of FACT_IDS) expect(FACTS[id].source, id).toMatch(/@[0-9a-f]{7,40}$/);
  });

  it('Schlüssel und IDs stimmen überein', () => {
    expect(Object.keys(FACTS)).toEqual(FACT_IDS);
    for (const id of FACT_IDS) expect(FACTS[id].id).toBe(id);
    expect(isFactId('vacation30')).toBe(true);
    expect(isFactId('erfunden')).toBe(false);
  });

  it('Kennzahlen entsprechen den Quellen', () => {
    expect(FACTS.friday1330.value).toBe('13:30');
    expect(FACTS.vacation30.value).toBe('30');
    expect(FACTS.radius35.value).toBe('35 km');
    expect(FACTS.founded1926.value).toBe(String(companyData.foundingYear));
    expect(FACTS.employees15.value).toBe('15');
    expect(FACTS.partners5.list).toEqual(companyData.partnerPillars);
    expect(FACTS.partners5.list).toHaveLength(5);
  });

  it('„100 Jahre“ läuft Ende 2026 ab', () => {
    expect(isFactActive('anniversary100', new Date('2026-12-31T12:00:00Z'))).toBe(true);
    expect(isFactActive('anniversary100', new Date('2027-01-01T00:00:00Z'))).toBe(false);
    expect(isFactActive('founded1926', new Date('2030-01-01T00:00:00Z'))).toBe(true);
  });

  it('keine alte Anrede und kein Versprechen „24 Stunden“', () => {
    for (const fact of Object.values(FACTS)) {
      expect(fact.long, fact.id).not.toMatch(OLD_ADDRESS);
      expect(`${fact.short} ${fact.long}`, fact.id).not.toMatch(/24\s?(Stunden|h\b)/);
    }
  });
});

describe('FAQ', () => {
  it('die fünf bestehenden Fragen in Du-Form', () => {
    expect(FAQ_ITEMS).toHaveLength(5);
    expect(new Set(FAQ_ITEMS.map((f) => f.id)).size).toBe(5);
    for (const item of FAQ_ITEMS) {
      expect(item.answer, item.id).not.toMatch(OLD_ADDRESS);
      for (const factId of item.factIds) expect(FACTS[factId]).toBeDefined();
    }
  });

  it('drei FAQ je Fragenset', () => {
    for (const ids of Object.values(JOB_FAQ_IDS)) expect(getFaqItems(ids)).toHaveLength(3);
  });
});

describe('Ablauf', () => {
  it('drei Schritte, Start je Zielgruppe', () => {
    expect(PROCESS_STEPS.map((s) => s.number)).toEqual([1, 2, 3]);
    expect(getProcessSteps('ausbildung')[2].text).toContain('Azubi-Werkzeugset');
    expect(getProcessSteps('fachkraft')[2].text).toContain('unbefristeten');
    for (const step of [...PROCESS_STEPS, ...getProcessSteps('quereinstieg')]) {
      expect(step.text).not.toMatch(OLD_ADDRESS);
    }
  });
});

describe('REGION', () => {
  it('Zentrum Wetzlar, 35 km, alle Orte aus locations.ts nach Entfernung', () => {
    expect(REGION.center).toMatchObject({ name: 'Wetzlar', postalCode: '35578' });
    expect(REGION.radiusKm).toBe(35);
    expect(REGION.locations).toHaveLength(regionalLocations.length);
    const distances = REGION.locations.map((l) => l.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    for (const l of REGION.locations) expect(l.distanceKm).toBeLessThanOrEqual(REGION.radiusKm);
  });

  it('Meilenstein hat genau zwei Sätze', () => {
    expect(REGION.milestone.text.split(/(?<=\.)\s+(?=[A-ZÄÖÜ])/)).toHaveLength(2);
    expect(REGION.milestone.text).toContain('Siegmund-Hiepe-Str. 20');
    expect(REGION.milestone.text).toContain('15 Mitarbeiter');
  });
});

describe('TEAM_QUOTES', () => {
  it('vier echte Zitate aus lib/data/team.ts', () => {
    expect(Object.keys(TEAM_QUOTES)).toEqual([...TEAM_QUOTE_IDS]);
    expect(Object.values(TEAM_QUOTES).map((q) => q.quote).sort()).toEqual(teamData.map((m) => m.quote).sort());
    expect(TEAM_QUOTES.demir).toMatchObject({ name: 'Sabri Demir', initials: 'SD', role: 'Geschäftsführer und Meister' });
    expect(TEAM_QUOTES.koch.name).toBe('Alexander Koch');
    expect(TEAM_QUOTES.becker.name).toBe('Marc Becker');
    expect(TEAM_QUOTES.weber.name).toBe('Jonas Weber');
  });

  it('zeigt nur zeitlose Angaben (kein Lehrjahr, keine Dauer ohne Stichtag)', () => {
    expect(TEAM_QUOTES.weber).toMatchObject({ role: 'Auszubildender', experience: 'Seit August 2024 im Betrieb' });
    expect(TEAM_QUOTES.koch).toMatchObject({ role: 'Obermonteur Wärmepumpen', experience: undefined });
    expect(TEAM_QUOTES.becker.experience).toBeUndefined();
    expect(TEAM_QUOTES.demir.experience).toBe('Über 25 Jahre Handwerkserfahrung');
  });
});

describe('COMPANY', () => {
  it('Stammdaten nach DIN 5008 und den letzten Fakten-Fixes', () => {
    expect(COMPANY.phone.display).toBe('06441 42956');
    expect(COMPANY.phone.href).toBe('tel:+49644142956');
    expect(COMPANY.whatsapp.href).toBe('https://api.whatsapp.com/send?phone=49644142956');
    expect(COMPANY.register).toEqual({ full: 'HRB 2449 Amtsgericht Wetzlar', number: 'HRB 2449', court: 'Amtsgericht Wetzlar' });
    expect(COMPANY.address).toMatchObject({ street: 'Siegmund-Hiepe-Str. 20', postalCode: '35578', city: 'Wetzlar' });
    expect(COMPANY.foundingYear).toBe(1926);
    expect(COMPANY.email).toBe('info@bad-energie.de');
    expect(COMPANY.managingDirector.title).toBe('Geschäftsführer und Meister');
    expect(COMPANY.openingHours.spec[1]).toMatchObject({ opens: '07:00', closes: '13:30' });
  });
});
