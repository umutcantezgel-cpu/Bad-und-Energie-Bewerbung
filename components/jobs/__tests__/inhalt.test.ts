import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import JobsPage from '@/app/jobs/page';
import { Ablauf } from '@/components/jobs/liste/Ablauf';
import { Einsatzgebiet } from '@/components/jobs/liste/Einsatzgebiet';
import { Initiativband } from '@/components/jobs/liste/Initiativband';
import { StellenKopf } from '@/components/jobs/liste/StellenKopf';
import { Stellenvergleich } from '@/components/jobs/liste/Stellenvergleich';
import { Stellenverteiler } from '@/components/jobs/liste/Stellenverteiler';
import {
  ABLAUF_VARIANTEN,
  ALLTAG,
  VERGLEICH,
  stellenanzeigeLabel,
  stellenprofil,
  vergleichEinleitung,
} from '@/components/jobs/liste/inhalt-text';
import { GEBIET_LINK, LISTEN_EINLEITUNG, LISTEN_ORTE } from '@/components/jobs/liste/liste-text';
import { FACTS } from '@/lib/content/facts';
import { getFaqItems } from '@/lib/content/faq';
import { DISCRETION_PROMISE, getProcessIntro, getProcessSteps, type ProcessAudience } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { formatSalaryRange, jobPath } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, isJobLive } from '@/lib/jobs/registry';

/**
 * Herkunft der neuen Texte auf /jobs (V6-G1): Jeder Satz stammt aus FACTS, REGION, lib/content/process,
 * lib/content/faq oder den Stellendaten; eigene Wörter sind nur Überschriften, Etiketten und Linktexte, ohne Zahl.
 * Dazu die Faktenregel E-023 (ein Fakt in höchstens zwei Abschnitten) und die Suchbegriffe des Seitentitels.
 */

const STICHTAG = new Date('2026-10-10T12:00:00+02:00');
const JOBS = getActiveJobs().filter((job) => isJobLive(job, STICHTAG));
const AUDIENCES: ProcessAudience[] = ['fachkraft', 'ausbildung', 'quereinstieg'];

/** Wie der Leser es sieht: geschützte Leerzeichen als Leerzeichen, ohne weiche Trennstellen und Wortverbinder. */
const normal = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/[­⁠]/g, '')
    .replace(/[\s ]+/g, ' ')
    .trim();

/** Textknoten einer gerenderten Komponente (ohne SVG), je Knoten getrennt an „ · “. */
function textknoten(html: string): string[] {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .split(/<[^>]+>/)
    .flatMap((knoten) => normal(knoten).split(' · '))
    .map((knoten) => knoten.trim())
    .filter(Boolean);
}

const saetze = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
const sichtbar = (html: string) => normal(html.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' '));
const render = (element: ReactElement) => renderToStaticMarkup(element);

/** Alle belegten Quellen als ein Text: FACTS, REGION, Ablauf, FAQ und die Stellendaten. */
const KORPUS = normal(
  [
    ...Object.values(FACTS).flatMap((fact) => [fact.short, fact.long, fact.value ?? '', fact.label ?? '']),
    REGION.headline,
    REGION.summary,
    REGION.milestone.text,
    ...REGION.locations.flatMap((ort) => [ort.name, String(ort.distanceKm), String(ort.commuteMinutes)]),
    ...AUDIENCES.flatMap((audience) => [
      getProcessIntro(audience).title,
      getProcessIntro(audience).text,
      ...getProcessSteps(audience).flatMap((step) => [String(step.number), step.title, step.text]),
    ]),
    DISCRETION_PROMISE,
    ...getFaqItems().map((faq) => faq.answer),
    ...ALL_JOBS.flatMap((job) => [
      job.title,
      job.shortTitle,
      job.summary,
      job.intro,
      ...job.tasks,
      ...job.requirements,
      formatSalaryRange(job) ?? '',
    ]),
  ].join('\n'),
);

/** Eigene Wörter der neuen Abschnitte: Überschriften, Etiketten, Linktexte und die Einleitung des Vergleichs. */
const EIGENE = [
  VERGLEICH.etikett,
  VERGLEICH.titel,
  VERGLEICH.aufgaben,
  VERGLEICH.voraussetzung,
  VERGLEICH.gehalt,
  VERGLEICH.verguetung,
  ...saetze(vergleichEinleitung(JOBS)),
  ...JOBS.map((job) => normal(stellenanzeigeLabel(job))),
  ALLTAG.etikett,
  ALLTAG.woche.titel,
  ALLTAG.betrieb.titel,
  ALLTAG.orte.titel,
  ALLTAG.orte.einleitung,
  GEBIET_LINK.label,
  ABLAUF_VARIANTEN.titel,
  ...ABLAUF_VARIANTEN.eintraege.map((eintrag) => eintrag.name),
  // Bestand von JobProcess (Stellenseiten): Etikett über dem Ablauf
  'Ablauf',
].map(normal);

/** Die neuen Abschnitte, so wie die Seite sie rendert. */
const NEU = {
  vergleich: render(createElement(Stellenvergleich, { jobs: JOBS })),
  einsatzgebiet: render(createElement(Einsatzgebiet)),
  ablauf: render(createElement(Ablauf)),
};

const zahlen = (text: string) => (text.match(/\d+/g) ?? []).map((zahl) => zahl.replace(/^0+(?=\d)/, ''));

describe('Herkunft: jeder Satz der neuen Abschnitte hat eine Quelle', () => {
  it.each(Object.entries(NEU))('%s', (_name, html) => {
    for (const knoten of textknoten(html)) {
      // Orte: „15 km“ und „ca. 16 Min.“ aus REGION.locations (Zahlen prüft der nächste Test)
      if (/^(\d+ km|ca\. \d+ Min\.)$/.test(knoten)) continue;
      // Schrittnummer „01“ an der Leitung und „Schritt 1:“ für Screenreader (Nummern aus lib/content/process)
      if (/^(\d+|Schritt \d+:)$/.test(knoten)) continue;
      for (const satz of saetze(knoten)) {
        expect(KORPUS.includes(satz) || EIGENE.includes(satz), `ohne Quelle: „${satz}“`).toBe(true);
      }
    }
  });

  it('eigene Wörter enthalten keine Zahl und keine Superlative', () => {
    for (const wort of EIGENE) {
      expect(wort, wort).not.toMatch(/\d/);
      expect(wort, wort).not.toMatch(/\b(beste[nrs]?|größte[nrs]?|top|einzigartig|perfekt|garantiert)\b/i);
    }
  });

  it('jede Zahl der neuen Abschnitte steht in einer Quelle', () => {
    const belegt = new Set(zahlen(KORPUS));
    for (const [name, html] of Object.entries(NEU)) {
      for (const zahl of zahlen(sichtbar(html))) expect(belegt.has(zahl), `${name}: ${zahl}`).toBe(true);
    }
  });
});

describe('Stellenvergleich: Aufgaben, Voraussetzungen und Gehalt aus den Stellendaten', () => {
  it('Einleitung: die Stellenarten der Liste, sonst nur zwei geprüfte eigene Sätze', () => {
    expect(vergleichEinleitung(JOBS)).toBe(
      'Anlagenmechaniker, Kundendienst, Obermonteur oder Ausbildung: Die Stellen unterscheiden sich in Aufgaben, Voraussetzungen und Gehalt. Alle Angaben stammen aus der jeweiligen Stellenanzeige.',
    );
  });

  it('je Stelle die Aufgaben (ohne Einsatzradius), die ersten zwei Anforderungen und die Gehaltsspanne', () => {
    for (const job of JOBS) {
      const profil = stellenprofil(job);
      expect(profil.aufgaben.length).toBeGreaterThan(0);
      for (const aufgabe of profil.aufgaben) {
        expect(job.tasks).toContain(aufgabe);
        expect(aufgabe).not.toContain(`${REGION.radiusKm}-km`);
      }
      expect(profil.voraussetzungen).toEqual(job.requirements.slice(0, 2));
      expect(profil.gehalt?.wert).toBe(formatSalaryRange(job));
      expect(profil.gehalt?.label).toBe(job.employment.kind === 'ausbildung' ? VERGLEICH.verguetung : VERGLEICH.gehalt);
    }
  });

  it('je Stelle ein beschreibender Link auf die Stellenseite, kein Linktext zweimal', () => {
    const html = NEU.vergleich;
    const labels = JOBS.map((job) => normal(stellenanzeigeLabel(job)));
    expect(new Set(labels).size).toBe(JOBS.length);
    for (const job of JOBS) {
      expect(html).toContain(`href="${jobPath(job)}"`);
      expect(normal(stellenanzeigeLabel(job))).toContain(job.shortTitle);
    }
  });

  it('h2 mit den Wörtern des Seitentitels, Stellentitel als h3; unter zwei Stellen kein Vergleich', () => {
    expect(NEU.vergleich).toMatch(/<h2 id="vergleich-titel"[^>]*>Alle offenen Jobs im Vergleich<\/h2>/);
    expect(NEU.vergleich.match(/<h3\b/g)).toHaveLength(JOBS.length);
    expect(render(createElement(Stellenvergleich, { jobs: JOBS.slice(0, 1) }))).toBe('');
  });
});

describe('Arbeitsalltag und Einsatzgebiet', () => {
  it('Arbeitswoche, Betrieb und Orte im Wortlaut von FACTS und REGION', () => {
    expect(normal(ALLTAG.woche.text)).toBe(`${FACTS.workingHours.long} ${FACTS.noWeekendOnCall.long}`);
    expect(normal(ALLTAG.betrieb.text)).toBe(REGION.milestone.text);
    expect(ALLTAG.orte.liste.map((ort) => [ort.name, normal(ort.entfernung), normal(ort.fahrzeit)])).toEqual(
      REGION.locations.map((ort) => [ort.name, `${ort.distanceKm} km`, `ca. ${ort.commuteMinutes} Min.`]),
    );
  });

  it('Bestand bleibt: REGION.headline als h2, REGION.summary und der Weg zur Karte; Unterabschnitte als h3', () => {
    const html = NEU.einsatzgebiet;
    expect(sichtbar(/<h2 id="einsatzgebiet"[^>]*>(.*?)<\/h2>/.exec(html)![1])).toBe(REGION.headline);
    expect(html).toContain(REGION.summary);
    expect(html).toContain(`href="${GEBIET_LINK.href}"`);
    expect(html.match(/<h3\b/g)).toHaveLength(3);
  });
});

describe('Ablauf: Fachkräfte wie auf den Stellenseiten, dazu Ausbildung und Quereinstieg', () => {
  it('Schritte und Diskretionszusage aus lib/content/process, die Ausnahmen im Wortlaut', () => {
    const text = sichtbar(NEU.ablauf);
    for (const step of getProcessSteps('fachkraft')) expect(text).toContain(step.text);
    expect(text).toContain(DISCRETION_PROMISE);
    const [ausbildung, quereinstieg] = ABLAUF_VARIANTEN.eintraege;
    expect(ausbildung.text).toBe(`${getProcessSteps('ausbildung')[1].text} ${getProcessSteps('ausbildung')[2].text}`);
    expect(quereinstieg.text).toBe(getProcessSteps('quereinstieg')[2].text);
  });
});

describe('/jobs: Seitentitel und Faktenregel (V6-G1)', () => {
  const seite = render(createElement(JobsPage));
  const woerter = sichtbar(seite.replace(/<script[\s\S]*?<\/script>/g, ''))
    .split(' ')
    .filter((wort) => /[\p{L}\p{N}]/u.test(wort));

  it('„Stellenangebote“, „SHK“, „Wetzlar“ und „Gießen“ in den ersten 100 Wörtern; mindestens 550 Wörter', () => {
    const anfang = woerter.slice(0, 100).join(' ');
    for (const begriff of ['Stellenangebote', 'SHK', 'Wetzlar', 'Gießen']) expect(anfang, begriff).toContain(begriff);
    expect(woerter.length).toBeGreaterThanOrEqual(550);
  });

  it('die Einleitung nennt nur Belegtes: SHK-Stellen, Gründungsjahr, Orte aus REGION.summary', () => {
    expect(JOBS.every((job) => job.title.includes('SHK'))).toBe(true);
    expect(normal(LISTEN_EINLEITUNG)).toContain(FACTS.founded1926.short);
    for (const ort of LISTEN_ORTE.split(' und ')) expect(REGION.summary).toContain(ort);
  });

  it('eine h1, Überschriften ohne Sprung (h1 → h2 → h3 → h4 nie übersprungen)', () => {
    const stufen = [...seite.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    expect(stufen.filter((stufe) => stufe === 1)).toHaveLength(1);
    expect(stufen[0]).toBe(1);
    for (let i = 1; i < stufen.length; i++) expect(stufen[i] - stufen[i - 1], `Stufe ${stufen[i]} nach ${stufen[i - 1]}`).toBeLessThanOrEqual(1);
  });

  it('E-023: jeder Fakt der neuen Abschnitte steht in höchstens zwei Abschnitten', () => {
    const abschnitte = {
      kopf: render(createElement(StellenKopf, { jobs: JOBS, titel: 'Offene Stellen in Wetzlar und Umgebung' })),
      stellen: render(createElement(Stellenverteiler, { jobs: JOBS })),
      ...NEU,
      // Öffnungszeiten im Kontaktblock sind Kontaktdaten (COMPANY.openingHours), keine Aussage über die Arbeit
      initiativ: render(createElement(Initiativband, { auchMoeglich: [] })).replace(/Öffnungszeiten:[\s\S]*$/, ''),
    };
    const MARKEN: Record<string, RegExp> = {
      radius35: /35[\s -]km/,
      friday1330: /13:30/,
      noFarAssembly: /Fernmontage/,
      noCvNeeded: /Lebenslauf/,
      apply60s: /60[\s ]Sekunden/,
      hilti: /persönliche[rs]? Hilti/,
      azubiToolkit: /eigene[ms]? Hilti/,
      vehicle: /Servicefahrzeug/,
      permanentContract: /[Uu]nbefristet/,
      ipadSmartphone: /iPad/,
      countyPartner: /Liegenschaften|Fachbetrieb des Lahn-Dill-Kreises/,
      discretion: /diskret|vertraulich/i,
    };
    for (const [fakt, marke] of Object.entries(MARKEN)) {
      const fundorte = Object.entries(abschnitte)
        .filter(([, html]) => marke.test(sichtbar(html)))
        .map(([name]) => name);
      expect(fundorte.length, `${fakt}: ${fundorte.join(', ')}`).toBeLessThanOrEqual(2);
    }
  });
});
