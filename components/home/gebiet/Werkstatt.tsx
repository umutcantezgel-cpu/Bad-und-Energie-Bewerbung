import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { ROUTE_LABEL, WERKSTATT, routeUrl } from './gebiet-text';

/** Giebel 45° wie das Haus in der Mitte des Plans (K-010): Hier startet der Tag. */
function HausZeichen() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-9 shrink-0 text-brand" fill="none">
      <path
        d="M4 21V11L12 3L20 11V21Z"
        className="fill-waerme"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * E-START-030 + E-START-040: Werkstatt und Lager mit Adresse, „Kurze Rüstzeiten“ und dem Routenlink
 * als normalem Link (neuer Tab, kein Referrer, nichts lädt vor dem Klick).
 */
export function Werkstatt({ id = 'werkstatt-titel', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-6 rounded-2 bg-surface-2 p-6 sm:p-8', className)}>
      <div className="flex items-start gap-4">
        <HausZeichen />
        <div className="flex flex-col gap-2">
          <h3 id={id} className="text-title-3 text-brand">
            {WERKSTATT.title}
          </h3>
          <address className="text-body not-italic text-ink">
            {WERKSTATT.street}
            <br />
            <span className="ziffer">{WERKSTATT.postalCode}</span> {WERKSTATT.city}
          </address>
        </div>
      </div>
      <p className="max-w-prose text-body text-ink">
        <strong className="font-bold text-brand">{WERKSTATT.ruestzeitTitle}:</strong> {WERKSTATT.ruestzeitText}
      </p>
      <a
        href={routeUrl()}
        target="_blank"
        rel="noopener noreferrer"
        data-motion="druck"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-1 font-semibold text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        {ROUTE_LABEL}
        <Icon name="arrow-right" size="sm" />
        <span className="sr-only"> (öffnet in einem neuen Tab)</span>
      </a>
    </section>
  );
}
