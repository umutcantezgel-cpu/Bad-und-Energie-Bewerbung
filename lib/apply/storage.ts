import {
  STORAGE_KEYS,
  isApplicationJobId,
  isContactChannel,
  type ApplicationJobId,
  type ContactChannel,
} from '@/lib/applications/constants';
import { parseMappeData } from '@/lib/applications/mappe-data';
import type { Mappe } from '@/lib/applications/schema';

/**
 * Browser-Speicher für den Bewerbungsflow, die Danke-Seite und das Mappe-Werkzeug (C7). Nur
 * sessionStorage; jeder Zugriff ist in try/catch, weil Safari im privaten Modus, eingebettete
 * WebViews und strikte Einstellungen werfen. Ohne Speicher funktioniert alles weiter, nur ohne
 * Entwurf. Ohne zod geprüft (kleines Browser-Bundle).
 */

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getSessionStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readItem(key: string, storage: StorageLike | null = getSessionStorage()): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string, storage: StorageLike | null = getSessionStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string, storage: StorageLike | null = getSessionStorage()): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Speicher gesperrt: nichts zu löschen.
  }
}

/** Alter localStorage-Eintrag mit Personendaten aus dem Redesign-Vorgänger; wird einmalig gelöscht. */
export function removeLegacyDossier(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEYS.legacyDossier);
  } catch {
    // localStorage gesperrt: dann gibt es auch keinen alten Eintrag.
  }
}

function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Abgeschickte Bewerbung (STORAGE_KEYS.submitted): Danke-Seite und Mappe-Werkzeug
// ---------------------------------------------------------------------------

export interface SubmittedApplication {
  reference: string;
  followUpToken: string;
  firstName: string;
  jobId: ApplicationJobId;
  /** ISO-Zeitpunkt des erfolgreichen Absendens. */
  submittedAt: string;
  /** Gewählter Rückmeldeweg; die Danke-Seite nennt ihn (E-START-020). Fehlt bei älteren Einträgen. */
  contactChannel?: ContactChannel;
}

function boundedText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= max ? text : null;
}

export function parseSubmitted(raw: string | null | undefined): SubmittedApplication | null {
  const value = parseJson(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const reference = boundedText(record.reference, 20);
  const followUpToken = boundedText(record.followUpToken, 128);
  if (!reference || !followUpToken || !isApplicationJobId(record.jobId)) return null;
  const time =
    typeof record.submittedAt === 'number' ? record.submittedAt : typeof record.submittedAt === 'string' ? Date.parse(record.submittedAt) : NaN;
  // Date kann nur ±8.64e15 ms darstellen; alles darüber würde toISOString() werfen lassen.
  if (!Number.isFinite(time) || Math.abs(time) > 8.64e15) return null;
  return {
    reference,
    followUpToken,
    firstName: boundedText(record.firstName, 100) ?? '',
    jobId: record.jobId,
    submittedAt: new Date(time).toISOString(),
    ...(isContactChannel(record.contactChannel) ? { contactChannel: record.contactChannel } : {}),
  };
}

export function readSubmitted(storage: StorageLike | null = getSessionStorage()): SubmittedApplication | null {
  return parseSubmitted(readItem(STORAGE_KEYS.submitted, storage));
}

export function writeSubmitted(record: SubmittedApplication, storage: StorageLike | null = getSessionStorage()): boolean {
  return writeItem(STORAGE_KEYS.submitted, JSON.stringify(record), storage);
}

// ---------------------------------------------------------------------------
// Bewerbungsmappe (STORAGE_KEYS.mappe), geschrieben vom Mappe-Werkzeug
// ---------------------------------------------------------------------------

/** Mappe mit Inhalt: Anschreiben, Fähigkeiten, Arbeitsstil oder mindestens eine Station. */
export function hasMappeContent(mappe: Mappe): boolean {
  return (
    mappe.coverLetter.trim().length > 0 ||
    mappe.skills.length > 0 ||
    Boolean(mappe.workStyle?.trim()) ||
    mappe.careerStations.length > 0 ||
    mappe.educationStations.length > 0
  );
}

/** Gültige Mappe mit Inhalt oder null. Nimmt auch `{ mappe }` bzw. `{ data }` als Hülle an. */
export function parseMappe(raw: string | null | undefined): Mappe | null {
  const value = parseJson(raw);
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const candidate of [value, record.mappe, record.data]) {
    if (!candidate || typeof candidate !== 'object') continue;
    const result = parseMappeData(candidate);
    if (result.ok && hasMappeContent(result.mappe)) return result.mappe;
  }
  return null;
}

export function readMappe(storage: StorageLike | null = getSessionStorage()): Mappe | null {
  return parseMappe(readItem(STORAGE_KEYS.mappe, storage));
}

/**
 * Nach dem Absenden mit Mappe: Übergabe löschen, damit eine zweite Bewerbung im selben Tab sie
 * nicht ungefragt mitschickt. Der Arbeitsstand des Mappe-Werkzeugs (eigener Schlüssel) bleibt.
 */
export function clearMappe(storage: StorageLike | null = getSessionStorage()): void {
  removeItem(STORAGE_KEYS.mappe, storage);
}
