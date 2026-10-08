import { z } from 'zod';
import {
  applicationAnswersSchema,
  applicationJobIdSchema,
  contactChannelSchema,
  STORAGE_KEYS,
  type ApplicationAnswers,
  type ApplicationJobId,
  type ContactChannel,
} from '@/lib/applications/schema';
import { getSessionStorage, readItem, removeItem, writeItem, type StorageLike } from './storage';

/**
 * Entwurf des Bewerbungsflows in sessionStorage (ROADMAP §6, TDDDG §25(2) Nr. 2):
 * 24 Stunden gültig, beim erfolgreichen Absenden gelöscht, nie in localStorage.
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
}

export type DraftContent = Omit<ApplyDraft, 'v' | 'savedAt'>;

const draftSchema = z.object({
  v: z.literal(DRAFT_VERSION),
  savedAt: z.number().finite(),
  jobId: applicationJobIdSchema.nullable().catch(null),
  answers: applicationAnswersSchema.catch({}),
  name: z.string().max(100).catch(''),
  phone: z.string().max(40).catch(''),
  email: z.string().max(254).catch(''),
  contactChannel: contactChannelSchema.catch('whatsapp'),
});

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
  };
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
  const result = draftSchema.safeParse(value);
  if (!result.success) return null;
  const draft = result.data as ApplyDraft;
  if (now - draft.savedAt > DRAFT_TTL_MS || draft.savedAt - now > MAX_CLOCK_SKEW_MS) return null;
  return draft;
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
