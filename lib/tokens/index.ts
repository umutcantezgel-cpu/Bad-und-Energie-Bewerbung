/**
 * Design-Tokens für JS (Timer, matchMedia, Inline-Stile, WAAPI). Quelle der Wahrheit ist
 * app/styles/theme.css (KERN 1.0); beide Seiten gleich halten (lib/motion/__tests__/spiegel.test.ts prüft das).
 */
export const TOKENS = {
  /** Bewegung (K-009): vier Dauern in ms; CSS --d-1…--d-4, Utilities duration-d1…d4 */
  motion: {
    d1: 120,
    d2: 240,
    d3: 400,
    d4: 600,
    /** Takt: Verzögerungen nur als Vielfache (CSS --takt) */
    takt: 80,
    /** Längster Auftakt (Uhr rastet auf 13:30 ein) */
    auftaktEnde: 1120,
    /** Sicherheitsnetz des Kopfskripts */
    sicherheitsnetz: 2000,
  },
  /** Kurven (K-009); CSS --k-aus, --k-wechsel, --k-ein, Utilities ease-aus/-wechsel/-ein */
  curves: {
    aus: 'cubic-bezier(0.16, 1, 0.3, 1)',
    wechsel: 'cubic-bezier(0.65, 0, 0.35, 1)',
    ein: 'cubic-bezier(0.32, 0, 0.67, 0)',
    linear: 'linear',
  },
  /** Ältere Namen, auf die Stufen oben abgebildet (CSS duration-fast/-step/-sheet). */
  duration: {
    fast: 120,
    step: 240,
    sheet: 240,
  },
  /** Ältere Namen (CSS ease-standard/-emphasized). */
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    emphasized: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
  /** Abstandsskala (K-007), 11 Stufen in px; CSS --a-1…--a-11 bzw. Tailwind 1·2·3·4·6·8·12·16·20·24·32 */
  space: [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128],
  /** Radien (K-008) in px; CSS rounded-1/-2/-3/-voll */
  radius: { r1: 4, r2: 12, r3: 24, voll: 999 },
  /** Paarabstand der Leitungen und Strichstärke in px (CSS --paar, --m-strich) */
  paar: 12,
  strich: 3,
  /**
   * Druck-Rückmeldung (Register „druck“): 1 px nach unten, nur ohne reduzierte Bewegung
   * (globals.css [data-motion~="druck"]:active). Ersetzt den früheren pressScale 0,98.
   */
  druckVersatz: 1,
  /**
   * Browserleiste (`theme-color`, app/layout.tsx) = Dokumenthintergrund: Papier hell, Nacht dunkel
   * (K-006; CSS --p-papier, --p-nacht; lib/motion/__tests__/spiegel.test.ts hält beide gleich).
   */
  themeColor: {
    light: '#FBF7F0',
    dark: '#0A1033',
  },
  zIndex: {
    header: 30,
    sticky: 30,
    toast: 50,
  },
  /** Min-widths in px, matching Tailwind's default breakpoints */
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

export type Breakpoint = keyof typeof TOKENS.breakpoints;

/** Media query for `window.matchMedia`, e.g. `minWidth('lg')`. */
export function minWidth(breakpoint: Breakpoint): string {
  return `(min-width: ${TOKENS.breakpoints[breakpoint]}px)`;
}
