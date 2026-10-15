import type { Metadata } from 'next';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ArbeitenBeiUnsPage, { generateMetadata as hubMetadata, revalidate as hubRevalidate } from '@/app/arbeiten-bei-uns/page';
import ThemaPage, {
  dynamicParams,
  generateMetadata as themaMetadata,
  generateStaticParams,
  revalidate as themaRevalidate,
} from '@/app/arbeiten-bei-uns/[thema]/page';
import {
  generateStaticParams as imageParams,
  revalidate as imageRevalidate,
} from '@/app/arbeiten-bei-uns/[thema]/opengraph-image';
import { JsonLd } from '@/components/seo/JsonLd';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { ANDERE_ABLAEUFE_TITEL, FUER_FACHKRAEFTE, getProcessSteps, sammelAblauf } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import type { PageGraph } from '@/lib/seo/graph';
import { DEFAULT_OG_IMAGE, OG_ZEICHNUNG_STAND } from '@/lib/seo/og-image';
import { ARBEITEN_PATH, THEMA_IDS, getThemen, themaPath } from '@/lib/themen/registry';
import { claimsInHtml } from '../../../scripts/qa/check-claims.mjs';

/**
 * Routen unter /arbeiten-bei-uns (E-028): statisch (fünf Segmente, sonst 404), stündlich neu, Metadaten aus dem
 * Textmodell mit Canonical auf sich selbst, ein Graph je Seite (Hub: CollectionPage mit ItemList; Thema: WebPage), der
 * sichtbare Pfad = BreadcrumbList, und im gerenderten HTML keine feste Arbeitszeit (B28).
 */

type Node = Record<string, unknown>;
const jobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));
const params = (thema: string) => ({ params: Promise.resolve({ thema }) });

function graphOf(element: ReactNode): PageGraph {
  if (!isValidElement<{ children?: ReactNode }>(element)) throw new Error('kein Element');
  const graphs = Children.toArray(element.props.children)
    .filter((child): child is ReactElement<{ data: PageGraph }> => isValidElement(child) && child.type === JsonLd)
    .map((child) => child.props.data);
  expect(graphs).toHaveLength(1);
  return graphs[0];
}

const ofType = (graph: PageGraph, type: string) => (graph['@graph'] as unknown as Node[]).filter((node) => [node['@type']].flat().includes(type));

function visibleCrumbs(html: string): string[] {
  const nav = [...html.matchAll(/<nav aria-label="Brotkrümelnavigation"[^>]*>(.*?)<\/nav>/g)].map((m) => m[1]).find((inner) => inner.includes('<ol')) ?? '';
  return [...nav.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
}

const canonicalOf = (meta: Metadata) => meta.alternates?.canonical;

async function digestOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return String((error as { digest?: string }).digest ?? error);
  }
  throw new Error('kein Fehler');
}

describe('Routen unter /arbeiten-bei-uns', () => {
  it('fünf statische Themen, unbekannte Segmente 404; stündlich neu wie /jobs', async () => {
    expect(generateStaticParams()).toEqual(THEMA_IDS.map((thema) => ({ thema })));
    expect(imageParams()).toEqual(THEMA_IDS.map((thema) => ({ thema })));
    expect(dynamicParams).toBe(false);
    expect([hubRevalidate, themaRevalidate, imageRevalidate]).toEqual([3600, 3600, 3600]);
    expect(await digestOf(ThemaPage(params('arbeitszeit')))).toMatch(/^NEXT_HTTP_ERROR_FALLBACK;404/);
    expect(await themaMetadata(params('arbeitszeit'))).toEqual({});
  });

  it('Hub: Canonical, Standardbild, CollectionPage mit ItemList und BreadcrumbList, eine h1', () => {
    const meta = hubMetadata();
    expect(canonicalOf(meta)).toBe(getCleanCanonicalUrl(ARBEITEN_PATH));
    expect(meta.openGraph?.images).toEqual([{ ...DEFAULT_OG_IMAGE }]);
    const element = ArbeitenBeiUnsPage();
    const graph = graphOf(element);
    expect(ofType(graph, 'CollectionPage')).toHaveLength(1);
    expect(ofType(graph, 'ItemList')).toHaveLength(1);
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(1);
    expect(ofType(graph, 'JobPosting')).toHaveLength(0);
    expect(ofType(graph, 'FAQPage')).toHaveLength(0);
    const html = renderToStaticMarkup(element);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Arbeiten bei uns']);
    for (const thema of getThemen()) expect(html).toContain(`href="${themaPath(thema)}"`);
    for (const job of jobs) expect(html).toContain(`href="${jobPath(job)}"`);
    expect(claimsInHtml(html)).toEqual([]);
  });

  it.each(THEMA_IDS)('Thema %s: Canonical, eigenes Teilen-Bild, WebPage und BreadcrumbList, Links, WhatsApp-Gruß', async (id) => {
    const thema = getThemen().find((t) => t.id === id)!;
    const meta = await themaMetadata(params(id));
    expect(canonicalOf(meta)).toBe(getCleanCanonicalUrl(themaPath(thema)));
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toMatch(new RegExp(`^${themaPath(thema)}/opengraph-image\\?v=\\d{4}-\\d{2}-\\d{2}&z=${OG_ZEICHNUNG_STAND}$`));

    const element = await ThemaPage(params(id));
    const graph = graphOf(element);
    expect(ofType(graph, 'WebPage')).toHaveLength(1);
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(1);
    for (const type of ['CollectionPage', 'ItemList', 'JobPosting', 'FAQPage', 'Place']) expect(ofType(graph, type), type).toHaveLength(0);

    const html = renderToStaticMarkup(element);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(visibleCrumbs(html)).toEqual(['Startseite', 'Arbeiten bei uns', thema.name]);
    // Weitere Themen: die übrigen vier und der Hub
    for (const other of getThemen().filter((t) => t.id !== id)) expect(html).toContain(`href="${themaPath(other)}"`);
    expect(html).toContain(`href="${ARBEITEN_PATH}"`);
    expect(html).toContain(`text=${encodeURIComponent(WHATSAPP_GREETING)}`);
    expect(claimsInHtml(html)).toEqual([]);
    if (id === 'fahrzeug-und-werkzeug') {
      // Kopfbild Servicefahrzeug (E-029): ein Bild, sein Name beschreibt diese Zeichnung, nicht die alte mit Rohrpaar
      expect(html.match(/data-zeichnung="servicefahrzeug"/g)).toHaveLength(1);
      expect(html).toMatch(/role="img" aria-label="Transporter von der Seite, die Schiebetür offen[^"]*"[^>]*data-zeichnung="servicefahrzeug"/);
      expect(html).not.toMatch(/Rohrpaar|Dachträger/);
    }
    if (id === 'diskret-wechseln') {
      // Laufzettel (E-029): echter Text in drei Zeilen statt Abzweig mit Blindflansch, ohne Bildnamen. Seit E-031 steht
      // vor „Dein Arbeitgeber“ genau eine dekorative Absperrung: Leitung mit geschlossenem Kugelhahn, ohne Text im Bild
      const zettel = /<div[^>]*data-zeichnung="laufzettel"[^>]*>([\s\S]*?)<\/dl>/.exec(html)?.[1] ?? '';
      expect(zettel).toMatch(
        /<dt[^>]*>Von<\/dt><dd[^>]*>Du<\/dd>[\s\S]*<dt[^>]*>An<\/dt><dd[^>]*>Wetzlar<\/dd>[\s\S]*<dt[^>]*>Nicht an<\/dt><dd[^>]*><svg [^>]*aria-hidden="true"[^>]*data-zeichnung="absperrung">(?:(?!<\/svg>|<text)[\s\S])*<\/svg>Dein Arbeitgeber<\/dd>/,
      );
      expect(zettel.match(/data-zeichnung="absperrung"/g)).toHaveLength(1);
      expect(zettel.match(/data-symbol="kugelhahnGeschlossen"/g)).toHaveLength(1);
      expect(zettel).not.toMatch(/data-symbol="kugelhahn"/);
      expect(zettel).not.toContain('role="img"');
      expect(html).not.toMatch(/Blindflansch|Abzweig/);
      // Sammelfläche (Runde 3): „Wohin du wechseln kannst“ zeigt auch Büro, Ausbildung und Praktikum; der unbefristete
      // Vertrag mit Werkzeug und Fahrzeug steht nur als Schritt der Fachkräfte, darunter die anderen Abläufe
      const text = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/[\s\u00a0]+/g, ' ');
      expect(jobs.some((job) => job.category === 'buero')).toBe(true);
      expect(text).toContain(`${FUER_FACHKRAEFTE}: ${getProcessSteps('fachkraft')[2].text}`);
      expect(text.match(/unbefristeten/g)).toHaveLength(1);
      expect(text).toContain(ANDERE_ABLAEUFE_TITEL);
      for (const variante of sammelAblauf(jobs).varianten) expect(text, variante.name).toContain(`${variante.name} ${variante.text}`);
      expect(sammelAblauf(jobs).varianten.map((variante) => variante.audience)).toEqual(expect.arrayContaining(['quereinstieg', 'buero']));
    }
    if (id === 'gehalt') {
      // „Bezahlung und Extras“ (E-030): jede live Stelle mit Lohn auf Anfrage; das Schülerpraktikum sagt nichts zu Geld
      for (const job of jobs) {
        if (job.pay === 'auf-anfrage') expect(html, job.id).toContain(`href="${jobPath(job)}"`);
        else expect(html, job.id).not.toContain(`href="${jobPath(job)}"`);
      }
      expect(jobs.some((job) => job.pay === 'keine-angabe')).toBe(true);
    }
  });
});
