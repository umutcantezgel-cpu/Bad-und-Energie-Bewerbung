import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/csp-report/route';
import { parseCspReports } from '@/lib/security/csp-report';

function report(body: unknown, contentType: string) {
  return POST(
    new Request('https://karriere.bad-energie.de/api/csp-report', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseCspReports', () => {
  it('liest das report-uri-Format ohne Query-Strings', () => {
    expect(
      parseCspReports({
        'csp-report': {
          'document-uri': 'https://karriere.bad-energie.de/bewerbung?name=Max&tel=0170',
          'blocked-uri': 'https://maps.googleapis.com/maps/api/js?key=abc',
          'effective-directive': 'script-src-elem',
          disposition: 'report',
        },
      }),
    ).toEqual([{ directive: 'script-src-elem', blocked: 'https://maps.googleapis.com', page: '/bewerbung', disposition: 'report' }]);
  });

  it('liest die Reporting API und ignoriert andere Typen', () => {
    const reports = parseCspReports([
      {
        type: 'csp-violation',
        url: 'https://karriere.bad-energie.de/',
        body: { documentURL: 'https://karriere.bad-energie.de/jobs', blockedURL: 'inline', effectiveDirective: 'style-src-attr', disposition: 'report' },
      },
      { type: 'deprecation', body: {} },
    ]);
    expect(reports).toEqual([{ directive: 'style-src-attr', blocked: 'inline', page: '/jobs', disposition: 'report' }]);
  });

  it('liefert für Unbekanntes eine leere Liste', () => {
    expect(parseCspReports({ foo: 1 })).toEqual([]);
    expect(parseCspReports('x')).toEqual([]);
  });
});

describe('POST /api/csp-report', () => {
  it('nimmt beide Formate an und protokolliert eine Zeile je Meldung', async () => {
    const legacy = { 'csp-report': { 'document-uri': 'https://karriere.bad-energie.de/', 'blocked-uri': 'eval', 'violated-directive': 'script-src' } };
    expect((await report(legacy, 'application/csp-report')).status).toBe(204);
    expect((await report([], 'application/reports+json')).status).toBe(204);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('[csp] report script-src blockiert eval auf /');
  });

  it('lehnt fremde Content-Types und zu große Bodies ab', async () => {
    expect((await report('{}', 'text/plain')).status).toBe(415);
    expect((await report({ x: 'y'.repeat(20 * 1024) }, 'application/csp-report')).status).toBe(413);
  });
});
