import { HQ_OFFICE } from '../employer';
import { defineJob } from '../schema';

// Inhaber 2026-10-14 (fakten-abgleich S5): Bürofachkraft in Voll- oder Teilzeit, die vier Aufgaben im Wortlaut der
// Antwort. Anforderungen und Stundenrahmen sind offen (M-038): kein Abschnitt „Das bringst du mit“, keine Ausbildung
// und keine Berufserfahrung im JobPosting, bis der Inhaber sie nennt. Vorteile nur aus betriebsweit belegten Fakten.
// Arbeitsort ist das Büro am Firmensitz (REGION.milestone: „moderneres Büro“), ohne Baustellenradius.
export const buerofachkraft = defineJob({
  id: 'buerofachkraft',
  referenceCode: 'SHK-BU-2026-08',
  slug: 'buerofachkraft-wetzlar',
  status: 'published',
  category: 'buero',
  title: 'Bürofachkraft (m/w/d) in Voll- oder Teilzeit',
  titleShy: 'Büro­fach­kraft (m/w/d) in Voll- oder Teilzeit',
  shortTitle: 'Bürofachkraft',
  seo: {
    metaTitle: 'Bürofachkraft (m/w/d) Wetzlar – Voll- oder Teilzeit',
    metaDescription:
      'Bürofachkraft im SHK-Meisterbetrieb in Wetzlar, Voll- oder Teilzeit: Telefon und Termine, Angebote und Rechnungen, Material und Verwaltung.',
    h1: 'Bürofachkraft (m/w/d) in Wetzlar',
    primaryKeyword: 'Bürofachkraft Wetzlar',
    secondaryKeywords: ['Bürokraft Wetzlar', 'Bürojob Teilzeit Wetzlar', 'Büro Handwerksbetrieb Wetzlar'],
  },
  // Bürokraft und Büroassistent/in: dieselbe Berufsgattung (KldB 71402) im Schlüsselverzeichnis der BA.
  alsoKnownAs: ['Bürokraft', 'Büroassistenz'],
  summary: 'Du planst die Termine für Monteure und Kundendienst, schreibst Angebote und Rechnungen und bestellst das Material.',
  intro:
    'Als Bürofachkraft arbeitest du in unserem Büro am Firmensitz in Wetzlar, in Voll- oder Teilzeit. Du nimmst die Anrufe an, planst die Termine der Monteure und des Kundendienstes und kümmerst dich um Angebote, Rechnungen, Material und Verwaltung.',
  tasks: [
    'Telefon und Terminplanung für Monteure und Kundendienst',
    'Angebote, Auftragsbestätigungen und Rechnungen schreiben',
    'Material beim Großhandel bestellen und Lieferungen prüfen',
    'Allgemeine Verwaltung: Ablage, Post, Zuarbeit für die Geschäftsführung',
  ],
  requirements: [],
  requirementsOpen: 'M-038',
  benefitFactIds: ['flexibleHours', 'vacation30', 'founded1926', 'employees15'],
  employment: { kind: 'voll-oder-teilzeit', permanent: false, start: 'nach-absprache' },
  pay: 'auf-anfrage',
  location: HQ_OFFICE,
  datePosted: '2026-10-14',
  validThrough: '2027-01-12T00:00:00',
  updatedAt: '2026-10-14',
  apply: { questionSet: 'buero' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  // „Bürofachkraft“: KldB 71402 laut Schlüsselverzeichnis der BA, ISCO-08 4120 (lib/jobs/berufe.ts).
  beruf: { kldb: '71402', isco: '4120' },
});
