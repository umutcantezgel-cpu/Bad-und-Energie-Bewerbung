import type { Attribution } from '@/lib/applications/schema';
import type { AcquisitionChannel } from './channel';

/**
 * Herkunft über die Adresse statt im Browser-Speicher (Plan §D „Herkunft ohne Speicher“). Die Attribution lebt nur im
 * Arbeitsspeicher der Seite (store.ts); öffnet jemand „Jetzt bewerben“ in einem neuen Tab oder lädt die Seite neu,
 * wäre der Kanal weg. Deshalb bekommt ein interner Link auf /bewerbung beim Benutzen einen kurzen Parameter mit dem
 * Kanal, nur aus einer bereits erfassten Attribution:
 *
 *   /bewerbung?stelle=anlagenmechaniker-shk-wetzlar  →  /bewerbung?stelle=anlagenmechaniker-shk-wetzlar&herkunft=ind
 *
 * Getragen wird nur der Kanalcode (HERKUNFT_CODES in channel.ts), nie Kampagne, Referrer oder Einstiegsseite. Eine
 * Empfehlung trägt ihren Code `ref=` weiter, sonst ginge der Empfehler verloren. „direct“ trägt nichts.
 * capture.ts liest den Parameter nur, wenn die Adresse kein eigenes Signal hat (utm_*, ref, fremder Referrer).
 *
 * Bewusst ohne Import von channel.ts: capture.ts läuft im Root-Layout auf jeder Seite und bleibt klein. Ein Test
 * prüft, dass jeder Code hier zu genau dem Kanal führt, den channel.ts ihm zuordnet.
 */

export const HERKUNFT_PARAM = 'herkunft';

/** Ziele, an die der Parameter kommt: der Flow und die Mappe (von dort geht es in den Flow). */
export const HERKUNFT_ZIELE: readonly string[] = Object.freeze(['/bewerbung', '/bewerbung/mappe']);

/**
 * Wofür ein Code auf der Bewerbungsseite steht: die kleinste Attribution, aus der deriveChannel() denselben Kanal
 * ableitet. Kein Eintrag für „referral“ (trägt `ref=`) und „direct“ (trägt nichts).
 */
const HERKUNFT_ATTRIBUTION: Readonly<Record<string, Readonly<Attribution>>> = Object.freeze({
  gfj: Object.freeze({ utmSource: 'google_jobs' }),
  ind: Object.freeze({ utmSource: 'indeed' }),
  ba: Object.freeze({ utmSource: 'arbeitsagentur' }),
  hwk: Object.freeze({ utmSource: 'hwk' }),
  meta: Object.freeze({ utmSource: 'meta', utmMedium: 'paid' }),
  tik: Object.freeze({ utmSource: 'tiktok', utmMedium: 'paid' }),
  gads: Object.freeze({ utmSource: 'google_ads' }),
  pool: Object.freeze({ utmSource: 'talentpool' }),
  boe: Object.freeze({ utmMedium: 'jobboard' }),
  such: Object.freeze({ utmMedium: 'organic' }),
  soz: Object.freeze({ utmMedium: 'social' }),
  son: Object.freeze({ utmMedium: 'sonstige' }),
});

/** Alle Codes, die der Parameter tragen kann (klein geschrieben). */
export const HERKUNFT_PARAM_CODES: readonly string[] = Object.freeze(Object.keys(HERKUNFT_ATTRIBUTION));

/** `?herkunft=ind` → `{ utmSource: 'indeed' }`; unbekannte, leere oder zu lange Werte ergeben null. */
export function attributionAusHerkunft(value: string | null | undefined): Attribution | null {
  const code = value?.trim().toLowerCase();
  if (!code || !Object.prototype.hasOwnProperty.call(HERKUNFT_ATTRIBUTION, code)) return null;
  return { ...HERKUNFT_ATTRIBUTION[code] };
}

export type HerkunftParameter = readonly [name: string, wert: string];

/**
 * Der Parameter für interne /bewerbung-Links: `['herkunft', 'ind']`, bei einer Empfehlung `['ref', <code>]`, ohne
 * Signal (direct) null. `kanal` ist deriveChannel(attribution), `code` dessen Kurzcode (HERKUNFT_CODES).
 */
export function herkunftParameter(kanal: AcquisitionChannel, code: string, attribution: Attribution): HerkunftParameter | null {
  if (kanal === 'referral') return attribution.ref ? ['ref', attribution.ref] : null;
  const klein = code.toLowerCase();
  return HERKUNFT_PARAM_CODES.includes(klein) ? [HERKUNFT_PARAM, klein] : null;
}

/** Parameter, die schon eine Herkunft tragen: Der Link bleibt dann, wie er ist. */
const SIGNAL_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', HERKUNFT_PARAM];

/**
 * Hängt den Parameter an einen Link, wenn er auf derselben Website zu /bewerbung (oder der Mappe) führt und noch
 * keine Herkunft trägt. Relative Links bleiben relativ, alles andere unverändert (fremde Hosts, andere Pfade,
 * mailto:, tel:, kaputte Adressen). `origin` ist die Herkunft der Seite (`location.origin`).
 */
export function mitHerkunft(href: string, parameter: HerkunftParameter | null, origin: string): string {
  if (!parameter) return href;
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return href;
  }
  if (url.origin !== origin || !HERKUNFT_ZIELE.includes(url.pathname.replace(/\/+$/, '') || '/')) return href;
  if (SIGNAL_PARAMS.some((name) => url.searchParams.has(name))) return href;

  url.searchParams.set(parameter[0], parameter[1]);
  const absolut = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
  return absolut ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
}
