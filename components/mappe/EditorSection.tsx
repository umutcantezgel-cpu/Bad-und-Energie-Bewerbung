import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EditorSectionProps {
  id: string;
  /** Position in the editor (1-based), shown before the title. */
  step: number;
  title: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** One numbered editor step with an h2. Stacked on mobile, left column on desktop. */
export function EditorSection({ id, step, title, description, className, children }: EditorSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cn('flex flex-col gap-6 border-t border-line pt-10', className)}>
      <header className="flex flex-col gap-2">
        <h2 id={titleId} className="flex items-baseline gap-3 text-title-3 text-ink">
          <span aria-hidden="true" className="tabular-nums text-ink-muted">
            {step}
          </span>
          <span>{title}</span>
        </h2>
        {description && <p className="max-w-prose text-callout text-ink-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}
