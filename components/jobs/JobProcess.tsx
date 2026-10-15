import { Icon } from '@/components/icons';
import { Rohrklammer } from '@/components/zeichnung/Rohrklammer';
import { getDiscretionPromise, getProcessIntro, getProcessSteps, sammelAblauf, type ProcessAudience } from '@/lib/content';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { ABLAUF_LISTE, AblaufNummer, AblaufStrang } from './AblaufStrang';
import { AblaufVarianten } from './AblaufVarianten';

export interface JobProcessProps {
  audience: ProcessAudience;
  /**
   * Diskretionszusage unter den Schritten (Standard an; bei der Ausbildung nie). Die Themenseite „Diskret wechseln“
   * nennt sie schon im Kopf und schaltet sie hier ab, damit der Satz nicht zweimal auf der Seite steht.
   */
  zusage?: boolean;
  /**
   * Sammelfläche (/jobs, „Diskret wechseln“): die gezeigten Stellen. Dann Schritt 3 mit „Für Fachkräfte: …“ und
   * darunter je anderer Stellenart, was anders läuft (sammelAblauf; Prüfung E-029, Runde 3). Nur mit `fachkraft`.
   */
  stellen?: readonly Job[];
  className?: string;
}

/**
 * Ablauf in drei Schritten (Schritt 3 hängt vom Fragenset ab), im Design von #ablauf der Startseite:
 * Etikett, h2 mit Rohrklammer, Schritte mit Nummer in Martian Mono am Leitungsstrang, auf Sammelflächen die anderen
 * Abläufe (AblaufVarianten), darunter die Diskretionszusage (nicht bei der Ausbildung).
 */
export function JobProcess({ audience, zusage = true, stellen, className }: JobProcessProps) {
  const { schritte: steps, varianten } =
    stellen && audience === 'fachkraft' ? sammelAblauf(stellen) : { schritte: getProcessSteps(audience), varianten: [] };
  const intro = getProcessIntro(audience);
  const discretion = zusage ? getDiscretionPromise(audience) : null;
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
        <ol className={ABLAUF_LISTE}>
          {steps.map((step) => (
            <li key={step.id} className="relative flex flex-col gap-3">
              <AblaufNummer nummer={step.number} />
              <h3 className="text-title-3 text-brand">
                <span className="sr-only">Schritt {step.number}: </span>
                {step.title}
              </h3>
              <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <AblaufStrang />
      </div>

      <AblaufVarianten varianten={varianten} />

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
