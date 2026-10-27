import { afterEach, describe, expect, it, vi } from 'vitest';

const mappePdf = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mappe/pdf/blatt', () => ({ mappePdf }));

import { full } from '@/lib/email/__tests__/fixtures';
import { PDF_ZEITLIMIT_MS, mappeAnhangFuerBewerbung } from '@/lib/mappe/pdf/anhang';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  mappePdf.mockReset();
});

describe('PDF der Mappe: Zeitlimit und Fehler heißen Mail ohne Anhang', () => {
  it('nach dem Zeitlimit keine PDF (die Bewerbung wartet nicht)', async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mappePdf.mockReturnValue(new Promise(() => {}));
    const anhang = mappeAnhangFuerBewerbung(full);
    await vi.advanceTimersByTimeAsync(PDF_ZEITLIMIT_MS);
    expect(await anhang).toBeNull();
    expect(String(warn.mock.calls.at(-1)?.[0])).toBe('[mappe-pdf] BE-26-K7M4QX: keine PDF (zeitlimit)');
  });

  it('ein Fehler beim Setzen: keine PDF, kein Wurf', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mappePdf.mockRejectedValue(new Error('kaputt'));
    expect(await mappeAnhangFuerBewerbung(full)).toBeNull();
    expect(String(warn.mock.calls.at(-1)?.[0])).toBe('[mappe-pdf] BE-26-K7M4QX: keine PDF (fehler)');
  });

  it('das Zeitlimit lässt Datenbank (5 s) und Resend (10 s, schneller zweiter Versuch) unter den 25 s des Browsers', () => {
    expect(5_000 + PDF_ZEITLIMIT_MS + 5_000 + 800 + 10_000).toBeLessThan(25_000);
  });
});
