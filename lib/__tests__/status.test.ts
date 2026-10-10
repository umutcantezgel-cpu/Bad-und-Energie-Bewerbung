import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/status/route';
import { getStatusReport, PROBE_TTL_MS, resetStatusProbeForTests } from '@/lib/status';
import type { IntakeRpc } from '@/lib/supabase/rpc';
import { CircuitBreaker, setSupabaseIntakeForTests } from '@/lib/supabase/service';

const REAL_KEY = 're_Ab3dEf9h_KlMnOpQrStUvWx';
const SUPABASE_URL = 'https://ymynacgwkqycjcervixg.supabase.co';
const SB_SECRET = 'sb_secret_' + 'Q'.repeat(32);
const MANAGED = [
  'VERCEL_ENV',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'IP_HASH_SALT',
  'APPLICATION_TOKEN_SECRET',
  'EMAIL_SIMULATION',
  'ALLOW_DEV_SECRETS',
  'APPLICATION_SINK',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAPS_API_KEY',
];

function useFakeDatabase(probe: IntakeRpc['probe']) {
  const rpc = { submitApplication: vi.fn(), submitFollowUp: vi.fn(), probe: vi.fn(probe) };
  // Gleiche Signatur wie getSupabaseIntake sie für diese Konfiguration bildet, damit sie greift.
  setSupabaseIntakeForTests(null);
  vi.stubEnv('SUPABASE_URL', SUPABASE_URL);
  vi.stubEnv('SUPABASE_SECRET_KEY', SB_SECRET);
  return rpc;
}

beforeEach(() => {
  for (const name of MANAGED) vi.stubEnv(name, '');
  vi.stubEnv('NODE_ENV', 'production');
  resetStatusProbeForTests();
  setSupabaseIntakeForTests(null);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  setSupabaseIntakeForTests(null);
});

describe('getStatusReport', () => {
  it('reports the live situation of 2026-10-10 honestly: no secrets, no key → not ok', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const report = await getStatusReport();
    expect(report).toEqual({
      ok: false,
      environment: 'production',
      email: { status: 'not_configured', sender: 'default', senderDomain: 'karriere.bad-energie.de' },
      secrets: { ipHashSalt: 'missing', applicationTokenSecret: 'missing' },
      applications: { target: 'email', reason: 'not_configured' },
      maps: { configured: false },
    });
  });

  it('is ok on production with only the Resend key (default sender, derived secrets)', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', REAL_KEY);
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'AIzaSyA3' + 'x'.repeat(31));
    const report = await getStatusReport();
    expect(report).toMatchObject({
      ok: true,
      email: { status: 'ready', sender: 'default' },
      secrets: { ipHashSalt: 'derived', applicationTokenSecret: 'derived' },
      maps: { configured: true },
    });
    expect(JSON.stringify(report)).not.toContain(REAL_KEY);
  });

  it('probes the database when it is the target and caches the result', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', REAL_KEY);
    useFakeDatabase(async () => ({ ok: true, data: 'ok' }));
    const { getSupabaseIntake } = await import('@/lib/supabase/service');
    const intake = getSupabaseIntake()!;
    const probe = vi.fn<IntakeRpc['probe']>(async () => ({ ok: true, data: 'ok' }));
    setSupabaseIntakeForTests({ ...intake, rpc: { ...intake.rpc, probe }, breaker: new CircuitBreaker() });

    const first = await getStatusReport(1_000);
    expect(first).toMatchObject({ ok: true, applications: { target: 'supabase', database: 'ok' } });
    await getStatusReport(1_000 + PROBE_TTL_MS - 1);
    expect(probe).toHaveBeenCalledTimes(1);

    probe.mockResolvedValue({ ok: false, kind: 'misconfigured', status: 401 });
    const later = await getStatusReport(1_000 + PROBE_TTL_MS + 1);
    expect(later).toMatchObject({ ok: false, applications: { target: 'supabase', database: 'misconfigured' } });
    expect(JSON.stringify(later)).not.toContain(SB_SECRET);
  });

  it('shows simulation in local production builds with EMAIL_SIMULATION=true', async () => {
    vi.stubEnv('EMAIL_SIMULATION', 'true');
    vi.stubEnv('ALLOW_DEV_SECRETS', 'true');
    expect(await getStatusReport()).toMatchObject({
      ok: true,
      environment: 'other',
      email: { status: 'simulated' },
      secrets: { ipHashSalt: 'dev', applicationTokenSecret: 'dev' },
    });
  });
});

describe('GET /api/status', () => {
  it('answers 503 with no-store when applications cannot be accepted, 200 otherwise', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const down = await GET();
    expect(down.status).toBe(503);
    expect(down.headers.get('cache-control')).toBe('no-store');

    vi.stubEnv('RESEND_API_KEY', REAL_KEY);
    const up = await GET();
    expect(up.status).toBe(200);
    expect(await up.json()).toMatchObject({ ok: true });
  });
});
