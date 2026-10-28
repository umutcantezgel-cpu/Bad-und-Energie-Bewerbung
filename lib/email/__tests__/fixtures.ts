import type { NormalizedFollowUp, ReferencedApplication } from '@/lib/applications/types';
import { CONTACT_LIMITS, MAPPE_SCHEMA_LIMITS } from '@/lib/applications/constants';
import { ATTRIBUTION_LIMITS } from '@/lib/attribution/sanitize';
import {
  renderApplicationConfirmationEmail,
  renderApplicationFollowUpEmail,
  renderApplicationTeamEmail,
  type RenderedEmail,
} from '@/lib/email/templates';

/**
 * Testdaten der Bewerbungs-Mails, geteilt von templates.test.ts, mail-lint.test.ts und dem Vorschau-Werkzeug
 * (scripts/email/vorschau.ts). Keine *.test.ts-Datei: Vitest führt sie nicht selbst aus.
 */

export const XSS = '<script>alert(1)</script>';

export const base: ReferencedApplication = {
  reference: 'BE-26-K7M4QX',
  idempotencyKey: '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60',
  submittedAt: new Date('2026-10-08T12:05:00Z'),
  job: {
    id: 'anlagenmechaniker-shk',
    title: 'Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)',
    shortTitle: 'Anlagenmechaniker SHK',
    referenceCode: 'SHK-WP-2026-01',
    questionSet: 'fachkraft',
    status: 'published',
  },
  answers: {},
  name: 'Max Muster',
  firstName: 'Max',
  phone: { raw: '0151 23456789', e164: '+4915123456789', display: '01512 3456789', valid: true, country: 'DE' },
  contactChannel: 'whatsapp',
  attribution: {},
  channel: 'direct',
  privacyNoticeVersion: '2026-10',
  suspectedSpam: false,
  spamSignals: [],
};

export const full: ReferencedApplication = {
  ...base,
  answers: { qualification: 'geselle-ueber-5', start: '1-3-monate' },
  email: 'max@example.org',
  contactChannel: 'email',
  fillDurationMs: 41_000,
  mappe: {
    coverLetter: 'Sehr geehrter Herr Demir,\nich bewerbe mich.',
    skills: ['Wärmepumpen', 'Löten'],
    workStyle: 'Ruhig und genau',
    careerStations: [
      { period: '2019–2024', role: 'Geselle', company: 'Muster GmbH', location: 'Gießen', tasks: ['Heizungsbau'] },
    ],
    educationStations: [{ period: '2016–2019', degree: 'Ausbildung SHK', institution: 'Berufsschule Wetzlar' }],
  },
  attribution: {
    utmSource: 'indeed',
    utmMedium: 'jobboard',
    utmCampaign: 'anlagenmechaniker-shk',
    ref: 'koch',
    referrerHost: 'de.indeed.com',
    landingPath: '/jobs/anlagenmechaniker-shk-wetzlar',
    funnel: 'stellenseite',
  },
  channel: 'indeed',
};

export const hostile: ReferencedApplication = {
  ...full,
  name: `Eve ${XSS}`,
  firstName: `Eve${XSS}`,
  email: 'eve@example.org',
  phone: { raw: `${XSS}`, display: `${XSS}`, valid: false },
  answers: { qualification: XSS },
  mappe: {
    coverLetter: XSS,
    skills: [XSS],
    workStyle: XSS,
    careerStations: [{ period: XSS, role: XSS, company: XSS, location: XSS, tasks: [XSS] }],
    educationStations: [{ period: XSS, degree: XSS, institution: XSS, location: XSS }],
  },
  attribution: { utmSource: XSS, landingPath: `/${XSS}`, funnel: XSS },
};

// ---------------------------------------------------------------------------
// Alles am Schema-Maximum: realistischer deutscher Text statt Füllzeichen, damit Umbrüche echt aussehen.
// ---------------------------------------------------------------------------

/** Wiederholt `text` (durch Leerzeichen getrennt) und kürzt auf genau `length` Zeichen. */
function bis(text: string, length: number): string {
  let out = text;
  while (out.length < length) out = `${out} ${text}`;
  return out.slice(0, length).trimEnd().padEnd(length, '.');
}

const SATZ =
  'Ich habe in den letzten Jahren Wärmepumpen geplant, montiert und in Betrieb genommen, Bäder vollständig saniert und Kunden ruhig beraten.';

/** Anschreiben mit Absätzen und einer langen Adresse, insgesamt genau 6000 Zeichen. */
function anschreiben(): string {
  const url = 'https://www.beispiel-handwerk-referenzen.de/projekte/waermepumpe-einfamilienhaus-wetzlar-2025/fotos';
  const zeilen = ['Sehr geehrter Herr Demir,', '', `Meine Projekte finden Sie hier: ${url}`, ''];
  while (zeilen.join('\n').length < MAPPE_SCHEMA_LIMITS.coverLetter - 200) zeilen.push(SATZ);
  zeilen.push('', 'Mit freundlichen Grüßen', 'Maximilian Mustermann-Schneider');
  return zeilen.join('\n').slice(0, MAPPE_SCHEMA_LIMITS.coverLetter);
}

const LIMITS = MAPPE_SCHEMA_LIMITS;

export const maximal: ReferencedApplication = {
  ...full,
  name: bis('Maximilian Alexander Konstantin Mustermann-Schneider von Hohenfeld', CONTACT_LIMITS.name),
  firstName: 'Maximilian',
  // Lange, aber gültige Adresse ohne Bindestrich-Bruchstellen: der schwerste Fall für den Umbruch.
  email: `${'maximilian.mustermann'.padEnd(64, 'x')}@${'bewerbungen'.padEnd(60, 'y')}.example.org`,
  phone: { raw: '+49 160 123456789012', display: '+49 160 123456789012 (Durchwahl 4711, abends ab 18 Uhr)', valid: false },
  mappe: {
    coverLetter: anschreiben(),
    skills: Array.from({ length: LIMITS.skills }, (_, i) => bis(`Schwerpunkt ${i + 1}: Wärmepumpen Luft/Wasser, Hydraulik und Regelung`, LIMITS.skill)),
    workStyle: bis('Ich arbeite sauber, plane voraus und spreche Probleme früh an.', LIMITS.workStyle),
    careerStations: Array.from({ length: LIMITS.careerStations }, (_, i) => ({
      period: bis(`${2026 - i - 1}–${2026 - i} (Vollzeit, unbefristet)`, LIMITS.period),
      role: bis('Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik', LIMITS.role),
      company: bis(`Musterbetrieb ${i + 1} Haustechnik GmbH & Co. KG`, LIMITS.company),
      location: bis('Wetzlar-Niedergirmes im Lahn-Dill-Kreis', LIMITS.location),
      tasks: Array.from({ length: LIMITS.tasks }, (_, t) => bis(`Aufgabe ${t + 1}: ${SATZ}`, LIMITS.task)),
    })),
    educationStations: Array.from({ length: LIMITS.educationStations }, (_, i) => ({
      period: bis(`${2016 - i * 2}–${2018 - i * 2}`, LIMITS.period),
      degree: bis('Gesellenprüfung Anlagenmechaniker SHK, Abschluss mit Auszeichnung', LIMITS.degree),
      institution: bis('Werner-von-Siemens-Schule, Berufliche Schule des Lahn-Dill-Kreises', LIMITS.institution),
      location: bis('Wetzlar', LIMITS.location),
    })),
  },
  attribution: {
    utmSource: 'a'.repeat(ATTRIBUTION_LIMITS.utmSource),
    utmMedium: 'jobboard'.padEnd(ATTRIBUTION_LIMITS.utmMedium, 'x'),
    utmCampaign: 'anlagenmechaniker_shk_herbst_2026'.padEnd(ATTRIBUTION_LIMITS.utmCampaign, 'z'),
    utmContent: 'anzeige.variante.b'.padEnd(ATTRIBUTION_LIMITS.utmContent, 'c'),
    utmTerm: 'waermepumpe'.padEnd(ATTRIBUTION_LIMITS.utmTerm, 't'),
    ref: 'k'.repeat(ATTRIBUTION_LIMITS.ref),
    referrerHost: `${'sub.'.repeat(60)}example.org`.slice(-ATTRIBUTION_LIMITS.referrerHost),
    landingPath: `/jobs/${'anlagenmechaniker-shk-wetzlar/'.repeat(12)}`.slice(0, ATTRIBUTION_LIMITS.landingPath),
    funnel: 'stellenseite'.padEnd(ATTRIBUTION_LIMITS.funnel, 'f'),
  },
};

const SPRACHEN = ['Deutsch', 'Türkisch', 'Englisch', 'Polnisch', 'Russisch', 'Arabisch'];

/**
 * Wie `maximal`, dazu alles aus „Mehr im Lebenslauf“ an den Grenzen und ein eigener Aufbau mit langen Titeln (L5 Teil B).
 * `maximal` selbst bleibt unverändert: Seine PDF-Prüfsummen stehen in lib/mappe/__tests__/pdf-basis.test.ts.
 */
export const maximalFrei: ReferencedApplication = {
  ...maximal,
  mappe: {
    ...maximal.mappe!,
    subject: bis('Bewerbung als Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d), Schwerpunkt Hydraulik', LIMITS.subject),
    profile: bis(`Kurzprofil: ${SATZ}`, LIMITS.profile),
    languages: SPRACHEN.slice(0, LIMITS.languages).map((sprache) => ({
      language: bis(`${sprache} in Wort und Schrift`, LIMITS.language),
      level: bis('Muttersprache, verhandlungssicher auf der Baustelle', LIMITS.languageLevel),
    })),
    drivingLicenses: ['AM', 'A1', 'B', 'BE', 'C1', 'C1E', 'C', 'CE'].slice(0, LIMITS.drivingLicenses),
    interests: bis(`Interessen: ${SATZ}`, LIMITS.interests),
    customText: bis(`Weiterbildungen und Zertifikate: ${SATZ}`, LIMITS.customText),
    sections: [
      { id: 'profile' },
      { id: 'skills' },
      { id: 'languages', title: bis('Sprachen und Verständigung mit Kunden auf der Baustelle', LIMITS.sectionTitle) },
      { id: 'career', title: 'Praxis' },
      { id: 'education' },
      { id: 'drivingLicenses' },
      { id: 'interests' },
      { id: 'custom', title: 'Weiterbildungen und Zertifikate' },
    ],
  },
};

export const ergaenzung: NormalizedFollowUp = {
  reference: 'BE-26-K7M4QX',
  idempotencyKey: 'h',
  receivedAt: new Date('2026-10-09T08:30:00Z'),
  startDate: '2026-12-01',
  postalCode: '35578',
  message: 'Gern Vollzeit, Firmenwagen wäre schön.\nIch kann ab Dezember anfangen.',
};

/** Absender wie lib/env.ts DEFAULT_FROM_EMAIL (lib/env importiert server-only und bleibt deshalb draußen). */
export const ABSENDER = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
/** Erste Adresse von CONTACT_NOTIFICATION_EMAIL (Standard). */
export const TEAM = 'info@bad-energie.de';

/** Hinweise auf die PDF im Anhang, wie lib/mappe/pdf/anhang.ts sie für diese Mappen liefert. */
export const PDF_FULL = { dateiname: 'Bewerbungsmappe_BE-26-K7M4QX_Muster.pdf', seiten: 2 } as const;
export const PDF_MAXIMAL = { dateiname: 'Bewerbungsmappe_BE-26-K7M4QX_M.pdf', seiten: 18 } as const;
export const PDF_ERGAENZUNG = { dateiname: 'Bewerbungsmappe_BE-26-K7M4QX.pdf', seiten: 18 } as const;

export interface MailVariante {
  name: string;
  to: string;
  replyTo?: string;
  render: () => RenderedEmail;
}

/** Jede Mail in den Fällen, die im Postfach vorkommen; Reply-To wie in lib/email/resend.ts. */
export const MAIL_VARIANTEN: readonly MailVariante[] = [
  { name: 'team-normal', to: TEAM, replyTo: full.email, render: () => renderApplicationTeamEmail({ ...full, mappe: undefined }) },
  {
    name: 'team-spam',
    to: TEAM,
    replyTo: full.email,
    render: () =>
      renderApplicationTeamEmail({ ...full, mappe: undefined, suspectedSpam: true, spamSignals: ['honeypot', 'fast'], fillDurationMs: 1200 }),
  },
  { name: 'team-ohne-email', to: TEAM, replyTo: TEAM, render: () => renderApplicationTeamEmail({ ...base, contactChannel: 'phone' }) },
  // Mit Mappe liegt sie als PDF im Anhang (lib/mappe/pdf/anhang.ts); die Mail nennt Dateiname und Seiten.
  { name: 'team-mappe', to: TEAM, replyTo: full.email, render: () => renderApplicationTeamEmail(full, PDF_FULL) },
  { name: 'team-maximal', to: TEAM, replyTo: maximal.email, render: () => renderApplicationTeamEmail(maximal, PDF_MAXIMAL) },
  // Mappe frei umgeschrieben (L5): eigener Aufbau, alle neuen Abschnitte an den Grenzen
  { name: 'team-mappe-frei', to: TEAM, replyTo: maximal.email, render: () => renderApplicationTeamEmail(maximalFrei, PDF_MAXIMAL) },
  { name: 'bestaetigung', to: full.email ?? '', replyTo: TEAM, render: () => renderApplicationConfirmationEmail(full) },
  { name: 'ergaenzung', to: TEAM, replyTo: TEAM, render: () => renderApplicationFollowUpEmail(ergaenzung) },
  {
    name: 'ergaenzung-mappe',
    to: TEAM,
    replyTo: TEAM,
    render: () => renderApplicationFollowUpEmail({ ...ergaenzung, mappe: maximal.mappe }, PDF_ERGAENZUNG),
  },
  {
    // Nur angetippte Praxiserfahrung von der Danke-Seite (reist als mappe.skills).
    name: 'ergaenzung-praxis',
    to: TEAM,
    replyTo: TEAM,
    render: () =>
      renderApplicationFollowUpEmail({
        ...ergaenzung,
        message: undefined,
        mappe: { coverLetter: '', skills: ['Wärmepumpen', 'Heizungstausch', 'Badsanierung'], careerStations: [], educationStations: [] },
      }),
  },
];
