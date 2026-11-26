import { WHATSAPP_KNOPF } from '@/lib/data/contact';
import { buildWhatsAppUrl, KNOPF_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp-utils';
import { HelferInsel } from './HelferInsel';

/**
 * Der Helfer: Server-Hülle wie bei der Bewerbenleiste. Sie baut den WhatsApp-Link aus den Kontaktdaten und gibt ihn
 * als Zeichenkette weiter, damit der Browser-Teil frei von Kontaktdaten, zod und SITE_CONFIG bleibt.
 */
export function Helfer() {
  // Der schwebende Knopf schreibt an die Nummer des Inhabers (lib/data/contact.ts, WHATSAPP_KNOPF), mit eigenem Text
  // ohne „Herr Demir“. Im Bewerbungsweg tritt der Helfer nicht auf (seiten.ts), ein Text genügt also.
  return <HelferInsel whatsappHref={buildWhatsAppUrl(KNOPF_WHATSAPP_MESSAGE, WHATSAPP_KNOPF.e164)} />;
}
