import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getFlowJobOptions } from '@/components/apply/options';
import { DankeErfolg, type DankeErfolgProps } from '@/components/apply/thanks/DankeErfolg';
import { DankeLeer } from '@/components/apply/thanks/DankeLeer';
import {
  ABLAUF_TEXT,
  ERGAENZEN_TEXT,
  LEER_KOPF,
  ergaenzungPruefen,
  rueckfallNachricht,
  rueckmeldewegAus,
  rueckmeldewegText,
} from '@/components/apply/thanks/danke-text';
import { ThankYouView } from '@/components/apply/thanks/ThankYouView';
import type { ThankYouCompany, ThankYouJobs } from '@/components/apply/thanks/types';
import { applicationFollowUpSchema } from '@/lib/applications/schema';
import { formatBerlinDateTime } from '@/lib/apply/office-hours';
import type { SubmittedApplication } from '@/lib/apply/storage';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { getProcessSteps } from '@/lib/content/process';
import { SKILL_OPTIONS } from '@/lib/mappe/options';

/** Danke-Seite (R5-THANKS-01): Erfolg nach Serverbestätigung, Leerzustand, freiwillige Ergänzung. */

const jobs: ThankYouJobs = Object.fromEntries(
  getFlowJobOptions().map((option) => [option.id, { label: option.summaryLabel, questionSet: option.questionSet }]),
);
const processSteps = {
  fachkraft: getProcessSteps('fachkraft'),
  ausbildung: getProcessSteps('ausbildung'),
  quereinstieg: getProcessSteps('quereinstieg'),
};
const company: ThankYouCompany = {
  shortName: COMPANY.shortName,
  legalName: COMPANY.legalName,
  phoneDisplay: COMPANY.phone.display,
  phoneE164: COMPANY.phone.e164,
  phoneHref: COMPANY.phone.href,
  email: COMPANY.email,
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  region: COMPANY.address.region,
  countryName: COMPANY.address.countryName,
  website: COMPANY.website,
  openingHoursShort: COMPANY.openingHours.short,
  openingHoursSpec: COMPANY.openingHours.spec.map((entry) => ({ days: [...entry.days], opens: entry.opens, closes: entry.closes })),
};

const RECORD: SubmittedApplication = {
  reference: 'BE-26-K7M4QX',
  followUpToken: 'token.zum.test',
  firstName: 'Jonas',
  jobId: 'anlagenmechaniker-shk',
  submittedAt: '2026-10-10T07:42:00.000Z',
};

function erfolg(overrides: Partial<DankeErfolgProps> = {}): string {
  return renderToStaticMarkup(
    createElement(DankeErfolg, {
      record: RECORD,
      rueckmeldeweg: 'phone',
      officeOpen: true,
      jobs,
      processSteps,
      company,
      quickResponse: FACTS.quickResponse.long,
      noCvNeeded: FACTS.noCvNeeded.long,
      ...overrides,
    }),
  );
}

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

describe('Rückmeldeweg aus dem gespeicherten Datensatz (E-START-020)', () => {
  it('liest contactChannel, wenn der Flow ihn mitschreibt', () => {
    expect(rueckmeldewegAus(JSON.stringify({ ...RECORD, contactChannel: 'whatsapp' }))).toBe('whatsapp');
    expect(rueckmeldewegAus(JSON.stringify({ ...RECORD, contactChannel: 'email' }))).toBe('email');
  });

  it('gibt ohne, mit fremdem Wert oder kaputtem JSON null und wirft nie', () => {
    expect(rueckmeldewegAus(JSON.stringify(RECORD))).toBeNull();
    expect(rueckmeldewegAus(JSON.stringify({ ...RECORD, contactChannel: 'brieftaube' }))).toBeNull();
    expect(rueckmeldewegAus('{kaputt')).toBeNull();
    expect(rueckmeldewegAus('[1,2]')).toBeNull();
    expect(rueckmeldewegAus(null)).toBeNull();
    expect(rueckmeldewegAus(undefined)).toBeNull();
  });

  it('nennt den Weg mit dem Wortlaut des Flows, sonst allgemein', () => {
    expect(rueckmeldewegText('whatsapp')).toBe('per WhatsApp');
    expect(rueckmeldewegText('phone')).toBe('per Anruf');
    expect(rueckmeldewegText('email')).toBe('per E-Mail');
    expect(rueckmeldewegText(null)).toBe('auf dem Weg, den du gewählt hast');
  });
});

describe('Erfolgszustand (E-START-020, Register kreis-schliessen)', () => {
  it('zeigt genau eine h1 mit Vorname und den Kreis, der sich schließt, ohne Konfetti und ohne roten Knopf', () => {
    const html = erfolg();
    expect(count(html, /<h1\b/g)).toBe(1);
    expect(plain(html.match(/<h1\b[^>]*>(.*?)<\/h1>/)?.[1] ?? '')).toBe('Danke, Jonas.');
    expect(count(html, /data-motion="kreis-schliessen"/g)).toBeGreaterThanOrEqual(2);
    expect(html).toContain('data-zeichnung="kreis-geschlossen"');
    expect(html).not.toMatch(/konfetti|confetti/i);
    expect(html).not.toContain('data-primary-cta');
    expect(html).not.toMatch(/lucide/);
  });

  it('ohne Vorname heißt die h1 „Danke.“', () => {
    const html = erfolg({ record: { ...RECORD, firstName: '' } });
    expect(plain(html.match(/<h1\b[^>]*>(.*?)<\/h1>/)?.[1] ?? '')).toBe('Danke.');
  });

  it('nennt Nummer, Stelle, Eingangszeit und den gewählten Rückmeldeweg', () => {
    const text = plain(erfolg());
    expect(text).toContain('BE-26-K7M4QX');
    expect(text).toContain('Bewerbungsnummer');
    expect(text).toContain(`${ABLAUF_TEXT.angaben.stelle} ${jobs['anlagenmechaniker-shk']?.label}`);
    expect(text).toContain(`${ABLAUF_TEXT.angaben.eingang} ${formatBerlinDateTime(new Date(RECORD.submittedAt))}`);
    expect(text).toContain(`${ABLAUF_TEXT.angaben.weg} per Anruf`);
  });

  it('nennt den Weg allgemein, wenn der Datensatz ihn nicht trägt', () => {
    expect(plain(erfolg({ rueckmeldeweg: null }))).toContain(`${ABLAUF_TEXT.angaben.weg} auf dem Weg, den du gewählt hast`);
  });

  it('übernimmt die Rückmeldung wörtlich aus FACTS und nennt die Öffnungszeiten nur außerhalb', () => {
    expect(plain(erfolg())).toContain(FACTS.quickResponse.long);
    expect(plain(erfolg())).not.toContain('Gerade ist unser Büro nicht besetzt');
    expect(plain(erfolg({ officeOpen: false }))).toContain('Gerade ist unser Büro nicht besetzt');
  });

  it('führt den Ablauf der Fachkraft nach dem erledigten ersten Schritt fort', () => {
    const text = plain(erfolg());
    expect(text).toContain('Bewerbung gesendet (erledigt)');
    for (const step of getProcessSteps('fachkraft').filter((step) => step.id !== 'bewerben')) {
      expect(text).toContain(step.title);
    }
  });
});

describe('Freiwillige Ergänzung (E-START-015, E-BEW-015)', () => {
  it('steht unter „Möchtest du noch etwas ergänzen?“ und sagt, dass die Bewerbung ohne sie vollständig ist', () => {
    const text = plain(erfolg());
    expect(text).toContain(ERGAENZEN_TEXT.titel);
    expect(text).toContain('Deine Bewerbung ist auch ohne diese Angaben vollständig.');
  });

  it('zeigt die Kenntnisse aus lib/mappe als nicht gewählte Chips', () => {
    const html = erfolg();
    expect(html).toContain(ERGAENZEN_TEXT.kenntnisseFrage);
    for (const skill of SKILL_OPTIONS) expect(plain(html)).toContain(skill);
    expect(count(html, /aria-pressed="false"/g)).toBe(SKILL_OPTIONS.length);
    expect(html).not.toContain('aria-pressed="true"');
  });

  it('lässt die Kenntnisse bei der Ausbildung weg, die Felder bleiben', () => {
    const html = erfolg({ record: { ...RECORD, jobId: 'ausbildung-anlagenmechaniker-shk' } });
    expect(html).not.toContain(ERGAENZEN_TEXT.kenntnisseFrage);
    expect(html).toContain(ERGAENZEN_TEXT.nachricht);
  });

  it('nennt am Feld „Nachricht“ die Wunschkonditionen', () => {
    expect(plain(erfolg())).toContain('Nachricht Zum Beispiel Wunschkonditionen, Arbeitsmodell, besondere Erfahrung');
  });

  it('sendet nichts ohne Angabe und prüft die Postleitzahl', () => {
    const zugang = { reference: RECORD.reference, token: RECORD.followUpToken };
    expect(ergaenzungPruefen({ startDate: ' ', postalCode: '', message: '  ' }, [], zugang)).toEqual({ ok: false, fehler: 'leer' });
    expect(ergaenzungPruefen({ startDate: '', postalCode: '3557', message: '' }, [], zugang)).toEqual({ ok: false, fehler: 'plz' });
  });

  it('schickt angetippte Kenntnisse allein als mappe.skills im unveränderten Vertrag C8', () => {
    const zugang = { reference: RECORD.reference, token: RECORD.followUpToken };
    const result = ergaenzungPruefen({ startDate: '', postalCode: '', message: '' }, [SKILL_OPTIONS[1], SKILL_OPTIONS[5]], zugang);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toEqual({
      reference: RECORD.reference,
      token: RECORD.followUpToken,
      mappe: { coverLetter: '', skills: [SKILL_OPTIONS[1], SKILL_OPTIONS[5]], careerStations: [], educationStations: [] },
    });
    expect(applicationFollowUpSchema.safeParse(result.payload).success).toBe(true);
  });

  it('lässt leere Felder weg und kürzt Leerraum', () => {
    const zugang = { reference: RECORD.reference, token: RECORD.followUpToken };
    const result = ergaenzungPruefen({ startDate: '2026-11-01', postalCode: ' 35578 ', message: ' Vollzeit ' }, [], zugang);
    expect(result).toEqual({
      ok: true,
      payload: { reference: RECORD.reference, token: RECORD.followUpToken, startDate: '2026-11-01', postalCode: '35578', message: 'Vollzeit' },
    });
    if (result.ok) expect(applicationFollowUpSchema.safeParse(result.payload).success).toBe(true);
  });

  it('nimmt die Kenntnisse in den WhatsApp-Rückfallweg mit', () => {
    expect(rueckfallNachricht('Gern ab Januar.', ['Badsanierung und Vorwandinstallation'])).toBe(
      'Praxiserfahrung: Badsanierung und Vorwandinstallation. Gern ab Januar.',
    );
    expect(rueckfallNachricht('  ', [])).toBe('');
  });
});

describe('Leerzustand und erster Render', () => {
  it('erklärt ruhig, warum nichts da ist, und führt mit der einen roten Aktion zur Bewerbung', () => {
    const mikrotext = LEER_KOPF.mikrotext(FACTS.apply60s.value, FACTS.noCvNeeded.short);
    const html = renderToStaticMarkup(createElement(DankeLeer, { ort: COMPANY.address.city, bewerbenMikrotext: mikrotext }));
    expect(count(html, /<h1\b/g)).toBe(1);
    expect(plain(html)).toContain(LEER_KOPF.titel);
    expect(plain(html)).toContain('Dauert ca. 60 Sekunden. Kein Lebenslauf nötig.');
    expect(count(html, /data-primary-cta/g)).toBe(1);
    expect(html).toMatch(/href="\/bewerbung"[^>]*>\s*<span>Jetzt bewerben<\/span>/);
    expect(html).toContain('href="/jobs"');
    expect(html).not.toContain('kreis-schliessen');
  });

  it('rendert auf dem Server vor dem Lesen des Speichers den Kopf mit genau einer h1', () => {
    const html = renderToStaticMarkup(
      createElement(ThankYouView, {
        jobs,
        processSteps,
        company,
        quickResponse: FACTS.quickResponse.long,
        noCvNeeded: FACTS.noCvNeeded.long,
        bewerbenMikrotext: 'x',
      }),
    );
    expect(html).toContain('aria-busy="true"');
    expect(count(html, /<h1\b/g)).toBe(1);
    expect(html).not.toContain('BE-');
  });
});
