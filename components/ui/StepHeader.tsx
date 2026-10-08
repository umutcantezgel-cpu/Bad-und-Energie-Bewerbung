import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { IconButton } from './IconButton';
import { stepProgress } from './helpers';

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

/** Flow header: back · "Schritt n von m" · close, with a progress bar below. */
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
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        {onBack ? (
          <IconButton aria-label={backLabel} onClick={onBack} className="-ml-2.5">
            <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-6" />
          </IconButton>
        ) : (
          <span aria-hidden="true" className="size-11" />
        )}
        <p className="text-callout font-medium tabular-nums text-ink-muted">{label}</p>
        {closeHref ? (
          <IconButton asChild aria-label={closeLabel} className="-mr-2.5">
            <Link href={closeHref}>
              <X aria-hidden="true" strokeWidth={1.75} className="size-6" />
            </Link>
          </IconButton>
        ) : onClose ? (
          <IconButton aria-label={closeLabel} onClick={onClose} className="-mr-2.5">
            <X aria-hidden="true" strokeWidth={1.75} className="size-6" />
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
        className="h-1 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full origin-left bg-ink transition-transform duration-step ease-standard"
          style={{ transform: `scaleX(${stepProgress(current, total)})` }}
        />
      </div>
    </div>
  );
}
