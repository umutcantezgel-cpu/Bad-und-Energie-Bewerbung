import { z } from 'zod';
import { FACT_IDS, FACTS } from '@/lib/content/facts';
import { TEAM_QUOTE_IDS } from '@/lib/content/team';

/**
 * Job-Domänenmodell (ROADMAP §3.2). Jede Stelle wird in lib/jobs/data/*.ts mit
 * defineJob() angelegt und beim Laden des Moduls validiert.
 * Neue Stelle: ID hier ergänzen, Datei anlegen, in registry.ts eintragen.
 */
export const JOB_IDS = [
  'anlagenmechaniker-shk',
  'kundendiensttechniker-shk',
  'obermonteur-projektleiter-shk',
  'ausbildung-anlagenmechaniker-shk',
  'quereinsteiger-montagehelfer',
] as const;
export type JobId = (typeof JOB_IDS)[number];

const SOFT_HYPHEN = /\u00AD/g;
const HAS_YEAR = /\b(?:19|20)\d{2}\b/;
/** Jahre ab 2000; „seit 1926“ ist eine feste Angabe und läuft nicht ab. */
const RECENT_YEARS = /\b20\d{2}\b/g;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

/** Datum oder Datum-Zeit ohne Offset wird als UTC gelesen, damit Tests überall gleich laufen. */
export function parseJobDate(value: string): number {
  if (ISO_DATE.test(value)) return Date.parse(`${value}T00:00:00Z`);
  if (/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return Date.parse(value);
  return Date.parse(`${value}Z`);
}

const slug = z.string().regex(SLUG, 'Slug: nur a–z, 0–9 und einzelne Bindestriche');
const isoDate = z
  .string()
  .regex(ISO_DATE, 'Datum im Format JJJJ-MM-TT')
  .refine((v) => !Number.isNaN(parseJobDate(v)), 'Ungültiges Datum');
const isoDateTime = z
  .string()
  .regex(ISO_DATE_TIME, 'Datum (JJJJ-MM-TT) oder ISO-Zeitpunkt')
  .refine((v) => !Number.isNaN(parseJobDate(v)), 'Ungültiges Datum');

export const JobStatusSchema = z.enum(['published', 'funnel_only', 'draft', 'archived']);
export const JobCategorySchema = z.enum(['anlagenmechaniker', 'kundendienst', 'projektleitung', 'ausbildung', 'helfer']);
export const QuestionSetSchema = z.enum(['fachkraft', 'ausbildung', 'quereinstieg']);
export const SalaryUnitSchema = z.enum(['MONTH', 'HOUR', 'YEAR']);
export const EmploymentKindSchema = z.enum(['vollzeit', 'teilzeit', 'ausbildung']);
/** Werte, die Google für credentialCategory akzeptiert. */
export const CredentialCategorySchema = z.enum([
  'high school',
  'associate degree',
  'bachelor degree',
  'professional certificate',
  'postgraduate degree',
]);

export const SeoSchema = z.object({
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(50).max(155),
  h1: z.string().min(5).max(90),
  primaryKeyword: z.string().min(3),
  secondaryKeywords: z.array(z.string().min(3)).default([]),
});

export const EmploymentSchema = z.object({
  kind: EmploymentKindSchema,
  permanent: z.boolean(),
  start: z.union([z.literal('sofort'), z.literal('nach-absprache'), isoDate]),
  durationMonths: z.number().int().positive().optional(),
});

export const SalarySchema = z
  .object({
    min: z.number().positive(),
    max: z.number().positive(),
    unit: SalaryUnitSchema,
    currency: z.literal('EUR').default('EUR'),
  })
  .refine((s) => s.min <= s.max, { message: 'salary.min muss ≤ salary.max sein', path: ['max'] });

export const JobLocationSchema = z.object({
  street: z.string().min(3),
  postalCode: z.string().regex(/^\d{5}$/),
  city: z.string().min(2),
  region: z.string().min(2),
  country: z.literal('DE'),
  radiusKm: z.number().positive(),
});

export const EducationSchema = z.object({
  credentialCategory: CredentialCategorySchema,
  label: z.string().min(3),
});

/** „Dein Paket“: rollenbezogene Extras aus dem bisherigen Gehaltsrechner. */
export const PackageExtraSchema = z.object({
  label: z.string().min(2).max(30),
  text: z.string().min(5),
});

export const ChannelsSchema = z.object({
  googleJobs: z.boolean(),
  indeedFeed: z.boolean(),
  genericFeed: z.boolean(),
  ba: z.boolean(),
});

export const JobSchema = z
  .object({
    id: z.enum(JOB_IDS),
    referenceCode: z.string().regex(/^SHK-[A-Z]{2}-\d{4}-\d{2}$/, 'Referenz wie SHK-WP-2026-01'),
    slug,
    redirectFrom: z.array(slug).default([]),
    status: JobStatusSchema,
    category: JobCategorySchema,
    title: z.string().min(5).max(90).regex(/\(m\/w\/d\)/, 'Titel braucht „(m/w/d)“'),
    titleShy: z.string().min(5),
    shortTitle: z.string().min(3).max(40),
    seo: SeoSchema,
    summary: z.string().min(20).max(200),
    intro: z.string().min(40),
    tasks: z.array(z.string().min(5)).min(1),
    requirements: z.array(z.string().min(5)).min(1),
    benefitFactIds: z.array(z.enum(FACT_IDS)).min(1),
    packageExtras: z.array(PackageExtraSchema).default([]),
    employment: EmploymentSchema,
    salary: SalarySchema.optional(),
    location: JobLocationSchema,
    education: EducationSchema.optional(),
    experienceMonths: z.number().int().min(0).optional(),
    datePosted: isoDate,
    validThrough: isoDateTime.optional(),
    updatedAt: isoDate,
    apply: z.object({ questionSet: QuestionSetSchema }),
    channels: ChannelsSchema,
    ba: z.object({ berufenetId: z.string().min(1).optional() }).optional(),
    teamQuoteId: z.enum(TEAM_QUOTE_IDS).optional(),
  })
  .superRefine((job, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });

    if (job.titleShy.replace(SOFT_HYPHEN, '') !== job.title) {
      issue(['titleShy'], 'titleShy muss ohne weiche Trennstriche (\\u00AD) exakt title entsprechen');
    }
    // Google-Richtlinie für JobPosting: keine Daten im Titel (gilt auch für die Feeds).
    if (HAS_YEAR.test(job.title)) issue(['title'], 'Titel ohne Jahreszahl; das Jahr gehört in seo.metaTitle oder seo.h1');
    if (job.validThrough) {
      // Ein Text wie „Ausbildung 2026“ darf nicht über das genannte Jahr hinaus ausgeschrieben bleiben.
      const lastYear = new Date(parseJobDate(job.validThrough)).getUTCFullYear();
      const texts: [(string | number)[], string][] = [
        [['seo', 'metaTitle'], job.seo.metaTitle],
        [['seo', 'metaDescription'], job.seo.metaDescription],
        [['seo', 'h1'], job.seo.h1],
        [['summary'], job.summary],
        [['intro'], job.intro],
        ...job.seo.secondaryKeywords.map((keyword, i): [(string | number)[], string] => [['seo', 'secondaryKeywords', i], keyword]),
      ];
      for (const [path, text] of texts) {
        for (const [year] of text.matchAll(RECENT_YEARS)) {
          if (Number(year) < lastYear) {
            issue(path, `nennt ${year}, die Stelle läuft aber bis ${lastYear}; validThrough spätestens Ende ${year}`);
          }
        }
      }
    }
    if (job.redirectFrom.includes(job.slug)) issue(['redirectFrom'], 'redirectFrom darf den aktuellen Slug nicht enthalten');
    if (new Set(job.benefitFactIds).size !== job.benefitFactIds.length) issue(['benefitFactIds'], 'Fakt-IDs doppelt');

    job.benefitFactIds.forEach((factId, i) => {
      const fact = FACTS[factId];
      if (fact.validUntil) {
        issue(['benefitFactIds', i], `Fakt „${factId}“ ist befristet und gehört nicht in statische Stellentexte`);
      }
      if (fact.pending && !fact.pending.onlyForJobIds.includes(job.id)) {
        issue(['benefitFactIds', i], `Fakt „${factId}“ wartet auf Owner-Bestätigung: ${fact.pending.note}`);
      }
    });

    if (job.employment.kind === 'ausbildung') {
      if (!job.employment.durationMonths) issue(['employment', 'durationMonths'], 'Ausbildung braucht durationMonths');
      if (job.employment.permanent) issue(['employment', 'permanent'], 'Ausbildung ist nicht unbefristet');
    }

    if (job.status === 'published') {
      if (!job.validThrough) issue(['validThrough'], 'Veröffentlichte Stellen brauchen validThrough');
      if (!job.salary) issue(['salary'], 'Veröffentlichte Stellen zeigen eine Gehaltsspanne (Owner-Entscheidung)');
    }
    if (job.validThrough && parseJobDate(job.validThrough) <= parseJobDate(job.datePosted)) {
      issue(['validThrough'], 'validThrough muss nach datePosted liegen');
    }
    if (parseJobDate(job.updatedAt) < parseJobDate(job.datePosted)) {
      issue(['updatedAt'], 'updatedAt darf nicht vor datePosted liegen');
    }
    if (job.status === 'funnel_only' && Object.values(job.channels).some(Boolean)) {
      issue(['channels'], 'funnel_only-Stellen erscheinen in keinem Kanal');
    }
  });

export type JobInput = z.input<typeof JobSchema>;
export type Job = z.output<typeof JobSchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
export type JobCategory = z.infer<typeof JobCategorySchema>;
export type QuestionSet = z.infer<typeof QuestionSetSchema>;
export type SalaryUnit = z.infer<typeof SalaryUnitSchema>;
export type EmploymentKind = z.infer<typeof EmploymentKindSchema>;
export type JobLocation = z.infer<typeof JobLocationSchema>;
export type PackageExtra = z.infer<typeof PackageExtraSchema>;
export type JobChannel = keyof Job['channels'];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

/** Validiert eine Stelle beim Laden des Moduls; ein Fehler bricht Build und Tests ab. */
export function defineJob(input: JobInput): Job {
  const result = JobSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Ungültige Stelle „${String(input.id)}“:\n${z.prettifyError(result.error)}`);
  }
  return deepFreeze(result.data);
}
