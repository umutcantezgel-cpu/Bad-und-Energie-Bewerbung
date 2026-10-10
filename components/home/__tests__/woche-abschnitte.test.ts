import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { getFaqItems } from '@/lib/content/faq';
import { formatSalaryAmount, jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { DISCRETION_PROMISE, PROCESS_INTRO, getProcessSteps } from '@/lib/content/process';
import { buildFaqPageJsonLd } from '../content';
import { FaqSection } from '../FaqSection';
import { ProcessTimeline } from '../ProcessTimeline';
import { JobList, stellenEtikett } from '../JobList';
import { SectionHeader } from '../SectionHeader';
import { ABLAUF_KOPF, FAQ_KOPF } from '../woche/abschnitte-text';

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

  it('klammer setzt die Rohrklammer aus components/zeichnung rein grafisch in die h2', () => {
    const html = renderToStaticMarkup(createElement(SectionHeader, { id: 'x', title: 'Zwei Zeilen', klammer: true }));
    expect(html).toMatch(/<h2 id="x" class="text-title-1 text-brand relative pl-8"><span aria-hidden="true"/);
    expect(html).toContain('data-zeichnung="rohrklammer"');
    expect(html).toMatch(/class="pointer-events-none absolute top-\[0\.2em\] bottom-\[0\.2em\] left-0"/);
    // Der zugängliche Name bleibt der Text
    expect(html).toMatch(/<\/svg><\/span>Zwei Zeilen<\/h2>/);
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

  it('Diskretionszusage sichtbar und genau ein Knopf zu /bewerbung als Hauptaktion', () => {
    expect(html).toContain(DISCRETION_PROMISE);
    expect(count(html, /href="\/bewerbung"/g)).toBe(1);
    expect(html).toMatch(/<div data-primary-cta="true" class="shrink-0"><a [^>]*href="\/bewerbung"[^>]*>Jetzt bewerben<\/a>/);
  });

  it('Wand mit Leitungstrenner und Rohrklammer am Kopf; Abgänge auf der Abstandsskala (24 px)', () => {
    expect(html).toMatch(/<section class="[^"]*bg-surface-2[^"]*"[^>]*id="ablauf"/);
    expect(html).toContain('data-zeichnung="leitungstrenner"');
    expect(html).toContain('data-zeichnung="rohrklammer"');
    expect(html).not.toMatch(/\b[wh]-7\b/);
    expect(html).toContain('w-6');
  });

  it('Icon aus der eigenen Familie statt lucide', () => {
    expect(html).not.toContain('lucide');
    expect(html).toContain('stroke-width="3"');
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

  it('Kopf im Muster des Einstiegs: Etikett „FAQ“; Wand mit Leitungstrenner (E-023)', () => {
    expect(html).toContain(`<p class="text-etikett text-ink-muted">${FAQ_KOPF.etikett}</p>`);
    expect(html).toMatch(/<section class="[^"]*bg-surface-2[^"]*"[^>]*id="faq"/);
    expect(html).toContain('data-zeichnung="leitungstrenner"');
  });

  it('fünf Fragen als exklusives Akkordeon (Disclosure, name="faq")', () => {
    expect(items).toHaveLength(5);
    expect(count(html, /<details name="faq"/g)).toBe(5);
    expect(html).not.toMatch(/<details[^>]* open=""/);
  });

  it('das JSON-LD trägt genau den sichtbaren Wortlaut (unverändert)', () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '';
    const data = JSON.parse(json);
    expect(data).toEqual(buildFaqPageJsonLd(items));
    const visible = decode(html);
    for (const q of data.mainEntity) {
      expect(visible).toContain(`>${q.name}</span>`);
      expect(visible).toContain(`>${q.acceptedAnswer.text}</p>`);
    }
  });
});

describe('Leitungstrenner zwischen Abschnitten (E-023, über Section trenner)', () => {
  it('jeder Abschnitt dieses Pakets trägt oben das Leitungspaar, randlos und rein grafisch', () => {
    for (const html of [renderToStaticMarkup(createElement(ProcessTimeline)), renderToStaticMarkup(createElement(FaqSection))]) {
      expect(html).toMatch(/<section class="[^"]*relative pt-24 md:pt-section/);
      expect(html).toMatch(/<svg class="[^"]*pointer-events-none absolute inset-x-0 top-6 md:top-8" aria-hidden="true"[^>]*data-zeichnung="leitungstrenner"/);
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

  it('Papier mit Leitungstrenner; vier Zeilen mit Gehalt aus job.salary und benannter Liste', () => {
    expect(html).toMatch(/<section class="[^"]*relative[^"]*"[^>]*id="stellen"/);
    expect(html).not.toMatch(/<section class="[^"]*bg-surface-2/);
    expect(html).toContain('data-zeichnung="leitungstrenner"');
    expect(html).toContain(`aria-label="${live.length} offene Stellen"`);
    for (const job of live) {
      expect(html).toContain(`href="${jobPath(job)}"`);
      expect(html).toContain(`>${formatSalaryAmount(job)}<`);
    }
  });
});
