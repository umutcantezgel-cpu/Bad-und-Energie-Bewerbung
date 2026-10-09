import type { Attribution } from '@/lib/applications/schema';

/**
 * Kanal einer Bewerbung (ROADMAP §3.2, §7), serverseitig aus der Attribution abgeleitet.
 * Rein und ohne Datenimporte; die Reihenfolge der Regeln in deriveChannel() ist die Priorität.
 * UTM-Konventionen: lib/jobs/feeds/tracking.ts (`utm_medium=jobboard`) und
 * docs/operations/stellenboersen.md (`utm_source=arbeitsagentur|hwk|indeed|jobs-xml|jobs-json`).
 */

export const ACQUISITION_CHANNELS = [
  'google_jobs',
  'indeed',
  'arbeitsagentur',
  'hwk',
  'meta_ads',
  'tiktok_ads',
  'google_ads',
  'referral',
  'talentpool_alert',
  'jobboard',
  'organic_search',
  'social',
  'direct',
  'other',
] as const;
export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];

/** Anzeige in der Team-E-Mail und später im Cockpit. */
export const CHANNEL_LABELS: Readonly<Record<AcquisitionChannel, string>> = Object.freeze({
  google_jobs: 'Google for Jobs',
  indeed: 'Indeed',
  arbeitsagentur: 'Bundesagentur für Arbeit',
  hwk: 'HWK-Lehrstellenbörse',
  meta_ads: 'Meta-Anzeige (Facebook/Instagram)',
  tiktok_ads: 'TikTok-Anzeige',
  google_ads: 'Google-Anzeige',
  referral: 'Empfehlung',
  talentpool_alert: 'Job-Alarm (Talent-Pool)',
  jobboard: 'Jobbörse oder Feed',
  organic_search: 'Suchmaschine',
  social: 'Social Media',
  direct: 'Direkt',
  other: 'Sonstige',
});

export function isAcquisitionChannel(value: unknown): value is AcquisitionChannel {
  return typeof value === 'string' && (ACQUISITION_CHANNELS as readonly string[]).includes(value);
}

const PAID_MEDIA = new Set([
  'cpc',
  'ppc',
  'cpm',
  'cpv',
  'paid',
  'paid_social',
  'paid-social',
  'paidsocial',
  'paid_search',
  'paid-search',
  'paidsearch',
  'sem',
  'ads',
  'ad',
  'display',
  'retargeting',
]);

const GOOGLE_JOBS_SOURCES = new Set(['google_jobs_apply', 'google_jobs', 'google-jobs']);
const INDEED_SOURCES = new Set(['indeed']);
const BA_SOURCES = new Set(['arbeitsagentur', 'ba', 'jobboerse', 'jobboerse-arbeitsagentur', 'bundesagentur']);
const HWK_SOURCES = new Set(['hwk', 'lehrstellenboerse', 'hwk-lehrstellenboerse', 'lehrstellen-radar']);
const META_SOURCES = new Set(['meta', 'facebook', 'fb', 'instagram', 'ig', 'messenger', 'audience_network']);
const TIKTOK_SOURCES = new Set(['tiktok', 'tt', 'tiktok_ads', 'tiktok-ads']);
const GOOGLE_SOURCES = new Set(['google', 'adwords', 'google_ads', 'google-ads', 'youtube']);
const GOOGLE_ADS_SOURCES = new Set(['adwords', 'google_ads', 'google-ads']);
const TALENTPOOL_SOURCES = new Set(['talentpool', 'talent-pool', 'talent_pool', 'jobalarm', 'job-alarm', 'job_alarm', 'job_alert']);
const TALENTPOOL_MEDIA = new Set(['talentpool', 'talentpool_alert', 'jobalarm', 'job-alarm', 'job_alarm', 'job_alert']);
const JOBBOARD_MEDIA = new Set(['jobboard', 'job-board', 'job_board', 'jobboerse', 'feed', 'aggregator']);
const SOCIAL_SOURCES = new Set([
  ...META_SOURCES,
  ...TIKTOK_SOURCES,
  'linkedin',
  'xing',
  'youtube',
  'whatsapp',
  'twitter',
  'x',
  'threads',
  'pinterest',
  'snapchat',
  'reddit',
]);
const SOCIAL_MEDIA = new Set(['social', 'social-media', 'social_media', 'socialmedia', 'organic_social', 'organic-social']);

/** Suchmaschinen am Referrer-Host (ohne UTM). */
const SEARCH_ENGINES = ['google', 'bing', 'duckduckgo', 'ecosia', 'yahoo', 'startpage', 'qwant', 'yandex', 'baidu', 'search.brave'];
/** Soziale Netzwerke und Messenger am Referrer-Host (ohne UTM). */
const SOCIAL_HOSTS = [
  'facebook.com',
  'fb.com',
  'fb.me',
  'instagram.com',
  'tiktok.com',
  'linkedin.com',
  'lnkd.in',
  'xing.com',
  'youtube.com',
  'youtu.be',
  'whatsapp.com',
  'wa.me',
  't.co',
  'x.com',
  'twitter.com',
  'threads.net',
  'pinterest.com',
  'reddit.com',
  'snapchat.com',
];

/** Host endet auf `domain` (exakt oder als Subdomain). */
function hostIs(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/** Registrierbarer Name ohne TLD-Vergleich: „www.google.de“, „google.co.uk“ → enthält Label „google“. */
function hostHasLabel(host: string, label: string): boolean {
  if (label.includes('.')) return host === label || host.endsWith(`.${label}`) || host.includes(`.${label}.`) || host.startsWith(`${label}.`);
  return host.split('.').includes(label);
}

function isSearchEngine(host: string): boolean {
  return SEARCH_ENGINES.some((engine) => hostHasLabel(host, engine));
}

function isSocialHost(host: string): boolean {
  return SOCIAL_HOSTS.some((domain) => hostIs(host, domain));
}

function normalized(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/**
 * Kanal aus UTM-Parametern, Empfehlungscode und Referrer-Host. Explizite Quellen (UTM) gehen
 * vor dem Referrer; ohne jedes Signal ist die Bewerbung „direct“.
 */
export function deriveChannel(attribution: Attribution | null | undefined): AcquisitionChannel {
  const source = normalized(attribution?.utmSource);
  const medium = normalized(attribution?.utmMedium);
  const ref = normalized(attribution?.ref);
  const host = normalized(attribution?.referrerHost).replace(/^www\./, '');
  const paid = PAID_MEDIA.has(medium);
  const hasUtm = Boolean(
    source || medium || attribution?.utmCampaign || attribution?.utmContent || attribution?.utmTerm,
  );

  // 1. Stellenbörsen und Google for Jobs (UTM oder eindeutiger Referrer)
  if (GOOGLE_JOBS_SOURCES.has(source)) return 'google_jobs';
  if (INDEED_SOURCES.has(source) || (!hasUtm && hostHasLabel(host, 'indeed'))) return 'indeed';
  if (BA_SOURCES.has(source) || (!hasUtm && hostIs(host, 'arbeitsagentur.de'))) return 'arbeitsagentur';
  if (HWK_SOURCES.has(source) || (!hasUtm && (hostIs(host, 'lehrstellen-radar.de') || /^hwk[-.]|\.hwk[-.]/.test(host)))) return 'hwk';

  // 2. Bezahlte Kampagnen
  if (META_SOURCES.has(source) && paid) return 'meta_ads';
  if (TIKTOK_SOURCES.has(source) && (paid || source.includes('ads'))) return 'tiktok_ads';
  if (GOOGLE_ADS_SOURCES.has(source) || (GOOGLE_SOURCES.has(source) && paid)) return 'google_ads';

  // 3. Empfehlung, Talent-Pool, sonstige Börsen und Feeds
  if (ref) return 'referral';
  if (TALENTPOOL_SOURCES.has(source) || TALENTPOOL_MEDIA.has(medium)) return 'talentpool_alert';
  if (JOBBOARD_MEDIA.has(medium)) return 'jobboard';

  // 4. Organisch
  if (!hasUtm && host && isSearchEngine(host)) return 'organic_search';
  if (SOCIAL_SOURCES.has(source) || SOCIAL_MEDIA.has(medium) || (!hasUtm && host && isSocialHost(host))) return 'social';
  if (!hasUtm && !host) return 'direct';
  return 'other';
}

export function channelLabel(channel: AcquisitionChannel): string {
  return CHANNEL_LABELS[channel];
}
