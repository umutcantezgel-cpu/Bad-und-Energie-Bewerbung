import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { contactResolver, EMPTY_CONTACT, type ContactFormInput, type ContactFormValues } from '@/lib/apply/contact-schema';
import { interpretApplicationResponse, type SubmitFailure } from '@/lib/apply/submit';
import { ContactStep } from '../ContactStep';
import { SubmitErrorPanel } from '../SubmitErrorPanel';

const NETWORK: SubmitFailure = { ok: false, kind: 'network', fieldErrors: {}, otherErrors: {} };

function failure(status: number, body: unknown): SubmitFailure {
  const result = interpretApplicationResponse(status, body);
  if (result.ok) throw new Error('expected a failure');
  return result;
}

function renderContactStep(current: SubmitFailure | null): string {
  function Harness() {
    const form = useForm<ContactFormInput, unknown, ContactFormValues>({ resolver: contactResolver, defaultValues: EMPTY_CONTACT });
    return createElement(ContactStep, {
      form,
      heading: createElement('h2', { id: 'kontakt' }, 'Wie erreichen wir dich?'),
      headingId: 'kontakt',
      submitting: false,
      failure: current,
      onValid: () => {},
      honeypotRef: createRef<HTMLInputElement>(),
      phoneHref: 'tel:+49644142956',
      application: { jobLabel: 'Anlagenmechaniker SHK', questionSet: 'fachkraft', answers: {} },
      mappe: { present: false, included: false, onToggle: () => {} },
    });
  }
  return renderToStaticMarkup(createElement(Harness));
}

const count = (html: string, text: string) => html.split(text).length - 1;

describe('ContactStep', () => {
  it('has one retry affordance: the primary button says "Erneut senden" when retrying can help', () => {
    const idle = renderContactStep(null);
    expect(idle).toContain('Bewerbung absenden');
    expect(idle).not.toContain('Erneut senden');

    const error = renderContactStep(NETWORK);
    expect(count(error, 'Erneut senden')).toBe(1);
    expect(error).not.toContain('Bewerbung absenden');
    expect(error).toContain('Anrufen');
    expect(error).toContain('Per WhatsApp senden');
  });

  it('keeps the normal label when retrying unchanged cannot help', () => {
    const tooLarge = renderContactStep(failure(413, { ok: false, code: 'PAYLOAD_TOO_LARGE', message: 'Bitte kürze deine Nachricht.' }));
    expect(tooLarge).not.toContain('Erneut senden');
    expect(tooLarge).toContain('Bewerbung absenden');
    expect(tooLarge).toContain('meist wegen der Bewerbungsmappe');
  });

  it('uses a honeypot no autofill profile fills', () => {
    const html = renderContactStep(null);
    expect(html).toContain('name="contact_time_hint"');
    expect(html).toMatch(/<input id="[^"]*contactTimeHint"[^>]*autoComplete="off"/i);
    expect(html).toContain('data-1p-ignore');
    expect(html).toContain('data-lpignore="true"');
    expect(html).not.toMatch(/name="website"|>Website</);
  });
});

describe('SubmitErrorPanel', () => {
  const render = (current: SubmitFailure) =>
    renderToStaticMarkup(createElement(SubmitErrorPanel, { failure: current, phoneHref: 'tel:+49644142956', whatsappHref: 'https://wa.me/49' }));

  it('shows the server message by code (e.g. an expired follow-up link) without a retry button', () => {
    const html = render(failure(403, { ok: false, code: 'INVALID_TOKEN', message: 'Der Link zum Ergänzen ist abgelaufen.' }));
    expect(html).toContain('role="alert"');
    expect(html).toContain('Der Link zum Ergänzen ist abgelaufen.');
    expect(html).not.toContain('Erneut senden');
    expect(html).not.toContain('Unser Server antwortet gerade nicht');
  });

  it('offers a reload for CSRF failures', () => {
    const html = render(failure(403, { ok: false, code: 'CSRF_FAILED', message: 'Bitte lade die Seite neu.' }));
    expect(html).toContain('Seite neu laden');
    expect(html).toContain('Bitte lade die Seite neu.');
  });

  it('keeps the generic text for a 5xx without body', () => {
    expect(render(failure(502, null))).toContain('Unser Server antwortet gerade nicht');
    expect(render(failure(502, null))).not.toContain('Seite neu laden');
  });
});
