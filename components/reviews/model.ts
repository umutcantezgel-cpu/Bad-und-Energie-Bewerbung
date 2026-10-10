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
  /**
   * Owner reply from Google, word for word (E-START-043), e.g. author „Sabri Demir (Inhaber)“. Without its
   * relative date („Vor einem Jahr“): that ages. Customer reviews only, and only where Google shows one.
   */
  reply?: ReviewReply;
}

export interface ReviewReply {
  author: string;
  text: string;
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

/**
 * Label of the reply toggle. Replies by the owner („Sabri Demir (Inhaber)“) read „Antwort des Inhabers“, so the
 * name does not repeat on every card; the author stands under the opened reply. Anyone else: „Antwort von …“.
 */
export function replyTitle(author: string): string {
  return /\(Inhaber\)\s*$/.test(author) ? 'Antwort des Inhabers' : `Antwort von ${author}`;
}
