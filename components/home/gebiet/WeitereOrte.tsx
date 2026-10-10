import { cn } from '@/lib/utils/cn';
import { ORT_FEHLT, WEITERE_ORTE_TITLE, weitereOrte } from './gebiet-text';

/**
 * E-START-029: die übrigen Orte des Einsatzgebiets als ruhige Zeile, nicht klickbar (Pass, Freiraum:
 * Textzeile statt Pillen), ohne Entfernung und Fahrzeit (B17). Darunter der Weg für fehlende Orte.
 */
export function WeitereOrte({ id = 'weitere-orte-titel', className }: { id?: string; className?: string }) {
  const orte = weitereOrte();
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-4', className)}>
      <h3 id={id} className="text-etikett text-ink-muted">
        {WEITERE_ORTE_TITLE}
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-x-2 gap-y-1 p-0 text-body text-ink">
        {orte.map((name, i) => (
          <li key={name} className="inline-flex items-center gap-2">
            {name}
            {i < orte.length - 1 && (
              <span aria-hidden="true" className="text-ink-muted">
                ·
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-body text-ink">
        {ORT_FEHLT.question}{' '}
        <span className="whitespace-nowrap">
          {ORT_FEHLT.action}{' '}
          <a
            href={ORT_FEHLT.phoneHref}
            className="rounded-1 font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            <span className="ziffer">{ORT_FEHLT.phoneDisplay}</span>
          </a>
        </span>
      </p>
    </section>
  );
}
