import { parseEreignis } from '@/lib/attribution/ereignis-schema';
import { funnelEventsEnabled } from '@/lib/env';
import { checkRateLimits, guardErrorResponse, guardJsonPost, jsonError, utcDay, type RateLimitRule } from '@/lib/security';

/** Ein Ereignis ist ein paar Dutzend Byte; mehr ist kein Ereignis. */
const MAX_BYTES = 1024;
/** Je IP-Hash (nur im Arbeitsspeicher, täglich neuer Schlüssel): Ein Flow sendet rund zehn Ereignisse. */
const LIMIT_JE_NETZ: readonly RateLimitRule[] = [
  { limit: 30, windowMs: 60 * 1000 },
  { limit: 300, windowMs: 24 * 60 * 60 * 1000 },
];
/** Höchstens 600 Log-Zeilen pro Minute und Instanz, damit gefälschte Ereignisse die Logs nicht fluten (wie /api/csp-report). */
const LOG_LIMIT: readonly RateLimitRule[] = [{ limit: 600, windowMs: 60 * 1000 }];
const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * sendBeacon schickt den Body als Text (Chrome lehnt bei sendBeacon den Typ application/json ab). Für die gemeinsame
 * Eingangskontrolle gilt er als JSON; jeder andere Typ bleibt, wie er ist, und scheitert dort mit 415.
 */
function alsJson(request: Request): Request {
  const typ = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (typ !== 'text/plain') return request;
  const headers = new Headers(request.headers);
  headers.set('content-type', 'application/json');
  return new Request(request, { headers });
}

/**
 * POST /api/e: cookielose Ereignisse des Bewerbungsflows (lib/attribution/ereignisse.ts). Nur mit FUNNEL_EVENTS=true,
 * sonst 404 wie ein Endpunkt, den es nicht gibt. Reihenfolge wie bei den Formular-APIs: Herkunft (CSRF), Rate-Limit
 * je IP-Hash, Typ und Größe (guardJsonPost), dann die strenge Prüfung (ereignis-schema.ts).
 *
 * Gespeichert wird nichts außer einer Log-Zeile mit Tag (UTC), Ereignis, Kanal und gegebenenfalls Stelle, Schritt
 * oder Fehlerart: keine Kennung, keine IP, kein User-Agent, kein Referrer. Das Zählen je Tag übernimmt später
 * Supabase (E-012); bis dahin lassen sich die Zeilen aus den Logs zählen.
 */
export async function POST(request: Request) {
  if (!funnelEventsEnabled()) return new Response(null, { status: 404, headers: NO_STORE });

  const guard = await guardJsonPost(alsJson(request), { scope: 'ereignis', rateLimit: LIMIT_JE_NETZ, maxBytes: MAX_BYTES });
  if (!guard.ok) return guardErrorResponse(guard);

  const ereignis = parseEreignis(guard.data);
  if (!ereignis) return jsonError(400, 'VALIDATION_FAILED');

  const { allowed } = await checkRateLimits('ereignis-log', LOG_LIMIT);
  if (allowed) console.info(`[ereignis] ${JSON.stringify({ tag: utcDay(new Date()), ...ereignis })}`);

  return new Response(null, { status: 204, headers: NO_STORE });
}
