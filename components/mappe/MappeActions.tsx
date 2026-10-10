'use client';

import type { ReactNode, RefObject } from 'react';
import { Icon } from '@/components/icons';
import { Button, ProgressRing } from '@/components/ui';
import { CONTACT_PHONE } from '@/lib/data/contact';
import { cn } from '@/lib/utils/cn';
import styles from './mappe.module.css';
import { sprungKlick } from './MappeStand';
import { STAND_TEXT, type MappeStandWerte } from './stand';

export type MappeFeedback =
  | { kind: 'none' }
  | { kind: 'error'; message: string; showContact: boolean }
  | { kind: 'sent'; reference: string };

export type SaveStatus = 'idle' | 'saved' | 'unavailable';

export interface MappeActionsProps {
  /** `followUp` when this browser tab already sent an application (STORAGE_KEYS.submitted). */
  mode: 'apply' | 'followUp';
  reference?: string;
  busy: boolean;
  onPrimary: () => void;
  onPrint: () => void;
  /** Stand der Mappe (E-BEW-006/007): Ring und „Als Nächstes“. */
  stand: MappeStandWerte;
  /** WhatsApp link with the prefilled share text (E-BEW-020, lib/apply/whatsapp-message.ts). */
  whatsappHref: string;
  feedback: MappeFeedback;
  /** Focus target for errors, so keyboard users land on the message. */
  feedbackRef: RefObject<HTMLDivElement | null>;
  saveStatus: SaveStatus;
  /** Phone, WhatsApp and e-mail (server-rendered ContactOptions). */
  contact?: ReactNode;
  className?: string;
}

const SAVE_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saved: 'Deine Angaben bleiben in diesem Browser-Tab gespeichert, bis du ihn schließt.',
  unavailable: 'Speichern im Browser ist nicht möglich. Lass diesen Tab offen, bis du fertig bist.',
};

/**
 * Pult der Mappe: der Stand als Ring (E-BEW-007, ProgressRing aus R4) mit dem nächsten offenen Abschnitt und die
 * eine rote Hauptaktion; Vorlauf und Rücklauf laufen aus dem Ring in den Knopf (Button `leitung`, wie im Einstieg).
 * Dann die Zweitwege: als PDF speichern und per WhatsApp schicken (E-BEW-020).
 */
export function MappeActions({
  mode,
  reference,
  busy,
  onPrimary,
  onPrint,
  stand,
  whatsappHref,
  feedback,
  feedbackRef,
  saveStatus,
  contact,
  className,
}: MappeActionsProps) {
  const primaryLabel = mode === 'followUp' ? 'Mappe nachreichen' : 'Mit dieser Mappe bewerben';
  const primaryHint =
    mode === 'followUp' ? (
      reference ? (
        <>
          Wird an deine Bewerbung <span className="whitespace-nowrap">{reference}</span> angehängt.
        </>
      ) : (
        'Wird an deine Bewerbung angehängt.'
      )
    ) : (
      'Im nächsten Schritt schickst du deine Bewerbung ab. Die Mappe wird angehängt.'
    );
  const naechster = stand.naechster;

  return (
    // No flex gap: the live regions below stay in the DOM while empty (so they announce reliably)
    // and must not add space then. Only children with content get the step.
    <div className={cn(styles.pult, 'rounded-2 bg-surface-2 print-hidden', className)} data-mappe-pult="">
      {/* Ring, Hauptaktion und „Als Nächstes“ in einem Raster: schmal steht der Knopf unter dem Ring und das Paar
          fällt hinein, breit steht er daneben und das Paar läuft waagerecht hinein (Containerabfrage im CSS). */}
      <div className={styles.pultOben}>
        <div className={styles.pultRing}>
          <ProgressRing value={stand.erledigt} max={stand.gesamt} label={STAND_TEXT.ring} caption={STAND_TEXT.erledigt} />
        </div>
        <div className={styles.pultNaechster}>
          <p className="text-etikett text-ink-2">{naechster ? STAND_TEXT.naechster : STAND_TEXT.titel}</p>
          {naechster ? (
            <a
              href={`#${naechster.id}`}
              onClick={sprungKlick(naechster.id)}
              className={cn(styles.pultSprung, 'rounded-1')}
              data-motion="druck"
            >
              <span>{naechster.titel}</span>
              <Icon name="arrow-down" size={18} className={styles.pultSprungIkon} />
            </a>
          ) : (
            <p className="text-callout font-bold text-brand">{STAND_TEXT.fertig}</p>
          )}
        </div>
        <div className={styles.pultHaupt}>
          <Button size="lg" leitung="oben" loading={busy} onClick={onPrimary} className={styles.pultKnopf}>
            {primaryLabel}
            <Icon name="arrow-right" size="md" />
          </Button>
          <p className="text-footnote text-ink-2">{primaryHint}</p>
        </div>
      </div>

      <div className={styles.pultWege}>
        <div className={styles.pultWeg}>
          <Button variant="outline" onClick={onPrint} fullWidth>
            <Icon name="printer" size="md" />
            Als PDF speichern
          </Button>
          <p className="text-footnote text-ink-2">Öffnet den Druckdialog: „Als PDF speichern“ wählen oder direkt drucken.</p>
        </div>
        <div className={styles.pultWeg}>
          <Button variant="outline" fullWidth asChild>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-mappe-whatsapp="">
              <Icon name="message-circle" size="md" />
              Per WhatsApp schicken
              <span className="sr-only"> (öffnet WhatsApp in einem neuen Tab)</span>
            </a>
          </Button>
          <p className="text-footnote text-ink-2">
            Vorausgefüllter Text an <span className="whitespace-nowrap">{CONTACT_PHONE.display}</span>. Das PDF hängst du danach im Chat an.
          </p>
        </div>
      </div>

      <div role="status" aria-live="polite">
        {feedback.kind === 'sent' && (
          <p className="flex items-start gap-2 text-callout text-ink">
            <Icon name="circle-check" size="md" className="mt-0.5 shrink-0 text-success" />
            <span>
              Deine Mappe ist angekommen und gehört jetzt zu deiner Bewerbung{' '}
              <span className="whitespace-nowrap">{feedback.reference}</span>.
            </span>
          </p>
        )}
      </div>

      {feedback.kind === 'error' && (
        <div ref={feedbackRef} tabIndex={-1} role="alert" className="flex flex-col gap-3 rounded-2 bg-danger-subtle p-4 focus:outline-none">
          <p className="flex items-start gap-2 text-callout font-bold text-ink">
            <Icon name="circle-alert" size="md" className="mt-0.5 shrink-0 text-danger" />
            <span>{feedback.message}</span>
          </p>
          {feedback.showContact && contact && (
            <div className="flex flex-col gap-1">
              <p className="text-callout text-ink">Deine Angaben bleiben erhalten. Du erreichst uns auch direkt:</p>
              {contact}
            </div>
          )}
        </div>
      )}

      <p role="status" className="text-footnote text-ink-2">
        {SAVE_TEXT[saveStatus]}
      </p>
    </div>
  );
}
