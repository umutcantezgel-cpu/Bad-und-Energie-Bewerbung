import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Quellen: JobPosting SHK-PL-2026-03 (app/layout.tsx), Stellenkarte 03 (app/page.tsx),
// EXPERIENCE_MODIFIERS senior/meister (pricing.constants.ts). Im Gehaltsrechner gab es keine eigene Rolle.
export const obermonteurProjektleiterShk = defineJob({
  id: 'obermonteur-projektleiter-shk',
  referenceCode: 'SHK-PL-2026-03',
  slug: 'obermonteur-projektleiter-shk-wetzlar',
  status: 'published',
  category: 'projektleitung',
  title: 'Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)',
  titleShy: 'Ober\u00ADmonteur / Projekt\u00ADleiter SHK & Bad\u00ADsanierung (m/w/d)',
  shortTitle: 'Obermonteur / Projektleiter',
  seo: {
    metaTitle: 'Obermonteur / Projektleiter SHK Job Wetzlar (m/w/d)',
    metaDescription:
      'Obermonteur / Projektleiter SHK (m/w/d) in Wetzlar: Bäder & Heizungsprojekte eigenverantwortlich leiten, 4.400–5.600 €, 30 Tage Urlaub. Jetzt bewerben.',
    h1: 'Obermonteur / Projektleiter SHK (m/w/d) in Wetzlar',
    primaryKeyword: 'Obermonteur SHK Wetzlar',
    secondaryKeywords: [
      'Projektleiter SHK Wetzlar',
      'Obermonteur Badsanierung',
      'Bauleiter SHK Lahn-Dill',
      'Obermonteur Heizung Gießen',
    ],
  },
  summary: 'Du leitest Badsanierungen und Heizungsprojekte eigenverantwortlich, in direkter Abstimmung mit Sabri Demir.',
  intro:
    'Als Obermonteur oder Projektleiter führst du anspruchsvolle Badsanierungen und Heizungsmodernisierungen im Lahn-Dill-Kreis eigenverantwortlich. Du organisierst deine Baustellen frei, führst dein Team kollegial und stimmst dich direkt mit Dipl.-Ing. Sabri Demir ab.',
  tasks: [
    'Eigenverantwortliche Leitung von Badsanierungen und Heizungsmodernisierungen im 35-km-Radius',
    'Baustellenleitung für Komplettbäder und regenerative Großanlagen',
    'Kollegiale Führung deines Montageteams',
    'Digitale Baustellendokumentation',
  ],
  requirements: [
    'Abgeschlossene Ausbildung im SHK-Handwerk',
    'Mindestens drei Jahre Berufserfahrung',
    'Lust auf Führungsverantwortung im Team',
    'Selbstständige, zuverlässige Arbeitsweise',
  ],
  benefitFactIds: [
    'aboveTariff',
    'vacation30',
    'friday1330',
    'privateCarOnePercent',
    'fuelCard',
    'hilti',
    'directLine',
    'noFarAssembly',
    'permanentContract',
  ],
  packageExtras: [
    { label: 'Vergütung', text: 'Übertarifliche Vergütung mit Führungszulage und Erfolgsprämien' },
    { label: 'Freiheit', text: 'Freie Baustellenorganisation ohne Mikromanagement' },
    { label: 'Mitgestalten', text: 'Mit Meister- oder Technikerabschluss gestaltest du die Betriebsplanung mit' },
  ],
  employment: { kind: 'vollzeit', permanent: true, start: 'nach-absprache' },
  salary: { min: 4400, max: 5600, unit: 'MONTH', currency: 'EUR' },
  location: HQ_LOCATION,
  education: { credentialCategory: 'professional certificate', label: 'Abgeschlossene Ausbildung im SHK-Handwerk' },
  experienceMonths: 36,
  datePosted: '2026-03-01',
  validThrough: '2027-10-06T00:00:00',
  updatedAt: '2026-10-08',
  apply: { questionSet: 'fachkraft' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  teamQuoteId: 'koch',
});
