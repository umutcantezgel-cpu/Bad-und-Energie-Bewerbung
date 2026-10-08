import { STORAGE_KEYS } from '@/lib/applications/constants';
import { parseMappeData } from '@/lib/applications/mappe-data';
import type { Mappe } from '@/lib/applications/schema';
import { getSessionStorage, type StorageLike } from '@/lib/apply/storage';
import { parseEditorState, type MappeEditorState } from './editor';

/**
 * Browser-Speicher der Mappe. Nur sessionStorage (TDDDG §25(2) Nr. 2), nie localStorage;
 * das Foto wird nie gespeichert. Jeder Zugriff ist in try/catch, weil Safari im privaten
 * Modus, blockierte Cookies oder volle Kontingente werfen können. Ohne zod geprüft.
 *
 * Die abgeschickte Bewerbung (STORAGE_KEYS.submitted) und das Löschen des alten
 * localStorage-Eintrags kommen aus lib/apply/storage.ts (eine Quelle für Flow und Mappe).
 */

/** Arbeitsstand des Editors inkl. persönlicher Angaben; bleibt in diesem Tab. */
export const MAPPE_DRAFT_KEY = 'be:mappe-editor:v1';
export const MAPPE_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export { getSessionStorage, type StorageLike };

function readJson(storage: StorageLike | null, key: string): unknown {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeJson(storage: StorageLike | null, key: string, value: unknown): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(storage: StorageLike | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Speicher nicht verfügbar: nichts zu löschen.
  }
}

function parseDraftEnvelope(raw: unknown, now: number): MappeEditorState | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const { v, savedAt, state } = raw as Record<string, unknown>;
  if (v !== 1 || typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null;
  if (now - savedAt > MAPPE_DRAFT_TTL_MS || savedAt > now + 60_000) return null;
  return parseEditorState(state);
}

/** Entwurf lesen; abgelaufene oder unlesbare Entwürfe werden gelöscht. */
export function readDraft(storage: StorageLike | null, now: number = Date.now()): MappeEditorState | null {
  const raw = readJson(storage, MAPPE_DRAFT_KEY);
  if (raw === undefined) return null;
  const state = parseDraftEnvelope(raw, now);
  if (!state) remove(storage, MAPPE_DRAFT_KEY);
  return state;
}

export function writeDraft(storage: StorageLike | null, state: MappeEditorState, now: number = Date.now()): boolean {
  return writeJson(storage, MAPPE_DRAFT_KEY, { v: 1, savedAt: now, state });
}

/** Mappe, die der Bewerbungsflow mitsendet (STORAGE_KEYS.mappe, Vertrag C7). */
export function readHandoverMappe(storage: StorageLike | null): Mappe | null {
  const raw = readJson(storage, STORAGE_KEYS.mappe);
  if (raw === undefined) return null;
  const parsed = parseMappeData(raw);
  return parsed.ok ? parsed.mappe : null;
}

export function hasHandoverMappe(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(STORAGE_KEYS.mappe) != null;
  } catch {
    return false;
  }
}

export function writeHandoverMappe(storage: StorageLike | null, mappe: Mappe): boolean {
  return writeJson(storage, STORAGE_KEYS.mappe, mappe);
}

export function removeHandoverMappe(storage: StorageLike | null): void {
  remove(storage, STORAGE_KEYS.mappe);
}
