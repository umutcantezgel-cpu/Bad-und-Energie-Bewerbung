import { parseCspReports } from '@/lib/security/csp-report';
import { checkRateLimits } from '@/lib/security/rate-limit';
import { readJsonBody } from '@/lib/security/request';

export const dynamic = 'force-dynamic';

const CONTENT_TYPES = ['application/csp-report', 'application/reports+json', 'application/json'];
const MAX_BYTES = 16 * 1024;
// Höchstens 60 Log-Zeilen pro Minute und Instanz, damit gefälschte Meldungen die Logs nicht fluten.
const LOG_LIMIT = [{ limit: 60, windowMs: 60_000 }];

/** Sammelt CSP-Meldungen der Report-Only-Phase (ROADMAP §9.5) als kompakte Log-Zeilen. */
export async function POST(request: Request) {
  const body = await readJsonBody(request, { maxBytes: MAX_BYTES, contentTypes: CONTENT_TYPES });
  if (!body.ok) return new Response(null, { status: body.status });

  for (const violation of parseCspReports(body.data)) {
    const { allowed } = await checkRateLimits('csp-report', LOG_LIMIT);
    if (!allowed) break;
    console.warn(`[csp] ${violation.disposition} ${violation.directive} blockiert ${violation.blocked} auf ${violation.page}`);
  }

  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
