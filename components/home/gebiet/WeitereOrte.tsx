import Link from 'next/link';
import { Icon } from '@/components/icons';
import { TextLink } from '@/components/ui/TextLink';
import { cn } from '@/lib/utils/cn';
import { ALLE_ORTE_LINK, ORT_FEHLT, WEITERE_ORTE_TITLE, weitereOrteMitSeite } from './gebiet-text';

/**
 * E-START-029: die übrigen Orte des Einsatzgebiets als ruhige Zeile (Pass, Freiraum: Textzeile statt Pillen),
 * ohne Entfernung und Fahrzeit. Seit den Ortsseiten (E-028) ist jeder Ort mit eigener Seite ein Link dorthin
 * (Strecke und Fahrzeit stehen dort), darunter der Weg zur Gebietsseite mit allen Orten. Jeder Ort trägt vorn den
 * Ortspunkt des Plans; so endet keine umbrochene Zeile mit einem Trennzeichen. Darunter der Weg für fehlende Orte
 * mit dem Telefon als eigenem Ziel (≥ 44 px, K-011).
 */
export function WeitereOrte({ id = 'weitere-orte-titel', className }: { id?: string; className?: string }) {
  const orte = weitereOrteMitSeite();
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-4', className)}>
      <h3 id={id} className="text-etikett text-ink-2">
        {WEITERE_ORTE_TITLE}
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-x-6 p-0 text-body text-ink">
        {orte.map((ort) => (
          <li key={ort.name} className="inline-flex min-h-11 items-center gap-2">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand" />
            {ort.href ? (
              <Link
                href={ort.href}
                data-motion="druck"
                className="relative inline-flex min-h-11 items-center rounded-1 underline decoration-1 underline-offset-4 after:absolute after:inset-y-0 after:-inset-x-2 hover:decoration-2 hover:decoration-ruecklauf"
              >
                {ort.name}
              </Link>
            ) : (
              ort.name
            )}
          </li>
        ))}
      </ul>
      <TextLink href={ALLE_ORTE_LINK.href} standalone>
        {ALLE_ORTE_LINK.label}
        <Icon name="arrow-right" size="sm" className="shrink-0" />
      </TextLink>
      <p className="mt-2 flex flex-col items-start gap-1 text-body text-ink">
        <span>
          {ORT_FEHLT.question} {ORT_FEHLT.action}
        </span>
        <a
          href={ORT_FEHLT.phoneHref}
          data-motion="druck"
          className="inline-flex min-h-11 items-center gap-2 rounded-1 font-semibold text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          <Icon name="phone" size="md" className="shrink-0 text-brand" />
          <span className="ziffer">{ORT_FEHLT.phoneDisplay}</span>
        </a>
      </p>
    </section>
  );
}
