import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

import type { ReferencedApplication } from '@/lib/applications/types';
import { dispatchApplicationEmails, dispatchApplicationFollowUpEmail, sendEmail } from '@/lib/email/resend';

const REAL_KEY = 're_Ab3dEf9h_KlMnOpQrStUvWx';
const SENDER = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
const RECIPIENT = 'bewerberin@example.org';

const message = { to: RECIPIENT, subject: 'Betreff', html: '<p>Inhalt</p>' };

const application: ReferencedApplication = {
  reference: 'BE-26-K7M4QX',
  idempotencyKey: '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60',
  submittedAt: new Date('2026-10-08T12:00:00Z'),
  job: {
    id: 'anlagenmechaniker-shk',
    title: 'Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)',
    shortTitle: 'Anlagenmechaniker SHK',
    referenceCode: 'SHK-WP-2026-01',
    questionSet: 'fachkraft',
    status: 'published',
  },
  answers: { qualification: 'geselle-2-5', start: 'sofort' },
  name: 'Erika Beispiel',
  firstName: 'Erika',
  phone: { raw: '0151 23456789', e164: '+4915123456789', display: '01512 3456789', valid: true, country: 'DE' },
  email: RECIPIENT,
  contactChannel: 'whatsapp',
  attribution: { utmSource: 'indeed', utmMedium: 'jobboard' },
  channel: 'indeed',
  privacyNoticeVersion: '2026-10',
  suspectedSpam: false,
  spamSignals: [],
};

function stubEnv(vars: Record<string, string | undefined>) {
  for (const [name, value] of Object.entries(vars)) vi.stubEnv(name, value);
}

function loggedText(): string {
  const spies = [console.info, console.error, console.warn, console.log] as unknown as Array<{
    mock: { calls: unknown[][] };
  }>;
  return spies.flatMap((spy) => spy.mock.calls.flat().map(String)).join('\n');
}

beforeEach(() => {
  send.mockReset();
  stubEnv({
    NODE_ENV: 'development',
    VERCEL_ENV: undefined,
    RESEND_API_KEY: undefined,
    RESEND_FROM_EMAIL: undefined,
    CONTACT_NOTIFICATION_EMAIL: undefined,
    RESEND_TO_EMAIL: undefined,
    EMAIL_SIMULATION: undefined,
  });
  for (const method of ['info', 'error', 'warn', 'log'] as const) {
    vi.spyOn(console, method).mockImplementation(() => {});
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendEmail without configuration', () => {
  it('reports not_configured for a production build instead of faking success', async () => {
    stubEnv({ NODE_ENV: 'production' });
    await expect(sendEmail(message)).resolves.toEqual({
      success: false,
      error: 'not_configured',
      simulated: false,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('reports not_configured on Vercel production even with EMAIL_SIMULATION=true', async () => {
    stubEnv({ NODE_ENV: 'production', VERCEL_ENV: 'production', EMAIL_SIMULATION: 'true' });
    const result = await sendEmail(message);
    expect(result).toMatchObject({ success: false, error: 'not_configured' });
  });

  it('reports not_configured on Vercel production when only the sender is missing', async () => {
    stubEnv({ NODE_ENV: 'production', VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY });
    const result = await sendEmail(message);
    expect(result).toMatchObject({ success: false, error: 'not_configured' });
    expect(send).not.toHaveBeenCalled();
  });

  it('treats placeholder keys as missing', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: 're_123456789', RESEND_FROM_EMAIL: SENDER });
    expect(await sendEmail(message)).toMatchObject({ success: false, error: 'not_configured' });
  });

  it('simulates in development and logs no recipient', async () => {
    const result = await sendEmail(message);
    expect(result).toMatchObject({ success: true, simulated: true });
    expect(result.id).toMatch(/^sim_/);
    expect(send).not.toHaveBeenCalled();
    expect(loggedText()).not.toContain(RECIPIENT);
  });

  it('forces simulation with EMAIL_SIMULATION=true even when a key is set', async () => {
    stubEnv({ NODE_ENV: 'production', EMAIL_SIMULATION: 'true', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    expect(await sendEmail(message)).toMatchObject({ success: true, simulated: true });
    expect(send).not.toHaveBeenCalled();
  });
});

describe('sendEmail with Resend configured', () => {
  beforeEach(() => {
    stubEnv({ NODE_ENV: 'production', VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
  });

  it('passes replyTo, tags and the idempotency key through', async () => {
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null, headers: null });

    const result = await sendEmail({
      ...message,
      replyTo: 'team@bad-energie.de',
      tags: [{ name: 'category', value: 'application_team' }],
      idempotencyKey: 'BE-26-0001:team',
    });

    expect(result).toEqual({ success: true, id: 'email_1', simulated: false });
    expect(send).toHaveBeenCalledWith(
      {
        from: SENDER,
        to: [RECIPIENT],
        subject: 'Betreff',
        html: '<p>Inhalt</p>',
        replyTo: 'team@bad-energie.de',
        tags: [{ name: 'category', value: 'application_team' }],
      },
      { idempotencyKey: 'BE-26-0001:team' }
    );
    expect(loggedText()).toContain('email_1');
    expect(loggedText()).not.toContain(RECIPIENT);
  });

  it('returns the Resend error code without logging the message', async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', statusCode: 422, message: `Invalid to: ${RECIPIENT}` },
      headers: null,
    });

    expect(await sendEmail(message)).toEqual({ success: false, error: 'validation_error', simulated: false });
    expect(loggedText()).not.toContain(RECIPIENT);
  });

  it('treats a known idempotency key with a different body as already sent', async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: 'invalid_idempotent_request', statusCode: 409, message: 'Same idempotency key used with a different request payload' },
      headers: null,
    });
    expect(await sendEmail({ ...message, idempotencyKey: 'bewerbung:k:team:abc' })).toEqual({
      success: true,
      duplicate: true,
      simulated: false,
    });
    // Ohne eigenen Key ist es ein echter Fehler.
    expect(await sendEmail(message)).toMatchObject({ success: false, error: 'invalid_idempotent_request' });
  });

  it('maps thrown errors to send_failed', async () => {
    send.mockRejectedValue(new Error(`socket closed for ${RECIPIENT}`));
    expect(await sendEmail(message)).toEqual({ success: false, error: 'send_failed', simulated: false });
    expect(loggedText()).not.toContain(RECIPIENT);
  });
});

describe('dispatchApplicationEmails', () => {
  it('fails honestly when email is not configured in production', async () => {
    stubEnv({ NODE_ENV: 'production' });
    const result = await dispatchApplicationEmails(application);
    expect(result.success).toBe(false);
    expect(result.simulated).toBe(false);
    expect(result.teamNotification.error).toBe('not_configured');
  });

  it('sends team mail and confirmation with text alternatives and content-bound idempotency keys', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_x' }, error: null, headers: null });

    const result = await dispatchApplicationEmails(application, { idempotencyKey: 'bewerbung:abc' });

    expect(result.success).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
    const [teamPayload, teamOptions] = send.mock.calls[0];
    expect(teamPayload).toMatchObject({
      to: ['info@bad-energie.de'],
      replyTo: RECIPIENT,
      subject: 'Neue Bewerbung BE-26-K7M4QX: Anlagenmechaniker SHK – Erika',
    });
    expect(teamPayload.text).toContain('BE-26-K7M4QX');
    expect(teamOptions.idempotencyKey).toMatch(/^bewerbung:abc:team:[0-9a-f]{16}$/);

    const [userPayload, userOptions] = send.mock.calls[1];
    expect(userPayload).toMatchObject({ to: [RECIPIENT], replyTo: 'info@bad-energie.de' });
    expect(userPayload.subject).toContain('BE-26-K7M4QX');
    expect(userOptions.idempotencyKey).toMatch(/^bewerbung:abc:user:[0-9a-f]{16}$/);
    expect(loggedText()).not.toContain(RECIPIENT);
  });

  it('uses the same Resend key for retries (also with another receive time) and a new one for changed content', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_x' }, error: null, headers: null });

    const app = { ...application, email: undefined };
    await dispatchApplicationEmails(app, { idempotencyKey: 'k' });
    await dispatchApplicationEmails(app, { idempotencyKey: 'k' });
    // Wiederholung auf einer anderen Instanz: andere Eingangszeit und Ausfülldauer, gleiche Angaben.
    await dispatchApplicationEmails(
      { ...app, submittedAt: new Date('2026-10-08T12:00:40Z'), fillDurationMs: 70_000 },
      { idempotencyKey: 'k' }
    );
    await dispatchApplicationEmails(
      { ...app, phone: { ...application.phone, raw: '0151 23456780', display: '01512 3456780' } },
      { idempotencyKey: 'k' }
    );

    const keys = send.mock.calls.map((call) => call[1].idempotencyKey);
    expect(keys[0]).toMatch(/^k:team:[0-9a-f]{16}$/);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).toBe(keys[0]);
    expect(keys[3]).not.toBe(keys[0]);
  });

  it('sends no confirmation to the (unverified) address when spam is suspected', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_team' }, error: null, headers: null });

    const result = await dispatchApplicationEmails({ ...application, suspectedSpam: true, spamSignals: ['honeypot'] });

    expect(result.success).toBe(true);
    expect(result.userConfirmation).toEqual({ success: false, error: 'skipped_suspected_spam' });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ to: ['info@bad-energie.de'] });
    expect(send.mock.calls[0][0].subject).toMatch(/^\[Spamverdacht\] /);
  });

  it('sends only the team mail without an applicant email', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_team' }, error: null, headers: null });

    const result = await dispatchApplicationEmails({ ...application, email: undefined });

    expect(result.success).toBe(true);
    expect(result.userConfirmation).toEqual({ success: false, error: 'no_recipient' });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ to: ['info@bad-energie.de'], replyTo: undefined });
  });

  it('reports a failed team mail even if the confirmation went out', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send
      .mockResolvedValueOnce({ data: null, error: { name: 'application_error', statusCode: 500, message: 'x' }, headers: null })
      .mockResolvedValueOnce({ data: { id: 'email_user' }, error: null, headers: null });

    const result = await dispatchApplicationEmails(application);
    expect(result.success).toBe(false);
    expect(result.teamNotification.error).toBe('application_error');
  });
});

describe('dispatchApplicationFollowUpEmail', () => {
  it('sends one team mail with the reference in the subject', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_f' }, error: null, headers: null });

    const result = await dispatchApplicationFollowUpEmail(
      { reference: 'BE-26-K7M4QX', idempotencyKey: 'hash', receivedAt: new Date(), postalCode: '35578' },
      { idempotencyKey: 'ergaenzung:hash' }
    );

    expect(result.success).toBe(true);
    expect(send.mock.calls[0][0]).toMatchObject({ to: ['info@bad-energie.de'], subject: 'Ergänzung zu BE-26-K7M4QX' });
    expect(send.mock.calls[0][1].idempotencyKey).toMatch(/^ergaenzung:hash:follow-up:[0-9a-f]{16}$/);
  });
});
