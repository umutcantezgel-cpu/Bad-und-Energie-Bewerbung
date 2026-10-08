import { z } from 'zod';
import { STORAGE_KEYS, mappeSchema, type Mappe } from '@/lib/applications/schema';
import { editorStateSchema, type MappeEditorState } from './editor';

/**
 * Browser-Speicher der Mappe. Nur sessionStorage (TDDDG §25(2) Nr. 2), nie localStorage;
 * das Foto wird nie gespeichert. Jeder Zugriff ist in try/catch, weil Safari im privaten
 * Modus, blockierte Cookies oder volle Kontingente werfen können.
 */

/** Arbeitsstand des Editors inkl. persönlicher Angaben; bleibt in diesem Tab. */
export const MAPPE_DRAFT_KEY = 'be:mappe-editor:v1';
export const MAPPE_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getSessionStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getLocalStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

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

const draftEnvelopeSchema = z.object({
  v: z.literal(1),
  savedAt: z.number(),
  state: editorStateSchema,
});

/** Entwurf lesen; abgelaufene oder unlesbare Entwürfe werden gelöscht. */
export function readDraft(storage: StorageLike | null, now: number = Date.now()): MappeEditorState | null {
  const raw = readJson(storage, MAPPE_DRAFT_KEY);
  if (raw === undefined) return null;
  const parsed = draftEnvelopeSchema.safeParse(raw);
  if (!parsed.success || now - parsed.data.savedAt > MAPPE_DRAFT_TTL_MS || parsed.data.savedAt > now + 60_000) {
    remove(storage, MAPPE_DRAFT_KEY);
    return null;
  }
  return parsed.data.state;
}

export function writeDraft(storage: StorageLike | null, state: MappeEditorState, now: number = Date.now()): boolean {
  return writeJson(storage, MAPPE_DRAFT_KEY, { v: 1, savedAt: now, state });
}

/** Mappe, die der Bewerbungsflow mitsendet (STORAGE_KEYS.mappe, Vertrag C7). */
export function readHandoverMappe(storage: StorageLike | null): Mappe | null {
  const raw = readJson(storage, STORAGE_KEYS.mappe);
  if (raw === undefined) return null;
  const parsed = mappeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
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

/** Vom Bewerbungsflow nach erfolgreichem Absenden geschrieben (STORAGE_KEYS.submitted, Vertrag C7). */
export const submittedApplicationSchema = z.object({
  reference: z.string().trim().min(1).max(20),
  followUpToken: z.string().trim().min(1).max(128),
  firstName: z.string().max(100).optional().catch(undefined),
  jobId: z.string().max(80).optional().catch(undefined),
  submittedAt: z.union([z.number(), z.string()]).optional().catch(undefined),
});
export type SubmittedApplication = z.infer<typeof submittedApplicationSchema>;

export function readSubmitted(storage: StorageLike | null): SubmittedApplication | null {
  const parsed = submittedApplicationSchema.safeParse(readJson(storage, STORAGE_KEYS.submitted));
  return parsed.success ? parsed.data : null;
}

/** Alter localStorage-Key mit Demo- und Personendaten aus der Zeit vor dem Redesign. */
export function removeLegacyDossier(storage: StorageLike | null): void {
  remove(storage, STORAGE_KEYS.legacyDossier);
}
