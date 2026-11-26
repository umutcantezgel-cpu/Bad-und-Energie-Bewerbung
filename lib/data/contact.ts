/**
 * Telefon und WhatsApp als eigene, kleine Quelle. SITE_CONFIG übernimmt die Werte; Client-Module
 * auf jeder Seite (Fehlerseiten, WhatsApp-Links) importieren nur diese Datei statt der ganzen
 * SITE_CONFIG. Telefon nach DIN 5008.
 */
export const CONTACT_PHONE = Object.freeze({
  display: '06441 42956',
  /** E.164 für tel:-Links (Büro, Betriebsangaben). */
  e164: '+49644142956',
  href: 'tel:+49644142956',
});

/**
 * Einzige WhatsApp-Nummer (Mobil). Seit 26.11.2026 die Nummer des Inhabers (Anweisung: „alle WhatsApp-Wege auf meine
 * Nummer umstellen“); vorher 0160 8834290 (Angabe vom 2026-10-10). Gilt nur für WhatsApp (Links, schwebender Knopf,
 * Mobilzeile der vCard): Anrufe, Impressum, JSON-LD und die Bürozeile der vCard bleiben bei CONTACT_PHONE.
 * Die Texte nennen keinen Namen als Empfänger („schreib uns“), die Anrede lautet „Guten Tag,“. Anzeige nach DIN 5008.
 */
export const WHATSAPP = Object.freeze({
  display: '0176 41195301',
  e164: '+4917641195301',
});

export const WHATSAPP_NUMBER = WHATSAPP.e164;
