import { HQ_LOCATION } from '../employer';
import { defineJob } from '../schema';

// Seit 2026-10-14 veröffentlicht, mit Seite, JobPosting und Feeds (Inhaber, fakten-abgleich S3); vorher funnel_only.
// Lohn auf Anfrage wie bei allen Stellen (E-030). Quellen (Stand 393df01): HeroExpressFunnel, QuizView,
// ROLE_CONFIGS.helfer (pricing.constants.ts), Footer.
export const quereinsteigerMontagehelfer = defineJob({
  id: 'quereinsteiger-montagehelfer',
  referenceCode: 'SHK-QE-2026-05',
  slug: 'quereinsteiger-montagehelfer-shk-wetzlar',
  status: 'published',
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
  alsoKnownAs: ['Helfer Sanitär und Heizung', 'Installateurhelfer', 'Heizungsbauerhelfer'],
  summary: 'Mit handwerklichem Geschick und Führerschein Klasse B steigst du ins SHK-Handwerk ein, mit intensiver Einarbeitung.',
  intro:
    'Als Quereinsteiger oder Montagehelfer unterstützt du unser Team auf der Baustelle. Mit handwerklichem Geschick, Führerschein Klasse B und intensiver Einarbeitung durch unsere Meister steigst du ins SHK-Handwerk ein.',
  tasks: ['Unterstützung des Montageteams auf der Baustelle'],
  requirements: ['Handwerkliches Geschick', 'Führerschein Klasse B'],
  benefitFactIds: ['vacation30', 'flexibleHours', 'noFarAssembly', 'noUnpaidOvertime'],
  packageExtras: [
    { label: 'Fahrzeug', text: 'Mitfahrt im Teamtransporter oder eigener Service-Caddy nach Absprache' },
    { label: 'Ausstattung', text: 'Vollständige Arbeitskleidung von Engelbert Strauss und Hilti-Basisausstattung' },
    { label: 'Vergütung', text: 'Faire, übertarifliche Bezahlung' },
  ],
  employment: { kind: 'vollzeit', permanent: true, start: 'nach-absprache' },
  pay: 'auf-anfrage',
  location: HQ_LOCATION,
  experienceMonths: 0,
  datePosted: '2026-10-08',
  validThrough: '2027-01-12T00:00:00',
  updatedAt: '2026-10-14',
  apply: { questionSet: 'quereinstieg' },
  channels: { googleJobs: true, indeedFeed: true, genericFeed: true, ba: true },
  // Heizungsbauerhelfer/in, Klempner- und Installateurhelfer/in: KldB 34201, ISCO-08 9313 (lib/jobs/berufe.ts).
  beruf: { kldb: '34201', isco: '9313' },
  // Zitat Demir ausgeblendet, bis der Inhaber ein neues freigibt (fakten-abgleich B30).
});
