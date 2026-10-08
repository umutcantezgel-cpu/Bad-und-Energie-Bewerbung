import { describe, expect, it } from 'vitest';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  applyPath,
  employmentLabel,
  formatEuro,
  formatNumber,
  formatSalaryRange,
  getJobSections,
  jobMetaTags,
  jobPath,
  jobUrl,
  startLabel,
  toHtmlDescription,
  toPlainDescription,
} from '../format';
import { getJobById } from '../registry';
import type { Job } from '../schema';

const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const qe = getJobById('quereinsteiger-montagehelfer')!;

describe('formatEuro', () => {
  it('formatiert de-DE mit geschütztem Leerzeichen vor €', () => {
    expect(formatEuro(3600)).toBe('3.600\u00A0€');
    expect(formatEuro(1050)).toBe('1.050\u00A0€');
    expect(formatEuro(950)).toBe('950\u00A0€');
    expect(formatEuro(1234567)).toBe('1.234.567\u00A0€');
    expect(formatEuro(14.5)).toBe('14,50\u00A0€');
  });

  it('formatNumber gruppiert Tausender', () => {
    expect(formatNumber(4600)).toBe('4.600');
    expect(formatNumber(-1200)).toBe('-1.200');
  });
});

describe('Gehalt und Beschäftigung', () => {
  it('formatSalaryRange', () => {
    expect(formatSalaryRange(am)).toBe('3.600–4.600\u00A0€ / Monat');
    expect(formatSalaryRange(azubi)).toBe('1.050–1.400\u00A0€ / Monat');
    expect(formatSalaryRange(qe)).toBeNull();
    expect(formatSalaryRange({ salary: { min: 15, max: 15, unit: 'HOUR', currency: 'EUR' } })).toBe('15\u00A0€ / Stunde');
  });

  it('employmentLabel, startLabel und Meta-Tags', () => {
    expect(employmentLabel(am)).toBe('Vollzeit · Unbefristet');
    expect(employmentLabel(azubi)).toBe('Ausbildung · 3,5 Jahre');
    expect(startLabel(am)).toBe('Nach Absprache');
    expect(startLabel({ employment: { ...am.employment, start: '2026-08-01' } })).toBe('Ab 1. August 2026');
    expect(startLabel({ employment: { ...am.employment, start: 'sofort' } })).toBe('Ab sofort');
    expect(jobMetaTags(am)).toEqual(['Vollzeit', 'Wetzlar + 35\u00A0km', 'Unbefristet']);
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
    expect(getJobSections(qe).find((s) => s.id === 'eckdaten')?.items?.some((i) => i.startsWith('Gehalt'))).toBe(false);
  });

  it('HTML enthält Inhalt und Gehalt der Seite', () => {
    const html = toHtmlDescription(am);
    expect(html).toContain('<ul>');
    expect(html).toContain(am.tasks[0]);
    expect(html).toContain('3.600–4.600\u00A0€ / Monat');
    expect(html).toContain('Das bringst du mit');
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
