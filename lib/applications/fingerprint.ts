import 'server-only';
import { createHash } from 'node:crypto';

import type { NormalizedApplication } from './types';

/**
 * Alle Angaben einer Bewerbung außer Nummer, Eingangszeit, Ausfülldauer und Spam-Markierung:
 * Diese ändern sich bei jeder Wiederholung, die Bewerbung selbst nicht. Grundlage für die
 * Resend-Keys (lib/email/resend.ts) und den Idempotenz-Speicher des EmailSink.
 */
export function applicationContent(app: NormalizedApplication): unknown[] {
  return [
    app.idempotencyKey,
    app.job.id,
    app.answers,
    app.name,
    app.phone.raw,
    app.email ?? '',
    app.contactChannel,
    app.mappe ?? null,
    app.attribution,
    app.privacyNoticeVersion,
  ];
}

/** Kurzer Hash über applicationContent: gleiche Angaben → gleicher Wert, auf jeder Instanz. */
export function applicationContentHash(app: NormalizedApplication): string {
  return createHash('sha256').update(JSON.stringify(applicationContent(app))).digest('hex').slice(0, 32);
}
