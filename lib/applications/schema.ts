import { z } from 'zod';

import { isValidAnswer } from '@/lib/apply/questions';
import { isPlausiblePhone } from '@/lib/apply/phone';
import {
  APPLICATION_JOB_IDS,
  CONTACT_CHANNELS,
  CONTACT_LIMITS,
  CONTACT_MESSAGES,
  EMAIL_PATTERN,
  HONEYPOT_FIELD,
  MAPPE_SCHEMA_LIMITS as MAPPE,
  PRIVACY_NOTICE_VERSIONS,
  type ApiErrorCode,
} from './constants';

/**
 * Shared contract between the application flow (client), the Bewerbungsmappe
 * tool and the intake API. Changing a field here changes all three.
 *
 * Server only in practice: client modules import types from here with `import type` and
 * constants from ./constants, so zod stays out of the browser bundle
 * (scripts/qa/check-client-imports.mjs).
 */

export * from './constants';

export const applicationJobIdSchema = z.enum(APPLICATION_JOB_IDS);
export const contactChannelSchema = z.enum(CONTACT_CHANNELS);

const INVALID_ANSWER = 'Diese Angabe ist ungültig.';

/** Option id of one question (lib/apply/questions.ts); anything else is rejected. */
const answerSchema = (key: 'qualification' | 'schoolStatus' | 'background' | 'start'): z.ZodOptional<z.ZodString> =>
  z
    .string()
    .max(60)
    .refine((value) => isValidAnswer(key, value), { message: INVALID_ANSWER })
    .optional();

/**
 * Answer keys per question set; values are the option ids defined in lib/apply/questions.ts.
 * Answers outside the job's question set are dropped in normalizeApplication.
 */
export const applicationAnswersSchema = z
  .object({
    qualification: answerSchema('qualification'),
    schoolStatus: answerSchema('schoolStatus'),
    background: answerSchema('background'),
    licenseB: z.enum(['yes', 'no']).optional(),
    start: answerSchema('start'),
  })
  .strict();
export type ApplicationAnswers = z.infer<typeof applicationAnswersSchema>;

const trimmed = (max: number) => z.string().trim().max(max);

export const attributionSchema = z
  .object({
    utmSource: trimmed(100).optional(),
    utmMedium: trimmed(100).optional(),
    utmCampaign: trimmed(100).optional(),
    utmContent: trimmed(100).optional(),
    utmTerm: trimmed(100).optional(),
    ref: trimmed(32).optional(),
    referrerHost: trimmed(253).optional(),
    landingPath: trimmed(300).optional(),
    funnel: trimmed(60).optional(),
  })
  .strict();
export type Attribution = z.infer<typeof attributionSchema>;

export const careerStationSchema = z.object({
  period: trimmed(MAPPE.period),
  role: trimmed(MAPPE.role),
  company: trimmed(MAPPE.company),
  location: trimmed(MAPPE.location).optional(),
  tasks: z.array(trimmed(MAPPE.task)).max(MAPPE.tasks).default([]),
});
export const educationStationSchema = z.object({
  period: trimmed(MAPPE.period),
  degree: trimmed(MAPPE.degree),
  institution: trimmed(MAPPE.institution),
  location: trimmed(MAPPE.location).optional(),
});

/**
 * Structured Bewerbungsmappe (no photo: photos never leave the browser in Phase 1).
 * Browser code checks the same rules without zod: lib/applications/mappe-data.ts.
 */
export const mappeSchema = z.object({
  coverLetter: trimmed(MAPPE.coverLetter).default(''),
  skills: z.array(trimmed(MAPPE.skill)).max(MAPPE.skills).default([]),
  workStyle: trimmed(MAPPE.workStyle).optional(),
  careerStations: z.array(careerStationSchema).max(MAPPE.careerStations).default([]),
  educationStations: z.array(educationStationSchema).max(MAPPE.educationStations).default([]),
});
export type Mappe = z.infer<typeof mappeSchema>;

/** Same rule as the flow (lib/apply/phone.ts): allowed characters and 6–15 digits. */
const phoneSchema = trimmed(CONTACT_LIMITS.phone).refine(isPlausiblePhone, { message: CONTACT_MESSAGES.phone });

export const applicationInputSchema = z
  .object({
    jobId: applicationJobIdSchema,
    answers: applicationAnswersSchema.default({}),
    name: trimmed(CONTACT_LIMITS.name).min(CONTACT_LIMITS.nameMin, CONTACT_MESSAGES.name),
    phone: phoneSchema,
    // Getrimmt wie die übrigen Textfelder: Leerzeichen aus der Autofill-Eingabe sind kein Fehler.
    email: z
      .string()
      .trim()
      .pipe(
        z.union([
          z.literal(''),
          z.email({ pattern: EMAIL_PATTERN, error: CONTACT_MESSAGES.email }).max(CONTACT_LIMITS.email, CONTACT_MESSAGES.email),
        ]),
      )
      .optional(),
    contactChannel: contactChannelSchema.default('whatsapp'),
    mappe: mappeSchema.optional(),
    attribution: attributionSchema.default({}),
    // Nur bekannte Fassungen: Team-Mail und Datensatz zeigen, welchen Hinweis die Person gesehen hat.
    privacyNoticeVersion: z.enum(PRIVACY_NOTICE_VERSIONS),
    idempotencyKey: z.uuid(),
    /**
     * Ausfülldauer laut Client in ms (erste Eingabe bis Absenden, über Reloads im Entwurf
     * gemerkt). Nur ein Spam-Hinweis: Ungültige Werte fallen weg, statt die Bewerbung abzulehnen.
     */
    fillDurationMs: z.number().nonnegative().optional().catch(undefined),
    /** Honeypot: must stay empty. A filled value marks the application as suspected spam. */
    [HONEYPOT_FIELD]: z.string().max(200).optional().catch('honeypot'),
  })
  .superRefine((value, ctx) => {
    if (value.contactChannel === 'email' && !value.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: CONTACT_MESSAGES.emailRequired });
    }
  });
export type ApplicationInput = z.infer<typeof applicationInputSchema>;
/** Payload as the client sends it (before defaults). */
export type ApplicationInputPayload = z.input<typeof applicationInputSchema>;

/** Optional extras sent from the thank-you page or the Mappe tool after submitting. */
export const applicationFollowUpSchema = z
  .object({
    reference: trimmed(20),
    token: trimmed(128),
    startDate: trimmed(100).optional(),
    postalCode: trimmed(10).optional(),
    message: trimmed(3000).optional(),
    mappe: mappeSchema.optional(),
  })
  .strict();
export type ApplicationFollowUp = z.infer<typeof applicationFollowUpSchema>;

export type ApplicationSubmitResponse =
  | { ok: true; reference: string; followUpToken: string; firstName: string }
  | { ok: false; code: ApiErrorCode; message: string; fieldErrors?: Record<string, string[]>; retryAfterSec?: number };
