import { describe, expect, it } from 'vitest';

import type { NormalizedFollowUp, ReferencedApplication } from '@/lib/applications/types';
import { LEGAL_ENTITY } from '@/components/legal/legal-data';
import {
  EMAIL_COLORS,
  MESSAGE_LABEL,
  cleanSubject,
  greetingName,
  renderApplicationConfirmationEmail,
  renderApplicationFollowUpEmail,
  renderApplicationTeamEmail,
  renderEmail,
  type RenderedEmail,
} from '@/lib/email/templates';

const XSS = '<script>alert(1)</script>';

const base: ReferencedApplication = {
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

const full: ReferencedApplication = {
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

const hostile: ReferencedApplication = {
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

function expectClean(text: string) {
  expect(text).not.toMatch(/\bundefined\b/);
  expect(text).not.toMatch(/\bnull\b/);
  expect(text).not.toMatch(/\bNaN\b/);
  expect(text).not.toContain('[object Object]');
}

describe('team notification', () => {
  it('builds the subject from reference, short title and first name', () => {
    expect(renderApplicationTeamEmail(base).subject).toBe('Neue Bewerbung BE-26-K7M4QX: Anlagenmechaniker SHK – Max');
  });

  it('flags suspected spam in subject and body', () => {
    const mail = renderApplicationTeamEmail({ ...base, suspectedSpam: true, spamSignals: ['fast'], fillDurationMs: 1200 });
    expect(mail.subject).toBe('[Spamverdacht] Neue Bewerbung BE-26-K7M4QX: Anlagenmechaniker SHK – Max');
    expect(mail.text).toContain('Spamverdacht: Das Formular wurde in 1,2 Sekunden ausgefüllt. Bitte kurz prüfen, bevor du antwortest.');
    expect(mail.html).toContain('Spamverdacht');
  });

  it('names the honeypot as reason and says that no confirmation went out', () => {
    const mail = renderApplicationTeamEmail({ ...full, suspectedSpam: true, spamSignals: ['honeypot'] });
    expect(mail.subject).toMatch(/^\[Spamverdacht\] /);
    expect(mail.text).toContain('Ein für Menschen unsichtbares Feld wurde ausgefüllt');
    expect(mail.text).toContain('An die angegebene E-Mail-Adresse ging keine Eingangsbestätigung.');
    expect(mail.text).not.toContain('Sekunden ausgefüllt');
  });

  it('labels the Quereinstieg answers distinctly', () => {
    const quereinstieg = { ...base.job, id: 'quereinsteiger-montagehelfer' as const, questionSet: 'quereinstieg' as const };
    const text = (background: string) =>
      renderApplicationTeamEmail({ ...base, job: quereinstieg, answers: { background, licenseB: 'yes', start: 'sofort' } }).text;
    expect(text('handwerk')).toContain('Aktuell: Im Handwerk (anderes Gewerk)');
    expect(text('andere-branche')).toContain('Aktuell: In einer anderen Branche');
    expect(text('etwas-anderes')).toContain('Aktuell: Gerade etwas anderes');
  });

  it('renders answers as labels, contact links, Mappe, source and Berlin time', () => {
    const mail = renderApplicationTeamEmail(full);
    expect(mail.text).toContain('Qualifikation: Geselle, über 5 Jahre');
    expect(mail.text).toContain('Start: In 1–3 Monaten (Kündigungsfrist)');
    expect(mail.html).toContain('href="tel:+4915123456789"');
    expect(mail.html).toContain('https:&#x2F;&#x2F;wa.me&#x2F;4915123456789');
    expect(mail.text).toContain('https://wa.me/4915123456789');
    expect(mail.text).toContain('Am liebsten per: E-Mail');
    expect(mail.text).toContain('Referenz: SHK-WP-2026-01');
    expect(mail.text).toContain('Kanal: Indeed');
    expect(mail.text).toContain('utm_campaign: anlagenmechaniker-shk');
    expect(mail.text).toContain('Empfehlungscode: koch');
    expect(mail.text).toContain('Ruhig und genau');
    expect(mail.text).toContain('2019–2024 · Geselle · Muster GmbH, Gießen');
    expect(mail.text).toContain('Eingegangen: 08.10.2026, 14:05 Uhr');
    expect(mail.text).toContain('Ausfülldauer: 41 Sekunden');
    expect(mail.html).toContain('Sehr geehrter Herr Demir,<br>ich bewerbe mich.');
  });

  it('describes an initiative application without a job reference', () => {
    const mail = renderApplicationTeamEmail({
      ...base,
      job: { id: 'initiativ', title: 'Initiativbewerbung', shortTitle: 'Initiativbewerbung', questionSet: 'fachkraft' },
    });
    expect(mail.subject).toBe('Neue Bewerbung BE-26-K7M4QX: Initiativbewerbung – Max');
    expect(mail.text).toContain('hat sich initiativ beworben');
    expect(mail.text).not.toContain('Referenz:');
  });

  it('keeps an unparseable phone number and asks the team to check it', () => {
    const mail = renderApplicationTeamEmail({ ...base, phone: { raw: '12 34 56 78 90 12 34', display: '12 34 56 78 90 12 34', valid: false } });
    expect(mail.text).toContain('12 34 56 78 90 12 34 (nicht automatisch erkannt, bitte prüfen)');
    expect(mail.text).not.toContain('wa.me');
  });

  it('never contains undefined, null or NaN for minimal and full applications', () => {
    for (const app of [base, full]) {
      const mail = renderApplicationTeamEmail(app);
      expectClean(mail.html);
      expectClean(mail.text);
      expectClean(mail.subject);
    }
  });

  it('escapes all user input in the HTML', () => {
    const mail = renderApplicationTeamEmail(hostile);
    expect(mail.html).not.toContain('<script');
    expect(mail.html).toContain('&lt;script&gt;');
    expectClean(mail.html);
  });
});

describe('applicant confirmation', () => {
  it('thanks, names the reference and lists the next steps without marketing', () => {
    const mail = renderApplicationConfirmationEmail(full);
    expect(mail.subject).toBe('Deine Bewerbung bei Bad und Energie: BE-26-K7M4QX');
    expect(mail.text).toContain('Danke, Max.');
    expect(mail.text).toContain('Bewerbungsnummer: BE-26-K7M4QX');
    expect(mail.text).toContain('Wir melden uns schnellstmöglich per E-Mail bei dir.');
    expect(mail.text).toContain('1. Bewerben in 60 Sekunden (erledigt)');
    expect(mail.text).toContain('2. Kennenlernen in der Werkstatt');
    expect(mail.text).toContain('06441 42956');
    expectClean(mail.html);
    expectClean(mail.text);
  });

  it('uses the training steps for apprenticeships', () => {
    const mail = renderApplicationConfirmationEmail({
      ...full,
      job: { ...full.job, id: 'ausbildung-anlagenmechaniker-shk', questionSet: 'ausbildung' },
    });
    expect(mail.text).toContain('Start mit eigenem Werkzeug');
    // Schülerinnen und Schüler haben keinen Arbeitgeber: keine Diskretionszusage, kein „Feierabend“-Treffen.
    expect(mail.text).not.toContain('derzeitigen Arbeitgeber');
    expect(mail.text).toContain('über die Ausbildung und deine Fragen');
  });

  it('keeps the discretion promise for skilled workers', () => {
    expect(renderApplicationConfirmationEmail(full).text).toContain('derzeitigen Arbeitgeber');
  });

  it('escapes the first name', () => {
    const mail = renderApplicationConfirmationEmail(hostile);
    expect(mail.html).not.toContain('<script');
    expectClean(mail.html);
  });

  it('never echoes a URL or other free text as the name (unverified address)', () => {
    const mail = renderApplicationConfirmationEmail({ ...full, name: 'https://evil.example/gewinn Bot', firstName: 'https://evil.example/gewinn' });
    expect(mail.text).toContain('Danke für deine Bewerbung.');
    expect(mail.text).not.toContain('evil');
    expect(mail.html).not.toContain('evil');
    expect(renderApplicationConfirmationEmail(hostile).text).not.toContain('script');
  });

  it.each([
    ['Max', 'Max'],
    ['Anna-Lena', 'Anna-Lena'],
    ["O'Brien", "O'Brien"],
    ['Çağla', 'Çağla'],
    ['José María', 'José María'],
    ['evil.example', null],
    ['www', null],
    ['Httpsgewinn', null],
    ['Max1', null],
    ['Max:', null],
    ['-Max', null],
    ['x'.repeat(41), null],
    ['', null],
  ])('greetingName(%j) → %j', (input, expected) => {
    expect(greetingName(input)).toBe(expected);
  });
});

describe('follow-up mail', () => {
  const followUp: NormalizedFollowUp = {
    reference: 'BE-26-K7M4QX',
    idempotencyKey: 'hash',
    receivedAt: new Date('2026-10-09T08:00:00Z'),
    startDate: '01.12.2026',
    postalCode: '35578',
    message: `Hallo ${XSS}\nbis bald`,
    mappe: hostile.mappe,
  };

  it('has the reference in the subject and the details in the body', () => {
    const mail = renderApplicationFollowUpEmail(followUp);
    expect(mail.subject).toBe('Ergänzung zu BE-26-K7M4QX');
    expect(mail.text).toContain('Frühester Start: 01.12.2026');
    expect(mail.text).toContain('PLZ: 35578');
    expect(mail.text).toContain('bis bald');
    expect(mail.html).not.toContain('<script');
    expectClean(mail.html);
    expectClean(mail.text);
  });

  it('is deterministic for identical content (Resend idempotency across instances)', () => {
    const a = renderApplicationFollowUpEmail(followUp);
    const b = renderApplicationFollowUpEmail({ ...followUp, receivedAt: new Date('2026-10-10T08:00:00Z') });
    expect(a).toEqual(b);
  });

  it('renders only the provided fields', () => {
    const mail = renderApplicationFollowUpEmail({ reference: 'BE-26-K7M4QX', idempotencyKey: 'h', receivedAt: new Date(), postalCode: '35578' });
    expect(mail.text).not.toContain('Frühester Start');
    expect(mail.text).not.toContain('Bewerbungsmappe');
    expectClean(mail.text);
  });
});

describe('layout helpers', () => {
  it('strips line breaks and control characters from subjects', () => {
    expect(cleanSubject('Neue Bewerbung\r\nBcc: x@example.org')).toBe('Neue Bewerbung Bcc: x@example.org');
  });

  it('drops unsafe link schemes and empty rows', () => {
    const mail = renderEmail({
      subject: 'Test',
      preheader: 'Test',
      blocks: [
        { type: 'rows', rows: [{ label: 'Link', value: 'klick', href: 'javascript:alert(1)' }, { label: 'Leer', value: '' }] },
        { type: 'button', href: 'javascript:alert(1)', label: 'Böse' },
      ],
    });
    expect(mail.html).not.toContain('javascript:');
    expect(mail.text).not.toContain('Leer');
    expect(mail.text).not.toContain('Böse');
  });

  it('uses no all-caps styling', () => {
    expect(renderApplicationTeamEmail(full).html).not.toMatch(/text-transform:\s*uppercase/);
  });
});

// E-BEW-025: Pflichtangaben im Fuß, wortgleich zum Impressum (LEGAL_ENTITY).
describe('mandatory footer', () => {
  const followUp: NormalizedFollowUp = { reference: 'BE-26-K7M4QX', idempotencyKey: 'h', receivedAt: new Date(), message: 'Hallo' };
  const mails: Array<[string, RenderedEmail]> = [
    ['team (Fachkraft)', renderApplicationTeamEmail(full)],
    ['team (Ausbildung)', renderApplicationTeamEmail({ ...base, job: { ...base.job, id: 'ausbildung-anlagenmechaniker-shk', questionSet: 'ausbildung' } })],
    ['team (Quereinstieg)', renderApplicationTeamEmail({ ...base, job: { ...base.job, id: 'quereinsteiger-montagehelfer', questionSet: 'quereinstieg' } })],
    ['team (Spamverdacht)', renderApplicationTeamEmail({ ...base, suspectedSpam: true, spamSignals: ['honeypot'] })],
    ['confirmation', renderApplicationConfirmationEmail(full)],
    ['follow-up with Mappe', renderApplicationFollowUpEmail({ ...followUp, mappe: full.mappe })],
  ];

  it.each(mails)('%s names company, address, managing director and register in HTML and text', (_, mail) => {
    const lines = [
      LEGAL_ENTITY.name,
      `${LEGAL_ENTITY.street} · ${LEGAL_ENTITY.postalCodeCity}`,
      `Geschäftsführer: ${LEGAL_ENTITY.managingDirector}`,
      `Registergericht: ${LEGAL_ENTITY.registerCourt} · Registernummer: ${LEGAL_ENTITY.registerNumber}`,
    ];
    for (const line of lines) {
      expect(mail.text).toContain(line);
      expect(mail.html).toContain(line);
    }
    expect(mail.text).toContain('Geschäftsführer: Diplomingenieur Sabri Demir');
  });
});

describe('palette (Einstieg design)', () => {
  const mail = renderApplicationTeamEmail(full);

  it('uses system fonts only, no web fonts', () => {
    expect(mail.html).not.toContain('Inter');
    expect(mail.html).not.toMatch(/@font-face|fonts\.googleapis/);
  });

  it('frames the card with a navy head, the red supply line and the blue return line', () => {
    expect(mail.html).toContain(`background-color: ${EMAIL_COLORS.brand}`);
    expect(mail.html).toContain(`background-color: ${EMAIL_COLORS.accent}`);
    expect(mail.html).toContain(`background-color: ${EMAIL_COLORS.ruecklauf}`);
  });

  it('uses red only as a line, never as a text colour or a button face', () => {
    expect(mail.html).not.toMatch(new RegExp(`(?<!-)color: ${EMAIL_COLORS.accent}`));
    const button = mail.html.match(/<a href="[^"]*" style="display: inline-block;[^"]*"/)?.[0] ?? '';
    expect(button).toContain(EMAIL_COLORS.onBrand);
    expect(mail.html).toMatch(new RegExp(`border-radius: 4px; background-color: ${EMAIL_COLORS.brand};`));
  });
});

// E-BEW-015 (Mail-Anteil): Ergänzung und Wunschkonditionen als ein Block in der Team-Mail.
describe('follow-up block', () => {
  const mail = renderApplicationFollowUpEmail({
    reference: 'BE-26-K7M4QX',
    idempotencyKey: 'h',
    receivedAt: new Date(),
    startDate: '01.12.2026',
    postalCode: '35578',
    message: 'Gern Vollzeit, Firmenwagen wäre schön.',
  });

  it('groups start date, postcode and message under „Ergänzung“', () => {
    const block = mail.text.slice(mail.text.indexOf('Ergänzung\n='));
    expect(block).toContain('Frühester Start: 01.12.2026');
    expect(block).toContain('PLZ: 35578');
    expect(block).toContain(MESSAGE_LABEL);
    expect(block).toContain('Gern Vollzeit, Firmenwagen wäre schön.');
    expect(MESSAGE_LABEL).toContain('Wunschkonditionen');
    expect(mail.html).toContain('>Ergänzung<');
  });

  it('leaves the block out when nothing but the Mappe was added', () => {
    const onlyMappe = renderApplicationFollowUpEmail({ reference: 'BE-26-K7M4QX', idempotencyKey: 'h', receivedAt: new Date(), mappe: full.mappe });
    expect(onlyMappe.text).not.toContain('Ergänzung\n=');
    expect(onlyMappe.text).toContain('Bewerbungsmappe');
  });
});

