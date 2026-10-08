/**
 * Stationen im Lebenslauf (Berufserfahrung, Schule und Ausbildung). Die Liste beginnt
 * leer: Es gibt keine Vorgabe- oder Beispielstationen (ROADMAP §6).
 */

export interface CareerStationDraft {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  /** Eine Aufgabe pro Zeile. */
  tasks: string;
}

export interface EducationStationDraft {
  id: string;
  period: string;
  degree: string;
  institution: string;
  location: string;
}

export type StationKind = 'career' | 'education';

export type ListAction<T extends { id: string }> =
  /** `index` fügt an dieser Stelle ein (z. B. „Rückgängig“ nach dem Entfernen), sonst am Ende. */
  | { type: 'add'; item: T; max: number; index?: number }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'update'; id: string; patch: Partial<Omit<T, 'id'>> };

/** Reiner Reducer für Hinzufügen, Entfernen, Verschieben und Ändern; unbekannte IDs ändern nichts. */
export function listReducer<T extends { id: string }>(list: readonly T[], action: ListAction<T>): T[] {
  switch (action.type) {
    case 'add': {
      if (list.length >= action.max || list.some((item) => item.id === action.item.id)) return [...list];
      const index = action.index === undefined ? list.length : Math.min(Math.max(action.index, 0), list.length);
      return [...list.slice(0, index), action.item, ...list.slice(index)];
    }
    case 'remove':
      return list.filter((item) => item.id !== action.id);
    case 'move': {
      const from = list.findIndex((item) => item.id === action.id);
      const to = from + action.direction;
      if (from === -1 || to < 0 || to >= list.length) return [...list];
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    }
    case 'update':
      return list.map((item) => (item.id === action.id ? { ...item, ...action.patch } : item));
  }
}

let counter = 0;

/** Lokale ID für React-Keys und Fokus; wird nicht gesendet. */
export function createStationId(): string {
  counter += 1;
  return `s${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyCareerStation(id: string = createStationId()): CareerStationDraft {
  return { id, period: '', role: '', company: '', location: '', tasks: '' };
}

export function emptyEducationStation(id: string = createStationId()): EducationStationDraft {
  return { id, period: '', degree: '', institution: '', location: '' };
}

/** Aufgaben-Text → Liste: eine Aufgabe pro Zeile, Spiegelstriche entfernt, leere Zeilen weg. */
export function splitTasks(text: string, max: number = Number.POSITIVE_INFINITY): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-–•*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, max);
}

export function isCareerStationEmpty(station: Omit<CareerStationDraft, 'id'>): boolean {
  return [station.period, station.role, station.company, station.location, station.tasks].every((v) => !v.trim());
}

export function isEducationStationEmpty(station: Omit<EducationStationDraft, 'id'>): boolean {
  return [station.period, station.degree, station.institution, station.location].every((v) => !v.trim());
}
