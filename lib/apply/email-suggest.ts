/**
 * Hinweis auf vertippte E-Mail-Domains („gmial.com“ → „gmail.com“). Nur ein Vorschlag:
 * Die Person entscheidet, nichts wird automatisch geändert.
 */

export const COMMON_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'gmx.de',
  'gmx.net',
  'gmx.at',
  'gmx.ch',
  'web.de',
  't-online.de',
  'outlook.de',
  'outlook.com',
  'hotmail.de',
  'hotmail.com',
  'live.de',
  'live.com',
  'yahoo.de',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'freenet.de',
  'posteo.de',
  'mail.de',
  'aol.com',
  'arcor.de',
  'online.de',
];

/** Häufige Vertipper, die über den Abstand allein nicht eindeutig wären. */
const KNOWN_TYPOS: Readonly<Record<string, string>> = {
  'gmail.de': 'gmail.com',
  'gmai.de': 'gmail.com',
  'gemail.com': 'gmail.com',
  'googlemail.de': 'googlemail.com',
  'tonline.de': 't-online.de',
  't-online.com': 't-online.de',
  'web.com': 'web.de',
  'webde.de': 'web.de',
  'gmx.com': 'gmx.de',
  'gmxde': 'gmx.de',
  'webde': 'web.de',
  'icloud.de': 'icloud.com',
};

/** Vertippte Endungen, z. B. „.con“ → „.com“. */
const TLD_TYPOS: Readonly<Record<string, string>> = {
  con: 'com',
  cmo: 'com',
  ocm: 'com',
  vom: 'com',
  xom: 'com',
  coom: 'com',
  comm: 'com',
  cm: 'com',
  om: 'com',
  dee: 'de',
  ed: 'de',
  dr: 'de',
  dw: 'de',
  ner: 'net',
  nte: 'net',
  nett: 'net',
};

/** Editierabstand, bei dem ein Buchstabendreher („gmial“) als ein Fehler zählt (Damerau, OSA). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function fixTld(domain: string): string {
  const dot = domain.lastIndexOf('.');
  if (dot === -1) return domain;
  const tld = domain.slice(dot + 1);
  const fixed = TLD_TYPOS[tld];
  return fixed ? `${domain.slice(0, dot)}.${fixed}` : domain;
}

function suggestDomain(domain: string): string | null {
  if (COMMON_EMAIL_DOMAINS.includes(domain)) return null;
  if (KNOWN_TYPOS[domain]) return KNOWN_TYPOS[domain];

  const tldFixed = fixTld(domain);
  if (tldFixed !== domain && COMMON_EMAIL_DOMAINS.includes(tldFixed)) return tldFixed;

  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of COMMON_EMAIL_DOMAINS) {
    const distance = editDistance(tldFixed, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  // Kurze Domains nur bei einem Zeichen Abstand, sonst würden echte Domains „korrigiert“.
  const limit = tldFixed.length >= 9 ? 2 : 1;
  if (best && bestDistance <= limit) return best;
  return tldFixed !== domain && /\.(?:com|de|net)$/.test(tldFixed) ? tldFixed : null;
}

/** Vorgeschlagene Adresse oder null, z. B. „max@gmial.com“ → „max@gmail.com“. */
export function suggestEmail(email: string): string | null {
  const value = email.trim();
  const at = value.lastIndexOf('@');
  if (at <= 0 || at === value.length - 1) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1).toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(domain) || domain.length < 4) return null;
  const suggestion = suggestDomain(domain);
  return suggestion && suggestion !== domain ? `${local}@${suggestion}` : null;
}
