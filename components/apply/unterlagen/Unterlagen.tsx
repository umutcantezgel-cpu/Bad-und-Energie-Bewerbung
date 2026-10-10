import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { UNTERLAGEN_ANKER, UNTERLAGEN_TEXT, unterlagenMailHref, unterlagenWhatsAppHref } from './unterlagen-text';
import styles from './unterlagen.module.css';

export interface UnterlagenProps {
  /**
   * Auswahl mit Anbindung (Phase 2), z. B. `<UnterlagenAuswahl adapter={…} nachweis={…} />` aus einer
   * Client-Insel der Integration. Ohne sie steht der ehrliche Hinweis mit WhatsApp und E-Mail.
   */
  auswahl?: ReactNode;
  /** Id der h2 (Standard `unterlagen-titel`). */
  titelId?: string;
  className?: string;
}

/**
 * Abschnitt „Unterlagen einreichen“ (E-BEW-012, E-START-007, R5-UPLOAD-01). Server-Komponente: Im Betrieb ohne
 * Anbindung kommt kein JavaScript dazu. Der Hinweis ist sichtbar anders (gestrichelte Ablage auf Wand, K-011
 * „Deaktiviert“) und nennt den Grund als Text; die zwei Wege, die heute funktionieren, stehen als Knöpfe mit
 * Navy-Kontur daneben. Kein Erfolgs- oder Prüfstatus, kein Wort „Upload“.
 */
export function Unterlagen({ auswahl, titelId = 'unterlagen-titel', className }: UnterlagenProps) {
  return (
    <section
      id={UNTERLAGEN_ANKER}
      aria-labelledby={titelId}
      className={cn('flex scroll-mt-24 flex-col gap-4', className)}
      data-unterlagen={auswahl ? 'an' : 'aus'}
    >
      <div className="flex flex-col gap-2">
        <p className="text-etikett text-ink-2">{UNTERLAGEN_TEXT.etikett}</p>
        <h2 id={titelId} className="text-title-3 text-brand">
          {UNTERLAGEN_TEXT.titel}
        </h2>
        <p className="max-w-prose text-callout text-ink-muted">{UNTERLAGEN_TEXT.einleitung}</p>
      </div>
      {auswahl ?? <UnterlagenHinweis />}
    </section>
  );
}

/**
 * Ehrlich abgeschaltet: die Ablage gestrichelt auf Wand mit dem Grund als Text, darunter die zwei Wege, die
 * heute funktionieren (WhatsApp mit vorausgefülltem Text, E-Mail mit Betreff), und der Tipp zur Zuordnung.
 */
export function UnterlagenHinweis() {
  return (
    <div className="flex flex-col gap-3" data-unterlagen-hinweis="">
      <div className={styles.ablage} data-zustand="aus">
        <span className={styles.kasten}>
          <Icon name="file-text" size="lg" />
        </span>
        <p className={styles.ablageText}>
          <span className="text-callout font-bold text-ink">{UNTERLAGEN_TEXT.hinweis}</span>
          <span className="text-callout text-ink">{UNTERLAGEN_TEXT.hinweisWeg}</span>
        </p>
      </div>
      <div className={styles.wege}>
        <Button asChild variant="secondary" wrap>
          <a href={unterlagenWhatsAppHref()} target="_blank" rel="noopener noreferrer">
            <Icon name="message-circle" size="md" />
            {UNTERLAGEN_TEXT.whatsapp}
            <span className="sr-only">{UNTERLAGEN_TEXT.neuerTab}</span>
          </a>
        </Button>
        <Button asChild variant="secondary" wrap>
          <a href={unterlagenMailHref()}>
            <Icon name="mail" size="md" />
            {UNTERLAGEN_TEXT.mail}
          </a>
        </Button>
      </div>
      <p className="text-footnote text-ink-muted">{UNTERLAGEN_TEXT.tipp}</p>
    </div>
  );
}
