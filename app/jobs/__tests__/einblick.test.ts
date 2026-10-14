import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobHeader } from '@/components/jobs/JobHeader';
import { JobSections } from '@/components/jobs/JobSections';
import { Einblick } from '@/components/jobs/stelle/Einblick';
import {
  BADPARTNER,
  EINBLICK_ANKER,
  KERNGEBIET,
  aufzaehlung,
  einblick,
  erfahrung,
  kerngebietOrte,
  kreisOrte,
  type Einblick as EinblickInhalt,
  type Verweis,
} from '@/components/jobs/stelle/einblick-text';
import { lowerFirst } from '@/components/jobs/text';
import { FACTS } from '@/lib/content/facts';
import { getFaqItem } from '@/lib/content/faq';
import { REGION } from '@/lib/content/region';
import { jobPath } from '@/lib/jobs/format';
import { getJobById, getJobBySlug, getJobPageSlugs, type Job } from '@/lib/jobs/registry';
import { defineJob, type JobInput } from '@/lib/jobs/schema';
import { findPublishedPlaceByName, getHubKreise, getPublishedPlaces } from '@/lib/places/registry';

/**
 * V6-G2: Herkunft der Texte im Band „Einblick“ (components/jobs/stelle/einblick-text.ts). Jede Zahl, jeder Ort,
 * jede Erfahrungsangabe und jeder Faktsatz stammt aus Stellendaten, FACTS, REGION oder der FAQ; die Texte aller
 * Stellen mit Seite teilen keine 8-Wort-Folge (seit 2026-10-14 acht Stellen, fakten-abgleich S2–S5).
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
const azubi27 = getJobById('ausbildung-anlagenmechaniker-shk-2027')!;
const qe = getJobById('quereinsteiger-montagehelfer')!;
const buero = getJobById('buerofachkraft')!;
const praktikum = getJobById('schuelerpraktikum-shk')!;
const isVerweis = (teil: unknown): teil is Verweis => typeof teil !== 'string';

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

describe('Einblick: für jede Stellenseite, nicht für funnel_only', () => {
  it('jede Stelle mit Seite hat Arbeit, Vergleich und Gebiet; funnel_only hat keinen Einblick', () => {
    expect(pageJobs).toHaveLength(8);
    for (const job of pageJobs) {
      const e = inhalt(job);
      expect(e.arbeit.punkte.length, job.id).toBeGreaterThanOrEqual(3);
      expect(e.vergleich, job.id).not.toBeNull();
      expect(e.gebiet.orte.length, job.id).toBeGreaterThanOrEqual(3);
    }
    const funnelOnly = defineJob({
      ...(qe as unknown as JobInput),
      status: 'funnel_only',
      channels: { googleJobs: false, indeedFeed: false, genericFeed: false, ba: false },
    });
    expect(einblick(funnelOnly, NOW)).toBeNull();
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

  it('Orte mit Entfernung und Fahrzeit entsprechen REGION.locations; Kreise nennen nur ihre Orte mit Ortsseite', () => {
    const kreise = new Map(getHubKreise().map((k) => [k.shortName, k]));
    const published = getPublishedPlaces();
    for (const job of pageJobs) {
      for (const o of inhalt(job).gebiet.orte) {
        const location = REGION.locations.find((l) => l.name === o.label);
        if (location) {
          const km = `${location.distanceKm}${NBSP}km`;
          const min = `${location.commuteMinutes}${NBSP}Min.`;
          expect([`${km} · ${min}`, `${min} · ${km}`], `${job.id}: ${o.label}`).toContain(o.text);
        } else if (o.label === KERNGEBIET) {
          expect(o.text).toBe(aufzaehlung(kerngebietOrte()));
        } else {
          const kreis = kreise.get(o.label);
          expect(kreis, `${job.id}: ${o.label}`).toBeDefined();
          expect(o.text).toBe(aufzaehlung(kreisOrte(kreis!.id, { max: 5 })));
          for (const name of o.text.split(/, | und /)) {
            expect(published.find((p) => p.name === name)?.kreisId, `${job.id}: ${name}`).toBe(kreis!.id);
          }
        }
      }
      const nachsatz = inhalt(job).gebiet.nachsatz;
      if (nachsatz) {
        const genannt = nachsatz.match(/(?:mit|außerdem) (.+?)(?: dazu)?\.$/)![1].split(/, | und /);
        // Jeder genannte Ort hat eine Ortsseite (Dillenburg, 38 km Straße, stand bis 2026-10-12 hier)
        for (const name of genannt) expect(findPublishedPlaceByName(name), `${job.id}: ${name}`).toBeDefined();
        expect(nachsatz).not.toContain('Dillenburg');
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
      const ziele = vergleich.teile.filter(isVerweis).map((teil) => pageJobs.find((j) => jobPath(j) === teil.href)!);
      // Ein Vergleich als Laufbahn nennt die Erfahrung jeder verlinkten Stelle, die welche verlangt. Die Bürofachkraft
      // verweist auf die Kollegen draußen, nicht auf einen Wechsel; Ausbildung und Praktikum verlangen keine.
      for (const ziel of ziele) {
        if ((ziel.experienceMonths ?? 0) > 0 && job.id !== buero.id) expect(text, `${job.id} → ${ziel.id}`).toContain(erfahrung(ziel));
      }
      // Jede genannte Erfahrung ist die einer verlinkten Stelle oder die der Stelle selbst
      const belegt = [...ziele, ...((job.experienceMonths ?? 0) > 0 ? [job] : [])].map(erfahrung);
      for (const [genannt] of text.matchAll(/\b(?:ein|zwei|drei|vier|fünf|sechs) Jahre?\b/g)) {
        expect(belegt, `${job.id}: ${genannt}`).toContain(genannt);
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

    // Ausbildung 2027: Fahrtkosten und Führerschein wie im Paket, die Übernahmegarantie gilt nur für 2026 (A1)
    const az27Text = klartext(inhalt(azubi27));
    const mobil27 = azubi27.packageExtras.find((e) => e.label === 'Mobilität')!.text;
    expect(az27Text).toContain(FACTS.travelAllowance.short);
    expect(mobil27).toContain(FACTS.travelAllowance.short);
    expect(az27Text).toContain(FACTS.driversLicenseGrant.short);
    expect(mobil27).toContain('Pkw-Führerschein');
    expect(az27Text).not.toMatch(/Übernahme|garantiert/);
    expect(FACTS.takeoverGuarantee.pending?.onlyForJobIds).not.toContain(azubi27.id);

    // Büro: „moderneres Büro, größeres Lager“ aus REGION.milestone, die Aufgaben aus der Stelle (fakten-abgleich S5)
    expect(REGION.milestone.text).toContain('moderneres Büro, größeres Lager');
    const bueroText = klartext(inhalt(buero));
    expect(bueroText).toContain('unser Büro moderner und das Lager größer');
    for (const wort of ['Angebote', 'Rechnungen', 'Großhandel', 'Ablage', 'Post', 'Geschäftsführung', 'Telefon']) {
      expect(buero.tasks.join(' '), wort).toContain(wort);
      expect(bueroText, wort).toContain(wort);
    }

    // Praktikum: Meisterbetrieb aus founded1926, Wärmepumpen-Spezialist aus REGION.milestone, kein Wort zu Geld (S4)
    const prText = klartext(inhalt(praktikum));
    expect(FACTS.founded1926.long).toContain('Innungs-Meisterbetrieb');
    expect(prText).toContain('Innungs-Meisterbetrieb');
    expect(REGION.milestone.text).toContain('Wärmepumpen-Spezialist');
    expect(prText).not.toMatch(/Lohn|Gehalt|Vergütung|verdien|bezahl|Geld|Prämie|Zuschuss|€|Euro/i);

    // Quereinstieg: Anforderung im Wortlaut der Stelle, Schwerpunkte aus der FAQ „heizsysteme“
    expect(klartext(inhalt(qe))).toContain(qe.requirements.find((r) => r.includes('Geschick'))!);
    expect(getFaqItem('heizsysteme').answer).toContain('Fußbodenheizungen');
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
    for (const job of pageJobs) expect(einblick(job, spaeter)!.vergleich, job.id).toBeNull();
    // Nur die Ausbildung 2026 ist abgelaufen: Die Fachkraft-Stellen verweisen weiter aufeinander, die Ausbildung 2027
    // nur noch auf das Praktikum, Quereinstieg und Praktikum auf die Ausbildung 2027.
    const januar = new Date('2027-01-05T00:00:00Z');
    expect(einblick(am, januar)!.vergleich).not.toBeNull();
    const ziele = (job: Job) => einblick(job, januar)!.vergleich!.teile.filter(isVerweis).map((v) => v.href);
    expect(ziele(azubi27)).toEqual([jobPath(praktikum)]);
    expect(ziele(qe)).toContain(jobPath(azubi27));
    expect(ziele(praktikum)).toEqual([jobPath(azubi27)]);
    for (const job of pageJobs) {
      if (job.id !== azubi.id) expect(einblick(job, januar)!.vergleich?.teile.filter(isVerweis).map((v) => v.href) ?? [], job.id).not.toContain(jobPath(azubi));
    }
  });
});

describe('Einblick: eigener Text je Stelle (V6-G2)', () => {
  it('die Bänder aller Stellen teilen keine 8-Wort-Folge', () => {
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

describe('<Einblick>: genau ein Weg zur Gebietsseite je Stellenseite (E-028)', () => {
  it.each(pageJobs.map((job) => [job.id, job] as const))('%s', (_id, job) => {
    const html = renderToStaticMarkup(createElement(Einblick, { job, now: NOW }));
    expect(html.match(/href="\/einsatzgebiet"/g)).toHaveLength(1);
    expect(html).toContain('Arbeitsweg von deinem Ort prüfen');
    // Keine Ortsseite verlinkt: Die Stellenseiten bleiben ohne Stadt-Duplikate (ROADMAP §10)
    expect(html).not.toMatch(/href="\/einsatzgebiet\//);
  });
});
