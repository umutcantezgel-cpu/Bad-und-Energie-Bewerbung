import { z } from 'zod';
import {
  INITIATIVE_JOB_ID,
  applicationJobIdSchema,
  mappeSchema,
  type ApplicationJobId,
  type Mappe,
} from '@/lib/applications/schema';
import { MAPPE_LIMITS, WORK_STYLE_IDS, getWorkStyle, workStyleIdFromValue, type WorkStyleId } from './options';
import {
  createStationId,
  isCareerStationEmpty,
  isEducationStationEmpty,
  listReducer,
  splitTasks,
  type CareerStationDraft,
  type EducationStationDraft,
  type ListAction,
} from './stations';
import { buildCoverLetter, buildSubject, type LetterJob } from './template';
import type { MappeJobOption, MappeRecipient } from './types';

/** Persönliche Angaben: nur für Vorschau und Druck, nie Teil der gesendeten Mappe. */
export interface MappePerson {
  name: string;
  phone: string;
  email: string;
  location: string;
}

export interface MappeEditorState {
  person: MappePerson;
  jobId: ApplicationJobId | '';
  skills: string[];
  workStyleId: WorkStyleId | null;
  /** `null`: Das Anschreiben folgt der Vorlage. Text: vom Bewerber bearbeitet. */
  customLetter: string | null;
  careerStations: CareerStationDraft[];
  educationStations: EducationStationDraft[];
}

export type MappeEditorAction =
  | { type: 'person'; patch: Partial<MappePerson> }
  | { type: 'job'; jobId: ApplicationJobId | '' }
  | { type: 'toggleSkill'; skill: string }
  | { type: 'addSkill'; skill: string }
  | { type: 'workStyle'; id: WorkStyleId }
  | { type: 'letter'; text: string }
  | { type: 'resetLetter' }
  | { type: 'career'; action: ListAction<CareerStationDraft> }
  | { type: 'education'; action: ListAction<EducationStationDraft> }
  | { type: 'hydrate'; state: MappeEditorState };

export const EMPTY_PERSON: MappePerson = Object.freeze({ name: '', phone: '', email: '', location: '' });

export function createEmptyEditorState(jobId: ApplicationJobId | '' = ''): MappeEditorState {
  return {
    person: { ...EMPTY_PERSON },
    jobId,
    skills: [],
    workStyleId: null,
    customLetter: null,
    careerStations: [],
    educationStations: [],
  };
}

function sameSkill(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase('de') === b.trim().toLocaleLowerCase('de');
}

export function canAddSkill(skills: readonly string[], skill: string): boolean {
  const value = skill.trim();
  return (
    value.length > 0 &&
    value.length <= MAPPE_LIMITS.skill &&
    skills.length < MAPPE_LIMITS.skills &&
    !skills.some((existing) => sameSkill(existing, value))
  );
}

export function mappeEditorReducer(state: MappeEditorState, action: MappeEditorAction): MappeEditorState {
  switch (action.type) {
    case 'person':
      return { ...state, person: { ...state.person, ...action.patch } };
    case 'job':
      return { ...state, jobId: action.jobId };
    case 'toggleSkill': {
      const selected = state.skills.some((skill) => sameSkill(skill, action.skill));
      if (selected) return { ...state, skills: state.skills.filter((skill) => !sameSkill(skill, action.skill)) };
      return canAddSkill(state.skills, action.skill) ? { ...state, skills: [...state.skills, action.skill.trim()] } : state;
    }
    case 'addSkill':
      return canAddSkill(state.skills, action.skill) ? { ...state, skills: [...state.skills, action.skill.trim()] } : state;
    case 'workStyle':
      return { ...state, workStyleId: action.id };
    case 'letter':
      return { ...state, customLetter: action.text };
    case 'resetLetter':
      return { ...state, customLetter: null };
    case 'career':
      return { ...state, careerStations: listReducer(state.careerStations, action.action) };
    case 'education':
      return { ...state, educationStations: listReducer(state.educationStations, action.action) };
    case 'hydrate':
      return action.state;
  }
}

export interface MappeContext {
  jobs: readonly MappeJobOption[];
  recipient: MappeRecipient;
}

export function isInitiative(state: Pick<MappeEditorState, 'jobId'>): boolean {
  return state.jobId === INITIATIVE_JOB_ID;
}

export function selectedJob(state: Pick<MappeEditorState, 'jobId'>, jobs: readonly MappeJobOption[]): MappeJobOption | undefined {
  return jobs.find((job) => job.id === state.jobId);
}

function letterJob(state: MappeEditorState, jobs: readonly MappeJobOption[]): LetterJob | null {
  const job = selectedJob(state, jobs);
  return job ? { title: job.title, category: job.category } : null;
}

/** Text aus der Vorlage für den aktuellen Stand. */
export function templateLetter(state: MappeEditorState, context: MappeContext): string {
  return buildCoverLetter({
    job: letterJob(state, context.jobs),
    initiative: isInitiative(state),
    skills: state.skills,
    workStyle: getWorkStyle(state.workStyleId)?.value,
    fullName: state.person.name,
    recipient: context.recipient,
  });
}

/** Das Anschreiben, wie es in Vorschau, Druck und Mappe steht. */
export function resolveCoverLetter(state: MappeEditorState, context: MappeContext): string {
  return state.customLetter ?? templateLetter(state, context);
}

export function letterSubject(state: MappeEditorState, jobs: readonly MappeJobOption[]): string {
  return buildSubject(letterJob(state, jobs), isInitiative(state));
}

/** Nichts eingetragen, was über die reine Vorlage hinausgeht. */
export function isMappeEmpty(state: MappeEditorState): boolean {
  return (
    state.skills.length === 0 &&
    state.workStyleId === null &&
    !state.customLetter?.trim() &&
    state.careerStations.every(isCareerStationEmpty) &&
    state.educationStations.every(isEducationStationEmpty)
  );
}

const optionalText = (value: string): string | undefined => value.trim() || undefined;

/** Editor-Stand → Mappe laut Vertrag (ohne persönliche Angaben und ohne Foto). */
export function toMappe(state: MappeEditorState, context: MappeContext): Mappe {
  return {
    coverLetter: resolveCoverLetter(state, context).trim(),
    skills: state.skills.map((skill) => skill.trim()).filter(Boolean),
    workStyle: getWorkStyle(state.workStyleId)?.value,
    careerStations: state.careerStations
      .filter((station) => !isCareerStationEmpty(station))
      .map((station) => ({
        period: station.period.trim(),
        role: station.role.trim(),
        company: station.company.trim(),
        location: optionalText(station.location),
        tasks: splitTasks(station.tasks, MAPPE_LIMITS.tasksPerStation),
      })),
    educationStations: state.educationStations
      .filter((station) => !isEducationStationEmpty(station))
      .map((station) => ({
        period: station.period.trim(),
        degree: station.degree.trim(),
        institution: station.institution.trim(),
        location: optionalText(station.location),
      })),
  };
}

export type SerializeResult = { ok: true; mappe: Mappe } | { ok: false; message: string };

/** Mappe bauen und gegen mappeSchema prüfen, bevor sie gespeichert oder gesendet wird. */
export function serializeMappe(state: MappeEditorState, context: MappeContext): SerializeResult {
  const parsed = mappeSchema.safeParse(toMappe(state, context));
  if (parsed.success) return { ok: true, mappe: parsed.data };
  const issue = parsed.error.issues[0];
  return { ok: false, message: describeIssue(issue?.path ?? []) };
}

const SECTION_LABELS: Record<string, string> = {
  coverLetter: 'Das Anschreiben',
  skills: 'Die Schwerpunkte',
  workStyle: 'Der Arbeitsstil',
  careerStations: 'Eine Station in der Berufserfahrung',
  educationStations: 'Eine Station in Schule und Ausbildung',
};

function describeIssue(path: readonly PropertyKey[]): string {
  const section = typeof path[0] === 'string' ? SECTION_LABELS[path[0]] : undefined;
  return `${section ?? 'Ein Eintrag'} ist zu lang oder enthält zu viele Einträge. Bitte kürze ihn.`;
}

/** Gespeicherte Mappe (z. B. aus dem Flow zurück) → Editor-Stand. */
export function fromMappe(mappe: Mappe, jobId: ApplicationJobId | '' = ''): MappeEditorState {
  return {
    ...createEmptyEditorState(jobId),
    skills: mappe.skills.slice(0, MAPPE_LIMITS.skills),
    workStyleId: workStyleIdFromValue(mappe.workStyle),
    customLetter: mappe.coverLetter.trim() ? mappe.coverLetter : null,
    careerStations: mappe.careerStations.map((station) => ({
      id: createStationId(),
      period: station.period,
      role: station.role,
      company: station.company,
      location: station.location ?? '',
      tasks: station.tasks.join('\n'),
    })),
    educationStations: mappe.educationStations.map((station) => ({
      id: createStationId(),
      period: station.period,
      degree: station.degree,
      institution: station.institution,
      location: station.location ?? '',
    })),
  };
}

/* Wiederherstellung aus sessionStorage: tolerant, ungültige Teile fallen auf leer zurück. */

const text = (max: number) => z.string().max(max).catch('');
const stationId = z.string().min(1).max(64);
/** Bis zu 8 Aufgaben à 200 Zeichen plus Zeilenumbrüche; der Rest wird beim Senden abgeschnitten. */
const TASKS_TEXT_MAX = MAPPE_LIMITS.tasksPerStation * (MAPPE_LIMITS.task + 1) * 2;

export const editorStateSchema = z.object({
  person: z
    .object({
      name: text(MAPPE_LIMITS.name),
      phone: text(MAPPE_LIMITS.phone),
      email: text(MAPPE_LIMITS.email),
      location: text(MAPPE_LIMITS.location),
    })
    .catch({ ...EMPTY_PERSON }),
  jobId: z.union([applicationJobIdSchema, z.literal('')]).catch(''),
  skills: z.array(z.string().min(1).max(MAPPE_LIMITS.skill)).max(MAPPE_LIMITS.skills).catch([]),
  workStyleId: z.enum(WORK_STYLE_IDS).nullable().catch(null),
  customLetter: z.string().max(MAPPE_LIMITS.coverLetter).nullable().catch(null),
  careerStations: z
    .array(
      z.object({
        id: stationId,
        period: text(MAPPE_LIMITS.period),
        role: text(MAPPE_LIMITS.role),
        company: text(MAPPE_LIMITS.company),
        location: text(MAPPE_LIMITS.location),
        tasks: text(TASKS_TEXT_MAX),
      }),
    )
    .max(MAPPE_LIMITS.careerStations)
    .catch([]),
  educationStations: z
    .array(
      z.object({
        id: stationId,
        period: text(MAPPE_LIMITS.period),
        degree: text(MAPPE_LIMITS.degree),
        institution: text(MAPPE_LIMITS.institution),
        location: text(MAPPE_LIMITS.location),
      }),
    )
    .max(MAPPE_LIMITS.educationStations)
    .catch([]),
}) satisfies z.ZodType<MappeEditorState>;

export { TASKS_TEXT_MAX };
