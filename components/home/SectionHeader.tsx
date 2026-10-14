import type { ReactNode } from 'react';
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
   * Entfällt mit E-029: Die Rohrklammer an der Überschrift ist keine Zeichnung der Anlage, sondern Schmuck; Etikett
   * und h2 tragen den Kopf. Die Prop bleibt, damit Aufrufer außerhalb dieses Pakets weiter bauen, und wirkt nicht.
   */
  klammer?: boolean;
}

/**
 * Abschnittskopf (KERN K-005): optionales Etikett, h2 in Bricolage (font-display) und Marken-Navy, Einleitung.
 * Props werden nur ergänzt, nie umbenannt (alle Startseiten-Abschnitte nutzen den Kopf).
 */
export function SectionHeader({ id, title, lead, className, eyebrow }: SectionHeaderProps) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-4', className)}>
      {eyebrow && <p className="text-etikett text-ink-muted">{eyebrow}</p>}
      <h2 id={id} className="text-title-1 text-brand">
        {title}
      </h2>
      {lead && <p className="max-w-prose text-lead text-ink-muted">{lead}</p>}
    </div>
  );
}
