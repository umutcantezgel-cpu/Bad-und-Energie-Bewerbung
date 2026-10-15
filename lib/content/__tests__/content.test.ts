import { describe, expect, it } from 'vitest';
import { companyData } from '@/lib/data/company';
import { ALL_JOBS, getJobById } from '@/lib/jobs/registry';
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
  STELLEN_FAQ_ITEMS,
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
  processAudienceFor,
  isFactId,
  FUER_FACHKRAEFTE,
  sammelAblauf,
  fuehrtFakt,
  fuehrendeStellen,
  type FaktTraeger,
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

  it('fuehrtFakt: nur was die Stelle selbst nennt, nie für eine offene Kategorie (Prüfung E-029, Runde 3)', () => {
    const stelle = (teil: Partial<FaktTraeger>): FaktTraeger => ({
      category: 'anlagenmechaniker',
      benefitFactIds: [],
      employment: { permanent: false },
      pay: 'auf-anfrage',
      ...teil,
    });
    expect(fuehrtFakt('aboveTariff', stelle({ benefitFactIds: ['aboveTariff'] }))).toBe(true);
    expect(fuehrtFakt('aboveTariff', stelle({}))).toBe(false);
    // „Unbefristet“ in der Meta-Zeile trägt den Vertrag, „Lohn auf Anfrage“ den Lohn; sonst nichts aus Meta-Angaben
    expect(fuehrtFakt('permanentContract', stelle({ employment: { permanent: true } }))).toBe(true);
    expect(fuehrtFakt('permanentContract', stelle({}))).toBe(false);
    expect(fuehrtFakt('vacation30', stelle({ employment: { permanent: true } }))).toBe(false);
    expect(fuehrtFakt('payOnRequest', stelle({}))).toBe(true);
    expect(fuehrtFakt('payOnRequest', stelle({ category: 'praktikum', pay: 'keine-angabe' }))).toBe(false);
    // Offen fürs Büro (S5): auch mit gesetztem Flag nicht
    expect(fuehrtFakt('permanentContract', stelle({ category: 'buero', employment: { permanent: true } }))).toBe(false);
    expect(fuehrtFakt('vacation30', stelle({ category: 'buero', benefitFactIds: ['vacation30'] }))).toBe(false);
    // Echte Stellen: Ausbildung ohne Tarif und ohne unbefristeten Vertrag, Quereinstieg unbefristet ohne Tarif
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    const quer = getJobById('quereinsteiger-montagehelfer')!;
    expect([fuehrtFakt('aboveTariff', azubi), fuehrtFakt('permanentContract', azubi)]).toEqual([false, false]);
    expect([fuehrtFakt('aboveTariff', quer), fuehrtFakt('permanentContract', quer)]).toEqual([false, true]);
    expect(fuehrendeStellen('aboveTariff', ALL_JOBS).map((job) => job.id)).toEqual(
      ALL_JOBS.filter((job) => job.benefitFactIds.includes('aboveTariff')).map((job) => job.id),
    );
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

  // Plan §C5: FAQ je Stelle ausgebaut (vorher drei je Fragenset). Ebenso streng: jede Art hat ihre feste Liste, jede ID
  // löst auf, keine doppelt, jede Art mit Bezahlung hat genau eine Frage dazu, das Schülerpraktikum keine.
  it('Fragen je Art der Stelle: feste Liste, eindeutig, genau eine Frage zur Bezahlung (Praktikum keine)', () => {
    expect(JOB_FAQ_IDS).toEqual({
      anlagenmechaniker: ['lohn', 'diskreter-wechsel', 'firmenfahrzeug', 'fernmontage', 'antwortzeit'],
      kundendienst: ['lohn', 'diskreter-wechsel', 'firmenfahrzeug', 'fernmontage', 'antwortzeit'],
      projektleitung: ['lohn', 'diskreter-wechsel', 'firmenfahrzeug', 'fernmontage', 'antwortzeit'],
      ausbildung: ['lohn-ausbildung', 'berufsschule', 'fuehrerschein-ausbildung', 'lebenslauf', 'fernmontage'],
      helfer: ['lohn-quereinstieg', 'quereinstieg', 'lebenslauf', 'fernmontage', 'antwortzeit'],
      buero: ['lohn-buero', 'buero-umfang', 'diskreter-wechsel', 'lebenslauf', 'antwortzeit'],
      praktikum: [
        'praktikum-inhalt',
        'praktikum-dauer',
        'praktikum-ausbildung',
        'praktikum-bewerbung',
        'heizsysteme',
        'fernmontage',
        'lebenslauf',
        'antwortzeit',
      ],
    });
    for (const [art, ids] of Object.entries(JOB_FAQ_IDS)) {
      expect(getFaqItems(ids), art).toHaveLength(ids.length);
      expect(new Set(ids).size, art).toBe(ids.length);
      expect(ids.filter((id) => id.startsWith('lohn')), art).toHaveLength(art === 'praktikum' ? 0 : 1);
    }
  });

  it('Fachkräfte-Stellen ohne Lebenslauf-Frage (steht auf der Stellenseite schon über dem Flow)', () => {
    for (const art of ['anlagenmechaniker', 'kundendienst', 'projektleitung'] as const) expect(JOB_FAQ_IDS[art]).not.toContain('lebenslauf');
  });

  it('Fragen der Stellenseiten: Du-Form, belegte Fakten (nie offen), kein Betrag (E-030)', () => {
    expect(new Set(STELLEN_FAQ_ITEMS.map((f) => f.id)).size).toBe(STELLEN_FAQ_ITEMS.length);
    for (const item of STELLEN_FAQ_ITEMS) {
      expect(item.answer, item.id).not.toMatch(OLD_ADDRESS);
      expect(`${item.question} ${item.answer}`, item.id).not.toMatch(/\d\s*(?:€|Euro)|€/);
      for (const factId of item.factIds) {
        expect(FACTS[factId], `${item.id}: ${factId}`).toBeDefined();
        expect(FACTS[factId].pending, `${item.id}: ${factId}`).toBeUndefined();
      }
    }
    const antwort = (id: string) => STELLEN_FAQ_ITEMS.find((f) => f.id === id)!.answer;
    expect(antwort('lohn')).toBe(`${FACTS.payOnRequest.long} ${FACTS.aboveTariff.long}`);
    for (const id of ['lohn', 'lohn-ausbildung', 'lohn-quereinstieg', 'lohn-buero']) expect(antwort(id)).toContain('auf Anfrage');
    // Fürs Büro ist keine Tarifaussage belegt (fakten-abgleich S5)
    expect(antwort('lohn-buero')).not.toMatch(/Tarif/);
    expect(antwort('antwortzeit')).toBe(FACTS.quickResponse.long);
    expect(antwort('praktikum-dauer')).toBe('Das stimmen wir mit dir und deiner Schule ab.');
    // Praktikum: Inhalt im Wortlaut der Aufgaben, die Ausbildung mit der Dauer der Ausbildungsstellen, kein Wort zu Geld
    const praktikum = getJobById('schuelerpraktikum-shk')!;
    expect(antwort('praktikum-inhalt')).toContain(praktikum.tasks[0]);
    expect(antwort('praktikum-inhalt')).toContain(praktikum.tasks[1].replace(/^Kennenlernen der /, 'die '));
    for (const job of ALL_JOBS.filter((j) => j.employment.kind === 'ausbildung')) {
      expect(antwort('praktikum-ausbildung'), job.id).toContain(`${String((job.employment.durationMonths ?? 0) / 12).replace('.', ',')} Jahre`);
    }
    for (const id of JOB_FAQ_IDS.praktikum) {
      const item = getFaqItems([id])[0];
      expect(`${item.question} ${item.answer}`, id).not.toMatch(/Lohn|Gehalt|Vergütung|verdien|bezahl|Tarif|Prämie|Zuschuss|Geld/i);
    }
    // Unbelegtes fehlt: keine Wochenstunden, keine Probezeit, kein Name einer Berufsschule (M-024)
    expect(STELLEN_FAQ_ITEMS.map((f) => `${f.question} ${f.answer}`).join(' ')).not.toMatch(/Probezeit|Stunden pro Woche|Wochenstunden|Schule in /);
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

  it('Schülerpraktikum (S4): Ablauf nach der Kategorie, ohne Werkzeugset, ohne Geschenk, ohne Geld, ohne „Ausbildung“', () => {
    const praktika = ALL_JOBS.filter((job) => job.category === 'praktikum');
    expect(praktika.length).toBeGreaterThan(0);
    for (const job of praktika) {
      // Das Fragenset bleibt das der Ausbildung (Schule), der Ablauf nicht
      expect(job.apply.questionSet).toBe('ausbildung');
      expect(processAudienceFor({ category: job.category, questionSet: job.apply.questionSet })).toBe('praktikum');
    }
    const steps = getProcessSteps('praktikum');
    const intro = getProcessIntro('praktikum');
    expect(steps.map((s) => s.number)).toEqual([1, 2, 3]);
    expect(intro.title).toBe('In 3 Schritten zu deinem Praktikum');
    const text = [intro.title, intro.text, ...steps.flatMap((s) => [s.title, s.text, s.highlight])].join(' ');
    expect(text).not.toMatch(/Hilti|Werkzeug|geschenkt|Ausbildung|Azubi|Lohn|Geld|Vergütung|Tarif|€|diskret|Feierabend/);
    expect(steps[2].title).toBe('Zeitraum nach Absprache mit deiner Schule');
    expect(steps[1].text).toContain('Schule');
    expect(getDiscretionPromise('praktikum')).toBeNull();
    // Alle anderen Stellen behalten den Ablauf ihres Fragensets
    for (const job of ALL_JOBS.filter((j) => j.category !== 'praktikum')) {
      expect(processAudienceFor({ category: job.category, questionSet: job.apply.questionSet }), job.id).toBe(job.apply.questionSet);
    }
    // Ohne Stelle (Initiativbewerbung) zählt das Fragenset
    expect(processAudienceFor({ questionSet: 'fachkraft' })).toBe('fachkraft');
  });

  it('Sammelfläche (Prüfung E-029, Runde 3): Schritt 3 „Für Fachkräfte“, sobald eine gezeigte Stelle anders läuft', () => {
    const job = (id: string) => getJobById(id)!;
    const fachkraft = getProcessSteps('fachkraft');
    // Nur Fachkräfte oder keine Stelle: der Ablauf der Fachkräfte ohne Bezug, keine Varianten
    for (const stellen of [[], [job('anlagenmechaniker-shk'), job('kundendiensttechniker-shk')]]) {
      expect(sammelAblauf(stellen)).toEqual({ schritte: fachkraft, varianten: [] });
    }
    // Mit dem Büro: Schritt 3 mit Bezug, sonst unverändert; die Büro-Variante mit Kennenlernen und Start im Wortlaut
    const mitBuero = sammelAblauf([job('anlagenmechaniker-shk'), job('buerofachkraft')]);
    expect(mitBuero.schritte.slice(0, 2)).toEqual(fachkraft.slice(0, 2));
    expect(mitBuero.schritte[2]).toEqual({ ...fachkraft[2], text: `${FUER_FACHKRAEFTE}: ${fachkraft[2].text}` });
    expect(mitBuero.varianten).toEqual([
      { audience: 'buero', name: 'Büro', text: `${getProcessSteps('buero')[1].text} ${getProcessSteps('buero')[2].text}` },
    ]);
    // Alle Stellen: jede Art mit eigenem Ablauf einmal, in fester Reihenfolge; das Praktikum nach der Kategorie
    const alle = sammelAblauf(ALL_JOBS);
    expect(alle.varianten.map((variante) => variante.audience)).toEqual(['ausbildung', 'quereinstieg', 'buero', 'praktikum']);
    expect(alle.varianten.find((variante) => variante.audience === 'quereinstieg')?.text).toBe(getProcessSteps('quereinstieg')[2].text);
    expect(alle.varianten.find((variante) => variante.audience === 'praktikum')?.text).not.toMatch(/Hilti|Werkzeug|Lohn/);
    // Der unbefristete Vertrag steht nur im Schritt der Fachkräfte, nie in einer Variante
    for (const variante of alle.varianten) expect(variante.text, variante.name).not.toMatch(/unbefristet|Servicefahrzeug/);
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
