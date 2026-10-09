import type { NormalizedFollowUp } from '@/lib/applications/types';
import { mappeBlocks } from './application-parts';
import { renderEmail, type RenderedEmail } from './layout';

/**
 * Ergänzung zu einer Bewerbung (Danke-Seite oder Mappe, Token-geprüft). Bewusst ohne
 * Zeitstempel: Gleicher Inhalt ergibt dieselbe Mail, damit Resend Wiederholungen über den
 * Idempotency-Key auch instanzübergreifend erkennt. Die Mail hat ohnehin ein Datum.
 */

export function applicationFollowUpSubject(followUp: Pick<NormalizedFollowUp, 'reference'>): string {
  return `Ergänzung zu ${followUp.reference}`;
}

export function renderApplicationFollowUpEmail(followUp: NormalizedFollowUp): RenderedEmail {
  return renderEmail({
    subject: applicationFollowUpSubject(followUp),
    preheader: `Neue Angaben zur Bewerbung ${followUp.reference}.`,
    eyebrow: 'Team-Benachrichtigung',
    blocks: [
      { type: 'title', text: `Ergänzung zu ${followUp.reference}` },
      {
        type: 'paragraph',
        text: `Zur Bewerbung ${followUp.reference} sind neue Angaben eingegangen. Name und Kontakt stehen in der E-Mail „Neue Bewerbung ${followUp.reference}“.`,
      },
      {
        type: 'rows',
        rows: [
          { label: 'Frühester Start', value: followUp.startDate },
          { label: 'PLZ', value: followUp.postalCode },
        ],
      },
      followUp.message ? { type: 'heading', text: 'Nachricht' } : null,
      followUp.message ? { type: 'quote', text: followUp.message } : null,
      ...mappeBlocks(followUp.mappe),
    ],
  });
}
