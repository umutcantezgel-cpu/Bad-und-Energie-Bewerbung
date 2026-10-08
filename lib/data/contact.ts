/**
 * Telefon und WhatsApp als eigene, kleine Quelle. SITE_CONFIG übernimmt die Werte; Client-Module
 * auf jeder Seite (Fehlerseiten, WhatsApp-Links) importieren nur diese Datei statt der ganzen
 * SITE_CONFIG. Telefon nach DIN 5008.
 */
export const CONTACT_PHONE = Object.freeze({
  display: '06441 42956',
  /** E.164 für tel:-Links und WhatsApp. */
  e164: '+49644142956',
  href: 'tel:+49644142956',
});

/** WhatsApp läuft über die Festnetznummer (ROADMAP §13: WhatsApp Business noch zu bestätigen). */
export const WHATSAPP_NUMBER = CONTACT_PHONE.e164;
