import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content';
import { PAY_ON_REQUEST } from '@/lib/jobs/format';
import { getActiveJobs, getJobBySlug } from '@/lib/jobs/registry';
import { OG_TITLE_BOX, fitTitle, ogHomeText, ogJobText, ogPlaceText, placeOgImage, splitSentences, splitTitle } from '@/lib/seo/og-image';
import { renderHomeImage, renderJobImage, renderPlaceImage } from '@/lib/seo/og-render';
import { getPlaceBySlug, getPublishedPlaces, placePath } from '@/lib/places/registry';
import { getPlacePageText } from '@/lib/places/text';

const plain = (text: string) => text.replace(/ /g, ' ');
const ROOT = path.resolve(__dirname, '../../..');

describe('root share image text (hero of the home page)', () => {
  const text = ogHomeText();

  it('breaks the h1 after its first word and the subline after each sentence', () => {
    expect(splitTitle('SHK-Jobs in Wetzlar.')).toEqual(['SHK-Jobs', 'in Wetzlar.']);
    expect(splitSentences('Ehrliches Handwerk. Flexible Arbeitszeiten.')).toEqual(['Ehrliches Handwerk.', 'Flexible Arbeitszeiten.']);
    expect(text.title).toEqual(['SHK-Jobs', 'in Wetzlar.']);
    expect(text.subline).toEqual(['Ehrliches Handwerk.', 'Flexible Arbeitszeiten.']);
  });

  it('takes every figure from the fact registry', () => {
    // Leitmotiv „35 km“ (E-027): der Radius mit Hinweislinie zum Zirkel im Giebel, wie im Einstieg; keine Uhrzeit
    expect(text.radius).toEqual({ value: FACTS.radius35.value, name: 'Einsatzgebiet rund um Wetzlar' });
    expect(text.measures.map((m) => m.value)).toEqual([FACTS.vacation30.value, FACTS.founded1926.value]);
    expect(text.measures.map((m) => m.name)).toEqual(['Tage Urlaub', 'Gegründet']);
    expect(text.texts.join(' ')).not.toMatch(/13:30|Feierabend|pünktlich/i);
    expect(text.etikett).toBe('SEIT 1926 · WETZLAR');
    expect(text.microcopy).toContain(`${FACTS.apply60s.value} Sekunden`);
    expect(text.action).toBe('Jetzt bewerben');
  });
});

describe('fitTitle', () => {
  it('fits every job title into the left column, in at most three lines', () => {
    for (const job of getActiveJobs()) {
      const { lines, size } = fitTitle(job.shortTitle, job.titleShy);
      expect(lines.length).toBeLessThanOrEqual(3);
      expect(size).toBeGreaterThanOrEqual(64);
      expect(lines.length * OG_TITLE_BOX.lineHeight * size).toBeLessThanOrEqual(OG_TITLE_BOX.height);
      for (const line of lines) expect(line.length * 0.54 * size).toBeLessThanOrEqual(OG_TITLE_BOX.width);
      // Only the job's own break points: joined again, the lines give the short title.
      expect(lines.join(' ').replace(/- /g, '').replace(/\s+/g, ' ')).toBe(job.shortTitle);
    }
  });

  it('hyphenates only where titleShy has a soft hyphen', () => {
    expect(fitTitle('Kundendiensttechniker', 'Kunden­dienst­techniker SHK').lines).toEqual(['Kundendienst-', 'techniker']);
    expect(fitTitle('Kundendiensttechniker').lines).toEqual(['Kundendiensttechniker']);
    expect(fitTitle('Obermonteur / Projektleiter', 'Ober­monteur / Projekt­leiter').lines).toEqual(['Obermonteur /', 'Projektleiter']);
  });

  it('keeps a short title on one line at full size', () => {
    expect(fitTitle('Monteur')).toEqual({ lines: ['Monteur'], size: OG_TITLE_BOX.max });
  });
});

describe('job share image text', () => {
  const job = getJobBySlug('anlagenmechaniker-shk-wetzlar');
  const azubi = getJobBySlug('ausbildung-anlagenmechaniker-shk-wetzlar');

  it('puts „Lohn auf Anfrage“ into the heating loop, never an amount (E-030)', () => {
    if (!job || !azubi) throw new Error('Stellen fehlen in der Registry');
    const text = ogJobText(job, true);
    expect(text.salary).toEqual({ value: PAY_ON_REQUEST, name: null });
    expect(text.etikett).toBe('STELLE · WETZLAR + 35 KM');
    expect(text.subline).toEqual(['(m/w/d)', 'Vollzeit · Unbefristet']);
    expect(text.action).toBe('Jetzt bewerben');
    expect(ogJobText(azubi, true).salary).toEqual({ value: PAY_ON_REQUEST, name: null });
    expect(ogJobText(azubi, true).subline).toEqual(['(m/w/d)', '3,5 Jahre']);
    for (const open of getActiveJobs()) expect(ogJobText(open, true).texts.join(' '), open.id).not.toMatch(/€|\d\.\d{3}|pro Monat/);
  });

  it('the school internship says nothing about money: the loop names the kind of job (fakten-abgleich S4)', () => {
    const praktikum = getJobBySlug('schuelerpraktikum-shk-wetzlar');
    if (!praktikum) throw new Error('Praktikum fehlt in der Registry');
    expect(ogJobText(praktikum, true).salary).toEqual({ value: 'Praktikum', name: null });
    expect(ogJobText(praktikum, true).texts.join(' ')).not.toMatch(/Lohn|Gehalt|Vergütung/);
  });

  it('says a closed job is filled, without button and without salary', () => {
    if (!job) throw new Error('Stelle fehlt in der Registry');
    const text = ogJobText(job, false);
    expect(text.action).toBeNull();
    expect(text.salary).toEqual({ value: 'Stelle besetzt', name: null });
    expect(text.texts.join(' ')).not.toMatch(/€|undefined|null/);
  });
});

describe('share image assets', () => {
  it('ships static TTF cuts of the site fonts and fetches nothing from Google', () => {
    for (const file of [
      'bricolage-grotesque-800.ttf',
      'bricolage-grotesque-700.ttf',
      'atkinson-hyperlegible-next-400.ttf',
      'atkinson-hyperlegible-next-700.ttf',
      'martian-mono-600.ttf',
    ]) {
      const data = readFileSync(path.join(ROOT, 'lib/seo/og-fonts', file));
      expect(data.readUInt32BE(0)).toBe(0x00010000);
    }
    const source = readFileSync(path.join(ROOT, 'lib/seo/og-render.tsx'), 'utf8');
    expect(source).not.toMatch(/googleapis|fetch\(/);
  });

  it('renders the root and a closed job image as PNG', async () => {
    const job = getJobBySlug('anlagenmechaniker-shk-wetzlar');
    if (!job) throw new Error('Stelle fehlt in der Registry');
    for (const response of [await renderHomeImage(ogHomeText()), await renderJobImage(ogJobText(job, false))]) {
      expect(response.headers.get('content-type')).toBe('image/png');
      const png = Buffer.from(await response.arrayBuffer());
      expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    }
  }, 30_000);
});

describe('place share image text (E-028)', () => {
  it.each(getPublishedPlaces().map((place) => [place.id, place] as const))('%s: h1 and etikett of the page, road distance in the loop', (_id, place) => {
    const page = getPlacePageText(place);
    const text = ogPlaceText({ etikett: page.etikett, h1: page.meta.h1, distanceKm: place.commute.distanceKm, minutes: place.commute.minutes });
    expect(text.distance).toEqual({ value: `${place.commute.distanceKm} km`, name: 'bis zum Firmensitz' });
    expect(text.title.join(' ').replace(/- /g, '-')).toContain(place.name.split(' ')[0]);
    expect(text.title.length).toBeLessThanOrEqual(3);
    expect(text.subline).toEqual([`Rund ${place.commute.minutes} Minuten Fahrt.`, FACTS.flexibleHours.long]);
    for (const t of text.texts) expect(t).not.toMatch(/13[:.]30|pünktlich|Feierabend|\u00A0/);
  });

  it('links the image per place with a versioned url and an alt that names the distance', () => {
    const herborn = getPlaceBySlug('herborn')!;
    const image = placeOgImage({ path: placePath(herborn), name: herborn.name, updatedAt: herborn.updatedAt, distanceKm: herborn.commute.distanceKm });
    expect(image.url).toBe(`/einsatzgebiet/herborn/opengraph-image?v=${herborn.updatedAt}`);
    expect(image.alt).toContain('27 km bis zum Firmensitz');
  });

  it('renders a PNG', async () => {
    const herborn = getPlaceBySlug('herborn')!;
    const page = getPlacePageText(herborn);
    const response = await renderPlaceImage(ogPlaceText({ etikett: page.etikett, h1: page.meta.h1, distanceKm: 27, minutes: 26 }));
    expect(response.headers.get('content-type')).toBe('image/png');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });
});
