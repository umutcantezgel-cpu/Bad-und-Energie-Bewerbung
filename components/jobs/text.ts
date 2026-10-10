/** Pure text helpers for the job pages (unit-tested in app/jobs/__tests__). */

const SOFT_HYPHEN = '­';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Carries the soft hyphens of `titleShy` over to another text with the same long words,
 * e.g. seo.h1 „Anlagenmechaniker SHK (m/w/d) in Wetzlar“ → „Anlagen­mechaniker SHK …“.
 * Only whole words are replaced, so „Anlagenmechanikerin“ would stay untouched.
 */
export function withSoftHyphens(text: string, titleShy: string): string {
  let result = text;
  const words = new Set(titleShy.split(/\s+/).filter((word) => word.includes(SOFT_HYPHEN)));
  for (const shy of words) {
    const plain = shy.split(SOFT_HYPHEN).join('');
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}\\u00AD])${escapeRegExp(plain)}(?![\\p{L}\\p{N}\\u00AD])`, 'gu');
    result = result.replace(pattern, shy);
  }
  return result;
}

/**
 * Splits a text at the word joints that `titleShy` marks with soft hyphens, for headings that render the joints
 * as <wbr> instead of U+00AD (V6-G2): crawlers read \u201EKundendiensttechniker\u201C in one piece, the line may still
 * break at \u201EKunden|dienst|techniker\u201C. The parts joined again give the text unchanged.
 */
export function wortfugen(text: string, titleShy: string): string[] {
  return withSoftHyphens(text, titleShy).split(SOFT_HYPHEN);
}

const NBSP = '\u00A0';

/**
 * Keeps a spaced slash or dash at the end of a line instead of starting the next one:
 * „Kundendiensttechniker SHK / Servicemonteur“ breaks after „/“, never before it.
 */
export function bindSeparators(text: string): string {
  return text.replace(/ ([/–]) /g, `${NBSP}$1 `);
}

/** „Gehalt: 3.600–4.600 € / Monat“ → { label: 'Gehalt', value: '3.600–4.600 € / Monat' }. */
export function splitLabel(item: string): { label: string; value: string } | null {
  const index = item.indexOf(': ');
  if (index <= 0) return null;
  return { label: item.slice(0, index), value: item.slice(index + 2) };
}

/** Lowercases the first letter, for facts used mid-sentence: „Freitags …“ → „freitags …“. */
export function lowerFirst(value: string): string {
  return value.charAt(0).toLocaleLowerCase('de-DE') + value.slice(1);
}

// Same suffix as the title template in app/layout.tsx.
const BRAND_SUFFIX = ' | Bad & Energie Karriere';
const MAX_TITLE = 60;

/**
 * Absolute document title: the brand suffix is added only while the whole title stays
 * within 60 characters (ROADMAP §10), so the keyword-first title is never cut in the SERP.
 */
export function pageTitle(title: string): { absolute: string } {
  const branded = `${title}${BRAND_SUFFIX}`;
  return { absolute: branded.length <= MAX_TITLE ? branded : title };
}
