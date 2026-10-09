import type { ComponentPropsWithRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'children'> {
  summary: ReactNode;
  children: ReactNode;
  /** Same `name` on several disclosures makes them an exclusive accordion. */
  name?: string;
  defaultOpen?: boolean;
}

/**
 * Native <details>/<summary>: works without JS and with find-in-page.
 * The content fades in where ::details-content is supported.
 */
export function Disclosure({ summary, children, name, defaultOpen, className, ...props }: DisclosureProps) {
  return (
    <details
      name={name}
      open={defaultOpen}
      className={cn(
        'group border-b border-line',
        'details-content:opacity-0 details-content:transition details-content:transition-discrete details-content:duration-step details-content:ease-standard',
        'open:details-content:opacity-100',
        className,
      )}
      {...props}
    >
      <summary className="flex min-h-11 list-none items-center justify-between gap-4 py-4 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.75}
          className="size-5 shrink-0 text-ink-muted transition-transform duration-fast ease-standard group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 text-body text-ink-muted">{children}</div>
    </details>
  );
}
