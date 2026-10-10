import type { NormalizedFollowUp } from '@/lib/applications/types';
import { mappeBlocks } from './application-parts';
import { renderEmail, type RenderedEmail } from './layout';

/**
 * Ergänzung zu einer Bewerbung (Danke-Seite oder Mappe, Token-geprüft). Bewusst ohne
 * Zeitstempel: Gleicher Inhalt ergibt dieselbe Mail, damit Resend Wiederholungen über den
 * Idempotency-Key auch instanzübergreifend erkennt. Die Mail hat ohnehin ein Datum.
 */

/**
 * Das Feld „Nachricht“ der Danke-Seite nennt Wunschkonditionen (E-BEW-015, kein eigenes Feld im
 * Schema); die Team-Mail zeigt die Ergänzung deshalb als einen Block mit dieser Beschriftung.
 */
export const MESSAGE_LABEL = 'Nachricht (z. B. Wunschkonditionen, Arbeitsmodell, besondere Erfahrung)';

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
      Boolean(followUp.startDate || followUp.postalCode || followUp.message) && {
        type: 'panel',
        title: 'Ergänzung',
        blocks: [
          {
            type: 'rows',
            rows: [
              { label: 'Frühester Start', value: followUp.startDate },
              { label: 'PLZ', value: followUp.postalCode },
            ],
          },
          followUp.message ? { type: 'paragraph', text: MESSAGE_LABEL, muted: true } : null,
          followUp.message ? { type: 'quote', text: followUp.message } : null,
        ],
      },
      ...mappeBlocks(followUp.mappe),
    ],
  });
}
