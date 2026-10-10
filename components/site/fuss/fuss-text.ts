import type { IconName } from '@/components/icons';
import { COMPANY } from '@/lib/content/company';
import { DEFAULT_WHATSAPP_MESSAGE, buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { APPLY_PATH } from '../nav';

/**
 * Texte und Wege des Fußes (R4-SHELL-02). Nur Stammdaten aus COMPANY und die Wege der Plattform, keine
 * neuen Aussagen. Die Spaltenköpfe stehen im DOM in Satzschreibung; die Versalien setzt `text-etikett`.
 */
export const FUSS_SPALTEN = {
  betrieb: { id: 'footer-betrieb', titel: 'Betrieb' },
  kontakt: { id: 'footer-kontakt', titel: 'Kontakt' },
  stellen: { id: 'footer-stellen', titel: 'Stellen' },
  rechtliches: { id: 'footer-rechtliches', titel: 'Rechtliches' },
} as const;

/** Abschnitt „Bewerbung über diese Website“ in /datenschutz (app/datenschutz/page.tsx, Chapter-ID). */
export const BEWERBERDATEN_ANKER = 'bewerberdaten';

export interface FussWeg {
  href: string;
  label: string;
}

/**
 * Rechtslinks in fester Reihenfolge. E-RECHT-008: „Datenschutz für Bewerbende“ springt direkt zum Abschnitt
 * mit den Bewerberdaten (der Altstand-Link „nach Paragraph 26 BDSG“ zeigte auf eine ID, die es nie gab).
 */
export const RECHTS_LINKS: readonly FussWeg[] = Object.freeze([
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: `/datenschutz#${BEWERBERDATEN_ANKER}`, label: 'Datenschutz für Bewerbende' },
]);

/** E-SHELL-008: beschrifteter Weg zur Kunden-Website (neuer Tab); darunter die Domain als Ziel-Hinweis. */
export const KUNDEN_WEBSITE = Object.freeze({
  href: COMPANY.website,
  label: 'Zur Kunden-Website',
  domain: COMPANY.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
});

export const ALLE_STELLEN: FussWeg = Object.freeze({ href: '/jobs', label: 'Alle Stellen' });

export interface FussKontakt {
  id: 'phone' | 'whatsapp' | 'email';
  href: string;
  /** Sichtbarer Text. */
  text: string;
  /** Vorsatz nur für Screenreader („Telefon“), damit die Nummer nicht allein steht. */
  vorsatz?: string;
  icon: IconName;
  extern?: boolean;
}

/**
 * Telefon, WhatsApp, E-Mail: dieselbe Reihenfolge wie ContactOptions (WCAG 3.2.6). E-SHELL-005: WhatsApp mit
 * vorbefülltem Text ohne Berufsangabe, neuer Tab. Der Fuß kennt den Pfad nicht (Root-Layout), darum der
 * neutrale Standardtext; im Fokusmodus (/bewerbung…) der Text zu den Bewerbungsschritten.
 */
export function fussKontakte({ fokus = false }: { fokus?: boolean } = {}): FussKontakt[] {
  const nachricht = fokus ? whatsAppMessageFor(APPLY_PATH) : DEFAULT_WHATSAPP_MESSAGE;
  const alle: FussKontakt[] = [
    { id: 'phone', href: COMPANY.phone.href, text: COMPANY.phone.display, vorsatz: 'Telefon', icon: 'phone' },
    { id: 'whatsapp', href: buildWhatsAppUrl(nachricht), text: 'WhatsApp Direktkontakt', icon: 'message-circle', extern: true },
    { id: 'email', href: COMPANY.emailHref, text: COMPANY.email, vorsatz: 'E-Mail', icon: 'mail' },
  ];
  // Im Fokusmodus nur die zwei schnellen Wege; die E-Mail steht auf den Seiten selbst.
  return fokus ? alle.filter((k) => k.id !== 'email') : alle;
}

/** Fußzeile jeder Seite: Firma, Register und Gericht, Innung (E-RECHT-007, E-SHELL-018). */
export function pflichtzeile(year: number): string {
  return `© ${year} ${COMPANY.legalName} · ${COMPANY.register.full} · ${COMPANY.innung}`;
}

export const NEUER_TAB = ' (öffnet in neuem Tab)';
