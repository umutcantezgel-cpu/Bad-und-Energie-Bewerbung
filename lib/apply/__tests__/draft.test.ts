import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '@/lib/applications/schema';
import {
  clearDraft,
  createDraft,
  DRAFT_TTL_MS,
  isDraftEmpty,
  loadDraft,
  parseDraft,
  saveDraft,
  serializeDraft,
  type DraftContent,
} from '../draft';
import type { StorageLike } from '../storage';

const NOW = Date.parse('2026-10-08T10:00:00Z');

const content: DraftContent = {
  jobId: 'anlagenmechaniker-shk',
  answers: { qualification: 'geselle-2-5', start: 'sofort' },
  name: 'Max Muster',
  phone: '0151 2345678',
  email: '',
  contactChannel: 'whatsapp',
};

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('serialize and parse', () => {
  it('round-trips a draft with version and timestamp', () => {
    const raw = serializeDraft(createDraft(content, NOW));
    expect(JSON.parse(raw)).toMatchObject({ v: 1, savedAt: NOW, jobId: 'anlagenmechaniker-shk' });
    expect(parseDraft(raw, NOW + 1000)).toEqual({ v: 1, savedAt: NOW, ...content });
  });

  it('expires after 24 hours', () => {
    const raw = serializeDraft(createDraft(content, NOW));
    expect(parseDraft(raw, NOW + DRAFT_TTL_MS)).not.toBeNull();
    expect(parseDraft(raw, NOW + DRAFT_TTL_MS + 1)).toBeNull();
  });

  it('rejects drafts from the future, other versions and broken JSON', () => {
    expect(parseDraft(serializeDraft(createDraft(content, NOW + 60 * 60 * 1000)), NOW)).toBeNull();
    expect(parseDraft(JSON.stringify({ ...createDraft(content, NOW), v: 2 }), NOW)).toBeNull();
    expect(parseDraft('{nope', NOW)).toBeNull();
    expect(parseDraft(null, NOW)).toBeNull();
  });

  it('keeps the first interaction and the idempotency key across reloads', () => {
    const key = '3b241101-e2bb-4255-8caf-4136c566a962';
    const raw = serializeDraft(createDraft({ ...content, firstInteractionAt: NOW - 90_000, idempotencyKey: key }, NOW));
    expect(parseDraft(raw, NOW + 1000)).toMatchObject({ firstInteractionAt: NOW - 90_000, idempotencyKey: key });
  });

  it('drops an implausible first interaction or a malformed key, but keeps the draft', () => {
    const raw = JSON.stringify({ ...createDraft(content, NOW), firstInteractionAt: NOW + 60_000, idempotencyKey: 'nope' });
    const draft = parseDraft(raw, NOW);
    expect(draft).toMatchObject({ name: 'Max Muster' });
    expect(draft).not.toHaveProperty('firstInteractionAt');
    expect(draft).not.toHaveProperty('idempotencyKey');
  });

  it('keeps only valid option ids as answers', () => {
    const raw = JSON.stringify({ ...createDraft(content, NOW), answers: { qualification: 'erfunden', start: 'sofort', foo: 'bar' } });
    expect(parseDraft(raw, NOW)?.answers).toEqual({ start: 'sofort' });
  });

  it('repairs single invalid fields instead of dropping the whole draft', () => {
    const raw = JSON.stringify({ ...createDraft(content, NOW), jobId: 'gibt-es-nicht', contactChannel: 'fax', answers: { foo: 1 } });
    expect(parseDraft(raw, NOW)).toMatchObject({ jobId: null, contactChannel: 'whatsapp', answers: {}, name: 'Max Muster' });
  });
});

describe('storage', () => {
  it('saves, loads and clears under the shared key', () => {
    const storage = memoryStorage();
    expect(saveDraft(content, NOW, storage)).toBe(true);
    expect(Object.keys(storage.data)).toEqual([STORAGE_KEYS.draft]);
    expect(loadDraft(NOW + 1000, storage)?.name).toBe('Max Muster');
    clearDraft(storage);
    expect(storage.data).toEqual({});
  });

  it('removes expired or broken drafts on load', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.draft]: serializeDraft(createDraft(content, NOW)) });
    expect(loadDraft(NOW + DRAFT_TTL_MS + 1, storage)).toBeNull();
    expect(storage.data).toEqual({});
  });

  it('does not keep empty drafts', () => {
    const empty: DraftContent = { jobId: null, answers: {}, name: ' ', phone: '', email: '', contactChannel: 'whatsapp' };
    expect(isDraftEmpty(empty)).toBe(true);
    const storage = memoryStorage({ [STORAGE_KEYS.draft]: 'old' });
    expect(saveDraft(empty, NOW, storage)).toBe(false);
    expect(storage.data).toEqual({});
  });

  it('never throws when storage is blocked or missing', () => {
    expect(saveDraft(content, NOW, throwingStorage)).toBe(false);
    expect(loadDraft(NOW, throwingStorage)).toBeNull();
    expect(() => clearDraft(throwingStorage)).not.toThrow();
    expect(saveDraft(content, NOW, null)).toBe(false);
    expect(loadDraft(NOW, null)).toBeNull();
  });
});
