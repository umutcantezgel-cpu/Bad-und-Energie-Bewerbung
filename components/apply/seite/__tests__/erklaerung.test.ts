import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { INITIATIVE_OPTION, getFlowJobOptions } from '@/components/apply/options';
import { Erklaerung } from '@/components/apply/seite/Erklaerung';
import { erklaerung, type ErklaerungEingaben } from '@/components/apply/seite/erklaerung-text';
import { REGIONALBAND } from '@/components/apply/seite/seite-text';
import { UNTERLAGEN_ANKER } from '@/components/apply/unterlagen/unterlagen-text';
import { MAPPE_KOPF } from '@/components/mappe/text';
import { MAPPE_PATH } from '@/lib/apply/params';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { getFaqItems } from '@/lib/content/faq';
import { DISCRETION_PROMISE, getProcessIntro, getProcessSteps, type ProcessAudience } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { formatSalaryRange, jobPath } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getFunnelOptions, getJobById, getJobPageSlugs, isJobLive } from '@/lib/jobs/registry';

/**
 * Herkunft des Erklärteils auf /bewerbung (V6-G1): Jeder Satz stammt aus FACTS, lib/content/process,
 * lib/content/faq, den Stellendaten oder den Texten der Mappe; eigene Wörter sind nur Überschriften, Etiketten,
 * Linktexte und drei geprüfte Hinweise, ohne Zahl. Dazu Faktenregel E-023 und die Diskretionszusage.
 */

// Der Flow braucht den App-Router; hier genügt sein Platzhalter (wie in seite.test.ts).
vi.mock('@/components/apply', () => ({
  ApplyFlow: ({ variant, initialJobId }: { variant: string; initialJobId?: string }) =>
    createElement('div', { 'data-apply-flow': variant, 'data-stelle': initialJobId ?? '' }),
}));

const STICHTAG = new Date('2026-10-10T12:00:00+02:00');
const AUDIENCES: ProcessAudience[] = ['fachkraft', 'ausbildung', 'quereinstieg'];

function eingaben(audience: ProcessAudience): ErklaerungEingaben {
  return {
    audience,
    jobs: getActiveJobs().filter((job) => isJobLive(job, STICHTAG)),
    ohneAnzeige: getFunnelOptions(STICHTAG)
      .filter((option) => option.status === 'funnel_only')
      .map((option) => getJobById(option.id)!),
  };
}

const normal = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/[­⁠]/g, '')
    .replace(/[\s ]+/g, ' ')
    .trim();
const sichtbar = (html: string) => normal(html.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' '));
const saetze = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
function textknoten(html: string): string[] {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .split(/<[^>]+>/)
    .flatMap((knoten) => normal(knoten).split(' · '))
    .map((knoten) => knoten.trim())
    .filter(Boolean);
}
const zahlen = (text: string) => (text.match(/\d+/g) ?? []).map((zahl) => zahl.replace(/^0+(?=\d)/, ''));
const render = (element: ReactElement) => renderToStaticMarkup(element);

const KORPUS = normal(
  [
    ...Object.values(FACTS).flatMap((fact) => [fact.short, fact.long]),
    ...AUDIENCES.flatMap((audience) => [
      getProcessIntro(audience).title,
      getProcessIntro(audience).text,
      ...getProcessSteps(audience).flatMap((step) => [String(step.number), step.title, step.text]),
    ]),
    ...getFaqItems().map((faq) => faq.answer),
    ...ALL_JOBS.flatMap((job) => [job.title, job.shortTitle, job.summary, ...job.requirements, formatSalaryRange(job) ?? '']),
    MAPPE_KOPF.titel,
    MAPPE_KOPF.unterzeile,
    MAPPE_KOPF.einleitung,
    COMPANY.address.city,
    COMPANY.shortName,
  ].join('\n'),
);

describe.each(AUDIENCES)('Erklärteil (%s): jeder Satz hat eine Quelle', (audience) => {
  const text = erklaerung(eingaben(audience));
  const html = render(createElement(Erklaerung, eingaben(audience)));
  /** Eigene Wörter, je einzeln geprüft: Überschriften, Etiketten, Linktexte und drei Hinweise. */
  const EIGENE = [
    text.etikett,
    text.titel,
    text.stellen.titel,
    text.stellen.voraussetzung,
    text.stellen.ohneAnzeigeHinweis,
    text.stellen.initiativ,
    text.unterlagen.titel,
    text.unterlagen.mappe,
    ...text.unterlagen.links.map((link) => link.label),
    'Noch angestellt?',
  ].map(normal);

  it('Sätze aus FACTS, Ablauf, FAQ, Stellendaten und Mappe; sonst nur die geprüften eigenen Wörter', () => {
    for (const knoten of textknoten(html)) {
      // Zahlen der Schritte und der nur vorgelesene Trenner zwischen Etikett und Wert
      if (/^(\d+|Schritt \d+:|:)$/.test(knoten)) continue;
      for (const satz of saetze(knoten)) {
        expect(KORPUS.includes(satz) || EIGENE.includes(satz), `ohne Quelle: „${satz}“`).toBe(true);
      }
    }
  });

  it('eigene Wörter: Wortlaut geprüft, ohne Zahl, ohne Superlativ, Bausteine aus ihren Quellen', () => {
    expect(text.titel).toBe(`So läuft deine Bewerbung in ${COMPANY.address.city}`);
    expect(text.stellen.titel).toBe(`Welche Stelle bei ${COMPANY.shortName} passt zu dir?`);
    expect(text.stellen.initiativ).toBe(`Passt keine Stelle, wähle oben „${INITIATIVE_OPTION.label}“.`);
    expect(text.unterlagen.mappe).toBe(
      'Willst du trotzdem Unterlagen zeigen, stellst du in der Bewerbungsmappe Anschreiben und Lebenslauf auf A4 zusammen, zum Drucken oder als PDF.',
    );
    expect(MAPPE_KOPF.unterzeile).toBe('Anschreiben und Lebenslauf auf A4.');
    expect(MAPPE_KOPF.einleitung.startsWith('Zum Drucken oder als PDF.')).toBe(true);
    for (const wort of EIGENE) {
      // „A4“ stammt aus dem Kopf der Mappe (oben geprüft), sonst keine Zahl in eigenen Wörtern
      expect(wort.replace(MAPPE_KOPF.unterzeile.replace(/\.$/, ''), ''), wort).not.toMatch(/\d/);
      expect(wort, wort).not.toMatch(/\b(beste[nrs]?|größte[nrs]?|top|einzigartig|perfekt|garantiert)\b/i);
    }
  });

  it('jede Zahl steht in einer Quelle', () => {
    const belegt = new Set(zahlen(KORPUS));
    for (const zahl of zahlen(sichtbar(html))) expect(belegt.has(zahl), zahl).toBe(true);
  });

  it('mit vorgewählter Stelle (?stelle=) zeigt der Hinweis auf „ändern“, denn der Schritt „Stelle“ entfällt', () => {
    const vor = erklaerung({ ...eingaben(audience), vorausgewaehlt: true });
    expect(text.stellen.ohneAnzeigeHinweis).toBe('Ohne eigene Stellenanzeige, oben im ersten Schritt wählbar.');
    expect(vor.stellen.ohneAnzeigeHinweis).toBe('Ohne eigene Stellenanzeige, oben über „ändern“ wählbar.');
    expect(vor.stellen.initiativ).toBe(`Passt keine Stelle, wähle oben über „ändern“ „${INITIATIVE_OPTION.label}“.`);
    for (const wort of [vor.stellen.ohneAnzeigeHinweis, vor.stellen.initiativ]) expect(wort).not.toMatch(/ersten Schritt/);
  });

  it('Ablauf und Antwort aus lib/content: Fakt quickResponse, Schritte nach Fragenset', () => {
    expect(text.einleitung).toBe(`${FACTS.quickResponse.long} ${getProcessIntro(audience).text}`);
    expect(text.ablauf.schritte).toEqual(getProcessSteps(audience));
    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html.match(/<h3\b/g)).toHaveLength(3);
    expect(html.match(/<h4\b/g)).toHaveLength(3);
  });
});

describe('Erklärteil: Diskretion, Wegweiser und Unterlagen', () => {
  it('die Diskretionszusage im Wortlaut steht nicht im Erklärteil; Kündigungsfrist nur, wenn es einen Arbeitgeber gibt', () => {
    const fachkraft = sichtbar(render(createElement(Erklaerung, eingaben('fachkraft'))));
    expect(fachkraft).not.toContain(DISCRETION_PROMISE);
    expect(fachkraft).toContain('Noch angestellt? Auch bei Kündigungsfristen unterstützen wir dich transparent.');
    expect(getFaqItems().find((faq) => faq.id === 'diskreter-wechsel')?.answer).toContain(
      'Auch bei Kündigungsfristen unterstützen wir dich transparent.',
    );
    const ausbildung = sichtbar(render(createElement(Erklaerung, eingaben('ausbildung'))));
    expect(ausbildung).not.toContain('Kündigungsfrist');
    expect(ausbildung).toContain(getProcessIntro('ausbildung').title);
  });

  it('je Stelle mit Anzeige ein Link, Linktext = voller Titel; Wege ohne Anzeige ohne Link, aber im Flow wählbar', () => {
    const { jobs, ohneAnzeige } = eingaben('fachkraft');
    const html = render(createElement(Erklaerung, eingaben('fachkraft')));
    for (const job of jobs) {
      const link = new RegExp(`<a\\b[^>]*href="${jobPath(job)}"[^>]*>([^<]*)</a>`).exec(html);
      expect(normal(link?.[1] ?? ''), job.id).toBe(job.title);
    }
    const flow = getFlowJobOptions(STICHTAG).map((option) => option.id);
    for (const job of ohneAnzeige) {
      expect(job.status).toBe('funnel_only');
      expect(getJobPageSlugs()).not.toContain(job.slug);
      expect(flow).toContain(job.id);
      expect(html).not.toContain(`href="${jobPath(job)}"`);
    }
  });

  it('Mappe und Unterlagen: beschreibende Links auf /bewerbung/mappe und #unterlagen', () => {
    const html = render(createElement(Erklaerung, eingaben('fachkraft')));
    expect(html).toMatch(new RegExp(`href="${MAPPE_PATH}"[^>]*>Bewerbungsmappe erstellen<`));
    expect(html).toMatch(new RegExp(`href="#${UNTERLAGEN_ANKER}"[^>]*>Gesellenbrief und Zeugnisse per WhatsApp oder E-Mail schicken<`));
  });
});

describe('Regionalband: Wochenende und Fahrzeiten (V6-G1)', () => {
  it('Fakt noWeekendOnCall im Wortlaut, Fahrzeiten der Orte außerhalb der Kernzone aus REGION.locations', () => {
    expect(REGIONALBAND.wochenende).toBe(FACTS.noWeekendOnCall.long);
    expect(REGIONALBAND.fahrzeiten.name).toBe(`Fahrzeit bis ${REGION.center.name}`);
    expect(REGIONALBAND.fahrzeiten.orte.map(normal)).toEqual(
      REGION.locations.filter((ort) => !ort.isCoreZone).map((ort) => `${ort.name} ca. ${ort.commuteMinutes} Min.`),
    );
  });
});

describe('Seite /bewerbung mit Erklärteil (V6-G1)', () => {
  async function seite(searchParams: Record<string, string> = {}) {
    const { default: BewerbungPage } = await import('@/app/bewerbung/page');
    return render((await BewerbungPage({ searchParams: Promise.resolve(searchParams) })) as ReactElement);
  }

  it('Erklärteil nach den anderen Wegen und vor dem Regionalband; Überschriften ohne Sprung', async () => {
    const html = await seite();
    const direkt = html.indexOf('id="bewerbung-kontakt"');
    const teil = html.indexOf('data-bewerbung="erklaerung"');
    expect(teil).toBeGreaterThan(direkt);
    expect(html.indexOf('data-regionalband')).toBeGreaterThan(teil);
    const stufen = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    expect(stufen[0]).toBe(1);
    for (let i = 1; i < stufen.length; i++) expect(stufen[i] - stufen[i - 1]).toBeLessThanOrEqual(1);
  });

  it('„bewerben“ und „Wetzlar“ in den ersten 100 Wörtern; die Diskretionszusage genau einmal (außer im Flow)', async () => {
    const html = await seite();
    const anfang = sichtbar(html.replace(/<script[\s\S]*?<\/script>/g, '')).split(' ').slice(0, 100).join(' ');
    expect(anfang).toMatch(/bewerben/i);
    expect(anfang).toContain(COMPANY.address.city);
    expect(sichtbar(html).split(DISCRETION_PROMISE)).toHaveLength(2);
  });

  it('E-023: „Lebenslauf“, „diskret“, „60“, „Fernmontage“, „35 km“ und „13:30“ in höchstens zwei Abschnitten', async () => {
    const html = await seite();
    const flaeche = html.indexOf('data-bewerbung-flaeche');
    const region = html.indexOf('data-regionalband');
    const abschnitte = { kopf: html.slice(0, flaeche), flaeche: html.slice(flaeche, region), region: html.slice(region) };
    const MARKEN: Record<string, RegExp> = {
      noCvNeeded: /Lebenslauf/,
      discretion: /diskret|vertraulich/i,
      apply60s: /\b60[\s ](s|Sekunden)\b/,
      noFarAssembly: /Fernmontage/,
      radius35: /35[\s -]km/,
      friday1330: /13:30/,
    };
    for (const [fakt, marke] of Object.entries(MARKEN)) {
      const fundorte = Object.entries(abschnitte)
        .filter(([, teil]) => marke.test(sichtbar(teil)))
        .map(([name]) => name);
      expect(fundorte.length, `${fakt}: ${fundorte.join(', ')}`).toBeLessThanOrEqual(2);
    }
  });
});
