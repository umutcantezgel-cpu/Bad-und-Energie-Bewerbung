import { COMPANY } from '@/lib/content/company';
import { REGION } from '@/lib/content/region';
import { EINSATZGEBIET_PATH, findPublishedPlaceByName, placePath } from '@/lib/places/registry';
import { EINSATZGEBIET_LINK_LABEL } from '@/lib/places/text';

/**
 * Texte des Einsatzgebiets (R3-HOME-03), nur aus Belegtem: COMPANY, REGION (lib/content) und dem
 * Wortlaut des Altstands, den die Pässe als Wesenskern führen. Überschrift und Einleitung bleiben
 * REGION.headline und REGION.summary.
 */

/** Etikett über der Überschrift (Planbeschriftung). */
export const GEBIET_ETIKETT = 'Einsatzgebiet';

/**
 * REGION.headline satzweise („35 km um Wetzlar.“ / „Keine Fernmontage.“), damit die Überschrift an der
 * Satzgrenze umbricht und nie quer darüber (B Runde 1 setzt die Sätze als eigene Zeilen). Der Wortlaut bleibt.
 */
export function headlineSaetze(headline: string = REGION.headline): string[] {
  return headline.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/**
 * E-START-030: Karte „Firmensitz & Lager“ (Altstand app/page.tsx@f2e7eae:753-785: „Zentrale Werkstatt &
 * Logistiklager“). Belegt sind Büro und Lager (REGION.milestone); „Werkstatt“ ist offen beim Inhaber
 * (fakten-abgleich B31), bis dahin steht hier der belegte Wortlaut.
 * Kern sind Adresse und „Kurze Rüstzeiten“ (Pass, Freiraum). Nicht übernommen: das Badge „Optimal
 * angebunden via B49 & A45“ (nur indirekt gestützt), „Feste Partner Ausstellungen“ und die
 * Markenzeile (B15 offen, keine ungeklärten Markennamen).
 */
export const WERKSTATT = Object.freeze({
  title: 'Firmensitz & Lager',
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  ruestzeitTitle: 'Kurze Rüstzeiten',
  ruestzeitText: 'Morgens Material direkt am Lager einladen oder direkte Anfahrt zur Baustelle bei Großprojekten.',
});

/**
 * E-START-040: „Route in Google Maps öffnen“ als normaler Link (neuer Tab, ohne Tracking-Parameter,
 * ohne Referrer). Ziel sind die Koordinaten des Firmensitzes (COMPANY.geo); vor dem Klick lädt nichts.
 * Die Ortsseiten (E-028) geben den Messpunkt des Orts als Start mit (`origin`), damit Google denselben Weg rechnet.
 */
export const ROUTE_LABEL = 'Route in Google Maps öffnen';

type Koordinaten = { latitude: number; longitude: number };

export function routeUrl(geo: Koordinaten = COMPANY.geo, origin?: Koordinaten): string {
  const start = origin ? `&origin=${origin.latitude},${origin.longitude}` : '';
  return `https://www.google.com/maps/dir/?api=1${start}&destination=${geo.latitude},${geo.longitude}`;
}

/** Orte, die schon mit Entfernung und Fahrzeit in der Ortsliste stehen (Kernstadt zählt als Wetzlar). */
function namesWithCommute(): Set<string> {
  return new Set(REGION.locations.flatMap((location) => [location.name, location.name.split(' ')[0]]));
}

/**
 * E-START-029 und E-SHELL-021: Orte aus REGION.areas (SITE_CONFIG.serviceRegions), die nicht schon mit
 * Entfernung und Fahrzeit auf der Karte stehen, ohne Doppelungen, in Datenreihenfolge. Ihre Werte stehen auf
 * ihrer Ortsseite (E-028); die Zeile verlinkt sie.
 * „Hohenahr“ steht in keiner Quelle der Plattform und erscheint deshalb nicht.
 */
export function weitereOrte(): string[] {
  const known = namesWithCommute();
  const names = REGION.areas.flatMap((area) => area.cities).filter((name) => !known.has(name));
  return [...new Set(names)];
}

export const WEITERE_ORTE_TITLE = 'Auch bei uns im Einsatz';

export interface WeitererOrt {
  name: string;
  /** Ortsseite unter /einsatzgebiet; fehlt, wenn der Ort keine hat (seit E-028 hat jeder Ort aus REGION.areas eine). */
  href?: string;
}

/** Die weiteren Orte mit Link auf ihre Ortsseite, wo es eine gibt (E-028). */
export function weitereOrteMitSeite(): WeitererOrt[] {
  return weitereOrte().map((name) => {
    const place = findPublishedPlaceByName(name);
    return place ? { name, href: placePath(place) } : { name };
  });
}

/** Weg zur Gebietsseite unter den weiteren Orten (gleicher Wortlaut wie auf den Ortsseiten). */
export const ALLE_ORTE_LINK = Object.freeze({ href: EINSATZGEBIET_PATH, label: EINSATZGEBIET_LINK_LABEL });

/**
 * Hinweis unter den weiteren Orten, nach B Runde 1 („Dein Ort steht nicht in der Liste? … – ruf kurz
 * an.“). Ersetzt den alten Feldhinweis „… im Umkreis von 35 km um Wetzlar“, weil 35 km auf der
 * Startseite schon im Einstieg und in der Überschrift steht (Fakten höchstens zweimal je Seite).
 */
export const ORT_FEHLT = Object.freeze({
  question: 'Dein Ort steht nicht in der Liste?',
  action: 'Ruf kurz an:',
  phoneDisplay: COMPANY.phone.display,
  phoneHref: COMPANY.phone.href,
});
