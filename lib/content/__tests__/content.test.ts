import { describe, expect, it } from 'vitest';
import { companyData } from '@/lib/data/company';
import { regionalLocations } from '@/lib/data/locations';
import { teamData } from '@/lib/data/team';
import {
  COMPANY,
  DISCRETION_PROMISE,
  FACTS,
  FACT_IDS,
  FAQ_ITEMS,
  JOB_FAQ_IDS,
  PROCESS_STEPS,
  REGION,
  TEAM_QUOTES,
  TEAM_PROFILES,
  TEAM_QUOTES_ON_HOLD,
  TEAM_QUOTE_IDS,
  getFact,
  getReleasedQuote,
  getDiscretionPromise,
  getFaqItems,
  getProcessIntro,
  getProcessSteps,
  isFactActive,
  isFactId,
} from '..';

const REQUIRED_FACTS = [
  'flexibleHours',
  'noUnpaidOvertime',
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

  it('Arbeitszeit nach dem Inhaber (2026-10-12, fakten-abgleich B28/B29): flexibel, ohne Uhrzeit und ohne Kennzahl', () => {
    expect(isFactId('friday1330')).toBe(false);
    expect(isFactId('workingHours')).toBe(false);
    expect(FACTS.flexibleHours).toMatchObject({ short: 'Flexible Arbeitszeiten', long: 'Flexible Arbeitszeiten.' });
    expect(FACTS.flexibleHours.value).toBeUndefined();
    expect(FACTS.flexibleHours.label).toBeUndefined();
    expect(FACTS.radius35.long).toBe('Alle Baustellen liegen im Umkreis von 35 km um Wetzlar.');
    expect(FACTS.noUnpaidOvertime.long).toBe('Keine unbezahlten Überstunden.');
    expect(FACTS.noFarAssembly.long).toBe('Keine Fernmontagen und keine Hotelübernachtungen: Du bist jeden Abend zu Hause.');
    for (const id of ['flexibleHours', 'radius35', 'noUnpaidOvertime', 'noFarAssembly'] as const) {
      expect(FACTS[id].source, id).toBe('docs/operations/fakten-abgleich.md@699dcfb');
    }
  });

  it('drei FAQ je Fragenset', () => {
    for (const ids of Object.values(JOB_FAQ_IDS)) expect(getFaqItems(ids)).toHaveLength(3);
  });

  it('Fachkräfte-Stellen ohne Lebenslauf-Frage (steht auf der Stellenseite schon über dem Flow)', () => {
    expect(JOB_FAQ_IDS.fachkraft).not.toContain('lebenslauf');
  });

  it('Wochenende so stark wie der Fakt noWeekendOnCall, nicht stärker', () => {
    const answer = FAQ_ITEMS.find((f) => f.id === 'fernmontage')?.answer ?? '';
    expect(answer).toContain('jeden Abend');
    expect(answer).not.toMatch(/ausgeschlossen|Nachmittag/);
  });

  it('Fernmontage-Frage: 35 km rundum, „jeden Abend zu Hause“ ohne „pünktlich“, ohne Uhrzeit (B28, B29)', () => {
    const fernmontage = FAQ_ITEMS.find((f) => f.id === 'fernmontage')!;
    expect(fernmontage.answer).toBe(
      'Nein. Unsere Baustellen liegen alle im Umkreis von 35 km um Wetzlar. Du bist jeden Abend zu Hause, und am Wochenende hast du frei.',
    );
    expect(fernmontage.factIds).toEqual(['radius35', 'noFarAssembly', 'noWeekendOnCall']);
  });
});

describe('Ablauf', () => {
  it('Schritt 1 wiederholt „kein Lebenslauf“ nicht', () => {
    expect(PROCESS_STEPS[0].text).not.toMatch(/Lebenslauf|Anschreiben/);
  });

  it('Ausbildung: Kennenlernen ohne Diskretion und ohne Anstellung', () => {
    const meet = getProcessSteps('ausbildung')[1];
    expect(meet.text).not.toMatch(/diskret|Feierabend|Lohn/);
    expect(getProcessIntro('ausbildung').text).not.toContain('Anstellung');
    expect(getDiscretionPromise('ausbildung')).toBeNull();
    expect(getDiscretionPromise('fachkraft')).toBe(DISCRETION_PROMISE);
    expect(getDiscretionPromise('quereinstieg')).toBe(DISCRETION_PROMISE);
    expect(getProcessSteps('fachkraft')[1].text).toContain('diskret');
  });

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

  it('Einsatzgebiet: 35 km rundum, auch die Nachbarkreise; „jeden Abend zu Hause“ ohne „pünktlich“ (B28, B29)', () => {
    expect(REGION.summary).toBe(
      'Du arbeitest in Wetzlar, Gießen, im Lahn-Dill-Kreis und in den Nachbarkreisen, ohne Hotelübernachtungen, und bist jeden Abend zu Hause.',
    );
    expect(REGION.summary).not.toMatch(/pünktlich/);
  });

  it('Meilenstein hat genau zwei Sätze', () => {
    expect(REGION.milestone.text.split(/(?<=\.)\s+(?=[A-ZÄÖÜ])/)).toHaveLength(2);
    expect(REGION.milestone.text).toContain('Siegmund-Hiepe-Str. 20');
    expect(REGION.milestone.text).toContain(`${FACTS.employees15.value} Leuten`);
  });
});

describe('TEAM_QUOTES', () => {
  it('nur die freigegebenen echten Zitate aus lib/data/team.ts; Demir und Koch sind ausgeblendet (B30)', () => {
    expect(Object.keys(TEAM_QUOTES)).toEqual([...TEAM_QUOTE_IDS]);
    expect([...TEAM_QUOTE_IDS]).toEqual(['becker', 'weber']);
    const freigegeben = teamData.filter((m) => !m.quoteOnHold).map((m) => m.quote);
    expect(Object.values(TEAM_QUOTES).map((q) => q.quote).sort()).toEqual(freigegeben.sort());
    expect(TEAM_QUOTES.becker.name).toBe('Marc Becker');
    expect(TEAM_QUOTES.weber.name).toBe('Jonas Weber');
    expect(TEAM_QUOTES_ON_HOLD.map((q) => q.id)).toEqual(['demir', 'koch']);
    for (const q of TEAM_QUOTES_ON_HOLD) expect(q.reason, q.id).toMatch(/^B30: /);
    expect(getReleasedQuote('demir')).toBeUndefined();
    expect(getReleasedQuote('koch')).toBeUndefined();
    expect(getReleasedQuote('becker')).toBe(TEAM_QUOTES.becker);
  });

  it('kein gezeigtes Zitat nennt eine feste Uhrzeit oder Feierabend', () => {
    for (const q of Object.values(TEAM_QUOTES)) expect(q.quote, q.id).not.toMatch(/\d:\d|Feierabend|pünktlich/i);
  });

  it('Profile ohne Zitat bleiben für alle vier (Name und Rolle, z. B. Geschäftsführer im Impressum)', () => {
    expect(TEAM_PROFILES.demir).toMatchObject({ name: 'Sabri Demir', initials: 'SD', role: 'Geschäftsführer und Meister' });
    expect(TEAM_PROFILES.koch.name).toBe('Alexander Koch');
    expect(Object.values(TEAM_PROFILES).some((p) => 'quote' in p)).toBe(false);
  });

  it('zeigt nur zeitlose Angaben (kein Lehrjahr, keine Dauer ohne Stichtag)', () => {
    expect(TEAM_QUOTES.weber).toMatchObject({ role: 'Auszubildender', experience: 'Seit August 2024 im Betrieb' });
    expect(TEAM_PROFILES.koch).toMatchObject({ role: 'Obermonteur Wärmepumpen', experience: undefined });
    expect(TEAM_QUOTES.becker.experience).toBeUndefined();
    expect(TEAM_PROFILES.demir.experience).toBe('Über 25 Jahre Handwerkserfahrung');
  });
});

describe('COMPANY', () => {
  it('Stammdaten nach DIN 5008 und den letzten Fakten-Fixes', () => {
    expect(COMPANY.phone.display).toBe('06441 42956');
    expect(COMPANY.phone.href).toBe('tel:+49644142956');
    // WhatsApp läuft über die Mobilnummer (Inhaber, 2026-10-10), Anrufe weiter über das Büro.
    expect(COMPANY.whatsapp.display).toBe('0160 8834290');
    expect(COMPANY.whatsapp.e164).toBe('+491608834290');
    expect(COMPANY.whatsapp.href).toBe('https://api.whatsapp.com/send?phone=491608834290');
    expect(COMPANY.register).toEqual({ full: 'HRB 2449 Amtsgericht Wetzlar', number: 'HRB 2449', court: 'Amtsgericht Wetzlar' });
    expect(COMPANY.address).toMatchObject({ street: 'Siegmund-Hiepe-Str. 20', postalCode: '35578', city: 'Wetzlar' });
    expect(COMPANY.foundingYear).toBe(1926);
    expect(COMPANY.email).toBe('info@bad-energie.de');
    expect(COMPANY.managingDirector.title).toBe('Geschäftsführer und Meister');
    expect(COMPANY.openingHours.spec[1]).toMatchObject({ opens: '07:00', closes: '13:30' });
  });
});
