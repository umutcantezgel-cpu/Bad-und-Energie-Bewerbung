import { FACTS } from '@/lib/content/facts';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import type { Job } from './schema';

const NBSP = '\u00A0';
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/** de-DE ohne Intl, damit Server, Browser und Tests identisch formatieren: 3600 → '3.600', 12.5 → '12,50'. */
export function formatNumber(n: number): string {
  const negative = n < 0;
  const [int, dec] = Math.abs(n).toFixed(Number.isInteger(n) ? 0 : 2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

/**
 * Der eine Text zur Bezahlung (E-030, Fakt payOnRequest): „Lohn auf Anfrage“, auf Seite, in Schema-Beschreibung, Feeds
 * und Teilen-Bildern gleich. Nirgends steht ein Betrag.
 */
export const PAY_ON_REQUEST = FACTS.payOnRequest.short;

/** „Lohn auf Anfrage“; null beim Schülerpraktikum, das gar nichts zu Geld sagt (pay „keine-angabe“). */
export function payLabel(job: Pick<Job, 'pay'>): string | null {
  return job.pay === 'auf-anfrage' ? PAY_ON_REQUEST : null;
}

function formatDuration(months: number): string {
  if (months % 12 === 0) return months === 12 ? '1 Jahr' : `${months / 12} Jahre`;
  if (months % 6 === 0) return `${formatNumber(months / 12).replace(/,50$/, ',5')} Jahre`;
  return `${months} Monate`;
}

function formatGermanDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

const KIND_LABEL: Record<Job['employment']['kind'], string> = {
  vollzeit: 'Vollzeit',
  teilzeit: 'Teilzeit',
  'voll-oder-teilzeit': 'Voll- oder Teilzeit',
  ausbildung: 'Ausbildung',
  praktikum: 'Praktikum',
};

/** Kurzname je Stellenart für Aufzählungen in Meta-Texten („Anlagenmechaniker, Kundendienst, …“). */
export const JOB_CATEGORY_LABEL: Readonly<Record<Job['category'], string>> = Object.freeze({
  anlagenmechaniker: 'Anlagenmechaniker',
  kundendienst: 'Kundendienst',
  projektleitung: 'Obermonteur',
  ausbildung: 'Ausbildung',
  helfer: 'Quereinstieg',
  buero: 'Büro',
  praktikum: 'Praktikum',
});

/** Kurznamen der Stellenarten in Reihenfolge der Stellen, ohne Dopplungen. */
export function jobCategoryLabels(jobs: readonly Pick<Job, 'category'>[]): string[] {
  return [...new Set(jobs.map((job) => JOB_CATEGORY_LABEL[job.category]))];
}

/** 'Vollzeit · Unbefristet' bzw. 'Ausbildung · 3,5 Jahre'. */
export function employmentLabel(job: Pick<Job, 'employment'>): string {
  const { kind, permanent, durationMonths } = job.employment;
  const parts = [KIND_LABEL[kind]];
  if (durationMonths) parts.push(formatDuration(durationMonths));
  else if (permanent) parts.push('Unbefristet');
  return parts.join(' · ');
}

/** 'Ab sofort', 'Nach Absprache' oder 'Ab 1. August 2026'. */
export function startLabel(job: Pick<Job, 'employment'>): string {
  const { start } = job.employment;
  if (start === 'sofort') return 'Ab sofort';
  if (start === 'nach-absprache') return 'Nach Absprache';
  return `Ab ${formatGermanDate(start)}`;
}

/** 'Wetzlar + 35 km', ohne Baustellenradius (Büro) nur 'Wetzlar'. */
export function locationLabel(job: Pick<Job, 'location'>): string {
  const { city, radiusKm } = job.location;
  return radiusKm ? `${city} + ${radiusKm}${NBSP}km` : city;
}

/** Meta-Zeile im Seitenkopf: Vollzeit · Wetzlar + 35 km · Unbefristet. */
export function jobMetaTags(job: Pick<Job, 'employment' | 'location'>): string[] {
  const { kind, permanent, durationMonths } = job.employment;
  const tags = [KIND_LABEL[kind], locationLabel(job)];
  if (durationMonths) tags.push(formatDuration(durationMonths));
  else if (permanent) tags.push('Unbefristet');
  return tags;
}

const baseUrl = () => SITE_CONFIG.baseUrl.replace(/\/+$/, '');

export function jobPath(job: Pick<Job, 'slug'>): string {
  return `/jobs/${job.slug}`;
}

export function jobUrl(job: Pick<Job, 'slug'>): string {
  return `${baseUrl()}${jobPath(job)}`;
}

export function applyPath(job: Pick<Job, 'slug'>): string {
  return `/bewerbung?stelle=${encodeURIComponent(job.slug)}`;
}

export function applyUrl(job: Pick<Job, 'slug'>): string {
  return `${baseUrl()}${applyPath(job)}`;
}

export type JobSectionId = 'intro' | 'aufgaben' | 'anforderungen' | 'vorteile' | 'paket' | 'eckdaten' | 'bewerben';

export interface JobSection {
  id: JobSectionId;
  heading: string | null;
  text?: string;
  items?: string[];
}

/**
 * Sichtbare Abschnitte einer Stellenseite in fester Reihenfolge.
 * Seite, JSON-LD-Beschreibung und Feeds bauen darauf auf, damit der Inhalt überall gleich ist.
 */
export function getJobSections(job: Job): JobSection[] {
  const { street, postalCode, city, radiusKm } = job.location;
  const eckdaten = [
    // E-030: „Lohn: auf Anfrage“, nie ein Betrag; das Schülerpraktikum sagt nichts zu Geld.
    ...(job.pay === 'auf-anfrage' ? ['Lohn: auf Anfrage'] : []),
    `Anstellung: ${employmentLabel(job)}`,
    `Start: ${startLabel(job)}`,
    ...(job.employment.durationNote ? [`Dauer: ${job.employment.durationNote}`] : []),
    radiusKm
      ? `Einsatzort: ${street}, ${postalCode} ${city}, Baustellen im Umkreis von ${radiusKm} km`
      : `Arbeitsort: ${street}, ${postalCode} ${city}`,
  ];

  const sections: JobSection[] = [
    { id: 'intro', heading: null, text: job.intro },
    { id: 'aufgaben', heading: 'Das erwartet dich', items: [...job.tasks] },
    // Ohne belegte Anforderungen (requirementsOpen, M-038) kein Abschnitt: nichts erfinden.
    ...(job.requirements.length > 0
      ? [{ id: 'anforderungen', heading: 'Das bringst du mit', items: [...job.requirements] } satisfies JobSection]
      : []),
    { id: 'vorteile', heading: 'Das bekommst du', items: job.benefitFactIds.map((id) => FACTS[id].long) },
  ];
  if (job.packageExtras.length > 0) {
    sections.push({
      id: 'paket',
      heading: 'Dein Paket',
      items: job.packageExtras.map((extra) => `${extra.label}: ${extra.text}`),
    });
  }
  sections.push(
    { id: 'eckdaten', heading: 'Auf einen Blick', items: eckdaten },
    { id: 'bewerben', heading: null, text: `${FACTS.apply60s.long} ${FACTS.noCvNeeded.long}` },
  );
  return sections;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Klartext für Feeds und Vorschauen, Listen mit Spiegelstrich. */
export function toPlainDescription(job: Job): string {
  return getJobSections(job)
    .map((section) => {
      const lines: string[] = [];
      if (section.heading) lines.push(section.heading);
      if (section.text) lines.push(section.text);
      if (section.items) lines.push(...section.items.map((item) => `– ${item}`));
      return lines.join('\n');
    })
    .join('\n\n');
}

/** Escaptes HTML (p, strong, ul, li) für JobPosting.description und Feeds. */
export function toHtmlDescription(job: Job): string {
  return getJobSections(job)
    .map((section) => {
      let html = section.heading ? `<p><strong>${escapeHtml(section.heading)}</strong></p>` : '';
      if (section.text) html += `<p>${escapeHtml(section.text)}</p>`;
      if (section.items) html += `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      return html;
    })
    .join('');
}
