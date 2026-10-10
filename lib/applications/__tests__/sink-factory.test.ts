import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailSink, getApplicationSink, setApplicationSinkForTests } from '@/lib/applications/sink';
import { setSupabaseIntakeForTests } from '@/lib/supabase/service';
import { SupabaseSink } from '@/lib/supabase/sink';

const SUPABASE_URL = 'https://ymynacgwkqycjcervixg.supabase.co';
const SB_SECRET = 'sb_secret_' + 'Q'.repeat(32);

beforeEach(() => {
  for (const name of ['VERCEL_ENV', 'APPLICATION_SINK', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    vi.stubEnv(name, '');
  }
  setApplicationSinkForTests(null);
  setSupabaseIntakeForTests(null);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  setApplicationSinkForTests(null);
  setSupabaseIntakeForTests(null);
});

describe('getApplicationSink', () => {
  it('uses the EmailSink without Supabase configuration', () => {
    expect(getApplicationSink()).toBeInstanceOf(EmailSink);
    expect(getApplicationSink()).toBe(getApplicationSink());
  });

  it('uses the SupabaseSink on Vercel production when Supabase is configured', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SUPABASE_URL', SUPABASE_URL);
    vi.stubEnv('SUPABASE_SECRET_KEY', SB_SECRET);
    const sink = getApplicationSink();
    expect(sink).toBeInstanceOf(SupabaseSink);
    expect(getApplicationSink()).toBe(sink);
  });

  it('keeps preview deployments on e-mail unless APPLICATION_SINK=supabase', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('SUPABASE_URL', SUPABASE_URL);
    vi.stubEnv('SUPABASE_SECRET_KEY', SB_SECRET);
    expect(getApplicationSink()).toBeInstanceOf(EmailSink);
    vi.stubEnv('APPLICATION_SINK', 'supabase');
    expect(getApplicationSink()).toBeInstanceOf(SupabaseSink);
  });

  it('switches the database off with APPLICATION_SINK=email', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SUPABASE_URL', SUPABASE_URL);
    vi.stubEnv('SUPABASE_SECRET_KEY', SB_SECRET);
    vi.stubEnv('APPLICATION_SINK', 'email');
    expect(getApplicationSink()).toBeInstanceOf(EmailSink);
  });

  it('logs once when APPLICATION_SINK=supabase lacks configuration and stays with e-mail', () => {
    vi.stubEnv('APPLICATION_SINK', 'supabase');
    expect(getApplicationSink()).toBeInstanceOf(EmailSink);
    getApplicationSink();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('APPLICATION_SINK=supabase'));
  });
});
