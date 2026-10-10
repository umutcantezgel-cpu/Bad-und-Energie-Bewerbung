import type { ReactNode } from 'react';
import { Rohrklammer } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';

export interface SectionHeaderProps {
  /** Id of the <h2>; the surrounding <Section> points its aria-labelledby here. */
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  /** Etikett über der Überschrift (Planbeschriftung in Martian Mono, Versalien über text-etikett). */
  eyebrow?: ReactNode;
  /**
   * Rohrklammer als Marke links an der Überschrift (B Runde 1, Variante 1): Vorlauf oben, Rücklauf unten,
   * Bögen --r-2. Rein grafisch (aria-hidden); passt zu zweizeiligen Überschriften.
   */
  klammer?: boolean;
}

/**
 * Rohrklammer aus components/zeichnung (R3-HOME-01, eine Zeichnung für alle Seiten). Der Rahmen setzt Lage und
 * Höhe: von 0,2 em unter der Oberkante bis 0,2 em über der Unterkante der Überschrift (Variante 1 `.klammer`).
 */
function Klammer() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute top-[0.2em] bottom-[0.2em] left-0">
      <Rohrklammer />
    </span>
  );
}

/**
 * Abschnittskopf (KERN K-005): optionales Etikett, h2 in Bricolage (font-display) und Marken-Navy, Einleitung.
 * Props werden nur ergänzt, nie umbenannt (alle Startseiten-Abschnitte nutzen den Kopf).
 */
export function SectionHeader({ id, title, lead, className, eyebrow, klammer = false }: SectionHeaderProps) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-4', className)}>
      {eyebrow && <p className="text-etikett text-ink-muted">{eyebrow}</p>}
      <h2 id={id} className={cn('text-title-1 text-brand', klammer && 'relative pl-8')}>
        {klammer && <Klammer />}
        {title}
      </h2>
      {lead && <p className="max-w-prose text-lead text-ink-muted">{lead}</p>}
    </div>
  );
}
