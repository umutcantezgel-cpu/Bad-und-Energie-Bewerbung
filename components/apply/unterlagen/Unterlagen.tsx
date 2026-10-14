import type { ReactNode } from 'react';
import { TextLink } from '@/components/ui/TextLink';
import { cn } from '@/lib/utils/cn';
import { UNTERLAGEN_ANKER, UNTERLAGEN_TEXT, UNTERLAGEN_ZEILE, unterlagenMailHref, unterlagenWhatsAppHref } from './unterlagen-text';

export interface UnterlagenProps {
  /**
   * Auswahl mit Anbindung (Phase 2), z. B. `<UnterlagenAuswahl adapter={…} nachweis={…} />` aus einer
   * Client-Insel der Integration. Pflicht: Ohne Anbindung steht statt des Abschnitts die `UnterlagenZeile`.
   */
  auswahl: ReactNode;
  /** Id der h2 (Standard `unterlagen-titel`). */
  titelId?: string;
  className?: string;
}

/**
 * Abschnitt „Unterlagen einreichen“ mit Anbindung (E-BEW-012, R5-UPLOAD-01, ab Phase 2). Server-Komponente um die
 * Client-Insel der Auswahl. Einen abgeschalteten Upload-Kasten gibt es nicht mehr (Plan §D): Solange die Anbindung
 * fehlt, steht auf der Seite die `UnterlagenZeile`.
 */
export function Unterlagen({ auswahl, titelId = 'unterlagen-titel', className }: UnterlagenProps) {
  return (
    <section id={UNTERLAGEN_ANKER} aria-labelledby={titelId} className={cn('flex scroll-mt-24 flex-col gap-4', className)} data-unterlagen="an">
      <div className="flex flex-col gap-2">
        <p className="text-etikett text-ink-2">{UNTERLAGEN_TEXT.etikett}</p>
        <h2 id={titelId} className="text-title-3 text-brand">
          {UNTERLAGEN_TEXT.titel}
        </h2>
        <p className="max-w-prose text-callout text-ink-muted">{UNTERLAGEN_TEXT.einleitung}</p>
      </div>
      {auswahl}
    </section>
  );
}

/**
 * Eine klare Zeile statt der Upload-Sackgasse (Plan §D, M-006): Unterlagen gehen später per WhatsApp (vorausgefüllter
 * Text) oder E-Mail (mit Betreff), der erste Schritt braucht keinen Lebenslauf (Fakt noCvNeeded). Ziel des
 * Zweitwegs im Seitenkopf, des Erklärteils und alter Tresor-Links (Anker `#unterlagen`). Server-Komponente ohne JS.
 */
export function UnterlagenZeile({ className }: { className?: string }) {
  return (
    <p id={UNTERLAGEN_ANKER} className={cn('max-w-prose scroll-mt-24 text-callout text-ink', className)} data-unterlagen="zeile">
      {UNTERLAGEN_ZEILE.vor}{' '}
      <TextLink href={unterlagenWhatsAppHref()} target="_blank" rel="noopener noreferrer">
        {UNTERLAGEN_ZEILE.whatsapp}
        <span className="sr-only">{UNTERLAGEN_ZEILE.neuerTab}</span>
      </TextLink>{' '}
      {UNTERLAGEN_ZEILE.oder} <TextLink href={unterlagenMailHref()}>{UNTERLAGEN_ZEILE.mail}</TextLink> {UNTERLAGEN_ZEILE.nach}
    </p>
  );
}
