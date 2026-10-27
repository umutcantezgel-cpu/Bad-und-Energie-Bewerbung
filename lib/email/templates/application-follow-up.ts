import type { NormalizedFollowUp } from '@/lib/applications/types';
import { formatIsoDate } from '@/lib/mappe/format';
import { mappeBlocks, nurPraxiserfahrung, type MappePdfHinweis } from './application-parts';
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

/** `pdf`: die nachgereichte Mappe liegt als PDF im Anhang (lib/mappe/pdf/anhang.ts). */
export function renderApplicationFollowUpEmail(followUp: NormalizedFollowUp, pdf?: MappePdfHinweis | null): RenderedEmail {
  // Angetippte Praxiserfahrung steht im Kasten „Ergänzung“; eine echte Mappe darunter wie bisher.
  const praxis = nurPraxiserfahrung(followUp.mappe);
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
      Boolean(followUp.startDate || followUp.postalCode || followUp.message || praxis) && {
        type: 'panel',
        title: 'Ergänzung',
        blocks: [
          {
            type: 'rows',
            rows: [
              { label: 'Frühester Start', value: followUp.startDate ? formatIsoDate(followUp.startDate) : undefined },
              { label: 'PLZ', value: followUp.postalCode },
              { label: 'Praxiserfahrung', value: praxis?.join(', ') },
            ],
          },
          followUp.message ? { type: 'paragraph', text: MESSAGE_LABEL, muted: true } : null,
          followUp.message ? { type: 'quote', text: followUp.message } : null,
        ],
      },
      ...(praxis ? [] : mappeBlocks(followUp.mappe, pdf)),
    ],
  });
}
