/**
 * Bedienzeichen der Dauerbewegung (E-029): Anhalten (zwei Balken) und Abspielen (Dreieck) im 24er-Raster, Linienart
 * `--m-icon` (2 px, rund). Eigenes kleines Modul, damit die Steuerung (Client-Komponente, ≤ 2 KB) nicht alle Glyphen
 * lädt; components/icons/glyphs.tsx übernimmt sie in die Familie.
 */
export const BEDIEN_GLYPHEN = {
  pause: [{ d: 'M9 6v12M15 6v12' }],
  play: [{ d: 'M8 5.5v13l10.5-6.5Z' }],
} as const;
