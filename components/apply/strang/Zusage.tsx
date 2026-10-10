import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

/** Teilt die Zusage am ersten Doppelpunkt in Kernsatz und Ausführung (Text bleibt wortgleich). */
export function zusageTeile(text: string): [string, string] {
  const index = text.indexOf(':');
  if (index <= 0 || index === text.length - 1) return [text, ''];
  return [text.slice(0, index + 1), text.slice(index + 1)];
}

export interface ZusagenblockProps {
  /** Diskretionszusage (DISCRETION_PROMISE); null oder leer bei der Ausbildung. */
  zusage?: string | null;
  /** Hinweis darunter, z. B. der Datenschutzhinweis vor dem Absenden. */
  children?: ReactNode;
  className?: string;
}

/**
 * Block über dem Absenden-Knopf (R5-APPLY-01, E-BEW-004): die Diskretionszusage mit Schild am Ort der
 * Dateneingabe, darunter der Datenschutzhinweis. Wand-Fläche mit 3-px-Navy-Linie unten: Aus dieser Linie
 * fallen Vorlauf und Rücklauf in den roten Knopf (Button `leitung="oben"`), wie am Handy des Einstiegs
 * aus dem Navy-Block. Die Zusage steht wortgleich, der Kernsatz bis zum Doppelpunkt fett.
 */
export function Zusagenblock({ zusage, children, className }: ZusagenblockProps) {
  const [kern, rest] = zusage ? zusageTeile(zusage) : ['', ''];
  return (
    <div className={cn('flex flex-col gap-3 rounded-t-2 border-b-3 border-brand bg-surface-2 px-4 pt-4 pb-6', className)}>
      {zusage ? (
        <p className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-callout text-ink" data-zusage="diskretion">
          <Icon name="shield-check" size="md" className="mt-0.5 text-brand" />
          <span>
            <strong className="font-bold">{kern}</strong>
            {rest}
          </span>
        </p>
      ) : null}
      {children}
    </div>
  );
}
