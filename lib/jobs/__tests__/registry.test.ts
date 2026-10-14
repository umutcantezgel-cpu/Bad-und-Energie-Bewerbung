import { describe, expect, it } from 'vitest';
import { FACTS, getFact } from '@/lib/content/facts';
import { TEAM_QUOTES } from '@/lib/content/team';
import slugLock from '../slugs.lock.json';
import { toPlainDescription } from '../format';
import {
  ALL_JOBS,
  JOB_IDS,
  assertRegistry,
  getActiveJobs,
  getChannelJobs,
  getFunnelOptions,
  getJobById,
  getJobByLegacySlug,
  getJobBySlug,
  getJobPageSlugs,
  getJobsExpiringWithin,
  getLiveSuccessor,
  isJobLive,
  isJobSuperseded,
  type Job,
} from '../registry';
import { EURO_AMOUNT, JobSchema, MAX_VALID_DAYS, MONEY_WORDS, defineJob, parseJobDate, type JobInput } from '../schema';

/** Fester Stichtag nur für die Ablauf-Logik selbst; Invarianten laufen gegen die echte Uhr. */
const TEST_DATE = new Date('2026-10-08T00:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const published = ALL_JOBS.filter((job) => job.status === 'published');
const az26 = getJobById('ausbildung-anlagenmechaniker-shk')!;
const az27 = getJobById('ausbildung-anlagenmechaniker-shk-2027')!;
const buero = getJobById('buerofachkraft')!;
const praktikum = getJobById('schuelerpraktikum-shk')!;
const qe = getJobById('quereinsteiger-montagehelfer')!;

/** Alle Texte einer Stelle, wie sie Seite, Schema und Feeds zeigen. */
const texte = (job: Job) => `${JSON.stringify(job)} ${toPlainDescription(job)}`;

describe('Job-Registry', () => {
  it.each(ALL_JOBS.map((job) => [job.id, job] as const))('%s erfüllt das Schema', (_id, job) => {
    const result = JobSchema.safeParse(job);
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });

  it('JOB_IDS deckt genau ALL_JOBS ab, in derselben Reihenfolge', () => {
    expect(ALL_JOBS.map((job) => job.id)).toEqual([...JOB_IDS]);
  });

  it('IDs, Slugs (inkl. redirectFrom) und Referenzen sind eindeutig', () => {
    const ids = ALL_JOBS.map((j) => j.id);
    const refs = ALL_JOBS.map((j) => j.referenceCode);
    const slugs = ALL_JOBS.flatMap((j) => [j.slug, ...j.redirectFrom]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(refs).size).toBe(refs.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('behält die bestehenden Referenzcodes, neue Stellen zählen weiter', () => {
    expect(Object.fromEntries(ALL_JOBS.map((j) => [j.id, j.referenceCode]))).toEqual({
      'anlagenmechaniker-shk': 'SHK-WP-2026-01',
      'kundendiensttechniker-shk': 'SHK-KD-2026-02',
      'obermonteur-projektleiter-shk': 'SHK-PL-2026-03',
      'ausbildung-anlagenmechaniker-shk': 'SHK-AZ-2026-04',
      'ausbildung-anlagenmechaniker-shk-2027': 'SHK-AZ-2027-06',
      'quereinsteiger-montagehelfer': 'SHK-QE-2026-05',
      'buerofachkraft': 'SHK-BU-2026-08',
      'schuelerpraktikum-shk': 'SHK-PR-2026-07',
    });
  });

  // Plan §C3: verlängert wird mit validThrough und updatedAt, nie mit einem neuen datePosted.
  it('datePosted bleibt, wie die Stelle zuerst erschien (kein künstliches Erneuern)', () => {
    expect(Object.fromEntries(ALL_JOBS.map((j) => [j.id, j.datePosted]))).toEqual({
      'anlagenmechaniker-shk': '2026-03-01',
      'kundendiensttechniker-shk': '2026-03-01',
      'obermonteur-projektleiter-shk': '2026-03-01',
      'ausbildung-anlagenmechaniker-shk': '2026-03-01',
      'ausbildung-anlagenmechaniker-shk-2027': '2026-10-14',
      'quereinsteiger-montagehelfer': '2026-10-08',
      'buerofachkraft': '2026-10-14',
      'schuelerpraktikum-shk': '2026-10-14',
    });
  });

  it('Slug-Lock: jede Stellenseite steht im Lock, jeder gesperrte Slug lebt weiter oder leitet um', () => {
    const locked = new Set(slugLock.slugs);
    for (const slug of getJobPageSlugs()) expect(locked, `Slug fehlt in slugs.lock.json: ${slug}`).toContain(slug);

    const current = new Set(ALL_JOBS.map((j) => j.slug));
    for (const slug of locked) {
      const resolvable = current.has(slug) || getJobByLegacySlug(slug) !== undefined;
      expect(resolvable, `Gesperrter Slug ohne Stelle und ohne redirectFrom: ${slug}`).toBe(true);
    }
  });

  it('getActiveJobs liefert die veröffentlichten Stellen in fester Reihenfolge', () => {
    expect(getActiveJobs().map((j) => j.id)).toEqual([
      'anlagenmechaniker-shk',
      'kundendiensttechniker-shk',
      'obermonteur-projektleiter-shk',
      'ausbildung-anlagenmechaniker-shk',
      'ausbildung-anlagenmechaniker-shk-2027',
      'quereinsteiger-montagehelfer',
      'buerofachkraft',
      'schuelerpraktikum-shk',
    ]);
  });

  it('getFunnelOptions enthält jede wählbare Stelle mit ihrem Fragenset', () => {
    const options = getFunnelOptions();
    expect(options.map((o) => o.id)).toEqual([...JOB_IDS]);
    expect(Object.fromEntries(options.map((o) => [o.id, o.questionSet]))).toEqual({
      'anlagenmechaniker-shk': 'fachkraft',
      'kundendiensttechniker-shk': 'fachkraft',
      'obermonteur-projektleiter-shk': 'fachkraft',
      'ausbildung-anlagenmechaniker-shk': 'ausbildung',
      'ausbildung-anlagenmechaniker-shk-2027': 'ausbildung',
      'quereinsteiger-montagehelfer': 'quereinstieg',
      'buerofachkraft': 'buero',
      // Plan §C6: das Schülerpraktikum fragt wie die Ausbildung nach der Schule
      'schuelerpraktikum-shk': 'ausbildung',
    });
    expect(options.find((o) => o.id === 'quereinsteiger-montagehelfer')).toMatchObject({ status: 'published', category: 'helfer' });
  });

  it('getFunnelOptions(now) lässt abgelaufene veröffentlichte Stellen weg', () => {
    const afterExpiry = new Date(Date.parse(az26.validThrough!) + 1000);
    const ids = getFunnelOptions(afterExpiry).map((o) => o.id);
    expect(ids).not.toContain('ausbildung-anlagenmechaniker-shk');
    expect(ids).toContain('ausbildung-anlagenmechaniker-shk-2027');
    expect(getFunnelOptions(TEST_DATE).map((o) => o.id)).toEqual([...JOB_IDS]);
  });

  it('findet Stellen über Slug und ID', () => {
    expect(getJobBySlug('anlagenmechaniker-shk-wetzlar')?.id).toBe('anlagenmechaniker-shk');
    expect(getJobBySlug('gibt-es-nicht')).toBeUndefined();
    expect(getJobById('kundendiensttechniker-shk')?.slug).toBe('kundendiensttechniker-waermepumpe-wetzlar');
    expect(getJobById('unbekannt')).toBeUndefined();
  });

  it('funnel_only (gerade keine Stelle so) erscheint in keinem Kanal und ist nie live', () => {
    const input = { ...(qe as unknown as JobInput), status: 'funnel_only' as const };
    const funnelOnly = defineJob({
      ...input,
      channels: { googleJobs: false, indeedFeed: false, genericFeed: false, ba: false },
    });
    expect(isJobLive(funnelOnly, TEST_DATE)).toBe(false);
    for (const channel of ['googleJobs', 'indeedFeed', 'genericFeed', 'ba'] as const) {
      expect(getChannelJobs([funnelOnly], channel, TEST_DATE)).toEqual([]);
    }
    expect(ALL_JOBS.filter((job) => job.status === 'funnel_only').map((job) => job.slug).filter((slug) => getJobPageSlugs().includes(slug))).toEqual([]);
  });

  it('Quereinsteiger ist veröffentlicht, mit Seite und allen Kanälen (fakten-abgleich S3)', () => {
    expect(qe.status).toBe('published');
    expect(getJobPageSlugs()).toContain(qe.slug);
    expect(Object.values(qe.channels).every(Boolean)).toBe(true);
  });

  it('veröffentlichte Stellen laufen frühestens in 14 Tagen ab (echte Uhr, warnt vor Ablauf)', () => {
    const expiring = getJobsExpiringWithin(new Date(), 14).map((j) => `${j.id} (${j.validThrough})`);
    expect(expiring, 'validThrough verlängern oder Stelle archivieren, siehe docs/operations/stellen-pflegen.md').toEqual([]);
    for (const job of published) expect(job.validThrough).toBeDefined();
  });

  // Plan §C3: höchstens 90 Tage über den letzten Stand hinaus; updatedAt nicht in der Zukunft, damit die Regel greift.
  it(`veröffentlichte Stellen laufen höchstens ${MAX_VALID_DAYS} Tage über updatedAt, updatedAt liegt nicht in der Zukunft (echte Uhr)`, () => {
    const heute = new Date().toISOString().slice(0, 10);
    for (const job of published) {
      expect(parseJobDate(job.validThrough!) - parseJobDate(job.updatedAt), job.id).toBeLessThanOrEqual(MAX_VALID_DAYS * DAY);
      expect(job.updatedAt <= heute, `${job.id}: updatedAt ${job.updatedAt} liegt in der Zukunft`).toBe(true);
      expect(parseJobDate(job.validThrough!) - Date.now(), job.id).toBeLessThanOrEqual(MAX_VALID_DAYS * DAY);
    }
  });

  it('erkennt bald ablaufende Stellen', () => {
    const soon = { ...published[0], validThrough: '2026-10-15' };
    expect(getJobsExpiringWithin(TEST_DATE, 14, [soon])).toHaveLength(1);
  });

  // Ab ~17.12.2026 läge die Ausbildung 2026 in der 14-Tage-Frist. Ihr Ende ist geplant (Nachfolgerin 2027 live): Die
  // Frist trägt die Nachfolgerin. Fehlt sie oder läuft sie selbst bald ab, warnt die Prüfung wieder.
  it('abgelöste Stelle: kein Alarm, solange die Nachfolgerin live ist und nicht selbst bald abläuft', () => {
    const dezember = new Date('2026-12-20T00:00:00Z');
    expect(getJobsExpiringWithin(dezember, 14, [az26]).map((j) => j.id)).toEqual(['ausbildung-anlagenmechaniker-shk']);
    expect(isJobSuperseded(az26, dezember)).toBe(true);
    expect(getJobsExpiringWithin(dezember, 14, [az26, az27])).toEqual([]);
    const archiviert = { ...az27, status: 'archived' as const };
    expect(getJobsExpiringWithin(dezember, 14, [az26, archiviert]).map((j) => j.id)).toEqual(['ausbildung-anlagenmechaniker-shk']);
    const baldWeg = { ...az27, validThrough: '2026-12-28' };
    expect(getJobsExpiringWithin(dezember, 14, [az26, baldWeg]).map((j) => j.id)).toEqual([
      'ausbildung-anlagenmechaniker-shk',
      'ausbildung-anlagenmechaniker-shk-2027',
    ]);
    // Ohne Nachfolger ist jede Stelle wie bisher eine Warnung wert
    expect(isJobSuperseded(published[0], dezember)).toBe(false);
  });

  it('Nachfolger: gleiche Art, veröffentlicht, läuft länger, keine Ketten (Registry-Prüfung)', () => {
    const mit = (ersetzt: Job) => ALL_JOBS.map((job) => (job.id === ersetzt.id ? ersetzt : job));
    expect(() => assertRegistry(ALL_JOBS)).not.toThrow();
    expect(() => assertRegistry(mit({ ...az27, status: 'archived' }))).toThrow(/nicht veröffentlicht/);
    expect(() => assertRegistry(mit({ ...az27, category: 'helfer' }))).toThrow(/andere Art/);
    expect(() => assertRegistry(mit({ ...az27, validThrough: '2026-12-01' }))).toThrow(/länger laufen/);
    expect(() => assertRegistry(mit({ ...az27, nachfolger: 'anlagenmechaniker-shk' }))).toThrow(/selbst einen Nachfolger/);
    expect(() => assertRegistry(mit({ ...praktikum, nachfolger: 'ausbildung-anlagenmechaniker-shk-2027' }))).toThrow(/andere Art|mehr als eine/);
  });

  it('Seite der besetzten Ausbildung 2026 führt zur Nachfolgerin, solange die live ist', () => {
    const januar = new Date('2027-01-05T00:00:00Z');
    expect(isJobLive(az26, januar)).toBe(false);
    expect(getLiveSuccessor(az26, januar)?.id).toBe('ausbildung-anlagenmechaniker-shk-2027');
    expect(getLiveSuccessor(az26, new Date('2027-02-01T00:00:00Z'))).toBeUndefined();
    expect(getLiveSuccessor(published[0], januar)).toBeUndefined();
  });

  it.each(ALL_JOBS.map((job) => [job.id, job] as const))('%s: Meta-Title ≤ 60, Description ≤ 155', (_id, job) => {
    expect(job.seo.metaTitle.length).toBeLessThanOrEqual(60);
    expect(job.seo.metaDescription.length).toBeLessThanOrEqual(155);
  });

  // E-030 (Inhaber 2026-10-14): Lohn auf Anfrage bei allen Stellen; die Prüfung ist so streng wie die alte
  // („Gehalt in der Description passt zum Gehaltsfeld“): kein Betrag irgendwo, „Lohn: auf Anfrage“ in jeder Beschreibung.
  it.each(ALL_JOBS.map((job) => [job.id, job] as const))('%s: kein Betrag, „Lohn: auf Anfrage“ bzw. beim Praktikum nichts zu Geld', (_id, job) => {
    expect(job.salary).toBeUndefined();
    expect(texte(job)).not.toMatch(EURO_AMOUNT);
    expect(job.seo.metaDescription).not.toMatch(/\d\s*(?:€|Euro)/);
    if (job.category === 'praktikum') {
      expect(job.pay).toBe('keine-angabe');
      expect(toPlainDescription(job)).not.toMatch(MONEY_WORDS);
      expect(`${job.seo.metaTitle} ${job.seo.metaDescription} ${job.summary} ${job.intro}`).not.toMatch(MONEY_WORDS);
    } else {
      expect(job.pay).toBe('auf-anfrage');
      expect(toPlainDescription(job)).toContain('– Lohn: auf Anfrage');
    }
  });

  it('alle Fakt-IDs lösen auf; offene Owner-Fakten nur bei freigegebenen Stellen', () => {
    for (const job of ALL_JOBS) {
      for (const id of job.benefitFactIds) {
        const fact = getFact(id);
        expect(fact, `${job.id}: ${id}`).toBeDefined();
        if (fact.pending) expect(fact.pending.onlyForJobIds).toContain(job.id);
        expect(fact.validUntil, `${job.id}: befristeter Fakt ${id}`).toBeUndefined();
      }
    }
    expect(FACTS.payFirstWorkday.pending?.onlyForJobIds).toEqual([]);
    expect(FACTS.boschPremiumPartner.pending?.onlyForJobIds).toEqual([]);
    // Kein Fakt bei einer Stellenart, für die er nicht belegt ist (Bürofachkraft: fakten-abgleich S5, M-038)
    for (const job of ALL_JOBS) {
      for (const id of job.benefitFactIds) expect(FACTS[id].offenFuer?.kategorien ?? [], `${job.id}: ${id}`).not.toContain(job.category);
    }
    // Übernahmegarantie (A1) bleibt bis zur Bestätigung auf die Ausbildung 2026 beschränkt
    expect(FACTS.takeoverGuarantee.pending?.onlyForJobIds).toEqual(['ausbildung-anlagenmechaniker-shk']);
    expect(az27.benefitFactIds).not.toContain('takeoverGuarantee');
  });

  it('Teamzitate passen zur Rolle; Koch und Demir sind bis zur Freigabe ausgeblendet (fakten-abgleich B30)', () => {
    const quotes = Object.fromEntries(ALL_JOBS.map((j) => [j.id, j.teamQuoteId]));
    expect(quotes).toEqual({
      'anlagenmechaniker-shk': undefined,
      'kundendiensttechniker-shk': 'becker',
      'obermonteur-projektleiter-shk': undefined,
      'ausbildung-anlagenmechaniker-shk': 'weber',
      'ausbildung-anlagenmechaniker-shk-2027': 'weber',
      'quereinsteiger-montagehelfer': undefined,
      'buerofachkraft': undefined,
      'schuelerpraktikum-shk': undefined,
    });
    for (const job of ALL_JOBS) if (job.teamQuoteId) expect(TEAM_QUOTES[job.teamQuoteId]).toBeDefined();
  });

  it('titleShy trennt lange Komposita weich und entspricht sonst title', () => {
    for (const job of ALL_JOBS) {
      expect(job.titleShy.replace(/­/g, '')).toBe(job.title);
      expect(job.titleShy, job.id).toContain('­');
    }
    expect(getJobById('anlagenmechaniker-shk')!.titleShy).toContain('Anlagen­mechaniker');
    expect(getJobById('kundendiensttechniker-shk')!.titleShy).toContain('Kunden­dienst­techniker');
  });

  it('Ausbildung 2026: Einstieg 2026 noch möglich, Start nach Absprache, endet mit dem Jahr 2026, Nachfolgerin 2027', () => {
    expect(az26.seo.h1).toContain('Einstieg 2026 noch möglich');
    expect(az26.seo.metaTitle).toContain('2026');
    expect(az26.title).toBe('Ausbildung zum Anlagenmechaniker SHK (m/w/d)');
    expect(az26.employment).toMatchObject({ kind: 'ausbildung', start: 'nach-absprache', durationMonths: 42 });
    expect(az26.validThrough).toBe('2026-12-31T23:59:59+01:00');
    expect(az26.nachfolger).toBe('ausbildung-anlagenmechaniker-shk-2027');
    expect(getChannelJobs([az26], 'googleJobs', new Date('2027-01-01T00:00:00+01:00'))).toEqual([]);
  });

  it('Ausbildung 2026: Wortlaut der Owner-Entscheidung, Intro wiederholt die h1 nicht', () => {
    expect(az26.summary).toMatch(/^Ausbildung 2026: Einstieg noch möglich\. /);
    expect(az26.intro).not.toMatch(/2026|Einstieg|von Anfang an/);
  });

  it('Ausbildung 2027 (fakten-abgleich S2): eigener Slug und eigene Referenz, Start nach Absprache, über Tarif plus Prämien', () => {
    expect(az27.slug).not.toBe(az26.slug);
    expect(az27.referenceCode).toBe('SHK-AZ-2027-06');
    expect(az27.title).not.toMatch(/2027/);
    expect(az27.seo.metaTitle).toContain('2027');
    expect(az27.seo.h1).toContain('2027');
    expect(az27.employment).toMatchObject({ kind: 'ausbildung', start: 'nach-absprache', durationMonths: 42 });
    expect(az27.packageExtras.find((extra) => extra.label === 'Vergütung')?.text).toBe('Ausbildungsvergütung über Tarif, plus Prämien');
    expect(az27.pay).toBe('auf-anfrage');
    expect(az27.shortTitle).not.toBe(az26.shortTitle);
  });

  it('Bürofachkraft (fakten-abgleich S5): Voll- oder Teilzeit, die vier Aufgaben im Wortlaut, Anforderungen offen (M-038)', () => {
    expect(buero.employment.kind).toBe('voll-oder-teilzeit');
    expect(buero.tasks).toEqual([
      'Telefon und Terminplanung für Monteure und Kundendienst',
      'Angebote, Auftragsbestätigungen und Rechnungen schreiben',
      'Material beim Großhandel bestellen und Lieferungen prüfen',
      'Allgemeine Verwaltung: Ablage, Post, Zuarbeit für die Geschäftsführung',
    ]);
    expect(buero.requirements).toEqual([]);
    expect(buero.requirementsOpen).toBe('M-038');
    expect(buero.education).toBeUndefined();
    expect(buero.experienceMonths).toBeUndefined();
    expect(buero.apply.questionSet).toBe('buero');
    expect(buero.location.radiusKm).toBeUndefined();
    expect(toPlainDescription(buero)).not.toContain('Das bringst du mit');
    // Nur, was für den Betrieb als Ganzes gilt; Tarif, Urlaub, Arbeitszeit und Befristung sind fürs Büro offen (S5)
    expect(buero.benefitFactIds).toEqual(['founded1926', 'employees15']);
  });

  it('Schülerpraktikum (fakten-abgleich S4): Dauer nach Absprache mit der Schule, Fragenset der Ausbildung', () => {
    expect(praktikum.employment).toMatchObject({ kind: 'praktikum', durationNote: 'nach Absprache mit deiner Schule', permanent: false });
    expect(praktikum.category).toBe('praktikum');
    expect(praktikum.apply.questionSet).toBe('ausbildung');
    expect(toPlainDescription(praktikum)).toContain('Dauer: nach Absprache mit deiner Schule');
    expect(praktikum.packageExtras).toEqual([]);
  });

  it('Texte ohne Dopplungen auf derselben Seite', () => {
    // Obermonteur: die direkte Abstimmung steht im Vorteil directLine, nicht noch einmal mit anderem Titel im Intro.
    const obermonteur = getJobById('obermonteur-projektleiter-shk')!;
    expect(obermonteur.benefitFactIds).toContain('directLine');
    expect(obermonteur.intro).not.toMatch(/Demir|Dipl/);
    // Kundendienst: Markenliste und iPad stehen schon in Intro, Vorteilen und Aufgaben, nicht auch im Paket.
    const kundendienst = getJobById('kundendiensttechniker-shk')!;
    const paket = kundendienst.packageExtras.map((extra) => extra.text).join(' ');
    expect(paket).not.toMatch(/Buderus|iPad/);
    // Typografie: „22-V“ mit Bindestrichen, nie „22V“.
    for (const job of ALL_JOBS) {
      expect(job.packageExtras.map((extra) => extra.text).join(' '), job.id).not.toMatch(/\d+V\b/);
    }
    expect(FACTS.hilti.long).not.toMatch(/\d+V\b/);
  });

  it('kein Stellentitel nennt ein Jahr (Google-Richtlinie, auch für Feeds)', () => {
    for (const job of ALL_JOBS) expect(job.title, job.id).not.toMatch(/\b(?:19|20)\d{2}\b/);
  });

  it('Synonyme je Handwerksstelle sichtbar („Auch gesucht als“), keine doppelt und keine gleich dem Titel', () => {
    for (const job of ALL_JOBS) {
      expect(new Set(job.alsoKnownAs).size, job.id).toBe(job.alsoKnownAs.length);
      for (const name of job.alsoKnownAs) expect(job.title, `${job.id}: ${name}`).not.toContain(name);
    }
    expect(getJobById('anlagenmechaniker-shk')!.alsoKnownAs).toEqual(
      expect.arrayContaining(['Heizungsbauer', 'Installateur', 'Sanitärinstallateur']),
    );
    expect(getJobById('kundendiensttechniker-shk')!.alsoKnownAs).toContain('Servicetechniker Wärmepumpe');
  });

  it('Registry-Objekte sind eingefroren', () => {
    expect(Object.isFrozen(ALL_JOBS[0])).toBe(true);
    expect(Object.isFrozen(ALL_JOBS[0].tasks)).toBe(true);
  });
});

describe('defineJob', () => {
  const base = getJobById('anlagenmechaniker-shk')! as unknown as JobInput;
  const praktikumInput = praktikum as unknown as JobInput;
  const bueroInput = buero as unknown as JobInput;

  it('lehnt zu lange Meta-Titel ab', () => {
    expect(() => defineJob({ ...base, seo: { ...base.seo, metaTitle: 'x'.repeat(61) } })).toThrow(/metaTitle/);
  });

  it('lehnt unbekannte Fakt-IDs ab', () => {
    expect(() => defineJob({ ...base, benefitFactIds: ['erfunden' as never] })).toThrow(/benefitFactIds/);
  });

  it('lehnt offene Owner-Fakten bei nicht freigegebenen Stellen ab', () => {
    expect(() => defineJob({ ...base, benefitFactIds: ['payFirstWorkday'] })).toThrow(/Owner-Bestätigung/);
    expect(() => defineJob({ ...base, benefitFactIds: ['boschPremiumPartner'] })).toThrow(/Owner-Bestätigung/);
  });

  it('lehnt Fakten ab, die für die Stellenart nicht belegt sind (offenFuer: Urlaub, Arbeitszeit, Tarif, Befristung im Büro)', () => {
    for (const id of ['vacation30', 'flexibleHours', 'aboveTariff', 'permanentContract'] as const) {
      expect(FACTS[id].offenFuer?.kategorien, id).toContain('buero');
      expect(() => defineJob({ ...bueroInput, benefitFactIds: ['founded1926', id] }), id).toThrow(/für buero nicht belegt/);
    }
    // Für die Handwerksstellen bleiben sie erlaubt
    expect(() => defineJob({ ...base, benefitFactIds: ['vacation30', 'flexibleHours'] })).not.toThrow();
  });

  it('lehnt funnel_only mit aktivem Kanal ab', () => {
    expect(() => defineJob({ ...base, status: 'funnel_only' })).toThrow(/funnel_only/);
  });

  it('lehnt titleShy ab, das nicht zum Titel passt', () => {
    expect(() => defineJob({ ...base, titleShy: 'Etwas­anderes (m/w/d)' })).toThrow(/titleShy/);
  });

  it('lehnt Jahreszahlen im Titel ab', () => {
    expect(() =>
      defineJob({ ...base, title: 'Anlagenmechaniker SHK 2026 (m/w/d)', titleShy: 'Anlagen­mechaniker SHK 2026 (m/w/d)' }),
    ).toThrow(/Titel ohne Jahreszahl/);
  });

  it('lehnt Texte ab, deren Jahr vor dem Ablaufjahr liegt', () => {
    const seo = { ...base.seo, h1: 'Anlagenmechaniker SHK – Start 2026' };
    expect(() => defineJob({ ...base, seo, validThrough: '2027-01-02', updatedAt: '2026-12-20' })).toThrow(/nennt 2026/);
    expect(() => defineJob({ ...base, seo, validThrough: '2026-12-31', updatedAt: '2026-10-14' })).not.toThrow();
  });

  it('verlangt validThrough bei veröffentlichten Stellen, höchstens 90 Tage nach updatedAt (Plan §C3)', () => {
    expect(() => defineJob({ ...base, validThrough: undefined })).toThrow(/validThrough/);
    expect(() => defineJob({ ...base, updatedAt: '2026-10-14', validThrough: '2027-01-12T00:00:00' })).not.toThrow();
    expect(() => defineJob({ ...base, updatedAt: '2026-10-14', validThrough: '2027-01-12T00:00:01' })).toThrow(/90 Tage/);
    expect(() => defineJob({ ...base, updatedAt: '2026-10-14', validThrough: '2027-10-06T00:00:00' })).toThrow(/90 Tage/);
  });

  // E-030: so streng wie die frühere Pflicht zur Spanne, nur umgekehrt
  it('lehnt jedes Gehalt und jeden Euro-Betrag ab (Lohn auf Anfrage bei allen Stellen)', () => {
    expect(() => defineJob({ ...base, salary: { min: 3600, max: 4600, unit: 'MONTH', currency: 'EUR' } })).toThrow(/salary/);
    expect(() => defineJob({ ...base, seo: { ...base.seo, metaDescription: `${base.seo.metaDescription.slice(0, 120)} 3.600–4.600 €` } })).toThrow(
      /Euro-Betrag/,
    );
    expect(() => defineJob({ ...base, intro: `${base.intro} Ab 3.600 € im Monat.` })).toThrow(/Euro-Betrag/);
    expect(() => defineJob({ ...base, packageExtras: [{ label: 'Vergütung', text: 'Ab 20 Euro pro Stunde' }] })).toThrow(/Euro-Betrag/);
    expect(() => defineJob({ ...base, tasks: ['Montage, € 15 je Stunde'] })).toThrow(/Euro-Betrag/);
  });

  it('pay „keine-angabe“ nur beim Schülerpraktikum, und dort kein Wort zu Geld', () => {
    expect(() => defineJob({ ...base, pay: 'keine-angabe' })).toThrow(/pay/);
    expect(() => defineJob({ ...praktikumInput, pay: 'auf-anfrage' })).toThrow(/kein Wort zu Geld/);
    expect(() => defineJob({ ...praktikumInput, intro: `${praktikumInput.intro} Eine Vergütung gibt es nicht.` })).toThrow(/kein Wort zu Geld/);
    expect(() => defineJob({ ...praktikumInput, benefitFactIds: ['flexibleHours', 'noUnpaidOvertime'] })).toThrow(/kein Wort zu Geld/);
    expect(() => defineJob({ ...praktikumInput, employment: { ...praktikumInput.employment, durationNote: undefined } })).toThrow(/durationNote/);
    expect(() => defineJob({ ...base, employment: { ...base.employment, durationNote: 'zwei Wochen' } })).toThrow(/nur beim Praktikum/);
  });

  it('Anforderungen fehlen nur mit Verweis auf die offene Frage (M-038), nichts erfinden', () => {
    expect(() => defineJob({ ...bueroInput, requirementsOpen: undefined })).toThrow(/requirementsOpen/);
    expect(() => defineJob({ ...bueroInput, requirements: ['Kaufmännische Ausbildung'] })).toThrow(/requirementsOpen/);
    expect(() => defineJob({ ...bueroInput, requirementsOpen: 'offen' })).toThrow(/MENSCHEN/);
  });

  it('ISCO-08 nur aus dem Umsteigeschlüssel: eindeutig oder gar nicht', () => {
    expect(() => defineJob({ ...base, beruf: { kldb: '34212' } })).toThrow(/ISCO-08/);
    expect(() => defineJob({ ...base, beruf: { kldb: '34212', isco: '3123' } })).toThrow(/ISCO-08/);
    expect(() => defineJob({ ...base, beruf: { kldb: '25132', isco: '7126' } })).toThrow(/nicht eindeutig/);
    expect(() => defineJob({ ...base, beruf: { kldb: '34212', isco: '7126', berufenetId: 'geschätzt' } })).toThrow(/BERUFENET/);
    expect(() => defineJob({ ...base, beruf: { kldb: '99999' as never } })).toThrow(/beruf/);
  });

  it('ein Nachfolger braucht ein geplantes Ende und ist nie die Stelle selbst', () => {
    expect(() => defineJob({ ...base, nachfolger: 'anlagenmechaniker-shk' })).toThrow(/eigener Nachfolger/);
    expect(() =>
      defineJob({ ...base, status: 'archived', validThrough: undefined, nachfolger: 'ausbildung-anlagenmechaniker-shk-2027' }),
    ).toThrow(/geplantes Ende/);
  });
});
