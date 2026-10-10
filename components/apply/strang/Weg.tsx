import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface WegProps {
  href: string;
  /** Familien-Icon im Kästchen (components/icons, ab md). */
  icon: IconName;
  /** Was der Weg ist, z. B. „Direkt per WhatsApp“. */
  titel: ReactNode;
  /** Eine Zeile, was der Klick tut. */
  text: ReactNode;
  /** Fremdes Ziel (z. B. WhatsApp) in neuem Tab; der Zusatz für Screenreader nennt es. */
  neuerTab?: { hinweis: string };
  className?: string;
}

/**
 * Ein anderer Weg zur Bewerbung (R5-APPLY-01, E-BEW-001): ein einziger Link mit Familien-Icon im
 * Etiketten-Kästchen (3 px Navy wie „WÄRMEPUMPEN“ an der Zeichnung des Einstiegs), Titel als Zweitweg mit
 * 3-px-Unterstrich und Pfeil, darunter die erklärende Zeile. Die ganze Fläche ist Trefferfläche (≥ 44 px),
 * per Tab erreichbar, Fokus über den globalen Ring. Hover nur mit feinem Zeiger: Strich wird Rücklaufblau.
 */
export function Weg({ href, icon, titel, text, neuerTab, className }: WegProps) {
  const klassen = cn(
    'group grid min-h-11 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1 rounded-1 py-1 text-ink',
    className,
  );
  const inhalt = (
    <>
      <span
        aria-hidden="true"
        className="row-span-2 flex size-11 items-center justify-center rounded-1 border-3 border-brand bg-surface text-brand"
      >
        <Icon name={icon} size="md" />
      </span>
      <span className="pt-2 font-bold leading-snug">
        <span className="underline decoration-brand decoration-3 underline-offset-4 pointer-fine:group-hover:decoration-ruecklauf">
          {titel}
        </span>
        <Icon name="arrow-right" size="sm" className="ml-2 inline-block align-[-0.15em] text-brand" />
        {neuerTab ? <span className="sr-only"> ({neuerTab.hinweis})</span> : null}
      </span>{' '}
      <span className="text-callout text-ink-2">{text}</span>
    </>
  );

  if (neuerTab) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={klassen} data-motion="druck">
        {inhalt}
      </a>
    );
  }
  return (
    <Link href={href} className={klassen} data-motion="druck">
      {inhalt}
    </Link>
  );
}
