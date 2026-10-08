import { INITIATIVE_JOB_ID, isApplicationJobId, type ApplicationJobId } from '@/lib/applications/constants';
import { parseMappeData } from '@/lib/applications/mappe-data';
import type { Mappe } from '@/lib/applications/schema';
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

/** Mappe bauen und mit den Regeln von mappeSchema prüfen (ohne zod), bevor sie gespeichert oder gesendet wird. */
export function serializeMappe(state: MappeEditorState, context: MappeContext): SerializeResult {
  const parsed = parseMappeData(toMappe(state, context));
  if (parsed.ok) return { ok: true, mappe: parsed.mappe };
  return { ok: false, message: describeIssue(parsed.path) };
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

/* Wiederherstellung aus sessionStorage: tolerant, ungültige Teile fallen auf leer zurück (ohne zod). */

/** Bis zu 8 Aufgaben à 200 Zeichen plus Zeilenumbrüche; der Rest wird beim Senden abgeschnitten. */
export const TASKS_TEXT_MAX = MAPPE_LIMITS.tasksPerStation * (MAPPE_LIMITS.task + 1) * 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Text bis `max` Zeichen, sonst leer. */
function text(value: unknown, max: number): string {
  return typeof value === 'string' && value.length <= max ? value : '';
}

function isStationId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 64;
}

/** Liste bis `max` Einträge, in der jeder Eintrag gültig ist; sonst leer (wie zuvor `.catch([])`). */
function strictList<T>(value: unknown, max: number, item: (entry: unknown) => T | null): T[] {
  if (!Array.isArray(value) || value.length > max) return [];
  const items: T[] = [];
  for (const entry of value) {
    const parsed = item(entry);
    if (parsed === null) return [];
    items.push(parsed);
  }
  return items;
}

function careerDraft(value: unknown): CareerStationDraft | null {
  if (!isRecord(value) || !isStationId(value.id)) return null;
  return {
    id: value.id,
    period: text(value.period, MAPPE_LIMITS.period),
    role: text(value.role, MAPPE_LIMITS.role),
    company: text(value.company, MAPPE_LIMITS.company),
    location: text(value.location, MAPPE_LIMITS.location),
    tasks: text(value.tasks, TASKS_TEXT_MAX),
  };
}

function educationDraft(value: unknown): EducationStationDraft | null {
  if (!isRecord(value) || !isStationId(value.id)) return null;
  return {
    id: value.id,
    period: text(value.period, MAPPE_LIMITS.period),
    degree: text(value.degree, MAPPE_LIMITS.degree),
    institution: text(value.institution, MAPPE_LIMITS.institution),
    location: text(value.location, MAPPE_LIMITS.location),
  };
}

/** Gespeicherter Editor-Stand → gültiger Stand; einzelne ungültige Teile werden leer, statt alles zu verwerfen. */
export function parseEditorState(value: unknown): MappeEditorState | null {
  if (!isRecord(value)) return null;
  const person = isRecord(value.person)
    ? {
        name: text(value.person.name, MAPPE_LIMITS.name),
        phone: text(value.person.phone, MAPPE_LIMITS.phone),
        email: text(value.person.email, MAPPE_LIMITS.email),
        location: text(value.person.location, MAPPE_LIMITS.location),
      }
    : { ...EMPTY_PERSON };
  const workStyleId = (WORK_STYLE_IDS as readonly unknown[]).includes(value.workStyleId) ? (value.workStyleId as WorkStyleId) : null;
  const customLetter =
    typeof value.customLetter === 'string' && value.customLetter.length <= MAPPE_LIMITS.coverLetter ? value.customLetter : null;

  return {
    person,
    jobId: isApplicationJobId(value.jobId) ? value.jobId : '',
    skills: strictList(value.skills, MAPPE_LIMITS.skills, (skill) =>
      typeof skill === 'string' && skill.length >= 1 && skill.length <= MAPPE_LIMITS.skill ? skill : null,
    ),
    workStyleId,
    customLetter,
    careerStations: strictList(value.careerStations, MAPPE_LIMITS.careerStations, careerDraft),
    educationStations: strictList(value.educationStations, MAPPE_LIMITS.educationStations, educationDraft),
  };
}
