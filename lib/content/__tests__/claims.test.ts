import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import { regionalband } from '@/components/apply/seite/seite-text';
import { HERO, HERO_RADIUS_LABEL, HERO_STATS, homeDescription } from '@/components/home/content';
import { Hero } from '@/components/home/Hero';
import { WUNSCH_OPTIONEN, ZUSAGEN } from '@/components/home/vorteile/vorteile-text';
import { ALLTAG } from '@/components/jobs/liste/inhalt-text';
import { listenUnterzeile, listenZeichnung } from '@/components/jobs/liste/liste-text';
import { COMPANY } from '@/lib/content/company';
import { FACTS, FACT_IDS } from '@/lib/content/facts';
import { FAQ_ITEMS, STELLEN_FAQ_ITEMS } from '@/lib/content/faq';
import { REGION } from '@/lib/content/region';
import { TEAM_QUOTES } from '@/lib/content/team';
import { companyData } from '@/lib/data/company';
import { toPlainDescription } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs } from '@/lib/jobs/registry';
import { WORK_STYLES } from '@/lib/mappe/options';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { ogHomeText } from '@/lib/seo/og-image';
import { claimsInHtml, claimsInTextBody, findClaims } from '../../../scripts/qa/check-claims.mjs';

/**
 * Gesperrte Aussagen an der Quelle: Arbeitszeit (Inhaber 2026-10-12, fakten-abgleich B28: flexible Arbeitszeiten,
 * keine festen Endzeiten, kein „pünktlich Feierabend“, keine Wochenstunden), Euro-Beträge (E-030: Lohn auf Anfrage)
 * und „Premium Partner“, solange der Fakt boschPremiumPartner offen ist (S6). Dieselben Listen prüft
 * scripts/qa/check-claims.mjs nach dem Build am vorgerenderten HTML; hier fällt ein Fehler schon vor dem Build auf.
 */

const claims = (text: string, premiumPending = true) =>
  findClaims(text.replace(/[  ]/g, ' ').replace(/⁠/g, ''), { premiumPending });

afterEach(() => {
  vi.useRealTimers();
});

describe('Keine festen Arbeitszeiten in Fakten, Stellen und Texten (B28)', () => {
  it('kein Fakt nennt eine feste Arbeitszeit, „pünktlich …“, Wochenstunden oder einen Euro-Betrag', () => {
    for (const id of FACT_IDS) {
      const { short, long, value, label, list } = FACTS[id];
      // Der offene Fakt selbst ist die eine Stelle, an der der gesperrte Wortlaut stehen darf (nie ausgespielt).
      expect(claims([short, long, value, label, ...(list ?? [])].join(' '), id !== 'boschPremiumPartner'), id).toEqual([]);
    }
    expect(FACTS.boschPremiumPartner.pending).toBeDefined();
    expect(claims(FACTS.boschPremiumPartner.long).map((c) => c.claim)).toEqual(['Premium Partner']);
  });

  it('E-030: keine Stelle, kein Fakt und keine Frage nennt einen Betrag zu Lohn oder Gehalt', () => {
    for (const job of ALL_JOBS) {
      expect(job.salary, job.id).toBeUndefined();
      expect(claims(JSON.stringify(job)).map((c) => c.claim), job.id).toEqual([]);
      expect(claims(toPlainDescription(job)).map((c) => c.claim), job.id).toEqual([]);
    }
    for (const item of [...FAQ_ITEMS, ...STELLEN_FAQ_ITEMS]) expect(claims(`${item.question} ${item.answer}`), item.id).toEqual([]);
    expect(claims(companyData.benefits.join(' '))).toEqual([]);
    // Die Prüfung greift: ein Betrag würde gemeldet
    expect(claims('Gehalt 3.600–4.600 € im Monat').map((c) => c.claim)).toEqual(['3.600–4.600 €']);
  });

  it('jede Stelle führt flexibleHours (außer wo es offen ist: Büro, S5), keine nennt eine feste Arbeitszeit (Daten, Beschreibung, Meta)', () => {
    const offen = FACTS.flexibleHours.offenFuer?.kategorien ?? [];
    expect(offen).toEqual(['buero']);
    for (const job of ALL_JOBS) {
      expect(job.benefitFactIds.includes('flexibleHours'), job.id).toBe(!offen.includes(job.category));
      expect(claims(JSON.stringify(job)), job.id).toEqual([]);
      expect(claims(toPlainDescription(job)), job.id).toEqual([]);
      expect(job.seo.metaDescription, job.id).not.toMatch(/Feierabend|frei\b/);
    }
  });

  it('FAQ, Einsatzgebiet, freigegebene Teamzitate, Mappe und Rohdaten ohne feste Arbeitszeit', () => {
    for (const item of [...FAQ_ITEMS, ...STELLEN_FAQ_ITEMS]) expect(claims(`${item.question} ${item.answer}`), item.id).toEqual([]);
    expect(claims(`${REGION.headline} ${REGION.summary} ${REGION.milestone.text}`)).toEqual([]);
    for (const quote of Object.values(TEAM_QUOTES)) expect(claims(quote.quote), quote.id).toEqual([]);
    for (const style of WORK_STYLES) expect(claims(style.value), style.id).toEqual([]);
    expect(claims(companyData.benefits.join(' '))).toEqual([]);
    expect(companyData.openingHours.note).not.toMatch(/pünktlich|13:30/);
  });

  it('Startseite, /jobs, /bewerbung und OG-Bild: keine Uhrzeit als Arbeitszeit', () => {
    const texte = [
      HERO.title,
      HERO.titleSecondLine,
      HERO_RADIUS_LABEL,
      ...HERO_STATS.flatMap((s) => [s.value, s.label]),
      homeDescription(getActiveJobs()),
      jobsHubDescription(getActiveJobs()),
      ...WUNSCH_OPTIONEN.map((w) => w.label),
      ...ZUSAGEN.flatMap((z) => [z.titel, z.text, z.mass ?? '']),
      ...listenUnterzeile(getActiveJobs()),
      JSON.stringify(listenZeichnung()),
      ALLTAG.woche.titel,
      ALLTAG.woche.text,
      JSON.stringify(regionalband(getActiveJobs())),
      ...getActiveJobs().map((job) => JSON.stringify(regionalband([job]))),
      ...ogHomeText().texts,
    ];
    for (const text of texte) expect(claims(text), text).toEqual([]);
  });

  it('der Einstieg der Startseite trägt keine Arbeitszeit-Aussage (gerendert, ohne Skripte)', () => {
    const html = renderToStaticMarkup(createElement(Hero, { now: new Date('2026-10-12T09:00:00Z') }));
    expect(claimsInHtml(html)).toEqual([]);
  });

  it('llms.txt und llms-full.txt: die Bürozeiten nur in der Zeile „Büro erreichbar:“', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
    for (const route of [llms, llmsFull]) {
      const text = await route().text();
      expect(text).toContain(`Büro erreichbar: ${COMPANY.openingHours.short}`);
      expect(text).toContain(FACTS.flexibleHours.long);
      expect(claimsInTextBody(text, 'txt')).toEqual([]);
      // Ohne die Ausnahme fiele die Bürozeit auf: die Prüfung greift
      expect(claims(text).length).toBeGreaterThan(0);
    }
  });
});
