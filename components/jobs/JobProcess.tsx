import { Icon } from '@/components/icons';
import { Rohrklammer } from '@/components/zeichnung/Rohrklammer';
import { getDiscretionPromise, getProcessIntro, getProcessSteps, type ProcessAudience } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

export interface JobProcessProps {
  audience: ProcessAudience;
  className?: string;
}

const STRICH = 'border-(length:--m-strich)';

/**
 * Leitungsstrang des Ablaufs (wie #ablauf der Startseite, Variante 1 Formsystem): Vorlauf und Rücklauf als
 * Paar an den drei Schritten entlang, mobil senkrecht mit Bogen unten, ab lg waagerecht mit Bogen rechts.
 * Rein grafisch (aria-hidden), ohne Bewegung.
 */
function Leitungsstrang() {
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-[calc(var(--paar)+var(--m-strich))] rounded-b-voll lg:hidden ${STRICH} border-t-0 border-r-ruecklauf border-b-vorlauf border-l-vorlauf`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 left-0 hidden h-[calc(var(--paar)+var(--m-strich))] rounded-r-voll lg:block ${STRICH} border-l-0 border-t-vorlauf border-r-vorlauf border-b-ruecklauf`}
      />
    </>
  );
}

/**
 * Ablauf in drei Schritten (Schritt 3 hängt vom Fragenset ab), im Design von #ablauf der Startseite:
 * Etikett, h2 mit Rohrklammer, Schritte mit Nummer in Martian Mono am Leitungsstrang, darunter die
 * Diskretionszusage (nicht bei der Ausbildung).
 */
export function JobProcess({ audience, className }: JobProcessProps) {
  const steps = getProcessSteps(audience);
  const intro = getProcessIntro(audience);
  const discretion = getDiscretionPromise(audience);
  return (
    <section aria-labelledby="stelle-ablauf" className={cn('flex flex-col gap-12', className)}>
      <div className="flex max-w-3xl flex-col gap-4">
        <p className="text-etikett text-ink-muted">Ablauf</p>
        <h2 id="stelle-ablauf" className="relative pl-8 text-title-1 text-brand">
          <span aria-hidden="true" className="pointer-events-none absolute top-[0.2em] bottom-[0.2em] left-0">
            <Rohrklammer />
          </span>
          {intro.title}
        </h2>
        <p className="max-w-prose text-lead text-ink-muted">{intro.text}</p>
      </div>

      <div className="relative">
        <ol className="grid gap-12 py-2 pl-12 lg:grid-cols-3 lg:gap-8 lg:pt-12 lg:pb-0 lg:pl-0">
          {steps.map((step) => (
            <li key={step.id} className="relative flex flex-col gap-3">
              {/* Abgang in Navy vom Strang zur Schrittnummer: mobil waagerecht, ab lg senkrecht */}
              <span aria-hidden="true" className="relative self-start">
                <span className="absolute top-1/2 right-full mr-3 h-(--m-strich) w-6 -translate-y-1/2 bg-brand lg:hidden" />
                <span className="absolute bottom-full left-0 mb-3 hidden h-6 w-(--m-strich) bg-brand lg:block" />
                <span className="font-mass text-lead font-semibold text-brand">{String(step.number).padStart(2, '0')}</span>
              </span>
              <h3 className="text-title-3 text-brand">
                <span className="sr-only">Schritt {step.number}: </span>
                {step.title}
              </h3>
              <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <Leitungsstrang />
      </div>

      {discretion && (
        <p className="flex max-w-prose items-start gap-3 text-lead text-ink">
          <span className="flex h-[1lh] shrink-0 items-center">
            <Icon name="shield-check" size="lg" className="text-brand" />
          </span>
          {discretion}
        </p>
      )}
    </section>
  );
}
