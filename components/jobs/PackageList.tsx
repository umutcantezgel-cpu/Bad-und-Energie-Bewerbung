import { cn } from '@/lib/utils/cn';

export interface PackageListItem {
  label: string;
  text: string;
  /** Wert als Maß in Martian Mono (nur echte Maße; seit E-030 steht hier kein Betrag mehr). */
  mass?: boolean;
}

export interface PackageListProps {
  items: readonly PackageListItem[];
  className?: string;
}

/**
 * Etikett-Wert-Zeilen mit Haarlinien („Auf einen Blick“): Etikett in Versalien (Martian Mono), Wert im
 * Fließtext; ein Maß (`mass`) in Martian Mono und Marken-Navy. „Lohn: auf Anfrage“ ist kein Maß (E-030).
 */
export function PackageList({ items, className }: PackageListProps) {
  if (items.length === 0) return null;
  return (
    <dl className={cn('border-t-(length:--m-strich) border-brand', className)}>
      {items.map((item) => {
        const mass = item.mass ?? false;
        return (
          <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 sm:grid sm:grid-cols-3 sm:gap-6">
            <dt className="text-etikett text-ink-muted sm:pt-1">{item.label}</dt>
            <dd className={cn('sm:col-span-2', mass ? 'font-mass text-lead font-semibold text-brand' : 'text-body text-ink')}>
              {item.text}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
