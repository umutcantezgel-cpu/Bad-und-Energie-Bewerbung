import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ergaenzung, full, maximal } from '@/lib/email/__tests__/fixtures';
import { SCHRIFTSTILE, VORLAGEN } from '@/lib/mappe/blatt/design';
import { mappeDokument } from '@/lib/mappe/blatt/dokument';
import { fuerPdf } from '@/lib/mappe/blatt/zeichen';
import { getMappeRecipient } from '@/lib/mappe/context';
import { ZEILEN_HOECHSTENS, geschaetzterUmfang, mappeAnhangFuerBewerbung, mappeAnhangFuerErgaenzung } from '@/lib/mappe/pdf/anhang';
import { mappePdf } from '@/lib/mappe/pdf/blatt';

/**
 * Rauchtest der Mappe-PDF (Schritt 4a/4b): echte PDF mit react-pdf, ohne Mocks. Inhalt und Seitenumbruch prüft der
 * Mensch an den Bildern (pdftoppm); hier zählen Format, Schrift, Seitenzahl, gleiche Bytes und die Fälle ohne PDF.
 */

const roh = (base64: string) => Buffer.from(base64, 'base64').toString('latin1');

beforeEach(() => {
  for (const methode of ['info', 'warn', 'error'] as const) vi.spyOn(console, methode).mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function logs(): string {
  return [console.info, console.warn, console.error]
    .flatMap((spy) => vi.mocked(spy).mock.calls.flat().map(String))
    .join('\n');
}

describe('PDF der Mappe im Anhang der Team-Mail', () => {
  it('A4 mit Anschreiben und Lebenslauf, Schrift eingebettet, Dateiname mit Nummer und Nachname', async () => {
    const anhang = await mappeAnhangFuerBewerbung(full);
    expect(anhang).not.toBeNull();
    expect(anhang!.dateiname).toBe('Bewerbungsmappe_BE-26-K7M4QX_Muster.pdf');
    expect(anhang!.seiten).toBe(2);
    const pdf = roh(anhang!.inhalt);
    expect(pdf.startsWith('%PDF-')).toBe(true);
    // A4 in pt (595,28 × 841,89), Atkinson Hyperlegible Next als eingebettete TrueType-Teilschrift (fett und normal)
    expect(pdf.match(/\/MediaBox \[0 0 595\.2\d* 841\.8\d*\]/g)).toHaveLength(2);
    expect(pdf.match(/\/FontFile2/g)).toHaveLength(2);
    expect(pdf).toMatch(/AtkinsonHyperlegibleNext-Regular/);
    expect(pdf).toMatch(/AtkinsonHyperlegibleNext-Bold/);
    // Logs: Nummer, Seiten, Dauer, Größe – nie der Name
    expect(logs()).toMatch(/\[mappe-pdf\] BE-26-K7M4QX: 2 Seiten, \d+ ms, \d+ KB/);
    expect(logs()).not.toContain('Muster');
  });

  it('gleiche Bewerbung, gleiche Bytes (Erstellungszeit = Eingang); anderer Eingang, andere Datei', async () => {
    const eins = await mappeAnhangFuerBewerbung(full);
    const zwei = await mappeAnhangFuerBewerbung({ ...full });
    expect(zwei!.inhalt).toBe(eins!.inhalt);
    const spaeter = await mappeAnhangFuerBewerbung({ ...full, submittedAt: new Date('2026-10-09T07:00:00Z') });
    expect(spaeter!.inhalt).not.toBe(eins!.inhalt);
  });

  it('nachgereichte Mappe: Datei nur mit Nummer', async () => {
    const anhang = await mappeAnhangFuerErgaenzung({ ...ergaenzung, mappe: full.mappe });
    expect(anhang!.dateiname).toBe('Bewerbungsmappe_BE-26-K7M4QX.pdf');
    expect(anhang!.seiten).toBe(2);
  });

  it('keine PDF ohne Mappe, nur mit angetippter Praxiserfahrung oder mit MAPPE_PDF=aus', async () => {
    expect(await mappeAnhangFuerBewerbung({ ...full, mappe: undefined })).toBeNull();
    const praxis = { coverLetter: '', skills: ['Wärmepumpen'], careerStations: [], educationStations: [] };
    expect(await mappeAnhangFuerErgaenzung({ ...ergaenzung, mappe: praxis })).toBeNull();
    vi.stubEnv('MAPPE_PDF', 'aus');
    expect(await mappeAnhangFuerBewerbung(full)).toBeNull();
    expect(logs()).not.toMatch(/keine PDF/);
  });

  it('Zeichen, die die Schrift nicht hat: keine PDF statt Kästchen, Grund im Log ohne den Namen', async () => {
    expect(await mappeAnhangFuerBewerbung({ ...full, name: 'Иван Петров' })).toBeNull();
    expect(logs()).toContain('[mappe-pdf] BE-26-K7M4QX: keine PDF (zeichen)');
    expect(logs()).not.toContain('Иван');
  });

  it('jedes Design setzt sich (Schlicht, Farbband, Zweispaltig, je Sachlich und Markant); Markant bettet Bricolage ein', async () => {
    for (const vorlage of VORLAGEN) {
      for (const schrift of SCHRIFTSTILE) {
        const anhang = await mappeAnhangFuerBewerbung({ ...full, mappe: { ...full.mappe!, design: { vorlage, akzent: 'petrol', schrift } } });
        const fall = `${vorlage}/${schrift}`;
        expect(anhang!.seiten, fall).toBe(2);
        expect(/BricolageGrotesque-Bold/.test(roh(anhang!.inhalt)), fall).toBe(schrift === 'markant');
      }
    }
  }, 30_000);

  it('ohne Design in der Mappe wie bisher „Schlicht“ (gleiche Bytes wie mit dem Standard-Design)', async () => {
    const ohne = await mappeAnhangFuerBewerbung(full);
    const standard = await mappeAnhangFuerBewerbung({ ...full, mappe: { ...full.mappe!, design: { vorlage: 'schlicht', akzent: 'navy', schrift: 'sachlich' } } });
    expect(standard!.inhalt).toBe(ohne!.inhalt);
  });

  it('Spamverdacht: keine PDF (kein Satz für Bot-Anfragen), Grund im Log', async () => {
    expect(await mappeAnhangFuerBewerbung({ ...full, suspectedSpam: true, spamSignals: ['honeypot'] })).toBeNull();
    expect(logs()).toContain('[mappe-pdf] BE-26-K7M4QX: keine PDF (spam)');
  });

  it('Umbrüche in einzeiligen Feldern und Leerzeilen im Brief blähen die PDF nicht auf (Prüfrunde L2)', async () => {
    const umbrueche = (n: number) => '\n'.repeat(n);
    const aufgeblaeht = {
      ...full,
      mappe: {
        ...full.mappe!,
        coverLetter: `Sehr geehrter Herr Demir,${umbrueche(3000)}ich bewerbe mich.`,
        careerStations: Array.from({ length: 12 }, () => ({
          period: `2020${umbrueche(50)}`,
          role: `Geselle${umbrueche(100)}`,
          company: `Betrieb${umbrueche(100)}`,
          location: `Wetzlar${umbrueche(100)}`,
          tasks: Array.from({ length: 8 }, () => `Montage${umbrueche(180)}`),
        })),
      },
    };
    const anhang = await mappeAnhangFuerBewerbung(aufgeblaeht);
    expect(anhang!.seiten).toBeLessThanOrEqual(6);
  });

  it('die Obergrenze für den Umfang liegt weit über jeder Mappe innerhalb der Schema-Grenzen', () => {
    const dokument = fuerPdf(
      mappeDokument({ name: 'Max Muster', betreff: 'B', stelle: 'X', datum: '8. Oktober 2026', empfaenger: getMappeRecipient(), mappe: maximal.mappe! })!,
    )!;
    expect(geschaetzterUmfang(dokument)).toBeLessThan(ZEILEN_HOECHSTENS / 2);
  });

  it('Seitenzahl: ein Name wie „Max /Type /Page Muster“ zählt nicht mit', async () => {
    const anhang = await mappeAnhangFuerBewerbung({ ...full, name: 'Max /Type /Page Muster' });
    expect(anhang!.seiten).toBe(2);
  });

  it('sehr lange Mappe (alle Höchstwerte): viele Seiten, kein Abbruch', async () => {
    const dokument = fuerPdf(
      mappeDokument({
        name: 'Max Muster',
        betreff: 'Bewerbung als Anlagenmechaniker SHK (m/w/d)',
        stelle: 'Anlagenmechaniker SHK',
        datum: '8. Oktober 2026',
        empfaenger: getMappeRecipient(),
        mappe: maximal.mappe!,
      })!,
    )!;
    const { pdf, seiten } = await mappePdf(dokument, maximal.submittedAt);
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(seiten).toBeGreaterThan(10);
  }, 30_000);
});
