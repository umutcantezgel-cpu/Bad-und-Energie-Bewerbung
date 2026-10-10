import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { ORT_FEHLT, WEITERE_ORTE_TITLE, weitereOrte } from './gebiet-text';

/**
 * E-START-029: die übrigen Orte des Einsatzgebiets als ruhige Zeile, nicht klickbar (Pass, Freiraum:
 * Textzeile statt Pillen), ohne Entfernung und Fahrzeit (B17). Jeder Ort trägt vorn den Ortspunkt des
 * Plans; so endet keine umbrochene Zeile mit einem Trennzeichen. Darunter der Weg für fehlende Orte mit
 * dem Telefon als eigenem Ziel (≥ 44 px, K-011).
 */
export function WeitereOrte({ id = 'weitere-orte-titel', className }: { id?: string; className?: string }) {
  const orte = weitereOrte();
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-4', className)}>
      <h3 id={id} className="text-etikett text-ink-2">
        {WEITERE_ORTE_TITLE}
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-body text-ink">
        {orte.map((name) => (
          <li key={name} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand" />
            {name}
          </li>
        ))}
      </ul>
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
