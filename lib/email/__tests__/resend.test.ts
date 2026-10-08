import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

import { dispatchApplicationRequest, sendEmail } from '@/lib/email/resend';

const REAL_KEY = 're_Ab3dEf9h_KlMnOpQrStUvWx';
const SENDER = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
const RECIPIENT = 'bewerberin@example.org';

const message = { to: RECIPIENT, subject: 'Betreff', html: '<p>Inhalt</p>' };

const application = {
  fullName: 'Erika Beispiel',
  email: RECIPIENT,
  phone: '+49 151 00000000',
  position: 'Anlagenmechaniker SHK',
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

  it('maps thrown errors to send_failed', async () => {
    send.mockRejectedValue(new Error(`socket closed for ${RECIPIENT}`));
    expect(await sendEmail(message)).toEqual({ success: false, error: 'send_failed', simulated: false });
    expect(loggedText()).not.toContain(RECIPIENT);
  });
});

describe('dispatchApplicationRequest', () => {
  it('fails honestly when email is not configured in production', async () => {
    stubEnv({ NODE_ENV: 'production' });
    const result = await dispatchApplicationRequest(application);
    expect(result.success).toBe(false);
    expect(result.simulated).toBe(false);
    expect(result.teamNotification.error).toBe('not_configured');
  });

  it('sends the team mail and skips the confirmation without an applicant email', async () => {
    stubEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY, RESEND_FROM_EMAIL: SENDER });
    send.mockResolvedValue({ data: { id: 'email_team' }, error: null, headers: null });

    const result = await dispatchApplicationRequest({ ...application, email: '' }, { idempotencyKey: 'BE-26-0002' });

    expect(result.success).toBe(true);
    expect(result.userConfirmation).toEqual({ success: false, error: 'no_recipient' });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ to: ['info@bad-energie.de'], replyTo: undefined });
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: 'BE-26-0002:team' });
  });
});
