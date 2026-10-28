import { MAPPE_DESIGN, MAPPE_SCHEMA_LIMITS as LIMITS, MAPPE_SECTION_IDS, type MappeSectionId } from './constants';
import type { Mappe } from './schema';

/**
 * Prüfung einer Bewerbungsmappe ohne zod, für Browser-Code (Flow, Mappe-Werkzeug).
 * Gleiche Regeln und gleiche Ausgabe wie `mappeSchema` in ./schema (Texte getrimmt, fehlende
 * Listen leer, unbekannte Felder fallen weg); ein Test hält beide deckungsgleich.
 */

export type MappeIssuePath = (string | number)[];
export type MappeParseResult = { ok: true; mappe: Mappe } | { ok: false; path: MappeIssuePath };

class MappeIssue {
  constructor(readonly path: MappeIssuePath) {}
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number, path: MappeIssuePath): string {
  if (typeof value !== 'string') throw new MappeIssue(path);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new MappeIssue(path);
  return trimmed;
}

function optionalText(value: unknown, max: number, path: MappeIssuePath): string | undefined {
  return value === undefined ? undefined : text(value, max, path);
}

function list<T>(value: unknown, max: number, path: MappeIssuePath, item: (entry: unknown, path: MappeIssuePath) => T): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) throw new MappeIssue(path);
  return value.map((entry, index) => item(entry, [...path, index]));
}

function record(value: unknown, path: MappeIssuePath): Record<string, unknown> {
  if (!isRecord(value)) throw new MappeIssue(path);
  return value;
}

function careerStation(value: unknown, path: MappeIssuePath): Mappe['careerStations'][number] {
  const station = record(value, path);
  const location = optionalText(station.location, LIMITS.location, [...path, 'location']);
  return {
    period: text(station.period, LIMITS.period, [...path, 'period']),
    role: text(station.role, LIMITS.role, [...path, 'role']),
    company: text(station.company, LIMITS.company, [...path, 'company']),
    ...(location !== undefined ? { location } : {}),
    tasks: list(station.tasks, LIMITS.tasks, [...path, 'tasks'], (task, taskPath) => text(task, LIMITS.task, taskPath)),
  };
}

function educationStation(value: unknown, path: MappeIssuePath): Mappe['educationStations'][number] {
  const station = record(value, path);
  const location = optionalText(station.location, LIMITS.location, [...path, 'location']);
  return {
    period: text(station.period, LIMITS.period, [...path, 'period']),
    degree: text(station.degree, LIMITS.degree, [...path, 'degree']),
    institution: text(station.institution, LIMITS.institution, [...path, 'institution']),
    ...(location !== undefined ? { location } : {}),
  };
}

const einer = <T extends string>(liste: readonly T[], wert: unknown): wert is T => (liste as readonly unknown[]).includes(wert);

/** Gestaltung wie `mappeDesignSchema`: nur vollständig bekannte Werte, sonst fällt sie weg (kein Fehler). */
function design(value: unknown): Mappe['design'] {
  if (!isRecord(value)) return undefined;
  const { vorlage, akzent, schrift } = value;
  return einer(MAPPE_DESIGN.vorlagen, vorlage) && einer(MAPPE_DESIGN.akzente, akzent) && einer(MAPPE_DESIGN.schriften, schrift)
    ? { vorlage, akzent, schrift }
    : undefined;
}

/**
 * Ein Abschnitt im Aufbau des Lebenslaufs (L5): bekannte ID, eigener Titel nur, wenn gesetzt. `type` statt `interface`:
 * Nur so bleibt die Nutzlast dem Json-Typ von supabase-js zuweisbar (lib/supabase/payload.ts).
 */
export type MappeSection = { id: MappeSectionId; title?: string };

const eigen = (wert: Record<string, unknown>, schluessel: string): unknown =>
  Object.prototype.hasOwnProperty.call(wert, schluessel) ? wert[schluessel] : undefined;

/**
 * `mappe.sections` (L5): bekannte IDs in gesendeter Reihenfolge, jede einmal; Titel einzeilig, getrimmt, höchstens
 * `sectionTitle` Zeichen, sonst ohne Titel. Kein Array, zu viele Einträge oder nichts Gültiges: undefined (Standardaufbau).
 * Wirft nie (wie das Design kein Ablehnungsgrund); Schema und Browser rufen dieselbe Funktion.
 */
export function mappeAufbauAus(value: unknown): MappeSection[] | undefined {
  if (!Array.isArray(value) || value.length > LIMITS.sectionsRaw) return undefined;
  const gesehen = new Set<MappeSectionId>();
  const aufbau: MappeSection[] = [];
  for (const eintrag of value) {
    if (!isRecord(eintrag)) continue;
    const id = eigen(eintrag, 'id');
    if (!einer(MAPPE_SECTION_IDS, id) || gesehen.has(id)) continue;
    gesehen.add(id);
    const roh = eigen(eintrag, 'title');
    const title = typeof roh === 'string' ? roh.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim() : '';
    aufbau.push(title && title.length <= LIMITS.sectionTitle ? { id, title } : { id });
  }
  return aufbau.length > 0 ? aufbau : undefined;
}

/** Inhalt in Kurzprofil, Sprachen, Führerschein, Interessen oder eigenem Abschnitt (L5): Auch das allein ist eine Mappe. */
export function hatZusatzinhalt(mappe: Pick<Mappe, 'profile' | 'languages' | 'drivingLicenses' | 'interests' | 'customText'>): boolean {
  return Boolean(
    mappe.profile?.trim() ||
      mappe.languages?.some((eintrag) => eintrag.language.trim()) ||
      mappe.drivingLicenses?.some((klasse) => klasse.trim()) ||
      mappe.interests?.trim() ||
      mappe.customText?.trim(),
  );
}

function language(value: unknown, path: MappeIssuePath): NonNullable<Mappe['languages']>[number] {
  const eintrag = record(value, path);
  const sprache = text(eintrag.language, LIMITS.language, [...path, 'language']);
  const level = optionalText(eintrag.level, LIMITS.languageLevel, [...path, 'level']);
  return { language: sprache, ...(level !== undefined ? { level } : {}) };
}

/** Optionale Liste (L5): fehlt sie, fehlt der Schlüssel (kein Default, sonst änderte sich der Hash alter Mappen). */
function optionalList<T>(value: unknown, max: number, path: MappeIssuePath, item: (entry: unknown, path: MappeIssuePath) => T): T[] | undefined {
  return value === undefined ? undefined : list(value, max, path, item);
}

/** Mappe prüfen und normalisieren; bei Fehlern der Pfad des ersten Problems. */
export function parseMappeData(value: unknown): MappeParseResult {
  try {
    const mappe = record(value, []);
    const workStyle = optionalText(mappe.workStyle, LIMITS.workStyle, ['workStyle']);
    const gestaltung = design(mappe.design);
    const inhalt: Mappe = {
      coverLetter: mappe.coverLetter === undefined ? '' : text(mappe.coverLetter, LIMITS.coverLetter, ['coverLetter']),
      skills: list(mappe.skills, LIMITS.skills, ['skills'], (skill, path) => text(skill, LIMITS.skill, path)),
      ...(workStyle !== undefined ? { workStyle } : {}),
      careerStations: list(mappe.careerStations, LIMITS.careerStations, ['careerStations'], careerStation),
      educationStations: list(mappe.educationStations, LIMITS.educationStations, ['educationStations'], educationStation),
      ...(gestaltung ? { design: gestaltung } : {}),
    };
    // L5 nach den übrigen Feldern geprüft, in der Reihenfolge des Schemas: gleicher erster Fehlerpfad
    const subject = optionalText(mappe.subject, LIMITS.subject, ['subject']);
    const profile = optionalText(mappe.profile, LIMITS.profile, ['profile']);
    const languages = optionalList(mappe.languages, LIMITS.languages, ['languages'], language);
    const drivingLicenses = optionalList(mappe.drivingLicenses, LIMITS.drivingLicenses, ['drivingLicenses'], (klasse, path) =>
      text(klasse, LIMITS.drivingLicense, path),
    );
    const interests = optionalText(mappe.interests, LIMITS.interests, ['interests']);
    const customText = optionalText(mappe.customText, LIMITS.customText, ['customText']);
    const sections = mappe.sections === undefined ? undefined : mappeAufbauAus(mappe.sections);
    return {
      ok: true,
      mappe: {
        ...inhalt,
        ...(subject !== undefined ? { subject } : {}),
        ...(profile !== undefined ? { profile } : {}),
        ...(languages !== undefined ? { languages } : {}),
        ...(drivingLicenses !== undefined ? { drivingLicenses } : {}),
        ...(interests !== undefined ? { interests } : {}),
        ...(customText !== undefined ? { customText } : {}),
        ...(sections !== undefined ? { sections } : {}),
      },
    };
  } catch (error) {
    if (error instanceof MappeIssue) return { ok: false, path: error.path };
    throw error;
  }
}
