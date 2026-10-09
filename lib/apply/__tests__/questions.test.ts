import { describe, expect, it } from 'vitest';
import { applicationAnswersSchema, INITIATIVE_JOB_ID } from '@/lib/applications/schema';
import { getFunnelOptions } from '@/lib/jobs/registry';
import {
  answerLabel,
  describeAnswers,
  getQuestion,
  getQuestions,
  QUESTION_SETS,
  questionSetFor,
  sanitizeAnswers,
} from '../questions';

const ids = (set: keyof typeof QUESTION_SETS) => getQuestions(set).map((q) => q.key);
const optionIds = (key: Parameters<typeof getQuestion>[0]) => getQuestion(key)?.options.map((o) => o.id);

describe('question sets', () => {
  it('fachkraft: qualification, then start', () => {
    expect(ids('fachkraft')).toEqual(['qualification', 'start']);
    expect(getQuestion('qualification')?.title).toBe('Was trifft auf dich zu?');
    expect(optionIds('qualification')).toEqual([
      'geselle-unter-2',
      'geselle-2-5',
      'geselle-ueber-5',
      'meister-techniker',
      'andere-ausbildung',
    ]);
    expect(getQuestion('start')?.title).toBe('Ab wann könntest du anfangen?');
    expect(optionIds('start')).toEqual(['sofort', '1-3-monate', 'spaeter']);
  });

  it('ausbildung: only the school status, no start step', () => {
    expect(ids('ausbildung')).toEqual(['schoolStatus']);
    expect(getQuestion('schoolStatus')?.title).toBe('Wo stehst du gerade?');
    expect(optionIds('schoolStatus')).toEqual(['schule-laeuft', 'schule-fertig', 'etwas-anderes']);
  });

  it('quereinstieg: background, licence B, then start', () => {
    expect(ids('quereinstieg')).toEqual(['background', 'licenseB', 'start']);
    expect(optionIds('background')).toEqual(['handwerk', 'andere-branche', 'etwas-anderes']);
    // Unterscheidbare Texte: nicht zweimal „andere Branche“.
    expect(getQuestion('background')?.options.map((option) => option.label)).toEqual([
      'Im Handwerk (anderes Gewerk)',
      'In einer anderen Branche',
      'Gerade etwas anderes',
    ]);
    expect(getQuestion('licenseB')?.title).toBe('Hast du einen Führerschein Klasse B?');
    expect(optionIds('licenseB')).toEqual(['yes', 'no']);
  });

  it('every question has a unique URL slug and unique option ids', () => {
    const all = Object.values(QUESTION_SETS).flat();
    const slugs = new Set(all.map((q) => q.slug));
    expect(slugs.size).toBe(new Set(all.map((q) => q.key)).size);
    for (const q of all) expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
    expect([...slugs]).not.toContain('stelle');
    expect([...slugs]).not.toContain('kontakt');
  });

  it('every option fits the shared answers contract', () => {
    for (const q of Object.values(QUESTION_SETS).flat()) {
      for (const option of q.options) {
        expect(applicationAnswersSchema.safeParse({ [q.key]: option.id }).success).toBe(true);
      }
    }
  });

  it('every job in the funnel uses a known set; the initiative application uses fachkraft', () => {
    const options = getFunnelOptions();
    for (const option of options) expect(Object.keys(QUESTION_SETS)).toContain(option.questionSet);
    expect(questionSetFor(INITIATIVE_JOB_ID, options)).toBe('fachkraft');
    expect(questionSetFor('ausbildung-anlagenmechaniker-shk', options)).toBe('ausbildung');
    expect(questionSetFor('quereinsteiger-montagehelfer', options)).toBe('quereinstieg');
    expect(questionSetFor(null, options)).toBe('fachkraft');
  });
});

describe('answers', () => {
  it('labels answers and ignores unknown values', () => {
    expect(answerLabel('start', 'sofort')).toBe('Sofort');
    expect(answerLabel('start', 'gestern')).toBeUndefined();
    expect(answerLabel('start', undefined)).toBeUndefined();
  });

  it('keeps only answers of the set with valid option ids', () => {
    expect(
      sanitizeAnswers('ausbildung', { qualification: 'geselle-2-5', schoolStatus: 'schule-fertig', start: 'sofort' }),
    ).toEqual({ schoolStatus: 'schule-fertig' });
    expect(sanitizeAnswers('fachkraft', { qualification: 'erfunden', start: 'sofort', extra: 'x' })).toEqual({ start: 'sofort' });
    expect(sanitizeAnswers('fachkraft', null)).toEqual({});
  });

  it('describes answers in set order', () => {
    expect(describeAnswers('quereinstieg', { start: 'spaeter', licenseB: 'yes', background: 'handwerk' })).toEqual([
      { key: 'background', label: 'Aktuell', value: 'Im Handwerk (anderes Gewerk)' },
      { key: 'licenseB', label: 'Führerschein Klasse B', value: 'Ja' },
      { key: 'start', label: 'Start', value: 'Später / weiß ich noch nicht' },
    ]);
  });
});
