import type { ReactNode } from 'react';
import { Rohrklammer } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  /** Etikett über dem Titel (Planbeschriftung in Versalien über text-etikett), z. B. "Seit 1926 · Wetzlar". */
  eyebrow?: ReactNode;
  title: ReactNode;
  /**
   * Zweitzeile unter dem Titel mit der Rohrklammer (wie „Ehrliches Handwerk. Pünktlich Feierabend.“ im
   * Einstieg): Bricolage title-3, Tinte 2.
   */
  unterzeile?: ReactNode;
  lead?: ReactNode;
  /**
   * Rohrklammer an der Einleitung, wenn keine Unterzeile da ist (Standard an; bei `align="center"` aus).
   * Vorlauf oben, Rücklauf unten, rein grafisch.
   */
  klammer?: boolean;
  /** Rendered below the lead: buttons, tags, meta facts. */
  children?: ReactNode;
  /** Placed above the eyebrow, e.g. <Breadcrumbs>. */
  before?: ReactNode;
  /** `display` for the home hero, `title` for inner pages. */
  size?: 'display' | 'title';
  align?: 'start' | 'center';
  titleId?: string;
  /** Extra classes for the h1, e.g. a smaller size on phones for long single-word titles. */
  titleClassName?: string;
  className?: string;
}

/**
 * Rohrklammer neben einer Textzeile: Höhe vom Text (oben und unten um den Weißraum der Zeile eingerückt),
 * Breite --a-5; der Text steht mit pl-8 (--a-6) daneben wie im Einstieg.
 */
function Klammer({ einzug }: { einzug: 'titel' | 'text' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-0',
        einzug === 'titel' ? 'top-[0.2em] bottom-[0.2em]' : 'top-[0.4em] bottom-[0.4em]',
      )}
    >
      <Rohrklammer />
    </span>
  );
}

/**
 * Seitenkopf in der Sprache des Einstiegs (ruhige Fassung, KERN K-005): Etikett in Versalien, die einzige
 * <h1> in Bricolage 800 und Marken-Navy, darunter Zweitzeile oder Einleitung mit der Rohrklammer.
 */
export function PageHeader({
  eyebrow,
  title,
  unterzeile,
  lead,
  klammer = true,
  children,
  before,
  size = 'title',
  align = 'start',
  titleId,
  titleClassName,
  className,
}: PageHeaderProps) {
  const zentriert = align === 'center';
  const klammerAmLead = klammer && !zentriert && !unterzeile;

  return (
    <header className={cn('flex flex-col gap-4', zentriert && 'items-center text-center', className)}>
      {before}
      {eyebrow && <p className="-mb-2 text-etikett text-ink-2">{eyebrow}</p>}
      {/* wrap-break-word: a word wider than the column breaks instead of scrolling the page. */}
      <h1
        id={titleId}
        className={cn('max-w-4xl text-brand wrap-break-word', size === 'display' ? 'text-display' : 'text-title-1', titleClassName)}
      >
        {title}
      </h1>
      {unterzeile && (
        <p className={cn('max-w-3xl text-title-3 text-ink-2', klammer && !zentriert && 'relative pl-8')}>
          {klammer && !zentriert && <Klammer einzug="titel" />}
          {unterzeile}
        </p>
      )}
      {lead && (
        <p className={cn('max-w-prose text-lead text-ink-2', klammerAmLead && 'relative pl-8')}>
          {klammerAmLead && <Klammer einzug="text" />}
          {lead}
        </p>
      )}
      {children && (
        <div className={cn('mt-2 flex flex-wrap items-center gap-3', zentriert && 'justify-center')}>{children}</div>
      )}
    </header>
  );
}
