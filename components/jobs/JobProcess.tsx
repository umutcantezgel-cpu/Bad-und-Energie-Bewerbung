import { DISCRETION_PROMISE, PROCESS_INTRO, getProcessSteps, type ProcessAudience } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

export interface JobProcessProps {
  audience: ProcessAudience;
  className?: string;
}

/** Compact three-step process for a job page; step 3 depends on the question set. */
export function JobProcess({ audience, className }: JobProcessProps) {
  const steps = getProcessSteps(audience);
  return (
    <section aria-labelledby="stelle-ablauf" className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-2">
        <h2 id="stelle-ablauf" className="text-title-3 text-ink">
          {PROCESS_INTRO.title}
        </h2>
        <p className="max-w-prose text-body text-ink-muted">{PROCESS_INTRO.text}</p>
      </div>
      <ol className="flex flex-col gap-6">
        {steps.map((step) => (
          <li key={step.id} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-callout font-semibold tabular-nums text-ink"
            >
              {step.number}
            </span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="text-body font-semibold text-ink">
                <span className="sr-only">Schritt {step.number}: </span>
                {step.title}
              </h3>
              <p className="max-w-prose text-body text-ink-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {audience === 'fachkraft' && <p className="max-w-prose text-callout text-ink-muted">{DISCRETION_PROMISE}</p>}
    </section>
  );
}
