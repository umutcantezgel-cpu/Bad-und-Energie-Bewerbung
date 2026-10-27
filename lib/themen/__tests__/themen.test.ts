import { describe, expect, it } from 'vitest';
import { HOME_TITLE, homeDescription } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { FACTS, FACT_IDS, isFactActive, type FactId } from '@/lib/content/facts';
import { FAQ_ITEMS, JOB_FAQ_IDS } from '@/lib/content/faq';
import { DISCRETION_PROMISE, FUER_FACHKRAEFTE, getProcessSteps } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { TEAM_PROFILES, TEAM_QUOTES } from '@/lib/content/team';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { ALL_JOBS, getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { getEinsatzgebietPageText, getKreisPageText, getPlacePageText } from '@/lib/places/text';
import { getHubKreise, getPublishedPlaces } from '@/lib/places/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { themenPages } from '@/lib/seo/indexable-pages';
import { BUERO_MASSE, BUERO_SCHRIFTFELD } from '@/lib/zeichnung/buero/masse';
import { ogHomeText } from '@/lib/seo/og-image';
import { findClaims } from '../../../scripts/qa/check-claims.mjs';
import { arbeitenPfad, buildThemenItemListJsonLd, pfadJsonLd, pfadItems, themaPfad } from '../jsonld';
import { ogThemaText } from '../og';
import { ARBEITEN_PATH, THEMA_IDS, getThema, getThemaBySlug, getThemen, themaPath } from '../registry';
import {
  BUERO_THEMA_FRAGEN,
  alleQuellen,
  alleTexte,
  faktErlaubt,
  getArbeitenPageText,
  mitLohn,
  getThemaPageText,
  ohneAusstattung,
  saetze,
  stellenMitFakt,
  stellenMitZusatz,
  themaKarte,
  type Satz,
  type SeitenBasis,
} from '../text';

/**
 * Themenseiten (E-028): nur belegte Aussagen (Fakten per ID, bestätigt und gültig), kein Betrag zu Lohn oder Gehalt
 * (E-030: Lohn auf Anfrage), keine Zahl ohne Quelle, keine Arbeitszeit-Uhrzeit (fakten-abgleich B28), eindeutige Title,
 * Descriptions und h1.
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
  it('sechs Themen mit festen Slugs (ein veröffentlichter Slug bleibt; Büro und Verwaltung seit E-031 als sechstes)', () => {
    expect(THEMA_IDS).toEqual(['gehalt', 'fahrzeug-und-werkzeug', 'waermepumpen', 'betrieb', 'diskret-wechseln', 'buero-und-verwaltung']);
    expect(getThema('buero-und-verwaltung')).toMatchObject({ name: 'Büro und Verwaltung', icon: 'ordner' });
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

  it('offene Fakten stehen auf keiner Themenseite (A1 Übernahme, A2 1 %, A3 Gehalt am 1. Werktag, S6 Premium Partner)', () => {
    const offen = FACT_IDS.filter((id) => FACTS[id].pending);
    expect(offen.sort()).toEqual(['boschPremiumPartner', 'payFirstWorkday', 'privateCarOnePercent', 'takeoverGuarantee']);
    for (const seite of SEITEN) {
      const text = plain(alleTexte(seite).join(' '));
      for (const id of offen) {
        expect(text, `${seite.path}: ${id}`).not.toContain(FACTS[id].short);
        expect(text, `${seite.path}: ${id}`).not.toContain(FACTS[id].long);
      }
      expect(text).not.toMatch(/1[- ]?%|Werktag|Übernahmegarantie|garantiert|Premium[\s-]*Partner/i);
    }
  });

  it('keine festen Arbeitszeiten, kein „pünktlich …“, keine Wochenstunden (B28), kein Euro-Betrag (E-030)', () => {
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
      // Formate und Normen der Büro-Zeichnungen (A4, DIN lang, Europalette; Schriftfelder der Szenen)
      JSON.stringify(BUERO_MASSE),
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

  it('Bezahlung und Extras (E-030): Lohn auf Anfrage bei jeder Stelle mit Lohn, je Stelle Anstellung und Anzeige, kein Betrag', () => {
    // Das Schülerpraktikum sagt nichts zu Geld und steht deshalb nicht auf der Seite
    expect(mitLohn(JOBS).map((j) => j.id)).toEqual(JOBS.filter((j) => j.pay === 'auf-anfrage').map((j) => j.id));
    expect(JOBS.filter((j) => j.pay === 'keine-angabe').map((j) => j.id)).toEqual(['schuelerpraktikum-shk']);
    const gehalt = getThemaPageText('gehalt', { jobs: JOBS, now: NOW });
    if (gehalt.id !== 'gehalt') throw new Error('falsche Seite');
    expect(gehalt.meta.h1).toBe('Bezahlung und Extras');
    expect(gehalt.lohn.titel).toBe(FACTS.payOnRequest.short);
    expect(gehalt.og.wert).toBe('auf Anfrage');
    expect(gehalt.jeStelle.karten.map((k) => k.jobId)).toEqual(mitLohn(JOBS).map((j) => j.id));
    for (const karte of gehalt.jeStelle.karten) {
      const job = JOBS.find((j) => j.id === karte.jobId)!;
      expect(karte.verguetung, job.id).toBe(job.packageExtras.find((extra) => extra.label === 'Vergütung')?.text ?? null);
      // Voraussetzung wie in der Anzeige; offene Anforderungen (Bürofachkraft, M-038) bleiben leer
      for (const punkt of karte.voraussetzung) expect([job.education?.label, ...job.requirements], job.id).toContain(punkt);
      if (job.requirementsOpen) expect(karte.voraussetzung.filter((p) => p !== job.education?.label), job.id).toEqual([]);
    }
    expect(gehalt.ausbildung).not.toBeNull();
    // „Was dazukommt“: Jeder Zusatz nennt die Stellen, zu denen er gehört, sobald ihn nicht alle nennen; das Büro
    // (S5 offen) steht bei keinem, die Ausbildung nicht beim unbefristeten Vertrag
    const buero = JOBS.filter((j) => j.category === 'buero');
    expect(buero.length).toBeGreaterThan(0);
    const zusaetze = ['aboveTariff', 'vacation30', 'flexibleHours', 'permanentContract'] as const;
    expect(gehalt.dazu.kaesten.map((k) => k.titel)).toEqual(zusaetze.map((id) => FACTS[id].short));
    for (const [i, id] of zusaetze.entries()) {
      const kasten = gehalt.dazu.kaesten[i];
      const mit = stellenMitZusatz(id, mitLohn(JOBS));
      expect(kasten.giltFuer, id).toEqual(mit.map((j) => j.shortTitle));
      for (const j of mit) expect(FACTS[id].offenFuer?.kategorien ?? [], `${id} ${j.id}`).not.toContain(j.category);
      for (const j of buero) expect(kasten.giltFuer, id).not.toContain(j.shortTitle);
    }
    expect(gehalt.dazu.kaesten[3].giltFuer).not.toContain(JOBS.find((j) => j.category === 'ausbildung')!.shortTitle);
    // „Über Tarif plus Urlaubs- und Weihnachtsgeld“ gehört genau zu den Stellen mit aboveTariff unter ihren Vorteilen:
    // Die Paketzeilen der Ausbildung („über Tarif, plus Prämien“) und des Quereinstiegs („übertarifliche Bezahlung“)
    // sagen weniger und stehen nur im Wortlaut unter „Extras je Stelle“ (Prüfung E-029, Runde 3)
    const tarif = gehalt.dazu.kaesten[0];
    expect(tarif.titel).toBe(FACTS.aboveTariff.short);
    expect(tarif.giltFuer).toEqual(mitLohn(JOBS).filter((j) => j.benefitFactIds.includes('aboveTariff')).map((j) => j.shortTitle));
    expect(tarif.giltFuer).toEqual(['Anlagenmechaniker SHK', 'Kundendiensttechniker', 'Obermonteur / Projektleiter']);
    for (const j of JOBS.filter((j) => ['ausbildung', 'helfer'].includes(j.category))) {
      expect(tarif.giltFuer, j.id).not.toContain(j.shortTitle);
      const verguetung = j.packageExtras.find((extra) => extra.label === 'Vergütung')?.text;
      if (verguetung) expect(gehalt.jeStelle.karten.find((k) => k.jobId === j.id)?.verguetung, j.id).toBe(verguetung);
    }
    // Meta und Teilen-Bild: Lohn auf Anfrage bei jeder Stelle, die Extras je nach Stelle
    expect(gehalt.meta.description).toMatch(/je nach Stelle/);
    expect(gehalt.meta.description).not.toMatch(/bei jeder Stelle:/);
    expect(gehalt.og.zeilen[0]).toMatch(/je nach Stelle/);
    expect(findClaims(plain(alleTexte(gehalt).join(' ')))).toEqual([]);
    expect(plain(alleTexte(gehalt).join(' '))).not.toMatch(/€|\bEuro\b|brutto|Gehaltsspanne/);
  });

  it('Sammelfläche (Runde 2): Kopf der Gehalt-Seite und Hub nennen Tarif und Urlaub „je nach Stelle“, solange das Büro live ist', () => {
    expect(JOBS.some((j) => j.category === 'buero')).toBe(true);
    const gehalt = getThemaPageText('gehalt', { jobs: JOBS, now: NOW });
    if (gehalt.id !== 'gehalt') throw new Error('falsche Seite');
    expect(gehalt.unterzeile).toEqual([`${FACTS.payOnRequest.short}.`, `Je nach Stelle: ${FACTS.aboveTariff.short}.`]);
    expect(gehalt.einleitung.map((s) => s.text)).toEqual([`${FACTS.payOnRequest.long} Je nach Stelle: ${FACTS.aboveTariff.long}`]);
    expect(gehalt.masse.map((m) => plain(m.name))).toEqual([`${FACTS.vacation30.label} je nach Stelle`]);
    expect(gehalt.lohn.zeilen).toEqual([`${FACTS.aboveTariff.short} je nach Stelle`, `${FACTS.vacation30.short} je nach Stelle`]);
    // Ohne Stelle mit offener Kategorie und nur mit Stellen, die beides nennen: ohne Zusatz
    const beide = mitLohn(JOBS).filter((j) => stellenMitZusatz('aboveTariff', [j]).length > 0 && stellenMitZusatz('vacation30', [j]).length > 0);
    expect(beide.length).toBeGreaterThan(0);
    const ohne = getThemaPageText('gehalt', { jobs: beide, now: NOW });
    if (ohne.id !== 'gehalt') throw new Error('falsche Seite');
    expect(ohne.unterzeile).toEqual([`${FACTS.payOnRequest.short}.`, `${FACTS.aboveTariff.short}.`]);
    expect(ohne.lohn.zeilen).toEqual([FACTS.aboveTariff.short, FACTS.vacation30.short]);

    const hub = getArbeitenPageText({ jobs: JOBS, now: NOW });
    expect(hub.masse.map((m) => plain(m.name))).toContain(`${FACTS.vacation30.label} je nach Stelle`);
    // Der Hub teilt das Standardbild der Website (Prüfrunde 2 D2-4): kein eigenes Teilen-Modell, das niemand sähe; was
    // das Standardbild sagt, gilt hier wie dort (Urlaub nur je nach Stelle, keine Ausstattung)
    expect('og' in hub).toBe(false);
    const standard = ogHomeText(JOBS).texts.join(' ');
    expect(standard).toContain('Urlaub je nach Stelle');
    // Fahrzeug und Werkzeug (Prüfung E-031, D1-5): Büro und Praktikum haben keine Ausstattung; Description und
    // Teilen-Zeilen nennen sie dann nur mit „je nach Stelle“, und die Description nennt alle sechs Themen samt Büro
    expect(ohneAusstattung(JOBS, NOW).length).toBeGreaterThan(0);
    expect(hub.meta.description).toContain('Servicefahrzeug und Werkzeug je nach Stelle');
    expect(hub.meta.description).toContain('Büro');
    expect(standard).not.toMatch(/Fahrzeug|Werkzeug|Hilti/);
    expect(findClaims(standard)).toEqual([]);
    const fachHub = getArbeitenPageText({ jobs: JOBS.filter((j) => ohneAusstattung([j], NOW).length === 0), now: NOW });
    expect(fachHub.meta.description).toContain('Servicefahrzeug, Werkzeug-Ausstattung');
    expect('og' in fachHub).toBe(false);
    for (const kasten of hub.zusagen.kaesten) {
      const id = (['flexibleHours', 'vacation30', 'noWeekendOnCall', 'noFarAssembly'] as const).find((f) => FACTS[f].short === kasten.titel)!;
      if (FACTS[id].offenFuer) {
        expect(kasten.giltFuer, id).toEqual(stellenMitZusatz(id, JOBS).map((j) => j.shortTitle));
        for (const j of JOBS.filter((j) => j.category === 'buero')) expect(kasten.giltFuer, id).not.toContain(j.shortTitle);
        // Schülerpraktikum: zur Arbeitszeit nichts gesagt (S4, M-027; Prüfung E-029, Runde 3)
        if (id === 'flexibleHours') {
          const praktikum = JOBS.filter((j) => j.category === 'praktikum');
          expect(praktikum.length).toBeGreaterThan(0);
          for (const j of praktikum) expect(kasten.giltFuer, id).not.toContain(j.shortTitle);
        }
      } else {
        expect(kasten.giltFuer, id).toBeUndefined();
      }
    }
    // Karte „Bezahlung und Extras“ (Hub, Weitere Themen, llms-full.txt)
    const karte = hub.themen.karten.find((k) => k.id === 'gehalt')!;
    expect(karte.satz.text).toBe(`${FACTS.payOnRequest.long} Je nach Stelle: ${FACTS.aboveTariff.long}`);
  });

  it('Tankkarte (B8), iPad (B9) und Azubi-Set nur mit den Stellen, zu denen sie gehören', () => {
    const namen = (id: FactId) => stellenMitFakt(id, JOBS).map((job) => job.id);
    expect(namen('fuelCard').sort()).toEqual(['kundendiensttechniker-shk', 'obermonteur-projektleiter-shk']);
    expect(namen('ipadSmartphone').sort()).toEqual(['anlagenmechaniker-shk', 'kundendiensttechniker-shk']);
    expect(namen('azubiToolkit')).toEqual(['ausbildung-anlagenmechaniker-shk', 'ausbildung-anlagenmechaniker-shk-2027']);
    const fahrzeug = getThemaPageText('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW });
    if (fahrzeug.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    for (const position of fahrzeug.stueckliste.positionen) {
      if (['fuelCard', 'ipadSmartphone', 'azubiToolkit'].includes(position.factId)) expect(position.giltFuer).not.toBeNull();
    }
  });

  it('ohne live Stelle: kein Betrag, keine Stellenliste, Seiten bauen weiter', () => {
    const spaeter = new Date('2031-01-01T00:00:00Z');
    const ohne = seiten([], spaeter);
    for (const seite of ohne) {
      const text = plain(alleTexte(seite).join(' '));
      expect(text, seite.path).not.toMatch(/\d\.\d{3}–\d\.\d{3}/);
    }
    const gehalt = getThemaPageText('gehalt', { jobs: [], now: spaeter });
    if (gehalt.id !== 'gehalt') throw new Error('falsche Seite');
    expect(gehalt.jeStelle.karten).toEqual([]);
    expect(gehalt.ausbildung).toBeNull();
    expect(gehalt.zweitweg.href).toBe('#dazu');
    expect(gehalt.lohn.titel).toBe(FACTS.payOnRequest.short);
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

  it('Teilen-Bild: kurze Zeilen an der Rohrklammer (≤ 30 Zeichen), Wert aus der Seite (jede Themenseite; der Hub teilt das Standardbild)', () => {
    for (const seite of THEMA_IDS.map((id) => getThemaPageText(id, { jobs: JOBS, now: NOW }))) {
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

  it('ItemList des Hubs: die sechs Themen in Reihenfolge, je mit Canonical-URL', () => {
    const list = buildThemenItemListJsonLd();
    expect(list['@id']).toBe(`${getCleanCanonicalUrl(ARBEITEN_PATH)}#itemlist`);
    expect(list.itemListElement.map((e) => e.url)).toEqual(getThemen().map((t) => getCleanCanonicalUrl(themaPath(t))));
    expect(list.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(list.numberOfItems).toBe(6);
    // E-030: Name ohne „Gehalt“, der veröffentlichte Slug bleibt
    expect(getThema('gehalt').name).toBe('Bezahlung und Extras');
    expect(themaPath(getThema('gehalt'))).toBe(`${ARBEITEN_PATH}/gehalt`);
  });
});

describe('Büro und Verwaltung (E-031): nur Belegtes, nichts Offenes, nichts von der Baustelle', () => {
  const seite = getThemaPageText('buero-und-verwaltung', { jobs: JOBS, now: NOW });
  if (seite.id !== 'buero-und-verwaltung') throw new Error('falsche Seite');
  // Die Karten der übrigen Themen („Weitere Themen“) sprechen für ihre eigenen Seiten und werden dort geprüft
  const eigene = { ...seite, weitere: null };
  const text = plain(alleTexte(eigene).join(' '));
  const quellen = alleQuellen(eigene);
  const stelle = JOBS.find((job) => job.category === 'buero')!;

  it('die offenen Büro-Fakten (S5) stehen nie auf der Seite: Arbeitszeit, Urlaub, Tarif, Befristung', () => {
    expect(stelle).toBeDefined();
    for (const id of ['flexibleHours', 'vacation30', 'aboveTariff', 'permanentContract'] as const) {
      expect(FACTS[id].offenFuer?.kategorien, id).toContain('buero');
      expect(text, id).not.toContain(FACTS[id].short);
      expect(text, id).not.toContain(FACTS[id].long);
      expect(quellen, id).not.toContain(`fakt:${id}`);
    }
    expect(text).not.toMatch(/flexib|Urlaub|Tarif|unbefristet|Weihnachtsgeld|Überstunden/i);
  });

  it('keine Fakten der Baustelle: Hilti, Fahrzeug, 35 km, Fernmontage, iPad, Tankkarte, Messtechnik', () => {
    const baustelle = ['hilti', 'vehicle', 'radius35', 'noFarAssembly', 'ipadSmartphone', 'fuelCard', 'workwear', 'measurementTools', 'paidCertifications', 'azubiToolkit'] as const;
    for (const id of baustelle) {
      expect(text, id).not.toContain(FACTS[id].short);
      expect(text, id).not.toContain(FACTS[id].long);
      expect(quellen, id).not.toContain(`fakt:${id}`);
    }
    expect(text).not.toMatch(/Hilti|Servicefahrzeug|Firmenwagen|35\s?km|Fernmontage|iPad|Tankkarte|Werkzeug/i);
    // Keine Uhrzeit: Die Bürozeiten stehen nur im Kontakt (OpeningHoursText, „Büro erreichbar“), nie im Textmodell
    expect(text).not.toMatch(/\d:\d\d|\bUhr\b/);
    expect(findClaims(text)).toEqual([]);
  });

  it('Aufgaben im Wortlaut der Bürostelle, Umfang und Lohn aus der Anzeige, Fragen der Stellenart', () => {
    expect(seite.aufgaben.szenen.map((s) => s.id)).toEqual(['wochenplan', 'beleg', 'material', 'ablage']);
    expect(seite.aufgaben.szenen.map((s) => s.aufgabe?.text)).toEqual([...stelle.tasks]);
    for (const szene of seite.aufgaben.szenen) {
      expect(szene.aufgabe?.quellen).toEqual([`stelle:${stelle.id}`]);
      expect(szene.schriftfeld).toBe(BUERO_SCHRIFTFELD[szene.id]);
    }
    expect(seite.aufgaben.kopf.heading).toBe('Die vier Aufgaben im Büro');
    expect(seite.aufgaben.kopf.lead?.text).toBe(stelle.summary);
    expect(seite.unterzeile).toEqual(['Voll- oder Teilzeit.', `${FACTS.payOnRequest.short}.`]);
    expect(seite.einleitung[0].text).toBe(saetze(stelle.intro)[0]);
    expect(seite.einleitung.map((s) => s.quellen)).toEqual([[`stelle:${stelle.id}`], ['betrieb:meilenstein']]);
    // Der direkte Draht steht einmal (Kasten unter „Betrieb“), nicht zusätzlich im Kopf
    expect(seite.einleitung.some((s) => s.text.includes(FACTS.directLine.long))).toBe(false);
    expect(seite.meta.primaryKeyword).toBe('Büro und Verwaltung SHK-Betrieb Wetzlar');
    expect(seite.og.zeichnung).toBe('buero');
    // Höchstens drei der fünf Fragen der Stellenseite (Prüfung E-031, D1-6)
    expect(seite.fragen.fragen.map((f) => f.id)).toEqual([...BUERO_THEMA_FRAGEN]);
    expect(seite.fragen.fragen.filter((f) => JOB_FAQ_IDS.buero.includes(f.id)).length).toBeLessThanOrEqual(3);
    expect(seite.betrieb.kaesten.map((k) => k.titel)).toEqual(
      (['payOnRequest', 'directLine', 'employees15', 'founded1926'] as const).map((id) => FACTS[id].short),
    );
    expect(seite.stellen?.kopf.lead?.quellen).toEqual([`stelle:${stelle.id}`]);
    expect(seite.ablauf).toEqual({ audience: 'buero' });
  });

  it('ohne live Bürostelle: keine Aufgabe, keine Stelle, kein Ablauf; Büro und Lager aus dem Meilenstein', () => {
    const jobs = JOBS.filter((job) => job.category !== 'buero');
    const ohne = getThemaPageText('buero-und-verwaltung', { jobs, now: NOW });
    if (ohne.id !== 'buero-und-verwaltung') throw new Error('falsche Seite');
    expect(ohne.aufgaben.szenen.every((s) => s.aufgabe === null)).toBe(true);
    expect(ohne.stellen).toBeNull();
    expect(ohne.ablauf).toBeNull();
    expect(ohne.unterzeile).toEqual(['Moderneres Büro,', 'größeres Lager.']);
    expect(ohne.einleitung[0].quellen).toEqual(['betrieb:meilenstein']);
    expect(alleQuellen({ ...ohne, weitere: null }).some((q) => q.startsWith('stelle:'))).toBe(false);
    const karte = themaKarte('buero-und-verwaltung', { jobs, now: NOW });
    expect(karte.wert).toBeUndefined();
    expect(karte.satz.quellen).toEqual(['betrieb:meilenstein']);
    expect(ohne.meta.description.length).toBeGreaterThanOrEqual(110);
    expect(ohne.meta.description.length).toBeLessThanOrEqual(155);
  });

  it('Description der Themenseite ist eine andere als die der Stellenseite: das Büro selbst, nicht die Anzeige (Prüfung E-031, D1-6)', () => {
    const thema = seite.meta.description;
    const anzeige = stelle.seo.metaDescription;
    const woerter = (t: string) => new Set(t.toLocaleLowerCase('de').match(/[a-zäöüß0-9-]{4,}/g) ?? []);
    const a = woerter(thema);
    const b = woerter(anzeige);
    const gemeinsam = [...a].filter((w) => b.has(w)).length;
    // Jaccard der Wörter ab vier Zeichen unter 0,25; keine gemeinsame Aufzählung von Umfang und Betrieb
    expect(gemeinsam / new Set([...a, ...b]).size).toBeLessThan(0.25);
    expect(thema).not.toContain('Voll- oder Teilzeit');
    expect(thema).not.toContain('SHK-Meisterbetrieb in Wetzlar');
    // Aus Quellen: Meilenstein (Umzug, moderneres Büro), direkter Draht, Meisterbetrieb seit 1926
    expect(thema).toContain(`seit dem Umzug ${REGION.milestone.year}`);
    expect(thema).toContain(FACTS.directLine.short.replace(/^D/, 'd'));
    expect(thema).toContain(FACTS.founded1926.short);
    expect(findClaims(thema)).toEqual([]);
  });

  it('Hub und Karte: die Arbeit im Büro nur mit live Bürostelle, Umfang als Kennwert', () => {
    const karte = themaKarte('buero-und-verwaltung', { jobs: JOBS, now: NOW });
    expect(karte.satz).toEqual({ text: stelle.summary, quellen: [`stelle:${stelle.id}`] });
    expect(karte.wert).toBe('Voll- oder Teilzeit');
    expect(getArbeitenPageText({ jobs: JOBS, now: NOW }).themen.kopf.lead?.text).toContain('der Arbeit im Büro');
    expect(getArbeitenPageText({ jobs: JOBS.filter((job) => job.category !== 'buero'), now: NOW }).themen.kopf.lead?.text).not.toContain('Büro');
  });
});

describe('Fahrzeug und Werkzeug (E-031): Einschränkung am Anfang, solange eine Stelle ohne Ausstattung live ist', () => {
  it('Büro und Schülerpraktikum nennen keine Ausstattung; dann „Je nach Stelle“ vorn, der erste Tag der Fachkräfte nur mit Deckung in der Stückliste (Prüfrunde 3 D3-2)', () => {
    expect(ohneAusstattung(JOBS, NOW).map((job) => job.category).sort()).toEqual(['buero', 'praktikum']);
    const seite = getThemaPageText('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW });
    if (seite.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    // Eine Einschränkung für Werkzeug und Fahrzeug, im Wortlaut der Karte im Hub (Prüfrunde 4 D4-3)
    expect(seite.unterzeile).toEqual([`Je nach Stelle: ${FACTS.hilti.short} und ${FACTS.vehicle.short}.`]);
    expect(seite.unterzeile).toEqual([themaKarte('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW }).satz.text]);
    // Die persönliche Akku-Flotte gehört laut Stückliste nicht zum Kundendiensttechniker (Hilti-Koffer): kein
    // „Für Fachkräfte: Am ersten Tag stehen dein persönliches Werkzeugset und dein Servicefahrzeug bereit.“
    expect(seite.einleitung.map((s) => s.text).join(' ')).not.toContain('Am ersten Tag');
    expect(seite.einleitung.map((s) => s.quellen)).toEqual([['fakt:hilti']]);
    expect(seite.og.zeilen).toEqual([FACTS.hilti.short, 'je nach Stelle.']);
    expect(themaKarte('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW }).satz.text).toBe(
      `Je nach Stelle: ${FACTS.hilti.short} und ${FACTS.vehicle.short}.`,
    );
  });

  it('Prüfrunde 2 D2-1: Stückliste und Description schränken ebenso ein – jede Position mit „Gehört zu“, nie Büro oder Praktikum', () => {
    const ohne = ohneAusstattung(JOBS, NOW);
    expect(ohne.length).toBeGreaterThan(0);
    const seite = getThemaPageText('fahrzeug-und-werkzeug', { jobs: JOBS, now: NOW });
    if (seite.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    expect(seite.stueckliste.positionen.length).toBeGreaterThan(4);
    for (const position of seite.stueckliste.positionen) {
      expect(position.giltFuer, position.factId).not.toBeNull();
      expect(position.giltFuer!.length, position.factId).toBeGreaterThan(0);
      for (const job of ohne) expect(position.giltFuer, position.factId).not.toContain(job.shortTitle);
      // Jede genannte Stelle nennt die Position selbst (Vorteil oder Paketzeile) und ist eine Quelle des Satzes
      for (const titel of position.giltFuer!) {
        const job = JOBS.find((j) => j.shortTitle === titel)!;
        expect(stellenMitFakt(position.factId, JOBS).map((j) => j.id), `${position.factId}: ${titel}`).toContain(job.id);
        expect(position.quellen, `${position.factId}: ${titel}`).toContain(`stelle:${job.id}`);
      }
    }
    // Die persönliche 22-V-Flotte nur, wo die Anzeige sie so nennt (nicht Hilti-Koffer, Basisausstattung, Azubi-Set);
    // der Obermonteur nennt seit 2026-10-27 kein Hilti-Werkzeug mehr (Inhaber)
    const hilti = seite.stueckliste.positionen.find((p) => p.factId === 'hilti')!;
    expect(hilti.giltFuer).toEqual(['Anlagenmechaniker SHK']);
    expect(seite.meta.description.startsWith('Je nach Stelle: ')).toBe(true);
    // Inhaber 2026-10-27: Hilti nennen nur die Anzeigen in ihrem Paket, nicht die Sammelseite
    expect(seite.meta.description).not.toContain('Hilti');
  });

  it('Prüfrunde 3 D3-2: keine Zusage im Kopf gilt einer Stelle, die die Stückliste für dieselbe Ausstattung ausschließt', () => {
    const fach = JOBS.filter((job) => job.apply.questionSet === 'fachkraft');
    const auswahlen = [JOBS, fach, ...fach.map((job) => [job]), fach.filter((job) => job.category !== 'projektleitung')];
    let mitZusage = 0;
    for (const jobs of auswahlen) {
      const seite = getThemaPageText('fahrzeug-und-werkzeug', { jobs, now: NOW });
      if (seite.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
      const kopf = seite.einleitung.map((s) => s.text).join(' ');
      const gilt = (factId: string, job: (typeof JOBS)[number]) =>
        seite.stueckliste.positionen.some((p) => p.factId === factId && (p.giltFuer === null || p.giltFuer.includes(job.shortTitle)));
      const zusagen = [
        { muster: /persönliches Werkzeugset/, factId: 'hilti' },
        { muster: /Servicefahrzeug/, factId: 'vehicle' },
      ].filter((z) => z.muster.test(kopf));
      for (const { factId } of zusagen) {
        mitZusage += 1;
        for (const job of jobs.filter((j) => j.apply.questionSet === 'fachkraft')) expect(gilt(factId, job), `${factId}: ${job.shortTitle}`).toBe(true);
      }
    }
    // Die Prüfung greift: In mindestens einer Auswahl steht die Zusage (nur Stellen, die beides nennen)
    expect(mitZusage).toBeGreaterThan(0);
  });

  it('Prüfrunde 4 D4-3: „je nach Stelle“ steht in der Unterzeile höchstens einmal, in jeder Auswahl von Stellen', () => {
    const fach = JOBS.filter((job) => job.apply.questionSet === 'fachkraft');
    const ohne = ohneAusstattung(JOBS, NOW);
    const auswahlen = [JOBS, fach, ...JOBS.map((job) => [job]), ...ohne.map((job) => [...fach, job]), fach.filter((job) => job.category !== 'kundendienst')];
    let mitEinschraenkung = 0;
    for (const jobs of auswahlen) {
      const seite = getThemaPageText('fahrzeug-und-werkzeug', { jobs, now: NOW });
      if (seite.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
      const treffer = seite.unterzeile.join(' ').match(/je nach stelle/gi) ?? [];
      expect(treffer.length, jobs.map((job) => job.shortTitle).join(', ')).toBeLessThanOrEqual(1);
      if (treffer.length === 1) mitEinschraenkung += 1;
    }
    // Die Prüfung greift: In mindestens einer Auswahl steht die Einschränkung
    expect(mitEinschraenkung).toBeGreaterThan(0);
  });

  it('nur Fachkräfte mit Fahrzeug und Werkzeug: ohne Einschränkung wie bisher', () => {
    const fach = JOBS.filter((job) => ['anlagenmechaniker', 'kundendienst', 'projektleitung'].includes(job.category));
    expect(ohneAusstattung(fach, NOW)).toEqual([]);
    const seite = getThemaPageText('fahrzeug-und-werkzeug', { jobs: fach, now: NOW });
    if (seite.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    expect(seite.unterzeile[0]).toBe(`${FACTS.hilti.short}.`);
    // Das Servicefahrzeug nennt der Obermonteur nicht (Firmenwagen und Tankkarte): kein erster Tag im Kopf (Prüfrunde 3
    // D3-2); mit Stellen, die beides nennen, steht er da (ohne „Für Fachkräfte“, es gibt keine anderen Abläufe)
    expect(seite.einleitung.map((s) => s.text).join(' ')).not.toContain('Am ersten Tag');
    const beides = getThemaPageText('fahrzeug-und-werkzeug', { jobs: fach.filter((job) => job.category === 'anlagenmechaniker'), now: NOW });
    if (beides.id !== 'fahrzeug-und-werkzeug') throw new Error('falsche Seite');
    expect(beides.einleitung[0].text).toBe(getProcessSteps('fachkraft')[2].text.split(/(?<=\.)\s+/).find((s) => s.startsWith('Am ersten Tag')));
    // Die Ausstattung aller gilt ohne „Gehört zu“, die Description ohne „Je nach Stelle“ vorn
    for (const id of ['hilti', 'measurementTools', 'workwear']) expect(seite.stueckliste.positionen.find((p) => p.factId === id)?.giltFuer, id).toBeNull();
    expect(seite.meta.description.startsWith('Je nach Stelle')).toBe(false);
  });
});
