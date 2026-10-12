import { HOME_MAP_PLACES } from '@/lib/places/home-map';

/**
 * Die 10 Orte der Startseitenkarte (Einsatzgebiet, Pendelrechner, Stellenliste), abgeleitet aus den gemessenen
 * Ortsdaten (lib/places/home-map.ts, dieselben Orte wie `homeMap` in der Registry): Strecke, Fahrzeit, PLZ und
 * Koordinaten sind dieselben wie auf den Ortsseiten (docs/operations/orte-messung.md@b0749f2, OSRM). Bis
 * 2026-10-12 standen hier eigene, ungemessene Werte; die Messung hat sie ersetzt (Plan „Übergang“). Zod-frei, weil
 * die Google-Karte (Client) über lib/content/region.ts hierher reicht.
 *
 * Hier bleiben nur Angaben der Startseite, die die Messung nicht kennt: die bisherige ID (Tests, Explorer), der
 * Anzeigename („Wetzlar Kernstadt“), die Einstufung als Kerngebiet und die Kurzbeschreibung. Die drei
 * Betriebsaussagen (Nauborn, Braunfels, Gießen) bleiben zurückgehalten (MENSCHEN M-016, components/maps/views.ts).
 */
export interface RegionalLocation {
  id: string;
  name: string;
  slug: string;
  plz: string;
  /** Straßenstrecke Ortsmitte → Firmensitz, ganze km (Messung). */
  distanceKm: number;
  /** Fahrzeit ohne Verkehrslage, ganze Minuten (Messung). */
  commuteMinutes: number;
  latitude: number;
  longitude: number;
  isCoreZone: boolean;
  character: string;
  /** Ortsseite /einsatzgebiet/<slug>. */
  placePath: string;
}

interface HomeMapEntry {
  name: string;
  slug: string;
  isCoreZone: boolean;
  character: string;
}

/** Startseitenangaben je bisheriger ID (Stand lib/data/locations.ts@075aa71). */
const HOME_MAP: Readonly<Record<string, HomeMapEntry>> = Object.freeze({
  'loc-wetzlar-mitte': {
    name: 'Wetzlar Kernstadt',
    slug: 'wetzlar-kernstadt',
    isCoreZone: true,
    character: 'Firmensitz Siegmund-Hiepe-Str. 20 und historische Altstadt',
  },
  'loc-hermannstein': { name: 'Hermannstein', slug: 'hermannstein', isCoreZone: true, character: 'Wohn und Gewerbegebiet an der B277 und A480' },
  'loc-nauborn': {
    name: 'Nauborn',
    slug: 'nauborn',
    isCoreZone: true,
    character: 'Einfamilienhausgebiete mit vielen Wärmepumpenmodernisierungen',
  },
  'loc-garbenheim': { name: 'Garbenheim', slug: 'garbenheim', isCoreZone: true, character: 'Lahnauen und ruhige Wohnsiedlungen' },
  'loc-dutenhofen': { name: 'Dutenhofen', slug: 'dutenhofen', isCoreZone: true, character: 'Verbindung nach Gießen über die B49' },
  'loc-steindorf': { name: 'Steindorf', slug: 'steindorf', isCoreZone: true, character: 'Traditionelle Wohnsiedlungen und Neubauviertel' },
  'loc-asslar': { name: 'Aßlar', slug: 'asslar', isCoreZone: false, character: 'Industrie und Wohnstandort im Dilltal' },
  'loc-braunfels': {
    name: 'Braunfels',
    slug: 'braunfels',
    isCoreZone: false,
    character: 'Schlossstadt mit anspruchsvollen Sanierungsobjekten',
  },
  'loc-giessen': { name: 'Gießen', slug: 'giessen', isCoreZone: false, character: 'Universitätsstadt und wichtiges Kundendienstgebiet' },
  'loc-herborn': { name: 'Herborn', slug: 'herborn', isCoreZone: false, character: 'Historische Fachwerkstadt an der A45' },
});

export const regionalLocations: RegionalLocation[] = HOME_MAP_PLACES.map((place) => {
  const id = place.legacyLocationId;
  const entry = HOME_MAP[id];
  if (!entry) throw new Error(`Ort ${place.id} steht auf der Startseitenkarte, aber ohne Eintrag in lib/data/locations.ts`);
  return {
    id,
    name: entry.name,
    slug: entry.slug,
    plz: place.postalCode,
    distanceKm: place.distanceKm,
    commuteMinutes: place.minutes,
    latitude: place.lat,
    longitude: place.lng,
    isCoreZone: entry.isCoreZone,
    character: entry.character,
    placePath: place.path,
  };
});
