import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './mappe.module.css';
import { MAPPE_ABSCHNITTE, STAND_TEXT } from './stand';

export interface EditorSectionProps {
  id: string;
  /** Position in the editor (1-based), shown in the label above the title. */
  step: number;
  title: string;
  description?: ReactNode;
  /** Section counts as done for the Mappe-Stand (E-BEW-006); shown as a check or „offen“ in the label. */
  done?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * One editor step in the pattern of the SectionHeader (E-023): label in caps (Martian Mono) with number and
 * state, h2 in Bricolage navy, short intro. Stacked on mobile, left column on desktop. The id is the jump
 * target of the checklist (MappeStand); scroll-margin keeps the label clear of the sticky header.
 */
export function EditorSection({ id, step, title, description, done = false, className, children }: EditorSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cn(styles.abschnitt, className)} data-erledigt={done ? '' : undefined}>
      <header className="flex flex-col gap-2">
        <p className={cn(styles.abschnittEtikett, 'text-etikett text-ink-2')}>
          <span>
            Abschnitt <span className="font-mass">{step}</span> von <span className="font-mass">{MAPPE_ABSCHNITTE.length}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className={styles.abschnittZustand}>
            {done ? <Icon name="check" size="sm" className={styles.abschnittHaken} /> : null}
            {done ? STAND_TEXT.erledigt : STAND_TEXT.offen}
          </span>
        </p>
        <h2 id={titleId} className="text-title-2 text-brand">
          {title}
        </h2>
        {description && <p className="max-w-prose text-callout text-ink-2">{description}</p>}
      </header>
      {children}
    </section>
  );
}
