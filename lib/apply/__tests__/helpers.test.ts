import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { STORAGE_KEYS } from '@/lib/applications/schema';
import { getFunnelOptions } from '@/lib/jobs/registry';
import { contactFormSchema, CONTACT_MESSAGES } from '../contact-schema';
import { editDistance, suggestEmail } from '../email-suggest';
import { formatBerlinDateTime, isWithinOpeningHours } from '../office-hours';
import { carryOverQuery, jobIdFromParam, legacyRedirectTarget, paramForJob } from '../params';
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

describe('contact form schema', () => {
  const base = { name: 'Max Muster', phone: '0151 2345678', email: '', contactChannel: 'whatsapp' as const, website: '' };

  it('accepts name + phone without e-mail', () => {
    expect(contactFormSchema.safeParse(base).success).toBe(true);
  });

  it('requires an e-mail address for the e-mail channel', () => {
    const result = contactFormSchema.safeParse({ ...base, contactChannel: 'email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((issue) => issue.path[0] === 'email')?.message).toBe(CONTACT_MESSAGES.emailRequired);
  });

  it('uses German messages for name, phone and e-mail', () => {
    const result = contactFormSchema.safeParse({ ...base, name: ' ', phone: '12', email: 'max@' });
    const messages = Object.fromEntries(result.error?.issues.map((issue) => [issue.path[0], issue.message]) ?? []);
    expect(messages).toEqual({
      name: 'Bitte gib deinen Namen an.',
      phone: CONTACT_MESSAGES.phone,
      email: CONTACT_MESSAGES.email,
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
