import { beforeEach, describe, expect, it, vi } from 'vitest';

const dispatchApplicationEmails = vi.hoisted(() => vi.fn());
const dispatchApplicationFollowUpEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email', () => ({ dispatchApplicationEmails, dispatchApplicationFollowUpEmail }));

import { applicationContentHash } from '@/lib/applications/fingerprint';
import { normalizeApplication, normalizeFollowUp } from '@/lib/applications/normalize';
import { REFERENCE_PATTERN, referenceForKey } from '@/lib/applications/reference';
import { applicationFollowUpSchema, applicationInputSchema } from '@/lib/applications/schema';
import { EmailSink } from '@/lib/applications/sink';
import type { IntakeRpc, RpcResult, SubmitApplicationResponse, SubmitFollowUpResponse } from '@/lib/supabase/rpc';
import { CircuitBreaker } from '@/lib/supabase/service';
import { SupabaseSink } from '@/lib/supabase/sink';

const KEY = '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60';
const MAIL_OK = { success: true, simulated: false, teamNotification: { success: true }, userConfirmation: { success: true } };
const MAIL_FAILED = {
  success: false,
  simulated: false,
  teamNotification: { success: false, error: 'send_failed' },
  userConfirmation: { success: false, error: 'skipped_team_failed' },
};
const MAIL_NOT_CONFIGURED = { ...MAIL_FAILED, teamNotification: { success: false, error: 'not_configured' } };

function application(overrides: Record<string, unknown> = {}) {
  return normalizeApplication(
    applicationInputSchema.parse({
      jobId: 'initiativ',
      name: 'Max Muster',
      phone: '0151 23456789',
      email: 'max@example.org',
      contactChannel: 'email',
      privacyNoticeVersion: '2026-10',
      idempotencyKey: KEY,
      ...overrides,
    }),
    { now: new Date('2026-10-10T10:00:00Z') },
  );
}

function followUp(message = 'Ich kann ab Dezember.') {
  return normalizeFollowUp(
    applicationFollowUpSchema.parse({ reference: 'BE-26-K7M4QX', token: 't', message }),
    'BE-26-K7M4QX',
    new Date('2026-10-10T11:00:00Z'),
  )!;
}

const stored = (reference: string, flags: Partial<SubmitApplicationResponse> = {}): RpcResult<SubmitApplicationResponse> => ({
  ok: true,
  data: { application_id: '00000000-0000-4000-8000-000000000001', reference, duplicate: false, resubmitted: false, ...flags },
});
const failure = (kind: Exclude<RpcResult<unknown>, { ok: true }>['kind'], status = 400, code?: string) =>
  ({ ok: false, kind, status, ...(code ? { code } : {}) }) as const;

function fakeRpc() {
  return {
    submitApplication: vi.fn<IntakeRpc['submitApplication']>(),
    submitFollowUp: vi.fn<IntakeRpc['submitFollowUp']>(),
    probe: vi.fn<IntakeRpc['probe']>(),
  };
}

function setup({ breaker = new CircuitBreaker() } = {}) {
  const rpc = fakeRpc();
  const fallback = new EmailSink();
  const fallbackSubmit = vi.spyOn(fallback, 'submit');
  const fallbackFollowUp = vi.spyOn(fallback, 'followUp');
  const sink = new SupabaseSink({ rpc, breaker, fallback });
  return { rpc, sink, fallbackSubmit, fallbackFollowUp, breaker };
}

function logged(): string {
  return [console.error, console.info, console.warn]
    .flatMap((spy) => (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat())
    .map(String)
    .join('\n');
}

beforeEach(() => {
  dispatchApplicationEmails.mockReset();
  dispatchApplicationFollowUpEmail.mockReset();
  dispatchApplicationEmails.mockResolvedValue(MAIL_OK);
  dispatchApplicationFollowUpEmail.mockResolvedValue({ success: true });
  vi.restoreAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('SupabaseSink.submit', () => {
  it('stores the application with the HMAC reference and the content hash, then sends the usual mails', async () => {
    const { rpc, sink, fallbackSubmit } = setup();
    const app = application();
    const expected = referenceForKey(KEY, app.submittedAt);
    rpc.submitApplication.mockResolvedValue(stored(expected));

    await expect(sink.submit(app)).resolves.toEqual({ ok: true, reference: expected });

    const payload = rpc.submitApplication.mock.calls[0][0];
    expect(payload).toMatchObject({ reference: expected, idempotency_key: KEY, content_hash: applicationContentHash(app), email: 'max@example.org' });
    expect(dispatchApplicationEmails).toHaveBeenCalledWith(expect.objectContaining({ reference: expected }), {
      idempotencyKey: `bewerbung:${KEY}`,
    });
    expect(fallbackSubmit).not.toHaveBeenCalled();
  });

  it('uses the reference the database returns (retry on another instance)', async () => {
    const { rpc, sink } = setup();
    rpc.submitApplication.mockResolvedValue(stored('BE-26-ZZZZZZ', { duplicate: true }));

    await expect(sink.submit(application())).resolves.toEqual({ ok: true, reference: 'BE-26-ZZZZZZ', duplicate: true });
    expect(dispatchApplicationEmails).toHaveBeenCalledWith(expect.objectContaining({ reference: 'BE-26-ZZZZZZ' }), expect.anything());
  });

  it('answers a repeat on the same instance without a second RPC or mail, and shares concurrent double submits', async () => {
    const { rpc, sink } = setup();
    let release: (value: RpcResult<SubmitApplicationResponse>) => void = () => {};
    rpc.submitApplication.mockReturnValue(new Promise((resolve) => (release = resolve)));

    const a = sink.submit(application());
    const b = sink.submit(application());
    release(stored('BE-26-K7M4QX'));
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra).toEqual(rb);

    await expect(sink.submit(application())).resolves.toEqual({ ok: true, reference: 'BE-26-K7M4QX', duplicate: true });
    expect(rpc.submitApplication).toHaveBeenCalledTimes(1);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
  });

  it('retries a reference conflict once with a random reference', async () => {
    const { rpc, sink } = setup();
    rpc.submitApplication
      .mockResolvedValueOnce(failure('reference_conflict', 400, 'P0001'))
      .mockImplementationOnce(async (payload) => stored(payload.reference));

    const result = await sink.submit(application());
    const [first, second] = rpc.submitApplication.mock.calls.map((call) => call[0].reference);
    expect(second).not.toBe(first);
    expect(second).toMatch(REFERENCE_PATTERN);
    expect(result).toEqual({ ok: true, reference: second });
  });

  it.each([
    ['unavailable', 0],
    ['misconfigured', 404],
    ['validation_failed', 400],
    ['unexpected', 200],
  ] as const)('sends the full application as emergency mail when the database answers %s', async (kind, status) => {
    const { rpc, sink, fallbackSubmit } = setup();
    rpc.submitApplication.mockResolvedValue(failure(kind, status));
    const app = application();

    const result = await sink.submit(app);
    expect(result).toEqual({ ok: true, reference: referenceForKey(KEY, app.submittedAt) });
    expect(fallbackSubmit).toHaveBeenCalledWith(app);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
    expect(logged()).toContain(`Datenbank: ${kind}`);
    expect(logged()).toContain('Not-E-Mail');
  });

  it('answers 503-worthy failures when database and emergency mail both fail', async () => {
    const { rpc, sink } = setup();
    rpc.submitApplication.mockResolvedValue(failure('unavailable', 0));
    dispatchApplicationEmails.mockResolvedValue(MAIL_FAILED);
    await expect(sink.submit(application())).resolves.toEqual({ ok: false, reason: 'unavailable' });

    dispatchApplicationEmails.mockResolvedValue(MAIL_NOT_CONFIGURED);
    await expect(sink.submit(application({ name: 'Moritz Muster' }))).resolves.toEqual({ ok: false, reason: 'not_configured' });
  });

  it('reports a failed team mail after storing, and the retry sends it again', async () => {
    const { rpc, sink } = setup();
    rpc.submitApplication.mockResolvedValueOnce(stored('BE-26-K7M4QX')).mockResolvedValueOnce(stored('BE-26-K7M4QX', { duplicate: true }));
    dispatchApplicationEmails.mockResolvedValueOnce(MAIL_FAILED).mockResolvedValueOnce(MAIL_OK);

    await expect(sink.submit(application())).resolves.toEqual({ ok: false, reason: 'failed' });
    await expect(sink.submit(application())).resolves.toEqual({ ok: true, reference: 'BE-26-K7M4QX', duplicate: true });
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(2);
  });

  it('skips the database for a while after repeated outages (circuit breaker)', async () => {
    let now = 0;
    const { rpc, sink, fallbackSubmit } = setup({ breaker: new CircuitBreaker({ threshold: 2, cooldownMs: 30_000, now: () => now }) });
    rpc.submitApplication.mockResolvedValue(failure('unavailable', 0));

    await sink.submit(application({ name: 'Anna Eins' }));
    await sink.submit(application({ name: 'Anna Zwei' }));
    await sink.submit(application({ name: 'Anna Drei' }));
    expect(rpc.submitApplication).toHaveBeenCalledTimes(2);
    expect(fallbackSubmit).toHaveBeenCalledTimes(3);

    now = 31_000;
    rpc.submitApplication.mockResolvedValue(stored('BE-26-K7M4QX'));
    await expect(sink.submit(application({ name: 'Anna Vier' }))).resolves.toMatchObject({ ok: true, reference: 'BE-26-K7M4QX' });
    expect(rpc.submitApplication).toHaveBeenCalledTimes(3);
  });

  it('does not open the breaker for rejected data', async () => {
    const breaker = new CircuitBreaker({ threshold: 1 });
    const { rpc, sink } = setup({ breaker });
    rpc.submitApplication.mockResolvedValue(failure('validation_failed'));
    await sink.submit(application());
    expect(breaker.isOpen()).toBe(false);
  });

  it('logs no personal data', async () => {
    const { rpc, sink } = setup();
    rpc.submitApplication.mockResolvedValue(failure('unavailable', 0));
    dispatchApplicationEmails.mockResolvedValue(MAIL_FAILED);
    await sink.submit(application());
    expect(logged()).not.toContain('max@example.org');
    expect(logged()).not.toContain('Max Muster');
    expect(logged()).not.toContain('0151');
  });
});

describe('SupabaseSink.followUp', () => {
  it('stores the follow-up and mails it to the team', async () => {
    const { rpc, sink } = setup();
    rpc.submitFollowUp.mockResolvedValue({ ok: true, data: { ok: true, duplicate: false } satisfies SubmitFollowUpResponse });
    const f = followUp();

    await expect(sink.followUp(f)).resolves.toEqual({ ok: true });
    expect(rpc.submitFollowUp).toHaveBeenCalledWith(expect.objectContaining({ reference: 'BE-26-K7M4QX', idempotency_key: f.idempotencyKey }));
    expect(dispatchApplicationFollowUpEmail).toHaveBeenCalledWith(f, { idempotencyKey: `ergaenzung:${f.idempotencyKey}` });

    await expect(sink.followUp(f)).resolves.toEqual({ ok: true, duplicate: true });
    expect(rpc.submitFollowUp).toHaveBeenCalledTimes(1);
  });

  it('mails follow-ups for applications that are not in the database (e-mail era or emergency mail)', async () => {
    const { rpc, sink, fallbackFollowUp } = setup();
    rpc.submitFollowUp.mockResolvedValue(failure('not_found', 400, 'P0001'));
    await expect(sink.followUp(followUp())).resolves.toEqual({ ok: true });
    expect(fallbackFollowUp).toHaveBeenCalledTimes(1);
    expect(dispatchApplicationFollowUpEmail).toHaveBeenCalledTimes(1);
  });

  it('reports the follow-up limit without sending a mail', async () => {
    const { rpc, sink } = setup();
    rpc.submitFollowUp.mockResolvedValue(failure('follow_up_limit', 400, 'P0001'));
    await expect(sink.followUp(followUp())).resolves.toEqual({ ok: false, reason: 'limited' });
    expect(dispatchApplicationFollowUpEmail).not.toHaveBeenCalled();
  });

  it('falls back to mail on outages and reports unavailable when that fails too', async () => {
    const { rpc, sink } = setup();
    rpc.submitFollowUp.mockResolvedValue(failure('unavailable', 0));
    await expect(sink.followUp(followUp('eins'))).resolves.toEqual({ ok: true });

    dispatchApplicationFollowUpEmail.mockResolvedValue({ success: false, error: 'send_failed' });
    await expect(sink.followUp(followUp('zwei'))).resolves.toEqual({ ok: false, reason: 'unavailable' });
  });
});
