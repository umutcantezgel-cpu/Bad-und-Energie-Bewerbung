import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobHeader } from '@/components/jobs/JobHeader';
import { JobSections } from '@/components/jobs/JobSections';
import { MoreJobs } from '@/components/jobs/MoreJobs';
import { SalaryCard, salaryLabel } from '@/components/jobs/SalaryCard';
import {
  KOPF_AKTION,
  KOPF_MIKROTEXT,
  KOPF_ZWEITWEG,
  STELLE_ANKER,
  kopfEtikett,
  kopfMasse,
  kopfTitel,
  kopfUnterzeile,
  paketIcon,
  vorteilIcon,
  zeigtWaermebild,
} from '@/components/jobs/stelle/stelle-text';
import { einblick } from '@/components/jobs/stelle/einblick-text';
import { SHORT_APPLY_LABEL } from '@/components/site/nav';
import { WAERMEBILD_TITEL } from '@/components/zeichnung/Waermebild';
import { FACTS } from '@/lib/content/facts';
import { escapeHtml, formatSalaryAmount, getJobSections } from '@/lib/jobs/format';
import { buildJobPostingJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getJobById, getJobPageSlugs, getJobBySlug, type Job } from '@/lib/jobs/registry';

const SHY = '­';
const NBSP = ' ';
const am = getJobById('anlagenmechaniker-shk')!;
const kd = getJobById('kundendiensttechniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const pageJobs = getJobPageSlugs()
  .map((slug) => getJobBySlug(slug))
  .filter((job): job is Job => job !== undefined);

/** Sichtbarer Text eines Markup-Ausschnitts: ohne Tags, weiche Trennstellen und geschützte Leerzeichen. */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .split(SHY)
    .join('')
    .replaceAll(NBSP, ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'");
}

function h1Of(html: string): string {
  const match = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  return match ? text(match[1]) : '';
}

describe('Kopf der Stellenseite: Texte und Maße (stelle-text)', () => {
  it('teilt die h1 vor „(m/w/d)“ bzw. dem Gedankenstrich, ohne den Wortlaut zu ändern', () => {
    expect(kopfTitel(am.seo.h1)).toEqual({ haupt: 'Anlagenmechaniker SHK', zusatz: '(m/w/d) in Wetzlar' });
    expect(kopfTitel(azubi.seo.h1)).toEqual({
      haupt: 'Ausbildung Anlagenmechaniker SHK',
      zusatz: '– Einstieg 2026 noch möglich',
    });
    expect(kopfTitel(kd.seo.h1)).toEqual({ haupt: 'Kundendiensttechniker Heizung & Wärmepumpe', zusatz: '(m/w/d) in Wetzlar' });
    expect(kopfTitel('Ohne Zusatz')).toEqual({ haupt: 'Ohne Zusatz', zusatz: null });
    for (const job of pageJobs) {
      const { haupt, zusatz } = kopfTitel(job.seo.h1);
      expect(zusatz ? `${haupt} ${zusatz}` : haupt).toBe(job.seo.h1);
    }
  });

  it('Etikett: Anstellung und Dauer, der Ort nur, wenn die h1 ihn nicht nennt', () => {
    expect(kopfEtikett(am)).toBe('Vollzeit · Unbefristet');
    // V6-G2: Die h1 der Kundendienst-Stelle nennt Wetzlar, das Etikett darum nicht noch einmal.
    expect(kopfEtikett(kd)).toBe('Vollzeit · Unbefristet');
    expect(kopfEtikett(azubi)).toBe('Ausbildung · 3,5 Jahre · Wetzlar');
  });

  it('Maße aus Fakten und Stellendaten: 13:30 nur mit dem Fakt friday1330, der Radius aus der Stelle', () => {
    expect(kopfMasse(am)).toEqual([
      { wert: FACTS.friday1330.value, name: FACTS.friday1330.label },
      { wert: `${am.location.radiusKm}${NBSP}km`, name: 'Einsatzradius' },
    ]);
    expect(kopfMasse({ ...am, benefitFactIds: ['vacation30'] }).map((m) => m.wert)).toEqual([`35${NBSP}km`]);
  });

  it('Hauptaktion springt zum Flow, Zweitweg zu den Aufgaben, Mikrotext aus den Fakten', () => {
    // V6-B: eigener Wortlaut, „Jetzt bewerben“ führt überall nach /bewerbung (ein Ankertext, ein Ziel).
    expect(KOPF_AKTION).toEqual({ href: `#${STELLE_ANKER.bewerben}`, label: 'Direkt hier bewerben' });
    expect(KOPF_AKTION.label).not.toBe(SHORT_APPLY_LABEL);
    expect(STELLE_ANKER.bewerben).toBe('bewerben');
    expect(KOPF_ZWEITWEG.href).toBe(`#${STELLE_ANKER.aufgaben}`);
    expect(KOPF_MIKROTEXT).toBe(`Dauert ca. ${FACTS.apply60s.value}${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`);
  });

  it('Unterzeile: Kurzbeschreibung ohne Sätze, die nur die h1 wiederholen', () => {
    expect(kopfUnterzeile(am)).toBe(am.summary);
    expect(kopfUnterzeile(azubi)).toBe('In 3,5 Jahren wirst du Anlagenmechaniker SHK, mit eigenem Hilti-Werkzeugset ab Tag 1.');
    expect(azubi.summary.endsWith(kopfUnterzeile(azubi))).toBe(true);
    // Nie leer: besteht die Beschreibung nur aus Wiederholung, bleibt sie stehen
    expect(kopfUnterzeile({ summary: 'Einstieg 2026 noch möglich.', seo: azubi.seo })).toBe('Einstieg 2026 noch möglich.');
    for (const job of pageJobs) expect(job.summary).toContain(kopfUnterzeile(job));
  });

  it('Wärmebild nur auf der Kundendienst-Stelle (Wärmepumpe)', () => {
    expect(pageJobs.filter(zeigtWaermebild).map((job) => job.slug)).toEqual(['kundendiensttechniker-waermepumpe-wetzlar']);
  });

  it('Icons: Zeichen der eigenen Familie, sonst der Haken', () => {
    expect(vorteilIcon('aboveTariff')).toBe('banknote');
    expect(vorteilIcon('founded1926')).toBe('check');
    expect(paketIcon('Fahrzeug')).toBe('servicefahrzeug');
    expect(paketIcon('Unbekannt')).toBe('check');
  });
});

describe('JobHeader (Seitenkopf erzaehl)', () => {
  it.each(pageJobs.map((job) => [job.id, job] as const))('%s: eine h1 im Wortlaut von seo.h1, Gehalt im Heizkreis', (_id, job) => {
    const html = renderToStaticMarkup(createElement(JobHeader, { job }));
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(h1Of(html)).toBe(job.seo.h1);
    expect(html).toContain('data-seitenkopf="erzaehl"');
    expect(html).toContain('data-zeichnung="heizkreis"');
    expect(text(html)).toContain(text(formatSalaryAmount(job)!));
    expect(text(html)).toContain(kopfUnterzeile(job));
    // Hauptaktion zum Flow, eine rote Fläche; Signatur über die Register-Kennung erdleitung
    expect(html).toContain(`href="#${STELLE_ANKER.bewerben}"`);
    expect(html).toContain('data-primary-cta=""');
    expect(html).toContain('data-motion="erdleitung"');
    expect(html).toContain('data-zeichnung="seitenkopf-leitung"');
  });

  it.each(pageJobs.map((job) => [job.id, job] as const))(
    '%s: h1 bricht an den Wortfugen aus titleShy mit Strich (U+00AD, K-005), ohne <wbr>',
    (_id, job) => {
      const html = renderToStaticMarkup(createElement(JobHeader, { job }));
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1];
      expect(h1).not.toContain('<wbr');
      // Jede Wortfuge aus titleShy, deren Wort in der h1 steht, trägt das weiche Trennzeichen.
      const fugen = job.titleShy
        .split(/\s+/)
        .filter((wort) => wort.includes(SHY) && job.seo.h1.includes(wort.split(SHY).join('')));
      for (const wort of fugen) expect(h1).toContain(wort);
      expect(fugen.length).toBeGreaterThan(0);
    },
  );

  it('Kundendienst-h1 nennt Wärmepumpe und Wetzlar (Wörter des metaTitle), Gießen steht in der Unterzeile', () => {
    expect(kd.seo.metaTitle).toContain('Wärmepumpe');
    expect(kd.seo.h1).toContain('Wärmepumpe');
    expect(kd.seo.h1).toContain('Heizung');
    expect(kd.seo.h1).toContain(kd.location.city);
    expect(kd.seo.metaTitle).toContain('Gießen');
    expect(kopfUnterzeile(kd)).toContain('Gießen');
    // JobPosting-Titel bleibt (Google Jobs, Feeds): nur die sichtbare h1 ändert sich.
    expect(buildJobPostingJsonLd(kd)!.title).toBe('Kundendiensttechniker SHK / Servicemonteur (m/w/d)');
  });

  it('Kundendienst: Wärmebild als Bild mit Titel; die anderen Stellen ohne', () => {
    const kdHtml = renderToStaticMarkup(createElement(JobHeader, { job: kd }));
    expect(kdHtml).toContain('role="img"');
    expect(kdHtml).toContain(`aria-label="${escapeHtml(WAERMEBILD_TITEL)}"`);
    expect(kdHtml).not.toContain('<canvas');
    const amHtml = renderToStaticMarkup(createElement(JobHeader, { job: am }));
    expect(amHtml).not.toContain('data-zeichnung="waermebild"');
    expect(amHtml).toContain('data-zeichnung="haus-klein"');
  });
});

describe('SalaryCard (Gehalt im Heizkreis)', () => {
  it('zeigt genau die Spanne der Stelle (Gleichheit mit JobPosting.baseSalary)', () => {
    for (const job of pageJobs) {
      const html = renderToStaticMarkup(createElement(SalaryCard, { job }));
      const ld = buildJobPostingJsonLd(job)!;
      expect(text(html)).toContain(text(formatSalaryAmount(job)!));
      expect(ld.baseSalary?.value).toMatchObject({ minValue: job.salary!.min, maxValue: job.salary!.max });
      expect(text(html)).toContain(salaryLabel(job)!);
    }
  });
});

describe('E-SEO-010: JobPosting nur aus Registry und Fakten, „ohne Bereitschaftszwang“ zurück', () => {
  it('Anlagenmechaniker führt den Fakt noWeekendOnCall', () => {
    expect(am.benefitFactIds).toContain('noWeekendOnCall');
  });

  it('jobBenefits nennt „Kein Wochenend-Notdienst“, die Beschreibung den Wortlaut des Fakts', () => {
    const ld = buildJobPostingJsonLd(am)!;
    expect(ld.jobBenefits).toContain(FACTS.noWeekendOnCall.short);
    expect(FACTS.noWeekendOnCall.short).toBe('Kein Wochenend-Notdienst');
    expect(ld.description).toContain(escapeHtml(FACTS.noWeekendOnCall.long));
    expect(FACTS.noWeekendOnCall.long).toBe('Keine Notdienstpflicht am Wochenende: Samstag und Sonntag hast du frei.');
  });

  it.each(getActiveJobs().map((job) => [job.id, job] as const))('%s: jede Zeile von jobBenefits stammt aus Fakten oder Paket', (_id, job) => {
    const ld = buildJobPostingJsonLd(job);
    if (!ld) return;
    const erlaubt = new Set([...job.benefitFactIds.map((id) => FACTS[id].short), ...job.packageExtras.map((e) => e.text)]);
    for (const zeile of (ld.jobBenefits ?? '').split('; ')) expect(erlaubt.has(zeile)).toBe(true);
    // Die Beschreibung ist die Abfolge der sichtbaren Abschnitte: jede Vorteilszeile im Wortlaut des Fakts
    for (const id of job.benefitFactIds) expect(ld.description).toContain(escapeHtml(FACTS[id].long));
  });

  it('die Seite zeigt den Abschnitt „Das bekommst du“ mit dem Wortlaut des Fakts', () => {
    const html = renderToStaticMarkup(createElement(JobSections, { job: am }));
    expect(text(html)).toContain(FACTS.noWeekendOnCall.long);
    expect(text(html)).toContain(FACTS.noWeekendOnCall.short);
  });

  it('genau ein JobPosting je Stellenseite (eine Quelle in der Route), keines auf der Startseite', () => {
    const route = readFileSync(path.resolve(__dirname, '../[slug]/page.tsx'), 'utf8');
    expect(route.match(/buildJobPostingJsonLd\(/g)).toHaveLength(1);
    // V6-B: ein JSON-LD-Block je Route, gerendert über JsonLd mit genau einem Graphen.
    expect(route.match(/<JsonLd\b/g)).toHaveLength(1);
    expect(route.match(/buildPageGraph\(/g)).toHaveLength(1);
    expect(route).not.toMatch(/application\/ld\+json/);
    const start = readFileSync(path.resolve(__dirname, '../../page.tsx'), 'utf8');
    expect(start).not.toMatch(/JobPosting/);
  });
});

describe('JobSections: sichtbare Abschnitte = Abschnitte der JobPosting-Beschreibung, danach der Einblick', () => {
  it.each(pageJobs.map((job) => [job.id, job] as const))('%s', (_id, job) => {
    const html = renderToStaticMarkup(createElement(JobSections, { job }));
    const h2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]));
    const erwartet = getJobSections(job)
      .filter((s) => s.heading)
      .map((s) => s.heading);
    // V6-G2: Das Band „Einblick“ steht nur auf der Seite (nicht in der JobPosting-Beschreibung) und folgt danach.
    const zusatz = einblick(job)!;
    expect(h2).toEqual([...erwartet, zusatz.arbeit.titel, zusatz.gebiet.titel]);
    expect(text(html)).toContain(job.intro);
    for (const item of [...job.tasks, ...job.requirements]) expect(text(html)).toContain(item);
    for (const extra of job.packageExtras) expect(text(html)).toContain(extra.text);
    expect(html).toContain(`id="${STELLE_ANKER.aufgaben}"`);
  });
});

describe('MoreJobs: Leitungsabgänge wie #stellen der Startseite', () => {
  it('listet die anderen Stellen mit Gehalt und Link, ohne die aktuelle', () => {
    const now = new Date('2026-10-10T00:00:00Z');
    const html = renderToStaticMarkup(createElement(MoreJobs, { currentJob: am, now }));
    expect(html).not.toContain(`href="/jobs/${am.slug}"`);
    expect(html).toContain(`href="/jobs/${kd.slug}"`);
    expect(text(html)).toContain(text(formatSalaryAmount(kd)!));
    expect(html).toMatch(/<h2[^>]*id="weitere-stellen"/);
  });
});
