// Läuft einmal pro Serverinstanz vor dem ersten Request (nicht während `next build`).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { reportServerEnv } = await import('@/lib/env');
  reportServerEnv();
}
