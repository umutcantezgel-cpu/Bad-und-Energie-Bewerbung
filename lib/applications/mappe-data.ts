import { MAPPE_DESIGN, MAPPE_SCHEMA_LIMITS as LIMITS } from './constants';
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
    // Betreff (L5) nach den übrigen Feldern geprüft, wie im Schema: gleicher erster Fehlerpfad
    const subject = optionalText(mappe.subject, LIMITS.subject, ['subject']);
    return { ok: true, mappe: { ...inhalt, ...(subject !== undefined ? { subject } : {}) } };
  } catch (error) {
    if (error instanceof MappeIssue) return { ok: false, path: error.path };
    throw error;
  }
}
