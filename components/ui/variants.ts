import { cva, type VariantProps } from 'class-variance-authority';

/*
 * Class recipes for Button and IconButton, kept free of cn()/tailwind-merge. Client components
 * that are on every page (header, mobile menu, sticky apply bar) style plain <a>/<button>
 * elements with these strings, so tailwind-merge stays out of the shared client bundle.
 * Add only classes that do not conflict with the recipe; for overrides use <Button className>.
 *
 * Formsystem (R4-UI-01, KERN K-008/K-009/K-011): the primary is the red „Jetzt bewerben“ of the
 * Einstieg (components/home/einstieg, Variante 1 `.aktion`): radius 4, bold, 56 px at lg; hover and
 * press as a full overlay (::before, Register `druck`: Eingang d-2/k-aus, Ausgang d-1/k-ein), hover
 * only with a fine pointer, press 1 px down (globals: [data-motion~="druck"], here also as a class
 * for the shell strings without data-motion). Secondary is the navy contour of „Kreislauf zeigen“
 * and of the menu button in Variante 1 (3 px, Register `flaeche`), tertiary the underlined text of the
 * Einstieg's Zweitweg. Focus comes from globals (3 px Rücklaufblau, 3 px offset).
 */

/** Overlay for hover and press (::before under the label; the button isolates its own stack). */
const DECKSCHICHT = [
  'before:absolute before:inset-0 before:-z-1 before:rounded-1 before:opacity-0',
  'before:transition-opacity before:duration-d1 before:ease-ein',
  'pointer-fine:hover:before:opacity-100 pointer-fine:hover:before:duration-d2 pointer-fine:hover:before:ease-aus',
  'active:before:opacity-100 active:before:transition-none',
];

export const buttonVariants = cva(
  [
    'relative isolate inline-flex shrink-0 select-none items-center justify-center gap-3 rounded-1 font-bold',
    'transition-colors duration-d1 ease-ein pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
    'motion-safe:active:translate-y-px',
    'disabled:pointer-events-none aria-disabled:pointer-events-none aria-busy:cursor-progress',
  ],
  {
    variants: {
      variant: {
        /** The one red action per view (E-016). Disabled: wall surface, no red (B Runde 1). */
        primary: [
          ...DECKSCHICHT,
          'bg-accent text-on-accent before:bg-accent-hover active:before:bg-accent-press',
          'disabled:bg-surface-3 disabled:text-ink-2 aria-disabled:not-data-loading:bg-surface-3 aria-disabled:not-data-loading:text-ink-2',
        ],
        /** Navy contour, 3 px. Disabled: dashed contour. */
        secondary: [
          ...DECKSCHICHT,
          'border-3 border-brand text-ink before:bg-surface-3 active:before:bg-line',
          'disabled:border-dashed disabled:border-line-strong disabled:text-ink-2',
        ],
        /** Quieter contour (3 px line-strong) that turns navy on hover. */
        outline: [
          ...DECKSCHICHT,
          'border-3 border-line-strong text-ink before:bg-surface-3 active:before:bg-line pointer-fine:hover:border-brand',
          'disabled:border-dashed disabled:text-ink-2',
        ],
        ghost: [...DECKSCHICHT, 'text-ink before:bg-surface-3 active:before:bg-line disabled:text-ink-2'],
        /** Navy fill: navy on light surfaces, cream inside the inverse band and in dark mode. */
        contrast: [
          ...DECKSCHICHT,
          'bg-brand text-surface before:bg-ink-2 active:before:bg-ink',
          'disabled:bg-surface-3 disabled:text-ink-2',
        ],
        /** Tertiary: text with a 3 px underline (Zweitweg of the Einstieg); hover turns it Rücklaufblau. */
        link: [
          'text-ink underline decoration-brand decoration-3 underline-offset-4',
          'pointer-fine:hover:decoration-ruecklauf active:decoration-ruecklauf disabled:text-ink-2 disabled:decoration-line-strong',
        ],
      },
      size: {
        // 40px visual height; the pseudo element extends the hit area to at least 44px. It is
        // positioned from the padding box, so -6px per side also covers the 3px contour.
        // leading after the type step: tailwind-merge drops a line height that precedes a font size.
        sm: 'text-callout leading-tight after:absolute after:-inset-x-0.75 after:-inset-y-1.5',
        md: 'text-body leading-tight',
        lg: 'text-body leading-tight',
        xl: 'text-body leading-tight',
      },
      /**
       * `true`: long labels wrap onto more lines and the button grows (the size becomes a
       * minimum height). For narrow containers such as the sticky apply bar.
       */
      wrap: {
        false: 'whitespace-nowrap',
        true: 'whitespace-normal px-4 py-2 text-center text-balance',
      },
      fullWidth: {
        true: 'w-full',
      },
      /**
       * Vorlauf and Rücklauf run into the button (Einstieg, Variante 1): `oben` falls from above as
       * on the phone, `rechts` comes in from the drawing on the right as on the desktop. Length 32 px;
       * override with `after:h-*` / `after:w-*`. Not with size `sm` (its ::after is the hit area).
       */
      leitung: {
        oben: 'after:absolute after:right-6 after:bottom-full after:h-8 after:w-3.75 after:border-x-3 after:border-l-vorlauf after:border-r-ruecklauf',
        rechts:
          'after:absolute after:top-1/2 after:left-full after:h-3.75 after:w-8 after:-translate-y-1/2 after:border-y-3 after:border-t-vorlauf after:border-b-ruecklauf',
      },
    },
    compoundVariants: [
      // One line: fixed height (40/44/56/64 px; lg = --m-knopf, the Einstieg's main action).
      // Wrapping: the same as minimum height and a narrower side padding (px-4, set by `wrap`),
      // so long words still fit on small phones.
      { size: 'sm', wrap: false, className: 'h-10 px-4' },
      { size: 'sm', wrap: true, className: 'min-h-10' },
      { size: 'md', wrap: false, className: 'h-11 px-5' },
      { size: 'md', wrap: true, className: 'min-h-11' },
      { size: 'lg', wrap: false, className: 'h-14 px-6' },
      { size: 'lg', wrap: true, className: 'min-h-14' },
      { size: 'xl', wrap: false, className: 'h-16 px-8' },
      { size: 'xl', wrap: true, className: 'min-h-16' },
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
    'relative isolate inline-flex shrink-0 select-none items-center justify-center rounded-1',
    'transition-colors duration-d1 ease-ein pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus',
    'motion-safe:active:translate-y-px',
    'disabled:pointer-events-none disabled:text-ink-2',
    ...DECKSCHICHT,
  ],
  {
    variants: {
      variant: {
        ghost: 'text-ink before:bg-surface-3 active:before:bg-line',
        secondary: 'border-3 border-brand text-ink before:bg-surface-3 active:before:bg-line disabled:border-dashed disabled:border-line-strong',
        outline:
          'border-3 border-line-strong text-ink before:bg-surface-3 active:before:bg-line pointer-fine:hover:border-brand disabled:border-dashed',
        primary: 'bg-accent text-on-accent before:bg-accent-hover active:before:bg-accent-press disabled:bg-surface-3',
      },
      size: {
        md: 'size-11',
        lg: 'size-14',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

export type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>;
