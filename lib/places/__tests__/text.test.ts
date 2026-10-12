import { describe, expect, it } from 'vitest';
import { regionalLocations } from '@/lib/data/locations';
import { FACTS } from '@/lib/content/facts';
import { formatSalaryAmount } from '@/lib/jobs/format';
import { getActiveJobs } from '@/lib/jobs/registry';
import { DEFAULT_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp-utils';
import { getHubKreise, getKreisById, getKreise, getPlaceById, getPublishedPlaces } from '../registry';
import {
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
  labeled,
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
    expect(labeled('Allendorf (Lumda)', '14 km')).toBe('Allendorf (Lumda, 14 km)');
  });
});

describe('Ortsseite: Kopf und Metadaten', () => {
  it('Aßlar: Title, h1, Keyword und Etikett', () => {
    const asslar = page('asslar');
    expect(asslar.meta.title).toBe('SHK-Jobs Aßlar: 8 km bis Wetzlar');
    expect(asslar.meta.h1).toBe('SHK-Jobs für Aßlar');
    expect(asslar.meta.primaryKeyword).toBe('SHK Jobs Aßlar');
    expect(asslar.etikett).toBe('35614 Aßlar · Lahn-Dill-Kreis');
    expect(asslar.path).toBe('/einsatzgebiet/asslar');
    expect(plain(asslar.meta.description)).toContain('8 km und rund 12 Minuten');
    expect(asslar.masse.map((m) => m.name)).toEqual(['Strecke', 'Fahrzeit', 'Luftlinie', 'Richtung ab Firmensitz', 'Ring']);
  });

  it('Stadtteile: Titel zum Firmensitz, Etikett mit Wetzlar', () => {
    const hermannstein = page('hermannstein');
    expect(hermannstein.meta.title).toBe('SHK-Jobs Hermannstein: 6 km zum Firmensitz');
    expect(hermannstein.etikett).toBe('35586 Wetzlar-Hermannstein · Stadtteil');
    expect(hermannstein.links.map((l) => l.href)).toContain('/einsatzgebiet/wetzlar');
  });

  it('Wetzlar: Stadtteile und Werkstatt statt Startseiten-Keyword', () => {
    const wetzlar = page('wetzlar');
    expect(wetzlar.meta.title).toBe('Wetzlar und Stadtteile: 2 bis 11 km zur Werkstatt');
    expect(wetzlar.meta.h1).not.toMatch(/SHK/);
    expect(section(wetzlar, 'stadtteile')).toBeDefined();
    expect(text(wetzlar, 'stadtteile')).toContain('8 Stadtteile');
    for (const id of ['steindorf', 'blasbach', 'dutenhofen']) expect(wetzlar.links.map((l) => l.href)).toContain(`/einsatzgebiet/${id}`);
  });
});

describe('Ortsseite: Abschnitte', () => {
  it('feste Reihenfolge, leere Abschnitte fallen weg', () => {
    expect(page('asslar').sections.map((s) => s.id)).toEqual(['lead', 'arbeitsweg', 'stellen', 'nachbarn', 'kreis', 'band', 'kontakt']);
    expect(page('wetzlar').sections.map((s) => s.id)).toEqual([
      'lead',
      'arbeitsweg',
      'stellen',
      'nachbarn',
      'stadtteile',
      'kreis',
      'band',
      'kontakt',
    ]);
  });

  it('Arbeitsweg: Messung ehrlich benannt, auf jeder Seite gleich', () => {
    expect(MEASUREMENT_NOTE).toContain('OpenStreetMap');
    expect(MEASUREMENT_NOTE).toContain('ohne Berufsverkehr');
    for (const p of allPages) {
      const blocks = section(p, 'arbeitsweg')!.blocks;
      expect(blocks.at(-1)).toEqual({ kind: 'gemeinsam', text: MEASUREMENT_NOTE });
    }
  });

  it('Messpunkt: Verwaltungssitz wird genannt, wo er anders heißt', () => {
    expect(text(page('hohenahr'), 'arbeitsweg')).toContain('Erda');
    expect(text(page('weilrod'), 'arbeitsweg')).toContain('Rod an der Weil');
    expect(text(page('asslar'), 'arbeitsweg')).not.toMatch(/Verwaltungssitz/);
    expect(text(page('nauborn'), 'arbeitsweg')).toContain('Ortsmittelpunkt');
  });

  it('Stellen: alle mit Gehalt, Kundendienst mit „Fahrt ab Wohnort“ aus dem Fakt vehicle', () => {
    const stellen = section(page('asslar'), 'stellen')!;
    const all = plain(stellen.blocks.map((b) => b.text).join(' '));
    for (const job of jobs) {
      expect(all).toContain(job.shortTitle);
      expect(all).toContain(plain(formatSalaryAmount(job)!));
    }
    const vehicle = stellen.blocks.find((b) => b.factIds?.includes('vehicle'))!;
    expect(vehicle.text).toContain('Wohnort');
    expect(FACTS.vehicle.long).toContain(vehicle.text.replace('Im Kundendienst gilt: ', ''));
    expect(stellen.blocks.every((b) => b.kind === 'gemeinsam')).toBe(true);
  });

  it('ohne offene Stellen: ehrlicher Hinweis, keine Gehaltsspanne in der Description', () => {
    const empty = page('asslar', { jobs: [] });
    expect(text(empty, 'stellen')).toContain('keine Stelle ausgeschrieben');
    expect(empty.meta.description).not.toContain('€');
  });

  it('Band: radius35, flexibleHours, vacation30, im Lahn-Dill-Kreis dazu countyPartner', () => {
    expect(BAND_FACT_IDS).toEqual(['radius35', 'flexibleHours', 'vacation30']);
    expect(page('asslar').bandFactIds).toEqual(['radius35', 'flexibleHours', 'vacation30', 'countyPartner']);
    expect(page('giessen').bandFactIds).toEqual(['radius35', 'flexibleHours', 'vacation30']);
    expect(section(page('asslar'), 'band')!.blocks.map((b) => b.text)).toContain(FACTS.countyPartner.short);
  });

  it('Kontakt: WhatsApp-Gruß mit Ort, im Wortlaut der Standardnachricht', () => {
    expect(whatsappGreeting({ name: 'Aßlar' })).toBe(
      'Guten Tag Herr Demir, ich komme aus Aßlar und interessiere mich für eine Stelle bei Bad und Energie.',
    );
    expect(DEFAULT_WHATSAPP_MESSAGE.startsWith('Guten Tag Herr Demir, ')).toBe(true);
    expect(DEFAULT_WHATSAPP_MESSAGE.endsWith('interessiere mich für eine Stelle bei Bad und Energie.')).toBe(true);
    expect(page('lich').whatsappGreeting).toContain('ich komme aus Lich');
    expect(text(page('lich'), 'kontakt')).toContain('Sabri Demir');
  });

  it('Kurzbeschreibungen nur, wo freigegeben; zurückgehaltene erscheinen nirgends', () => {
    expect(text(page('garbenheim'), 'kreis')).toContain('„Lahnauen und ruhige Wohnsiedlungen“');
    expect(text(page('nauborn'), 'kreis')).toContain('Karte der Startseite');
    const withheld = regionalLocations.filter((l) => ['loc-nauborn', 'loc-braunfels', 'loc-giessen'].includes(l.id));
    for (const p of allPages) for (const location of withheld) expect(sectionText(p.sections)).not.toContain(location.character);
  });
});

describe('Ortsseite: Satzbau folgt den Daten', () => {
  it('Seitenkopf nach Art, Band, Kreis und Rand', () => {
    expect(text(page('asslar'), 'lead')).toMatch(/^Aus Aßlar ist der Weg kurz/);
    expect(text(page('giessen'), 'lead')).toMatch(/^Gießen liegt östlich von Wetzlar/);
    expect(text(page('hermannstein'), 'lead')).toMatch(/gehört mit der Postleitzahl 35586 zur Stadt Wetzlar/);
    expect(text(page('bad-endbach'), 'lead')).toContain('am Nordrand des Einsatzgebiets');
    expect(text(page('herborn'), 'lead')).toMatch(/^Wie der Firmensitz gehört Herborn zum Lahn-Dill-Kreis/);
    expect(text(page('weilburg'), 'lead')).toContain('gehört schon zum Landkreis Limburg-Weilburg');
  });

  it('Kreis: kleiner Kreis vergleicht mit dem anderen Ort', () => {
    expect(plain(text(page('lohra'), 'kreis'))).toContain('Lohra ist 5 km näher am Firmensitz, braucht laut Routenplaner aber 2 Minuten länger als Bad Endbach.');
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
    expect(all).toContain('55 Orte in 6 Kreisen');
    expect(all).toContain('Bis 15 km: 18 Orte, bis 25 km: 14 Orte, bis 35 km: 23 Orte.');
    for (const kreis of getKreise()) expect(all).toContain(kreis.name);
    expect(hub.kleineKreise.map((s) => s.id)).toEqual(['landkreis-marburg-biedenkopf', 'hochtaunuskreis']);
    expect(plain(sectionText(hub.kleineKreise))).toContain('Grävenwiesbach (27 km, 26 Minuten) und Weilrod (33 km, 35 Minuten)');
    expect(hub.links).toHaveLength(getHubKreise().length + 55);
  });
});
