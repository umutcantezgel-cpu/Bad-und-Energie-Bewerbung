import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (always the last item). */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Brotkrümelnavigation" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 text-callout text-ink-muted">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-xs underline-offset-4 transition-colors duration-fast ease-standard hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} className={cn(isCurrent && 'text-ink')}>
                  {item.label}
                </span>
              )}
              {!isCurrent && <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
