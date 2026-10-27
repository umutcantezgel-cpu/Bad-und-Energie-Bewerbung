import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { full } from '@/lib/email/__tests__/fixtures';
import { FOTOFORMEN } from '@/lib/mappe/blatt/design';
import { mappeDokument, type MappeDokument } from '@/lib/mappe/blatt/dokument';
import { fuerPdf } from '@/lib/mappe/blatt/zeichen';
import { getMappeRecipient } from '@/lib/mappe/context';
import { mappePdf } from '@/lib/mappe/pdf/blatt';
import { MappePdf, schriftenRegistrieren, seitenZaehlen, type MappePdfPersoenlich } from '@/lib/mappe/pdf/satz';

/**
 * PDF des Bewerbers (L4): derselbe Satz wie die Team-PDF (lib/mappe/pdf/satz.tsx), dazu Kontaktzeile und Foto. Hier in
 * Node gerendert (renderToBuffer); im Browser rendert lib/mappe/pdf/browser.tsx denselben Baum mit pdf().toBlob()
 * (e2e/mappe.spec.ts). Ohne Kontakt und Foto muss der Baum genau der Team-PDF entsprechen.
 */

const SCHRIFTEN = path.join(process.cwd(), 'lib/mappe/schriften');
const ERSTELLT = new Date('2026-10-27T09:00:00Z');
/** 8 × 10 px, oben rot, unten navy. */
const JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDyb+3Lb+5N+Q/xornKK9b+wcJ2f3nof6yY7uvuP//Z';

function dokument(vorlage: 'schlicht' | 'farbband' = 'schlicht'): MappeDokument {
  const dok = mappeDokument({
    name: full.name,
    betreff: 'Bewerbung als Anlagenmechaniker SHK',
    stelle: full.job.shortTitle,
    datum: 'Wetzlar, 27. Oktober 2026',
    empfaenger: getMappeRecipient(),
    mappe: { ...full.mappe!, design: { vorlage, akzent: 'petrol', schrift: 'markant' } },
  });
  return fuerPdf(dok!)!;
}

async function bewerberPdf(dok: MappeDokument, persoenlich: MappePdfPersoenlich): Promise<string> {
  schriftenRegistrieren({
    normal: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-400.ttf'),
    fett: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-700.ttf'),
    titel: path.join(SCHRIFTEN, 'bricolage-grotesque-700.ttf'),
  });
  // Wie <MappePdf …/> in blatt.tsx (JSX ist dort ein beliebiges Element; hier ohne JSX, weil Tests .ts sind)
  const element = createElement(MappePdf, { dokument: dok, erstellt: ERSTELLT, seitenzahlen: true, ...persoenlich });
  const pdf = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  return pdf.toString('latin1');
}

const bilder = (pdf: string) => (pdf.match(/\/Subtype \/Image/g) ?? []).length;

describe('PDF des Bewerbers (Browser-Satz, L4)', () => {
  it('ohne Kontaktzeile und Foto genau die Team-PDF (gleiche Bytes)', async () => {
    const dok = dokument('farbband');
    const team = (await mappePdf(dok, ERSTELLT)).pdf.toString('latin1');
    expect(await bewerberPdf(dok, {})).toBe(team);
    expect(await bewerberPdf(dok, { kontakt: null, foto: null })).toBe(team);
  });

  it('Kontaktzeile unter dem Namen auf beiden Seiten; die Team-PDF hat keine', async () => {
    const dok = dokument();
    const ohne = await bewerberPdf(dok, {});
    const mit = await bewerberPdf(dok, { kontakt: 'Wetzlar · 0171 2345678 · max@example.de' });
    expect(mit).not.toBe(ohne);
    expect(seitenZaehlen(mit)).toBe(2);
    expect(bilder(mit)).toBe(0);
  });

  it('Foto rechts im Kopf des Lebenslaufs, je Form ein anderer Zuschnitt, auch im Farbband', async () => {
    for (const vorlage of ['schlicht', 'farbband'] as const) {
      const dok = dokument(vorlage);
      const formen = new Set<string>();
      for (const form of FOTOFORMEN) {
        const pdf = await bewerberPdf(dok, { kontakt: 'Wetzlar', foto: { src: JPEG, form } });
        expect(bilder(pdf), `${vorlage}/${form}`).toBe(1);
        expect(seitenZaehlen(pdf), `${vorlage}/${form}`).toBe(2);
        formen.add(pdf);
      }
      expect(formen.size, vorlage).toBe(FOTOFORMEN.length);
    }
  }, 30_000);
});

describe('Browser-Satz bleibt außerhalb des Erstladens (L4)', () => {
  const ROOT = process.cwd();
  const quelltext = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');

  it('satz.tsx, browser.tsx und foto.ts ohne server-only, node: und Pfade', () => {
    for (const datei of ['lib/mappe/pdf/satz.tsx', 'lib/mappe/pdf/browser.tsx', 'lib/mappe/pdf/foto.ts']) {
      expect(quelltext(datei), datei).not.toMatch(/^import ['"]server-only['"]|^import [^;]*from ['"](?:node:|fs['"]|path['"])|process\.cwd\(/m);
    }
  });

  it('react-pdf und lib/mappe/pdf/browser nie statisch in components/ oder app/ (nur per import())', () => {
    const dateien: string[] = [];
    const sammeln = (ordner: string) => {
      for (const name of readdirSync(path.join(ROOT, ordner))) {
        const rel = path.join(ordner, name);
        if (name === '__tests__') continue;
        if (statSync(path.join(ROOT, rel)).isDirectory()) sammeln(rel);
        else if (/\.(tsx?|jsx?)$/.test(name)) dateien.push(rel);
      }
    };
    sammeln('components');
    sammeln('app');
    const statisch = dateien.filter((datei) =>
      /^import (?!type )[^;]*from ['"](?:@react-pdf\/renderer|@\/lib\/mappe\/pdf\/(?:browser|satz|foto))['"]/m.test(quelltext(datei)),
    );
    expect(statisch).toEqual([]);
    expect(quelltext('components/mappe/PdfHerunterladen.tsx')).toContain("import('@/lib/mappe/pdf/browser')");
  });
});
