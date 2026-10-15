import { describe, expect, it } from 'vitest';

import { jobIdFromParam, paramForJob } from '@/lib/apply/params';
import { FACTS, type FactId } from '@/lib/content/facts';
import { getFunnelOptions, getJobById } from '@/lib/jobs/registry';
import { getMappeJobOptions, getMappeRecipient } from '../context';
import {
  BUERO_SKILL_BRIEF,
  BUERO_SKILL_OPTIONS,
  BUERO_WORK_STYLES,
  SKILL_OPTIONS,
  WORK_STYLES,
  getWorkStyle,
  skillOptionen,
  workStyleIdFromValue,
  workStylesFuer,
} from '../options';
import { buildCoverLetter, buildSubject, roleForText, type LetterJob } from '../template';

const recipient = getMappeRecipient();
const jobs = getMappeJobOptions();
const letterJobs: (LetterJob | null)[] = [null, ...jobs.map(({ title, category }) => ({ title, category }))];

describe('getMappeRecipient', () => {
  it('addresses Herr Demir as on the existing site', () => {
    expect(recipient.salutation).toBe('Sehr geehrter Herr Demir,');
    expect(recipient.attention).toBe('Herrn Sabri Demir');
    expect(recipient.city).toBe('Wetzlar');
  });
});

describe('getMappeJobOptions', () => {
  it('offers the flow options and hands every one (also funnel_only and initiativ) over via ?stelle=', () => {
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(jobs.some((job) => job.id === 'quereinsteiger-montagehelfer')).toBe(true);
    // So liest /bewerbung den Parameter (app/bewerbung/page.tsx).
    const flowOptions = getFunnelOptions().map((option) => ({ id: option.id, slug: option.slug }));
    for (const job of jobs) {
      const param = paramForJob(job.id, jobs);
      expect(param).toBe(job.slug);
      expect(jobIdFromParam(param ?? undefined, flowOptions)).toBe(job.id);
    }
    expect(paramForJob('initiativ', jobs)).toBe('initiativ');
    expect(jobIdFromParam('initiativ', flowOptions)).toBe('initiativ');
  });
});

describe('buildCoverLetter', () => {
  it('never renders undefined, null or a placeholder name in any combination', () => {
    for (const job of letterJobs) {
      for (const initiative of [false, true]) {
        for (const skills of [[], [SKILL_OPTIONS[0]], [...SKILL_OPTIONS]]) {
          for (const workStyle of [undefined, '', ...WORK_STYLES.map((s) => s.value)]) {
            for (const fullName of [undefined, '', '  ', 'Max Muster']) {
              const letter = buildCoverLetter({ job, initiative, skills, workStyle, fullName, recipient });
              expect(letter).not.toMatch(/undefined|null|NaN|\[object/);
              expect(letter).not.toMatch(/Alexander Koch/);
              expect(letter).not.toMatch(/\n{3,}/);
              expect(letter).not.toMatch(/\.\./);
              expect(letter.startsWith('Sehr geehrter Herr Demir,')).toBe(true);
            }
          }
        }
      }
    }
  });

  it('uses the selected role without the gender suffix in running text', () => {
    const job = jobs.find((j) => j.id === 'kundendiensttechniker-shk')!;
    const letter = buildCoverLetter({ job, skills: [], recipient });
    expect(letter).toContain(`bewerbe ich mich als Kundendiensttechniker SHK / Servicemonteur bei der ${recipient.companyName} in Wetzlar.`);
    // „(m/w/d)“ fällt an jeder Stelle des Titels weg, auch mitten darin (Büro, Prüfung E-031 D1-2)
    for (const option of jobs) {
      const brief = buildCoverLetter({ job: option, skills: [], recipient });
      expect(brief, option.id).not.toContain('(m/w/d)');
      expect(brief, option.id).not.toMatch(/ {2}| \./);
    }
    expect(roleForText('Bürofachkraft (m/w/d) in Voll- oder Teilzeit')).toBe('Bürofachkraft in Voll- oder Teilzeit');
    expect(roleForText('Anlagenmechaniker SHK (m/w/d)')).toBe('Anlagenmechaniker SHK');
  });

  it('phrases the apprenticeship and the initiative application correctly', () => {
    const azubi = jobs.find((j) => j.category === 'ausbildung')!;
    expect(buildCoverLetter({ job: azubi, skills: [], recipient })).toContain(
      'bewerbe ich mich um die Ausbildung zum Anlagenmechaniker SHK bei der',
    );
    expect(buildCoverLetter({ job: azubi, skills: [], recipient })).toContain('Für meine Ausbildung');
    expect(buildCoverLetter({ job: null, initiative: true, skills: [], recipient })).toContain(
      'bewerbe ich mich initiativ bei der',
    );
    // Schülerpraktikum (Prüfung E-031, D1-3): „um ein Schülerpraktikum“, keine Rolle
    const praktikum = jobs.find((j) => j.category === 'praktikum')!;
    expect(buildCoverLetter({ job: praktikum, skills: [], recipient })).toContain(
      'bewerbe ich mich um ein Schülerpraktikum Anlagenmechaniker SHK bei der',
    );
    expect(buildSubject(praktikum)).toBe(`Bewerbung um ein ${praktikum.title}`);
  });

  it('includes the chosen skills and work style, and omits empty lines', () => {
    const style = WORK_STYLES[1];
    const letter = buildCoverLetter({
      job: null,
      skills: [SKILL_OPTIONS[1], ' ', SKILL_OPTIONS[5]],
      workStyle: style.value,
      recipient,
    });
    expect(letter).toContain(`Mein handwerklicher Arbeitsstil: ${style.value}`);
    expect(letter).toContain(`Meine praktischen Fachschwerpunkte: ${SKILL_OPTIONS[1]}, ${SKILL_OPTIONS[5]}.`);

    const bare = buildCoverLetter({ job: null, skills: [], recipient });
    expect(bare).not.toContain('Arbeitsstil');
    expect(bare).not.toContain('Fachschwerpunkte');
  });

  it('signs with the applicant name only when one is given', () => {
    expect(buildCoverLetter({ job: null, skills: [], fullName: ' Max Muster ', recipient })).toMatch(
      /Mit freundlichen Grüßen\nMax Muster$/,
    );
    expect(buildCoverLetter({ job: null, skills: [], recipient })).toMatch(/Mit freundlichen Grüßen$/);
  });
});

describe('buildSubject', () => {
  it('keeps the full title for the subject line', () => {
    const job = jobs.find((j) => j.id === 'anlagenmechaniker-shk')!;
    expect(buildSubject(job)).toBe(`Bewerbung als ${job.title}`);
    expect(buildSubject(jobs.find((j) => j.category === 'ausbildung')!)).toMatch(/^Bewerbung um die Ausbildung/);
    expect(buildSubject(null, true)).toBe('Initiativbewerbung');
    expect(buildSubject(null)).toBe('Bewerbung');
  });
});

describe('Büro (E-031, Wahrheitsfehler S5): Stärken aus den Aufgaben, Anschreiben ohne Baustelle', () => {
  const buero = jobs.find((job) => job.category === 'buero')!;
  const OFFEN_ODER_FREMD = /Handwerk|Baustelle|Montage|Hilti|Werkzeug|Equipment|flexib|Arbeitszeit|Urlaub|Tarif|unbefristet|Rohr|Trasse|Inbetriebnahme|Wärmepumpe/i;

  it('Schwerpunkte im Büro sind die vier Aufgaben der Bürofachkraft im Wortlaut der Anzeige', () => {
    expect([...BUERO_SKILL_OPTIONS]).toEqual([...getJobById('buerofachkraft')!.tasks]);
    expect(skillOptionen('buero')).toBe(BUERO_SKILL_OPTIONS);
    for (const category of ['anlagenmechaniker', 'ausbildung', 'helfer', undefined, null] as const) expect(skillOptionen(category)).toBe(SKILL_OPTIONS);
  });

  it('Arbeitsstile im Büro: dieselben Plätze, Wortlaut ohne Baustelle; gespeicherte Sätze finden zurück', () => {
    expect(BUERO_WORK_STYLES.map((s) => s.id)).toEqual(WORK_STYLES.map((s) => s.id));
    expect(workStylesFuer('buero')).toBe(BUERO_WORK_STYLES);
    expect(workStylesFuer('kundendienst')).toBe(WORK_STYLES);
    for (const style of BUERO_WORK_STYLES) {
      expect(`${style.title} ${style.description} ${style.value}`, style.id).not.toMatch(OFFEN_ODER_FREMD);
      expect(getWorkStyle(style.id, 'buero')).toBe(style);
      expect(workStyleIdFromValue(style.value)).toBe(style.id);
    }
    expect(getWorkStyle('team')).toBe(WORK_STYLES[2]);
  });

  it('das Anschreiben fürs Büro nennt weder Handwerk noch Baustelle noch flexible Arbeitszeiten', () => {
    for (const workStyle of [undefined, ...BUERO_WORK_STYLES.map((s) => s.value)]) {
      for (const skills of [[], [BUERO_SKILL_OPTIONS[0]], [...BUERO_SKILL_OPTIONS]]) {
        const letter = buildCoverLetter({ job: buero, skills, workStyle, fullName: 'Max Muster', recipient });
        expect(letter).not.toMatch(OFFEN_ODER_FREMD);
        expect(letter).toContain('bewerbe ich mich als Bürofachkraft in Voll- oder Teilzeit bei der');
        expect(letter).toContain('Meisterbetrieb mit direkter Kommunikation');
        if (skills.length > 0) expect(letter).toContain('Meine Schwerpunkte im Büro:');
        if (workStyle) expect(letter).toContain(`Mein Arbeitsstil: ${workStyle}`);
      }
    }
    // Die Baustelle behält ihren Wortlaut
    const am = jobs.find((job) => job.id === 'anlagenmechaniker-shk')!;
    expect(buildCoverLetter({ job: am, skills: [SKILL_OPTIONS[0]], workStyle: WORK_STYLES[0].value, recipient })).toContain('Als Handwerker aus der Region');
  });
});

/**
 * Offene Fakten (K-012, offenFuer in lib/content/facts.ts): Das Anschreiben behauptet keinen Fakt für eine Stellenart,
 * für die er offen ist – für jede Kategorie jedes Fakts mit offenFuer, mit allen Arbeitsstilen dieser Stellenart
 * (Prüfung E-031, D1-3: das Schülerpraktikum stand im Handwerker-Wortlaut mit flexiblen Arbeitszeiten).
 */
describe('Anschreiben und offene Fakten', () => {
  const WORTLAUT: Partial<Record<FactId, RegExp>> = {
    flexibleHours: /flexib|Arbeitszeit/i,
    vacation30: /Urlaub|30 Tage/i,
    aboveTariff: /Tarif/i,
    permanentContract: /unbefristet|Befristung/i,
  };
  const offen = (Object.keys(FACTS) as FactId[]).filter((id) => FACTS[id].offenFuer);

  it('jeder Fakt mit offenFuer hat ein Suchmuster', () => {
    expect(offen.length).toBeGreaterThan(0);
    for (const id of offen) expect(WORTLAUT[id], id).toBeInstanceOf(RegExp);
  });

  it('kein offener Fakt im Anschreiben einer Stelle seiner offenen Kategorien', () => {
    let geprueft = 0;
    for (const id of offen) {
      for (const kategorie of FACTS[id].offenFuer!.kategorien) {
        for (const job of jobs.filter((j) => j.category === kategorie)) {
          for (const workStyle of [undefined, ...workStylesFuer(job.category).map((s) => s.value)]) {
            const letter = buildCoverLetter({ job, skills: [], workStyle, recipient });
            expect(letter, `${id} · ${job.id}`).not.toMatch(WORTLAUT[id]!);
            geprueft += 1;
          }
        }
      }
    }
    expect(geprueft).toBeGreaterThan(0);
  });

  it('das Schülerpraktikum ohne Handwerker, Equipment und Hilti', () => {
    const praktikum = jobs.find((j) => j.category === 'praktikum')!;
    const letter = buildCoverLetter({ job: praktikum, skills: [], workStyle: WORK_STYLES[0].value, recipient });
    expect(letter).not.toMatch(/Handwerker aus|Equipment|Hilti/);
    expect(letter).toContain('Für mein Praktikum wünsche ich mir einen verlässlichen Meisterbetrieb');
  });
});

describe('Büro-Schwerpunkte im Brief (Prüfung E-031, D1-4)', () => {
  const buero = jobs.find((job) => job.category === 'buero')!;

  it('je Aufgabe eine Kurzform, mit Semikolon getrennt, ein Doppelpunkt, „allgemeine“ mitten im Satz klein', () => {
    expect(Object.keys(BUERO_SKILL_BRIEF)).toEqual([...BUERO_SKILL_OPTIONS]);
    const letter = buildCoverLetter({ job: buero, skills: [...BUERO_SKILL_OPTIONS], recipient });
    const zeile = letter.split('\n').find((z) => z.startsWith('Meine Schwerpunkte im Büro: '))!;
    expect(zeile).toBe(
      'Meine Schwerpunkte im Büro: Telefon und Terminplanung für Monteure und Kundendienst; Angebote, ' +
        'Auftragsbestätigungen und Rechnungen; Materialbestellung beim Großhandel und Prüfung der Lieferungen; ' +
        'allgemeine Verwaltung (Ablage, Post, Zuarbeit für die Geschäftsführung).',
    );
    expect(zeile.split(':')).toHaveLength(2);
    // „allgemeine“ als Beiwort klein (Substantive wie „Angebote“ bleiben groß)
    expect(zeile).not.toContain('Allgemeine');
    // Eigene Einträge bleiben, wie sie getippt wurden
    expect(buildCoverLetter({ job: buero, skills: ['DATEV'], recipient })).toContain('Meine Schwerpunkte im Büro: DATEV.');
  });
});
