import type { ApplicationAnswers, ApplicationJobId } from '@/lib/applications/schema';
import { getQuestion, getQuestions, isAnswerKey, isValidAnswer, sanitizeAnswers, type AnswerKey, type QuestionSetId } from './questions';

/**
 * Schrittfolge des Bewerbungsflows als reine Zustandsmaschine (ROADMAP §6):
 * Stelle → Fragen des Sets → Kontakt. Die Komponente spiegelt den Schritt in `?schritt=`,
 * der Reducer entscheidet, welcher Schritt erreichbar ist.
 */

export const JOB_STEP = 'stelle' as const;
export const CONTACT_STEP = 'kontakt' as const;

export type StepId = typeof JOB_STEP | AnswerKey | typeof CONTACT_STEP;

export interface FlowState {
  jobId: ApplicationJobId | null;
  questionSet: QuestionSetId;
  answers: ApplicationAnswers;
  /** False, solange die Stelle vorgewählt ist (Prop oder `?stelle=`); „ändern“ blendet den Schritt ein. */
  showJobStep: boolean;
  step: StepId;
  /** Die Person hat etwas gewählt oder getippt: erst dann wird ein Entwurf gespeichert. */
  dirty: boolean;
}

export interface FlowInit {
  jobId?: ApplicationJobId | null;
  questionSet?: QuestionSetId;
}

export type FlowAction =
  | { type: 'selectJob'; jobId: ApplicationJobId; questionSet: QuestionSetId }
  | { type: 'answer'; key: AnswerKey; value: string }
  | { type: 'goTo'; step: StepId | null | undefined }
  | { type: 'editJob' }
  | { type: 'touch' }
  | {
      type: 'restore';
      jobId?: ApplicationJobId | null;
      questionSet?: QuestionSetId;
      answers?: ApplicationAnswers;
      /** Gewünschter Schritt, z. B. aus `?schritt=`; fehlt er, gilt der erste offene. */
      step?: StepId | null;
    };

const DEFAULT_SET: QuestionSetId = 'fachkraft';

export function initFlowState({ jobId = null, questionSet = DEFAULT_SET }: FlowInit = {}): FlowState {
  const base: FlowState = {
    jobId,
    questionSet: jobId ? questionSet : DEFAULT_SET,
    answers: {},
    showJobStep: !jobId,
    step: JOB_STEP,
    dirty: false,
  };
  return { ...base, step: firstOpenStep(base) };
}

type StepContext = Pick<FlowState, 'jobId' | 'questionSet' | 'answers' | 'showJobStep'>;

/** Alle Schritte in Reihenfolge. Ohne gewählte Stelle zählt das Fachkräfte-Set (für „Schritt n von m“). */
export function getSteps(ctx: StepContext): StepId[] {
  const steps: StepId[] = [];
  if (ctx.showJobStep || !ctx.jobId) steps.push(JOB_STEP);
  for (const question of getQuestions(ctx.questionSet)) steps.push(question.key);
  steps.push(CONTACT_STEP);
  return steps;
}

/** Erster Schritt, der noch eine Antwort braucht; sonst der Kontaktschritt. */
export function firstOpenStep(ctx: StepContext): StepId {
  if (!ctx.jobId) return JOB_STEP;
  for (const question of getQuestions(ctx.questionSet)) {
    if (!isValidAnswer(question.key, ctx.answers[question.key])) return question.key;
  }
  return CONTACT_STEP;
}

/**
 * Erreichbarer Schritt für einen Wunsch (Deep Link, Zurück/Vor im Browser):
 * unbekannt oder hinter dem ersten offenen Schritt → erster offener Schritt.
 */
export function resolveStep(ctx: StepContext, requested: StepId | null | undefined): StepId {
  const open = firstOpenStep(ctx);
  if (!requested) return open;
  if (requested === JOB_STEP) return JOB_STEP;
  const steps = getSteps(ctx);
  const index = steps.indexOf(requested);
  if (index === -1) return open;
  return index > steps.indexOf(open) ? open : requested;
}

export function stepIndex(ctx: StepContext, step: StepId): number {
  return getSteps({ ...ctx, showJobStep: ctx.showJobStep || step === JOB_STEP }).indexOf(step);
}

/** Nächster Schritt in Reihenfolge (nach einer Antwort oder „Weiter“). */
export function nextStepOf(ctx: StepContext, step: StepId): StepId {
  const steps = getSteps({ ...ctx, showJobStep: ctx.showJobStep || step === JOB_STEP });
  const index = steps.indexOf(step);
  const next = index === -1 ? firstOpenStep(ctx) : (steps[index + 1] ?? CONTACT_STEP);
  return resolveStep(ctx, next);
}

/** Vorheriger Schritt oder null auf dem ersten. */
export function previousStepOf(ctx: StepContext, step: StepId): StepId | null {
  const steps = getSteps(ctx);
  const index = steps.indexOf(step);
  return index > 0 ? steps[index - 1] : null;
}

/** `?schritt=`-Wert eines Schritts. */
export function stepSlug(step: StepId): string {
  if (step === JOB_STEP || step === CONTACT_STEP) return step;
  return getQuestion(step)?.slug ?? step;
}

/** Schritt zu einem `?schritt=`-Wert, sonst null. */
export function stepFromSlug(slug: string | null | undefined): StepId | null {
  if (!slug) return null;
  const value = slug.trim().toLowerCase();
  if (value === JOB_STEP || value === CONTACT_STEP) return value;
  for (const key of ['qualification', 'start', 'schoolStatus', 'background', 'licenseB'] as const) {
    if (getQuestion(key)?.slug === value) return key;
  }
  return null;
}

export function isStepAnswered(state: FlowState, step: StepId): boolean {
  if (step === JOB_STEP) return state.jobId !== null;
  if (step === CONTACT_STEP) return false;
  return isValidAnswer(step, state.answers[step]);
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'selectJob': {
      const answers = sanitizeAnswers(action.questionSet, state.answers);
      return { ...state, jobId: action.jobId, questionSet: action.questionSet, answers, dirty: true };
    }
    case 'answer': {
      if (!isAnswerKey(action.key) || !isValidAnswer(action.key, action.value)) return state;
      if (!getQuestions(state.questionSet).some((question) => question.key === action.key)) return state;
      return { ...state, answers: { ...state.answers, [action.key]: action.value }, dirty: true };
    }
    case 'goTo': {
      const step = resolveStep(state, action.step);
      if (step === JOB_STEP && !state.showJobStep) return { ...state, showJobStep: true, step };
      return step === state.step ? state : { ...state, step };
    }
    case 'editJob':
      return { ...state, showJobStep: true, step: JOB_STEP };
    case 'touch':
      return state.dirty ? state : { ...state, dirty: true };
    case 'restore': {
      const jobId = action.jobId === undefined ? state.jobId : action.jobId;
      const questionSet = jobId ? (action.questionSet ?? state.questionSet) : DEFAULT_SET;
      const answers = sanitizeAnswers(questionSet, { ...state.answers, ...action.answers });
      const next: FlowState = { ...state, jobId, questionSet, answers, showJobStep: state.showJobStep || !jobId };
      const step = resolveStep(next, action.step);
      return { ...next, step, showJobStep: next.showJobStep || step === JOB_STEP };
    }
    default:
      return state;
  }
}
