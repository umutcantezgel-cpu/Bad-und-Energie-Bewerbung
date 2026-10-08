import { randomBytes } from 'node:crypto';

import { germanIssueMessage, apiError, apiSuccess, guardFailureResponse, validationFailedResponse } from '@/lib/applications/http';
import { firstNameOf, normalizeApplication } from '@/lib/applications/normalize';
import { createReference } from '@/lib/applications/reference';
import { applicationInputSchema, type ApplicationSubmitResponse } from '@/lib/applications/schema';
import { getApplicationSink } from '@/lib/applications/sink';
import { assertFollowUpTokenSecret, createFollowUpToken } from '@/lib/applications/token';
import { EnvError } from '@/lib/env';
import { guardJsonPost, RATE_LIMITS } from '@/lib/security';

/**
 * POST /api/bewerbung (Vertrag C8). Reihenfolge:
 * Eingangskontrolle (CSRF, Rate-Limit, Content-Type, Body-Cap) → Honeypot → Schema →
 * Normalisierung (Stelle aus dem Registry, Telefon E.164, Kanal) → Sink (E-Mail) → Token.
 * Erfolg nur, wenn die Team-Mail angenommen wurde. Logs enthalten keine personenbezogenen Daten.
 */

type SuccessBody = Extract<ApplicationSubmitResponse, { ok: true }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHoneypotHit(body: unknown): boolean {
  return isRecord(body) && typeof body.website === 'string' && body.website.trim() !== '';
}

/** Für Bots: sieht aus wie ein Erfolg, es wird aber nichts versendet oder gespeichert. */
function decoyResponse(body: unknown, now: Date) {
  const name = isRecord(body) && typeof body.name === 'string' ? body.name : '';
  const issued = Math.floor(now.getTime() / 1000).toString(36);
  return apiSuccess<SuccessBody>({
    ok: true,
    reference: createReference(now),
    followUpToken: `${issued}.${randomBytes(32).toString('base64url')}`,
    firstName: firstNameOf(name).slice(0, 50),
  });
}

export async function POST(request: Request) {
  try {
    const guard = await guardJsonPost(request, { scope: 'application', rateLimit: RATE_LIMITS.applicationSubmit });
    if (!guard.ok) return guardFailureResponse(guard);

    const now = new Date();
    if (isHoneypotHit(guard.data)) {
      console.warn('[bewerbung] Honeypot ausgelöst, nichts versendet');
      return decoyResponse(guard.data, now);
    }

    const parsed = applicationInputSchema.safeParse(guard.data, { error: germanIssueMessage });
    if (!parsed.success) return validationFailedResponse(parsed.error);

    // Ohne Token-Geheimnis gäbe es nach dem Versand kein Ergänzungs-Token: vorher ehrlich 503.
    assertFollowUpTokenSecret();

    const application = normalizeApplication(parsed.data, { now });
    const result = await getApplicationSink().submit(application);
    if (!result.ok) {
      console.error(`[bewerbung] nicht zugestellt (${result.reason})`);
      return apiError(result.reason === 'not_configured' ? 'SERVICE_UNAVAILABLE' : 'INTERNAL');
    }

    const flags = [application.suspectedSpam && 'Spamverdacht', result.duplicate && 'Wiederholung'].filter(Boolean);
    console.info(
      `[bewerbung] eingegangen ${result.reference} (${application.job.id}, ${application.channel}${flags.length ? `, ${flags.join(', ')}` : ''})`,
    );

    return apiSuccess<SuccessBody>({
      ok: true,
      reference: result.reference,
      followUpToken: createFollowUpToken(result.reference, now),
      firstName: application.firstName,
    });
  } catch (err: unknown) {
    if (err instanceof EnvError) {
      console.error(`[bewerbung] nicht konfiguriert: ${err.variable}`);
      return apiError('SERVICE_UNAVAILABLE');
    }
    console.error(`[bewerbung] Fehler: ${err instanceof Error ? err.name : 'unknown'}`);
    return apiError('INTERNAL');
  }
}
