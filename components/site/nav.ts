/**
 * Pure navigation helpers for the site shell (header, mobile menu, sticky apply bar).
 * No imports, so client components can use them without pulling data modules into the bundle.
 */

export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = Object.freeze([
  { href: '/jobs', label: 'Stellen' },
  { href: '/#vorteile', label: 'Vorteile' },
  { href: '/#ablauf', label: 'Ablauf' },
  { href: '/#faq', label: 'FAQ' },
]);

export const APPLY_PATH = '/bewerbung';

/** Id of the embedded application flow on job pages (C9). */
export const FLOW_ANCHOR_ID = 'bewerben';

/**
 * Marks an in-page primary action. While such an element is on screen the sticky apply bar
 * hides, so a viewport never shows two primary buttons. Usage: `<div data-primary-cta>`.
 */
export const PRIMARY_CTA_ATTR = 'data-primary-cta';

/** Elements that hide the sticky apply bar while visible. */
export const STICKY_BAR_HIDE_SELECTOR = `#${FLOW_ANCHOR_ID}, [${PRIMARY_CTA_ATTR}]`;

function normalize(pathname: string | null | undefined): string {
  const path = (pathname ?? '/').split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/** /bewerbung and everything below it: header shows only logo + „Abbrechen“, no sticky bar. */
export function isFocusMode(pathname: string | null | undefined): boolean {
  const path = normalize(pathname);
  return path === APPLY_PATH || path.startsWith(`${APPLY_PATH}/`);
}

/** Exit link in focus mode: „Abbrechen“ inside the flow, „Zur Startseite“ on the thank-you page and the Mappe tool. */
export function focusModeExitLabel(pathname: string | null | undefined): string {
  return normalize(pathname) === APPLY_PATH ? 'Abbrechen' : 'Zur Startseite';
}

/** Page links (not #anchors) are current for their own path and everything below it. */
export function isCurrentNavItem(item: NavItem, pathname: string | null | undefined): boolean {
  if (item.href.includes('#')) return false;
  const path = normalize(pathname);
  return path === item.href || path.startsWith(`${item.href}/`);
}

/** Slug of a job page (/jobs/[slug]), otherwise null. */
export function jobSlugFromPath(pathname: string | null | undefined): string | null {
  const match = /^\/jobs\/([^/]+)$/.exec(normalize(pathname));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Button label on a job page: „Als Kundendiensttechniker bewerben“, „Für die Ausbildung bewerben“. */
export function applyLabelFor(job: { shortTitle: string; category: string }): string {
  return job.category === 'ausbildung' ? 'Für die Ausbildung bewerben' : `Als ${job.shortTitle} bewerben`;
}

export interface StickyApplyAction {
  href: string;
  label: string;
  /** True: jumps to the flow embedded on the same page (plain anchor, no navigation). */
  inPageFlow: boolean;
}

/**
 * What the sticky apply bar shows for a path, or null when it is hidden (focus mode).
 * `jobLabels` maps the slugs of published job pages to their button label.
 */
export function getStickyApplyAction(
  pathname: string | null | undefined,
  jobLabels: Readonly<Record<string, string>>,
): StickyApplyAction | null {
  if (isFocusMode(pathname)) return null;
  const slug = jobSlugFromPath(pathname);
  const label = slug !== null && Object.prototype.hasOwnProperty.call(jobLabels, slug) ? jobLabels[slug] : null;
  if (label) return { href: `#${FLOW_ANCHOR_ID}`, label, inPageFlow: true };
  return { href: APPLY_PATH, label: 'Jetzt bewerben', inPageFlow: false };
}

/** Minimum shrink of the visual viewport (px) that counts as an on-screen keyboard. */
const KEYBOARD_MIN_SHRINK = 120;

/**
 * On-screen keyboard heuristic: a text field has focus and the visual viewport is clearly
 * smaller than the layout viewport. `visualHeight` is visualViewport.height × scale, so pinch
 * zoom does not count; null means the browser has no visualViewport (focus alone decides).
 */
export function isKeyboardOpen(state: {
  editableFocused: boolean;
  layoutHeight: number;
  visualHeight: number | null;
}): boolean {
  if (!state.editableFocused) return false;
  if (state.visualHeight === null) return true;
  return state.layoutHeight - state.visualHeight > KEYBOARD_MIN_SHRINK;
}
