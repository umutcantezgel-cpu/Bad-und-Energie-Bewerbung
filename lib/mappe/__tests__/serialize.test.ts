import { describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS, applicationFollowUpSchema, mappeSchema } from '@/lib/applications/schema';
import { getMappeJobOptions, getMappeRecipient } from '../context';
import {
  createEmptyEditorState,
  fromMappe,
  isMappeEmpty,
  resolveCoverLetter,
  serializeMappe,
  toMappe,
  type MappeEditorState,
} from '../editor';
import { sendMappeFollowUp } from '../follow-up';
import { MAPPE_LIMITS, SKILL_OPTIONS, WORK_STYLES } from '../options';
import { emptyCareerStation, emptyEducationStation } from '../stations';
import {
  MAPPE_DRAFT_KEY,
  MAPPE_DRAFT_TTL_MS,
  readDraft,
  readHandoverMappe,
  readSubmitted,
  removeLegacyDossier,
  writeDraft,
  writeHandoverMappe,
} from '../storage';

const context = { jobs: getMappeJobOptions(), recipient: getMappeRecipient() };

function filledState(): MappeEditorState {
  return {
    ...createEmptyEditorState('anlagenmechaniker-shk'),
    person: { name: 'Max Muster', phone: '0170 1234567', email: 'max@example.de', location: '35576 Wetzlar' },
    skills: [SKILL_OPTIONS[0], 'Eigener Schwerpunkt'],
    workStyleId: 'team',
    careerStations: [
      { id: 'c1', period: ' 2021 – heute ', role: 'Monteur', company: 'Betrieb A', location: ' ', tasks: '- Montage\n\nWartung' },
      emptyCareerStation('c2'),
    ],
    educationStations: [
      { id: 'e1', period: '2018 – 2021', degree: 'Gesellenbrief', institution: 'Berufsschule', location: 'Wetzlar' },
      emptyEducationStation('e2'),
    ],
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe('toMappe / serializeMappe', () => {
  it('serializes an empty editor into a valid, station-free mappe', () => {
    const result = serializeMappe(createEmptyEditorState(), context);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mappe.careerStations).toEqual([]);
    expect(result.mappe.educationStations).toEqual([]);
    expect(result.mappe.skills).toEqual([]);
    expect(result.mappe.coverLetter.startsWith('Sehr geehrter Herr Demir,')).toBe(true);
  });

  it('drops empty stations, splits tasks, omits blank locations and personal data', () => {
    const result = serializeMappe(filledState(), context);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { mappe } = result;
    expect(mappeSchema.parse(mappe)).toEqual(mappe);
    expect(mappe.careerStations).toEqual([
      { period: '2021 – heute', role: 'Monteur', company: 'Betrieb A', tasks: ['Montage', 'Wartung'] },
    ]);
    expect(mappe.educationStations).toEqual([
      { period: '2018 – 2021', degree: 'Gesellenbrief', institution: 'Berufsschule', location: 'Wetzlar' },
    ]);
    expect(mappe.workStyle).toBe(WORK_STYLES.find((s) => s.id === 'team')!.value);
    expect(mappe.coverLetter).toContain('Max Muster');
    const json = JSON.stringify(mappe);
    expect(json).not.toContain('0170 1234567');
    expect(json).not.toContain('max@example.de');
    expect(json).not.toContain('photo');
  });

  it('fits the follow-up contract', () => {
    const result = serializeMappe(filledState(), context);
    if (!result.ok) throw new Error(result.message);
    expect(applicationFollowUpSchema.safeParse({ reference: 'BE-26-AB12', token: 'x'.repeat(40), mappe: result.mappe }).success).toBe(true);
  });

  it('prefers the edited letter over the template', () => {
    const state = { ...filledState(), customLetter: 'Mein eigener Text' };
    expect(resolveCoverLetter(state, context)).toBe('Mein eigener Text');
    expect(toMappe(state, context).coverLetter).toBe('Mein eigener Text');
  });

  it('reports schema violations instead of sending them', () => {
    const state = { ...filledState(), customLetter: 'x'.repeat(MAPPE_LIMITS.coverLetter + 1) };
    const result = serializeMappe(state, context);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/Anschreiben/);
  });

  it('round-trips through fromMappe', () => {
    const mappe = toMappe(filledState(), context);
    const restored = fromMappe(mappe, 'anlagenmechaniker-shk');
    expect(restored.workStyleId).toBe('team');
    expect(restored.skills).toEqual(mappe.skills);
    expect(toMappe(restored, context)).toEqual(mappe);
  });

  it('knows when nothing beyond the template was entered', () => {
    expect(isMappeEmpty(createEmptyEditorState('anlagenmechaniker-shk'))).toBe(true);
    expect(isMappeEmpty({ ...createEmptyEditorState(), careerStations: [emptyCareerStation('x')] })).toBe(true);
    expect(isMappeEmpty(filledState())).toBe(false);
  });
});

describe('MAPPE_LIMITS mirror mappeSchema', () => {
  const ok = (value: object) => mappeSchema.safeParse(value).success;
  const career = (patch: object = {}) => ({ period: 'p', role: 'r', company: 'c', tasks: [], ...patch });
  const education = (patch: object = {}) => ({ period: 'p', degree: 'd', institution: 'i', ...patch });

  it.each([
    ['coverLetter', (n: number) => ({ coverLetter: 'x'.repeat(n) }), MAPPE_LIMITS.coverLetter],
    ['skills', (n: number) => ({ skills: Array.from({ length: n }, (_, i) => `s${i}`) }), MAPPE_LIMITS.skills],
    ['skill', (n: number) => ({ skills: ['x'.repeat(n)] }), MAPPE_LIMITS.skill],
    ['workStyle', (n: number) => ({ workStyle: 'x'.repeat(n) }), MAPPE_LIMITS.workStyle],
    ['careerStations', (n: number) => ({ careerStations: Array.from({ length: n }, () => career()) }), MAPPE_LIMITS.careerStations],
    ['educationStations', (n: number) => ({ educationStations: Array.from({ length: n }, () => education()) }), MAPPE_LIMITS.educationStations],
    ['tasksPerStation', (n: number) => ({ careerStations: [career({ tasks: Array.from({ length: n }, () => 't') })] }), MAPPE_LIMITS.tasksPerStation],
    ['task', (n: number) => ({ careerStations: [career({ tasks: ['x'.repeat(n)] })] }), MAPPE_LIMITS.task],
    ['period', (n: number) => ({ careerStations: [career({ period: 'x'.repeat(n) })] }), MAPPE_LIMITS.period],
    ['role', (n: number) => ({ careerStations: [career({ role: 'x'.repeat(n) })] }), MAPPE_LIMITS.role],
    ['company', (n: number) => ({ careerStations: [career({ company: 'x'.repeat(n) })] }), MAPPE_LIMITS.company],
    ['location', (n: number) => ({ careerStations: [career({ location: 'x'.repeat(n) })] }), MAPPE_LIMITS.location],
    ['degree', (n: number) => ({ educationStations: [education({ degree: 'x'.repeat(n) })] }), MAPPE_LIMITS.degree],
    ['institution', (n: number) => ({ educationStations: [education({ institution: 'x'.repeat(n) })] }), MAPPE_LIMITS.institution],
  ])('%s', (_name, build, limit) => {
    expect(ok(build(limit))).toBe(true);
    expect(ok(build(limit + 1))).toBe(false);
  });

  it('keeps every predefined option within the limits', () => {
    expect(SKILL_OPTIONS.every((skill) => skill.length <= MAPPE_LIMITS.skill)).toBe(true);
    expect(WORK_STYLES.every((style) => style.value.length <= MAPPE_LIMITS.workStyle)).toBe(true);
  });
});

describe('storage', () => {
  it('writes and restores the draft within 24 hours', () => {
    const storage = memoryStorage();
    const state = filledState();
    expect(writeDraft(storage, state, 1_000)).toBe(true);
    expect(readDraft(storage, 1_000 + MAPPE_DRAFT_TTL_MS - 1)).toEqual(state);
  });

  it('drops expired, foreign or broken drafts', () => {
    const storage = memoryStorage();
    writeDraft(storage, filledState(), 1_000);
    expect(readDraft(storage, 1_000 + MAPPE_DRAFT_TTL_MS + 1)).toBeNull();
    expect(storage.data.has(MAPPE_DRAFT_KEY)).toBe(false);

    const broken = memoryStorage({ [MAPPE_DRAFT_KEY]: '{not json' });
    expect(readDraft(broken)).toBeNull();
    expect(readDraft(null)).toBeNull();
  });

  it('repairs invalid fields instead of failing the whole draft', () => {
    const storage = memoryStorage({
      [MAPPE_DRAFT_KEY]: JSON.stringify({
        v: 1,
        savedAt: 5,
        state: { ...filledState(), jobId: 'gibt-es-nicht', workStyleId: 'laut', skills: 'kaputt' },
      }),
    });
    const restored = readDraft(storage, 10);
    expect(restored?.jobId).toBe('');
    expect(restored?.workStyleId).toBeNull();
    expect(restored?.skills).toEqual([]);
    expect(restored?.person.name).toBe('Max Muster');
  });

  it('survives storage that throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(writeDraft(throwing, filledState())).toBe(false);
    expect(readDraft(throwing)).toBeNull();
    expect(readSubmitted(throwing)).toBeNull();
    expect(() => removeLegacyDossier(throwing)).not.toThrow();
  });

  it('hands the mappe over under STORAGE_KEYS.mappe and reads the submitted application', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.submitted]: JSON.stringify({
        reference: 'BE-26-AB12',
        followUpToken: 'tok',
        firstName: 'Max',
        jobId: 'anlagenmechaniker-shk',
        submittedAt: 1,
      }),
      [STORAGE_KEYS.legacyDossier]: '{}',
    });
    const mappe = toMappe(filledState(), context);
    expect(writeHandoverMappe(storage, mappe)).toBe(true);
    expect(readHandoverMappe(storage)).toEqual(mappeSchema.parse(mappe));
    expect(readSubmitted(storage)).toMatchObject({ reference: 'BE-26-AB12', followUpToken: 'tok', firstName: 'Max' });
    removeLegacyDossier(storage);
    expect(storage.data.has(STORAGE_KEYS.legacyDossier)).toBe(false);
    expect(readSubmitted(memoryStorage({ [STORAGE_KEYS.submitted]: '{"reference":""}' }))).toBeNull();
  });
});

describe('sendMappeFollowUp', () => {
  const mappe = toMappe(filledState(), context);
  const json = (status: number, body: unknown) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

  it('posts JSON to the follow-up endpoint and reports success only on { ok: true }', async () => {
    const fetchImpl = json(200, { ok: true });
    await expect(sendMappeFollowUp({ reference: 'BE-26-AB12', token: 'tok', mappe }, fetchImpl)).resolves.toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/bewerbung/ergaenzung');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(applicationFollowUpSchema.parse(JSON.parse(String(init.body)))).toMatchObject({ reference: 'BE-26-AB12', token: 'tok' });

    const fake = await sendMappeFollowUp({ reference: 'BE-26-AB12', token: 'tok', mappe }, json(200, { ok: false }));
    expect(fake.ok).toBe(false);
  });

  it('passes the server message through and adds a retry hint', async () => {
    const result = await sendMappeFollowUp(
      { reference: 'BE-26-AB12', token: 'tok', mappe },
      json(429, { ok: false, code: 'RATE_LIMITED', message: 'Zu viele Anfragen.', retryAfterSec: 300 }),
    );
    expect(result).toEqual({ ok: false, code: 'RATE_LIMITED', message: 'Zu viele Anfragen. Versuch es in 5 Minuten noch einmal.' });
  });

  it('turns network failures and non-JSON errors into honest messages', async () => {
    const offline = await sendMappeFollowUp({ reference: 'R', token: 't', mappe }, vi.fn(async () => Promise.reject(new TypeError('offline'))));
    expect(offline).toMatchObject({ ok: false, code: 'NETWORK' });
    const html = await sendMappeFollowUp({ reference: 'R', token: 't', mappe }, vi.fn(async () => new Response('<html>', { status: 503 })));
    expect(html).toMatchObject({ ok: false, code: 'SERVICE_UNAVAILABLE' });
  });
});
