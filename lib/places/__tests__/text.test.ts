import { describe, expect, it } from 'vitest';
import { regionalLocations } from '@/lib/data/locations';
import { FACTS, offenBei } from '@/lib/content/facts';
import { getActiveJobs } from '@/lib/jobs/registry';
import { findClaims } from '../../../scripts/qa/check-claims.mjs';
import { DEFAULT_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp-utils';
import OEPNV_DATEI from '../data/oepnv.json';
import { OEPNV_QUELLE } from '../oepnv';
import { OSM_LINK, OSM_NAMENSNENNUNG, OSM_QUELLENZEILE } from '../osm';
import { getHubKreise, getKreisById, getKreise, getPlaceById, getPublishedPlaces } from '../registry';
import {
  BERUFSSCHULE_QUELLENZEILE,
  OEPNV_QUELLENLINKS,
  OEPNV_QUELLENZEILE,
  fahrzeugName,
  formatMeter,
  formatUhr,
  formatUhrzeit,
  mitFahrzeug,
  ortMeta,
  BAND_ERSATZ,
  BAND_FACT_IDS,
  MEASUREMENT_NOTE,
  formatAirKm,
  formatKm,
  formatMeasuredOn,
  formatMinutes,
  getEinsatzgebietPageText,
  getKreisPageText,
  getPlacePageText,
  joinList,
  kontaktText,
  labeled,
  measurementNote,
  sectionText,
  whatsappGreeting,
  type PlacePageText,
} from '../text';

const jobs = getActiveJobs();
const page = (id: string, options = { jobs }) => getPlacePageText(getPlaceById(id)!, options);
const section = (p: PlacePageText, id: string) => p.sections.find((s) => s.id === id);
const text = (p: PlacePageText, id: string) => (section(p, id)?.blocks ?? []).map((b) => b.text).join(' ');
const plain = (value: string) => value.replace(/ /g, ' ');
const allPages = getPublishedPlaces().map((place) => getPlacePageText(place, { jobs }));
/** Alle Haltestellennamen der Fahrplandaten, die längsten zuerst. */
const HALTESTELLEN = [
  ...new Set(
    getPublishedPlaces().flatMap((place) => {
      const o = place.oepnv;
      if (!o) return [];
      const wege = [o.betrieb.spaeteste, o.schule.spaeteste].filter((v) => v !== undefined);
      return [...o.startHaltestellen.map((h) => h.name), ...wege.flatMap((v) => v.teilstrecken.flatMap((t) => [t.ab, t.an]))];
    }),
  ),
].sort((a, b) => b.length - a.length);

describe('Formate (DIN 5008)', () => {
  it('Zahlen, Einheiten und Datum', () => {
    expect(formatKm(8)).toBe('8 km');
    expect(formatAirKm(4)).toBe('4,0 km');
    expect(formatAirKm(14.6)).toBe('14,6 km');
    expect(formatMinutes(1)).toBe('1 Minute');
    expect(formatMinutes(12)).toBe('12 Minuten');
    expect(formatMeasuredOn('2026-10-12')).toBe('12. Oktober 2026');
  });

  it('Listen und Klammern', () => {
    expect(joinList(['A'])).toBe('A');
    expect(joinList(['A', 'B'])).toBe('A und B');
    expect(joinList(['A', 'B', 'C'])).toBe('A, B und C');
    expect(labeled('Lollar', '26 km')).toBe('Lollar (26 km)');
    // Ein Name mit eigener Klammer bekommt den Wert mit „mit“, nicht in seine Klammer (liest sich sonst als Teil des Namens)
    expect(labeled('Waldbrunn (Westerwald)', '27 km')).toBe('Waldbrunn (Westerwald) mit 27 km');
  });
});

describe('Ortsseite: Kopf und Metadaten', () => {
  // Titelstufe „Arbeitsweg“ (Plan §B, M-023): ohne Einsatzdaten nennt keine Ortsseite „SHK-Jobs {Ort}“
  it('Aßlar: Title, h1, Keyword und Etikett in der Titelstufe „Arbeitsweg“', () => {
    const asslar = page('asslar');
    expect(asslar.titelStufe).toBe('arbeitsweg');
    expect(asslar.meta.title).toBe('Arbeitsweg Aßlar – Wetzlar: Auto und Bus');
    expect(asslar.meta.h1).toBe('Von Aßlar zur Arbeit nach Wetzlar');
    expect(asslar.meta.primaryKeyword).toBe('Arbeitsweg Aßlar Wetzlar');
    expect(asslar.etikett).toBe('35614 Aßlar · Lahn-Dill-Kreis');
    expect(asslar.path).toBe('/einsatzgebiet/asslar');
    // Die Bürostelle ist live: flexible Arbeitszeiten und 30 Tage Urlaub sind fürs Büro offen (S5). „Je nach Stelle …“
    // passt nicht mehr in 155 Zeichen, also die Zusage, die für jede Stelle gilt (Prüfung E-029, Runde 2)
    expect(plain(asslar.meta.description)).toBe(
      'Arbeitsweg Aßlar – Wetzlar: 8 km, rund 12 Minuten mit dem Auto, mit Bus und Bahn los um 6:25 Uhr, an 7:16 Uhr. Keine Fernmontage.',
    );
    // Ohne Bürostelle, aber mit dem Schülerpraktikum (Arbeitszeit offen, S4, Runde 3): ebenso nur die Zusage für jede Stelle
    const mitPraktikum = page('asslar', { jobs: jobs.filter((job) => job.category !== 'buero') });
    expect(mitPraktikum.meta.description).toBe(asslar.meta.description);
    expect(mitPraktikum.unterzeile.map(plain)).not.toContain(FACTS.flexibleHours.long);
    // Ohne Stellen der offenen Kategorien (Büro, Praktikum) wie bisher
    const ohneOffene = page('asslar', { jobs: jobs.filter((job) => !['buero', 'praktikum'].includes(job.category)) });
    expect(plain(ohneOffene.meta.description)).toBe(
      'Arbeitsweg Aßlar – Wetzlar: 8 km, rund 12 Minuten mit dem Auto, mit Bus und Bahn los um 6:25 Uhr, an 7:16 Uhr. Flexible Arbeitszeiten, 30 Tage Urlaub.',
    );
    expect(ohneOffene.unterzeile.map(plain)).toEqual(['Rund 12 Minuten Fahrt.', FACTS.flexibleHours.long]);
    for (const p of allPages) {
      expect(p.titelStufe, p.placeId).toBe('arbeitsweg');
      for (const text of [p.meta.title, p.meta.h1, p.meta.primaryKeyword]) expect(text, p.placeId).not.toMatch(/SHK[\s-]Jobs/i);
    }
    expect(asslar.masse.map((m) => m.name)).toEqual(['Strecke', 'Fahrzeit', 'Luftlinie', 'Richtung ab Firmensitz']);
    expect(asslar.unterzeile.map(plain)).toEqual(['Rund 12 Minuten Fahrt.', 'Je nach Stelle flexible Arbeitszeiten.']);
  });

  it('Stadtteile: Titel und h1 zum Firmensitz, Etikett mit Wetzlar', () => {
    const hermannstein = page('hermannstein');
    expect(hermannstein.meta.title).toBe('Arbeitsweg Hermannstein – Wetzlar: Auto und Bus');
    expect(hermannstein.meta.h1).toBe('Von Hermannstein zur Arbeit am Firmensitz');
    expect(plain(hermannstein.meta.description)).toMatch(/^Arbeitsweg Hermannstein – Firmensitz in Wetzlar: 6 km, rund 10 Minuten mit dem Auto/);
    expect(hermannstein.etikett).toBe('35586 Wetzlar-Hermannstein · Stadtteil');
    expect(hermannstein.links.map((l) => l.href)).toContain('/einsatzgebiet/wetzlar');
  });

  it('Wetzlar: Stadtteile und Firmensitz statt Startseiten-Keyword', () => {
    const wetzlar = page('wetzlar');
    expect(wetzlar.meta.title).toBe('Wetzlar und Stadtteile: 2 bis 11 km zum Firmensitz');
    expect(wetzlar.meta.h1).not.toMatch(/SHK/);
    expect(section(wetzlar, 'stadtteile')).toBeDefined();
    expect(text(wetzlar, 'stadtteile')).toContain('8 Stadtteile');
    for (const id of ['steindorf', 'blasbach', 'dutenhofen']) expect(wetzlar.links.map((l) => l.href)).toContain(`/einsatzgebiet/${id}`);
  });
});

describe('Ortsseite: Abschnitte', () => {
  it('feste Reihenfolge, leere Abschnitte fallen weg', () => {
    expect(page('asslar').sections.map((s) => s.id)).toEqual(['lead', 'arbeitsweg', 'oepnv', 'schule', 'stellen', 'nachbarn', 'kreis', 'band', 'kontakt']);
    expect(page('wetzlar').sections.map((s) => s.id)).toEqual([
      'lead',
      'arbeitsweg',
      'oepnv',
      'schule',
      'stellen',
      'nachbarn',
      'stadtteile',
      'kreis',
      'band',
      'kontakt',
    ]);
  });

  it('Arbeitsweg: Messung ehrlich benannt, mit Datum, Werkzeug und Ortsnamen', () => {
    expect(MEASUREMENT_NOTE).toContain('OpenStreetMap');
    expect(MEASUREMENT_NOTE).toContain('ohne Berufsverkehr');
    // Nennt ein Satz davor den Startpunkt, steht der Hinweis ohne Namen; sonst mit dem Ortsnamen in der Mitte.
    for (const place of getPublishedPlaces()) {
      const blocks = section(page(place.id), 'arbeitsweg')!.blocks;
      expect(blocks.at(-1)).toEqual({ kind: 'gemeinsam', text: measurementNote(place, blocks.length > 2) });
      expect(blocks.filter((b) => b.text.includes(place.name)).length, place.id).toBeLessThanOrEqual(2);
    }
    expect(plain(measurementNote({ name: 'Herborn' }))).toBe(
      'Richtwert ohne Berufsverkehr, für Herborn gemessen am 12. Oktober 2026 mit OpenStreetMap (OSRM).',
    );
    expect(measurementNote({ name: 'Nauborn' }, true)).toBe(MEASUREMENT_NOTE);
    expect(section(page('herborn'), 'arbeitsweg')!.blocks.at(-1)!.text).toContain('für Herborn');
    expect(section(page('nauborn'), 'arbeitsweg')!.blocks.at(-1)!.text).toBe(MEASUREMENT_NOTE);
  });

  it('Messpunkt: Verwaltungssitz wird genannt, wo er anders heißt', () => {
    expect(text(page('hohenahr'), 'arbeitsweg')).toContain('Erda');
    expect(text(page('weilrod'), 'arbeitsweg')).toContain('Rod an der Weil');
    expect(text(page('asslar'), 'arbeitsweg')).not.toMatch(/Verwaltungssitz/);
    expect(text(page('nauborn'), 'arbeitsweg')).toContain('Ortsmittelpunkt');
  });

  it('Stellen: kurze Einleitung ohne Beträge und ohne Gehalt (E-030); „Fahrt ab Wohnort“ nur auf den Kreis-Hubs', () => {
    const stellen = section(page('asslar'), 'stellen')!;
    const all = plain(stellen.blocks.map((b) => b.text).join(' '));
    const zahlwort = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'][jobs.length] ?? jobs.length;
    expect(stellen.blocks[0].text).toBe(`Offen sind ${zahlwort} Stellen:`);
    expect(findClaims(all, { premiumPending: true })).toEqual([]);
    expect(all).not.toMatch(/Gehalt|Vergütung|€/);
    expect(text(page('asslar', { jobs: jobs.filter((j) => j.employment.kind !== 'ausbildung').slice(0, 1) }), 'stellen')).toMatch(
      /^Offen ist eine Stelle:/,
    );
    expect(stellen.blocks.every((b) => b.kind === 'gemeinsam')).toBe(true);
    // Auf 54 Ortsseiten wäre der Satz derselbe (Ähnlichkeit der gebauten Seiten); der Kreis-Hub trägt ihn.
    for (const p of allPages) expect(section(p, 'stellen')!.blocks.some((b) => b.factIds?.includes('vehicle')), p.placeId).toBe(false);
    const hubStellen = getKreisPageText(getKreisById('lahn-dill-kreis')!, { jobs }).sections.find((s) => s.id === 'stellen')!;
    const vehicle = hubStellen.blocks.find((b) => b.factIds?.includes('vehicle'))!;
    expect(vehicle.text).toContain('Wohnort');
    expect(FACTS.vehicle.long).toContain(vehicle.text.replace('Im Kundendienst gilt: ', ''));
  });

  it('ohne offene Stellen: ehrlicher Hinweis, keine Gehaltsspanne in der Description', () => {
    const empty = page('asslar', { jobs: [] });
    expect(text(empty, 'stellen')).toContain('keine Stelle ausgeschrieben');
    expect(empty.meta.description).not.toContain('€');
  });

  it('Band: noFarAssembly, vacation30, im Lahn-Dill-Kreis countyPartner, zuletzt flexibleHours (ohne weiteren Satz)', () => {
    expect(BAND_FACT_IDS).toEqual(['noFarAssembly', 'vacation30', 'flexibleHours']);
    // Ohne Stellen der offenen Kategorien (Büro S5, Schülerpraktikum S4) gelten alle drei für jede gezeigte Stelle
    const ohneOffene = { jobs: jobs.filter((job) => !['buero', 'praktikum'].includes(job.category)) };
    expect(page('asslar', ohneOffene).bandFactIds).toEqual(['noFarAssembly', 'vacation30', 'countyPartner', 'flexibleHours']);
    expect(page('giessen', ohneOffene).bandFactIds).toEqual(['noFarAssembly', 'vacation30', 'flexibleHours']);
    // Mit dem Praktikum ist die Arbeitszeit nicht für jede Stelle belegt: dafür noWeekendOnCall
    expect(page('giessen', { jobs: jobs.filter((job) => job.category !== 'buero') }).bandFactIds).toEqual([
      'noFarAssembly',
      'vacation30',
      'noWeekendOnCall',
    ]);
    expect(section(page('asslar'), 'band')!.blocks.map((b) => b.text)).toContain(FACTS.countyPartner.short);
  });

  it('„Was überall gilt“ mit der Bürostelle: nur Fakten, die für jede gezeigte Stelle gelten, dafür noWeekendOnCall (Runde 2)', () => {
    expect(jobs.some((job) => job.category === 'buero')).toBe(true);
    expect(BAND_ERSATZ).toBe('noWeekendOnCall');
    expect(page('asslar').bandFactIds).toEqual(['noFarAssembly', 'countyPartner', 'noWeekendOnCall']);
    expect(page('giessen').bandFactIds).toEqual(['noFarAssembly', 'noWeekendOnCall']);
    for (const p of allPages) {
      for (const id of p.bandFactIds) expect(offenBei(id, jobs), `${p.placeId}: ${id}`).toEqual([]);
      const band = section(p, 'band')!.blocks.map((b) => b.text);
      expect(band, p.placeId).not.toContain(FACTS.vacation30.short);
      expect(band, p.placeId).not.toContain(FACTS.flexibleHours.short);
    }
  });

  it('Sammelfläche: Urlaub und Arbeitszeit nur mit „Je nach Stelle“, solange die Bürostelle live ist (Runde 2)', () => {
    const seiten = [
      ...allPages.map((p) => ({ id: p.placeId, meta: p.meta, unterzeile: p.unterzeile })),
      ...getHubKreise().map((k) => ({ id: k.id, meta: getKreisPageText(k, { jobs }).meta, unterzeile: [] as readonly string[] })),
      { id: 'einsatzgebiet', meta: getEinsatzgebietPageText({ jobs }).meta, unterzeile: [] as readonly string[] },
    ];
    for (const s of seiten) {
      const text = plain(s.meta.description);
      // Jeder Satz mit Urlaub oder Arbeitszeit beginnt mit „Je nach Stelle“
      for (const satz of text.split(/(?<=\.) /)) {
        if ([FACTS.flexibleHours.short, FACTS.vacation30.short].some((kurz) => satz.toLowerCase().includes(kurz.toLowerCase()))) {
          expect(satz, `${s.id}: ${text}`).toMatch(/^Je nach Stelle /);
        }
      }
      expect(text.length, s.id).toBeGreaterThanOrEqual(110);
      for (const zeile of s.unterzeile) expect(plain(zeile), s.id).not.toBe(FACTS.flexibleHours.long);
    }
    // Ohne Stellen der offenen Kategorien (Büro S5, Schülerpraktikum S4) steht die Zusage ohne Zusatz, mit dem Praktikum nicht
    const ohneOffene = jobs.filter((job) => !['buero', 'praktikum'].includes(job.category));
    expect(plain(getKreisPageText(getHubKreise()[0], { jobs: ohneOffene }).meta.description)).toMatch(/\. Flexible Arbeitszeiten, 30 Tage Urlaub\.$/);
    const mitPraktikum = jobs.filter((job) => job.category !== 'buero');
    expect(plain(getKreisPageText(getHubKreise()[0], { jobs: mitPraktikum }).meta.description)).toMatch(/\. Je nach Stelle flexible Arbeitszeiten, 30 Tage Urlaub\.$/);
  });

  it('Kontakt: WhatsApp-Gruß mit Ort, im Wortlaut der Standardnachricht', () => {
    expect(whatsappGreeting({ name: 'Aßlar' })).toBe(
      'Guten Tag Herr Demir, ich komme aus Aßlar und interessiere mich für eine Stelle bei Bad und Energie.',
    );
    expect(DEFAULT_WHATSAPP_MESSAGE.startsWith('Guten Tag Herr Demir, ')).toBe(true);
    expect(DEFAULT_WHATSAPP_MESSAGE.endsWith('interessiere mich für eine Stelle bei Bad und Energie.')).toBe(true);
    expect(page('lich').whatsappGreeting).toContain('ich komme aus Lich');
    // Der sichtbare Text zitiert genau das Stück der Nachricht, das den Ort nennt; den Namen trägt der Kontaktblock.
    expect(text(page('lich'), 'kontakt')).toBe(kontaktText({ name: 'Lich' }));
    for (const place of getPublishedPlaces()) {
      const quoted = /„(.+)“/.exec(kontaktText(place))![1];
      expect(whatsappGreeting(place)).toContain(quoted);
    }
  });

  it('Kurzbeschreibungen nur, wo freigegeben; zurückgehaltene erscheinen nirgends', () => {
    expect(text(page('garbenheim'), 'kreis')).toContain('Garbenheim in Stichworten: Lahnauen und ruhige Wohnsiedlungen.');
    // Kein Verweis auf die Startseite, kein Ersatztext für zurückgehaltene Beschreibungen
    for (const p of allPages) expect(sectionText(p.sections)).not.toContain('Startseite');
    const withheld = regionalLocations.filter((l) => ['loc-nauborn', 'loc-braunfels', 'loc-giessen'].includes(l.id));
    for (const p of allPages) for (const location of withheld) expect(sectionText(p.sections)).not.toContain(location.character);
  });
});

describe('Ortsseite: Satzbau folgt den Daten', () => {
  it('Seitenkopf nach Art, Band, Kreis und Rand', () => {
    expect(text(page('asslar'), 'lead')).toMatch(/^Aus Aßlar ist der Weg kurz/);
    expect(text(page('giessen'), 'lead')).toMatch(/^Gießen liegt östlich von Wetzlar/);
    expect(text(page('hermannstein'), 'lead')).toMatch(/gehört mit der Postleitzahl 35586 zur Stadt Wetzlar/);
    // Kritik 2, P1-3: keine Grenze des Betriebs („die Grenze sind 35 km Straße“), nur die Auswahl dieser Seiten
    expect(text(page('bad-endbach'), 'lead')).toContain('zu den entferntesten Orten auf diesen Seiten: Eine eigene Seite bekommt jeder Ort bis 35\u00A0km Straße');
    for (const p of allPages) expect(sectionText(p.sections)).not.toMatch(/Grenze (sind|von) 35/);
    expect(text(page('herborn'), 'lead')).toMatch(/^Wie der Firmensitz gehört Herborn zum Lahn-Dill-Kreis/);
    expect(text(page('weilburg'), 'lead')).toContain('gehört schon zum Landkreis Limburg-Weilburg');
  });

  it('Kreis: kleiner Kreis vergleicht mit dem anderen Ort', () => {
    expect(plain(text(page('lohra'), 'kreis'))).toContain('Lohra liegt 5 km näher am Firmensitz als Bad Endbach, laut Routenplaner dauert die Fahrt von hier aber 2 Minuten länger.');
    expect(text(page('lohra'), 'kreis')).not.toContain('Median');
  });

  it('Nachbarn: Kreisgrenze und Kette in der eigenen Richtung', () => {
    expect(text(page('dutenhofen'), 'nachbarn')).toContain('Über die Kreisgrenze');
    expect(text(page('lohra'), 'nachbarn')).toContain('Staufenberg');
    expect(page('lohra').links.map((l) => l.href)).toEqual(
      expect.arrayContaining(['/einsatzgebiet/staufenberg', '/einsatzgebiet/bad-endbach', '/einsatzgebiet#landkreis-marburg-biedenkopf']),
    );
  });

  it('keine Lücken, keine falschen Einzahlen, jeder Satz endet mit einem Satzzeichen', () => {
    for (const p of allPages) {
      for (const s of p.sections) {
        for (const block of s.blocks) {
          expect(block.text, p.placeId).not.toMatch(/undefined|NaN|null|\s{2,}|\s[,.;:]/);
          expect(plain(block.text), p.placeId).not.toMatch(/\b1 (?:Minuten|Orte|Stellen)\b/);
          if (block.kind === 'ort') expect(block.text, p.placeId).toMatch(/[.!?]$/);
        }
      }
    }
  });
});

describe('Kreis-Hubs und Gebietsseite', () => {
  it('Kreis-Hub: Zahl der Orte, nächster und weitester Ort, Median, alle Orte', () => {
    const ldk = getKreisPageText(getKreisById('lahn-dill-kreis')!, { jobs });
    expect(ldk.meta.title).toBe('SHK-Jobs Lahn-Dill-Kreis: 26 Orte bis 35 km');
    expect(ldk.meta.h1).toBe('SHK-Jobs im Lahn-Dill-Kreis');
    const all = plain(sectionText(ldk.sections));
    expect(all).toContain('Am nächsten ist Steindorf mit 2 km, am weitesten Breitscheid mit 34 km');
    expect(all).toContain('Median');
    expect(all).toContain('Der Firmensitz in der Siegmund-Hiepe-Straße liegt selbst im Lahn-Dill-Kreis.');
    expect(ldk.bandFactIds).toContain('countyPartner');
    expect(ldk.links.filter((l) => l.href !== '/einsatzgebiet')).toHaveLength(26);
  });

  it('Kreis-Hub mit Gleichstand nennt beide Orte', () => {
    const lm = getKreisPageText(getKreisById('landkreis-limburg-weilburg')!, { jobs });
    expect(plain(sectionText(lm.sections))).toContain('Am nächsten sind Löhnberg und Weilmünster mit 20 km');
  });

  it('Gebietsseite: alle Kreise, alle Orte, Ringe und Abschnitte für Kreise ohne Hub', () => {
    const hub = getEinsatzgebietPageText({ jobs });
    const all = plain(sectionText(hub.sections));
    expect(all).toContain('54 Orte in 6 Kreisen');
    expect(all).toContain('Bis 15 km Strecke: 17 Orte, 16 bis 25 km: 14, 26 bis 35 km: 23.');
    expect(all).toContain('Die drei Ringe im Plan messen die Luftlinie um den Firmensitz; am weitesten liegt Beselich mit 27,0 km.');
    expect(all).toContain('Je nur zwei Orte im Gebiet, deshalb ohne eigene Kreisseite: Landkreis Marburg-Biedenkopf und Hochtaunuskreis.');
    for (const kreis of getKreise()) expect(all).toContain(kreis.name);
    expect(hub.kleineKreise.map((s) => s.id)).toEqual(['landkreis-marburg-biedenkopf', 'hochtaunuskreis']);
    expect(plain(sectionText(hub.kleineKreise))).toContain('Grävenwiesbach (27 km, 26 Minuten) und Weilrod (33 km, 35 Minuten)');
    expect(hub.links).toHaveLength(getHubKreise().length + 54);
  });
});

describe('Review Phase 2: ein Maß je Wort, keine Füllsätze', () => {
  const kreisPages = getHubKreise().map((kreis) => getKreisPageText(kreis, { jobs }));
  const hub = getEinsatzgebietPageText({ jobs });

  it('„Ring“ steht nur für die Kreise der Pläne (Luftlinie), nie für die Straßenstrecke', () => {
    // Haltestellen heißen, wie der Verkehrsverbund sie nennt („Wetzlar Neustadt (Ring)“): Eigennamen, keine Strecke
    const ohneHaltestellen = (text: string) => HALTESTELLEN.reduce((rest, name) => rest.split(name).join(''), text);
    for (const p of allPages) {
      expect(ohneHaltestellen(sectionText(p.sections)), p.placeId).not.toMatch(/\bRing/);
      expect(p.masse.map((m) => m.name)).not.toContain('Ring');
    }
    for (const p of kreisPages) expect(sectionText(p.sections), p.kreisId).not.toMatch(/\bRing/);
    for (const s of plain(sectionText(hub.sections)).split(/(?<=\.)\s+/).filter((x) => /\bRing/.test(x))) {
      expect(s).toMatch(/Luftlinie|Rings bei/);
    }
    const herborn = plain(text(page('herborn'), 'lead'));
    expect(herborn).toContain('27 km Straße');
    const wetterau = plain(sectionText(getKreisPageText(getKreisById('wetteraukreis')!, { jobs }).sections));
    expect(wetterau).toContain('Alle 3 Orte liegen 26 bis 35 km Strecke vom Firmensitz entfernt.');
    expect(wetterau).toMatch(/In Luftlinie, wie im Plan, sind es \d+,\d bis \d+,\d km\./);
  });

  it('kein Tempo (km/h), „fast ohne Umweg“ nur bis Faktor 1,15', () => {
    for (const p of allPages) expect(sectionText(p.sections), p.placeId).not.toMatch(/km\/h|Routenplaner rechnet im Schnitt/);
    expect(text(page('weilburg'), 'arbeitsweg')).not.toContain('fast ohne Umweg');
    expect(text(page('braunfels'), 'arbeitsweg')).toContain('fast ohne Umweg');
  });

  it('Nachbarn: der erste Abstand nennt, wovon er zählt; Klammern nie doppelt', () => {
    expect(plain(text(page('lahnau'), 'nachbarn'))).toContain('Garbenheim (2,8 km von Lahnau)');
    expect(plain(text(page('waldbrunn-westerwald'), 'nachbarn'))).toContain('(5,4 km von Waldbrunn)');
    for (const p of allPages) expect(sectionText(p.sections), p.placeId).not.toMatch(/\([^()]*\([^()]*\)[^()]*\)/);
  });

  it('Fahrzeit gegen den Median, Kreisgrenze und Messpunkt in klarem Deutsch', () => {
    expect(plain(text(page('lahnau'), 'kreis'))).toContain(
      'Mit 11 Minuten liegt Lahnau 2 Minuten unter der mittleren Fahrzeit im Lahn-Dill-Kreis (13 Minuten).',
    );
    expect(plain(text(page('butzbach'), 'nachbarn'))).toContain('Langgöns gehört schon zum Landkreis Gießen.');
    expect(plain(text(page('lahnau'), 'arbeitsweg'))).toContain('Startpunkt ist Dorlar (Hauptort laut OpenStreetMap).');
    for (const p of allPages) expect(sectionText(p.sections), p.placeId).not.toMatch(/Verwaltungssitz|Nebenan beginn/);
  });
});

describe('Bus und Bahn und Berufsschule (Plan §B): Antworten aus den Daten', () => {
  const oepnv = (id: string) => section(page(id), 'oepnv')!;
  const schule = (id: string) => section(page(id), 'schule')!;

  it('Formate: Uhrzeit ohne führende Null, geschützte Leerzeichen vor Uhr, m und in „Bus 12“', () => {
    expect(formatUhrzeit('06:25')).toBe('6:25');
    expect(formatUhr('07:30')).toBe('7:30\u00A0Uhr');
    expect(formatMeter(1230)).toBe('1.230\u00A0m');
    expect(fahrzeugName({ linie: '12', verkehrsmittel: 'bus' })).toBe('Bus\u00A012');
    expect(mitFahrzeug({ linie: 'RE99', verkehrsmittel: 'bahn' })).toBe('mit dem Zug\u00A0RE99');
    expect(mitFahrzeug({ linie: '1', verkehrsmittel: 'tram' })).toBe('mit der Straßenbahn\u00A01');
  });

  it('Aßlar: späteste Verbindung mit Haltestelle, erstem Fahrzeug, Umstiegen, Ankunft und Tür zu Tür', () => {
    const bus = oepnv('asslar');
    expect(bus.heading).toBe('Mit Bus und Bahn aus Aßlar');
    expect(bus.blocks.map((b) => b.frage)).toEqual(['Wann musst du in Aßlar los?', 'Was kommt zwischen 6 und 8\u00A0Uhr an?', 'Wo ist die nächste Haltestelle?']);
    expect(plain(bus.blocks[0].text)).toBe(
      'Um 6:25 Uhr, für die Ankunft bis 7:30 Uhr: 13 Minuten zu Fuß zur Haltestelle Aßlar Gesamtschule, um 6:38 Uhr mit dem Bus 12 bis Wetzlar Carolinenhütte, dann mit dem Bus 185; am Firmensitz um 7:16 Uhr, 51 Minuten Tür zu Tür, mit dem Auto 12 Minuten.',
    );
    expect(plain(bus.blocks[1].text)).toBe('Abfahrt 5:58 Uhr (an 6:31), 6:18 Uhr (an 7:04), 6:38 Uhr (an 7:16) und 7:15 Uhr (an 7:50), jede mit einem Umstieg.');
    expect(plain(bus.blocks[2].text)).toBe('An der Ortsmitte: Aßlar Grundschule (150 m zu Fuß), Aßlar Mittelstraße (320 m) und Aßlar Bachstraße (500 m).');
    for (const block of bus.blocks) expect(block).toMatchObject({ kind: 'ort', daten: 'oepnv' });
  });

  it('ohne Verbindung bis 7:30 Uhr ist genau das die Auskunft, mit der frühesten Ankunft, dem Auto und dem Nachbarort mit Verbindung', () => {
    const greifenstein = oepnv('greifenstein');
    expect(greifenstein.blocks[0].frage).toBe('Kommst du aus Greifenstein bis 7:30\u00A0Uhr mit Bus und Bahn hin?');
    expect(plain(greifenstein.blocks[0].text)).toBe('Nein, die früheste Verbindung fährt um 6:24 Uhr und ist um 7:50 Uhr da, mit zwei Umstiegen; mit dem Auto 27 Minuten.');
    expect(plain(greifenstein.blocks[1].text)).toBe('Aus Sinn (4,4 km): Abfahrt 6:13 Uhr ab Sinn Firma Haas + Sohn mit dem Bus 530, Ankunft 7:04 Uhr.');
    const weilrod = oepnv('weilrod');
    // Kein Bus im Zählfenster: die früheste Ankunft aus dem Grund der Datei („die früheste kommt um 08:16 an“)
    expect(plain(weilrod.blocks[0].text)).toBe('Nein, zwischen 6 und 8 Uhr kommt keine Verbindung an, die früheste ist erst um 8:16 Uhr da; mit dem Auto 35 Minuten.');
    expect(plain(schule('weilrod').blocks[1].text)).toContain('die früheste ist erst um 8:20 Uhr da. Aus Grävenwiesbach (7,6 km): Abfahrt 5:18 Uhr ab Grävenwiesbach Bahnhof mit dem Bus X89');
    // Ohne Verbindung keine Liste der Verbindungen am Morgen
    for (const id of ['greifenstein', 'weilrod']) expect(oepnv(id).blocks.map((b) => b.frage)).not.toContain('Was kommt zwischen 6 und 8\u00A0Uhr an?');
  });

  it('nahe Orte nennen den Fußweg, ohne Umstieg steht „ohne Umstieg“', () => {
    expect(plain(oepnv('nauborn').blocks[0].text)).toContain('mit dem Auto 9 Minuten, zu Fuß 47 Minuten.');
    expect(plain(oepnv('braunfels').blocks[0].text)).toContain('mit dem Bus 185 bis Wetzlar Braunfelser Straße ohne Umstieg; am Firmensitz um');
    expect(plain(oepnv('steindorf').blocks[1].text)).toMatch(/, alle ohne Umstieg\.$/);
  });

  it('Berufsschule: zuständig laut Verordnung (gemeinsam, mit Wohnort), Schulweg mit Vergleich zum Firmensitz, der Fakt Fahrtkosten', () => {
    const azubi = schule('asslar');
    expect(azubi.heading).toBe('Zur Berufsschule aus Aßlar');
    expect(azubi.blocks[0]).toMatchObject({ kind: 'gemeinsam', frage: 'Welche Berufsschule ist zuständig?' });
    expect(plain(azubi.blocks[0].text)).toBe(
      'Laut Fachklassenverordnung die Werner-von-Siemens-Schule Wetzlar, Dammstraße 62, für Grund- und Fachstufe: Es zählt der Ausbildungsort, nicht Aßlar als Wohnort. Bestätigt hat der Betrieb das noch nicht.',
    );
    expect(plain(schule('nauborn').blocks[0].text)).toContain('nicht der Stadtteil, in dem du wohnst');
    expect(azubi.blocks[1]).toMatchObject({ kind: 'ort', daten: 'berufsschule', frage: 'Wann musst du in Aßlar zur Schule los?' });
    expect(plain(azubi.blocks[1].text)).toBe(
      'Um 6:49 Uhr, für die Ankunft bis 7:45 Uhr: 10 Minuten zu Fuß zur Haltestelle Aßlar Bahnhof, um 6:59 Uhr mit dem Zug RB40 bis Wetzlar Bahnhof, dann mit dem Bus 24; an der Schule um 7:26 Uhr, 37 Minuten Tür zu Tür, 14 Minuten weniger als zum Firmensitz.',
    );
    expect(plain(schule('wetzlar').blocks[1].text)).toContain('so lange wie zum Firmensitz');
    expect(azubi.blocks.at(-1)).toEqual({ kind: 'gemeinsam', text: FACTS.travelAllowance.long, factIds: ['travelAllowance'] });
  });

  it('Quellenzeilen: Namensnennung und Bearbeitung wörtlich aus oepnv.json, Fundstellen der Zuständigkeit, nichts im Ortstext', () => {
    expect(OEPNV_QUELLENZEILE).toContain(OEPNV_QUELLE.namensnennung);
    // Fußwege aus OpenStreetMap: eigene Nennung mit ODbL, Wortlaut aus oepnv.json, Links in der Reihenfolge des Texts
    expect(OSM_NAMENSNENNUNG.replace(/\u00A0/g, ' ')).toBe(OEPNV_DATEI.fusswege.daten);
    expect(OSM_NAMENSNENNUNG.startsWith('©\u00A0')).toBe(true);
    expect(OEPNV_QUELLENZEILE.endsWith(`Fußwege: ${OSM_NAMENSNENNUNG}.`)).toBe(true);
    expect(OEPNV_QUELLENLINKS).toEqual([{ label: OEPNV_QUELLE.lizenz, href: OEPNV_QUELLE.lizenzUrl }, OSM_LINK]);
    expect(OSM_LINK.href).toBe('https://www.openstreetmap.org/copyright');
    expect(OSM_QUELLENZEILE).toContain(OSM_NAMENSNENNUNG);
    expect(OEPNV_QUELLENZEILE).toContain(OEPNV_QUELLE.lizenz);
    expect(OEPNV_QUELLENZEILE).toContain('Auf das Gebiet um Wetzlar und einen Werktag gefiltert und mit eigenem Routing ausgewertet.');
    expect(OEPNV_QUELLENZEILE).not.toContain('scripts/');
    expect(plain(OEPNV_QUELLENZEILE)).toContain('Dienstag, 27. Oktober 2026, Datenstand 10. Oktober 2026');
    expect(plain(BERUFSSCHULE_QUELLENZEILE)).toBe(
      'Zuständigkeit: Fachklassenverordnung (GVBl. Hessen 2026 Nr. 21) und Schulbezirkssatzung des Lahn-Dill-Kreises. Der Unterrichtsbeginn ist nicht belegt. Fahrplan wie oben.',
    );
    for (const p of allPages) expect(sectionText(p.sections), p.placeId).not.toContain('gtfs.de');
  });

  it('jede Ortsseite: zwei Datenklassen, jeder Datenblock ein Ortsblock, keine leeren Fragen, keine FAQPage-Wörter', () => {
    for (const p of allPages) {
      expect(p.datenKlassen, p.placeId).toEqual(['oepnv', 'berufsschule']);
      const bloecke = [...section(p, 'oepnv')!.blocks, ...section(p, 'schule')!.blocks];
      for (const block of bloecke) {
        if (block.daten) expect(block.kind, p.placeId).toBe('ort');
        if (block.frage !== undefined) expect(block.frage, p.placeId).toMatch(/\?$/);
      }
      expect(bloecke.filter((b) => b.daten === 'oepnv').length, p.placeId).toBeGreaterThanOrEqual(2);
      expect(bloecke.filter((b) => b.daten === 'berufsschule').length, p.placeId).toBeGreaterThanOrEqual(1);
    }
  });

  it('Titelstufe „SHK-Jobs“ ist vorbereitet und greift erst mit Einsatzdaten (M-023)', () => {
    const asslar = getPlaceById('asslar')!;
    expect(ortMeta(asslar, 'arbeitsweg').title).toBe('Arbeitsweg Aßlar – Wetzlar: Auto und Bus');
    const shk = ortMeta(asslar, 'shk-jobs');
    expect(shk.title).toBe('SHK-Jobs Aßlar: 8 km bis Wetzlar');
    expect(shk.h1).toBe('SHK-Jobs für Aßlar');
    expect(shk.primaryKeyword).toBe('SHK Jobs Aßlar');
    expect(ortMeta(getPlaceById('hermannstein')!, 'shk-jobs').title).toBe('SHK-Jobs Hermannstein: 6 km zum Firmensitz');
  });

  it('Kreis-Hubs: Zusammenfassung ihrer Orte für Bus und Bahn und den Schulweg', () => {
    const ldk = getKreisPageText(getKreisById('lahn-dill-kreis')!, { jobs });
    const bus = ldk.sections.find((s) => s.id === 'oepnv')!;
    expect(ldk.sections.map((s) => s.id)).toEqual(['lead', 'zahlen', 'oepnv', 'orte', 'stellen', 'band', 'kontakt']);
    expect(bus.blocks.map((b) => plain(b.text))).toEqual([
      'Aus 25 der 26 Orte des Lahn-Dill-Kreises kommst du an einem Werktag mit Bus und Bahn bis 7:30 Uhr zum Firmensitz, nicht aus Greifenstein.',
      'Am kürzesten ist der Weg Tür zu Tür aus Steindorf mit 16 Minuten, am längsten aus Bischoffen mit 92 Minuten.',
      'Aus allen 26 Orten des Lahn-Dill-Kreises erreichst du die Werner-von-Siemens-Schule Wetzlar bis 7:45 Uhr, am schnellsten aus Naunheim mit 12 Minuten Tür zu Tür.',
    ]);
    expect(bus.blocks.map((b) => b.daten)).toEqual(['oepnv', 'oepnv', 'berufsschule']);
    const giessen = getKreisPageText(getKreisById('landkreis-giessen')!, { jobs }).sections.find((s) => s.id === 'oepnv')!;
    expect(plain(giessen.blocks[0].text)).toBe('Aus allen 12 Orten des Landkreises Gießen kommst du an einem Werktag mit Bus und Bahn bis 7:30 Uhr zum Firmensitz.');
  });
});
