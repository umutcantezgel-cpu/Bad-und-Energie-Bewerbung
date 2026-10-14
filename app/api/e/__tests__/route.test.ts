import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/e/route';

const URL_E = 'https://karriere.bad-energie.de/api/e';
let ip = 0;

/** Wie navigator.sendBeacon mit einem String: text/plain, Origin der eigenen Seite. */
function beacon(body: unknown, headers: Record<string, string> = {}) {
  ip += 1;
  return POST(
    new Request(URL_E, {
      method: 'POST',
      headers: {
        origin: 'https://karriere.bad-energie.de',
        'content-type': 'text/plain;charset=UTF-8',
        'x-real-ip': `203.0.113.${ip % 250}`,
        'user-agent': 'Mozilla/5.0 (Linux; Android 14) Testgeraet/1.0',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

function logzeilen(): string[] {
  return vi
    .mocked(console.info)
    .mock.calls.map((call) => String(call[0]))
    .filter((zeile) => zeile.startsWith('[ereignis] '));
}

function letztesEreignis(): Record<string, unknown> {
  const zeile = logzeilen().at(-1);
  expect(zeile).toBeDefined();
  return JSON.parse(zeile!.slice('[ereignis] '.length));
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('VERCEL_ENV', undefined);
  vi.stubEnv('IP_HASH_SALT', undefined);
  vi.stubEnv('FUNNEL_EVENTS', 'true');
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-14T09:30:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/e: Schalter FUNNEL_EVENTS', () => {
  it('ohne Schalter (Standard) 404 wie ein Endpunkt, den es nicht gibt, und keine Log-Zeile', async () => {
    for (const wert of [undefined, 'false', 'TRUE']) {
      vi.stubEnv('FUNNEL_EVENTS', wert);
      const res = await beacon({ ereignis: 'flow_start', kanal: 'indeed' });
      expect(res.status).toBe(404);
      expect(res.headers.get('cache-control')).toBe('no-store');
    }
    expect(logzeilen()).toEqual([]);
  });
});

describe('POST /api/e: Ereignisse als Log-Zeile ohne Kennung', () => {
  it('nimmt den Beacon (text/plain) an: 204, eine Zeile mit Tag, Ereignis, Kanal und Stellen-ID', async () => {
    const res = await beacon({ ereignis: 'flow_start', kanal: 'indeed', stelle: 'anlagenmechaniker-shk-wetzlar' });
    expect(res.status).toBe(204);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(letztesEreignis()).toEqual({ tag: '2026-10-14', ereignis: 'flow_start', kanal: 'indeed', stelle: 'anlagenmechaniker-shk' });
  });

  it('nimmt auch application/json an', async () => {
    const res = await beacon({ ereignis: 'abgesendet', kanal: 'direct', stelle: 'initiativ' }, { 'content-type': 'application/json' });
    expect(res.status).toBe(204);
    expect(letztesEreignis()).toEqual({ tag: '2026-10-14', ereignis: 'abgesendet', kanal: 'direct', stelle: 'initiativ' });
  });

  it('speichert weder IP noch User-Agent, Referrer oder Uhrzeit, nur den Tag', async () => {
    await beacon({ ereignis: 'whatsapp_klick', kanal: 'organic_search' }, { 'x-real-ip': '198.51.100.77', referer: 'https://karriere.bad-energie.de/jobs/x?name=Max' });
    const zeile = logzeilen().at(-1) ?? '';
    expect(zeile).not.toMatch(/198\.51\.100\.77|Mozilla|Testgeraet|Max|referer|09:30|T09/);
    expect(Object.keys(letztesEreignis()).sort()).toEqual(['ereignis', 'kanal', 'tag']);
  });

  it('Schritt und Fehler mit ihren Feldern; Stelle als Slug, alter Slug oder ID wird zur ID', async () => {
    await beacon({ ereignis: 'schritt', kanal: 'arbeitsagentur', stelle: 'ausbildung-anlagenmechaniker-shk', schritt: 'kontakt' });
    expect(letztesEreignis()).toMatchObject({ ereignis: 'schritt', schritt: 'kontakt', stelle: 'ausbildung-anlagenmechaniker-shk' });
    await beacon({ ereignis: 'schritt', kanal: 'arbeitsagentur', schritt: 'qualification' });
    expect(letztesEreignis()).toMatchObject({ ereignis: 'schritt', schritt: 'qualification' });
    await beacon({ ereignis: 'fehler', kanal: 'hwk', stelle: 'initiativ', fehler: 'timeout' });
    expect(letztesEreignis()).toMatchObject({ ereignis: 'fehler', fehler: 'timeout', stelle: 'initiativ' });
  });

  it('eine unbekannte Stelle fällt weg statt als freier Text ins Log zu gehen', async () => {
    const res = await beacon({ ereignis: 'telefon_klick', kanal: 'social', stelle: 'max-mustermann-0151' });
    expect(res.status).toBe(204);
    expect(letztesEreignis()).toEqual({ tag: '2026-10-14', ereignis: 'telefon_klick', kanal: 'social' });
    expect(logzeilen().join('\n')).not.toContain('max-mustermann');
  });

  it.each([
    ['unbekanntes Ereignis', { ereignis: 'seitenaufruf', kanal: 'indeed' }],
    ['Kanal frei erfunden', { ereignis: 'flow_start', kanal: 'zeitung' }],
    ['ohne Kanal', { ereignis: 'flow_start' }],
    ['Kennung mitgeschickt', { ereignis: 'flow_start', kanal: 'indeed', id: 'abc-123' }],
    ['Zeitstempel mitgeschickt', { ereignis: 'flow_start', kanal: 'indeed', zeit: 1_760_000_000_000 }],
    ['Schritt fehlt', { ereignis: 'schritt', kanal: 'indeed' }],
    ['Schritt unbekannt', { ereignis: 'schritt', kanal: 'indeed', schritt: 'gehalt' }],
    ['Schritt bei anderem Ereignis', { ereignis: 'flow_start', kanal: 'indeed', schritt: 'kontakt' }],
    ['Fehlerart unbekannt', { ereignis: 'fehler', kanal: 'indeed', fehler: 'kaputt' }],
    ['Stelle zu lang', { ereignis: 'flow_start', kanal: 'indeed', stelle: 'x'.repeat(81) }],
    ['kein Objekt', ['flow_start']],
  ])('%s: 400, keine Log-Zeile', async (_name, body) => {
    const res = await beacon(body);
    expect(res.status).toBe(400);
    expect(logzeilen()).toEqual([]);
  });
});

describe('POST /api/e: Eingangskontrolle wie die Formular-APIs (guardJsonPost)', () => {
  it('fremde Herkunft 403', async () => {
    const res = await beacon({ ereignis: 'flow_start', kanal: 'indeed' }, { origin: 'https://example.org' });
    expect(res.status).toBe(403);
  });

  it('anderer Typ 415, kaputtes JSON 400, zu groß 413', async () => {
    expect((await beacon('{}', { 'content-type': 'text/html' })).status).toBe(415);
    expect((await beacon('{kein json')).status).toBe(400);
    expect((await beacon({ ereignis: 'flow_start', kanal: 'indeed', stelle: 'x'.repeat(2000) })).status).toBe(413);
    expect(logzeilen()).toEqual([]);
  });

  it('Rate-Limit je Netz: 30 Ereignisse pro Minute, dann 429 mit Retry-After', async () => {
    const headers = { 'x-real-ip': '192.0.2.200' };
    for (let i = 0; i < 30; i += 1) expect((await beacon({ ereignis: 'schritt', kanal: 'indeed', schritt: 'stelle' }, headers)).status).toBe(204);
    const res = await beacon({ ereignis: 'schritt', kanal: 'indeed', schritt: 'stelle' }, headers);
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});
