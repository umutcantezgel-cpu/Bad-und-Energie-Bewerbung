import { describe, expect, it } from 'vitest';

import { getMappeJobOptions, getMappeRecipient } from '../context';
import { SKILL_OPTIONS, WORK_STYLES } from '../options';
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
  it('offers the flow options and marks only published jobs for ?stelle=', () => {
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(jobs.find((job) => job.id === 'quereinsteiger-montagehelfer')?.published).toBe(false);
    expect(jobs.find((job) => job.id === 'anlagenmechaniker-shk')?.published).toBe(true);
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
    expect(letter).toContain(`bewerbe ich mich als ${roleForText(job.title)} bei der ${recipient.companyName} in Wetzlar.`);
    expect(letter).not.toContain('(m/w/d)');
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
