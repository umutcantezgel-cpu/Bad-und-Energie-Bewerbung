import { cn } from '@/lib/utils/cn';

export interface SkipLinkProps {
  /** Id of the main landmark, with leading "#". */
  href?: string;
  label?: string;
  className?: string;
}

/**
 * First focusable element on every page; visible only while focused. Schwebende Ebene (K-008: der eine
 * Schatten), Papier mit Navy-Kontur im Strich und Radius 4 wie die Etiketten; dazu der globale Fokusring.
 */
export function SkipLink({ href = '#main', label = 'Zum Inhalt springen', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50',
        'focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-1 focus:border-(length:--m-strich) focus:border-brand focus:bg-surface focus:px-6',
        'focus:text-callout focus:font-bold focus:text-brand focus:shadow-lg',
        className,
      )}
    >
      {label}
    </a>
  );
}
