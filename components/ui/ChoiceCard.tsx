import { useId, type ComponentPropsWithRef, type ComponentType, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

/** A component that draws an icon from a className (e.g. an older lucide icon); kept for compatibility. */
type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false'; strokeWidth?: number }>;

interface ChoiceContent {
  title: ReactNode;
  description?: ReactNode;
  /** Icon of the family (components/icons) by name; an icon component still works. */
  icon?: IconName | IconComponent;
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

/*
 * Answer card of the form system (R4-UI-01, E-BEW-003): radius 12, 2 px contour on the raised
 * surface. Hover (fine pointer) turns the contour navy; selected fills the card navy with a cream
 * indicator and check (dark mode and inverse band: cream fill, navy text), never accent red and never
 * a glow. The fill changes in d-2 (240 ms ≤ 300 ms), the way out in d-1; with reduced motion it
 * switches at once. Press 1 px down (Register `druck`).
 */
const card = cn(
  'group flex min-h-16 w-full items-center gap-4 rounded-2 border-2 border-line-strong bg-surface-raised px-4 py-3 text-left text-ink',
  'transition-colors duration-d1 ease-ein pointer-fine:hover:border-brand pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
);

const indicator = cn(
  'ml-auto flex size-7 shrink-0 items-center justify-center border-2 border-line-strong bg-surface-raised text-brand',
  'transition-colors duration-d1 ease-ein',
);

/** Answer card, at least 64px tall. Selected = navy fill with check, never accent red. */
export function ChoiceCard(props: ChoiceCardProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = props.description ? `${id}-description` : undefined;

  if (props.mode === 'multiple') {
    const { mode: _mode, title, description, icon, className, disabled, ...inputProps } = props;
    return (
      <label
        data-motion="druck"
        className={cn(
          card,
          'cursor-pointer has-checked:border-brand has-checked:bg-brand has-checked:text-surface has-checked:duration-d2 has-checked:ease-aus',
          'has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
          disabled && 'pointer-events-none border-dashed text-ink-2',
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
        <span aria-hidden="true" className={cn(indicator, 'rounded-1 group-has-checked:border-surface group-has-checked:bg-surface')}>
          <Icon name="check" size="sm" className="opacity-0 group-has-checked:opacity-100" />
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
      data-motion="druck"
      className={cn(
        card,
        'aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-surface aria-pressed:duration-d2 aria-pressed:ease-aus',
        'disabled:pointer-events-none disabled:border-dashed disabled:text-ink-2',
        className,
      )}
      {...buttonProps}
    >
      <ChoiceBody title={title} description={description} icon={icon} titleId={titleId} descriptionId={descriptionId} />
      <span
        aria-hidden="true"
        className={cn(indicator, 'rounded-voll group-aria-pressed:border-surface group-aria-pressed:bg-surface')}
      >
        <Icon name="check" size="sm" className="opacity-0 group-aria-pressed:opacity-100" />
      </span>
    </button>
  );
}

interface ChoiceBodyProps extends Omit<ChoiceContent, 'className'> {
  titleId: string;
  descriptionId?: string;
}

const BODY_ICON = 'size-6 shrink-0 text-brand group-aria-pressed:text-surface group-has-checked:text-surface';

function ChoiceBody({ title, description, icon, titleId, descriptionId }: ChoiceBodyProps) {
  const OwnIcon = typeof icon === 'string' ? null : icon;
  return (
    <>
      {typeof icon === 'string' && <Icon name={icon} size="lg" className={BODY_ICON} />}
      {OwnIcon && <OwnIcon aria-hidden="true" className={BODY_ICON} />}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span id={titleId} className="text-body font-bold">
          {title}
        </span>
        {description && (
          <span
            id={descriptionId}
            className="text-callout text-ink-2 transition-colors duration-d1 ease-ein group-aria-pressed:text-surface group-has-checked:text-surface"
          >
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
            <div id={ownLabelId} className="text-title-3 text-brand">
              {label}
            </div>
          )}
          {description && (
            <p id={descriptionId} className="text-callout text-ink-2">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn('grid gap-3', columns === 2 && 'sm:grid-cols-2')}>{children}</div>
    </div>
  );
}
