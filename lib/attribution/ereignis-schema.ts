import 'server-only';
import { z } from 'zod';
import { isApplicationJobId, type ApplicationJobId } from '@/lib/applications/constants';
import { CONTACT_STEP, JOB_STEP } from '@/lib/apply/flow';
import { jobIdFromParam } from '@/lib/apply/params';
import { isAnswerKey } from '@/lib/apply/questions';
import { ALL_JOBS } from '@/lib/jobs/registry';
import { ACQUISITION_CHANNELS, type AcquisitionChannel } from './channel';
import { EREIGNIS_TEXT_MAX, FEHLER_ARTEN, type EreignisName, type FehlerArt } from './ereignisse';

/**
 * Strenge Prüfung der Ereignisse auf dem Server (POST /api/e). Nur bekannte Namen, ein fester Kanal, ein Schritt des
 * Flows, eine Fehlerart; fremde Felder lehnen das Ereignis ab. `stelle` wird auf eine Stellen-ID abgebildet (ID,
 * Slug oder alter Slug aus dem Registry) und fällt sonst weg: So steht nie freier Text im Log.
 */

const kurzerText = z.string().trim().min(1).max(EREIGNIS_TEXT_MAX);
const kanal = z.enum(ACQUISITION_CHANNELS);
const stelle = kurzerText.optional();

const ereignisSchema = z.discriminatedUnion('ereignis', [
  z.strictObject({ ereignis: z.enum(['flow_start', 'abgesendet', 'whatsapp_klick', 'telefon_klick']), kanal, stelle }),
  z.strictObject({
    ereignis: z.literal('schritt'),
    kanal,
    stelle,
    schritt: kurzerText.refine((value) => value === JOB_STEP || value === CONTACT_STEP || isAnswerKey(value)),
  }),
  z.strictObject({ ereignis: z.literal('fehler'), kanal, stelle, fehler: z.enum(FEHLER_ARTEN) }),
]);

/** Das geprüfte Ereignis, wie es ins Log geht. */
export interface GeprueftesEreignis {
  ereignis: EreignisName;
  kanal: AcquisitionChannel;
  stelle?: ApplicationJobId;
  schritt?: string;
  fehler?: FehlerArt;
}

/** Alle Stellen des Registry (auch beendete, deren Seite noch erreichbar ist) für die Zuordnung von `stelle`. */
const STELLEN = ALL_JOBS.map((job) => ({ id: job.id, slug: job.slug, legacySlugs: job.redirectFrom }));

/** Stellen-ID zu einer ID, einem Slug oder einem alten Slug; „initiativ“ zählt mit. Unbekanntes ergibt undefined. */
export function stelleZuId(value: string | undefined): ApplicationJobId | undefined {
  const id = jobIdFromParam(value, STELLEN);
  return isApplicationJobId(id) ? id : undefined;
}

/** Prüft den Body; ungültig → null (Antwort 400, nichts im Log). */
export function parseEreignis(input: unknown): GeprueftesEreignis | null {
  const parsed = ereignisSchema.safeParse(input);
  if (!parsed.success) return null;
  const { stelle: rohStelle, ...rest } = parsed.data;
  const id = stelleZuId(rohStelle);
  return { ...rest, ...(id ? { stelle: id } : {}) };
}
