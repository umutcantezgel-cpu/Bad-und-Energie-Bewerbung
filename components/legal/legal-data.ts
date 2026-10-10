import { COMPANY } from '@/lib/content';

/**
 * Angaben für Impressum und Datenschutzerklärung, damit beide Seiten dieselben Daten zeigen.
 * Betriebsdaten kommen aus '@/lib/content' (COMPANY); hier stehen nur Angaben, die es bisher
 * ausschließlich auf den Rechtsseiten gab. Änderungen: docs/operations/datenschutz-aenderungen.md.
 */
export const LEGAL_ENTITY = Object.freeze({
  name: COMPANY.legalName,
  street: COMPANY.address.street,
  postalCodeCity: `${COMPANY.address.postalCode} ${COMPANY.address.city}`,
  country: COMPANY.address.countryName,
  /** „Diplomingenieur Sabri Demir“, wie bisher im Impressum. */
  managingDirector: COMPANY.managingDirector.fullName,
  /** Verantwortlich nach § 18 Abs. 2 MStV („Sabri Demir“). */
  contentResponsible: COMPANY.managingDirector.name,
  phone: COMPANY.phone,
  fax: COMPANY.fax,
  email: COMPANY.email,
  emailHref: COMPANY.emailHref,
  website: COMPANY.website,
  registerCourt: COMPANY.register.court,
  registerNumber: COMPANY.register.number,
  /**
   * Wie bisher im Impressum. Widerspricht SITE_CONFIG.vatID („DE301642296“): Owner-Frage, siehe
   * docs/operations/datenschutz-aenderungen.md und fakten-abgleich.md B1. Nicht eigenmächtig ändern.
   */
  vatId: 'DE 346 648 448',
  /** Postfach für Datenschutzanfragen (bisherige Datenschutzerklärung). */
  privacyEmail: 'datenschutz@bad-energie.de',
});

/** Zuständige Handwerkskammer (bisheriges Impressum). */
export const CHAMBER = Object.freeze({
  name: COMPANY.hwk,
  street: 'Bierstadter Straße 45',
  postalCodeCity: '65189 Wiesbaden',
  phone: Object.freeze({ display: '0611 1360', href: 'tel:+496111360' }),
  email: 'info@hwk-wiesbaden.de',
  url: 'https://www.hwk-wiesbaden.de',
  profession:
    'Meisterbetrieb des SHK-Handwerks, Installateur und Heizungsbauer, verliehen in der Bundesrepublik Deutschland',
  rules: 'Handwerksordnung (HwO)',
});

/** Datenschutz-Aufsichtsbehörde in Hessen (bisherige Datenschutzerklärung). */
export const SUPERVISORY_AUTHORITY = Object.freeze({
  name: 'Der Hessische Beauftragte für Datenschutz und Informationsfreiheit (HBDI)',
  visitingAddress: 'Gustav-Stresemann-Ring 1, 65189 Wiesbaden',
  postalAddress: 'Postfach 3163, 65021 Wiesbaden',
  phone: Object.freeze({ display: '+49 611 1408-0', href: 'tel:+4961114080' }),
  fax: '+49 611 1408-900',
  email: 'poststelle@datenschutz.hessen.de',
  url: 'https://datenschutz.hessen.de',
});

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

/** Fassung des Datenschutzhinweises als Stand: „2026-10“ → „Oktober 2026“, „2026-10-10“ → „10. Oktober 2026“. */
export function formatNoticeDate(version: string): string {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(version.trim());
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  const day = match?.[3] ? Number(match[3]) : undefined;
  if (!match || !month || (day !== undefined && (day < 1 || day > 31))) return version;
  return day ? `${day}. ${month} ${match[1]}` : `${month} ${match[1]}`;
}

/** mailto-Link, optional mit Betreff. */
export function mailtoHref(address: string, subject?: string): string {
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}

/** Website-Adresse ohne Protokoll für die Anzeige, z. B. „bad-energie.de“. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
