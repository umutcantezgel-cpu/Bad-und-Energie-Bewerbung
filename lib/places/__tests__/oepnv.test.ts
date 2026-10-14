import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';

import { haversineKm } from '@/lib/maps/projection';

import berufsschuleJson from '../data/berufsschule.json';
import gegenprobeJson from '../data/oepnv-gegenprobe.json';
import messung from '../data/messung.json';
import oepnvJson from '../data/oepnv.json';
import slugsLock from '../slugs.lock.json';
import { KREIS_DEFS, KREIS_IDS } from '../kreise';
import {
  BERUFSSCHULE,
  OEPNV_META,
  OEPNV_QUELLE,
  getOepnv,
  getOepnvOrtIds,
  type Berufsschule,
  type OepnvDatei,
  type OepnvOrt,
} from '../oepnv';
import { getAllPlaces } from '../registry';
import { BerufsschuleSchema, OepnvDateiSchema, OepnvOrtSchema, PlaceSchema } from '../schema';

/**
 * Bus und Bahn sowie Berufsschule (Plan §B, Paket W2a): Die Dateien aus scripts/places/oepnv.mjs sind vollständig,
 * plausibel, mit Quelle und Lizenz, und passen zu Schema, Lader und Gegenprobe. Die Ortsseiten zeigen die Daten
 * erst mit W2b; bis dahin sichern diese Tests die Daten selbst.
 */

const DATEI = OepnvDateiSchema.parse(oepnvJson);
const SCHULE = BerufsschuleSchema.parse(berufsschuleJson);
const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const WEGE = Object.entries(DATEI.orte).flatMap(([id, ort]) => [
  { id, ziel: 'betrieb' as const, weg: ort.betrieb },
  { id, ziel: 'schule' as const, weg: ort.schule },
]);

describe('oepnv.json: Form, Quelle, Lizenz, Stand', () => {
  it('passt zum Schema (Zeiten, Folgen, Möglich/Grund, Zählung)', () => {
    expect(OepnvDateiSchema.safeParse(oepnvJson).success).toBe(true);
  });

  it('nennt Quelle, Lizenz CC BY 4.0 und die Namensnennung mit gtfs.de und DELFI', () => {
    expect(DATEI.quelle.lizenz).toBe('CC BY 4.0');
    expect(DATEI.quelle.namensnennung).toMatch(/gtfs\.de/);
    expect(DATEI.quelle.namensnennung).toMatch(/DELFI/);
    expect(DATEI.quelle.namensnennung).toMatch(/OpenStreetMap/);
    expect(DATEI.quelle.bearbeitung).toMatch(/gefiltert/);
    expect(DATEI.quelle.urls.every((u) => u.startsWith('https://download.gtfs.de/'))).toBe(true);
    expect(DATEI.quelle.feeds).toEqual(['latest-nv-free', 'latest-rv-free']);
    expect(DATEI.fusswege.daten).toMatch(/OpenStreetMap/);
  });

  it('Stand, Fahrplanperiode und Werktag: ein Werktag in der Periode, nicht vor dem Stand', () => {
    expect(DATEI.quelle.stand).toBe('2026-10-10');
    expect(DATEI.fahrplanperiode).toEqual({ von: '2026-10-10', bis: '2026-11-09' });
    expect(DATEI.werktag).toBe('2026-10-27');
    expect(new Date(`${DATEI.werktag}T12:00:00Z`).getUTCDay()).toBe(2);
    expect(DATEI.wochentag).toBe('Dienstag');
  });

  it('bleibt klein genug fürs Repo (< 300 KB) und ist nach Orts-ID sortiert', () => {
    const datei = path.join(__dirname, '../data/oepnv.json');
    expect(fs.statSync(datei).size).toBeLessThan(300 * 1024);
    const ids = Object.keys(oepnvJson.orte);
    expect(ids).toEqual([...ids].sort());
  });

  it('Ziel Betrieb ist der Firmensitz aus der Messung, Ziel Schule die Berufsschule', () => {
    expect(DATEI.betrieb).toMatchObject({ lat: messung.headquarters.lat, lng: messung.headquarters.lng, ankunftBis: '07:30' });
    expect(DATEI.betrieb.adresse).toBe(messung.headquarters.address);
    expect(DATEI.schule).toMatchObject({ name: SCHULE.schule.name, lat: SCHULE.schule.lat, lng: SCHULE.schule.lng, ankunftBis: SCHULE.ankunftBis });
    for (const ziel of [DATEI.betrieb, DATEI.schule]) {
      for (const h of ziel.zielHaltestellen) expect(h.wegM).toBeLessThanOrEqual(Number(DATEI.methode.zielMaxWegM));
    }
  });
});

describe('oepnv.json: Vollständigkeit', () => {
  const aufgenommen = messung.places.filter((p) => p.included).map((p) => p.id);

  it('hat genau die 54 aufgenommenen Orte der Messung', () => {
    expect(aufgenommen).toHaveLength(54);
    expect(Object.keys(DATEI.orte).sort()).toEqual([...aufgenommen].sort());
  });

  it('Schlüssel = Orts-ID = Slug; jeder Orts-Slug aus slugs.lock.json hat Daten', () => {
    for (const place of getAllPlaces()) {
      expect(place.slug).toBe(place.id);
      expect(getOepnv(place.id)?.name).toBe(place.name);
    }
    const kreisSlugs = new Set(KREIS_IDS.map((id) => KREIS_DEFS[id].slug));
    const ortsSlugs = slugsLock.slugs.filter((slug) => !kreisSlugs.has(slug));
    expect(ortsSlugs).toHaveLength(54);
    for (const slug of ortsSlugs) expect(getOepnv(slug), slug).toBeDefined();
  });

  it('jeder Ort hat beide Wege und mindestens eine Start-Haltestelle', () => {
    for (const [id, ort] of Object.entries(DATEI.orte)) {
      expect(ort.startHaltestellen.length, id).toBeGreaterThan(0);
      expect(ort.betrieb, id).toBeDefined();
      expect(ort.schule, id).toBeDefined();
    }
  });
});

describe('oepnv.json: Plausibilität', () => {
  it('möglich: Linien und Teilstrecken nicht leer, Ankunft bis zur Frist', () => {
    for (const { id, ziel, weg } of WEGE) {
      if (!weg.moeglich) continue;
      const v = weg.spaeteste!;
      expect(v.linien.length, `${id} ${ziel}`).toBeGreaterThan(0);
      expect(v.teilstrecken.length, `${id} ${ziel}`).toBe(v.umstiege + 1);
      expect(minuten(v.ankunft), `${id} ${ziel}`).toBeLessThanOrEqual(minuten(weg.ankunftBis));
    }
  });

  it('Zeiten im Bereich: Losgehen ab 04:00, keine Fahrt über Mitternacht, nichts nach 08:00', () => {
    for (const { id, ziel, weg } of WEGE) {
      const zeiten = [
        ...(weg.spaeteste ? [weg.spaeteste.losgehen, weg.spaeteste.ankunft, ...weg.spaeteste.teilstrecken.flatMap((t) => [t.abfahrt, t.ankunft])] : []),
        ...weg.verbindungen.flatMap((v) => [v.losgehen, v.abfahrt, v.ankunft]),
      ];
      for (const t of zeiten) {
        expect(minuten(t), `${id} ${ziel} ${t}`).toBeGreaterThanOrEqual(4 * 60);
        expect(minuten(t), `${id} ${ziel} ${t}`).toBeLessThanOrEqual(8 * 60);
      }
    }
  });

  it('Dauern plausibel: Fahrt ≥ 1 Min., Tür zu Tür ≤ 3,5 h, Fußwege ≤ 25 Min., höchstens 4 Umstiege', () => {
    for (const { id, ziel, weg } of WEGE) {
      if (!weg.spaeteste) continue;
      const v = weg.spaeteste;
      expect(v.fahrzeitMin, `${id} ${ziel}`).toBeGreaterThanOrEqual(1);
      expect(v.reisezeitMin, `${id} ${ziel}`).toBeGreaterThanOrEqual(v.fahrzeitMin);
      expect(v.reisezeitMin, `${id} ${ziel}`).toBeLessThanOrEqual(210);
      expect(v.gehMinStart + v.gehMinZiel, `${id} ${ziel}`).toBeLessThanOrEqual(25);
      expect(v.umstiege, `${id} ${ziel}`).toBeLessThanOrEqual(4);
      expect(v.reisezeitMin, `${id} ${ziel}`).toBe(minuten(v.ankunft) - minuten(v.losgehen));
      expect(v.fahrzeitMin, `${id} ${ziel}`).toBe(minuten(v.ankunftHaltestelle) - minuten(v.abfahrt));
    }
  });

  it('Verbindungen am Morgen: Ankunft 06:00–08:00, keine langsamer als der direkte Fußweg', () => {
    for (const { id, ziel, weg } of WEGE) {
      for (const v of weg.verbindungen) {
        expect(minuten(v.ankunft), `${id} ${ziel}`).toBeGreaterThanOrEqual(6 * 60);
        expect(minuten(v.ankunft), `${id} ${ziel}`).toBeLessThanOrEqual(8 * 60);
        if (weg.direktZuFussMin !== undefined) {
          expect(minuten(v.ankunft) - minuten(v.losgehen), `${id} ${ziel}`).toBeLessThan(weg.direktZuFussMin);
        }
      }
    }
  });

  it('nicht möglich nur mit Grund; die meisten Orte sind mit Bus und Bahn erreichbar', () => {
    const ohne = WEGE.filter((w) => !w.weg.moeglich);
    for (const { id, ziel, weg } of ohne) expect(weg.grund, `${id} ${ziel}`).toMatch(/^(Keine|Zu Fuß)/);
    expect(WEGE.filter((w) => w.weg.moeglich).length).toBeGreaterThanOrEqual(100);
  });

  it('Fernverkehr bleibt außen vor; Verkehrsmittel nur Bus und Bahn in dieser Region', () => {
    const linien = WEGE.flatMap(({ weg }) => weg.spaeteste?.teilstrecken ?? []);
    expect(linien.some((t) => /^(ICE|IC|EC)\b/.test(t.linie))).toBe(false);
    expect(new Set(linien.map((t) => t.verkehrsmittel))).toEqual(new Set(['bus', 'bahn']));
  });
});

describe('Gegenprobe gegen eine zweite Auskunft (Transitous)', () => {
  const gegenprobe = gegenprobeJson as unknown as {
    werktag: string;
    quelle: string;
    vergleiche: {
      ort: string;
      ziel: 'betrieb' | 'schule';
      unsere: { moeglich: boolean; abfahrt?: string; linien?: string[] };
      gegenprobe: { moeglich: boolean; abfahrt?: string };
      ergebnis: 'gleich' | 'abweichend';
      hinweis?: string;
    }[];
  };

  it('prüft mindestens 5 Orte mit beiden Zielen am selben Werktag', () => {
    expect(gegenprobe.werktag).toBe(DATEI.werktag);
    expect(gegenprobe.quelle).toMatch(/Transitous/);
    expect(new Set(gegenprobe.vergleiche.map((v) => v.ort)).size).toBeGreaterThanOrEqual(5);
    expect(gegenprobe.vergleiche.filter((v) => v.ziel === 'schule').length).toBeGreaterThanOrEqual(5);
  });

  it('passt zum aktuellen oepnv.json (sonst Gegenprobe neu laufen lassen)', () => {
    for (const v of gegenprobe.vergleiche) {
      const weg = DATEI.orte[v.ort][v.ziel];
      expect(v.unsere.moeglich, `${v.ort} ${v.ziel}`).toBe(weg.moeglich);
      if (weg.spaeteste) {
        expect(v.unsere.abfahrt, `${v.ort} ${v.ziel}`).toBe(weg.spaeteste.abfahrt);
        expect(v.unsere.linien, `${v.ort} ${v.ziel}`).toEqual(weg.spaeteste.teilstrecken.map((t) => t.linie));
      }
    }
  });

  it('jede Abweichung ist geprüft und begründet; „nicht möglich“ bestätigt die Gegenprobe', () => {
    for (const v of gegenprobe.vergleiche) {
      if (v.ergebnis !== 'gleich') expect(v.hinweis, `${v.ort} ${v.ziel}`).toMatch(/.{40,}/);
      if (!v.unsere.moeglich) expect(v.gegenprobe.moeglich, `${v.ort} ${v.ziel}`).toBe(false);
    }
    // Mindestens zwei Drittel stimmen in Abfahrt und Linien genau überein.
    const gleich = gegenprobe.vergleiche.filter((v) => v.ergebnis === 'gleich').length;
    expect(gleich * 3).toBeGreaterThanOrEqual(gegenprobe.vergleiche.length * 2);
  });
});

describe('berufsschule.json', () => {
  it('passt zum Schema; Status laut Verordnung, Bestätigung durch den Inhaber offen (M-024)', () => {
    expect(BerufsschuleSchema.safeParse(berufsschuleJson).success).toBe(true);
    expect(SCHULE.status).toBe('laut-verordnung');
    expect(SCHULE.bestaetigung).toMatch(/M-024/);
    expect(SCHULE.beruf).toMatch(/Sanitär-, Heizungs- und Klimatechnik/);
  });

  it('zuständig nach dem Ausbildungsort Wetzlar: Werner-von-Siemens-Schule, Grund- und Fachstufe', () => {
    expect(SCHULE.massgeblich).toBe('ausbildungsort');
    expect(SCHULE.ausbildungsort).toMatchObject({ gemeinde: 'Wetzlar', kreisId: 'lahn-dill-kreis' });
    expect(SCHULE.schule).toMatchObject({ name: 'Werner-von-Siemens-Schule Wetzlar', strasse: 'Dammstraße 62', postleitzahl: '35576', ort: 'Wetzlar' });
    expect(SCHULE.stufen).toEqual({ grundstufe: SCHULE.schule.name, fachstufe: SCHULE.schule.name });
  });

  it('Koordinaten liegen in Wetzlar (≤ 5 km vom Firmensitz)', () => {
    const km = haversineKm({ lat: messung.headquarters.lat, lng: messung.headquarters.lng }, { lat: SCHULE.schule.lat, lng: SCHULE.schule.lng });
    expect(km).toBeLessThan(5);
  });

  it('Quellen mit URL und Fundstelle: Verordnung (Anlage 2 und 3) und Schulbezirkssatzung', () => {
    const urls = SCHULE.quellen.map((q) => q.url);
    expect(urls).toContain(
      'https://verkuendung.hessen.de/sites/verkuendung.hessen.de/files/veroeffentlichungsplattform_plugin/published/1322/GVBl_2026_Nr_21_Regelungstext-Anlage-2.pdf',
    );
    expect(urls).toContain('https://schulen.lahn-dill-kreis.de/wp-content/uploads/2025/12/Zusammengefuegt.pdf');
    for (const q of SCHULE.quellen) expect(q.fundstelle, q.titel).toMatch(/S\. \d|Seite|Berufe im Anlagenbau/);
  });

  it('Unterrichtsbeginn nicht belegt: Ankunft 07:45 angesetzt und so begründet', () => {
    expect(SCHULE.unterrichtsbeginn).toBeNull();
    expect(SCHULE.ankunftBis).toBe('07:45');
    expect(SCHULE.ankunftHinweis).toMatch(/nicht belegt/);
  });
});

describe('Lader lib/places/oepnv.ts', () => {
  it('liefert je Ort die Daten, für unbekannte IDs undefined, und die IDs alphabetisch', () => {
    expect(getOepnv('wetzlar')?.name).toBe('Wetzlar');
    expect(getOepnv('dillenburg')).toBeUndefined();
    expect(getOepnv('toString')).toBeUndefined();
    expect(getOepnvOrtIds()).toEqual(Object.keys(DATEI.orte));
  });

  it('Kopf und Quelle wie in der Datei, unveränderlich', () => {
    expect(OEPNV_QUELLE.namensnennung).toBe(DATEI.quelle.namensnennung);
    expect(OEPNV_META.werktag).toBe(DATEI.werktag);
    expect(OEPNV_META.fahrplanperiode).toEqual(DATEI.fahrplanperiode);
    expect(Object.isFrozen(getOepnv('wetzlar'))).toBe(true);
    expect(Object.isFrozen(BERUFSSCHULE.schule)).toBe(true);
  });

  it('Typen des Laders entsprechen den Schemas (zod bleibt aus dem Lader draußen)', () => {
    expectTypeOf<z.output<typeof OepnvOrtSchema>>().toEqualTypeOf<OepnvOrt>();
    expectTypeOf<z.output<typeof OepnvDateiSchema>>().toEqualTypeOf<OepnvDatei>();
    expectTypeOf<z.output<typeof BerufsschuleSchema>>().toEqualTypeOf<Berufsschule>();
    const quelltext = fs.readFileSync(path.join(__dirname, '../oepnv.ts'), 'utf8');
    expect(quelltext).not.toMatch(/from 'zod'/);
  });

  it('PlaceSchema nimmt die Daten eines Orts als optionales Feld oepnv an', () => {
    const wetzlar = getAllPlaces().find((p) => p.id === 'wetzlar')!;
    const mit = PlaceSchema.safeParse({ ...wetzlar, oepnv: getOepnv('wetzlar') });
    expect(mit.success).toBe(true);
    const kaputt = PlaceSchema.safeParse({ ...wetzlar, oepnv: { ...getOepnv('wetzlar'), betrieb: { moeglich: true } } });
    expect(kaputt.success).toBe(false);
  });
});
