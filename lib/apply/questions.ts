import type { ApplicationJobId } from '@/lib/applications/constants';
import type { ApplicationAnswers } from '@/lib/applications/schema';
import type { QuestionSet } from '@/lib/jobs/schema';

/**
 * Fragen des Bewerbungsflows (ROADMAP §6), je Fragenset der Stelle (`job.apply.questionSet`).
 * Die Options-IDs landen in `answers` und damit in E-Mail und ATS: nie umbenennen, nur ergänzen.
 * Rein und ohne Datenimporte, damit der Flow im Client-Bundle klein bleibt. Der Server prüft
 * Antworten mit denselben Optionen (lib/applications/schema.ts, normalizeApplication).
 */

export type QuestionSetId = QuestionSet;
export type AnswerKey = keyof ApplicationAnswers;

export const INITIATIVE_QUESTION_SET: QuestionSetId = 'fachkraft';

export interface QuestionOption {
  id: string;
  label: string;
}

export interface ApplyQuestion<K extends AnswerKey = AnswerKey> {
  /** Antwortfeld in `answers` und Schritt-ID im Flow. */
  key: K;
  /** Wert für `?schritt=` (deutsch, ohne Personendaten). */
  slug: string;
  /** Frage als Überschrift des Schritts. */
  title: string;
  /** Beschriftung in Zusammenfassung und WhatsApp-Text. */
  summaryLabel: string;
  /** Kurze Antworten stehen ab `sm` zweispaltig. */
  columns?: 1 | 2;
  options: readonly QuestionOption[];
}

const QUALIFICATION: ApplyQuestion<'qualification'> = {
  key: 'qualification',
  slug: 'erfahrung',
  title: 'Was trifft auf dich zu?',
  summaryLabel: 'Qualifikation',
  options: [
    // Berufserfahrung als Geselle, gleich gebaut (ROADMAP §6). Quereinstieg hat ein eigenes Fragenset.
    { id: 'geselle-unter-2', label: 'Geselle, unter 2 Jahren' },
    { id: 'geselle-2-5', label: 'Geselle, 2–5 Jahre' },
    { id: 'geselle-ueber-5', label: 'Geselle, über 5 Jahre' },
    { id: 'meister-techniker', label: 'Meister oder Techniker' },
    { id: 'andere-ausbildung', label: 'Andere Ausbildung' },
  ],
};

const START: ApplyQuestion<'start'> = {
  key: 'start',
  slug: 'start',
  title: 'Ab wann könntest du anfangen?',
  summaryLabel: 'Start',
  options: [
    { id: 'sofort', label: 'Sofort' },
    { id: '1-3-monate', label: 'In 1–3 Monaten (Kündigungsfrist)' },
    { id: 'spaeter', label: 'Später / weiß ich noch nicht' },
  ],
};

const SCHOOL_STATUS: ApplyQuestion<'schoolStatus'> = {
  key: 'schoolStatus',
  slug: 'schule',
  title: 'Wo stehst du gerade?',
  summaryLabel: 'Aktueller Stand',
  options: [
    { id: 'schule-laeuft', label: 'Ich gehe noch zur Schule' },
    { id: 'schule-fertig', label: 'Schule abgeschlossen' },
    { id: 'etwas-anderes', label: 'Ich mache gerade etwas anderes' },
  ],
};

const BACKGROUND: ApplyQuestion<'background'> = {
  key: 'background',
  slug: 'aktuell',
  title: 'Was machst du aktuell?',
  summaryLabel: 'Aktuell',
  options: [
    { id: 'handwerk', label: 'Im Handwerk (anderes Gewerk)' },
    { id: 'andere-branche', label: 'In einer anderen Branche' },
    // Ohne Job, Schule, Studium, Elternzeit …: neutral, ohne nachzufragen.
    { id: 'etwas-anderes', label: 'Gerade etwas anderes' },
  ],
};

const LICENSE_B: ApplyQuestion<'licenseB'> = {
  key: 'licenseB',
  slug: 'fuehrerschein',
  title: 'Hast du einen Führerschein Klasse B?',
  summaryLabel: 'Führerschein Klasse B',
  columns: 2,
  options: [
    { id: 'yes', label: 'Ja' },
    { id: 'no', label: 'Nein' },
  ],
};

export const QUESTION_SETS: Readonly<Record<QuestionSetId, readonly ApplyQuestion[]>> = Object.freeze({
  fachkraft: Object.freeze([QUALIFICATION, START]),
  ausbildung: Object.freeze([SCHOOL_STATUS]),
  quereinstieg: Object.freeze([BACKGROUND, LICENSE_B, START]),
});

const ALL_QUESTIONS: readonly ApplyQuestion[] = [QUALIFICATION, START, SCHOOL_STATUS, BACKGROUND, LICENSE_B];

export function getQuestions(set: QuestionSetId): readonly ApplyQuestion[] {
  return QUESTION_SETS[set] ?? QUESTION_SETS.fachkraft;
}

export function getQuestion(key: AnswerKey): ApplyQuestion | undefined {
  return ALL_QUESTIONS.find((question) => question.key === key);
}

export function isAnswerKey(value: unknown): value is AnswerKey {
  return typeof value === 'string' && ALL_QUESTIONS.some((question) => question.key === value);
}

/** Fragenset einer Auswahl im Flow; die Initiativbewerbung nutzt das Fachkräfte-Set. */
export function questionSetFor(
  jobId: ApplicationJobId | null | undefined,
  options: readonly { id: string; questionSet: QuestionSetId }[],
): QuestionSetId {
  if (!jobId) return INITIATIVE_QUESTION_SET;
  return options.find((option) => option.id === jobId)?.questionSet ?? INITIATIVE_QUESTION_SET;
}

export function isValidAnswer(key: AnswerKey, value: unknown): value is string {
  return typeof value === 'string' && Boolean(getQuestion(key)?.options.some((option) => option.id === value));
}

/** Text einer Antwort, z. B. ('start', 'sofort') → 'Sofort'. */
export function answerLabel(key: AnswerKey, value: string | undefined): string | undefined {
  if (!value) return undefined;
  return getQuestion(key)?.options.find((option) => option.id === value)?.label;
}

/** Behält nur Antworten, die zum Fragenset gehören und eine gültige Option sind (Stellenwechsel, Entwurf). */
export function sanitizeAnswers(set: QuestionSetId, answers: Partial<Record<string, unknown>> | null | undefined): ApplicationAnswers {
  const result: Record<string, string> = {};
  if (!answers) return result;
  for (const question of getQuestions(set)) {
    const value = answers[question.key];
    if (isValidAnswer(question.key, value)) result[question.key] = value;
  }
  return result as ApplicationAnswers;
}

export interface AnswerSummaryLine {
  key: AnswerKey;
  label: string;
  value: string;
}

/** Beantwortete Fragen in Set-Reihenfolge, für Zusammenfassung und WhatsApp-Text. */
export function describeAnswers(set: QuestionSetId, answers: ApplicationAnswers): AnswerSummaryLine[] {
  const lines: AnswerSummaryLine[] = [];
  for (const question of getQuestions(set)) {
    const value = answerLabel(question.key, answers[question.key]);
    if (value) lines.push({ key: question.key, label: question.summaryLabel, value });
  }
  return lines;
}
