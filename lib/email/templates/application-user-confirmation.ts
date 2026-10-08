import type { ContactChannel } from '@/lib/applications/schema';
import type { ReferencedApplication } from '@/lib/applications/types';
import { COMPANY } from '@/lib/content/company';
import { DISCRETION_PROMISE, getProcessSteps } from '@/lib/content/process';
import { renderEmail, type RenderedEmail } from './layout';

/**
 * Eingangsbestätigung an die Bewerberin bzw. den Bewerber, nur wenn eine E-Mail angegeben wurde.
 * Inhalt: Dank, Bewerbungsnummer, nächste Schritte (lib/content/process.ts), Kontakt.
 * Keine Werbung, keine Versprechen über Fristen (ROADMAP §13: „schnellstmöglich“).
 */

const REPLY_VIA: Record<ContactChannel, string> = {
  whatsapp: 'per WhatsApp',
  phone: 'telefonisch',
  email: 'per E-Mail',
};

export function applicationConfirmationSubject(app: Pick<ReferencedApplication, 'reference'>): string {
  return `Deine Bewerbung bei ${COMPANY.shortName}: ${app.reference}`;
}

export function renderApplicationConfirmationEmail(app: ReferencedApplication): RenderedEmail {
  // Schritt 1 (Bewerben) ist mit dieser Mail erledigt; seine Beschreibung entfällt.
  const steps = getProcessSteps(app.job.questionSet).map((step, index) =>
    index === 0 ? { title: step.title, done: true } : { title: step.title, text: step.text },
  );
  const greeting = app.firstName ? `Danke, ${app.firstName}.` : 'Danke für deine Bewerbung.';

  return renderEmail({
    subject: applicationConfirmationSubject(app),
    preheader: `Deine Bewerbung ist angekommen. Deine Bewerbungsnummer: ${app.reference}.`,
    blocks: [
      { type: 'title', text: greeting },
      {
        type: 'paragraph',
        text: `Deine Bewerbung ist bei uns angekommen. Wir melden uns schnellstmöglich ${REPLY_VIA[app.contactChannel]} bei dir.`,
      },
      {
        type: 'rows',
        rows: [
          { label: 'Stelle', value: app.job.title },
          { label: 'Bewerbungsnummer', value: app.reference },
        ],
      },
      { type: 'heading', text: 'So geht es weiter' },
      { type: 'steps', steps },
      { type: 'paragraph', text: DISCRETION_PROMISE, muted: true },
      { type: 'heading', text: 'Fragen oder Unterlagen nachreichen?' },
      {
        type: 'paragraph',
        text: 'Antworte einfach auf diese E-Mail oder melde dich telefonisch oder per WhatsApp. Nenn dabei gern deine Bewerbungsnummer.',
      },
      {
        type: 'rows',
        rows: [
          { label: 'Telefon', value: COMPANY.phone.display, href: COMPANY.phone.href },
          { label: 'WhatsApp', value: COMPANY.whatsapp.display, href: COMPANY.whatsapp.href },
          { label: 'E-Mail', value: COMPANY.email, href: COMPANY.emailHref },
          { label: 'Erreichbar', value: COMPANY.openingHours.short },
        ],
      },
    ],
    footerNote: `Du bekommst diese E-Mail, weil du dich auf ${COMPANY.careerUrl.replace(/^https?:\/\//, '')} beworben hast.`,
  });
}
