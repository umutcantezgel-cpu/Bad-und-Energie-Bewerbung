/**
 * Messgrößen des Einzigartigkeits-Gates (gate.test.ts): Wörter, 5-Wort-Shingles, Jaccard und Satzgerüste.
 * Liegt neben den Tests, weil nur das Gate sie braucht; kein Seiten-Code importiert dieses Modul.
 */

/** Wörter und Zahlen in Kleinschreibung; „4,5“ und „3.600“ bleiben ein Token. */
export function tokens(text: string): string[] {
  return text.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+(?:[.,]\p{N}+)*/gu) ?? [];
}

export function wordCount(text: string): number {
  return tokens(text).length;
}

/** Menge der n-Wort-Shingles (Standard 5). Kürzere Texte ergeben ein einziges Shingle. */
export function shingles(text: string, size = 5): Set<string> {
  const words = tokens(text);
  const out = new Set<string>();
  if (words.length === 0) return out;
  if (words.length < size) {
    out.add(words.join(' '));
    return out;
  }
  for (let i = 0; i + size <= words.length; i += 1) out.add(words.slice(i, i + size).join(' '));
  return out;
}

export function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/** Zahlen wie im Text geschrieben: „8“, „4,5“, „3.600“, „35578“. */
export const NUMBER_PATTERN = /\d+(?:[.,]\d+)*/g;

export function numbersIn(text: string): string[] {
  return text.match(NUMBER_PATTERN) ?? [];
}

/** Sätze an Satzzeichen mit folgendem Leerraum; geschützte Leerzeichen zählen als Leerraum. */
export function sentences(text: string): string[] {
  return text
    .replace(/ /g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Satzgerüst: Namen durch ⟨ORT⟩, Zahlen durch ⟨N⟩ ersetzt. `names` zuerst die längsten, damit
 * „Heuchelheim an der Lahn“ vor „Heuchelheim“ greift.
 */
export function skeleton(sentence: string, names: readonly string[], placeholder = '⟨ORT⟩'): string {
  let out = sentence.replace(/ /g, ' ');
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(?<![\\p{L}-])${escapeRegExp(name)}(?![\\p{L}-])`, 'gu'), placeholder);
  }
  return out.replace(NUMBER_PATTERN, '⟨N⟩').replace(/\s+/g, ' ').trim();
}

/** Anteil der Seiten (0–1), auf denen das häufigste Satzgerüst vorkommt, und das Gerüst selbst. */
export function maxSkeletonShare(pages: readonly (readonly string[])[]): { share: number; skeleton: string; pages: number } {
  const counts = new Map<string, number>();
  for (const page of pages) for (const s of new Set(page)) counts.set(s, (counts.get(s) ?? 0) + 1);
  let best = { share: 0, skeleton: '', pages: 0 };
  for (const [s, n] of counts) if (n / pages.length > best.share) best = { share: n / pages.length, skeleton: s, pages: n };
  return best;
}
