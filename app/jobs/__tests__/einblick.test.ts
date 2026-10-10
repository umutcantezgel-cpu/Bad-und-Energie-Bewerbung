import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobHeader } from '@/components/jobs/JobHeader';
import { JobSections } from '@/components/jobs/JobSections';
import { Einblick } from '@/components/jobs/stelle/Einblick';
import {
  BADPARTNER,
  EINBLICK_ANKER,
  aufzaehlung,
  einblick,
  erfahrung,
  type Einblick as EinblickInhalt,
  type Verweis,
} from '@/components/jobs/stelle/einblick-text';
import { lowerFirst } from '@/components/jobs/text';
import { FACTS } from '@/lib/content/facts';
import { getFaqItem } from '@/lib/content/faq';
import { REGION } from '@/lib/content/region';
import { jobPath } from '@/lib/jobs/format';
import { getJobById, getJobBySlug, getJobPageSlugs, type Job } from '@/lib/jobs/registry';

/**
 * V6-G2: Herkunft der Texte im Band „Einblick“ (components/jobs/stelle/einblick-text.ts). Jede Zahl, jeder Ort,
 * jede Erfahrungsangabe und jeder Faktsatz stammt aus Stellendaten, FACTS, REGION oder der FAQ; die Texte der
 * vier Stellen teilen keine 8-Wort-Folge.
 */

const NOW = new Date('2026-10-10T12:00:00Z');
const NBSP = ' ';
const pageJobs = getJobPageSlugs()
  .map((slug) => getJobBySlug(slug))
  .filter((job): job is Job => job !== undefined);
const am = getJobById('anlagenmechaniker-shk')!;
const kd = getJobById('kundendiensttechniker-shk')!;
const om = getJobById('obermonteur-projektleiter-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;

const inhalt = (job: Job): EinblickInhalt => einblick(job, NOW)!;

/** Alle Sätze des Bands als Klartext (Verweise mit ihrem Ankertext). */
function saetze(e: EinblickInhalt): string[] {
  return [
    e.arbeit.einleitung,
    ...e.arbeit.punkte.map((p) => p.text),
    ...(e.vergleich ? [e.vergleich.teile.map((t) => (typeof t === 'string' ? t : t.label)).join('')] : []),
    e.gebiet.einleitung,
    ...e.gebiet.orte.map((o) => `${o.label} ${o.text}`),
    ...(e.gebiet.nachsatz ? [e.gebiet.nachsatz] : []),
  ];
}

const klartext = (e: EinblickInhalt) => saetze(e).join(' ').replaceAll(NBSP, ' ');
const tokens = (s: string) => s.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+/gu) ?? [];

function grams(s: string, n = 8): Set<string> {
  const w = tokens(s);
  const set = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
}

function sichtbar(html: string): string {
  return html
    .replace(/<svg\b[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&amp;', '&')
    .replaceAll(NBSP, ' ')
    .replace(/­/g, '');
}

describe('Einblick: für jede Stellenseite, nicht für den Quereinstieg', () => {
  it('jede Stelle mit Seite hat Arbeit, Vergleich und Gebiet; funnel_only hat keinen Einblick', () => {
    expect(pageJobs).toHaveLength(4);
    for (const job of pageJobs) {
      const e = inhalt(job);
      expect(e.arbeit.punkte.length, job.id).toBeGreaterThanOrEqual(3);
      expect(e.vergleich, job.id).not.toBeNull();
      expect(e.gebiet.orte.length, job.id).toBeGreaterThanOrEqual(3);
    }
    expect(einblick(getJobById('quereinsteiger-montagehelfer')!, NOW)).toBeNull();
  });
});

describe('Einblick: Herkunft', () => {
  it('Zahlen nur aus REGION (Entfernung, Fahrzeit) und der Ausbildungsdauer', () => {
    const erlaubt = new Set<string>([
      ...REGION.locations.flatMap((l) => [String(l.distanceKm), String(l.commuteMinutes)]),
      '3,5',
    ]);
    expect(azubi.employment.durationMonths).toBe(42);
    for (const job of pageJobs) {
      for (const zahl of klartext(inhalt(job)).match(/\d+(?:,\d+)?/g) ?? []) expect(erlaubt.has(zahl), `${job.id}: ${zahl}`).toBe(true);
    }
  });

  it('Orte mit Entfernung und Fahrzeit entsprechen REGION.locations; Bereiche listen genau ihre Orte', () => {
    const bereiche = new Map(REGION.areas.map((a) => [a.name.replace('Lahn Dill Kreis', 'Lahn-Dill-Kreis'), a]));
    for (const job of pageJobs) {
      for (const o of inhalt(job).gebiet.orte) {
        const location = REGION.locations.find((l) => l.name === o.label);
        if (location) {
          const km = `${location.distanceKm}${NBSP}km`;
          const min = `${location.commuteMinutes}${NBSP}Min.`;
          expect([`${km} · ${min}`, `${min} · ${km}`], `${job.id}: ${o.label}`).toContain(o.text);
        } else {
          const area = bereiche.get(o.label);
          expect(area, `${job.id}: ${o.label}`).toBeDefined();
          expect(o.text).toBe(aufzaehlung(area!.cities));
        }
      }
      const nachsatz = inhalt(job).gebiet.nachsatz;
      if (nachsatz) {
        const alleOrte = new Set(REGION.areas.flatMap((a) => a.cities));
        const genannt = nachsatz.match(/(?:mit|außerdem) (.+?)(?: dazu)?\.$/)![1].split(/, | und /);
        for (const name of genannt) expect(alleOrte.has(name), `${job.id}: ${name}`).toBe(true);
      }
    }
  });

  it('Berufserfahrung im Wortlaut der Anforderungen der verlinkten Stelle', () => {
    expect(erfahrung(am)).toBe('ein Jahr');
    expect(erfahrung(kd)).toBe('zwei Jahre');
    expect(erfahrung(om)).toBe('drei Jahre');
    for (const job of [am, kd, om]) {
      expect(job.requirements.join(' ').toLocaleLowerCase('de-DE'), job.id).toContain(erfahrung(job).toLocaleLowerCase('de-DE'));
    }
    for (const job of pageJobs) {
      const vergleich = inhalt(job).vergleich!;
      const text = vergleich.teile.map((t) => (typeof t === 'string' ? t : t.label)).join('');
      for (const teil of vergleich.teile) {
        if (typeof teil === 'string') continue;
        const ziel = pageJobs.find((j) => jobPath(j) === teil.href)!;
        expect(text, `${job.id} → ${ziel.id}`).toContain(erfahrung(ziel));
      }
    }
  });

  it('Faktsätze im Wortlaut von FACTS und nur als zweite Nennung (die Stelle führt den Fakt schon)', () => {
    expect(klartext(inhalt(am))).toContain(FACTS.paidCertifications.short);
    expect(am.benefitFactIds).toContain('paidCertifications');

    expect(klartext(inhalt(kd))).toContain(lowerFirst(FACTS.measurementTools.long));
    expect(kd.packageExtras.map((e) => e.text).join(' ')).toContain('Digitale Messtechnik');

    const azText = klartext(inhalt(azubi));
    const mobil = azubi.packageExtras.find((e) => e.label === 'Mobilität')!.text;
    expect(azText).toContain(FACTS.travelAllowance.long);
    expect(mobil).toContain('Fahrtkostenzuschuss zur Berufsschule');
    expect(azText).toContain(FACTS.driversLicenseGrant.long);
    expect(mobil).toContain('Pkw-Führerschein');
    expect(azText).toContain('feste Übernahme garantiert');
    expect(azubi.benefitFactIds).toContain('takeoverGuarantee');
    expect(FACTS.takeoverGuarantee.pending?.onlyForJobIds).toContain(azubi.id);
  });

  it('Badpartner und Fußbodenheizungen aus der FAQ „heizsysteme“, Heizungsbauer aus den Suchwörtern der Stelle', () => {
    const faq = getFaqItem('heizsysteme').answer;
    expect(faq).toContain(`Partnerschaft mit ${BADPARTNER}.`);
    expect(BADPARTNER).toBe('ELEMENTS, VIGOUR, Kermi und Geberit');
    expect(faq).toContain('Fußbodenheizungen');
    expect(faq).toContain('Schwerpunkt');
    expect(klartext(inhalt(am))).toContain(BADPARTNER);
    expect(klartext(inhalt(om))).toContain(BADPARTNER);
    expect(klartext(inhalt(am))).toContain('Fußbodenheizungen');
    expect(klartext(inhalt(am))).toContain('Heizungsbauer');
    expect(am.seo.secondaryKeywords.some((k) => k.includes('Heizungsbauer'))).toBe(true);
  });

  it('Faktenregel E-023: keine Vorteile, die auf der Seite schon zweimal stehen (35 km, Fernmontage, 13:30, Fahrzeug, iPad)', () => {
    for (const job of pageJobs) {
      const text = klartext(inhalt(job));
      expect(text, job.id).not.toMatch(/35 km|Fernmontage|13:30|Servicefahrzeug|Transporter|iPad|30 Tage|Tarif|Hilti/);
    }
  });
});

describe('Einblick: Verweise', () => {
  it('nur auf andere Stellen, die live sind, mit beschreibendem Ankertext; nie zwei Ziele für denselben Text', () => {
    for (const job of pageJobs) {
      const verweise = inhalt(job).vergleich!.teile.filter((t): t is Verweis => typeof t !== 'string');
      expect(verweise.length, job.id).toBeGreaterThan(0);
      for (const v of verweise) {
        expect(v.href).not.toBe(jobPath(job));
        expect(pageJobs.map(jobPath)).toContain(v.href);
        expect(v.label).not.toMatch(/^(hier|mehr|weiter|link)$/i);
        expect(v.label.split(' ').length).toBeGreaterThanOrEqual(2);
        // Gleicher Text wie ein Stellenname in „Weitere Stellen“ nur, wenn er auf dieselbe Stelle zeigt.
        const gleichnamig = pageJobs.find((j) => j.shortTitle === v.label);
        if (gleichnamig) expect(v.href).toBe(jobPath(gleichnamig));
      }
      expect(new Set(verweise.map((v) => v.label)).size).toBe(verweise.length);
    }
  });

  it('abgelaufene Nachbarstellen fallen weg', () => {
    const spaeter = new Date('2027-10-07T00:00:00Z');
    expect(einblick(kd, spaeter)!.vergleich).toBeNull();
    expect(einblick(om, spaeter)!.vergleich).toBeNull();
    expect(einblick(am, spaeter)!.vergleich).toBeNull();
    expect(einblick(azubi, spaeter)!.vergleich).toBeNull();
    // Nur die Ausbildung ist abgelaufen: Die Fachkraft-Stellen verweisen weiter aufeinander.
    expect(einblick(am, new Date('2027-01-15T00:00:00Z'))!.vergleich).not.toBeNull();
  });
});

describe('Einblick: eigener Text je Stelle (V6-G2)', () => {
  it('die Bänder der vier Stellen teilen keine 8-Wort-Folge', () => {
    for (const a of pageJobs) {
      for (const b of pageJobs) {
        if (a === b) continue;
        const gb = grams(klartext(inhalt(b)));
        const gemeinsam = [...grams(klartext(inhalt(a)))].filter((g) => gb.has(g));
        expect(gemeinsam, `${a.id} ↔ ${b.id}`).toEqual([]);
      }
    }
  });

  it('kein Satz des Bands steht schon im Kopf oder in den Abschnitten einer anderen Stelle', () => {
    for (const a of pageJobs) {
      const eigen = grams(klartext(inhalt(a)));
      for (const b of pageJobs) {
        if (a === b) continue;
        const html = renderToStaticMarkup(createElement(JobHeader, { job: b })) + renderToStaticMarkup(createElement(JobSections, { job: b }));
        const fremd = grams(sichtbar(html.replace(/<section[^>]*aria-labelledby="stelle-(?:arbeit|gebiet)"[\s\S]*?<\/section>/g, '')));
        expect([...eigen].filter((g) => fremd.has(g)), `${a.id} in ${b.id}`).toEqual([]);
      }
    }
  });
});

describe('<Einblick>: Band auf der Wand mit h2/h3 und Ortsliste als Maße', () => {
  it.each(pageJobs.map((job) => [job.id, job] as const))('%s', (_id, job) => {
    const html = renderToStaticMarkup(createElement(Einblick, { job, now: NOW }));
    const e = inhalt(job);
    expect(html).toMatch(/^<section class="[^"]*bg-surface-2/);
    expect(html).toContain('data-zeichnung="leitungstrenner"');
    expect(html).toContain(`<h2 id="${EINBLICK_ANKER.arbeit}"`);
    expect(html).toContain(`<h2 id="${EINBLICK_ANKER.gebiet}"`);
    expect(html.match(/<h3/g)).toHaveLength(e.arbeit.punkte.length + 1);
    expect(html).not.toMatch(/<h[14]/);
    // Sichtbarer Text mit einfachen Leerzeichen; Satzzeichen hängen direkt am Wort davor (Link, Zeilenende der Liste).
    const text = sichtbar(html).replace(/\s+/g, ' ').replace(/ ([,.;:])/g, '$1');
    for (const satz of saetze(e)) expect(text).toContain(satz.replaceAll(NBSP, ' '));
    for (const v of e.vergleich!.teile) if (typeof v !== 'string') expect(html).toContain(`href="${v.href}"`);
    if (e.gebiet.orte.some((o) => o.mass)) expect(html).toContain('font-mass');
  });
});
