import { companyData } from '@/lib/data/company';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { TEAM_QUOTES } from './team';

const whatsappNumber = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '');
const registerNumber = companyData.handelsregister.match(/HRB\s*\d+/)?.[0] ?? companyData.handelsregister;
const registerCourt = companyData.handelsregister.replace(registerNumber, '').trim();

/** Stammdaten für Seiten, Footer, Flow und Schema. Telefon nach DIN 5008. */
export const COMPANY = Object.freeze({
  name: companyData.name,
  legalName: companyData.legalName,
  shortName: 'Bad und Energie',
  foundingYear: companyData.foundingYear,
  address: Object.freeze({
    street: companyData.street,
    postalCode: companyData.postalCode,
    city: companyData.city,
    region: companyData.state,
    country: 'DE',
    countryName: companyData.country,
  }),
  geo: Object.freeze({ ...companyData.geo }),
  phone: Object.freeze({
    display: SITE_CONFIG.contact.telephone,
    e164: companyData.phone.link,
    href: `tel:${companyData.phone.link}`,
  }),
  fax: SITE_CONFIG.contact.telefax,
  email: companyData.email,
  emailHref: `mailto:${companyData.email}`,
  whatsapp: Object.freeze({
    display: SITE_CONFIG.contact.telephone,
    href: `https://api.whatsapp.com/send?phone=${whatsappNumber}`,
  }),
  openingHours: Object.freeze({
    weekdays: 'Montag bis Donnerstag 07:00–16:45 Uhr',
    friday: 'Freitag 07:00–13:30 Uhr',
    short: 'Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr',
    spec: Object.freeze([
      Object.freeze({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const,
        opens: SITE_CONFIG.contact.openingHours.opens,
        closes: SITE_CONFIG.contact.openingHours.closes,
      }),
      Object.freeze({
        days: ['Friday'] as const,
        opens: SITE_CONFIG.contact.openingHours.fridayOpens,
        closes: SITE_CONFIG.contact.openingHours.fridayCloses,
      }),
    ]),
  }),
  register: Object.freeze({
    full: companyData.handelsregister,
    number: registerNumber,
    court: registerCourt,
  }),
  innung: companyData.innung,
  hwk: companyData.hwk,
  /** Titel nach lib/data/team.ts (ROADMAP §13, Standard bis zur Klärung). */
  managingDirector: Object.freeze({
    name: TEAM_QUOTES.demir.name,
    fullName: TEAM_QUOTES.demir.fullName,
    title: TEAM_QUOTES.demir.role,
  }),
  website: SITE_CONFIG.consumerUrl,
  careerUrl: SITE_CONFIG.baseUrl,
});

export type Company = typeof COMPANY;
