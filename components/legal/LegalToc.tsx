import { cn } from '@/lib/utils/cn';

export interface LegalTocItem {
  /** Anchor id of the section (without '#'). */
  id: string;
  label: string;
}

export interface LegalTocProps {
  items: readonly LegalTocItem[];
  className?: string;
}

/** Plain anchor list. A card on small screens, a quiet side column on lg (sticky via LegalDocument). */
export function LegalToc({ items, className }: LegalTocProps) {
  return (
    <nav
      aria-labelledby="legal-toc-title"
      className={cn('rounded-lg bg-surface-2 p-5 lg:rounded-none lg:bg-transparent lg:p-0', className)}
    >
      <h2 id="legal-toc-title" className="text-callout font-semibold text-ink">
        Inhalt
      </h2>
      <ol className="mt-2 flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-11 items-center rounded-xs text-callout text-ink-muted underline-offset-4 transition-colors duration-fast ease-standard hover:text-ink hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
