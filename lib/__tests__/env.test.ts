import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_APP_URL,
  EnvError,
  reportServerEnv,
  checkServerEnv,
  devSecretsAllowed,
  emailSimulationAllowed,
  getAppUrl,
  getEmailConfig,
  getIndexNowKey,
  getIndexNowSubmitToken,
  getSecret,
  isPlaceholder,
  isVercelProduction,
} from '@/lib/env';

const MANAGED_VARS = [
  'VERCEL_ENV',
  'APP_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'CONTACT_NOTIFICATION_EMAIL',
  'RESEND_TO_EMAIL',
  'INDEXNOW_KEY',
  'INDEXNOW_SUBMIT_TOKEN',
  'IP_HASH_SALT',
  'APPLICATION_TOKEN_SECRET',
  'EMAIL_SIMULATION',
  'ALLOW_DEV_SECRETS',
] as const;

const REAL_KEY = 're_Ab3dEf9h_KlMnOpQrStUvWx';
const SENDER = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
const SECRET = 'a'.repeat(64);

function setEnv(vars: Partial<Record<(typeof MANAGED_VARS)[number] | 'NODE_ENV', string>>) {
  for (const [name, value] of Object.entries(vars)) vi.stubEnv(name, value);
}

function catchError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('expected function to throw');
}

beforeEach(() => {
  for (const name of MANAGED_VARS) vi.stubEnv(name, undefined);
  vi.stubEnv('NODE_ENV', 'development');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('isPlaceholder', () => {
  it.each([
    undefined,
    null,
    '',
    '   ',
    're_123456789',
    're_placeholder_key',
    'MY_API_KEY',
    'MY_RESEND_API_KEY',
    'your_random_secret_min_32_chars',
    'dein_key',
    '<dein-key>',
    'changeme',
  ])('treats %j as missing', (value) => {
    expect(isPlaceholder(value)).toBe(true);
  });

  it.each([REAL_KEY, SENDER, SECRET, 'https://karriere.bad-energie.de', 'info@bad-energie.de'])(
    'accepts %j',
    (value) => {
      expect(isPlaceholder(value)).toBe(false);
    }
  );
});

describe('isVercelProduction', () => {
  it('is true only for VERCEL_ENV=production', () => {
    expect(isVercelProduction()).toBe(false);
    setEnv({ VERCEL_ENV: 'preview' });
    expect(isVercelProduction()).toBe(false);
    setEnv({ VERCEL_ENV: 'production' });
    expect(isVercelProduction()).toBe(true);
  });
});

describe('emailSimulationAllowed', () => {
  it('allows simulation in development', () => {
    expect(emailSimulationAllowed()).toBe(true);
  });

  it('refuses simulation for NODE_ENV=production without EMAIL_SIMULATION', () => {
    setEnv({ NODE_ENV: 'production' });
    expect(emailSimulationAllowed()).toBe(false);
    setEnv({ EMAIL_SIMULATION: 'false' });
    expect(emailSimulationAllowed()).toBe(false);
  });

  it('allows simulation for a local production build with EMAIL_SIMULATION=true', () => {
    setEnv({ NODE_ENV: 'production', EMAIL_SIMULATION: 'true' });
    expect(emailSimulationAllowed()).toBe(true);
    setEnv({ VERCEL_ENV: 'preview' });
    expect(emailSimulationAllowed()).toBe(true);
  });

  it('always refuses simulation on Vercel production', () => {
    setEnv({ VERCEL_ENV: 'production', EMAIL_SIMULATION: 'true' });
    expect(emailSimulationAllowed()).toBe(false);
    setEnv({ NODE_ENV: 'production' });
    expect(emailSimulationAllowed()).toBe(false);
  });
});

describe('devSecretsAllowed', () => {
  it('allows the dev fallback only outside production builds or with an explicit opt-in', () => {
    expect(devSecretsAllowed()).toBe(true);
    setEnv({ NODE_ENV: 'production' });
    expect(devSecretsAllowed()).toBe(false);
    setEnv({ VERCEL_ENV: 'preview' });
    expect(devSecretsAllowed()).toBe(false);
    setEnv({ ALLOW_DEV_SECRETS: 'true' });
    expect(devSecretsAllowed()).toBe(true);
  });

  it('never allows it on Vercel production', () => {
    setEnv({ VERCEL_ENV: 'production', ALLOW_DEV_SECRETS: 'true' });
    expect(devSecretsAllowed()).toBe(false);
  });
});

describe('getAppUrl', () => {
  it('falls back to the production domain', () => {
    expect(getAppUrl()).toBe(DEFAULT_APP_URL);
    setEnv({ APP_URL: 'not a url' });
    expect(getAppUrl()).toBe(DEFAULT_APP_URL);
    setEnv({ APP_URL: 'your_app_url' });
    expect(getAppUrl()).toBe(DEFAULT_APP_URL);
  });

  it('strips trailing slashes', () => {
    setEnv({ APP_URL: 'http://localhost:3000//' });
    expect(getAppUrl()).toBe('http://localhost:3000');
  });
});

describe('getEmailConfig', () => {
  it('uses the default recipient and has no sender fallback, even in development', () => {
    setEnv({ RESEND_API_KEY: REAL_KEY });
    const config = getEmailConfig();
    expect(config.from).toBeUndefined();
    expect(config.notificationTo).toBe('info@bad-energie.de');
    expect(config.missing).toEqual(['RESEND_FROM_EMAIL']);
    expect(JSON.stringify(config)).not.toContain('resend.dev');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('reports missing sender in production builds', async () => {
    vi.resetModules();
    const fresh = await import('@/lib/env');
    setEnv({ NODE_ENV: 'production', RESEND_API_KEY: REAL_KEY });
    const config = fresh.getEmailConfig();
    expect(config.from).toBeUndefined();
    expect(config.missing).toEqual(['RESEND_FROM_EMAIL']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_FROM_EMAIL'));
  });

  it('reports missing variables on Vercel production by name only', async () => {
    vi.resetModules();
    const fresh = await import('@/lib/env');
    setEnv({ NODE_ENV: 'production', VERCEL_ENV: 'production', RESEND_API_KEY: 're_123456789' });
    const config = fresh.getEmailConfig();
    expect(config.missing).toEqual(['RESEND_API_KEY', 'RESEND_FROM_EMAIL']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('re_123456789'));
  });

  it('returns a complete config when everything is set', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      RESEND_API_KEY: REAL_KEY,
      RESEND_FROM_EMAIL: SENDER,
      CONTACT_NOTIFICATION_EMAIL: 'team@bad-energie.de',
    });
    expect(getEmailConfig()).toEqual({
      apiKey: REAL_KEY,
      from: SENDER,
      notificationTo: 'team@bad-energie.de',
      forceSimulation: false,
      missing: [],
    });
  });

  it('treats an invalid sender as missing and reads the legacy recipient name', () => {
    setEnv({ NODE_ENV: 'production', RESEND_FROM_EMAIL: 'kein absender', RESEND_TO_EMAIL: 'alt@bad-energie.de' });
    const config = getEmailConfig();
    expect(config.from).toBeUndefined();
    expect(config.notificationTo).toBe('alt@bad-energie.de');
  });

  it('forces simulation only where simulation is allowed', () => {
    setEnv({ EMAIL_SIMULATION: 'true', RESEND_API_KEY: REAL_KEY });
    expect(getEmailConfig().forceSimulation).toBe(true);
    setEnv({ VERCEL_ENV: 'production' });
    expect(getEmailConfig().forceSimulation).toBe(false);
  });
});

describe('getSecret', () => {
  it('returns configured secrets', () => {
    setEnv({ VERCEL_ENV: 'production', IP_HASH_SALT: SECRET });
    expect(getSecret('IP_HASH_SALT')).toBe(SECRET);
  });

  it('returns a dev fallback in development', () => {
    setEnv({ APPLICATION_TOKEN_SECRET: 'your_random_secret_min_32_chars' });
    const fallback = getSecret('APPLICATION_TOKEN_SECRET');
    expect(fallback).toMatch(/^dev-only-/);
    expect(getSecret('IP_HASH_SALT')).not.toBe(fallback);
  });

  it.each([
    ['self-hosted', {}],
    ['Vercel preview', { VERCEL_ENV: 'preview' }],
  ])('fails closed in a production build (%s)', (_label, vars) => {
    setEnv({ NODE_ENV: 'production', ...vars });
    expect(catchError(() => getSecret('IP_HASH_SALT'))).toMatchObject({ variable: 'IP_HASH_SALT', reason: 'missing' });
    expect(catchError(() => getSecret('APPLICATION_TOKEN_SECRET'))).toBeInstanceOf(EnvError);
  });

  it('allows the dev fallback in a production build only with ALLOW_DEV_SECRETS=true', () => {
    setEnv({ NODE_ENV: 'production', ALLOW_DEV_SECRETS: 'true' });
    expect(getSecret('IP_HASH_SALT')).toMatch(/^dev-only-/);
  });

  it('throws a typed error on Vercel production when missing or too short', () => {
    setEnv({ VERCEL_ENV: 'production' });
    const missing = catchError(() => getSecret('IP_HASH_SALT'));
    expect(missing).toBeInstanceOf(EnvError);
    expect(missing).toMatchObject({ variable: 'IP_HASH_SALT', reason: 'missing' });

    setEnv({ APPLICATION_TOKEN_SECRET: 'zu-kurz' });
    expect(catchError(() => getSecret('APPLICATION_TOKEN_SECRET'))).toMatchObject({
      variable: 'APPLICATION_TOKEN_SECRET',
      reason: 'invalid',
    });
  });
});

describe('getIndexNowKey', () => {
  it('reads the key only from the environment', () => {
    expect(getIndexNowKey()).toBeUndefined();
    setEnv({ INDEXNOW_KEY: 'kein key!' });
    expect(getIndexNowKey()).toBeUndefined();
    setEnv({ INDEXNOW_KEY: '0123456789abcdef0123456789abcdef' });
    expect(getIndexNowKey()).toBe('0123456789abcdef0123456789abcdef');
  });
});

describe('getIndexNowSubmitToken', () => {
  it('ignores placeholders and short tokens', () => {
    expect(getIndexNowSubmitToken()).toBeUndefined();
    setEnv({ INDEXNOW_SUBMIT_TOKEN: 'your_token_here_with_enough_length_123' });
    expect(getIndexNowSubmitToken()).toBeUndefined();
    setEnv({ INDEXNOW_SUBMIT_TOKEN: 'short' });
    expect(getIndexNowSubmitToken()).toBeUndefined();
    setEnv({ INDEXNOW_SUBMIT_TOKEN: SECRET });
    expect(getIndexNowSubmitToken()).toBe(SECRET);
  });
});

describe('checkServerEnv', () => {
  it('fails on Vercel production when required variables are missing', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, APP_URL: 'nope' });
    const result = checkServerEnv();
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['RESEND_FROM_EMAIL', 'IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET']);
    expect(result.invalid).toEqual(['APP_URL']);
  });

  it('passes on Vercel production when everything required is set', () => {
    setEnv({
      VERCEL_ENV: 'production',
      RESEND_API_KEY: REAL_KEY,
      RESEND_FROM_EMAIL: SENDER,
      IP_HASH_SALT: SECRET,
      APPLICATION_TOKEN_SECRET: SECRET,
    });
    expect(checkServerEnv()).toEqual({ ok: true, missing: [], invalid: [] });
  });

  it('tolerates missing values in development', () => {
    expect(checkServerEnv()).toEqual({ ok: true, missing: [], invalid: [] });
  });

  it('requires mail config and secrets in any production build without opt-ins', () => {
    setEnv({ NODE_ENV: 'production' });
    expect(checkServerEnv()).toEqual({
      ok: false,
      missing: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET'],
      invalid: [],
    });
    setEnv({ EMAIL_SIMULATION: 'true', ALLOW_DEV_SECRETS: 'true' });
    expect(checkServerEnv().ok).toBe(true);
  });
});

describe('reportServerEnv', () => {
  it('never throws on Vercel production and does not leak values', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY });
    expect(reportServerEnv()).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_FROM_EMAIL'));
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining(REAL_KEY));
  });

  it('only logs elsewhere, so the API can answer with 503', () => {
    setEnv({ NODE_ENV: 'production' });
    expect(reportServerEnv()).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
  });

  it('stays silent when the configuration is complete', () => {
    setEnv({
      VERCEL_ENV: 'production',
      RESEND_API_KEY: REAL_KEY,
      RESEND_FROM_EMAIL: SENDER,
      IP_HASH_SALT: SECRET,
      APPLICATION_TOKEN_SECRET: SECRET,
    });
    expect(reportServerEnv()).toEqual({ ok: true });
    expect(console.error).not.toHaveBeenCalled();
  });
});
