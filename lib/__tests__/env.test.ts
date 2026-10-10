import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_APP_URL,
  DEFAULT_FROM_EMAIL,
  EnvError,
  cleanEnvValue,
  getApplicationSinkMode,
  getSecretSource,
  getSupabaseServiceConfig,
  resolveIntakeTarget,
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
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'APPLICATION_SINK',
] as const;

const REAL_KEY = 're_Ab3dEf9h_KlMnOpQrStUvWx';
const SENDER = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
const SECRET = 'a'.repeat(64);
const SUPABASE_URL = 'https://ymynacgwkqycjcervixg.supabase.co';
const SB_SECRET = 'sb_secret_' + 'Q'.repeat(32);
const jwt = (role: string) =>
  ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'c2lnbmF0dXJl'].join('.');

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
  vi.spyOn(console, 'info').mockImplementation(() => {});
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

describe('cleanEnvValue', () => {
  it.each([
    ['"re_abc"', 're_abc'],
    ["'re_abc'", 're_abc'],
    ['  "Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>"  ', SENDER],
    ['"Bad und Energie" <x@y.de>', '"Bad und Energie" <x@y.de>'],
    ['"nur links', '"nur links'],
  ])('%j → %j', (raw, cleaned) => {
    expect(cleanEnvValue(raw)).toBe(cleaned);
  });
});

describe('getEmailConfig', () => {
  it('uses the default recipient and the default sender on karriere.bad-energie.de', () => {
    setEnv({ RESEND_API_KEY: REAL_KEY });
    const config = getEmailConfig();
    expect(config.from).toBe(DEFAULT_FROM_EMAIL);
    expect(config.from).toContain('@karriere.bad-energie.de>');
    expect(config.fromSource).toBe('default');
    expect(config.notificationTo).toBe('info@bad-energie.de');
    expect(config.missing).toEqual([]);
    expect(JSON.stringify(config)).not.toContain('resend.dev');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('reports a missing API key in production builds', async () => {
    vi.resetModules();
    const fresh = await import('@/lib/env');
    setEnv({ NODE_ENV: 'production', RESEND_FROM_EMAIL: SENDER });
    const config = fresh.getEmailConfig();
    expect(config.apiKey).toBeUndefined();
    expect(config.missing).toEqual(['RESEND_API_KEY']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
  });

  it('reports missing variables on Vercel production by name only', async () => {
    vi.resetModules();
    const fresh = await import('@/lib/env');
    setEnv({ NODE_ENV: 'production', VERCEL_ENV: 'production', RESEND_API_KEY: 're_123456789' });
    const config = fresh.getEmailConfig();
    expect(config.missing).toEqual(['RESEND_API_KEY']);
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
      fromSource: 'env',
      notificationTo: 'team@bad-energie.de',
      forceSimulation: false,
      missing: [],
    });
  });

  it('accepts values pasted with surrounding quotes', () => {
    setEnv({ RESEND_API_KEY: `"${REAL_KEY}"`, RESEND_FROM_EMAIL: `"${SENDER}"` });
    expect(getEmailConfig()).toMatchObject({ apiKey: REAL_KEY, from: SENDER, fromSource: 'env', missing: [] });
  });

  it('rejects keys with invisible characters instead of failing later in the Resend client', () => {
    setEnv({ RESEND_API_KEY: `${REAL_KEY}\u200b` });
    expect(getEmailConfig().apiKey).toBeUndefined();
  });

  it('falls back to the default sender for an invalid one and reads the legacy recipient name', () => {
    setEnv({ NODE_ENV: 'production', RESEND_FROM_EMAIL: 'kein absender', RESEND_TO_EMAIL: 'alt@bad-energie.de' });
    const config = getEmailConfig();
    expect(config.from).toBe(DEFAULT_FROM_EMAIL);
    expect(config.fromSource).toBe('default');
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

  it('derives separate secrets from the Resend key when no own value is set (also on Vercel production)', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY });
    const salt = getSecret('IP_HASH_SALT');
    const token = getSecret('APPLICATION_TOKEN_SECRET');
    expect(salt).toMatch(/^[0-9a-f]{64}$/);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(salt).not.toBe(token);
    expect(salt).not.toContain(REAL_KEY);
    expect(getSecretSource('IP_HASH_SALT')).toBe('derived');
    // stabil über Aufrufe und Instanzen
    expect(getSecret('IP_HASH_SALT')).toBe(salt);
  });

  it('prefers an own value and also derives when the own value is too short', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, IP_HASH_SALT: SECRET, APPLICATION_TOKEN_SECRET: 'zu-kurz' });
    expect(getSecret('IP_HASH_SALT')).toBe(SECRET);
    expect(getSecretSource('IP_HASH_SALT')).toBe('env');
    expect(getSecretSource('APPLICATION_TOKEN_SECRET')).toBe('derived');
  });

  it('derives from a Supabase server key, never from a publishable or anon key', () => {
    setEnv({ VERCEL_ENV: 'production', SUPABASE_SECRET_KEY: SB_SECRET });
    expect(getSecretSource('IP_HASH_SALT')).toBe('derived');
    setEnv({ SUPABASE_SECRET_KEY: undefined, SUPABASE_SERVICE_ROLE_KEY: jwt('anon') });
    expect(getSecretSource('IP_HASH_SALT')).toBe('missing');
    setEnv({ SUPABASE_SERVICE_ROLE_KEY: jwt('service_role') });
    expect(getSecretSource('IP_HASH_SALT')).toBe('derived');
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

describe('getSupabaseServiceConfig', () => {
  it('reads the URL and the secret key, including the names of the Vercel integration', () => {
    expect(getSupabaseServiceConfig()).toBeNull();
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: `${SUPABASE_URL}/`, SUPABASE_SERVICE_ROLE_KEY: jwt('service_role') });
    expect(getSupabaseServiceConfig()).toEqual({
      url: SUPABASE_URL,
      secretKey: jwt('service_role'),
      keyKind: 'service_role_jwt',
      projectRef: 'ymynacgwkqycjcervixg',
    });
    setEnv({ SUPABASE_URL: SUPABASE_URL, SUPABASE_SECRET_KEY: `"${SB_SECRET}"` });
    expect(getSupabaseServiceConfig()).toMatchObject({ secretKey: SB_SECRET, keyKind: 'secret' });
  });

  it('ignores publishable and anon keys and placeholder URLs', () => {
    setEnv({ SUPABASE_URL: SUPABASE_URL, SUPABASE_SECRET_KEY: 'sb_publishable_abcdefghijklmnopqrstuvwxyz' });
    expect(getSupabaseServiceConfig()).toBeNull();
    setEnv({ SUPABASE_SECRET_KEY: jwt('anon') });
    expect(getSupabaseServiceConfig()).toBeNull();
    setEnv({ SUPABASE_URL: 'https://your-project.supabase.co', SUPABASE_SECRET_KEY: SB_SECRET });
    expect(getSupabaseServiceConfig()).toBeNull();
  });

  it('requires https on Vercel production', () => {
    setEnv({ SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_SECRET_KEY: SB_SECRET });
    expect(getSupabaseServiceConfig()).toMatchObject({ url: 'http://127.0.0.1:54321' });
    setEnv({ VERCEL_ENV: 'production' });
    expect(getSupabaseServiceConfig()).toBeNull();
  });
});

describe('resolveIntakeTarget', () => {
  it('uses the database automatically only on Vercel production', () => {
    setEnv({ SUPABASE_URL: SUPABASE_URL, SUPABASE_SECRET_KEY: SB_SECRET });
    expect(getApplicationSinkMode()).toBe('auto');
    expect(resolveIntakeTarget()).toEqual({ kind: 'email', reason: 'not_production' });
    setEnv({ VERCEL_ENV: 'preview' });
    expect(resolveIntakeTarget()).toEqual({ kind: 'email', reason: 'not_production' });
    setEnv({ VERCEL_ENV: 'production' });
    expect(resolveIntakeTarget()).toMatchObject({ kind: 'supabase', config: { projectRef: 'ymynacgwkqycjcervixg' } });
  });

  it('can be forced with APPLICATION_SINK and switched off with APPLICATION_SINK=email', () => {
    setEnv({ SUPABASE_URL: SUPABASE_URL, SUPABASE_SECRET_KEY: SB_SECRET, APPLICATION_SINK: 'supabase' });
    expect(resolveIntakeTarget().kind).toBe('supabase');
    setEnv({ VERCEL_ENV: 'production', APPLICATION_SINK: 'email' });
    expect(resolveIntakeTarget()).toEqual({ kind: 'email', reason: 'mode_email' });
  });

  it('stays with e-mail when Supabase is not configured', () => {
    setEnv({ VERCEL_ENV: 'production', APPLICATION_SINK: 'supabase', SUPABASE_URL: SUPABASE_URL });
    expect(resolveIntakeTarget()).toEqual({ kind: 'email', reason: 'not_configured' });
  });
});

describe('checkServerEnv', () => {
  it('fails on Vercel production when required variables are missing', () => {
    setEnv({ VERCEL_ENV: 'production', APP_URL: 'nope' });
    const result = checkServerEnv();
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['RESEND_API_KEY', 'IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET']);
    expect(result.invalid).toEqual(['APP_URL']);
  });

  it('passes on Vercel production with only the Resend key (sender and secrets have fallbacks)', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY });
    expect(checkServerEnv()).toEqual({ ok: true, missing: [], invalid: [] });
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
      missing: ['RESEND_API_KEY', 'IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET'],
      invalid: [],
    });
    setEnv({ EMAIL_SIMULATION: 'true', ALLOW_DEV_SECRETS: 'true' });
    expect(checkServerEnv().ok).toBe(true);
  });

  it('reports a publishable key in the secret-key variable as invalid', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, SUPABASE_SERVICE_ROLE_KEY: jwt('anon') });
    expect(checkServerEnv()).toEqual({ ok: false, missing: [], invalid: ['SUPABASE_SERVICE_ROLE_KEY'] });
  });

  it('names missing Supabase parts when APPLICATION_SINK=supabase', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, APPLICATION_SINK: 'supabase' });
    expect(checkServerEnv()).toEqual({ ok: false, missing: ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'], invalid: [] });
  });
});

describe('reportServerEnv', () => {
  it('never throws on Vercel production and does not leak values', () => {
    setEnv({ VERCEL_ENV: 'production', IP_HASH_SALT: SECRET, RESEND_FROM_EMAIL: SENDER });
    expect(reportServerEnv()).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('abgelehnt (503)'));
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining(SECRET));
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

  it('names fallbacks and the intake target in one info line, without values', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, SUPABASE_URL: SUPABASE_URL, SUPABASE_SECRET_KEY: SB_SECRET });
    expect(reportServerEnv()).toEqual({ ok: true });
    const line = String(vi.mocked(console.info).mock.calls.at(-1)?.[0]);
    expect(line).toContain('Bewerbungen: Supabase (ymynacgwkqycjcervixg, Secret Key) und E-Mail');
    expect(line).toContain('IP_HASH_SALT abgeleitet aus RESEND_API_KEY');
    expect(line).toContain('Absender: Standard');
    expect(line).not.toContain(REAL_KEY);
    expect(line).not.toContain(SB_SECRET);
  });

  it('does not claim 503 when only an optional value is invalid', () => {
    setEnv({ VERCEL_ENV: 'production', RESEND_API_KEY: REAL_KEY, CONTACT_NOTIFICATION_EMAIL: 'a@b.de, c@d.de' });
    expect(reportServerEnv()).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Ersatzwerte aktiv'));
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('503'));
  });
});
