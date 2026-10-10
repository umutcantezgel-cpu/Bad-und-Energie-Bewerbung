/**
 * Texte der Auswahl mit Anbindung (Phase 2, UnterlagenAuswahl). Eigene Datei ohne FACTS und COMPANY, damit die
 * Client-Insel nur diese Zeichenketten lädt. Erfolg heißt „angekommen“ bzw. „übertragen“, nie „verifiziert“
 * oder „beigefügt“ (E-BEW-012, E-BEW-033).
 */
import { FORMATE_TEXT, groesseText, UNTERLAGEN_GRENZEN } from './regeln';

export const AUSWAHL_TEXT = Object.freeze({
  auswaehlen: 'Dateien auswählen',
  ablegen: 'oder hierher ziehen',
  formate: `${FORMATE_TEXT} · bis zu ${UNTERLAGEN_GRENZEN.maxDateien} Dateien, je höchstens ${groesseText(UNTERLAGEN_GRENZEN.maxBytes)}`,
  senden: 'Unterlagen senden',
  gesendet: 'Deine Unterlagen sind angekommen. Sabri Demir sieht sie bei deiner Bewerbung.',
  sendenFehler: 'Das Senden hat nicht geklappt. Versuch es noch einmal oder schick die Unterlagen per WhatsApp oder E-Mail.',
  entfernen: 'Entfernen',
  statusLaedt: 'wird übertragen',
  statusUebertragen: 'übertragen',
  liste: 'Gewählte Unterlagen',
});
