import type { Attribution } from '@/lib/applications/schema';

/**
 * Bereinigung der Attributionswerte, ohne zod und ohne Datenimporte: läuft im Root-Layout
 * (AttributionCapture) auf jeder Seite und muss deshalb winzig bleiben. Der Server prüft
 * zusätzlich mit `attributionSchema` (lib/attribution/schema.ts).
 */

/** Höchstlängen je Feld, deckungsgleich mit attributionSchema in lib/applications/schema.ts. */
export const ATTRIBUTION_LIMITS = Object.freeze({
  utmSource: 100,
  utmMedium: 100,
  utmCampaign: 100,
  utmContent: 100,
  utmTerm: 100,
  ref: 32,
  referrerHost: 253,
  landingPath: 300,
  funnel: 60,
} satisfies Record<keyof Attribution, number>);

export type AttributionKey = keyof typeof ATTRIBUTION_LIMITS;
export const ATTRIBUTION_KEYS = Object.freeze(Object.keys(ATTRIBUTION_LIMITS) as AttributionKey[]);

/** Kampagnenwerte (utm_*, ref, funnel): klein, nur a–z, 0–9, „.“, „_“ und „-“. */
const TOKEN_FIELDS = ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm', 'ref', 'funnel'] as const;

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

/**
 * „Herbst Kampagne 2026“ → „herbst-kampagne-2026“, „Wärmepumpe“ → „waermepumpe“.
 * Leerraum und „+“ werden zu „-“, alle anderen Zeichen außerhalb von [a-z0-9._-] fallen weg.
 */
export function sanitizeToken(value: unknown, max = 100): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => UMLAUTS[char] ?? char)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s+]+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, max)
    .replace(/[-.]+$/g, '');
  return cleaned || undefined;
}

/** Nur der Hostname (klein, ohne Port und abschließenden Punkt); nie Pfad oder Query. */
export function sanitizeHost(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const raw = value.trim().toLowerCase();
  if (!raw) return undefined;
  let host = raw;
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(raw)) {
    try {
      host = new URL(raw).hostname;
    } catch {
      return undefined;
    }
  }
  host = host.replace(/:\d+$/, '').replace(/\.$/, '');
  if (!/^[a-z0-9.-]{1,253}$/.test(host) || !/[a-z0-9]/.test(host)) return undefined;
  return host;
}

/** Pfad ohne Query und Fragment, z. B. „/jobs/anlagenmechaniker-shk-wetzlar“. */
export function sanitizePath(value: unknown, max = ATTRIBUTION_LIMITS.landingPath): string | undefined {
  if (typeof value !== 'string') return undefined;
  const path = value.trim().split(/[?#]/, 1)[0] ?? '';
  if (!path.startsWith('/') || path.startsWith('//')) return undefined;
  // Steuerzeichen und Leerraum haben in einem Pfad nichts zu suchen.
  if (/[\u0000- \u007f]/.test(path)) return undefined;
  return path.slice(0, max);
}

/** Bereinigt alle bekannten Felder; unbekannte und leere Werte fallen weg. */
export function sanitizeAttribution(input: unknown): Attribution {
  const result: Attribution = {};
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return result;
  const source = input as Partial<Record<string, unknown>>;

  for (const key of TOKEN_FIELDS) {
    const value = sanitizeToken(source[key], ATTRIBUTION_LIMITS[key]);
    if (value) result[key] = value;
  }
  const referrerHost = sanitizeHost(source.referrerHost);
  if (referrerHost) result.referrerHost = referrerHost;
  const landingPath = sanitizePath(source.landingPath);
  if (landingPath) result.landingPath = landingPath;

  return result;
}

export function isEmptyAttribution(attribution: Attribution): boolean {
  return ATTRIBUTION_KEYS.every((key) => !attribution[key]);
}
