import { cva, type VariantProps } from 'class-variance-authority';

/*
 * Class recipes for Button and IconButton, kept free of cn()/tailwind-merge. Client components
 * that are on every page (header, mobile menu, sticky apply bar) style plain <a>/<button>
 * elements with these strings, so tailwind-merge stays out of the shared client bundle.
 * Add only classes that do not conflict with the recipe; for overrides use <Button className>.
 */

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-semibold',
    'transition duration-fast ease-standard active:scale-98',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
        secondary: 'bg-surface-3 text-ink hover:bg-line',
        outline: 'border border-line-strong text-ink hover:bg-surface-2',
        ghost: 'text-ink hover:bg-surface-2',
        /** Ink fill: navy on light surfaces, white inside the inverse band. */
        contrast: 'bg-ink text-surface hover:bg-ink/90',
        link: 'rounded-xs text-ink underline decoration-1 underline-offset-4 hover:decoration-2',
      },
      size: {
        // 40px visual height; the pseudo element extends the hit area to at least 44px. It is
        // positioned from the padding box, so 3px per side also covers the 1px border of `outline`.
        sm: 'text-callout after:absolute after:inset-x-0 after:-inset-y-0.75',
        md: 'text-body',
        lg: 'text-body',
        xl: 'text-body',
      },
      /**
       * `true`: long labels wrap onto more lines and the button grows (the size becomes a
       * minimum height). For narrow containers such as the sticky apply bar.
       */
      wrap: {
        false: 'whitespace-nowrap',
        true: 'whitespace-normal px-4 py-2 text-center leading-tight text-balance',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      // One line: fixed height (40/44/52/56 px). Wrapping: the same as minimum height and a
      // narrower side padding (px-4, set by `wrap`), so long words still fit on small phones.
      { size: 'sm', wrap: false, className: 'h-10 px-4' },
      { size: 'sm', wrap: true, className: 'min-h-10' },
      { size: 'md', wrap: false, className: 'h-11 px-5' },
      { size: 'md', wrap: true, className: 'min-h-11' },
      { size: 'lg', wrap: false, className: 'h-13 px-6' },
      { size: 'lg', wrap: true, className: 'min-h-13' },
      { size: 'xl', wrap: false, className: 'h-14 px-8' },
      { size: 'xl', wrap: true, className: 'min-h-14' },
      // Last, so cn() in <Button> lets it win over the padding above.
      { variant: 'link', className: 'px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      wrap: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 select-none items-center justify-center rounded-full',
    'transition duration-fast ease-standard active:scale-98',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        ghost: 'text-ink hover:bg-surface-2',
        secondary: 'bg-surface-3 text-ink hover:bg-line',
        outline: 'border border-line-strong text-ink hover:bg-surface-2',
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
      },
      size: {
        md: 'size-11',
        lg: 'size-13',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

export type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>;
