import { COMPANY, FACTS, isFactActive, type FactId } from '@/lib/content';
import { applyUrl, jobMetaTags, jobUrl, payLabel } from '@/lib/jobs/format';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { getHubKreise, getKreise, getKreisPlaces, getPublishedPlaces, kreisUrl, placeUrl } from '@/lib/places/registry';
import { MEASUREMENT_NOTE } from '@/lib/places/text';
import { einsatzgebietPages, themenPages } from '@/lib/seo/indexable-pages';
import { getThemen } from '@/lib/themen/registry';
import { themaKarte } from '@/lib/themen/text';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Shared building blocks for /llms.txt and /llms-full.txt. Everything comes from the job
 * registry and the fact registry, so the files can never claim more than the site does.
 */

export const TEXT_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8' };

export const baseUrl = () => SITE_CONFIG.baseUrl.replace(/\/+$/, '');

/** Live published jobs in registry order. */
export function liveJobs(now: Date): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

/** Selectable in the flow, but without page, schema or feed (status funnel_only). */
export function funnelOnlyJobs(): Job[] {
  return getFunnelOptions()
    .filter((option) => option.status === 'funnel_only')
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);
}

/**
 * Company-wide statements; pending (unconfirmed) and expired facts are skipped. Pay, contract,
 * Hilti kit and workwear came back with E-SEO-014 (all backed, not pending); pay on request with E-030.
 */
const EMPLOYER_FACT_IDS: readonly FactId[] = [
  'founded1926',
  'employees15',
  'payOnRequest',
  'aboveTariff',
  'permanentContract',
  'flexibleHours',
  'vacation30',
  'hilti',
  'workwear',
  'radius35',
  'noFarAssembly',
  'partners5',
];

/**
 * Who the company is, for the lead sentence: until the end of the anniversary year
 * „100 Jahre Meisterbetrieb (1926–2026)“ (fact `anniversary100`, validUntil), then
 * „Meisterbetrieb seit 1926“.
 */
export function companyClaim(now: Date): string {
  return isFactActive('anniversary100', now) ? FACTS.anniversary100.short : FACTS.founded1926.short;
}

/** Chamber and guild, as in the imprint („Handwerkskammer Wiesbaden, Innung …“). */
export function chamberLine(): string {
  return `${COMPANY.hwk}, ${COMPANY.innung}`;
}

export function employerFacts(now: Date): string[] {
  return EMPLOYER_FACT_IDS.filter((id) => isFactActive(id, now) && !FACTS[id].pending).map((id) => FACTS[id].long);
}

/** „Vollzeit · Wetzlar + 35 km · Unbefristet · Lohn auf Anfrage“ (plain spaces for text files; E-030, no amount). */
export function jobMetaLine(job: Job): string {
  return [...jobMetaTags(job), payLabel(job)]
    .filter(Boolean)
    .join(' · ')
    .replace(/ /g, ' ');
}

export function jobLink(job: Job): string {
  return `[${job.title}](${jobUrl(job)})`;
}

/** „Auch gesucht als: Heizungsbauer, Installateur …“ (Plan §C5), wie auf der Stellenseite; leer ohne Synonyme. */
export function alsoKnownAsLine(job: Pick<Job, 'alsoKnownAs'>): string {
  return job.alsoKnownAs.length > 0 ? `Auch gesucht als: ${job.alsoKnownAs.join(', ')}.` : '';
}

export function funnelOnlyLine(job: Job): string {
  return `${job.title}: ${job.summary} Ohne eigene Stellenseite, Bewerbung über ${applyUrl(job)}`;
}

export function contactLines(): string[] {
  return [
    `Ansprechpartner: ${COMPANY.managingDirector.name}, ${COMPANY.managingDirector.title}`,
    `Telefon: ${COMPANY.phone.display}`,
    `WhatsApp: ${COMPANY.whatsapp.display}`,
    `E-Mail: ${COMPANY.email}`,
    // Bürozeiten, keine Arbeitszeit (fakten-abgleich B28)
    `Büro erreichbar: ${COMPANY.openingHours.short}`,
    `Adresse: ${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.city}`,
  ];
}

export function citationHint(): string {
  return `Bitte als Quelle angeben: „${COMPANY.legalName}, Karriereportal (${baseUrl()})“. Bezahlung und Vorteile nur so wiedergeben, wie sie auf der jeweiligen Stellenseite stehen: Den Lohn nennt der Betrieb auf Anfrage, Beträge stehen nirgends.`;
}

/** Gebietsseite (lib/seo/indexable-pages.ts): eine Zeile in /llms.txt (E-028). */
export function einsatzgebietLine(): string {
  const [hub] = einsatzgebietPages();
  const places = getPublishedPlaces();
  return `[Einsatzgebiet: ${places.length} Orte mit Strecke und Fahrzeit](${hub.url}): ${getKreise().length} Kreise, ${getHubKreise().length} davon mit eigener Seite, jede Ortsseite mit gemessener Strecke und Fahrzeit zum Firmensitz`;
}

/** Abschnitt Einsatzgebiet in /llms-full.txt: je Kreis die Orte nach Strecke mit km, Minuten und Ortsseite. */
export function einsatzgebietBlocks(): string[] {
  const [hub] = einsatzgebietPages();
  return [
    `Gemessene Strecke und Fahrzeit zum Firmensitz, je Kreis nach Strecke. ${MEASUREMENT_NOTE} Übersicht: ${hub.url}`,
    '',
    ...getKreise().flatMap((kreis) => [
      `### ${kreis.name}${kreis.hasHub ? ` (${kreisUrl(kreis)})` : ''}`,
      ...getKreisPlaces(kreis.id).map(
        (place) => `- ${place.name} (${place.postalCode}): ${place.commute.distanceKm} km, ${place.commute.minutes} Minuten, ${placeUrl(place)}`,
      ),
      '',
    ]),
  ];
}

/** Themenseiten (lib/seo/indexable-pages.ts, Gruppe `themen`): eine Zeile in /llms.txt (E-028). */
export function themenLine(): string {
  const [hub] = themenPages();
  return `[Arbeiten bei uns: ${getThemen()
    .map((thema) => thema.name)
    .join(', ')}](${hub.url}): je Thema eine Seite, nur mit belegten Angaben`;
}

/** Abschnitt Arbeiten bei uns in /llms-full.txt: je Thema die Seite und ihr belegter Kernsatz (wie auf dem Hub). */
export function themenBlocks(now: Date): string[] {
  const [hub, ...seiten] = themenPages(now);
  const jobs = liveJobs(now);
  return [
    `Übersicht: ${hub.url}`,
    '',
    ...getThemen().map((thema, i) => {
      const karte = themaKarte(thema.id, { jobs, now });
      // Klammer als Fließtext („gegründet 1926“), nicht Wert und Etikett aneinander („1926 Gegründet“)
      const wert = karte.klammer ? ` (${karte.klammer})` : '';
      return `- ${thema.name}${wert}: ${karte.satz.text} ${seiten[i].url}`.replace(/\u00A0/g, ' ');
    }),
    '',
  ];
}
