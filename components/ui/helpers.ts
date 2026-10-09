/** Pure helpers behind the UI primitives (unit-tested in __tests__/helpers.test.ts). */

/** Hrefs that leave the Next router: other origins, mail, phone, WhatsApp and in-page anchors. */
export function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href);
}

/** German one-decimal rating, e.g. 5 → "5,0". */
export function formatRating(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Fill level (0–1) of each star, e.g. (4.5, 5) → [1, 1, 1, 1, 0.5]. */
export function starFills(value: number, max = 5): number[] {
  return Array.from({ length: max }, (_, i) => clamp(value - i, 0, 1));
}

/** Share of completed steps (0–1); `current` is 1-based. */
export function stepProgress(current: number, total: number): number {
  return total > 0 ? clamp(current / total, 0, 1) : 0;
}

/** Joins id references for aria-describedby; non-strings (e.g. `hint && hintId` with no hint) are dropped. */
export function joinIds(...ids: unknown[]): string | undefined {
  const joined = ids.filter((id): id is string => typeof id === 'string' && id.trim() !== '').join(' ');
  return joined || undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
