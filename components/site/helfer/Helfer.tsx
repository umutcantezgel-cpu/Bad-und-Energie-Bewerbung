import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { HelferInsel } from './HelferInsel';

/**
 * Der Helfer: Server-Hülle wie bei der Bewerbenleiste. Sie baut den WhatsApp-Link aus den Kontaktdaten und gibt ihn
 * als Zeichenkette weiter, damit der Browser-Teil frei von Kontaktdaten, zod und SITE_CONFIG bleibt.
 */
export function Helfer() {
  // Im Bewerbungsweg tritt der Helfer nicht auf (seiten.ts), der allgemeine Text passt also immer.
  return <HelferInsel whatsappHref={buildWhatsAppUrl(whatsAppMessageFor('/'))} />;
}
