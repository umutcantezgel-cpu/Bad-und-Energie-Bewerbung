/**
 * Amtliche Berufsschlüssel der Stellen (Plan §C2), nachgeschlagen und nie geschätzt. Jede Stelle nennt in `beruf` die
 * KldB-2010-Berufsgattung; ISCO-08 nur dort, wo der Umsteigeschlüssel der BA eindeutig ist. Daraus baut
 * lib/jobs/jsonld.ts `occupationalCategory`.
 *
 * Quellen (Stand 2026-10-14):
 * - Zuordnung Tätigkeit → KldB: Schlüsselverzeichnis für die Angaben zur Tätigkeit, Ausgabe 2010, überarbeitete
 *   Fassung 2020, Stand März 2024 (Bundesagentur für Arbeit, arbeitsagentur.de/datei/schluesselverzeichnis-2010-
 *   stand-03-2024_ba047762.pdf): „Anlagenmechaniker/in – Sanitär-, Heizungs- und Klimatechnik“ 34212,
 *   „Heizungsbauerhelfer/in“ und „Klempner- und Installateurhelfer/in“ 34201, „Bauleitende/r Monteur/in (Gas- u.
 *   Wasserinstallation)“ 34293, „Kundendienstmonteur/in (Gas- u. Wasserinstallation)“ und „Wartungsmonteur/in
 *   (Heizungs-, Lüftungs- u. Klimaanlagen)“ 25132, „Bürofachkraft“ 71402. Auszubildende zählen mit ihrem Zielberuf,
 *   Praktikanten mit der Tätigkeit, die sie überwiegend ausüben (Hinweise des Verzeichnisses).
 * - Namen der Berufsgattungen: BIBB, KldB 2010 – Berufsgattungen (naa309_2020_berufsgruppenzuordnung_kldb2010_5.pdf)
 *   für 25132, 34212 und 71402; BA-Berufsaggregat „Bauberufe“ (statistik.arbeitsagentur.de) für 34201 und 34293.
 * - KldB → ISCO-08: Umsteigeschlüssel der Statistik der BA (KldB 2010 – Fassung 2020, 5-Steller → ISCO-08, 4-Steller,
 *   Stand 06.08.2021), wie ihn das BIBB im H-ETB-Umsteiger dokumentiert, mit den deutschen ISCO-Namen. 25132 hat dort
 *   keinen eindeutigen ISCO-Code (nur eine Handzuordnung zu 7412 „Elektromechaniker“, die für SHK nicht passt): darum
 *   ohne ISCO.
 * - BERUFENET-ID: nur nach Nachschlagen im BA-Portal (docs/operations/stellenboersen.md), bisher bei keiner Stelle.
 */

export const KLDB = Object.freeze({
  '25132': 'Technische Servicekräfte in Wartung und Instandhaltung – fachlich ausgerichtete Tätigkeiten',
  '34201': 'Klempnerei (ohne Spezialisierung) – Helfer',
  '34212': 'Berufe in der Sanitär-, Heizungs- und Klimatechnik – fachlich ausgerichtete Tätigkeiten',
  '34293': 'Aufsicht – Klempnerei, Sanitär-, Heizungs-, Klimatechnik',
  '71402': 'Büro- und Sekretariatskräfte (ohne Spezialisierung) – fachlich ausgerichtete Tätigkeiten',
} as const);
export type KldbCode = keyof typeof KLDB;
export const KLDB_CODES = Object.keys(KLDB) as [KldbCode, ...KldbCode[]];

export const ISCO = Object.freeze({
  '3123': 'Bauleiter',
  '4120': 'Sekretariatskräfte (allgemein)',
  '7126': 'Bauspengler und Sanitär- und Heizungsinstallateure',
  '9313': 'Hilfsarbeiter im Hochbau',
} as const);
export type IscoCode = keyof typeof ISCO;
export const ISCO_CODES = Object.keys(ISCO) as [IscoCode, ...IscoCode[]];

/** Umsteigeschlüssel der BA für die verwendeten Berufsgattungen; null = nicht eindeutig, dann ohne ISCO. */
export const KLDB_ZU_ISCO: Readonly<Record<KldbCode, IscoCode | null>> = Object.freeze({
  '25132': null,
  '34201': '9313',
  '34212': '7126',
  '34293': '3123',
  '71402': '4120',
});

/** „ISCO-08 7126: Bauspengler und …“ bzw. ohne eindeutigen ISCO-Code „KldB 2010 25132: Technische …“. */
export function berufKategorie(beruf: { kldb: KldbCode; isco?: IscoCode }): string {
  return beruf.isco ? `ISCO-08 ${beruf.isco}: ${ISCO[beruf.isco]}` : `KldB 2010 ${beruf.kldb}: ${KLDB[beruf.kldb]}`;
}
