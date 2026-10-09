import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// funnel_only: im Bewerbungsflow wählbar, aber ohne Seite, Schema und Feed (ROADMAP §3.1).
// Kein Gehalt, weil keine Quelle eines nennt. Quellen (Stand 393df01): HeroExpressFunnel, QuizView,
// ROLE_CONFIGS.helfer (pricing.constants.ts), Footer.
export const quereinsteigerMontagehelfer = defineJob({
  id: 'quereinsteiger-montagehelfer',
  referenceCode: 'SHK-QE-2026-05',
  slug: 'quereinsteiger-montagehelfer-shk-wetzlar',
  status: 'funnel_only',
  category: 'helfer',
  title: 'Quereinsteiger und Montagehelfer SHK (m/w/d)',
  titleShy: 'Quer\u00ADeinsteiger und Montage\u00ADhelfer SHK (m/w/d)',
  shortTitle: 'Quereinstieg / Montagehelfer',
  seo: {
    metaTitle: 'Quereinsteiger & Montagehelfer SHK Wetzlar (m/w/d)',
    metaDescription:
      'Quereinstieg ins SHK-Handwerk in Wetzlar: als Montagehelfer mit Führerschein Klasse B, intensiver Einarbeitung und Meisterbegleitung. Jetzt bewerben.',
    h1: 'Quereinsteiger und Montagehelfer SHK (m/w/d)',
    primaryKeyword: 'Quereinsteiger SHK Wetzlar',
    secondaryKeywords: ['Montagehelfer Wetzlar', 'Helfer Heizung Sanitär Wetzlar'],
  },
  summary: 'Mit handwerklichem Geschick und Führerschein Klasse B steigst du ins SHK-Handwerk ein, mit intensiver Einarbeitung.',
  intro:
    'Als Quereinsteiger oder Montagehelfer unterstützt du unser Team auf der Baustelle. Mit handwerklichem Geschick, Führerschein Klasse B und intensiver Einarbeitung durch unsere Meister steigst du ins SHK-Handwerk ein.',
  tasks: ['Unterstützung des Montageteams auf der Baustelle'],
  requirements: ['Handwerkliches Geschick', 'Führerschein Klasse B'],
  benefitFactIds: ['vacation30', 'friday1330', 'noFarAssembly', 'noUnpaidOvertime'],
  packageExtras: [
    { label: 'Fahrzeug', text: 'Mitfahrt im Teamtransporter oder eigener Service-Caddy nach Absprache' },
    { label: 'Ausstattung', text: 'Vollständige Arbeitskleidung von Engelbert Strauss und Hilti-Basisausstattung' },
    { label: 'Vergütung', text: 'Faire, übertarifliche Bezahlung' },
  ],
  employment: { kind: 'vollzeit', permanent: true, start: 'nach-absprache' },
  location: HQ_LOCATION,
  experienceMonths: 0,
  datePosted: '2026-10-08',
  updatedAt: '2026-10-08',
  apply: { questionSet: 'quereinstieg' },
  channels: { googleJobs: false, indeedFeed: false, genericFeed: false, ba: false },
  teamQuoteId: 'demir',
});
