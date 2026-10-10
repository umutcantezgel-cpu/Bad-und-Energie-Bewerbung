import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { COMPANY, FACTS } from '@/lib/content';

/** E-SEO-014: the short file carries the backed employer lines the old file had, all from fact ids. */

async function textAt(route: () => Response, iso: string): Promise<string> {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
  return route().text();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('llms.txt (E-SEO-014)', () => {
  it('lists pay, contract, Hilti kit, workwear and chamber and guild from the registry', async () => {
    const text = await textAt(llms, '2026-10-10T12:00:00Z');
    expect(text).toContain('Vergütung deutlich über dem regionalen Handwerkstarif, dazu Urlaubs- und Weihnachtsgeld.');
    expect(text).toContain('Du bekommst einen unbefristeten Arbeitsvertrag.');
    expect(text).toContain(FACTS.hilti.long);
    expect(text).toContain(FACTS.workwear.long);
    expect(text).toContain(`${COMPANY.hwk}, ${COMPANY.innung}`);
  });

  it('names the anniversary in the lead sentence until 31.12.2026, not after', async () => {
    const before = await textAt(llms, '2026-12-31T12:00:00Z');
    expect(before).toContain('100 Jahre Meisterbetrieb (1926–2026)');

    const after = await textAt(llms, '2027-01-01T12:00:00Z');
    expect(after).not.toContain('100 Jahre');
    expect(after).toContain(FACTS.founded1926.short);
  });

  it('keeps unbacked claims out of both files', async () => {
    for (const route of [llms, llmsFull]) {
      const text = await textAt(route, '2026-10-10T12:00:00Z');
      expect(text).not.toMatch(/Wäscheservice|bezahlt ins Wochenende|erstklassig|Spitzen/);
    }
  });

  it('answers as UTF-8 plain text', () => {
    for (const route of [llms, llmsFull]) {
      expect(route().headers.get('content-type')).toBe('text/plain; charset=utf-8');
    }
  });
});
