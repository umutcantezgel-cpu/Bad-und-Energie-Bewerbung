/** Review types and filters shared by server and client. No data imports: keeps the client small. */

export type ReviewFilter = 'alle' | 'kunden' | 'team';
export type ReviewKind = 'kunde' | 'team';

export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  quote: string;
  name: string;
  /** e.g. "Kunde Wärmepumpenanlage" or "Anlagenmechaniker SHK". */
  role: string;
  /** "Google-Bewertung" or "Aus dem Team". */
  source: string;
  /** Stars, customer reviews only. */
  rating?: number;
}

export const REVIEW_FILTERS: readonly { value: ReviewFilter; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'kunden', label: 'Kunden' },
  { value: 'team', label: 'Team' },
];

export function filterReviewItems(items: readonly ReviewItem[], filter: ReviewFilter): ReviewItem[] {
  if (filter === 'kunden') return items.filter((item) => item.kind === 'kunde');
  if (filter === 'team') return items.filter((item) => item.kind === 'team');
  return [...items];
}

/** Alternates both kinds (starting with `first`) until one runs out, then appends the rest. */
export function interleave<T>(first: readonly T[], second: readonly T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < Math.max(first.length, second.length); i++) {
    if (i < first.length) result.push(first[i]);
    if (i < second.length) result.push(second[i]);
  }
  return result;
}
