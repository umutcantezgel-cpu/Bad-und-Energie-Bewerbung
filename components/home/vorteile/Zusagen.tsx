import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { ZUSAGEN, ZUSAGEN_ID, ZUSAGEN_TITEL } from './vorteile-text';

/**
 * Zusagen des Betriebs (E-START-025): sechs Fakten als ruhige Liste mit Familien-Icons,
 * keine Kennzahl-Kacheln (K-003). Mobil eine Spalte, ab md zwei, ab lg drei; Haarlinie über jedem
 * Eintrag, 3-px-Strich über der Gruppe.
 */
export function Zusagen({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <h3 id={ZUSAGEN_ID} className="text-title-2 text-brand">
        {ZUSAGEN_TITEL}
      </h3>
      <ul
        aria-labelledby={ZUSAGEN_ID}
        className="grid gap-x-8 border-t-[length:var(--m-strich)] border-brand md:grid-cols-2 lg:grid-cols-3"
      >
        {ZUSAGEN.map((zusage) => (
          <li key={zusage.id} className="flex gap-4 border-b border-line py-6">
            <Icon name={zusage.icon} size="lg" className="mt-1 text-brand" />
            <div className="flex min-w-0 flex-col gap-2">
              <h4 className="text-body font-bold text-brand">{zusage.titel}</h4>
              <p className="text-callout text-ink-muted">{zusage.text}</p>
              {zusage.mass && (
                <p className="font-mass text-callout font-medium text-brand">
                  {/* One measure per line („Mo–Do …,“ / „Fr …“), never broken inside a time span. */}
                  {zusage.mass.split(/(?<=,) /).map((teil) => (
                    <span key={teil} className="block whitespace-nowrap">
                      {teil}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
