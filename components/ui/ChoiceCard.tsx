import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ChoiceContent {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

/** One-tap answer (auto-advance): a toggle button with aria-pressed. */
export interface SingleChoiceCardProps
  extends ChoiceContent,
    Omit<ComponentPropsWithRef<'button'>, 'title' | 'children' | 'type' | 'className'> {
  mode?: 'single';
  selected?: boolean;
}

/** Multi-select answer: a native checkbox inside a label card. */
export interface MultiChoiceCardProps
  extends ChoiceContent,
    Omit<ComponentPropsWithRef<'input'>, 'title' | 'children' | 'type' | 'className' | 'size'> {
  mode: 'multiple';
}

export type ChoiceCardProps = SingleChoiceCardProps | MultiChoiceCardProps;

const card = cn(
  'group flex min-h-16 w-full items-center gap-4 rounded-md border border-line bg-surface px-4 py-3 text-left',
  'transition duration-fast ease-standard hover:border-line-strong active:scale-98',
);

const indicator = cn(
  'ml-auto flex size-6 shrink-0 items-center justify-center border border-line-strong text-surface',
  'transition-colors duration-fast ease-standard',
);

/** Answer card, at least 64px tall. Selected = ink border and check, never accent red. */
export function ChoiceCard(props: ChoiceCardProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = props.description ? `${id}-description` : undefined;

  if (props.mode === 'multiple') {
    const { mode: _mode, title, description, icon, className, disabled, ...inputProps } = props;
    return (
      <label
        className={cn(
          card,
          'cursor-pointer has-checked:border-ink has-checked:ring-1 has-checked:ring-inset has-checked:ring-ink',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          disabled={disabled}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          {...inputProps}
        />
        <ChoiceBody title={title} description={description} icon={icon} titleId={titleId} descriptionId={descriptionId} />
        <span aria-hidden="true" className={cn(indicator, 'rounded-xs group-has-checked:border-ink group-has-checked:bg-ink')}>
          <Check strokeWidth={2.5} className="size-4 opacity-0 group-has-checked:opacity-100" />
        </span>
      </label>
    );
  }

  const { mode: _mode, selected = false, title, description, icon, className, ...buttonProps } = props;
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        card,
        'aria-pressed:border-ink aria-pressed:ring-1 aria-pressed:ring-inset aria-pressed:ring-ink',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...buttonProps}
    >
      <ChoiceBody title={title} description={description} icon={icon} titleId={titleId} descriptionId={descriptionId} />
      <span
        aria-hidden="true"
        className={cn(indicator, 'rounded-full group-aria-pressed:border-ink group-aria-pressed:bg-ink')}
      >
        <Check strokeWidth={2.5} className="size-4 opacity-0 group-aria-pressed:opacity-100" />
      </span>
    </button>
  );
}

interface ChoiceBodyProps extends Omit<ChoiceContent, 'className'> {
  titleId: string;
  descriptionId?: string;
}

function ChoiceBody({ title, description, icon: Icon, titleId, descriptionId }: ChoiceBodyProps) {
  return (
    <>
      {Icon && <Icon aria-hidden="true" strokeWidth={1.75} className="size-6 shrink-0 text-ink-muted" />}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id={titleId} className="text-body font-medium text-ink">
          {title}
        </span>
        {description && (
          <span id={descriptionId} className="text-callout text-ink-muted">
            {description}
          </span>
        )}
      </span>
    </>
  );
}

interface ChoiceGroupBaseProps {
  description?: ReactNode;
  /** Two columns from `sm` for short answers. */
  columns?: 1 | 2;
  className?: string;
  children: ReactNode;
}

/** The group always needs a name: a visible `label` or the id of an existing heading. */
export type ChoiceGroupProps = ChoiceGroupBaseProps &
  (
    | { /** Visible question. */ label: Exclude<ReactNode, null | undefined | boolean | ''>; labelledBy?: never }
    | { /** id of an existing element (e.g. the step heading) that names the group. */ labelledBy: string; label?: never }
  );

/** Labelled group of ChoiceCards (role="group"). */
export function ChoiceGroup({ label, labelledBy, description, columns = 1, className, children }: ChoiceGroupProps) {
  const id = useId();
  const ownLabelId = label ? `${id}-label` : undefined;
  const labelId = labelledBy ?? ownLabelId;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={descriptionId} className={cn('flex flex-col gap-4', className)}>
      {(ownLabelId || description) && (
        <div className="flex flex-col gap-1">
          {ownLabelId && (
            <div id={ownLabelId} className="text-title-3 text-ink">
              {label}
            </div>
          )}
          {description && (
            <p id={descriptionId} className="text-callout text-ink-muted">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn('grid gap-3', columns === 2 && 'sm:grid-cols-2')}>{children}</div>
    </div>
  );
}
