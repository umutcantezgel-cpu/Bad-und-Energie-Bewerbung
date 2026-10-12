import { describe, expect, it } from 'vitest';
import { HOME_TITLE, homeDescription } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { FACTS, FACT_IDS, isFactActive, type FactId } from '@/lib/content/facts';
import { FAQ_ITEMS } from '@/lib/content/faq';
import { DISCRETION_PROMISE, getProcessSteps } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { TEAM_PROFILES, TEAM_QUOTES } from '@/lib/content/team';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { formatNumber } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { getEinsatzgebietPageText, getKreisPageText, getPlacePageText } from '@/lib/places/text';
import { getHubKreise, getPublishedPlaces } from '@/lib/places/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { themenPages } from '@/lib/seo/indexable-pages';
import { findClaims } from '../../../scripts/qa/check-claims.mjs';
import { arbeitenPfad, buildThemenItemListJsonLd, pfadJsonLd, pfadItems, themaPfad } from '../jsonld';
import { ogThemaText } from '../og';
import { ARBEITEN_PATH, THEMA_IDS, getThema, getThemaBySlug, getThemen, themaPath } from '../registry';
import {
  alleQuellen,
  alleTexte,
  fachkraftSpanne,
  faktErlaubt,
  gehaltsleiter,
  getArbeitenPageText,
  getThemaPageText,
  saetze,
  stellenMitFakt,
  type Satz,
  type SeitenBasis,
} from '../text';

/**
 * Themenseiten (E-028): nur belegte Aussagen (Fakten per ID, bestätigt und gültig), Gehälter nur aus den live Stellen,
 * keine Zahl ohne Quelle, keine Arbeitszeit-Uhrzeit (fakten-abgleich B28), eindeutige Title, Descriptions und h1.
 */

const NOW = new Date('2026-10-12T10:00:00Z');
const live = (now: Date): Job[] => getActiveJobs().filter((job) => isJobLive(job, now));
const JOBS = live(NOW);

function seiten(jobs: readonly Job[], now: Date): SeitenBasis[] {
  return [getArbeitenPageText({ jobs, now }), ...THEMA_IDS.map((id) => getThemaPageText(id, { jobs, now }))];
}

const SEITEN = seiten(JOBS, NOW);
const plain = (text: string) => text.replace(/[  ]/g, ' ');

/** Alle Sätze mit Aussage einer Seite (Objekte mit `text` und `quellen`). */
function alleSaetze(value: unknown): Satz[] {
  if (Array.isArray(value)) return value.flatMap(alleSaetze);
  if (value && typeof value === 'object') {
    const own = 'text' in value && 'quellen' in value ? [value as Satz] : [];
    return [...own, ...Object.values(value).flatMap(alleSaetze)];
  }
  return [];
}

describe('Registry der Themen', () => {
  it('fünf Themen mit festen Slugs (ein veröffentlichter Slug bleibt)', () => {
    expect(THEMA_IDS).toEqual(['gehalt', 'fahrzeug-und-werkzeug', 'waermepumpen', 'betrieb', 'diskret-wechseln']);
    expect(getThemen().map(themaPath)).toEqual(THEMA_IDS.map((id) => `${ARBEITEN_PATH}/${id}`));
    for (const thema of getThemen()) expect(getThemaBySlug(thema.slug)).toBe(thema);
    expect(getThemaBySlug('arbeitszeit')).toBeUndefined();
    expect(new Set(getThemen().map((t) => t.name)).size).toBe(THEMA_IDS.length);
  });

  it('Sitemap und IndexNow führen den Hub und alle Themen (Gruppe themen), Datum nie „heute“', () => {
    const pages = themenPages(NOW);
    expect(pages.map((p) => p.path)).toEqual([ARBEITEN_PATH, ...getThemen().map(themaPath)]);
    for (const page of pages) {
      expect(page.group).toBe('themen');
      expect(page.url).toBe(getCleanCanonicalUrl(page.path));
      expect(page.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('Texte der Themenseiten: nur Belegtes', () => {
  it('jeder Satz mit Aussage hat eine Quelle; jede Fakt-Quelle ist bestätigt und gültig', () => {
    for (const seite of SEITEN) {
      for (const satz of alleSaetze(seite)) expect(satz.quellen.length, `${seite.path}: ${satz.text}`).toBeGreaterThan(0);
      for (const quelle of alleQuellen(seite)) {
        expect(quelle, seite.path).toMatch(/^(fakt|stelle|faq|ablauf|team|betrieb|orte):[\w-]+$/);
        if (!quelle.startsWith('fakt:')) continue;
        const id = quelle.slice(5) as FactId;
        expect(FACT_IDS, quelle).toContain(id);
        expect(faktErlaubt(id, NOW), `${seite.path}: ${quelle} ist offen oder abgelaufen`).toBe(true);
      }
    }
  });

  it('offene Fakten stehen auf keiner Themenseite (A1 Übernahme, A2 1 %, A3 Gehalt am 1. Werktag)', () => {
    const offen = FACT_IDS.filter((id) => FACTS[id].pending);
    expect(offen.sort()).toEqual(['payFirstWorkday', 'privateCarOnePercent', 'takeoverGuarantee']);
    for (const seite of SEITEN) {
      const text = plain(alleTexte(seite).join(' '));
      for (const id of offen) {
        expect(text, `${seite.path}: ${id}`).not.toContain(FACTS[id].short);
        expect(text, `${seite.path}: ${id}`).not.toContain(FACTS[id].long);
      }
      expect(text).not.toMatch(/1[- ]?%|Werktag|Übernahmegarantie|garantiert/);
    }
  });

  it('keine festen Arbeitszeiten, kein „pünktlich …“, keine Wochenstunden (B28)', () => {
    for (const seite of SEITEN) {
      expect(findClaims(plain(alleTexte(seite).join(' '))), seite.path).toEqual([]);
      expect(plain(alleTexte(seite).join(' ')), seite.path).not.toMatch(/pünktlich|Feste Arbeitszeit|Wochenstunden/i);
    }
  });

  it('keine unbelegten Wörter: „Werkstatt“ (B31), „führend“ (B14), „24 Stunden“ (A4)', () => {
    for (const seite of SEITEN) {
      const text = plain(alleTexte(seite).join(' '));
      expect(text, seite.path).not.toMatch(/Werkstatt|führend|24 Stunden|brutto/i);
    }
  });

  it('jede Zahl steht in einer Quelle (Fakten, Stellen, Stammdaten, Ablauf, FAQ, Team, Orte)', () => {
    const quellen = [
      JSON.stringify(FACTS),
      JSON.stringify(JOBS),
      JSON.stringify(COMPANY),
      REGION.milestone.text,
      DISCRETION_PROMISE,
      JSON.stringify(getProcessSteps('fachkraft')),
      JSON.stringify(FAQ_ITEMS),
      JSON.stringify(TEAM_PROFILES),
      JSON.stringify(TEAM_QUOTES),
      ...JOBS.flatMap((job) => (job.salary ? [formatNumber(job.salary.min), formatNumber(job.salary.max)] : [])),
    ].join(' ');
    const erlaubt = new Set(plain(quellen).match(/\d[\d.,]*\d|\d/g) ?? []);
    // Gezählt statt abgeschrieben: Stellen, Orte, Themen, Schritte, Jahre seit der Gründung (bis zum Meilenstein)
    for (const n of [JOBS.length, getPublishedPlaces().length, THEMA_IDS.length, REGION.milestone.year - COMPANY.foundingYear]) {
      erlaubt.add(String(n));
    }
    for (const seite of SEITEN) {
      const zahlen = plain(alleTexte(seite).join(' ')).match(/\d[\d.,]*\d|\d/g) ?? [];
      for (const zahl of zahlen) {
        if (/^0\d$/.test(zahl)) continue; // Positionsnummern der Stückliste (01 …)
        expect(erlaubt.has(zahl), `${seite.path}: Zahl „${zahl}“ ohne Quelle`).toBe(true);
      }
    }
  });

  it('Gehälter nur aus den live Stellen: Spanne, Leiter und Karten', () => {
    expect(fachkraftSpanne(JOBS)).toBe('3.600–5.600\u00A0€');
    const leiter = gehaltsleiter(JOBS)!;
    expect(leiter.zeilen.map((z) => z.jobId).sort()).toEqual(JOBS.filter((j) => j.salary).map((j) => j.id).sort());
    for (const zeile of leiter.zeilen) {
      const job = JOBS.find((j) => j.id === zeile.jobId)!;
      expect([zeile.min, zeile.max]).toEqual([job.salary!.min, job.salary!.max]);
      expect(zeile.min).toBeGreaterThanOrEqual(leiter.von);
      expect(zeile.max).toBeLessThanOrEqual(leiter.bis);
    }
    const gehalt = getThemaPageText('gehalt', { jobs: JOBS, now: NOW });
    if (gehalt.id !== 'gehalt') throw new Error('falsche Seite');
    expect(gehalt.spannen.karten.map((k) => k.jobId)).toEqual(JOBS.map((j) => j.id));
    expect(gehalt.ausbildung).not.toBeNull();
  });

  it('Tankkarte (B8), iPad (B9) und Azubi-Set nur mit den Stellen, zu denen sie gehören', () => {
    const namen = (id: FactId) => stellenMitFakt(id, JOBS).map((job) => job.id);
    expect(namen('fuelCard').sort()).toEqual(['kundendiensttechniker-shk', 'obermonteur-projektleiter-shk']);
    expect(namen('ipadSmartphone').sort()).toEqual(['anlagenmechaniker-shk', 'kundendiensttechniker-shk']);
    expect(namen('azubiToolkit')).toEqual(['ausbildung-anlagenmechaniker-shk']);
    const fahrzeug = getThemaPageText('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW });
    if (fahrzeug.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    for (const position of fahrzeug.stueckliste.positionen) {
      if (['fuelCard', 'ipadSmartphone', 'azubiToolkit'].includes(position.factId)) expect(position.giltFuer).not.toBeNull();
    }
  });

  it('ohne live Stelle: keine Gehaltszahl, keine Stellenliste, Seiten bauen weiter', () => {
    const spaeter = new Date('2031-01-01T00:00:00Z');
    const ohne = seiten([], spaeter);
    for (const seite of ohne) {
      const text = plain(alleTexte(seite).join(' '));
      expect(text, seite.path).not.toMatch(/\d\.\d{3}–\d\.\d{3}/);
    }
    const gehalt = getThemaPageText('gehalt', { jobs: [], now: spaeter });
    if (gehalt.id !== 'gehalt') throw new Error('falsche Seite');
    expect(gehalt.leiter).toBeNull();
    expect(gehalt.spannen.karten).toEqual([]);
    expect(getArbeitenPageText({ jobs: [], now: spaeter }).stellen).toBeNull();
  });

  it('nach dem Jubiläumsjahr kein „100 Jahre Meisterbetrieb“ mehr im Etikett (anniversary100.validUntil)', () => {
    const betrieb = getThemaPageText('betrieb', { jobs: JOBS, now: NOW });
    expect(betrieb.etikett).toBe(FACTS.anniversary100.short);
    const danach = new Date('2027-01-02T00:00:00Z');
    expect(isFactActive('anniversary100', danach)).toBe(false);
    expect(getThemaPageText('betrieb', { jobs: live(danach), now: danach }).etikett).toBe(FACTS.founded1926.short);
  });

  it('Sätze trennen nicht an Abkürzungen vor Zahlen („Siegmund-Hiepe-Str. 20“)', () => {
    expect(saetze(REGION.milestone.text)).toHaveLength(2);
    expect(saetze(REGION.milestone.text)[0]).toContain(COMPANY.address.street);
  });

  it('WhatsApp-Nachricht je Seite eigen, mit dem Gruß der Stellenseiten', () => {
    const nachrichten = SEITEN.map((seite) => seite.whatsapp);
    expect(new Set(nachrichten).size).toBe(SEITEN.length);
    for (const nachricht of nachrichten) expect(nachricht.startsWith(WHATSAPP_GREETING)).toBe(true);
  });
});

describe('Metadaten: Längen und Eindeutigkeit (wie Gate U8)', () => {
  const metas = SEITEN.map((seite) => seite.meta);

  it('Title 30–60 Zeichen, Description 110–155 Zeichen, ohne Abbruch', () => {
    for (const meta of metas) {
      expect(meta.title.length, meta.title).toBeGreaterThanOrEqual(30);
      expect(meta.title.length, meta.title).toBeLessThanOrEqual(60);
      expect(meta.description.length, meta.description).toBeGreaterThanOrEqual(110);
      expect(meta.description.length, meta.description).toBeLessThanOrEqual(155);
      expect(meta.description.endsWith('…'), meta.description).toBe(false);
    }
  });

  it('Title, Description, h1 und Keyword eindeutig über Themen, Orte, Kreise, Stellen und Startseite', () => {
    const orte = getPublishedPlaces().map((place) => getPlacePageText(place, { jobs: JOBS }).meta);
    const kreise = getHubKreise().map((kreis) => getKreisPageText(kreis, { jobs: JOBS }).meta);
    const gebiet = getEinsatzgebietPageText({ jobs: JOBS }).meta;
    const andere = [...orte, ...kreise, gebiet];
    const bestehend = {
      title: [HOME_TITLE, 'Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs', ...ALL_JOBS.map((j) => j.seo.metaTitle), ...andere.map((m) => m.title)],
      description: [homeDescription(JOBS), jobsHubDescription(JOBS), ...ALL_JOBS.map((j) => j.seo.metaDescription), ...andere.map((m) => m.description)],
      h1: ['Offene Stellen in Wetzlar und Umgebung', ...ALL_JOBS.map((j) => j.seo.h1), ...andere.map((m) => m.h1)],
      primaryKeyword: [...ALL_JOBS.map((j) => j.seo.primaryKeyword), ...andere.map((m) => m.primaryKeyword)],
    };
    for (const key of ['title', 'description', 'h1', 'primaryKeyword'] as const) {
      const eigene = metas.map((meta) => meta[key]);
      expect(new Set(eigene).size, key).toBe(eigene.length);
      for (const wert of eigene) expect(bestehend[key], `${key}: ${wert}`).not.toContain(wert);
    }
  });

  it('Teilen-Bild: kurze Zeilen an der Rohrklammer (≤ 30 Zeichen), Wert aus der Seite', () => {
    for (const seite of SEITEN) {
      const og = ogThemaText(seite);
      for (const zeile of og.subline) expect(zeile.length, zeile).toBeLessThanOrEqual(30);
      expect(og.salary.value).toBe(plain(seite.og.wert));
      expect(findClaims(og.texts.join(' '))).toEqual([]);
    }
  });
});

describe('Pfad und strukturierte Daten', () => {
  it('Hub: Startseite › Arbeiten bei uns; Thema: Startseite › Arbeiten bei uns › Thema; letzte Stufe = Canonical', () => {
    expect(pfadItems(arbeitenPfad())).toEqual([{ label: 'Startseite', href: '/' }, { label: 'Arbeiten bei uns' }]);
    for (const thema of getThemen()) {
      const items = pfadItems(themaPfad(thema));
      expect(items.map((i) => i.label)).toEqual(['Startseite', 'Arbeiten bei uns', thema.name]);
      const list = pfadJsonLd(themaPfad(thema));
      expect(list.itemListElement.at(-1)?.item).toBe(getCleanCanonicalUrl(themaPath(thema)));
    }
  });

  it('ItemList des Hubs: die fünf Themen in Reihenfolge, je mit Canonical-URL', () => {
    const list = buildThemenItemListJsonLd();
    expect(list['@id']).toBe(`${getCleanCanonicalUrl(ARBEITEN_PATH)}#itemlist`);
    expect(list.itemListElement.map((e) => e.url)).toEqual(getThemen().map((t) => getCleanCanonicalUrl(themaPath(t))));
    expect(list.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4, 5]);
    expect(getThema('gehalt').name).toBe('Gehalt');
  });
});
