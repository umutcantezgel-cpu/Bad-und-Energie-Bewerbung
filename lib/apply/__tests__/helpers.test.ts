import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { applicationInputSchema, STORAGE_KEYS } from '@/lib/applications/schema';
import { getFunnelOptions } from '@/lib/jobs/registry';
import { CONTACT_MESSAGES, contactResolver, validateContact } from '../contact-schema';
import { editDistance, suggestEmail } from '../email-suggest';
import { formatBerlinDateTime, isWithinOpeningHours } from '../office-hours';
import { carryOverQuery, jobIdFromParam, legacyRedirectTarget, paramForJob, wantsDocuments } from '../params';
import { isPlausiblePhone, normalizePhoneInput } from '../phone';
import { parseMappe, parseSubmitted, readSubmitted, writeSubmitted, type StorageLike } from '../storage';
import { buildVCard, escapeVCardValue } from '../vcard';

describe('suggestEmail', () => {
  it.each([
    ['max@gmial.com', 'max@gmail.com'],
    ['max@gmail.con', 'max@gmail.com'],
    ['max@gmx.dee', 'max@gmx.de'],
    ['max@wbe.de', 'max@web.de'],
    ['max@tonline.de', 'max@t-online.de'],
    ['Max.Muster@Hotmial.com', 'Max.Muster@hotmail.com'],
    ['max@firma.con', 'max@firma.com'],
  ])('%s → %s', (input, expected) => {
    expect(suggestEmail(input)).toBe(expected);
  });

  it.each(['max@gmail.com', 'max@gmx.at', 'max@bad-energie.de', 'max@', 'max', '@gmail.com', ''])('no hint for %s', (input) => {
    expect(suggestEmail(input)).toBeNull();
  });

  it('counts a swap of two letters as one edit', () => {
    expect(editDistance('gmial', 'gmail')).toBe(1);
    expect(editDistance('web', 'web')).toBe(0);
  });
});

describe('phone', () => {
  it.each(['0151 2345678', '+49 (0) 6441 42956', '06441/42956', '0151-234 567'])('accepts %s', (value) => {
    expect(isPlausiblePhone(value)).toBe(true);
  });
  it.each(['', '12345', '------', 'abc 123456', '+49 1234 5678 9012 3456'])('rejects %s', (value) => {
    expect(isPlausiblePhone(value)).toBe(false);
  });
  it('turns dots into spaces', () => {
    expect(normalizePhoneInput(' 0151.234.5678 ')).toBe('0151 234 5678');
  });
});

describe('contact validation (without zod)', () => {
  const base = { name: 'Max Muster', phone: '0151 2345678', email: '', contactChannel: 'whatsapp' as const };

  it('accepts name + phone without e-mail and returns trimmed values', () => {
    expect(validateContact({ ...base, name: ' Max Muster ', phone: ' 0151.234.5678 ' })).toEqual({
      ok: true,
      values: { name: 'Max Muster', phone: '0151 234 5678', email: '', contactChannel: 'whatsapp' },
    });
  });

  it('requires an e-mail address for the e-mail channel', () => {
    expect(validateContact({ ...base, contactChannel: 'email' })).toEqual({ ok: false, errors: { email: CONTACT_MESSAGES.emailRequired } });
  });

  it('uses German messages for name, phone and e-mail', () => {
    expect(validateContact({ ...base, name: ' ', phone: '12', email: 'max@' })).toEqual({
      ok: false,
      errors: { name: 'Bitte gib deinen Namen an.', phone: CONTACT_MESSAGES.phone, email: CONTACT_MESSAGES.email },
    });
    expect(validateContact({ ...base, phone: '------' })).toMatchObject({ errors: { phone: CONTACT_MESSAGES.phone } });
  });

  // Client und Server müssen gleich entscheiden und dieselbe Meldung zeigen.
  it.each([
    { name: 'M' },
    { name: 'x'.repeat(101) },
    { phone: '------' },
    { phone: '12345' },
    { phone: '0151 2345678 9999 1234' },
    { phone: '0151.234.5678' },
    { email: 'max@example' },
    { email: 'max..muster@example.de' },
    { email: 'max@example.de' },
    { email: ' max@example.de ' },
    { email: `${'x'.repeat(250)}@example.de` },
    { contactChannel: 'email' as const, email: '' },
    { contactChannel: 'email' as const, email: 'max@example.de' },
  ])('matches the server schema for %j', (patch) => {
    const values = { ...base, ...patch };
    const client = validateContact(values);
    const server = applicationInputSchema.safeParse({
      jobId: 'initiativ',
      privacyNoticeVersion: '2026-10',
      idempotencyKey: '3b241101-e2bb-4255-8caf-4136c566a962',
      ...(client.ok ? client.values : values),
    });
    expect(client.ok).toBe(server.success);
    if (!client.ok && !server.success) {
      const serverErrors = Object.fromEntries(server.error.issues.map((issue) => [issue.path[0], issue.message]));
      for (const [field, message] of Object.entries(client.errors)) {
        if (field === 'name' && message.startsWith('Bitte kürze')) continue; // Server: germanIssueMessage (gleicher Text über die Route)
        expect(serverErrors[field]).toBe(message);
      }
    }
  });

  it('works as a react-hook-form resolver', async () => {
    const options = { fields: {}, shouldUseNativeValidation: false };
    await expect(Promise.resolve(contactResolver(base, undefined, options))).resolves.toMatchObject({ values: base, errors: {} });
    await expect(Promise.resolve(contactResolver({ ...base, phone: 'abc' }, undefined, options))).resolves.toEqual({
      values: {},
      errors: { phone: { type: 'validate', message: CONTACT_MESSAGES.phone } },
    });
  });
});

describe('office hours (Europe/Berlin)', () => {
  const spec = COMPANY.openingHours.spec;
  it.each([
    ['2026-10-08T12:00:00Z', true], // Thu 14:00 CEST
    ['2026-10-08T04:59:00Z', false], // Thu 06:59 CEST
    ['2026-10-08T14:45:00Z', false], // Thu 16:45 CEST, closed
    ['2026-10-09T11:00:00Z', true], // Fri 13:00 CEST
    ['2026-10-09T11:30:00Z', false], // Fri 13:30 CEST, closed
    ['2026-10-10T09:00:00Z', false], // Sat
    ['2026-12-03T15:30:00Z', true], // Thu 16:30 CET
    ['2026-12-03T16:00:00Z', false], // Thu 17:00 CET
  ])('%s → %s', (iso, open) => {
    expect(isWithinOpeningHours(new Date(iso), spec)).toBe(open);
  });

  it('formats date and time in Berlin', () => {
    expect(formatBerlinDateTime(new Date('2026-10-08T12:32:00Z'))).toBe('8. Oktober 2026, 14:32 Uhr');
  });
});

describe('vCard', () => {
  it('builds a card with escaped values and CRLF lines', () => {
    const card = buildVCard({
      formattedName: 'Bad und Energie',
      organization: COMPANY.legalName,
      phone: COMPANY.phone.e164,
      email: COMPANY.email,
      street: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      city: COMPANY.address.city,
      country: COMPANY.address.countryName,
    });
    const lines = card.trimEnd().split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines).toContain('VERSION:3.0');
    expect(lines).toContain(`TEL;TYPE=WORK,VOICE:${COMPANY.phone.e164}`);
    expect(lines).toContain(`EMAIL;TYPE=INTERNET,WORK:${COMPANY.email}`);
    expect(lines.at(-1)).toBe('END:VCARD');
    expect(card).not.toContain('undefined');
    expect(escapeVCardValue('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });
});

describe('URL params', () => {
  const options = getFunnelOptions().map((o) => ({ id: o.id, slug: o.slug }));

  it('maps ?stelle= to a job id', () => {
    expect(jobIdFromParam('kundendiensttechniker-waermepumpe-wetzlar', options)).toBe('kundendiensttechniker-shk');
    expect(jobIdFromParam(['ausbildung-anlagenmechaniker-shk-wetzlar', 'x'], options)).toBe('ausbildung-anlagenmechaniker-shk');
    expect(jobIdFromParam('initiativ', options)).toBe('initiativ');
    expect(jobIdFromParam('anlagenmechaniker-shk', options)).toBe('anlagenmechaniker-shk');
    expect(jobIdFromParam('gibt-es-nicht', options)).toBeUndefined();
    expect(jobIdFromParam(undefined, options)).toBeUndefined();
    expect(jobIdFromParam('alt', [{ id: 'anlagenmechaniker-shk', slug: 'neu', legacySlugs: ['alt'] }])).toBe('anlagenmechaniker-shk');
  });

  it('writes the param back', () => {
    expect(paramForJob('initiativ', options)).toBe('initiativ');
    expect(paramForJob('anlagenmechaniker-shk', options)).toBe('anlagenmechaniker-shk-wetzlar');
    expect(paramForJob(null, options)).toBeNull();
  });

  it('redirects only ?tab=dossier and keeps UTM parameters', () => {
    expect(legacyRedirectTarget({ tab: 'dossier', utm_source: 'indeed', direct: 'true' })).toBe(
      '/bewerbung/mappe?utm_source=indeed',
    );
    for (const tab of ['quiz', 'form', 'vault', 'direct']) expect(legacyRedirectTarget({ tab })).toBeNull();
    expect(legacyRedirectTarget({ direct: 'true' })).toBeNull();
    expect(carryOverQuery({ a: ['1', '2'], tab: 'x', b: undefined })).toBe('?a=1&a=2');
  });

  it('redirects ?tab=dossier case-insensitively and keeps ?stelle=, ignores unknown values (E-BEW-027)', () => {
    expect(legacyRedirectTarget({ tab: ' DOSSIER ' })).toBe('/bewerbung/mappe');
    expect(legacyRedirectTarget({ tab: ['dossier', 'vault'], stelle: 'initiativ' })).toBe('/bewerbung/mappe?stelle=initiativ');
    // Mehrfachwerte: Der erste zählt, wie beim Altstand (searchParams.get).
    expect(legacyRedirectTarget({ tab: ['vault', 'dossier'] })).toBeNull();
    for (const tab of ['', 'bogus', 'hub', '%', undefined]) expect(legacyRedirectTarget({ tab })).toBeNull();
    expect(legacyRedirectTarget({})).toBeNull();
  });

  it('recognises the old document-vault links (E-BEW-027, E-START-007)', () => {
    expect(wantsDocuments({ tab: 'vault' })).toBe(true);
    expect(wantsDocuments({ tab: 'Direct' })).toBe(true);
    expect(wantsDocuments({ direct: 'true' })).toBe(true);
    expect(wantsDocuments({ direct: ['1', 'false'] })).toBe(true);
    expect(wantsDocuments({ tab: 'quiz' })).toBe(false);
    expect(wantsDocuments({ tab: 'form', direct: 'false' })).toBe(false);
    expect(wantsDocuments({ direct: '' })).toBe(false);
    expect(wantsDocuments({ direct: '0' })).toBe(false);
    expect(wantsDocuments({ stelle: 'initiativ' })).toBe(false);
  });
});

describe('session records', () => {
  function memoryStorage(): StorageLike & { data: Record<string, string> } {
    const data: Record<string, string> = {};
    return {
      data,
      getItem: (key) => data[key] ?? null,
      setItem: (key, value) => void (data[key] = value),
      removeItem: (key) => void delete data[key],
    };
  }

  it('writes and reads the submitted application', () => {
    const storage = memoryStorage();
    const record = {
      reference: 'BE-26-0042',
      followUpToken: 'tok',
      firstName: 'Max',
      jobId: 'anlagenmechaniker-shk' as const,
      submittedAt: '2026-10-08T12:00:00.000Z',
    };
    expect(writeSubmitted(record, storage)).toBe(true);
    expect(Object.keys(storage.data)).toEqual([STORAGE_KEYS.submitted]);
    expect(readSubmitted(storage)).toEqual(record);
    expect(parseSubmitted(JSON.stringify({ ...record, submittedAt: Date.parse(record.submittedAt) }))).toEqual(record);
    expect(parseSubmitted(JSON.stringify({ ...record, reference: '' }))).toBeNull();
    expect(parseSubmitted('kaputt')).toBeNull();
  });

  it('accepts only a Mappe with content', () => {
    expect(parseMappe(JSON.stringify({ coverLetter: 'Hallo' }))?.coverLetter).toBe('Hallo');
    expect(parseMappe(JSON.stringify({ mappe: { skills: ['Löten'] } }))?.skills).toEqual(['Löten']);
    expect(parseMappe(JSON.stringify({}))).toBeNull();
    expect(parseMappe(JSON.stringify({ careerStations: 'x' }))).toBeNull();
    expect(parseMappe(null)).toBeNull();
  });
});
