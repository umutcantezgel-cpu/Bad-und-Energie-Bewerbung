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
              {/* Separator before the item it introduces, so a wrapped line never ends in „›“. */}
              {i > 0 && <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0" />}
              {item.href && !isCurrent ? (
                // Short labels: the pseudo element widens the hit area to at least 44px without
                // moving the text; it reaches into the chevrons but not into the neighbouring link.
                <Link
                  href={item.href}
                  className="relative inline-flex min-h-11 items-center rounded-xs underline-offset-4 transition-colors duration-fast ease-standard after:absolute after:inset-y-0 after:-inset-x-2 hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} className={cn(isCurrent && 'text-ink')}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
