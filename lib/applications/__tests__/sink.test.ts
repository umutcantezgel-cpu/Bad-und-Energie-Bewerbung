import { beforeEach, describe, expect, it, vi } from 'vitest';

const dispatchApplicationEmails = vi.hoisted(() => vi.fn());
const dispatchApplicationFollowUpEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email', () => ({ dispatchApplicationEmails, dispatchApplicationFollowUpEmail }));

import { TtlLru } from '@/lib/applications/idempotency';
import { normalizeApplication, normalizeFollowUp } from '@/lib/applications/normalize';
import { applicationInputSchema } from '@/lib/applications/schema';
import { EmailSink } from '@/lib/applications/sink';

const OK = { success: true, simulated: false, teamNotification: { success: true }, userConfirmation: { success: true } };
const NOT_CONFIGURED = {
  success: false,
  simulated: false,
  teamNotification: { success: false, error: 'not_configured' },
  userConfirmation: { success: false, error: 'not_configured' },
};
const FAILED = { ...NOT_CONFIGURED, teamNotification: { success: false, error: 'send_failed' } };

function application(key = '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60', now = new Date('2026-10-08T10:00:00Z')) {
  return normalizeApplication(
    applicationInputSchema.parse({
      jobId: 'initiativ',
      name: 'Max Muster',
      phone: '0151 23456789',
      privacyNoticeVersion: '2026-10',
      idempotencyKey: key,
    }),
    { now },
  );
}

beforeEach(() => {
  dispatchApplicationEmails.mockReset();
  dispatchApplicationFollowUpEmail.mockReset();
});

describe('EmailSink.submit', () => {
  it('returns the reference after the team mail was accepted', async () => {
    dispatchApplicationEmails.mockResolvedValue(OK);
    const sink = new EmailSink({ createReference: () => 'BE-26-AAAAAA' });

    await expect(sink.submit(application())).resolves.toEqual({ ok: true, reference: 'BE-26-AAAAAA' });
    expect(dispatchApplicationEmails).toHaveBeenCalledWith(
      expect.objectContaining({ reference: 'BE-26-AAAAAA', job: expect.objectContaining({ title: 'Initiativbewerbung' }) }),
      { idempotencyKey: 'bewerbung:7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60' },
    );
  });

  it('answers a retry with the same reference and sends only once', async () => {
    dispatchApplicationEmails.mockResolvedValue(OK);
    const sink = new EmailSink();
    const first = await sink.submit(application());
    const second = await sink.submit(application());

    expect(first.ok && second.ok && second.reference).toBe(first.ok && first.reference);
    expect(second).toMatchObject({ duplicate: true });
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
  });

  it('shares one delivery between concurrent double submits', async () => {
    let resolve: (value: typeof OK) => void = () => {};
    dispatchApplicationEmails.mockReturnValue(new Promise((r) => (resolve = r)));
    const sink = new EmailSink();
    const a = sink.submit(application());
    const b = sink.submit(application());
    resolve(OK);
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra).toEqual(rb);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(1);
  });

  it('reuses reference and timestamp when retrying after a failure', async () => {
    dispatchApplicationEmails.mockResolvedValueOnce(FAILED).mockResolvedValueOnce(OK);
    const sink = new EmailSink();

    await expect(sink.submit(application())).resolves.toEqual({ ok: false, reason: 'failed' });
    const retry = await sink.submit(application(undefined, new Date('2026-10-08T10:05:00Z')));

    const [firstCall, secondCall] = dispatchApplicationEmails.mock.calls;
    expect(retry).toEqual({ ok: true, reference: firstCall[0].reference });
    expect(secondCall[0].reference).toBe(firstCall[0].reference);
    expect(secondCall[0].submittedAt).toEqual(firstCall[0].submittedAt);
  });

  it('maps a missing mail configuration to not_configured', async () => {
    dispatchApplicationEmails.mockResolvedValue(NOT_CONFIGURED);
    await expect(new EmailSink().submit(application())).resolves.toEqual({ ok: false, reason: 'not_configured' });
  });

  it('gives different keys different references', async () => {
    dispatchApplicationEmails.mockResolvedValue(OK);
    const sink = new EmailSink();
    const a = await sink.submit(application('11111111-1111-4111-8111-111111111111'));
    const b = await sink.submit(application('22222222-2222-4222-8222-222222222222'));
    expect(a.ok && b.ok && a.reference !== b.reference).toBe(true);
    expect(dispatchApplicationEmails).toHaveBeenCalledTimes(2);
  });
});

describe('EmailSink.followUp', () => {
  it('sends identical follow-ups once', async () => {
    dispatchApplicationFollowUpEmail.mockResolvedValue({ success: true });
    const sink = new EmailSink();
    const followUp = normalizeFollowUp({ reference: 'x', token: 't', message: 'Hallo' }, 'BE-26-K7M4QX')!;

    await expect(sink.followUp(followUp)).resolves.toEqual({ ok: true });
    await expect(sink.followUp({ ...followUp })).resolves.toEqual({ ok: true, duplicate: true });
    expect(dispatchApplicationFollowUpEmail).toHaveBeenCalledTimes(1);
    expect(dispatchApplicationFollowUpEmail.mock.calls[0][1]).toEqual({ idempotencyKey: `ergaenzung:${followUp.idempotencyKey}` });
  });

  it('reports failures without caching them', async () => {
    dispatchApplicationFollowUpEmail.mockResolvedValueOnce({ success: false, error: 'not_configured' }).mockResolvedValueOnce({ success: true });
    const sink = new EmailSink();
    const followUp = normalizeFollowUp({ reference: 'x', token: 't', postalCode: '35578' }, 'BE-26-K7M4QX')!;
    await expect(sink.followUp(followUp)).resolves.toEqual({ ok: false, reason: 'not_configured' });
    await expect(sink.followUp(followUp)).resolves.toEqual({ ok: true });
  });
});

describe('TtlLru', () => {
  it('expires entries after the TTL and evicts the least recently used', () => {
    let now = 0;
    const cache = new TtlLru<number>({ maxEntries: 2, ttlMs: 1000, now: () => now });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    now = 1000;
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size).toBe(1);
  });
});
