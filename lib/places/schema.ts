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

/** Gebietsregel (Fakt radius35, Inhaber 2026-10-12): höchstens 35 km Straße bis zum Firmensitz. */
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
    /** Messpunkt, wenn er anders heißt als der Ort (Verwaltungssitz der Gemeinde). */
    seat: z.string().min(2).optional(),
    /** OSM-Objekt der Verortung, z. B. „relation/13783388“. */
    osm: z.string().regex(/^(?:node|way|relation)\/\d+$/).optional(),
    commute: CommuteSchema,
    character: CharacterSchema.optional(),
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
