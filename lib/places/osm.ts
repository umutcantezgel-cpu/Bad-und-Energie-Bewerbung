/**
 * Namensnennung der OpenStreetMap-Daten (Prüfung E-029, Runde 3): Die Verortung der Orte (Nominatim), Strecke und
 * Fahrzeit (OSRM) und die Fußwege zu den Haltestellen stammen aus OpenStreetMap und stehen unter der Open Database
 * License. ODbL 1.0 § 4.3 verlangt bei abgeleiteten Inhalten den Hinweis auf die Herkunft und die Lizenz; nach den
 * Attribution Guidelines der OSMF führt der Hinweis auf openstreetmap.org/copyright. Getrennt von der Nennung des
 * Fahrplans (gtfs.de, CC BY 4.0, lib/places/data/oepnv.json „quelle“). Leichtes Modul ohne Ortsdaten, damit auch der
 * Fuß jeder Seite es laden kann.
 */

/** Wortlaut wie in lib/places/data/oepnv.json („fusswege“.„daten“). */
export const OSM_NAMENSNENNUNG = '© OpenStreetMap-Mitwirkende, ODbL';

/** Urheberrecht und Lizenz der OpenStreetMap-Daten; der Linktext ist die Namensnennung selbst. */
export const OSM_LINK = Object.freeze({ label: OSM_NAMENSNENNUNG, href: 'https://www.openstreetmap.org/copyright' });

/** Unter Strecke und Fahrzeit: Ortsseiten, Kreis-Hubs, Gebietsseite. */
export const OSM_QUELLENZEILE = `Orte, Strecken und Fahrzeiten: ${OSM_NAMENSNENNUNG}.`;

/**
 * Fuß jeder Seite: Strecken und Fahrzeiten stehen auch auf der Startseite (Pendlerrechner), auf /jobs (Orte und
 * Fahrzeiten) und auf /bewerbung (Fahrzeit bis Wetzlar).
 */
export const OSM_FUSSZEILE = `Orte, Strecken, Fahrzeiten und Fußwege: ${OSM_NAMENSNENNUNG}.`;
