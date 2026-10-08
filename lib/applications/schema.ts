import { z } from 'zod';

import { JOB_IDS } from '@/lib/jobs/schema';

/**
 * Shared contract between the application flow (client), the Bewerbungsmappe
 * tool and the intake API. Changing a field here changes all three.
 */

export const INITIATIVE_JOB_ID = 'initiativ' as const;
export const applicationJobIdSchema = z.enum([...JOB_IDS, INITIATIVE_JOB_ID] as const);
export type ApplicationJobId = z.infer<typeof applicationJobIdSchema>;

export const CONTACT_CHANNELS = ['whatsapp', 'phone', 'email'] as const;
export const contactChannelSchema = z.enum(CONTACT_CHANNELS);
export type ContactChannel = z.infer<typeof contactChannelSchema>;

/** Answer keys per question set; values are the option ids defined in lib/apply/questions.ts. */
export const applicationAnswersSchema = z
  .object({
    qualification: z.string().max(60).optional(),
    schoolStatus: z.string().max(60).optional(),
    background: z.string().max(60).optional(),
    licenseB: z.enum(['yes', 'no']).optional(),
    start: z.string().max(60).optional(),
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
  period: trimmed(60),
  role: trimmed(120),
  company: trimmed(120),
  location: trimmed(120).optional(),
  tasks: z.array(trimmed(200)).max(8).default([]),
});
export const educationStationSchema = z.object({
  period: trimmed(60),
  degree: trimmed(160),
  institution: trimmed(160),
  location: trimmed(120).optional(),
});

/** Structured Bewerbungsmappe (no photo: photos never leave the browser in Phase 1). */
export const mappeSchema = z.object({
  coverLetter: trimmed(6000).default(''),
  skills: z.array(trimmed(120)).max(12).default([]),
  workStyle: trimmed(300).optional(),
  careerStations: z.array(careerStationSchema).max(12).default([]),
  educationStations: z.array(educationStationSchema).max(8).default([]),
});
export type Mappe = z.infer<typeof mappeSchema>;

const phoneSchema = trimmed(40).regex(/^[+()\d\s/-]{6,}$/, 'Bitte gib eine gültige Telefonnummer an.');

export const applicationInputSchema = z
  .object({
    jobId: applicationJobIdSchema,
    answers: applicationAnswersSchema.default({}),
    name: trimmed(100).min(2, 'Bitte gib deinen Namen an.'),
    phone: phoneSchema,
    email: z.union([z.literal(''), z.email('Bitte gib eine gültige E-Mail-Adresse an.').max(254)]).optional(),
    contactChannel: contactChannelSchema.default('whatsapp'),
    mappe: mappeSchema.optional(),
    attribution: attributionSchema.default({}),
    privacyNoticeVersion: trimmed(40),
    idempotencyKey: z.uuid(),
    startedAt: z.number().int().nonnegative().optional(),
    /** Honeypot: must stay empty. */
    website: z.string().max(200).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.contactChannel === 'email' && !value.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Bitte gib deine E-Mail-Adresse an.' });
    }
  });
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

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

export const API_ERROR_CODES = [
  'VALIDATION_FAILED',
  'CSRF_FAILED',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'INVALID_JSON',
  'INVALID_TOKEN',
  'SERVICE_UNAVAILABLE',
  'INTERNAL',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApplicationSubmitResponse =
  | { ok: true; reference: string; followUpToken: string; firstName: string }
  | { ok: false; code: ApiErrorCode; message: string; fieldErrors?: Record<string, string[]>; retryAfterSec?: number };

/** Client-side storage keys (sessionStorage only; never localStorage for personal data). */
export const STORAGE_KEYS = {
  draft: 'be:apply-draft:v1',
  submitted: 'be:application:v1',
  mappe: 'be:mappe:v1',
  /** Pre-redesign localStorage key with personal data; deleted on load. */
  legacyDossier: 'bad_energie_dossier',
} as const;

export const PRIVACY_NOTICE_VERSION = '2026-10';
