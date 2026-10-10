/**
 * Texte und kleine, prüfbare Logik der Danke-Seite /bewerbung/danke (R5-THANKS-01, E-023).
 * Mikrotexte direkt (K-012), Zusagen nur aus FACTS/COMPANY über die Props der Seite; hier stehen keine neuen
 * Arbeitgeber-Aussagen. Client-sicher: keine zod-Importe (nur Typen aus dem Schema).
 */
import { isContactChannel, type ContactChannel } from '@/lib/applications/constants';
import type { ApplicationFollowUp } from '@/lib/applications/schema';
import { CONTACT_CHANNEL_LABEL } from '@/lib/apply/whatsapp-message';

/** Anker auf der Seite (Zweitweg im Kopf → Ergänzen). */
export const DANKE_ANKER = Object.freeze({
  titel: 'danke-titel',
  ablauf: 'danke-ablauf',
  ergaenzen: 'danke-ergaenzen',
});

/** Geschütztes Leerzeichen (60 Sekunden, Zahl-Wort-Paare, K-012). */
const NBSP = ' ';

// ---------------------------------------------------------------------------
// Rückmeldeweg (E-START-020)
// ---------------------------------------------------------------------------

/**
 * Gewählter Rückmeldeweg aus dem gespeicherten Datensatz der Bewerbung (sessionStorage `be:application:v1`).
 * Der Datensatz trägt `contactChannel` nur, wenn der Flow ihn mitschreibt; fehlt er oder ist er ungültig, gibt
 * es `null` und die Seite nennt den Weg allgemein. Wirft nie (kaputtes JSON, fremde Werte).
 */
export function rueckmeldewegAus(roh: string | null | undefined): ContactChannel | null {
  if (!roh) return null;
  try {
    const wert: unknown = JSON.parse(roh);
    if (!wert || typeof wert !== 'object' || Array.isArray(wert)) return null;
    const kanal = (wert as Record<string, unknown>).contactChannel;
    return isContactChannel(kanal) ? kanal : null;
  } catch {
    return null;
  }
}

/** Zeile „Rückmeldung“ in den Angaben: „per WhatsApp“, „per Anruf“, „per E-Mail“ (Wortlaut wie im Flow). */
export function rueckmeldewegText(kanal: ContactChannel | null): string {
  return kanal ? `per ${CONTACT_CHANNEL_LABEL[kanal]}` : 'auf dem Weg, den du gewählt hast';
}

// ---------------------------------------------------------------------------
// Kopf (Seitenkopf, Variante arbeit)
// ---------------------------------------------------------------------------

export const ERFOLG_KOPF = Object.freeze({
  etikett: 'Bewerbung eingegangen',
  titel: (vorname: string) => (vorname ? `Danke, ${vorname}.` : 'Danke.'),
  unterzeile: 'Deine Bewerbung ist da.',
  zweitweg: Object.freeze({ href: `#${DANKE_ANKER.ergaenzen}`, label: 'Angaben ergänzen' }),
  massName: 'Bewerbungsnummer',
});

/** Leerzustand: in diesem Fenster ist keine Bewerbung gespeichert (neuer Tab, direkt aufgerufen). */
export const LEER_KOPF = Object.freeze({
  etikett: (ort: string) => `Bewerbung · ${ort}`,
  titel: 'Noch keine Bewerbung hier.',
  unterzeile: 'Nach dem Absenden stehen hier Nummer und nächste Schritte.',
  einleitung:
    'Die Bestätigung bleibt nur in dem Fenster, in dem du dich beworben hast. In einem neuen Tab ist sie nicht zu sehen.',
  aktion: Object.freeze({ href: '/bewerbung', label: 'Jetzt bewerben' }),
  /** Fakten apply60s und noCvNeeded (wie im Kopf der Stellenseiten); ohne Wert entfällt die Dauer. */
  mikrotext: (sekunden: string | undefined, ohneLebenslauf: string) =>
    sekunden ? `Dauert ca. ${sekunden}${NBSP}Sekunden. ${ohneLebenslauf}.` : `${ohneLebenslauf}.`,
  zweitweg: Object.freeze({ href: '/jobs', label: 'Offene Stellen ansehen' }),
  fragenEtikett: 'Direkter Draht',
  fragenTitel: 'Schon beworben?',
  fragenEinleitung: 'Ruf an oder schreib per WhatsApp, wir helfen dir weiter.',
});

// ---------------------------------------------------------------------------
// Arbeitsfläche
// ---------------------------------------------------------------------------

export const ABLAUF_TEXT = Object.freeze({
  titel: 'So geht es weiter',
  gesendet: 'Bewerbung gesendet',
  erledigt: 'erledigt',
  rueckmeldung: 'Rückmeldung',
  angaben: Object.freeze({ stelle: 'Stelle', eingang: 'Eingegangen', weg: 'Rückmeldung' }),
  buero: 'Gerade ist unser Büro nicht besetzt. Wir melden uns zu den Öffnungszeiten:',
});

export const SEITEN_TEXT = Object.freeze({
  nummerTitel: 'Unsere Nummern',
  /** Satz um beide Nummern: „Speichere unsere Nummern, … wenn wir uns melden: <Büro> für Anrufe, <Mobil> für WhatsApp.“ */
  nummerVor: 'Speichere unsere Nummern, damit du uns erkennst, wenn wir uns melden:',
  nummerAnruf: 'für Anrufe,',
  nummerWhatsApp: 'für WhatsApp.',
  nummerKnopf: 'Nummern speichern',
  unterlagenTitel: 'Unterlagen schicken',
  unterlagenText:
    'Wenn du Zeugnisse oder einen Lebenslauf zur Hand hast, kannst du sie per WhatsApp oder E‑Mail nachreichen. Nenn dabei deine Bewerbungsnummer',
  fragenTitel: 'Fragen?',
});

export const ERGAENZEN_TEXT = Object.freeze({
  etikett: 'Freiwillig',
  titel: 'Möchtest du noch etwas ergänzen?',
  /** E-START-015: Die Bewerbung ist auch ohne Ergänzung vollständig. */
  einleitung: 'Alles freiwillig. Deine Bewerbung ist auch ohne diese Angaben vollständig.',
  /** E-START-015: Kenntnis-Chips (Wesenskern des Altstands, du klein). */
  kenntnisseFrage: 'Welche Praxiserfahrung bringst du mit?',
  kenntnisseHinweis: 'Tipp alles an, worin du schon selbstständig oder mit Kollegen gearbeitet hast.',
  start: 'Frühester Starttermin',
  plz: 'Postleitzahl',
  nachricht: 'Nachricht',
  /** E-BEW-015 (Darstellungs-Anteil): Das Feld „Nachricht“ nennt Wunschkonditionen. */
  nachrichtHinweis: 'Zum Beispiel Wunschkonditionen, Arbeitsmodell, besondere Erfahrung',
  senden: 'Ergänzung senden',
  erneut: 'Erneut senden',
  sendet: 'Wird gesendet…',
  gesendet: 'Danke, deine Ergänzung ist angekommen.',
  leer: 'Tipp eine Erfahrung an oder füll mindestens ein Feld aus.',
  leerOhneKenntnisse: 'Füll mindestens ein Feld aus.',
  plzFehler: 'Bitte gib eine fünfstellige Postleitzahl an.',
  mappeTitel: 'Bewerbungsmappe',
  mappeText: 'Anschreiben und Lebenslauf auf A4, zum Drucken oder als PDF. Auch die ist freiwillig.',
  mappeLink: 'Mappe erstellen',
});

// ---------------------------------------------------------------------------
// Ergänzung prüfen und zusammenstellen (Vertrag C8, applicationFollowUpSchema unverändert)
// ---------------------------------------------------------------------------

export interface ErgaenzungWerte {
  startDate: string;
  postalCode: string;
  message: string;
}

const POSTLEITZAHL = /^\d{5}$/;

export type ErgaenzungPruefung =
  | { ok: true; payload: ApplicationFollowUp }
  | { ok: false; fehler: 'leer' | 'plz' };

/**
 * Freiwillige Ergänzung zur Bewerbung: Starttermin, Postleitzahl, Nachricht und die angetippten Kenntnisse.
 * Die Kenntnisse reisen als `mappe.skills` (der Vertrag C8 kennt die Mappe schon; die Team-Mail zeigt sie als
 * „Fähigkeiten“). Leere Angaben fallen weg; ohne jede Angabe gibt es nichts zu senden.
 */
export function ergaenzungPruefen(
  werte: ErgaenzungWerte,
  kenntnisse: readonly string[],
  zugang: { reference: string; token: string },
): ErgaenzungPruefung {
  const startDate = werte.startDate.trim();
  const postalCode = werte.postalCode.trim();
  const message = werte.message.trim();
  const skills = kenntnisse.map((kenntnis) => kenntnis.trim()).filter(Boolean);

  if (!startDate && !postalCode && !message && skills.length === 0) return { ok: false, fehler: 'leer' };
  if (postalCode && !POSTLEITZAHL.test(postalCode)) return { ok: false, fehler: 'plz' };

  const payload: ApplicationFollowUp = { reference: zugang.reference, token: zugang.token };
  if (startDate) payload.startDate = startDate;
  if (postalCode) payload.postalCode = postalCode;
  if (message) payload.message = message;
  if (skills.length > 0) payload.mappe = { coverLetter: '', skills, careerStations: [], educationStations: [] };
  return { ok: true, payload };
}

/** Nachricht für den WhatsApp-Rückfallweg: die Kenntnisse vorn, dann der eigene Text. */
export function rueckfallNachricht(message: string, kenntnisse: readonly string[]): string {
  const teile = [kenntnisse.length > 0 ? `Praxiserfahrung: ${kenntnisse.join(', ')}.` : '', message.trim()];
  return teile.filter(Boolean).join(' ');
}
