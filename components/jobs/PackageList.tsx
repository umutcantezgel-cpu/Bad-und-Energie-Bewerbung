import { cn } from '@/lib/utils/cn';

export interface PackageListItem {
  label: string;
  text: string;
}

export interface PackageListProps {
  items: readonly PackageListItem[];
  className?: string;
}

/** Label/value rows with hairlines, for „Dein Paket“ and „Auf einen Blick“. */
export function PackageList({ items, className }: PackageListProps) {
  if (items.length === 0) return null;
  return (
    <dl className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 py-4 sm:grid sm:grid-cols-3 sm:gap-6">
          <dt className="text-callout font-medium text-ink">{item.label}</dt>
          <dd className="text-body text-ink-muted sm:col-span-2">{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}
