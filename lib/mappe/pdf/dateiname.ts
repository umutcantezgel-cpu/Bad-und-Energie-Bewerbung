/**
 * Dateiname der Mappe-PDF im Anhang der Team-Mail: „Bewerbungsmappe_BE-26-K7M4QX_Mueller.pdf“, ohne Namen
 * „Bewerbungsmappe_BE-26-K7M4QX.pdf“. Nur ASCII-Buchstaben, Ziffern, „-“ und „_“: Outlook, Gmail und Windows-Ordner
 * zeigen ihn so überall gleich (keine Umlaute, Leerzeichen oder Sonderzeichen im Anhang). Client-sicher.
 */

/** Buchstaben, die Unicode nicht in Grundbuchstabe plus Akzent zerlegt (ł, ø, ß, æ …), und die deutschen Umlaute. */
const UMSCHRIFT: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
  ß: 'ss',
  ẞ: 'SS',
  ł: 'l',
  Ł: 'L',
  ø: 'o',
  Ø: 'O',
  æ: 'ae',
  Æ: 'Ae',
  œ: 'oe',
  Œ: 'Oe',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
  ı: 'i',
};

/** Text in ASCII: Umlaute ausgeschrieben, Akzente weg (ş → s, é → e, ł → l), alles andere wird „-“. */
export function asciiUmschrift(text: string): string {
  return [...text]
    .map((zeichen) => UMSCHRIFT[zeichen] ?? zeichen)
    .join('')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Nachname für den Dateinamen: das letzte Wort des Namens in ASCII, höchstens 40 Zeichen; leer, wenn nichts bleibt. */
export function nachnameFuerDatei(name: string): string {
  const woerter = name.trim().split(/\s+/).map(asciiUmschrift).filter(Boolean);
  return (woerter.at(-1) ?? '').slice(0, 40).replace(/-+$/, '');
}

export function mappeDateiname(reference: string, name?: string): string {
  const nummer = asciiUmschrift(reference) || 'Bewerbung';
  const nachname = name ? nachnameFuerDatei(name) : '';
  return `Bewerbungsmappe_${nummer}${nachname ? `_${nachname}` : ''}.pdf`;
}

/**
 * Dateiname der PDF, die der Bewerber selbst herunterlädt (L4): „Bewerbungsmappe_Mueller.pdf“, ohne Nachnamen
 * „Bewerbungsmappe.pdf“ (keine Bewerbungsnummer: Die Mappe entsteht vor dem Senden).
 */
export function downloadDateiname(name?: string): string {
  const nachname = name ? nachnameFuerDatei(name) : '';
  return `Bewerbungsmappe${nachname ? `_${nachname}` : ''}.pdf`;
}
