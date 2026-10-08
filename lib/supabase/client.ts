import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client for Client Components.
 * Protected by Row-Level Security (RLS) policies.
 */
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.');
  }

  return createBrowserClient(url, publishableKey);
}
