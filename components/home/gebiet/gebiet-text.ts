import { COMPANY } from '@/lib/content/company';
import { REGION } from '@/lib/content/region';

/**
 * Texte des Einsatzgebiets (R3-HOME-03), nur aus Belegtem: COMPANY, REGION (lib/content) und dem
 * Wortlaut des Altstands, den die Pässe als Wesenskern führen. Überschrift und Einleitung bleiben
 * REGION.headline und REGION.summary.
 */

/** Etikett über der Überschrift (Planbeschriftung). */
export const GEBIET_ETIKETT = 'Einsatzgebiet';

/**
 * E-START-030: Karte „Zentrale Werkstatt & Logistiklager“ (Altstand app/page.tsx@f2e7eae:753-785).
 * Kern sind Adresse und „Kurze Rüstzeiten“ (Pass, Freiraum). Nicht übernommen: das Badge „Optimal
 * angebunden via B49 & A45“ (nur indirekt gestützt), „Feste Partner Ausstellungen“ und die
 * Markenzeile (B15 offen, keine ungeklärten Markennamen).
 */
export const WERKSTATT = Object.freeze({
  title: 'Zentrale Werkstatt & Logistiklager',
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  ruestzeitTitle: 'Kurze Rüstzeiten',
  ruestzeitText: 'Morgens Material direkt am Lager einladen oder direkte Anfahrt zur Baustelle bei Großprojekten.',
});

/**
 * E-START-040: „Route in Google Maps öffnen“ als normaler Link (neuer Tab, ohne Tracking-Parameter,
 * ohne Referrer). Ziel sind die Koordinaten des Firmensitzes (COMPANY.geo); vor dem Klick lädt nichts.
 */
export const ROUTE_LABEL = 'Route in Google Maps öffnen';

export function routeUrl(geo: { latitude: number; longitude: number } = COMPANY.geo): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${geo.latitude},${geo.longitude}`;
}

/** Orte, die schon mit Entfernung und Fahrzeit in der Ortsliste stehen (Kernstadt zählt als Wetzlar). */
function namesWithCommute(): Set<string> {
  return new Set(REGION.locations.flatMap((location) => [location.name, location.name.split(' ')[0]]));
}

/**
 * E-START-029 und E-SHELL-021: Orte aus REGION.areas (SITE_CONFIG.serviceRegions), die keine
 * Entfernung und Fahrzeit haben (B17: keine erfundenen Werte), ohne Doppelungen, in Datenreihenfolge.
 * „Hohenahr“ steht in keiner Quelle der Plattform und erscheint deshalb nicht.
 */
export function weitereOrte(): string[] {
  const known = namesWithCommute();
  const names = REGION.areas.flatMap((area) => area.cities).filter((name) => !known.has(name));
  return [...new Set(names)];
}

export const WEITERE_ORTE_TITLE = 'Auch bei uns im Einsatz';

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
