import Link from 'next/link';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { IconButton } from './IconButton';
import { stepMarks, stepProgress } from './helpers';

export interface StepHeaderProps {
  /** 1-based. */
  current: number;
  total: number;
  /** Shows the back button; omit on the first step. */
  onBack?: () => void;
  backLabel?: string;
  /** Close button as link (e.g. back to the job page) or handler. */
  closeHref?: string;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}

/**
 * Flow header: back · „Schritt n von m“ (mono label) · close, with the progress strand below
 * (R4-UI-01, E-BEW-003). The strand is a measuring chain: the planned line is dashed, a mark stands at
 * the start and end of every step, and the red Vorlauf runs from the start to the current step, on
 * its way to the send button at the end of the flow (K-001). On a step change it slides to the new
 * mark in d-2 (240 ms ≤ 300 ms, Register `fortschritt`); with reduced motion it stands there at once.
 */
export function StepHeader({
  current,
  total,
  onBack,
  backLabel = 'Zurück',
  closeHref,
  onClose,
  closeLabel = 'Bewerbung abbrechen',
  className,
}: StepHeaderProps) {
  const label = `Schritt ${current} von ${total}`;
  const anteil = stepProgress(current, total);
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        {onBack ? (
          <IconButton aria-label={backLabel} onClick={onBack} className="-ml-2.5">
            <Icon name="arrow-left" size="lg" />
          </IconButton>
        ) : (
          <span aria-hidden="true" className="size-11" />
        )}
        <p className="text-etikett text-ink-2">{label}</p>
        {closeHref ? (
          <IconButton asChild aria-label={closeLabel} className="-mr-2.5">
            <Link href={closeHref}>
              <Icon name="x" size="lg" />
            </Link>
          </IconButton>
        ) : onClose ? (
          <IconButton aria-label={closeLabel} onClick={onClose} className="-mr-2.5">
            <Icon name="x" size="lg" />
          </IconButton>
        ) : (
          <span aria-hidden="true" className="size-11" />
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Fortschritt"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={label}
        className="relative h-3.75"
      >
        {/* Die geplante Leitung: gestrichelt wie im Plan, nur vor dem Vorlauf (sonst schimmern die Striche durch) */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1.5 border-t-3 border-dashed border-line-strong"
          style={{ clipPath: `inset(0 0 0 ${anteil * 100}%)` }}
        />
        {/* Der Vorlauf bis zum aktuellen Schritt; sein Ende liegt unter der Marke */}
        <span
          aria-hidden="true"
          data-motion="fortschritt"
          className="absolute inset-x-0 top-1.5 h-0.75 origin-left bg-vorlauf transition-transform duration-d2 ease-aus"
          style={{ transform: `scaleX(${anteil})` }}
        />
        {stepMarks(total).map((mark) => (
          <span
            key={mark}
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 w-0.75 -translate-x-1/2 rounded-voll transition-colors duration-d2 ease-aus',
              mark <= anteil ? 'bg-brand' : 'bg-line-strong',
            )}
            style={{ left: `${mark * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
