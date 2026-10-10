import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'children'> {
  summary: ReactNode;
  children: ReactNode;
  /** Same `name` on several disclosures makes them an exclusive accordion. */
  name?: string;
  defaultOpen?: boolean;
}

/**
 * Native <details>/<summary>: works without JS and with find-in-page.
 *
 * Zustände (S-06): Ruhe mit Frage in Marken-Navy und Pfeil; Hover nur mit Maus als Fläche (Register „flaeche“,
 * Deckkraft); Fokus über den globalen 3-px-Ring; offen dreht der Pfeil. Inhalt und Pfeil wechseln ohne
 * eigene Bewegung (Arbeitsseiten zeigen nur Rückmeldung).
 */
export function Disclosure({ summary, children, name, defaultOpen, className, ...props }: DisclosureProps) {
  return (
    <details name={name} open={defaultOpen} className={cn('group border-b border-line', className)} {...props}>
      <summary
        data-motion="flaeche"
        className={cn(
          'relative flex min-h-11 list-none items-center justify-between gap-4 rounded-1 py-4 text-body font-bold text-brand [&::-webkit-details-marker]:hidden',
          // Hover-Fläche (Wand-Ton eine Stufe tiefer), ragt seitlich über die Linie hinaus
          'before:pointer-events-none before:absolute before:inset-y-1 before:-inset-x-3 before:rounded-1 before:bg-surface-3 before:opacity-0',
          'before:transition-opacity before:duration-d1 before:ease-ein hover:before:opacity-100 hover:before:duration-d2 hover:before:ease-aus',
        )}
      >
        <span className="relative min-w-0">{summary}</span>
        <Icon name="chevron-down" size="md" className="relative shrink-0 text-brand group-open:rotate-180" />
      </summary>
      <div className="pb-6 text-body text-ink-muted">{children}</div>
    </details>
  );
}
