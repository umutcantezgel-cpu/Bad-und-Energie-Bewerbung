import { FACTS } from '@/lib/content/facts';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import type { Job, SalaryUnit } from './schema';

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

export const SALARY_UNIT_LABEL: Readonly<Record<SalaryUnit, string>> = Object.freeze({
  MONTH: 'Monat',
  HOUR: 'Stunde',
  YEAR: 'Jahr',
});

/** de-DE ohne Intl, damit Server, Browser und Tests identisch formatieren: 3600 → '3.600', 12.5 → '12,50'. */
export function formatNumber(n: number): string {
  const negative = n < 0;
  const [int, dec] = Math.abs(n).toFixed(Number.isInteger(n) ? 0 : 2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

/** '3.600 €' mit geschütztem Leerzeichen vor dem Euro-Zeichen. */
export function formatEuro(n: number): string {
  return `${formatNumber(n)}${NBSP}€`;
}

/** '3.600–4.600 €' oder null. */
export function formatSalaryAmount(job: Pick<Job, 'salary'>): string | null {
  if (!job.salary) return null;
  const { min, max } = job.salary;
  return min === max ? formatEuro(min) : `${formatNumber(min)}–${formatNumber(max)}${NBSP}€`;
}

/** '3.600–4.600 € / Monat' oder null. */
export function formatSalaryRange(job: Pick<Job, 'salary'>): string | null {
  const amount = formatSalaryAmount(job);
  return amount && job.salary ? `${amount} / ${SALARY_UNIT_LABEL[job.salary.unit]}` : null;
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
  ausbildung: 'Ausbildung',
};

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

/** 'Wetzlar + 35 km' */
export function locationLabel(job: Pick<Job, 'location'>): string {
  return `${job.location.city} + ${job.location.radiusKm}${NBSP}km`;
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
  const eckdaten = [
    `Anstellung: ${employmentLabel(job)}`,
    `Start: ${startLabel(job)}`,
    `Einsatzort: ${job.location.street}, ${job.location.postalCode} ${job.location.city}, Baustellen im Umkreis von ${job.location.radiusKm} km`,
  ];
  const salary = formatSalaryRange(job);
  if (salary) eckdaten.unshift(`${job.employment.kind === 'ausbildung' ? 'Vergütung' : 'Gehalt'}: ${salary}`);

  const sections: JobSection[] = [
    { id: 'intro', heading: null, text: job.intro },
    { id: 'aufgaben', heading: 'Das erwartet dich', items: [...job.tasks] },
    { id: 'anforderungen', heading: 'Das bringst du mit', items: [...job.requirements] },
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
