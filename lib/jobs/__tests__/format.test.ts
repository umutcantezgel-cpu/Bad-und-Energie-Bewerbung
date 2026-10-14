import { describe, expect, it } from 'vitest';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  PAY_ON_REQUEST,
  applyPath,
  employmentLabel,
  formatNumber,
  getJobSections,
  jobMetaTags,
  jobPath,
  jobUrl,
  locationLabel,
  payLabel,
  startLabel,
  toHtmlDescription,
  toPlainDescription,
} from '../format';
import { getJobById } from '../registry';
import type { Job } from '../schema';

const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const qe = getJobById('quereinsteiger-montagehelfer')!;
const buero = getJobById('buerofachkraft')!;
const praktikum = getJobById('schuelerpraktikum-shk')!;

describe('formatNumber', () => {
  it('gruppiert Tausender und schreibt Dezimalen mit Komma (Maße, nie Beträge)', () => {
    expect(formatNumber(4600)).toBe('4.600');
    expect(formatNumber(-1200)).toBe('-1.200');
    expect(formatNumber(3.5)).toBe('3,50');
  });
});

describe('Lohn und Beschäftigung', () => {
  // E-030: ein Text für alle Stellen, aus dem Fakt payOnRequest; das Schülerpraktikum sagt nichts zu Geld.
  it('payLabel: „Lohn auf Anfrage“ bei jeder Stelle außer dem Schülerpraktikum', () => {
    expect(PAY_ON_REQUEST).toBe('Lohn auf Anfrage');
    for (const job of [am, azubi, qe, buero]) expect(payLabel(job), job.id).toBe('Lohn auf Anfrage');
    expect(payLabel(praktikum)).toBeNull();
  });

  it('employmentLabel, startLabel und Meta-Tags', () => {
    expect(employmentLabel(am)).toBe('Vollzeit · Unbefristet');
    expect(employmentLabel(azubi)).toBe('Ausbildung · 3,5 Jahre');
    expect(startLabel(am)).toBe('Nach Absprache');
    expect(startLabel({ employment: { ...am.employment, start: '2026-08-01' } })).toBe('Ab 1. August 2026');
    expect(startLabel({ employment: { ...am.employment, start: 'sofort' } })).toBe('Ab sofort');
    expect(jobMetaTags(am)).toEqual(['Vollzeit', 'Wetzlar + 35\u00A0km', 'Unbefristet']);
    expect(employmentLabel(buero)).toBe('Voll- oder Teilzeit');
    expect(employmentLabel(praktikum)).toBe('Praktikum');
    // Büro ohne Baustellen: Arbeitsort Wetzlar, ohne Radius
    expect(locationLabel(buero)).toBe('Wetzlar');
    expect(jobMetaTags(buero)).toEqual(['Voll- oder Teilzeit', 'Wetzlar']);
  });
});

describe('Pfade und URLs', () => {
  it('jobPath, jobUrl, applyPath', () => {
    expect(jobPath(am)).toBe('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(jobUrl(am)).toBe(`${SITE_CONFIG.baseUrl.replace(/\/+$/, '')}/jobs/anlagenmechaniker-shk-wetzlar`);
    expect(jobUrl(am)).toMatch(/^https?:\/\//);
    expect(applyPath(am)).toBe('/bewerbung?stelle=anlagenmechaniker-shk-wetzlar');
  });
});

describe('Beschreibungen', () => {
  it('Abschnitte in fester Reihenfolge', () => {
    expect(getJobSections(am).map((s) => s.id)).toEqual([
      'intro',
      'aufgaben',
      'anforderungen',
      'vorteile',
      'paket',
      'eckdaten',
      'bewerben',
    ]);
    const eckdaten = (job: Job) => getJobSections(job).find((s) => s.id === 'eckdaten')?.items ?? [];
    expect(eckdaten(am)).toEqual([
      'Lohn: auf Anfrage',
      'Anstellung: Vollzeit · Unbefristet',
      'Start: Nach Absprache',
      'Einsatzort: Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Baustellen im Umkreis von 35 km',
    ]);
    expect(eckdaten(praktikum)).toEqual([
      'Anstellung: Praktikum',
      'Start: Nach Absprache',
      'Dauer: nach Absprache mit deiner Schule',
      'Einsatzort: Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Baustellen im Umkreis von 35 km',
    ]);
    expect(eckdaten(buero)).toContain('Arbeitsort: Siegmund-Hiepe-Str. 20, 35578 Wetzlar');
    for (const job of [am, azubi, qe, buero, praktikum]) {
      expect(eckdaten(job).some((item) => /^(Gehalt|Vergütung):/.test(item)), job.id).toBe(false);
    }
    // Offene Anforderungen (M-038): kein Abschnitt „Das bringst du mit“
    expect(getJobSections(buero).map((s) => s.id)).toEqual(['intro', 'aufgaben', 'vorteile', 'eckdaten', 'bewerben']);
  });

  it('HTML enthält den Inhalt der Seite und „Lohn: auf Anfrage“, nie einen Betrag (E-030)', () => {
    const html = toHtmlDescription(am);
    expect(html).toContain('<ul>');
    expect(html).toContain(am.tasks[0]);
    expect(html).toContain('<li>Lohn: auf Anfrage</li>');
    expect(html).toContain('Das bringst du mit');
    for (const job of [am, azubi, qe, buero, praktikum]) expect(toHtmlDescription(job), job.id).not.toMatch(/€|\bEuro\b|\bEUR\b/);
    expect(toHtmlDescription(praktikum)).not.toContain('Lohn');
  });

  it('HTML escapt Sonderzeichen', () => {
    const evil: Job = { ...am, intro: 'A <script>alert("x")</script> & \'b\'' };
    const html = toHtmlDescription(evil);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;b&#39;');
  });

  it('Klartext ohne HTML', () => {
    const text = toPlainDescription(am);
    expect(text).not.toMatch(/<[a-z]/i);
    expect(text).toContain('– ' + am.tasks[0]);
    expect(text.startsWith(am.intro)).toBe(true);
  });
});
