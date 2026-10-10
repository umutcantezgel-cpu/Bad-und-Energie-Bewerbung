import { Etikettkasten } from '@/components/zeichnung';
import { cn } from '@/lib/utils/cn';
import { AUSSTATTUNG_ID, AUSSTATTUNG_SCHLUSS, AUSSTATTUNG_TITEL, GERAETE } from './vorteile-text';

/**
 * Werkzeug & Fuhrpark (E-START-026) als Stückliste, der eine Ort für Hilti und Fahrzeug in #vorteile (E-023):
 * Position und Gerät im Etiketten-Kästchen mit Familien-Icon (wie WÄRMEPUMPEN · HEIZUNGEN · BÄDER an der
 * Zeichnung des Einstiegs), Gerät in der Display-Schrift, Beschreibung aus den Fakten. Arbeitskleidung als
 * Schlusszeile. Sprungziel /#ausstattung.
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
            className="grid gap-x-8 gap-y-3 border-b border-line py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
          >
            <div className="flex min-w-0 flex-col items-start gap-3">
              <Etikettkasten icon={geraet.icon}>
                {String(i + 1).padStart(2, '0')} · {geraet.etikett}
              </Etikettkasten>
              <h4 className="text-title-3 text-brand">{geraet.titel}</h4>
            </div>
            <p className="text-callout text-ink-muted md:self-center md:text-body">{geraet.text}</p>
          </li>
        ))}
      </ol>
      <p className="text-callout text-ink-muted">{AUSSTATTUNG_SCHLUSS}</p>
    </div>
  );
}
