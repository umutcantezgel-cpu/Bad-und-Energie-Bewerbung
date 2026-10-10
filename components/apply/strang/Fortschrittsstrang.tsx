import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Leitungspaar } from '@/components/zeichnung/Leitungspaar';
import { cn } from '@/lib/utils/cn';

export interface FortschrittsstrangProps {
  /** Namen der Schritte in Reihenfolge (SCHRITTNAMEN). */
  schritte: readonly string[];
  /** Aktueller Schritt, ab 1. */
  aktuell: number;
  /** Zurück zum vorigen Schritt; fehlt auf dem ersten Schritt. */
  onBack?: () => void;
  className?: string;
}

/**
 * Kopf des Bewerbungsflows (R5-APPLY-01, E-BEW-002/003): Zähler als Etikett wie „100 Jahre Meisterbetrieb“
 * über der h1 des Einstiegs, rechts der Rückweg, darunter das Leitungspaar (Vorlauf rot oben, Rücklauf blau
 * unten, Register `fortschritt`) statt eines Balkens. Der sichtbare Zähler ist für Screenreader verborgen:
 * Das Leitungspaar trägt `role="progressbar"` mit „Schritt n von m: Name“ in `aria-valuetext`.
 * Die Zeile behält ihre Höhe auch ohne Zurück-Knopf, damit der Strang beim Schrittwechsel nicht springt.
 */
export function Fortschrittsstrang({ schritte, aktuell, onBack, className }: FortschrittsstrangProps) {
  const anzahl = schritte.length;
  const nummer = Math.min(Math.max(Math.round(aktuell), 1), Math.max(anzahl, 1));
  const name = schritte[nummer - 1];

  return (
    <div className={cn('flex flex-col gap-3', className)} data-strang="">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <p aria-hidden="true" className="text-etikett text-balance text-ink-2">
          Schritt <span className="font-mass">{nummer}</span> von <span className="font-mass">{anzahl}</span>
          {name ? <span className="text-brand"> · {name}</span> : null}
        </p>
        {onBack ? (
          <IconButton aria-label="Zurück" onClick={onBack} className="-mr-2.5">
            <Icon name="arrow-left" size="lg" />
          </IconButton>
        ) : null}
      </div>
      <Leitungspaar schritte={schritte} aktuell={nummer} zaehler={false} />
    </div>
  );
}
