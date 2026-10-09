import { cn } from '@/lib/utils/cn';

export interface SkipLinkProps {
  /** Id of the main landmark, with leading "#". */
  href?: string;
  label?: string;
  className?: string;
}

/** First focusable element on every page; visible only while focused. */
export function SkipLink({ href = '#main', label = 'Zum Inhalt springen', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50',
        'focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-surface focus:px-5',
        'focus:text-callout focus:font-semibold focus:text-ink focus:shadow-lg',
        className,
      )}
    >
      {label}
    </a>
  );
}
