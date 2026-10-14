import { z } from 'zod';
import { FACT_IDS, FACTS } from '@/lib/content/facts';
import { TEAM_QUOTE_IDS } from '@/lib/content/team';

import { ISCO_CODES, KLDB_CODES, KLDB_ZU_ISCO } from './berufe';
import { JOB_IDS, type JobId } from './ids';

/**
 * Job-Domänenmodell (ROADMAP §3.2). Jede Stelle wird in lib/jobs/data/*.ts mit
 * defineJob() angelegt und beim Laden des Moduls validiert.
 * Neue Stelle: ID in lib/jobs/ids.ts ergänzen, Datei anlegen, in registry.ts eintragen.
 */
export { JOB_IDS, type JobId };

const SOFT_HYPHEN = /\u00AD/g;
const HAS_YEAR = /\b(?:19|20)\d{2}\b/;
/** Jahre ab 2000; „seit 1926“ ist eine feste Angabe und läuft nicht ab. */
const RECENT_YEARS = /\b20\d{2}\b/g;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Frische (Plan §C3): Eine veröffentlichte Stelle läuft höchstens 90 Tage über ihren letzten Stand (`updatedAt`) hinaus.
 * Verlängert wird mit neuem `updatedAt` und neuem `validThrough`, nie mit einem neuen `datePosted`.
 */
export const MAX_VALID_DAYS = 90;

/** Ein Euro-Betrag („3.600 €“, „1.050–1.400 €“, „€ 12,50“, „15 Euro“): E-030, kein Betrag in Stellentexten. */
export const EURO_AMOUNT = /\d[\d.,]*\s*(?:[–-]\s*\d[\d.,]*\s*)?(?:€|Euro\b|EUR\b)|(?:€|\bEUR)\s*\d/;

/** Ein Wort zu Geld: Das Schülerpraktikum nennt nichts davon (Inhaber 2026-10-14, fakten-abgleich S4). */
export const MONEY_WORDS = /€|\bEuro\b|\bEUR\b|Lohn|Löhne|Gehalt|Gehälter|Vergütung|verdien|bezahl|Tarif|Prämie|Zuschuss|Geld/i;

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
export const JobCategorySchema = z.enum([
  'anlagenmechaniker',
  'kundendienst',
  'projektleitung',
  'ausbildung',
  'helfer',
  'buero',
  'praktikum',
]);
export const QuestionSetSchema = z.enum(['fachkraft', 'ausbildung', 'quereinstieg', 'buero']);
export const SalaryUnitSchema = z.enum(['MONTH', 'HOUR', 'YEAR']);
/** `voll-oder-teilzeit`: eine Stelle, die beides anbietet (JobPosting FULL_TIME und PART_TIME). */
export const EmploymentKindSchema = z.enum(['vollzeit', 'teilzeit', 'voll-oder-teilzeit', 'ausbildung', 'praktikum']);
/**
 * Bezahlung (E-030, Inhaber 2026-10-14): „Lohn auf Anfrage“ bei allen Stellen (`auf-anfrage`); nur das
 * Schülerpraktikum sagt gar nichts zu Geld (`keine-angabe`). Umkehr von E-030: ein Wert `spanne`, der `salary` verlangt.
 */
export const PaySchema = z.enum(['auf-anfrage', 'keine-angabe']);
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
  /** Dauer in Worten, nur beim Praktikum („nach Absprache mit deiner Schule“). */
  durationNote: z.string().min(5).optional(),
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
  /** Baustellen im Umkreis; fehlt, wenn die Arbeit nur am Firmensitz liegt (Büro). */
  radiusKm: z.number().positive().optional(),
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

/**
 * Beruf nach amtlichen Schlüsseln (Plan §C2, Quellen in lib/jobs/berufe.ts): KldB 2010 immer, ISCO-08 genau dann, wenn
 * der Umsteigeschlüssel der BA eindeutig ist, die BERUFENET-ID nur nachgeschlagen (sonst weglassen, nie schätzen).
 */
export const BerufSchema = z.object({
  kldb: z.enum(KLDB_CODES),
  isco: z.enum(ISCO_CODES).optional(),
  berufenetId: z.string().regex(/^\d+$/, 'BERUFENET-ID: nur Ziffern').optional(),
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
    /** Leer nur, solange `requirementsOpen` auf die offene Frage zeigt (M-038): dann ohne Abschnitt „Das bringst du mit“. */
    requirements: z.array(z.string().min(5)).default([]),
    /** Anforderungen noch nicht belegt: Eintrag in _relaunch/MENSCHEN.md („M-038“). Nichts erfinden (K-012). */
    requirementsOpen: z.string().regex(/^M-\d{3}$/, 'Verweis auf MENSCHEN.md wie „M-038“').optional(),
    /** Sichtbare Synonyme für die Suche („Auch gesucht als: …“, Plan §C5), nur übliche Berufsbezeichnungen. */
    alsoKnownAs: z.array(z.string().min(3)).default([]),
    benefitFactIds: z.array(z.enum(FACT_IDS)).min(1),
    packageExtras: z.array(PackageExtraSchema).default([]),
    employment: EmploymentSchema,
    pay: PaySchema,
    /** Nur für die Umkehr von E-030; solange PaySchema keine Spanne kennt, lehnt das Schema jedes salary ab. */
    salary: SalarySchema.optional(),
    location: JobLocationSchema,
    education: EducationSchema.optional(),
    experienceMonths: z.number().int().min(0).optional(),
    datePosted: isoDate,
    validThrough: isoDateTime.optional(),
    updatedAt: isoDate,
    apply: z.object({ questionSet: QuestionSetSchema }),
    channels: ChannelsSchema,
    beruf: BerufSchema,
    /**
     * Nachfolger einer Ausschreibung mit Jahr („Ausbildung 2026“ → „Ausbildung 2027“): Die Stelle endet geplant mit
     * `validThrough`, die Nachfolgerin übernimmt. Geprüft in registry.ts (gleiche Art, veröffentlicht, läuft länger).
     */
    nachfolger: z.enum(JOB_IDS).optional(),
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
    if (job.employment.kind === 'praktikum') {
      if (!job.employment.durationNote) issue(['employment', 'durationNote'], 'Praktikum braucht die Dauer in Worten (durationNote)');
      if (job.employment.durationMonths) issue(['employment', 'durationMonths'], 'Praktikum: Dauer nur in Worten, nach Absprache');
      if (job.employment.permanent) issue(['employment', 'permanent'], 'Praktikum ist nicht unbefristet');
      if (job.category !== 'praktikum') issue(['category'], 'Ein Praktikum gehört in die Kategorie praktikum');
    } else if (job.employment.durationNote) {
      issue(['employment', 'durationNote'], 'durationNote nur beim Praktikum');
    }

    // E-030: Lohn auf Anfrage, nirgends ein Betrag. Nur das Praktikum sagt gar nichts zu Geld, und nur es darf das.
    if (job.salary) issue(['salary'], 'Kein Gehalt als Betrag (E-030: Lohn auf Anfrage bei allen Stellen)');
    if (job.pay === 'keine-angabe' && job.employment.kind !== 'praktikum') {
      issue(['pay'], 'pay „keine-angabe“ nur beim Schülerpraktikum, sonst „auf-anfrage“');
    }
    if (job.employment.kind === 'praktikum' && job.pay !== 'keine-angabe') {
      issue(['pay'], 'Schülerpraktikum: kein Wort zu Geld (pay „keine-angabe“)');
    }
    const stellenTexte: [(string | number)[], string][] = [
      [['seo', 'metaTitle'], job.seo.metaTitle],
      [['seo', 'metaDescription'], job.seo.metaDescription],
      [['seo', 'h1'], job.seo.h1],
      [['summary'], job.summary],
      [['intro'], job.intro],
      ...job.tasks.map((text, i): [(string | number)[], string] => [['tasks', i], text]),
      ...job.requirements.map((text, i): [(string | number)[], string] => [['requirements', i], text]),
      ...job.packageExtras.map((extra, i): [(string | number)[], string] => [['packageExtras', i], `${extra.label}: ${extra.text}`]),
      ...job.benefitFactIds.map((id, i): [(string | number)[], string] => [['benefitFactIds', i], `${FACTS[id].short} ${FACTS[id].long}`]),
    ];
    for (const [path, text] of stellenTexte) {
      if (EURO_AMOUNT.test(text)) issue(path, 'nennt einen Euro-Betrag (E-030: Lohn auf Anfrage)');
      if (job.pay === 'keine-angabe' && MONEY_WORDS.test(text)) issue(path, 'Schülerpraktikum: kein Wort zu Geld');
    }

    if ((job.requirements.length === 0) !== (job.requirementsOpen !== undefined)) {
      issue(['requirements'], 'Anforderungen fehlen genau dann, wenn requirementsOpen auf die offene Frage zeigt (nichts erfinden)');
    }

    // ISCO-08 nur aus dem Umsteigeschlüssel der BA: eindeutig oder gar nicht.
    const isco = KLDB_ZU_ISCO[job.beruf.kldb];
    if ((job.beruf.isco ?? null) !== isco) {
      issue(['beruf', 'isco'], `ISCO-08 zu KldB ${job.beruf.kldb} laut Umsteigeschlüssel: ${isco ?? 'keiner (nicht eindeutig)'}`);
    }

    if (job.nachfolger !== undefined) {
      if (job.nachfolger === job.id) issue(['nachfolger'], 'Eine Stelle ist nicht ihr eigener Nachfolger');
      if (!job.validThrough) issue(['nachfolger'], 'Eine abgelöste Stelle braucht validThrough (ihr geplantes Ende)');
    }

    if (job.status === 'published') {
      if (!job.validThrough) issue(['validThrough'], 'Veröffentlichte Stellen brauchen validThrough');
      else if (parseJobDate(job.validThrough) - parseJobDate(job.updatedAt) > MAX_VALID_DAYS * DAY_MS) {
        issue(['validThrough'], `validThrough höchstens ${MAX_VALID_DAYS} Tage nach updatedAt (Frische, Plan §C3)`);
      }
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
export type Pay = z.infer<typeof PaySchema>;
export type Beruf = z.infer<typeof BerufSchema>;
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
