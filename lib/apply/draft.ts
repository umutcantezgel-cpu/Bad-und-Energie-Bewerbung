import {
  CONTACT_LIMITS,
  STORAGE_KEYS,
  isApplicationJobId,
  isContactChannel,
  type ApplicationJobId,
  type ContactChannel,
} from '@/lib/applications/constants';
import type { ApplicationAnswers } from '@/lib/applications/schema';
import { isAnswerKey, isValidAnswer } from './questions';
import { getSessionStorage, readItem, removeItem, writeItem, type StorageLike } from './storage';

/**
 * Entwurf des Bewerbungsflows in sessionStorage (ROADMAP §6, TDDDG §25(2) Nr. 2):
 * 24 Stunden gültig, beim erfolgreichen Absenden gelöscht, nie in localStorage.
 * Ohne zod geprüft (kleines Browser-Bundle); einzelne ungültige Felder werden repariert.
 */

export const DRAFT_VERSION = 1;
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
/** Uhren dürfen leicht abweichen; Entwürfe „aus der Zukunft“ darüber hinaus gelten als ungültig. */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface ApplyDraft {
  v: typeof DRAFT_VERSION;
  savedAt: number;
  jobId: ApplicationJobId | null;
  answers: ApplicationAnswers;
  name: string;
  phone: string;
  email: string;
  contactChannel: ContactChannel;
  /**
   * Erste Eingabe (ms, Uhr des Browsers). Bleibt über Reloads und den Umweg über die Mappe
   * erhalten; daraus wird beim Absenden die Ausfülldauer (Spam-Hinweis, keine Ablehnung).
   */
  firstInteractionAt?: number;
  /** Idempotency-Key des ersten Absendeversuchs: Nach einem Reload gilt er weiter (keine Doppel-Bewerbung). */
  idempotencyKey?: string;
}

type OptionalDraftField = 'firstInteractionAt' | 'idempotencyKey';
export type DraftContent = Omit<ApplyDraft, 'v' | 'savedAt' | OptionalDraftField> & Partial<Pick<ApplyDraft, OptionalDraftField>>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createDraft(content: DraftContent, now: number): ApplyDraft {
  return {
    v: DRAFT_VERSION,
    savedAt: now,
    jobId: content.jobId,
    answers: { ...content.answers },
    name: content.name,
    phone: content.phone,
    email: content.email,
    contactChannel: content.contactChannel,
    ...(content.firstInteractionAt !== undefined ? { firstInteractionAt: content.firstInteractionAt } : {}),
    ...(content.idempotencyKey ? { idempotencyKey: content.idempotencyKey } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const text = (value: unknown, max: number): string => (typeof value === 'string' && value.length <= max ? value : '');

/** Nur bekannte Fragen mit gültiger Option; der Flow gleicht sie danach mit dem Fragenset der Stelle ab. */
function draftAnswers(value: unknown): ApplicationAnswers {
  const answers: Record<string, string> = {};
  if (!isRecord(value)) return answers;
  for (const [key, answer] of Object.entries(value)) {
    if (isAnswerKey(key) && isValidAnswer(key, answer)) answers[key] = answer;
  }
  return answers as ApplicationAnswers;
}

export function serializeDraft(draft: ApplyDraft): string {
  return JSON.stringify(draft);
}

/** Gültiger, höchstens 24 Stunden alter Entwurf oder null. */
export function parseDraft(raw: string | null | undefined, now: number): ApplyDraft | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.v !== DRAFT_VERSION) return null;
  const savedAt = value.savedAt;
  if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null;
  if (now - savedAt > DRAFT_TTL_MS || savedAt - now > MAX_CLOCK_SKEW_MS) return null;

  const first = value.firstInteractionAt;
  const key = value.idempotencyKey;
  return createDraft(
    {
      jobId: isApplicationJobId(value.jobId) ? value.jobId : null,
      answers: draftAnswers(value.answers),
      name: text(value.name, CONTACT_LIMITS.name),
      phone: text(value.phone, CONTACT_LIMITS.phone),
      email: text(value.email, CONTACT_LIMITS.email),
      contactChannel: isContactChannel(value.contactChannel) ? value.contactChannel : 'whatsapp',
      firstInteractionAt: typeof first === 'number' && Number.isFinite(first) && first > 0 && first <= savedAt ? first : undefined,
      idempotencyKey: typeof key === 'string' && UUID_PATTERN.test(key) ? key : undefined,
    },
    savedAt,
  );
}

/** Nichts gewählt und nichts getippt: kein Entwurf nötig. */
export function isDraftEmpty(content: DraftContent): boolean {
  return (
    !content.jobId &&
    Object.keys(content.answers).length === 0 &&
    !content.name.trim() &&
    !content.phone.trim() &&
    !content.email.trim()
  );
}

export function loadDraft(now: number, storage: StorageLike | null = getSessionStorage()): ApplyDraft | null {
  const raw = readItem(STORAGE_KEYS.draft, storage);
  const draft = parseDraft(raw, now);
  // Abgelaufene oder kaputte Entwürfe nicht liegen lassen.
  if (raw && !draft) removeItem(STORAGE_KEYS.draft, storage);
  return draft;
}

export function saveDraft(content: DraftContent, now: number, storage: StorageLike | null = getSessionStorage()): boolean {
  if (isDraftEmpty(content)) {
    removeItem(STORAGE_KEYS.draft, storage);
    return false;
  }
  return writeItem(STORAGE_KEYS.draft, serializeDraft(createDraft(content, now)), storage);
}

export function clearDraft(storage: StorageLike | null = getSessionStorage()): void {
  removeItem(STORAGE_KEYS.draft, storage);
}
