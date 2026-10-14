import { z } from 'zod';
import { haversineKm } from '@/lib/maps/projection';

import { KREIS_IDS } from './kreise';
import { MEASUREMENT } from './measurement';

/**
 * Orts-Domänenmodell der lokalen Seiten (/einsatzgebiet/…), nach dem Vorbild von lib/jobs/schema.ts.
 * data.ts legt jeden Ort mit definePlace() an; ungültige Daten brechen Build und Tests ab.
 * Nur Server-Code: zod darf nicht in ein Client-Bundle (scripts/qa/check-client-imports.mjs).
 */

export const PLACE_KINDS = ['stadt', 'stadtteil', 'gemeinde'] as const;
/** published: eigene Seite · pending: gemessen, noch nicht freigegeben · merged/archived: 308 auf die Kreis- bzw. Gebietsseite. */
export const PLACE_STATUSES = ['published', 'pending', 'merged', 'archived'] as const;

/**
 * Auswahl der Ortsseiten: höchstens 35 km Straße bis zum Firmensitz. Der Fakt radius35 (Inhaber 2026-10-12) sagt nur
 * „Umkreis von 35 km um Wetzlar“; ob Straße oder Luftlinie gemeint ist, ist offen (fakten-abgleich B33).
 */
export const MAX_ROAD_KM = MEASUREMENT.maxRoadKm;
/** Gegenprobe der Messung: Straßenstrecke ≥ 0,95 × Luftlinie (gerundete km dürfen knapp darunter liegen). */
export const MIN_ROAD_TO_AIR = 0.95;
/** Luftlinie aus messung.json (auf 0,1 km gerundet) gegen die eigene Rechnung. */
const AIR_TOLERANCE_KM = 0.15;
/** Einziger Elternort bisher: die Stadtteile gehören zu Wetzlar. */
export const STADTTEIL_PARENT_ID = 'wetzlar';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MEASUREMENT_SOURCE_PATTERN = /^docs\/operations\/orte-messung\.md@[0-9a-f]{7,40}$/;
/** Fundstelle als `pfad@commit` wie in lib/content/facts.ts. */
const PINNED_SOURCE = /^[\w./-]+@[0-9a-f]{7,40}$/;

const HQ = { lat: MEASUREMENT.headquarters.lat, lng: MEASUREMENT.headquarters.lng };

/** Slug-Regel zod-frei in home-map.ts (auch die Startseitenkarte im Client braucht sie). */
export { slugifyPlaceName } from './home-map';

const slug = z.string().regex(SLUG, 'Slug: nur a–z, 0–9 und einzelne Bindestriche (ASCII)');
const isoDate = z
  .string()
  .regex(ISO_DATE, 'Datum im Format JJJJ-MM-TT')
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), 'Ungültiges Datum');

export const PlaceKindSchema = z.enum(PLACE_KINDS);
export const PlaceStatusSchema = z.enum(PLACE_STATUSES);

export const CommuteSchema = z.object({
  /** Straßenstrecke Messpunkt → Firmensitz, ganze km. */
  distanceKm: z.number().int().min(0),
  /** Fahrzeit ohne Verkehrslage, ganze Minuten. */
  minutes: z.number().int().positive(),
  /** Luftlinie zum Firmensitz, 0,1 km. */
  airKm: z.number().min(0),
  measuredOn: isoDate,
  method: z.string().min(10),
  source: z.string().regex(PINNED_SOURCE, 'Quelle als pfad@commit'),
});

export const CharacterSchema = z.object({
  /** Freigegebene Kurzbeschreibung, wörtlich (MENSCHEN M-016). */
  text: z.string().min(5),
  source: z.string().regex(PINNED_SOURCE, 'Quelle als pfad@commit'),
});

/*
 * Bus und Bahn sowie Berufsschule (Plan §B, Paket W2a): Form von lib/places/data/oepnv.json und berufsschule.json,
 * erzeugt mit scripts/places/oepnv.mjs. Der zod-freie Lader mit denselben Typen ist lib/places/oepnv.ts;
 * lib/places/__tests__/oepnv.test.ts hält Schema, Typen und Dateien gleich.
 */

/** Uhrzeit am Werktag „HH:MM“, 00:00–23:59 (keine Zeiten über 24 h wie in GTFS). */
const CLOCK = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const clock = z.string().regex(CLOCK, 'Uhrzeit HH:MM');
const minutes = z.number().int().min(0);
const clockMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));

export const OEPNV_VERKEHRSMITTEL = ['bahn', 'bus', 'tram', 'u-bahn', 'bedarf', 'faehre', 'sonstige'] as const;
export const OepnvVerkehrsmittelSchema = z.enum(OEPNV_VERKEHRSMITTEL);

export const OepnvTeilstreckeSchema = z.object({
  /** route_short_name, sonst route_long_name. */
  linie: z.string().min(1),
  verkehrsmittel: OepnvVerkehrsmittelSchema,
  ab: z.string().min(2),
  abfahrt: clock,
  an: z.string().min(2),
  ankunft: clock,
  /** Fußweg vor dieser Teilstrecke, wenn der Umstieg die Haltestelle wechselt. */
  umstiegZuFussMin: minutes.optional(),
});

export const OepnvLinieSchema = z.object({ name: z.string().min(1), verkehrsmittel: OepnvVerkehrsmittelSchema });

/** Eine Verbindung Ortsmitte → Ziel: Losgehen, erstes Fahrzeug, letzte Haltestelle, Ankunft nach dem Fußweg. */
export const OepnvVerbindungSchema = z
  .object({
    losgehen: clock,
    gehMinStart: minutes,
    ab: z.string().min(2),
    abfahrt: clock,
    an: z.string().min(2),
    ankunftHaltestelle: clock,
    gehMinZiel: minutes,
    ankunft: clock,
    /** Abfahrt → Ankunft an der Ziel-Haltestelle. */
    fahrzeitMin: z.number().int().min(1),
    /** Losgehen → Ankunft am Ziel (Tür zu Tür). */
    reisezeitMin: z.number().int().min(1),
    umstiege: z.number().int().min(0),
    linien: z.array(OepnvLinieSchema).min(1),
    teilstrecken: z.array(OepnvTeilstreckeSchema).min(1),
  })
  .superRefine((v, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    const folge = [v.losgehen, v.abfahrt, v.ankunftHaltestelle, v.ankunft].map(clockMinutes);
    if (folge.some((t, i) => i > 0 && t < folge[i - 1])) issue(['ankunft'], 'Losgehen ≤ Abfahrt ≤ Ankunft Haltestelle ≤ Ankunft');
    if (v.umstiege !== v.teilstrecken.length - 1) issue(['umstiege'], 'Umstiege = Teilstrecken − 1');
    if (v.teilstrecken[0]?.abfahrt !== v.abfahrt || v.teilstrecken[0]?.ab !== v.ab) issue(['ab'], 'Abfahrt wie erste Teilstrecke');
    const letzte = v.teilstrecken.at(-1);
    if (letzte?.ankunft !== v.ankunftHaltestelle || letzte?.an !== v.an) issue(['an'], 'Ankunft wie letzte Teilstrecke');
    if (v.reisezeitMin !== folge[3] - folge[0]) issue(['reisezeitMin'], 'Reisezeit = Ankunft − Losgehen');
    if (v.fahrzeitMin !== folge[2] - folge[1]) issue(['fahrzeitMin'], 'Fahrzeit = Ankunft Haltestelle − Abfahrt');
    v.teilstrecken.forEach((t, i) => {
      if (clockMinutes(t.ankunft) < clockMinutes(t.abfahrt)) issue(['teilstrecken', i], 'Ankunft vor Abfahrt');
      const vorher = v.teilstrecken[i - 1];
      if (vorher && clockMinutes(t.abfahrt) < clockMinutes(vorher.ankunft)) issue(['teilstrecken', i], 'Abfahrt vor der Ankunft davor');
    });
    for (const t of v.teilstrecken) {
      if (!v.linien.some((l) => l.name === t.linie && l.verkehrsmittel === t.verkehrsmittel)) issue(['linien'], `Linie ${t.linie} fehlt`);
    }
  });

export const OepnvKurzverbindungSchema = z.object({ losgehen: clock, abfahrt: clock, ankunft: clock, umstiege: z.number().int().min(0) });

/** Weg zu einem Ziel (Betrieb oder Schule). Ohne Verbindung bis `ankunftBis` steht der Grund da, das ist auch eine Auskunft. */
export const OepnvWegSchema = z
  .object({
    moeglich: z.boolean(),
    ankunftBis: clock,
    spaeteste: OepnvVerbindungSchema.optional(),
    grund: z.string().min(10).optional(),
    /** Nicht überholte Verbindungen mit Ankunft im Zählfenster (methode.zaehlfenster). */
    verbindungenMorgens: z.number().int().min(0),
    verbindungen: z.array(OepnvKurzverbindungSchema),
    /** Direkter Fußweg, wenn der Ort nah am Ziel liegt; langsamere Verbindungen zählen nicht. */
    direktZuFussMin: z.number().int().min(1).optional(),
  })
  .superRefine((w, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    if (w.moeglich && (!w.spaeteste || w.grund)) issue(['spaeteste'], 'Möglich: späteste Verbindung, kein Grund');
    if (!w.moeglich && (w.spaeteste || !w.grund)) issue(['grund'], 'Nicht möglich: Grund, keine Verbindung');
    if (w.spaeteste && clockMinutes(w.spaeteste.ankunft) > clockMinutes(w.ankunftBis)) issue(['spaeteste', 'ankunft'], 'Ankunft nach ankunftBis');
    if (w.verbindungenMorgens !== w.verbindungen.length) issue(['verbindungenMorgens'], 'Zahl passt nicht zur Liste');
    w.verbindungen.forEach((v, i) => {
      const vorher = w.verbindungen[i - 1];
      if (vorher && (clockMinutes(v.losgehen) <= clockMinutes(vorher.losgehen) || clockMinutes(v.ankunft) <= clockMinutes(vorher.ankunft))) {
        issue(['verbindungen', i], 'Verbindungen nach Losgehen und Ankunft aufsteigend, keine überholte');
      }
    });
  });

export const OepnvHaltestelleSchema = z.object({
  name: z.string().min(2),
  /** Fußweg auf dem Wegenetz, auf 10 m gerundet. */
  wegM: z.number().int().min(0),
  gehMin: minutes,
});

/** Bus und Bahn je Ort (lib/places/data/oepnv.json → orte[id]). */
export const OepnvOrtSchema = z.object({
  name: z.string().min(2),
  /** Messpunkt, wenn er anders heißt als der Ort (wie Place.seat). */
  messpunkt: z.string().min(2).optional(),
  startHaltestellen: z.array(OepnvHaltestelleSchema),
  betrieb: OepnvWegSchema,
  schule: OepnvWegSchema,
});

const OepnvZielSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  ankunftBis: clock,
  zielHaltestellen: z.array(OepnvHaltestelleSchema).min(1),
});

/** Ganze Datei lib/places/data/oepnv.json mit Quelle, Lizenz und Stand im Kopf. */
export const OepnvDateiSchema = z
  .object({
    _kommentar: z.string().min(10),
    quelle: z.object({
      name: z.string().min(5),
      herausgeber: z.string().min(5),
      urls: z.array(z.url()).min(1),
      lizenz: z.literal('CC BY 4.0'),
      lizenzUrl: z.url(),
      namensnennung: z.string().min(10),
      /** Hinweis auf die Bearbeitung (CC BY 4.0, Abschnitt 3 a). */
      bearbeitung: z.string().min(10),
      feeds: z.array(z.string().min(3)).min(1),
      stand: isoDate,
    }),
    fusswege: z.object({ dienst: z.string().min(5), daten: z.string().min(5), methode: z.string().min(10) }),
    fahrplanperiode: z.object({ von: isoDate, bis: isoDate }),
    werktag: isoDate,
    wochentag: z.enum(['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']),
    methode: z.record(z.string(), z.union([z.string(), z.number()])),
    betrieb: OepnvZielSchema.extend({ adresse: z.string().min(5) }),
    schule: OepnvZielSchema.extend({ name: z.string().min(5) }),
    orte: z.record(slug, OepnvOrtSchema),
  })
  .superRefine((d, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    if (d.werktag < d.fahrplanperiode.von || d.werktag > d.fahrplanperiode.bis) issue(['werktag'], 'Werktag außerhalb der Fahrplanperiode');
    if (d.quelle.stand > d.werktag) issue(['quelle', 'stand'], 'Stand nach dem Werktag');
    for (const [id, ort] of Object.entries(d.orte)) {
      if (ort.betrieb.ankunftBis !== d.betrieb.ankunftBis) issue(['orte', id, 'betrieb'], 'ankunftBis wie im Kopf');
      if (ort.schule.ankunftBis !== d.schule.ankunftBis) issue(['orte', id, 'schule'], 'ankunftBis wie im Kopf');
    }
  });

/** laut-verordnung: aus Verordnung und Satzung abgeleitet; bestaetigt: vom Inhaber bestätigt (MENSCHEN M-024). */
export const BERUFSSCHULE_STATUS = ['laut-verordnung', 'bestaetigt'] as const;

/** Zuständige Berufsschule (lib/places/data/berufsschule.json). */
export const BerufsschuleSchema = z.object({
  _kommentar: z.string().min(10),
  beruf: z.string().min(10),
  status: z.enum(BERUFSSCHULE_STATUS),
  bestaetigung: z.string().min(5),
  geprueftAm: isoDate,
  /** Zuständigkeit richtet sich nach dem Ausbildungsort (Satzung Lahn-Dill-Kreis § 2), nicht nach dem Wohnort. */
  massgeblich: z.literal('ausbildungsort'),
  ausbildungsort: z.object({ gemeinde: z.string().min(2), kreisId: z.enum(KREIS_IDS), schulbezirk: z.string().min(5) }),
  geltung: z.string().min(10),
  schule: z.object({
    name: z.string().min(5),
    strasse: z.string().min(3),
    postleitzahl: z.string().regex(/^\d{5}$/, 'PLZ mit 5 Ziffern'),
    ort: z.string().min(2),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    koordinatenQuelle: z.string().min(10),
    adresseQuelle: z.string().min(10),
    website: z.url(),
  }),
  stufen: z.object({ grundstufe: z.string().min(5), fachstufe: z.string().min(5) }),
  /** Unterrichtsbeginn, sobald belegt; bis dahin null und `ankunftBis` als Ansatz. */
  unterrichtsbeginn: clock.nullable(),
  ankunftBis: clock,
  ankunftHinweis: z.string().min(10),
  vorbehalt: z.string().min(10),
  andereAusbildungsorte: z.array(z.object({ gilt: z.string().min(10), schule: z.string().min(5), fundstelle: z.string().min(5) })),
  quellen: z.array(z.object({ titel: z.string().min(5), url: z.url(), fundstelle: z.string().min(5) })).min(1),
});

export const PlaceSchema = z
  .object({
    id: slug,
    slug,
    redirectFrom: z.array(slug).default([]),
    name: z.string().min(2),
    kind: PlaceKindSchema,
    kreisId: z.enum(KREIS_IDS),
    parentId: slug.optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'PLZ mit 5 Ziffern'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    /** Messpunkt, wenn er anders heißt als der Ort (Hauptort der Gemeinde laut OpenStreetMap, `admin_centre`). */
    seat: z.string().min(2).optional(),
    /** OSM-Objekt der Verortung, z. B. „relation/13783388“. */
    osm: z.string().regex(/^(?:node|way|relation)\/\d+$/).optional(),
    commute: CommuteSchema,
    character: CharacterSchema.optional(),
    /**
     * Bus und Bahn zum Betrieb und zur Berufsschule aus lib/places/data/oepnv.json (lib/places/oepnv.ts); Quelle,
     * Lizenz und Stand stehen im Kopf der Datei (OEPNV_QUELLE). Optional, bis die Ortsseiten sie zeigen.
     */
    oepnv: OepnvOrtSchema.optional(),
    /** ID in lib/data/locations.ts (Karte der Startseite), solange es die Datei gibt. */
    legacyLocationId: z.string().min(3).optional(),
    status: PlaceStatusSchema,
    /** Grund für pending, merged oder archived (z. B. „besteht U3 nicht“). */
    statusNote: z.string().min(5).optional(),
    /** Einer der Punkte auf der Karte der Startseite. */
    homeMap: z.boolean(),
    updatedAt: isoDate,
  })
  .superRefine((place, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
    const { commute } = place;
    const air = haversineKm(HQ, { lat: place.lat, lng: place.lng });

    if (place.redirectFrom.includes(place.slug)) issue(['redirectFrom'], 'redirectFrom darf den aktuellen Slug nicht enthalten');
    if (Math.abs(commute.airKm - air) > AIR_TOLERANCE_KM) {
      issue(['commute', 'airKm'], `Luftlinie ${commute.airKm} km passt nicht zu den Koordinaten (${air.toFixed(2)} km)`);
    }
    if (commute.distanceKm < MIN_ROAD_TO_AIR * air) {
      issue(['commute', 'distanceKm'], `Straße ${commute.distanceKm} km < ${MIN_ROAD_TO_AIR} × Luftlinie ${air.toFixed(1)} km`);
    }
    if (Date.parse(place.updatedAt) < Date.parse(commute.measuredOn)) {
      issue(['updatedAt'], 'updatedAt darf nicht vor der Messung liegen');
    }

    if (place.kind === 'stadtteil' && place.parentId !== STADTTEIL_PARENT_ID) {
      issue(['parentId'], `Stadtteile brauchen parentId „${STADTTEIL_PARENT_ID}“`);
    }
    if (place.kind !== 'stadtteil' && place.parentId !== undefined) issue(['parentId'], 'parentId nur für Stadtteile');
    if (place.homeMap && !place.legacyLocationId) issue(['legacyLocationId'], 'Orte der Startseitenkarte brauchen ihre bisherige ID');
    if (place.homeMap && place.status !== 'published') issue(['homeMap'], 'Die Startseite zeigt nur veröffentlichte Orte');

    if (place.status === 'published') {
      if (!MEASUREMENT_SOURCE_PATTERN.test(commute.source)) {
        issue(['commute', 'source'], 'Veröffentlichte Orte brauchen eine Messung aus docs/operations/orte-messung.md@<sha>');
      }
      if (commute.distanceKm > MAX_ROAD_KM) {
        issue(['commute', 'distanceKm'], `Straße ${commute.distanceKm} km liegt außerhalb der ${MAX_ROAD_KM} km (Fakt radius35)`);
      }
    } else if (!place.statusNote) {
      issue(['statusNote'], `Status „${place.status}“ braucht einen Grund`);
    }
  });

export type PlaceInput = z.input<typeof PlaceSchema>;
export type Place = z.output<typeof PlaceSchema>;
export type PlaceKind = z.infer<typeof PlaceKindSchema>;
export type PlaceStatus = z.infer<typeof PlaceStatusSchema>;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

/** Validiert einen Ort beim Laden des Moduls; ein Fehler bricht Build und Tests ab. */
export function definePlace(input: PlaceInput): Place {
  const result = PlaceSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Ungültiger Ort „${String(input.id)}“:\n${z.prettifyError(result.error)}`);
  }
  return deepFreeze(result.data);
}
