import { describe, expect, it } from 'vitest';
import { getActiveJobs } from '@/lib/jobs/registry';
import indexierungJson from '../data/indexierung.json';
import { EINSAETZE_GUELTIG_MONATE, FAHRPLAN_STAND, datenBelege, fahrplanjahrEnde, fahrplanwechsel, monateSpaeter, titelStufe } from '../datenklassen';
import { heuteInWetzlar, indexierungEintrag, indexierungsGruende, istOrtIndexierbar } from '../indexierung';
import {
  GATE,
  INDEXIERUNG_KOMMENTAR,
  aehnlichkeitUnterIndexierbaren,
  indexierungDatei,
  pruefeDaten,
  pruefeEinzigartigkeit,
  pruefeOrte,
  seiteVon,
  type IndexierungDatei,
} from '../qualitaet';
import { getPlaceById, getPublishedPlaces } from '../registry';
import type { Place } from '../schema';
import { getPlacePageText, type PlacePageText, type TextBlock } from '../text';

/**
 * Indexierungs-Gate (E-029, Plan §B): Schwellen wie im Plan, Lock-Datei gleich der Rechnung, jede Regel greift, I5 über
 * das Datum. Die Lock-Datei ist wie slugs.lock.json: Jede Änderung am Ergebnis steht als Diff im PR.
 */

const LOCK = indexierungJson as unknown as IndexierungDatei;
const jobs = getActiveJobs();
const places = getPublishedPlaces();
const ergebnisse = pruefeOrte({ jobs, zurueckgenommen: LOCK.zurueckgenommen });
const ort = (id: string) => getPlaceById(id)!;
const seite = (place: Place, page: PlacePageText = getPlacePageText(place, { jobs })) => seiteVon(place, page);

/** Seite mit einem zusätzlichen Block im Abschnitt `abschnitt`. */
function mitBlock(page: PlacePageText, abschnitt: string, block: TextBlock): PlacePageText {
  return { ...page, sections: page.sections.map((s) => (s.id === abschnitt ? { ...s, blocks: [...s.blocks, block] } : s)) };
}

describe('Gate: Schwellen wie im Plan (I1 = U1–U8, I2–I4), nie gelockert (G7)', () => {
  it('hält jede Schwelle fest', () => {
    expect(GATE).toEqual({
      minValues: 8,
      minOrtWords: 90,
      minOrtShare: 0.35,
      maxJaccardWhole: 0.45,
      maxJaccardOrt: 0.3,
      maxSkeletonShare: 0.3,
      minInboundLinks: 3,
      maxClickDepth: 3,
      maxTitle: 60,
      minDescription: 50,
      maxDescription: 155,
      minDatenKlassen: 2,
      minDatenWoerter: 60,
      minDatenAnteil: 0.3,
      maxJaccardWholeIndexierbar: 0.3,
      maxJaccardOrtIndexierbar: 0.2,
      maxJaccardHtml: 0.4,
    });
    expect(Object.isFrozen(GATE)).toBe(true);
  });
});

describe('Lock-Datei lib/places/data/indexierung.json', () => {
  it('entspricht der Rechnung (sonst bun run orte:gate und den Diff prüfen)', () => {
    expect(indexierungJson).toEqual(indexierungDatei(ergebnisse, LOCK.zurueckgenommen));
    expect(LOCK._kommentar).toBe(INDEXIERUNG_KOMMENTAR);
    expect(LOCK.gate).toBe('lib/places/qualitaet.ts');
  });

  it('führt genau die veröffentlichten Orte, nach ID sortiert', () => {
    expect(Object.keys(LOCK.orte)).toEqual(places.map((p) => p.id).sort((a, b) => a.localeCompare(b)));
  });

  it('zurückgenommene Orte: bekannte ID, Datum JJJJ-MM-TT, Grund in Worten', () => {
    for (const [id, eintrag] of Object.entries(LOCK.zurueckgenommen)) {
      expect(getPlaceById(id), id).toBeDefined();
      expect(eintrag.seit).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(eintrag.grund.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('bestehende Orte haben keine Gründe, durchgefallene mindestens einen; gültig bis Ende des Fahrplanjahres', () => {
    for (const [id, eintrag] of Object.entries(LOCK.orte)) {
      expect(eintrag.indexierbar, id).toBe(eintrag.gruende.length === 0);
      expect(eintrag.gueltigBis, id).toBe(FAHRPLAN_STAND.gueltigBis);
    }
  });

  it('die Werte im Ergebnis halten die Grenzen ein, wo ein Ort indexiert wird', () => {
    expect(ergebnisse).toHaveLength(places.length);
    for (const e of ergebnisse.filter((x) => x.indexierbar)) {
      expect(e.werte.datenKlassen.length, e.placeId).toBeGreaterThanOrEqual(GATE.minDatenKlassen);
      expect(e.werte.datenWoerter, e.placeId).toBeGreaterThanOrEqual(GATE.minDatenWoerter);
      expect(e.werte.datenAnteil, e.placeId).toBeGreaterThanOrEqual(GATE.minDatenAnteil);
      expect(e.werte.jaccardGanz, e.placeId).toBeLessThanOrEqual(GATE.maxJaccardWholeIndexierbar);
      expect(e.werte.jaccardOrt, e.placeId).toBeLessThanOrEqual(GATE.maxJaccardOrtIndexierbar);
    }
  });
});

describe('Gate: jede Regel greift', () => {
  const asslar = ort('asslar');
  const asslarPage = getPlacePageText(asslar, { jobs });

  it('I2 und I3: ein Ort ohne Fahrplandaten hat keine Datenklasse und keinen Text aus Daten', () => {
    const ohneDaten: Place = { ...asslar, oepnv: undefined };
    expect(datenBelege(ohneDaten)).toEqual([]);
    const gruende = pruefeDaten(ohneDaten, getPlacePageText(ohneDaten, { jobs }));
    expect(gruende.some((g) => g.startsWith('I2: 0 Datenklassen'))).toBe(true);
    expect(gruende.some((g) => g.startsWith('I3: 0 Wörter aus Daten'))).toBe(true);
    expect(pruefeDaten(asslar, asslarPage)).toEqual([]);
  });

  it('I3: zu wenig Daten im Verhältnis zum Ortstext', () => {
    const lang = mitBlock(asslarPage, 'kreis', { kind: 'ort', text: 'Wort '.repeat(600).trim() + '.' });
    expect(pruefeDaten(asslar, lang).some((g) => /^I3: \d+\u00a0% des Ortstexts aus Daten/.test(g))).toBe(true);
  });

  it('I6: ein unbestätigter Fakt auf der Seite', () => {
    const offen = mitBlock(asslarPage, 'band', { kind: 'gemeinsam', text: 'Bosch Premium Partner', factIds: ['boschPremiumPartner'] });
    expect(pruefeDaten(asslar, offen)).toContain('I6: unbestätigte Fakten: boschPremiumPartner');
  });

  it('I1: unbelegte Zahl (U5), feste Arbeitszeit (U6) und doppelter Title (U8) treffen nur die geänderte Seite', () => {
    const seiten = places.map((p) => seite(p));
    const i = seiten.findIndex((s) => s.place.id === 'asslar');
    const kaputt = mitBlock(asslarPage, 'kreis', { kind: 'ort', text: 'Ab 13:30 Uhr ist frei, 9999 Leute warten.' });
    const kopie = { ...kaputt, meta: { ...kaputt.meta, title: seiten[i + 1].page.meta.title } };
    seiten[i] = seite(asslar, kopie);
    const gruende = pruefeEinzigartigkeit(seiten, jobs);
    const asslarGruende = gruende.get('asslar')!;
    expect(asslarGruende.some((g) => g.startsWith('U5: Zahlen ohne Quelle') && g.includes('9999'))).toBe(true);
    expect(asslarGruende.some((g) => g.startsWith('U6: verbotene Arbeitszeit-Aussage'))).toBe(true);
    expect(asslarGruende).toContain('U8: title nicht eindeutig');
    // Der Nachbar mit dem kopierten Title fällt mit (Eindeutigkeit gilt für beide), alle übrigen bestehen
    const andere = [...gruende].filter(([id, g]) => id !== 'asslar' && id !== seiten[i + 1].place.id && g.length > 0);
    expect(andere).toEqual([]);
  });

  it('I1: ohne Störung besteht jede Seite U1–U8', () => {
    const gruende = pruefeEinzigartigkeit(
      places.map((p) => seite(p)),
      jobs,
    );
    expect([...gruende].filter(([, g]) => g.length > 0)).toEqual([]);
  });

  it('I4: von zwei gleichen Seiten fällt genau eine heraus, fest nach der Strecke (die weitere)', () => {
    const a = ort('asslar');
    const b = ort('braunfels');
    const gleich = getPlacePageText(a, { jobs });
    const { raus } = aehnlichkeitUnterIndexierbaren([seite(a, gleich), seite(b, gleich), seite(ort('lich'))]);
    expect([...raus.keys()]).toHaveLength(1);
    const [id] = [...raus.keys()];
    expect(['asslar', 'braunfels']).toContain(id);
    expect(raus.get(id)).toMatch(/^I4: zu ähnlich wie (asslar|braunfels) \(ganz 1,000/);
    expect(aehnlichkeitUnterIndexierbaren([seite(a, gleich), seite(b, gleich)]).raus).toEqual(raus);
  });

  it('zurückgenommen (120-Tage-Regel): noindex mit Grund, die übrigen unberührt', () => {
    const mit = pruefeOrte({ jobs, zurueckgenommen: { lich: { grund: '120 Tage ohne Impressionen', seit: '2027-02-11' } } });
    const lich = mit.find((e) => e.placeId === 'lich')!;
    expect(lich.indexierbar).toBe(false);
    expect(lich.gruende).toContain('zurückgenommen seit 2027-02-11: 120 Tage ohne Impressionen');
    for (const e of mit.filter((x) => x.placeId !== 'lich')) {
      expect(e.indexierbar, e.placeId).toBe(ergebnisse.find((x) => x.placeId === e.placeId)!.indexierbar);
    }
  });
});

describe('I5: Daten aktuell', () => {
  it('Fahrplanwechsel am zweiten Sonntag im Dezember, das Fahrplanjahr endet am Tag davor', () => {
    expect(fahrplanwechsel(2026)).toBe('2026-12-13');
    expect(fahrplanwechsel(2027)).toBe('2027-12-12');
    expect(fahrplanwechsel(2028)).toBe('2028-12-10');
    expect(fahrplanjahrEnde('2026-10-27')).toBe('2026-12-12');
    expect(fahrplanjahrEnde('2026-12-13')).toBe('2027-12-11');
    expect(FAHRPLAN_STAND).toEqual({ stand: '2026-10-10', werktag: '2026-10-27', gueltigBis: '2026-12-12' });
  });

  it('Einsätze (M-023, noch keine Daten) gelten 15 Monate; mit ihnen kommt die Titelstufe „SHK-Jobs“', () => {
    expect(EINSAETZE_GUELTIG_MONATE).toBe(15);
    expect(monateSpaeter('2026-10-14', EINSAETZE_GUELTIG_MONATE)).toBe('2028-01-14');
    expect(titelStufe(['oepnv', 'berufsschule'])).toBe('arbeitsweg');
    expect(titelStufe(['oepnv', 'berufsschule', 'einsaetze'])).toBe('shk-jobs');
  });

  it('die Seite prüft das Datum in Wetzlar: am letzten Gültigkeitstag indexierbar, ab dem Fahrplanwechsel noindex', () => {
    const asslar = ort('asslar');
    expect(istOrtIndexierbar(asslar, new Date('2026-10-14T10:00:00Z'))).toBe(indexierungEintrag('asslar')!.indexierbar);
    expect(istOrtIndexierbar(asslar, new Date('2026-12-12T21:00:00Z'))).toBe(true);
    // 23:30 UTC ist in Wetzlar schon der 13. Dezember
    expect(heuteInWetzlar(new Date('2026-12-12T23:30:00Z'))).toBe('2026-12-13');
    expect(istOrtIndexierbar(asslar, new Date('2026-12-12T23:30:00Z'))).toBe(false);
    expect(indexierungsGruende(asslar, new Date('2026-12-20T10:00:00Z'))).toEqual(['I5: Daten gelten bis 2026-12-12']);
    expect(indexierungsGruende(asslar, new Date('2026-10-14T10:00:00Z'))).toEqual([]);
  });

  it('nur veröffentlichte Orte, die das Gate kennt', () => {
    const asslar = ort('asslar');
    expect(istOrtIndexierbar({ ...asslar, status: 'merged' }, new Date('2026-10-14T10:00:00Z'))).toBe(false);
    expect(istOrtIndexierbar({ id: 'nirgendwo', status: 'published' }, new Date('2026-10-14T10:00:00Z'))).toBe(false);
    expect(indexierungsGruende({ id: 'nirgendwo', status: 'published' })).toEqual(['nicht in lib/places/data/indexierung.json (bun run orte:gate)']);
  });
});
