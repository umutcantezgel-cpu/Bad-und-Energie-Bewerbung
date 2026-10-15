import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerender } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { getFaqItems } from '@/lib/content/faq';
import { PAY_ON_REQUEST, jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import {
  ANDERE_ABLAEUFE_TITEL,
  DISCRETION_PROMISE,
  FUER_FACHKRAEFTE,
  PROCESS_INTRO,
  getProcessSteps,
  sammelAblauf,
} from '@/lib/content/process';
import { buildFaqPageJsonLd } from '../content';
import { AboutSection } from '../AboutSection';
import { BenefitGrid } from '../BenefitGrid';
import { FaqSection } from '../FaqSection';
import { ProcessTimeline } from '../ProcessTimeline';
import { JobList, stellenEtikett } from '../JobList';
import { RegionSection } from '../RegionSection';
import { SectionHeader } from '../SectionHeader';
import { ABLAUF_KOPF, FAQ_KOPF } from '../woche/abschnitte-text';

/** Server-Render mit Suspense (Startseite: die Karte des Einsatzgebiets lädt nach). */
async function vollstaendig(element: ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;
const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

describe('SectionHeader (Props nur ergänzt)', () => {
  it('ohne neue Props: h2 mit id, Titel und Einleitung wie bisher, in Marken-Navy und Display-Schrift', () => {
    const html = renderToStaticMarkup(createElement(SectionHeader, { id: 'x-title', title: 'Titel', lead: 'Einleitung' }));
    expect(html).toMatch(/<h2 id="x-title" class="text-title-1 text-brand">Titel<\/h2>/);
    expect(html).toContain('<p class="max-w-prose text-lead text-ink-muted">Einleitung</p>');
    expect(html).not.toContain('text-etikett');
    expect(html).not.toContain('aria-hidden');
  });

  it('className wirkt weiter auf den äußeren Block', () => {
    const html = renderToStaticMarkup(createElement(SectionHeader, { id: 'x', title: 'T', className: 'lg:col-span-5' }));
    expect(html).toMatch(/^<div class="[^"]*lg:col-span-5/);
  });

  it('eyebrow setzt ein Etikett vor die Überschrift', () => {
    const html = renderToStaticMarkup(createElement(SectionHeader, { id: 'x', title: 'T', eyebrow: 'Etikett' }));
    expect(html.indexOf('<p class="text-etikett text-ink-muted">Etikett</p>')).toBeLessThan(html.indexOf('<h2'));
  });

  it('E-031: Rohrklammer nur mit `klammer` an der h2, dekorativ; ohne bleibt die h2 ohne Zeichnung (Startseite)', () => {
    const ohne = renderToStaticMarkup(createElement(SectionHeader, { id: 'x', title: 'Zwei Zeilen' }));
    expect(ohne).toContain('<h2 id="x" class="text-title-1 text-brand">Zwei Zeilen</h2>');
    expect(ohne).not.toMatch(/rohrklammer|<svg|pl-8/);
    const mit = renderToStaticMarkup(createElement(SectionHeader, { id: 'x', title: 'Zwei Zeilen', klammer: true }));
    // genau eine Klammer, vor dem Titel in der h2, in einem dekorativen Rahmen; der zugängliche Name bleibt der Titel
    expect(mit.match(/data-zeichnung="rohrklammer"/g)).toHaveLength(1);
    expect(mit).toMatch(
      /<h2 id="x" class="text-title-1 text-brand relative pl-8"><span aria-hidden="true" class="[^"]*klammerRahmen[^"]*"><svg class="[^"]*" aria-hidden="true" focusable="false" data-zeichnung="rohrklammer">[\s\S]*?<\/svg><\/span>Zwei Zeilen<\/h2>/,
    );
    expect(mit).not.toMatch(/<title|role=/);
  });
});

describe('ProcessTimeline (#ablauf, E-START-027)', () => {
  const html = renderToStaticMarkup(createElement(ProcessTimeline));
  const steps = getProcessSteps('fachkraft');

  it('Etikett, Titel und Einleitung im Wortlaut', () => {
    expect(html).toContain(`>${ABLAUF_KOPF.etikett}</p>`);
    expect(html).toContain(`>${PROCESS_INTRO.title}</h2>`);
    expect(html).toContain(`>${PROCESS_INTRO.text}</p>`);
    expect(html).toMatch(/<section[^>]*id="ablauf"[^>]*aria-labelledby="ablauf-title"/);
  });

  it('drei Schritte als geordnete Liste mit Nummer 01–03, Titel, Text und Etikett', () => {
    expect(count(html, /<li /g)).toBe(3);
    steps.forEach((step, i) => {
      expect(html).toContain(`>0${i + 1}</span>`);
      expect(html).toContain(`<span class="sr-only">Schritt ${step.number}: </span>${step.title}</h3>`);
      expect(decode(html)).toContain(step.text);
      expect(html).toContain(`>${step.highlight}</p>`);
    });
  });

  it('der Leitungsstrang ist rein grafisch: Vorlauf und Rücklauf, mobil und ab lg', () => {
    const strang = html.match(/<span aria-hidden="true" class="pointer-events-none absolute inset-y-0[\s\S]*$/)?.[0] ?? '';
    expect(strang).toContain('border-vorlauf');
    expect(strang).toContain('border-ruecklauf');
    expect(html).toMatch(/aria-hidden="true" class="pointer-events-none absolute top-0 right-0 hidden w-screen rounded-r-voll lg:block/);
    expect(html).toMatch(/<section[^>]*class="[^"]*overflow-x-clip/);
  });

  it('Sammelfläche (Runde 3): Schritt 3 „Für Fachkräfte“, darunter die Abläufe der anderen live Stellen im Wortlaut', () => {
    const live = getActiveJobs().filter((job) => isJobLive(job, new Date()));
    expect(live.some((job) => job.category === 'buero')).toBe(true);
    const text = decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
    expect(text).toContain(`${FUER_FACHKRAEFTE}: ${steps[2].text}`);
    // Unbefristeter Vertrag, Hilti-Set und Servicefahrzeug nie ohne Bezug neben dem Büro (Befristung offen, S5)
    expect(count(text, /unbefristeten/g)).toBe(1);
    expect(text).toContain(ANDERE_ABLAEUFE_TITEL);
    const { varianten } = sammelAblauf(live);
    expect(varianten.map((variante) => variante.name)).toEqual(['Ausbildung', 'Quereinstieg', 'Büro', 'Schülerpraktikum']);
    for (const variante of varianten) expect(text).toContain(`${variante.name} ${variante.text}`);
    // Ohne Stellen mit anderem Ablauf (Stichtag nach dem Ende aller Stellen): Schritt 3 ohne Bezug, keine Varianten
    const ohne = decode(renderToStaticMarkup(createElement(ProcessTimeline, { now: new Date('2099-01-01T00:00:00Z') })));
    expect(ohne).toContain(steps[2].text);
    expect(ohne).not.toContain(FUER_FACHKRAEFTE);
    expect(ohne).not.toContain(ANDERE_ABLAEUFE_TITEL);
  });

  it('Diskretionszusage sichtbar und genau ein Knopf zu /bewerbung als Hauptaktion', () => {
    expect(html).toContain(DISCRETION_PROMISE);
    expect(count(html, /href="\/bewerbung"/g)).toBe(1);
    expect(html).toMatch(/<div data-primary-cta="true" class="shrink-0"><a [^>]*href="\/bewerbung"[^>]*>Jetzt bewerben<\/a>/);
  });

  it('Wand ohne Leitungstrenner und ohne Rohrklammer (E-029); Abgänge auf der Abstandsskala (24 px)', () => {
    expect(html).toMatch(/<section class="[^"]*bg-surface-2[^"]*"[^>]*id="ablauf"/);
    expect(html).not.toContain('data-zeichnung="leitungstrenner"');
    expect(html).not.toContain('data-zeichnung="rohrklammer"');
    expect(html).not.toMatch(/\b[wh]-7\b/);
    expect(html).toContain('w-6');
  });

  it('Icon aus der eigenen Familie statt lucide (Linienart icon, 2 px seit E-029)', () => {
    expect(html).not.toContain('lucide');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('stroke-width:var(--m-icon, 2px)');
  });
});

describe('FaqSection (#faq, E-START-050)', () => {
  const html = renderToStaticMarkup(createElement(FaqSection));
  const items = getFaqItems();

  it('Überschrift bleibt „Häufige Fragen“, die Einleitung des Altstands kehrt zurück', () => {
    // Einzeilige Überschrift: ohne Rohrklammer (die Klammer fasst zwei Zeilen, wie im Einstieg)
    expect(html).toContain(`id="faq-title" class="text-title-1 text-brand">${FAQ_KOPF.titel}</h2>`);
    expect(html).toContain(`>${FAQ_KOPF.einleitung}</p>`);
  });

  it('Kopf im Muster des Einstiegs: Etikett „FAQ“; Wand, getrennt durch den Flächenwechsel (E-029)', () => {
    expect(html).toContain(`<p class="text-etikett text-ink-muted">${FAQ_KOPF.etikett}</p>`);
    expect(html).toMatch(/<section class="[^"]*bg-surface-2[^"]*"[^>]*id="faq"/);
    expect(html).not.toContain('data-zeichnung="leitungstrenner"');
  });

  it('fünf Fragen als exklusives Akkordeon (Disclosure, name="faq")', () => {
    expect(items).toHaveLength(5);
    expect(count(html, /<details name="faq"/g)).toBe(5);
    expect(html).not.toMatch(/<details[^>]* open=""/);
  });

  // V6-B: Die FAQPage steht im einen Graphen der Startseite (app/page.tsx, buildFaqPageJsonLd(getFaqItems()),
  // geprüft in lib/seo/__tests__/graph.test.ts), nicht mehr als eigener Block im Abschnitt; der Wortlaut bleibt.
  it('das JSON-LD trägt genau den sichtbaren Wortlaut (unverändert)', () => {
    expect(html).not.toContain('application/ld+json');
    const data = buildFaqPageJsonLd(items);
    expect(data.mainEntity).toHaveLength(items.length);
    const visible = decode(html);
    for (const q of data.mainEntity) {
      expect(visible).toContain(`>${q.name}</span>`);
      expect(visible).toContain(`>${q.acceptedAnswer.text}</p>`);
    }
  });
});

describe('Abschnitte der Startseite: Flächenwechsel statt Leitungstrenner (E-029)', () => {
  it('kein Abschnitt trägt das Leitungspaar; die Töne wechseln (Papier, Wand) von Abschnitt zu Abschnitt', async () => {
    const NOW = new Date('2026-10-09T12:00:00Z');
    // Die Karte im Einsatzgebiet lädt nach (Suspense): darum der vollständige Server-Render wie in next build
    const folge = await Promise.all(
      [
        createElement(JobList, { now: NOW }),
        createElement(BenefitGrid, { now: NOW }),
        createElement(RegionSection),
        createElement(ProcessTimeline),
        createElement(AboutSection),
        createElement(FaqSection),
      ].map(vollstaendig),
    );
    const toene = folge.map((html) => (/^<section class="[^"]*bg-surface-2/.test(html) ? 'wand' : 'papier'));
    expect(toene).toEqual(['papier', 'wand', 'papier', 'wand', 'papier', 'wand']);
    for (const html of folge) {
      expect(html).not.toContain('data-zeichnung="leitungstrenner"');
      expect(html).not.toContain('data-zeichnung="rohrklammer"');
      expect(html).not.toMatch(/^<section class="[^"]*relative pt-24/);
    }
  });
});

describe('JobList (#stellen, E-START-023)', () => {
  const NOW = new Date('2026-10-09T12:00:00Z');
  const live = getActiveJobs().filter((job) => isJobLive(job, NOW));
  const html = renderToStaticMarkup(createElement(JobList, { now: NOW }));

  it('Etikett zählt die Stellen, die gerade live sind, und nennt den Ort', () => {
    expect(stellenEtikett(4)).toBe(`4\u00a0Stellen · ${COMPANY.address.city}`);
    expect(stellenEtikett(1)).toBe(`1\u00a0Stelle · ${COMPANY.address.city}`);
    expect(html).toContain(`<p class="text-etikett text-ink-muted">${stellenEtikett(live.length)}</p>`);
  });

  it('Papier ohne Leitungstrenner; je live Stelle eine Zeile mit „Lohn auf Anfrage“ (E-030) und benannter Liste', () => {
    expect(html).toMatch(/<section class="py-section"[^>]*id="stellen"/);
    expect(html).not.toMatch(/<section class="[^"]*bg-surface-2/);
    expect(html).not.toContain('data-zeichnung="leitungstrenner"');
    expect(html).toContain(`aria-label="${live.length} offene Stellen"`);
    for (const job of live) expect(html).toContain(`href="${jobPath(job)}"`);
    // Je Stelle mit Lohnangabe einmal „Lohn auf Anfrage“; das Schülerpraktikum sagt nichts zu Geld
    expect(html.split(`>${PAY_ON_REQUEST}<`).length - 1).toBe(live.filter((job) => job.pay === 'auf-anfrage').length);
    expect(html).not.toMatch(/€|Gehalt \/ Monat/);
  });
});
