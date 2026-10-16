/**
 * Agenturnennung im Fuß (Coday Web, _werkstatt/nennung, Entscheidungen N-04 bis N-07): Leistung, Doppelpunkt, Marke;
 * verlinkt ist nur die Marke. Gefolgt ist der Link nur auf der Quellseite, der Startseite „/“ (Linkmodell Startseite);
 * auf jeder anderen Seite trägt derselbe Link rel="nofollow". Immer im neuen Tab mit noopener und nie mit noreferrer,
 * damit die Agentur Besuche aus der Nennung sieht. Ohne Imports: Die Client-Insel AgenturLink trägt die Datei in jede
 * Seite (components/site/__tests__/schale-bundle.test.ts).
 */
export const AGENTUR = Object.freeze({
  leistung: 'Webdesign & Entwicklung',
  marke: 'Coday Web',
  url: 'https://www.codayweb.de/de',
});

/**
 * Kennung des verborgenen Hinweises „(öffnet in neuem Tab)“. Er steht neben dem Link und ist ihm per aria-describedby
 * zugeordnet, damit der Linktext genau die Marke bleibt (Leitplanke S1, _werkstatt/nennung N-12).
 */
export const AGENTUR_HINWEIS_ID = 'agentur-neuer-tab';

/** Quellseite ist nur die Startseite; ein Schrägstrich am Ende zählt nicht. Ohne Pfad gilt die Seite nicht als Quellseite. */
export function istQuellseite(pfad: string | null): boolean {
  return pfad !== null && pfad.startsWith('/') && pfad.replace(/\/+$/, '') === '';
}

/** rel des Links je Seite: auf der Startseite gefolgt, sonst nofollow; immer noopener, nie noreferrer. */
export function agenturRel(pfad: string | null): string {
  return istQuellseite(pfad) ? 'noopener' : 'nofollow noopener';
}
