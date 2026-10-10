import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from '@/instrumentation';

beforeEach(() => {
  for (const name of ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET', 'EMAIL_SIMULATION', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    vi.stubEnv(name, undefined);
  }
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('instrumentation register()', () => {
  it('keeps the server up on Vercel production without mail config and logs what is missing', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    await expect(register()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/fehlt: RESEND_API_KEY, IP_HASH_SALT, APPLICATION_TOKEN_SECRET/));
  });

  it('skips the Edge runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge');
    await expect(register()).resolves.toBeUndefined();
  });
});
