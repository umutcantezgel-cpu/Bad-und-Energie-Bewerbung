/**
 * Kontaktkarte (vCard 3.0) für „Nummern speichern“ auf der Danke-Seite: Viele Handwerker
 * nehmen unbekannte Nummern nicht an (ROADMAP §6). Rein, damit Server und Client gleich bauen.
 */

export interface VCardContact {
  /** Anzeigename, z. B. „Bad und Energie“. */
  formattedName: string;
  organization: string;
  /** E.164, z. B. „+49644142956“. */
  phone: string;
  /** WhatsApp-Mobilnummer in E.164, z. B. „+491608834290“; gleicht sie `phone`, entfällt die Zeile. */
  whatsapp?: string;
  email?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  url?: string;
  note?: string;
}

/** Escaping nach RFC 2426: Backslash, Komma, Semikolon und Zeilenumbruch. */
export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildVCard(contact: VCardContact): string {
  const e = (value: string | undefined) => escapeVCardValue((value ?? '').trim());
  const phone = contact.phone.replace(/[^\d+]/g, '');
  const whatsapp = contact.whatsapp?.replace(/[^\d+]/g, '');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${e(contact.formattedName)};;;;`,
    `FN:${e(contact.formattedName)}`,
    `ORG:${e(contact.organization)}`,
    `TEL;TYPE=WORK,VOICE:${phone}`,
  ];
  // Mobilnummer für WhatsApp. Die Gruppe „item1.“ (RFC 2426) hängt das Apple-Label an; andere Programme
  // ignorieren X-ABLabel und zeigen die Nummer als „Mobil“.
  if (whatsapp && whatsapp !== phone) lines.push(`item1.TEL;TYPE=CELL:${whatsapp}`, 'item1.X-ABLabel:WhatsApp');
  if (contact.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${e(contact.email)}`);
  if (contact.street || contact.city) {
    lines.push(
      `ADR;TYPE=WORK:;;${e(contact.street)};${e(contact.city)};${e(contact.region)};${e(contact.postalCode)};${e(contact.country)}`,
    );
  }
  if (contact.url) lines.push(`URL:${e(contact.url)}`);
  if (contact.note) lines.push(`NOTE:${e(contact.note)}`);
  // iOS zeigt die Karte als Firma statt als Person.
  lines.push('X-ABShowAs:COMPANY', 'END:VCARD');
  return `${lines.join('\r\n')}\r\n`;
}

/** Download-Link ohne Server-Anfrage. */
export function vcardDataUri(vcard: string): string {
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
}
