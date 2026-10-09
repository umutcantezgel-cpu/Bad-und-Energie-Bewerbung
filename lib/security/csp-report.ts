// Normalisiert CSP-Meldungen (report-uri und Reporting API) für /api/csp-report.

const MAX_REPORTS = 10;

export interface CspViolation {
  directive: string;
  /** Origin oder Schlüsselwort (inline, eval, data …), nie die volle URL. */
  blocked: string;
  /** Nur der Pfad der Seite, ohne Query (keine Personendaten im Log). */
  page: string;
  disposition: string;
}

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown) => (typeof value === 'string' ? value : '');
const clean = (value: string) => value.replace(/[^\w.:/*-]/g, '').slice(0, 80) || 'unbekannt';

function blockedSource(value: string): string {
  try {
    const url = new URL(value);
    return clean(url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : url.protocol.replace(/:$/, ''));
  } catch {
    return clean(value);
  }
}

function pagePath(value: string): string {
  try {
    return clean(new URL(value).pathname);
  } catch {
    return 'unbekannt';
  }
}

function toViolation(body: Raw, keys: { directive: string[]; blocked: string; page: string }): CspViolation {
  const directive = keys.directive.map((key) => text(body[key])).find(Boolean) ?? '';
  return {
    directive: clean(directive.split(' ')[0]),
    blocked: blockedSource(text(body[keys.blocked])),
    page: pagePath(text(body[keys.page])),
    disposition: text(body.disposition) === 'enforce' ? 'enforce' : 'report',
  };
}

/** Liest das alte Format (`{"csp-report": …}`) und die Reporting API (Array mit `type: "csp-violation"`). */
export function parseCspReports(data: unknown): CspViolation[] {
  if (isObject(data) && isObject(data['csp-report'])) {
    return [
      toViolation(data['csp-report'], {
        directive: ['effective-directive', 'violated-directive'],
        blocked: 'blocked-uri',
        page: 'document-uri',
      }),
    ];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry): entry is Raw => isObject(entry) && entry.type === 'csp-violation' && isObject(entry.body))
    .slice(0, MAX_REPORTS)
    .map((entry) =>
      toViolation(entry.body as Raw, { directive: ['effectiveDirective'], blocked: 'blockedURL', page: 'documentURL' }),
    );
}
