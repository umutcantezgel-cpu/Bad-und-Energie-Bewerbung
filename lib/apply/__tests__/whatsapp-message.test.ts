import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import {
  MAPPE_SHARE_PDF_LINE,
  buildApplicationMessage,
  buildFollowUpMessage,
  buildMappeShareMessage,
  buildShortcutMessage,
} from '../whatsapp-message';

const noGaps = (text: string) => {
  expect(text).not.toMatch(/undefined|null|NaN|\[object/);
  expect(text).not.toMatch(/: *$/m);
  expect(text).not.toMatch(/\n\n/);
};

describe('shortcut message', () => {
  it('works without any answers', () => {
    const text = buildShortcutMessage();
    expect(text).toBe('Guten Tag Herr Demir, ich möchte mich bei Bad und Energie bewerben.');
    noGaps(text);
  });

  it('lists the job, the answers so far and the name', () => {
    const text = buildShortcutMessage({
      jobLabel: 'Anlagenmechaniker SHK',
      questionSet: 'fachkraft',
      answers: { qualification: 'geselle-2-5' },
      name: '  Max   Muster ',
    });
    expect(text.split('\n')).toEqual([
      'Guten Tag Herr Demir, ich möchte mich bei Bad und Energie bewerben.',
      'Stelle: Anlagenmechaniker SHK',
      'Qualifikation: Geselle, 2–5 Jahre',
      'Name: Max Muster',
    ]);
    noGaps(text);
  });

  it('skips empty and unknown values', () => {
    const text = buildShortcutMessage({
      jobLabel: '',
      questionSet: 'quereinstieg',
      answers: { background: 'handwerk', licenseB: undefined, start: 'gibt-es-nicht' },
      name: null,
    });
    expect(text).toContain('Aktuell: Im Handwerk (anderes Gewerk)');
    expect(text).not.toContain('Start');
    expect(text).not.toContain('Stelle');
    noGaps(text);
  });
});

describe('full application message', () => {
  it('contains everything needed to apply by WhatsApp', () => {
    const text = buildApplicationMessage({
      jobLabel: 'Kundendiensttechniker',
      questionSet: 'fachkraft',
      answers: { qualification: 'meister-techniker', start: '1-3-monate' },
      name: 'Erika Muster',
      phone: '0151 2345678',
      email: 'erika@example.de',
      contactChannel: 'phone',
    });
    expect(text.split('\n')).toEqual([
      'Guten Tag Herr Demir, hier ist meine Bewerbung bei Bad und Energie.',
      'Stelle: Kundendiensttechniker',
      'Qualifikation: Meister oder Techniker',
      'Start: In 1–3 Monaten (Kündigungsfrist)',
      'Name: Erika Muster',
      'Telefon: 0151 2345678',
      'E-Mail: erika@example.de',
      'Am liebsten per: Anruf',
    ]);
    noGaps(text);
  });

  it('omits the e-mail line when there is none', () => {
    const text = buildApplicationMessage({ name: 'Max', phone: '0151 2345678', email: '', contactChannel: 'whatsapp' });
    expect(text).not.toContain('E-Mail');
    expect(text).toContain('Am liebsten per: WhatsApp');
    noGaps(text);
  });

  it('survives URL encoding into a WhatsApp link', () => {
    const url = buildWhatsAppUrl(buildApplicationMessage({ name: 'Zoë & Co', phone: '+49 151 2345678' }));
    expect(url).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?phone=\d+&text=/);
    expect(decodeURIComponent(url.split('text=')[1])).toContain('Name: Zoë & Co');
  });
});

describe('follow-up message', () => {
  it('names the reference and the extras', () => {
    expect(buildFollowUpMessage({ reference: 'BE-26-0042' })).toBe(
      'Guten Tag Herr Demir, hier sind meine Unterlagen zur Bewerbung BE-26-0042.',
    );
    const text = buildFollowUpMessage({ reference: 'BE-26-0042', kind: 'extras', postalCode: '35578', message: 'Hallo' });
    expect(text.split('\n')).toEqual([
      'Guten Tag Herr Demir, hier sind meine Ergänzungen zur Bewerbung BE-26-0042.',
      'PLZ: 35578',
      'Hallo',
    ]);
    noGaps(buildFollowUpMessage({ reference: null, startDate: undefined }));
  });
});

describe('mappe share message (E-BEW-020)', () => {
  it('works for an empty mappe without placeholder data', () => {
    const text = buildMappeShareMessage();
    expect(text.split('\n')).toEqual([
      'Guten Tag Herr Demir, hier ist meine Bewerbungsmappe (Anschreiben und Lebenslauf) für Bad und Energie.',
      MAPPE_SHARE_PDF_LINE,
    ]);
    noGaps(text);
    expect(text).not.toMatch(/Dossier|Max|Muster|Vollzeit|13:30|Koch/);
  });

  it('names the reference, the job and the name when they exist', () => {
    const text = buildMappeShareMessage({ reference: ' BE-26-0042 ', jobLabel: 'Anlagenmechaniker SHK (m/w/d)', name: ' Erika  Muster ' });
    expect(text.split('\n')).toEqual([
      'Guten Tag Herr Demir, hier ist meine Bewerbungsmappe (Anschreiben und Lebenslauf) zur Bewerbung BE-26-0042.',
      'Stelle: Anlagenmechaniker SHK (m/w/d)',
      'Name: Erika Muster',
      'Die Mappe als PDF hänge ich hier im Chat an.',
    ]);
    noGaps(text);
  });

  it('skips blank values', () => {
    const text = buildMappeShareMessage({ reference: '  ', jobLabel: '', name: null });
    expect(text).not.toContain('Stelle');
    expect(text).not.toContain('Name');
    expect(text).toContain('für Bad und Energie.');
    noGaps(text);
  });

  it('goes to the company number 06441 42956 as a WhatsApp link', () => {
    const url = buildWhatsAppUrl(buildMappeShareMessage({ name: 'Zoë & Co' }));
    expect(url).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?phone=49644142956&text=/);
    expect(decodeURIComponent(url.split('text=')[1])).toContain('Name: Zoë & Co');
  });
});

describe('site-wide WhatsApp text', () => {
  it('is neutral outside the flow: no job title, fits pupils and skilled workers alike', async () => {
    const { DEFAULT_WHATSAPP_MESSAGE, whatsAppMessageFor } = await import('@/lib/utils/whatsapp-utils');
    expect(whatsAppMessageFor('/')).toBe(DEFAULT_WHATSAPP_MESSAGE);
    expect(whatsAppMessageFor('/jobs/ausbildung-anlagenmechaniker-shk-wetzlar')).toBe(DEFAULT_WHATSAPP_MESSAGE);
    expect(DEFAULT_WHATSAPP_MESSAGE).not.toMatch(/Anlagenmechaniker|Kundendienst|ich bin/);
    expect(whatsAppMessageFor('/bewerbung')).toContain('Bewerbungsschritten');
  });
});
