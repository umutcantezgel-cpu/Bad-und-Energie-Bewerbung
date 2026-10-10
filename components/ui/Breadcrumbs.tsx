import Link from 'next/link';
import { Icon } from '@/components/icons';
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

/**
 * Pfad über dem Seitenkopf. Links wie TextLink (unterstrichen; Hover nur mit Maus: kräftiger Strich in
 * Rücklaufblau), Druck 1 px (Register „druck“), Fokus über den globalen 3-px-Ring. Die aktuelle Seite steht
 * in Tinte ohne Link.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Brotkrümelnavigation" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 text-callout text-ink-2">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              {/* Separator before the item it introduces, so a wrapped line never ends in „›“. */}
              {i > 0 && <Icon name="chevron-right" size="sm" className="shrink-0" />}
              {item.href && !isCurrent ? (
                // Short labels: the pseudo element widens the hit area to at least 44px without
                // moving the text; it reaches into the chevrons but not into the neighbouring link.
                <Link
                  href={item.href}
                  data-motion="druck"
                  className="relative inline-flex min-h-11 items-center rounded-1 underline decoration-1 underline-offset-4 after:absolute after:inset-y-0 after:-inset-x-2 hover:text-ink hover:decoration-2 hover:decoration-ruecklauf"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} className={cn(isCurrent && 'font-bold text-ink')}>
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
