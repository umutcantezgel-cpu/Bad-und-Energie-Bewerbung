import { describe, expect, it } from 'vitest';

import type { Attribution } from '@/lib/applications/schema';
import { ACQUISITION_CHANNELS, CHANNEL_LABELS, deriveChannel, type AcquisitionChannel } from '@/lib/attribution/channel';

const CASES: Array<[string, Attribution, AcquisitionChannel]> = [
  ['Google for Jobs (Apply-Link)', { utmSource: 'google_jobs_apply', utmMedium: 'organic', utmCampaign: 'google_jobs_apply' }, 'google_jobs'],
  ['Indeed-Feed', { utmSource: 'indeed', utmMedium: 'jobboard', utmCampaign: 'anlagenmechaniker-shk' }, 'indeed'],
  ['Indeed nur Referrer', { referrerHost: 'de.indeed.com' }, 'indeed'],
  ['BA-Jobbörse', { utmSource: 'arbeitsagentur', utmMedium: 'jobboard' }, 'arbeitsagentur'],
  ['BA nur Referrer', { referrerHost: 'www.arbeitsagentur.de' }, 'arbeitsagentur'],
  ['HWK-Lehrstellenbörse', { utmSource: 'hwk', utmMedium: 'jobboard' }, 'hwk'],
  ['HWK nur Referrer', { referrerHost: 'www.hwk-wiesbaden.de' }, 'hwk'],
  ['Meta-Anzeige', { utmSource: 'facebook', utmMedium: 'paid_social', utmCampaign: 'herbst' }, 'meta_ads'],
  ['Instagram-Anzeige (cpc)', { utmSource: 'instagram', utmMedium: 'cpc' }, 'meta_ads'],
  ['TikTok-Anzeige', { utmSource: 'tiktok', utmMedium: 'paid' }, 'tiktok_ads'],
  ['Google Ads', { utmSource: 'google', utmMedium: 'cpc' }, 'google_ads'],
  ['Google Ads (Quelle)', { utmSource: 'google_ads' }, 'google_ads'],
  ['Empfehlung', { ref: 'koch', referrerHost: 'l.facebook.com' }, 'referral'],
  ['Empfehlung mit Social-UTM', { ref: 'koch', utmSource: 'whatsapp' }, 'referral'],
  ['Job-Alarm', { utmSource: 'talentpool', utmMedium: 'email' }, 'talentpool_alert'],
  ['Job-Alarm (Medium)', { utmSource: 'newsletter', utmMedium: 'job_alert' }, 'talentpool_alert'],
  ['Aggregator-Feed', { utmSource: 'jobs-xml', utmMedium: 'jobboard' }, 'jobboard'],
  ['Widget bad-energie.de', { utmSource: 'jobs-json', utmMedium: 'jobboard' }, 'jobboard'],
  ['Google organisch', { referrerHost: 'www.google.de' }, 'organic_search'],
  ['Bing', { referrerHost: 'www.bing.com' }, 'organic_search'],
  ['DuckDuckGo', { referrerHost: 'duckduckgo.com' }, 'organic_search'],
  ['Ecosia', { referrerHost: 'www.ecosia.org' }, 'organic_search'],
  ['Facebook organisch (Referrer)', { referrerHost: 'l.facebook.com' }, 'social'],
  ['Instagram organisch (UTM)', { utmSource: 'instagram', utmMedium: 'social' }, 'social'],
  ['LinkedIn', { referrerHost: 'www.linkedin.com' }, 'social'],
  ['Direkt', {}, 'direct'],
  ['Direkt mit Einstiegsseite', { landingPath: '/jobs/anlagenmechaniker-shk-wetzlar', funnel: 'stellenseite' }, 'direct'],
  ['Unbekannte Seite', { referrerHost: 'forum.example.org' }, 'other'],
  ['Unbekannte Kampagne', { utmSource: 'flyer', utmMedium: 'print' }, 'other'],
  ['Google-Suche mit Kampagne ohne Paid-Medium', { utmSource: 'google', utmMedium: 'organic' }, 'other'],
];

describe('deriveChannel', () => {
  it.each(CASES)('%s', (_name, attribution, expected) => {
    expect(deriveChannel(attribution)).toBe(expected);
  });

  it('handles missing input and casing', () => {
    expect(deriveChannel(undefined)).toBe('direct');
    expect(deriveChannel(null)).toBe('direct');
    expect(deriveChannel({ utmSource: 'Indeed' })).toBe('indeed');
  });

  it('has a German label for every channel', () => {
    for (const channel of ACQUISITION_CHANNELS) expect(CHANNEL_LABELS[channel]).toBeTruthy();
  });
});
