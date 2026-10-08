import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  /** Short sentence-case line above the title, e.g. "Seit 1926 · Wetzlar". */
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Rendered below the lead: buttons, tags, meta facts. */
  children?: ReactNode;
  /** Placed above the eyebrow, e.g. <Breadcrumbs>. */
  before?: ReactNode;
  /** `display` for the home hero, `title` for inner pages. */
  size?: 'display' | 'title';
  align?: 'start' | 'center';
  titleId?: string;
  className?: string;
}

/** Page intro with the page's only <h1>. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  before,
  size = 'title',
  align = 'start',
  titleId,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      {before}
      {eyebrow && <p className="text-callout font-medium text-ink-muted">{eyebrow}</p>}
      <h1 id={titleId} className={cn('max-w-4xl text-ink', size === 'display' ? 'text-display' : 'text-title-1')}>
        {title}
      </h1>
      {lead && <p className="max-w-prose text-lead text-ink-muted">{lead}</p>}
      {children && (
        <div className={cn('mt-2 flex flex-wrap items-center gap-3', align === 'center' && 'justify-center')}>
          {children}
        </div>
      )}
    </header>
  );
}
