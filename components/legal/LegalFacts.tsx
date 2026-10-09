import { Fragment, type ReactNode } from 'react';
import { TextLink, type TextLinkProps } from '@/components/ui/TextLink';
import { cn } from '@/lib/utils/cn';

export interface LegalFact {
  label: string;
  value: ReactNode;
}

export interface LegalFactsProps {
  items: readonly LegalFact[];
  className?: string;
}

/**
 * Label/value pairs (address, register, contact) as a definition list: stacked on phones,
 * two columns from sm. Opts out of prose styling, so links inside use TextLink. Long e-mail
 * addresses and URLs wrap anywhere. Proportional figures on purpose: Inter's tnum also widens
 * the hyphen („Siegmund-Hiepe-Str.“, „E-Mail“, „1408-900“), and single values need no columns.
 */
export function LegalFacts({ items, className }: LegalFactsProps) {
  return (
    <dl
      className={cn(
        'not-prose my-6 grid grid-cols-[minmax(0,1fr)] gap-y-1 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-baseline sm:gap-x-6 sm:gap-y-2',
        className,
      )}
    >
      {items.map((item) => (
        <Fragment key={item.label}>
          <dt className="text-callout text-ink-muted">{item.label}</dt>
          <dd className="mb-3 text-body text-ink wrap-anywhere last:mb-0 sm:mb-0">{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

/**
 * Link as a fact value (phone, e-mail, website). Same line height as the text rows, so the list
 * keeps one rhythm and the labels line up. The pseudo element grows the inline box (about 20px,
 * the font's content area) to 44px on phones (stacked rows, it only reaches into the label above)
 * and to just under the row pitch from sm, so neighbouring links never overlap.
 */
export function LegalFactLink({ className, ...props }: Omit<TextLinkProps, 'standalone'>) {
  return (
    <TextLink {...props} className={cn('relative after:absolute after:inset-x-0 after:-inset-y-3 sm:after:-inset-y-1.5', className)} />
  );
}
