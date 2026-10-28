import {
  INITIATIVE_JOB_ID,
  MAPPE_SCHEMA_LIMITS,
  MAPPE_SECTION_IDS,
  isApplicationJobId,
  type ApplicationJobId,
  type MappeSectionId,
} from '@/lib/applications/constants';
import { parseMappeData, type MappeSection } from '@/lib/applications/mappe-data';
import type { Mappe } from '@/lib/applications/schema';
import type { JobCategory } from '@/lib/jobs/schema';
import { ABSCHNITT_NAME, GRUNDABSCHNITTE, STANDARD_TITEL, aufbauFolge } from './blatt/aufbau';
import { STANDARD_DESIGN, STANDARD_FOTOFORM, designAus, fotoformAus, istStandard, type Fotoform, type MappeDesign } from './blatt/design';
import { lebenslaufAbschnitte, type MappeAbschnitt } from './blatt/dokument';
import { abschnittTexte, mitInhaltFuerSchrift, type ZeichenOrt } from './blatt/zeichen';
import {
  FUEHRERSCHEIN_KLASSEN,
  MAPPE_LIMITS,
  WORK_STYLE_IDS,
  getWorkStyle,
  skillsFuerStelle,
  workStyleIdFromValue,
  type FuehrerscheinKlasse,
  type WorkStyleId,
} from './options';
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

/** Sprache im Editor (L5); `id` nur für React-Keys und Fokus, wird nicht gesendet. */
export interface SpracheDraft {
  id: string;
  sprache: string;
  niveau: string;
}

/**
 * Platz eines Abschnitts im Lebenslauf (L5): Reihenfolge der Liste, gezeigt oder ausgeblendet, eigener Titel (`null`:
 * Standardtitel). Ausgeblendetes bleibt nur hier im Editor und geht nicht mit (toMappe).
 */
export interface AufbauEintrag {
  id: MappeSectionId;
  sichtbar: boolean;
  titel: string | null;
}

export interface MappeEditorState {
  person: MappePerson;
  jobId: ApplicationJobId | '';
  skills: string[];
  workStyleId: WorkStyleId | null;
  /** `null`: Das Anschreiben folgt der Vorlage. Text: vom Bewerber bearbeitet. */
  customLetter: string | null;
  /** `null`: Der Betreff folgt dem Vorschlag der Stelle (letterSubject). Text: von der Person geändert (L5). */
  customSubject: string | null;
  careerStations: CareerStationDraft[];
  educationStations: EducationStationDraft[];
  /** Design, Farbe und Schrift (L3); reisen mit der Mappe, wenn sie vom Standard abweichen. */
  design: MappeDesign;
  /** Form des Fotos; bleibt im Browser wie das Foto. */
  fotoform: Fotoform;
  /** Aufbau des Lebenslaufs (L5): immer alle Abschnitte, in der Reihenfolge der Person. */
  aufbau: AufbauEintrag[];
  /** Mehr im Lebenslauf (L5): Kurzprofil, Sprachen, Führerschein, Interessen, Text des eigenen Abschnitts. */
  profil: string;
  sprachen: SpracheDraft[];
  fuehrerschein: FuehrerscheinKlasse[];
  interessen: string;
  /** Text des eigenen Abschnitts; seine Überschrift steht im Aufbau (id `custom`). */
  eigenerText: string;
}

export type MappeEditorAction =
  | { type: 'person'; patch: Partial<MappePerson> }
  /** `category`: Stellenart der neuen Wahl (ohne Stelle bzw. initiativ: null); räumt fremde Vorgaben aus `skills`. */
  | { type: 'job'; jobId: ApplicationJobId | ''; category?: JobCategory | null }
  | { type: 'toggleSkill'; skill: string }
  | { type: 'addSkill'; skill: string }
  | { type: 'workStyle'; id: WorkStyleId }
  | { type: 'letter'; text: string }
  | { type: 'resetLetter' }
  | { type: 'subject'; text: string }
  | { type: 'resetSubject' }
  | { type: 'career'; action: ListAction<CareerStationDraft> }
  | { type: 'education'; action: ListAction<EducationStationDraft> }
  | { type: 'design'; patch: Partial<MappeDesign> }
  | { type: 'fotoform'; form: Fotoform }
  | { type: 'zusatz'; feld: 'profil' | 'interessen' | 'eigenerText'; text: string }
  | { type: 'sprachen'; action: ListAction<SpracheDraft> }
  | { type: 'fuehrerschein'; klasse: FuehrerscheinKlasse }
  /** Eigener Titel eines Abschnitts; `null`: Standardtitel. */
  | { type: 'abschnittTitel'; id: MappeSectionId; titel: string | null }
  | { type: 'abschnittSichtbar'; id: MappeSectionId; sichtbar: boolean }
  /** Einen Platz nach oben (-1) oder unten (1); am Rand ändert sich nichts. */
  | { type: 'abschnittVerschieben'; id: MappeSectionId; richtung: -1 | 1 }
  | { type: 'hydrate'; state: MappeEditorState };

export const EMPTY_PERSON: MappePerson = Object.freeze({ name: '', phone: '', email: '', location: '' });

/** Standardaufbau: alle Abschnitte gezeigt, in Standardreihenfolge, ohne eigene Titel. */
export function standardAufbau(): AufbauEintrag[] {
  return MAPPE_SECTION_IDS.map((id) => ({ id, sichtbar: true, titel: null }));
}

export function createEmptyEditorState(jobId: ApplicationJobId | '' = ''): MappeEditorState {
  return {
    person: { ...EMPTY_PERSON },
    jobId,
    skills: [],
    workStyleId: null,
    customLetter: null,
    customSubject: null,
    careerStations: [],
    educationStations: [],
    design: { ...STANDARD_DESIGN },
    fotoform: STANDARD_FOTOFORM,
    aufbau: standardAufbau(),
    profil: '',
    sprachen: [],
    fuehrerschein: [],
    interessen: '',
    eigenerText: '',
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

/**
 * Stelle setzen und dabei fremde Vorgabe-Schwerpunkte räumen (Prüfrunde 1 D1-7): beim Wechsel im Editor (Aktion `job`)
 * und beim Wiederherstellen mit ?stelle= oder der gesendeten Bewerbung (Prüfrunde 2 D2-2; sonst stünden
 * Baustellen-Kenntnisse aus einem Entwurf ohne Stelle im Büro-Brief). Eigene Einträge bleiben.
 */
export function mitStelle(state: MappeEditorState, jobId: MappeEditorState['jobId'], category: JobCategory | null | undefined): MappeEditorState {
  const skills = skillsFuerStelle(state.skills, category);
  return { ...state, jobId, skills: skills.length === state.skills.length ? state.skills : skills };
}

export function mappeEditorReducer(state: MappeEditorState, action: MappeEditorAction): MappeEditorState {
  switch (action.type) {
    case 'person':
      return { ...state, person: { ...state.person, ...action.patch } };
    case 'job':
      return mitStelle(state, action.jobId, action.category);
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
    case 'subject':
      return { ...state, customSubject: action.text };
    case 'resetSubject':
      return { ...state, customSubject: null };
    case 'career':
      return { ...state, careerStations: listReducer(state.careerStations, action.action) };
    case 'education':
      return { ...state, educationStations: listReducer(state.educationStations, action.action) };
    case 'design':
      return { ...state, design: designAus({ ...state.design, ...action.patch }) };
    case 'fotoform':
      return { ...state, fotoform: fotoformAus(action.form) };
    case 'zusatz':
      if (action.feld === 'profil') return { ...state, profil: action.text };
      if (action.feld === 'interessen') return { ...state, interessen: action.text };
      return { ...state, eigenerText: action.text };
    case 'sprachen':
      return { ...state, sprachen: listReducer(state.sprachen, action.action) };
    case 'fuehrerschein': {
      const an = state.fuehrerschein.includes(action.klasse);
      const gewaehlt = an ? state.fuehrerschein.filter((klasse) => klasse !== action.klasse) : [...state.fuehrerschein, action.klasse];
      // In der Reihenfolge der Chips, wie sie auch gesendet wird
      return { ...state, fuehrerschein: FUEHRERSCHEIN_KLASSEN.filter((klasse) => gewaehlt.includes(klasse)) };
    }
    case 'abschnittTitel':
      return { ...state, aufbau: state.aufbau.map((eintrag) => (eintrag.id === action.id ? { ...eintrag, titel: action.titel } : eintrag)) };
    case 'abschnittSichtbar':
      return {
        ...state,
        aufbau: state.aufbau.map((eintrag) => (eintrag.id === action.id ? { ...eintrag, sichtbar: action.sichtbar } : eintrag)),
      };
    case 'abschnittVerschieben': {
      const von = state.aufbau.findIndex((eintrag) => eintrag.id === action.id);
      const nach = von + action.richtung;
      if (von === -1 || nach < 0 || nach >= state.aufbau.length) return state;
      const aufbau = [...state.aufbau];
      [aufbau[von], aufbau[nach]] = [aufbau[nach], aufbau[von]];
      return { ...state, aufbau };
    }
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

/** Ist der Abschnitt im Lebenslauf gezeigt (L5)? Ohne Eintrag im Aufbau: ja. */
export function zeigt(state: Pick<MappeEditorState, 'aufbau'>, id: MappeSectionId): boolean {
  return state.aufbau.find((eintrag) => eintrag.id === id)?.sichtbar ?? true;
}

const einzeilig = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Überschrift eines Abschnitts: eigener Titel (einzeilig, getrimmt), sonst der Standardtitel. */
export function abschnittTitel(state: Pick<MappeEditorState, 'aufbau'>, id: MappeSectionId): string {
  return einzeilig(state.aufbau.find((eintrag) => eintrag.id === id)?.titel ?? '') || STANDARD_TITEL[id];
}

/**
 * `sections` der Mappe: die gezeigten Abschnitte in Reihenfolge, `title` nur bei eigenem Titel. Ohne Abweichung vom
 * Standardaufbau fehlt es ganz (dieselbe Mappe wie vor L5).
 */
function sectionsAus(state: MappeEditorState): MappeSection[] | undefined {
  const sections = state.aufbau
    .filter((eintrag) => eintrag.sichtbar)
    .map(({ id, titel }): MappeSection => {
      const eigen = einzeilig(titel ?? '');
      return eigen && eigen !== STANDARD_TITEL[id] && eigen.length <= MAPPE_LIMITS.sectionTitle ? { id, title: eigen } : { id };
    });
  const standard = sections.length === MAPPE_SECTION_IDS.length && sections.every((eintrag, i) => eintrag.id === MAPPE_SECTION_IDS[i] && !eintrag.title);
  return standard ? undefined : sections;
}

/** Text aus der Vorlage für den aktuellen Stand; ausgeblendete Schwerpunkte nennt er nicht (sie gehen nicht mit, L5). */
export function templateLetter(state: MappeEditorState, context: MappeContext): string {
  return buildCoverLetter({
    job: letterJob(state, context.jobs),
    initiative: isInitiative(state),
    skills: zeigt(state, 'skills') ? state.skills : [],
    workStyle: getWorkStyle(state.workStyleId, selectedJob(state, context.jobs)?.category)?.value,
    fullName: state.person.name,
    recipient: context.recipient,
  });
}

/** Das Anschreiben, wie es in Vorschau, Druck und Mappe steht. */
export function resolveCoverLetter(state: MappeEditorState, context: MappeContext): string {
  return state.customLetter ?? templateLetter(state, context);
}

/** Vorschlag für den Betreff aus der gewählten Stelle (buildSubject); ohne Stelle „Bewerbung“. */
export function letterSubject(state: MappeEditorState, jobs: readonly MappeJobOption[]): string {
  return buildSubject(letterJob(state, jobs), isInitiative(state));
}

/**
 * Der Betreff, wie er in Vorschau, Druck und PDF steht: der eigene, sonst der Vorschlag (L5). Ein eigener nur aus Emojis
 * zählt nicht (im PDF bliebe die Zeile leer).
 */
export function resolveSubject(state: MappeEditorState, jobs: readonly MappeJobOption[]): string {
  return mitInhaltFuerSchrift(state.customSubject) ?? letterSubject(state, jobs);
}

/**
 * Betreff, der mit der Mappe geht: der eigene oder der Vorschlag einer gewählten Stelle (auch „Initiativbewerbung“).
 * Ohne beides keiner: Dann rechnet der Server ihn wie vor L5 aus der Stelle der Bewerbung (statt „Bewerbung“ zu senden).
 */
export function sentSubject(state: MappeEditorState, jobs: readonly MappeJobOption[]): string | undefined {
  const eigener = mitInhaltFuerSchrift(state.customSubject);
  if (eigener) return eigener;
  return selectedJob(state, jobs) || isInitiative(state) ? letterSubject(state, jobs) : undefined;
}

/**
 * Nach dem Wiederherstellen (MappeTool): Ein „eigener“ Betreff, der wörtlich dem Vorschlag gleicht, folgt wieder der
 * Stelle. Die Übergabe an den Flow trägt den Vorschlag als `subject`; fromMappe machte ihn sonst zu einem eigenen Text.
 */
export function betreffAlsVorschlag(state: MappeEditorState, jobs: readonly MappeJobOption[]): MappeEditorState {
  return state.customSubject !== null && state.customSubject.trim() === letterSubject(state, jobs) ? { ...state, customSubject: null } : state;
}

/** Hat der Abschnitt Inhalt, unabhängig davon, ob er gezeigt wird (Aufbau: „Noch leer“)? */
export function abschnittHatInhalt(state: MappeEditorState, id: MappeSectionId): boolean {
  switch (id) {
    case 'career':
      return !state.careerStations.every(isCareerStationEmpty);
    case 'education':
      return !state.educationStations.every(isEducationStationEmpty);
    case 'skills':
      return state.skills.length > 0;
    case 'profile':
      return state.profil.trim().length > 0;
    case 'languages':
      return state.sprachen.some((eintrag) => eintrag.sprache.trim());
    case 'drivingLicenses':
      return state.fuehrerschein.length > 0;
    case 'interests':
      return state.interessen.trim().length > 0;
    case 'custom':
      return state.eigenerText.trim().length > 0;
  }
}

/** Nichts eingetragen, was über die reine Vorlage hinausgeht; ausgeblendete Abschnitte zählen nicht (sie gehen nicht mit). */
export function isMappeEmpty(state: MappeEditorState): boolean {
  return (
    state.workStyleId === null &&
    !state.customLetter?.trim() &&
    MAPPE_SECTION_IDS.every((id) => !zeigt(state, id) || !abschnittHatInhalt(state, id))
  );
}

const optionalText = (value: string): string | undefined => value.trim() || undefined;

/**
 * Editor-Stand → Mappe laut Vertrag (ohne persönliche Angaben, Foto und Fotoform; das Design nur, wenn gewählt; der
 * Betreff nur mit Stelle oder eigenem Text, sentSubject). Ausgeblendete Abschnitte gehen nicht mit (L5): Ihr Inhalt
 * fehlt, und sie fehlen in `sections`. Neue Felder nur mit Inhalt, `sections` nur bei eigenem Aufbau.
 */
export function toMappe(state: MappeEditorState, context: MappeContext): Mappe {
  const subject = sentSubject(state, context.jobs);
  const z = (id: MappeSectionId) => zeigt(state, id);
  const sprachen = state.sprachen
    .map((eintrag) => ({ language: eintrag.sprache.trim(), level: eintrag.niveau.trim() }))
    .filter((eintrag) => eintrag.language)
    .map(({ language, level }) => (level ? { language, level } : { language }));
  const klassen = FUEHRERSCHEIN_KLASSEN.filter((klasse) => state.fuehrerschein.includes(klasse));
  const sections = sectionsAus(state);
  return {
    ...(istStandard(state.design) ? {} : { design: { ...state.design } }),
    coverLetter: resolveCoverLetter(state, context).trim(),
    skills: z('skills') ? state.skills.map((skill) => skill.trim()).filter(Boolean) : [],
    workStyle: getWorkStyle(state.workStyleId, selectedJob(state, context.jobs)?.category)?.value,
    careerStations: (z('career') ? state.careerStations : [])
      .filter((station) => !isCareerStationEmpty(station))
      .map((station) => ({
        period: station.period.trim(),
        role: station.role.trim(),
        company: station.company.trim(),
        location: optionalText(station.location),
        tasks: splitTasks(station.tasks, MAPPE_LIMITS.tasksPerStation),
      })),
    educationStations: (z('education') ? state.educationStations : [])
      .filter((station) => !isEducationStationEmpty(station))
      .map((station) => ({
        period: station.period.trim(),
        degree: station.degree.trim(),
        institution: station.institution.trim(),
        location: optionalText(station.location),
      })),
    ...(subject ? { subject } : {}),
    ...(z('profile') && state.profil.trim() ? { profile: state.profil.trim() } : {}),
    ...(z('languages') && sprachen.length > 0 ? { languages: sprachen } : {}),
    ...(z('drivingLicenses') && klassen.length > 0 ? { drivingLicenses: [...klassen] } : {}),
    ...(z('interests') && state.interessen.trim() ? { interests: state.interessen.trim() } : {}),
    ...(z('custom') && state.eigenerText.trim() ? { customText: state.eigenerText.trim() } : {}),
    ...(sections ? { sections } : {}),
  };
}

/** Ein Abschnitt in der Vorschau (L5): Titel wie im Lebenslauf; `abschnitt` null = leerer Grundabschnitt (Platzhalter). */
export interface VorschauAbschnitt {
  id: MappeSectionId;
  titel: string;
  abschnitt: MappeAbschnitt | null;
}

/**
 * Lebenslauf der Vorschau: die gezeigten Abschnitte in der Reihenfolge des Aufbaus, mit Inhalt aus derselben Mappe wie
 * PDF und Mail (lebenslaufAbschnitte). Leere Grundabschnitte (Berufserfahrung, Schule und Ausbildung, Schwerpunkte)
 * stehen als Platzhalter da, leere neue Abschnitte gar nicht.
 */
export function vorschauAbschnitte(state: MappeEditorState, context: MappeContext): VorschauAbschnitt[] {
  const inhalt = new Map(lebenslaufAbschnitte(toMappe(state, context)).map((abschnitt) => [abschnitt.id, abschnitt]));
  return state.aufbau
    .filter((eintrag) => eintrag.sichtbar)
    .map(({ id }) => ({ id, titel: abschnittTitel(state, id), abschnitt: inhalt.get(id) ?? null }))
    .filter((eintrag) => eintrag.abschnitt !== null || GRUNDABSCHNITTE.has(eintrag.id));
}

/** Ort für den Zeichen-Hinweis (L5); `nurDownload`: steht nur im PDF zum Herunterladen, nie im PDF fürs Team. */
export interface MappeZeichenOrt extends ZeichenOrt {
  nurDownload: boolean;
}

/**
 * Texte, die in den PDFs stehen, je Ort in der Reihenfolge des Editors (für zeichenFunde). Name, Telefon, E-Mail und
 * Wohnort (Kopf und Kontaktzeile) trägt nur das PDF zum Herunterladen: Das PDF fürs Team nimmt den Namen aus dem
 * Bewerbungsformular und hat keine Kontaktzeile. Betreff, Anschreiben und Lebenslauf stehen in beiden.
 */
export function zeichenOrte(state: MappeEditorState, context: MappeContext): MappeZeichenOrt[] {
  const mappe = toMappe(state, context);
  const { person } = state;
  const nurDownload = (ort: string, text: string): MappeZeichenOrt => ({ ort, text, nurDownload: true });
  const inBeiden = (ort: string, text: string): MappeZeichenOrt => ({ ort, text, nurDownload: false });
  // Lebenslauf je Abschnitt mit seiner Überschrift (auch eine eigene steht im PDF), benannt wie im Editor
  const abschnitte = new Map(lebenslaufAbschnitte(mappe).map((abschnitt) => [abschnitt.id, abschnitt]));
  const lebenslauf = (id: MappeSectionId) => {
    const abschnitt = abschnitte.get(id);
    return inBeiden(ABSCHNITT_NAME[id], abschnitt ? abschnittTexte(abschnitt).join('\n') : '');
  };
  return [
    nurDownload('Name', person.name),
    nurDownload('Telefon', person.phone),
    nurDownload('E-Mail', person.email),
    nurDownload('Wohnort', person.location),
    lebenslauf('skills'),
    inBeiden('Betreff', resolveSubject(state, context.jobs)),
    inBeiden('Anschreiben', mappe.coverLetter),
    lebenslauf('career'),
    lebenslauf('education'),
    lebenslauf('profile'),
    lebenslauf('languages'),
    lebenslauf('drivingLicenses'),
    lebenslauf('interests'),
    lebenslauf('custom'),
  ];
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
  skills: 'Die Liste der Schwerpunkte',
  workStyle: 'Der Arbeitsstil',
  careerStations: 'Eine Station in der Berufserfahrung',
  educationStations: 'Eine Station in Schule und Ausbildung',
  subject: 'Der Betreff',
  profile: 'Das Kurzprofil',
  languages: 'Die Liste der Sprachen',
  drivingLicenses: 'Die Angabe zum Führerschein',
  interests: 'Der Text zu deinen Interessen',
  customText: 'Der eigene Abschnitt',
};

export function describeIssue(path: readonly PropertyKey[]): string {
  const section = typeof path[0] === 'string' ? SECTION_LABELS[path[0]] : undefined;
  return `${section ?? 'Ein Eintrag'} ist zu lang oder hat zu viele Einträge. Bitte kürze die Angabe.`;
}

/** Gespeicherte Mappe (z. B. aus dem Flow zurück) → Editor-Stand. */
export function fromMappe(mappe: Mappe, jobId: ApplicationJobId | '' = ''): MappeEditorState {
  return {
    ...createEmptyEditorState(jobId),
    design: designAus(mappe.design),
    skills: mappe.skills.slice(0, MAPPE_LIMITS.skills),
    workStyleId: workStyleIdFromValue(mappe.workStyle),
    customLetter: mappe.coverLetter.trim() ? mappe.coverLetter : null,
    // Danach betreffAlsVorschlag (MappeTool): Ein Vorschlag aus der Übergabe folgt so wieder der Stelle
    customSubject: mappe.subject?.trim() ? mappe.subject : null,
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
    aufbau: aufbauAus(mappe.sections),
    profil: mappe.profile ?? '',
    sprachen: (mappe.languages ?? [])
      .slice(0, MAPPE_LIMITS.languages)
      .map((eintrag) => ({ id: createStationId(), sprache: eintrag.language, niveau: eintrag.level ?? '' })),
    fuehrerschein: FUEHRERSCHEIN_KLASSEN.filter((klasse) => mappe.drivingLicenses?.includes(klasse)),
    interessen: mappe.interests ?? '',
    eigenerText: mappe.customText ?? '',
  };
}

/** Aufbau aus `mappe.sections`: gelistete zuerst mit eigenem Titel, die übrigen in Standardreihenfolge; alle gezeigt. */
function aufbauAus(sections: readonly MappeSection[] | undefined): AufbauEintrag[] {
  const titel = new Map((sections ?? []).map((eintrag) => [eintrag.id, eintrag.title?.trim() || null]));
  return aufbauFolge(sections).map(({ id }) => ({ id, sichtbar: true, titel: titel.get(id) ?? null }));
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

function spracheDraft(value: unknown): SpracheDraft | null {
  if (!isRecord(value) || !isStationId(value.id)) return null;
  return { id: value.id, sprache: text(value.sprache, MAPPE_LIMITS.language), niveau: text(value.niveau, MAPPE_LIMITS.languageLevel) };
}

/**
 * Aufbau aus dem Entwurf: bekannte IDs je einmal, `sichtbar` nur bei false aus; Titel bis zur Grenze, sonst Standard.
 * Fehlende Abschnitte kommen in Standardreihenfolge hinten dazu (Entwürfe von vor L5: Standardaufbau).
 */
function aufbauEntwurf(value: unknown): AufbauEintrag[] {
  const aufbau: AufbauEintrag[] = [];
  if (Array.isArray(value)) {
    for (const eintrag of value.slice(0, MAPPE_SCHEMA_LIMITS.sectionsRaw)) {
      if (!isRecord(eintrag)) continue;
      const id = eintrag.id;
      if (!(MAPPE_SECTION_IDS as readonly unknown[]).includes(id) || aufbau.some((platz) => platz.id === id)) continue;
      const titel = typeof eintrag.titel === 'string' && eintrag.titel.length <= MAPPE_LIMITS.sectionTitle ? eintrag.titel : null;
      aufbau.push({ id: id as MappeSectionId, sichtbar: eintrag.sichtbar !== false, titel });
    }
  }
  for (const id of MAPPE_SECTION_IDS) if (!aufbau.some((platz) => platz.id === id)) aufbau.push({ id, sichtbar: true, titel: null });
  return aufbau;
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
  // Entwürfe von vor L5 haben keinen Betreff: Vorschlag
  const customSubject =
    typeof value.customSubject === 'string' && value.customSubject.length <= MAPPE_LIMITS.subject ? value.customSubject : null;

  return {
    person,
    jobId: isApplicationJobId(value.jobId) ? value.jobId : '',
    skills: strictList(value.skills, MAPPE_LIMITS.skills, (skill) =>
      typeof skill === 'string' && skill.length >= 1 && skill.length <= MAPPE_LIMITS.skill ? skill : null,
    ),
    workStyleId,
    customLetter,
    customSubject,
    careerStations: strictList(value.careerStations, MAPPE_LIMITS.careerStations, careerDraft),
    educationStations: strictList(value.educationStations, MAPPE_LIMITS.educationStations, educationDraft),
    // Entwürfe von vor L3 haben kein Design: Standard
    design: designAus(value.design),
    fotoform: fotoformAus(value.fotoform),
    // Entwürfe von vor L5 Teil B: Standardaufbau, neue Abschnitte leer
    aufbau: aufbauEntwurf(value.aufbau),
    profil: text(value.profil, MAPPE_LIMITS.profile),
    sprachen: strictList(value.sprachen, MAPPE_LIMITS.languages, spracheDraft),
    fuehrerschein: Array.isArray(value.fuehrerschein)
      ? FUEHRERSCHEIN_KLASSEN.filter((klasse) => (value.fuehrerschein as unknown[]).includes(klasse))
      : [],
    interessen: text(value.interessen, MAPPE_LIMITS.interests),
    eigenerText: text(value.eigenerText, MAPPE_LIMITS.customText),
  };
}
