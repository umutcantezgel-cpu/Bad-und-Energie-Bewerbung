import { attributionSchema, type Attribution } from '@/lib/applications/schema';
import { sanitizeAttribution } from './sanitize';

/**
 * Attribution auf dem Server: derselbe zod-Vertrag wie im Bewerbungs-Payload
 * (`attributionSchema` aus lib/applications/schema.ts), danach bereinigt.
 * Client-Code importiert stattdessen ./sanitize (ohne zod, für ein kleines Bundle).
 */

export { attributionSchema };
export type { Attribution };
export {
  ATTRIBUTION_KEYS,
  ATTRIBUTION_LIMITS,
  isEmptyAttribution,
  sanitizeAttribution,
  sanitizeHost,
  sanitizePath,
  sanitizeToken,
} from './sanitize';

/** Ungültige Eingaben (fremde Felder, zu lang, kein Objekt) ergeben eine leere Attribution statt eines Fehlers. */
export function parseAttribution(input: unknown): Attribution {
  const parsed = attributionSchema.safeParse(input ?? {});
  return parsed.success ? sanitizeAttribution(parsed.data) : {};
}
