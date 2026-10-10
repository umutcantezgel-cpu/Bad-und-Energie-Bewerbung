import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { AUSSTATTUNG_ID, AUSSTATTUNG_SCHLUSS, AUSSTATTUNG_TITEL, GERAETE } from './vorteile-text';

/**
 * Werkzeug & Fuhrpark (E-START-026) als Stückliste: Position in Mono, Gerät in der Display-Schrift,
 * Piktogramm aus der Icon-Familie, Beschreibung aus den Fakten. Arbeitskleidung als Schlusszeile.
 */
export function Ausstattung({ className }: { className?: string }) {
  return (
    <div id={AUSSTATTUNG_ID} className={cn('flex flex-col gap-6', className)}>
      <h3 id={`${AUSSTATTUNG_ID}-titel`} className="text-title-2 text-brand">
        {AUSSTATTUNG_TITEL}
      </h3>
      <ol aria-labelledby={`${AUSSTATTUNG_ID}-titel`} className="border-t-[length:var(--m-strich)] border-brand">
        {GERAETE.map((geraet, i) => (
          <li
            key={geraet.id}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-line py-6 md:grid-cols-[3rem_minmax(0,5fr)_minmax(0,6fr)] md:gap-x-8"
          >
            <Icon name={geraet.icon} size="xl" className="row-span-2 text-brand md:row-span-1" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-etikett text-ink-muted">
                {String(i + 1).padStart(2, '0')} · {geraet.etikett}
              </p>
              <h4 className="text-title-3 text-brand">{geraet.titel}</h4>
            </div>
            <p className="col-start-2 text-callout text-ink-muted md:col-start-3 md:self-center md:text-body">{geraet.text}</p>
          </li>
        ))}
      </ol>
      <p className="text-callout text-ink-muted">{AUSSTATTUNG_SCHLUSS}</p>
    </div>
  );
}
