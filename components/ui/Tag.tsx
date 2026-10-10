import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type TagProps = ComponentPropsWithRef<'span'>;

/**
 * Etikett-Kästchen für Merkmale (e.g. "Vollzeit"), wie die Beschriftungen an der Zeichnung des Einstiegs:
 * Papier, Navy-Kontur im Strich, Radius 4, Planschrift in Versalien (text-etikett). Not interactive.
 */
export function Tag({ className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-1 border-(length:--m-strich) border-brand bg-surface px-2 py-1 text-etikett text-brand',
        className,
      )}
      {...props}
    />
  );
}
