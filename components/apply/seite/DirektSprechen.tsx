import { Icon } from '@/components/icons';
import { ContactOptions } from '@/components/site/ContactOptions';
import { DIREKT_TEXT } from './seite-text';

export interface DirektSprechenProps {
  /** Diskretionszusage (getDiscretionPromise); null bei der Ausbildung (kein Arbeitgeber). */
  diskretion: string | null;
  /** Vorausgefüllter WhatsApp-Text der Seite. */
  whatsappMessage: string;
  titelId?: string;
}

/**
 * „Lieber direkt sprechen?“ (E-BEW-008 Nachbar, NEU-BEW-35): Diskretionszusage mit Schild, dann Telefon,
 * WhatsApp und E-Mail mit Öffnungszeiten in der Reihenfolge aller Seiten (WCAG 3.2.6, ContactOptions `list`).
 */
export function DirektSprechen({ diskretion, whatsappMessage, titelId = 'bewerbung-kontakt' }: DirektSprechenProps) {
  return (
    <section aria-labelledby={titelId} className="flex flex-col gap-4" data-bewerbung="direkt">
      <div className="flex flex-col gap-2">
        <p className="text-etikett text-ink-2">{DIREKT_TEXT.etikett}</p>
        <h2 id={titelId} className="text-title-3 text-brand">
          {DIREKT_TEXT.titel}
        </h2>
      </div>
      {diskretion ? (
        <p className="flex gap-3 text-callout text-ink">
          <Icon name="shield-check" size="lg" className="shrink-0 text-brand" />
          <span>{diskretion}</span>
        </p>
      ) : null}
      <ContactOptions variant="list" whatsappMessage={whatsappMessage} />
    </section>
  );
}
