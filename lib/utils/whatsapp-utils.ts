import { WHATSAPP_NUMBER } from '@/lib/data/contact';

/** Neutraler Standardtext: passt auf jeder Seite, für Fachkräfte wie für Schülerinnen und Schüler. */
export const DEFAULT_WHATSAPP_MESSAGE = 'Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.';

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE, phone: string = WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Vorausgefüllter Text je Bereich. Header, Menü und Sticky-Bar nutzen ihn auf jeder Seite, auch auf
 * der Ausbildungsseite: deshalb keine Berufsangabe, sondern der neutrale Standardtext.
 */
export function whatsAppMessageFor(pathname: string): string {
  if (pathname.includes('/bewerbung')) {
    return 'Guten Tag Herr Demir, ich habe eine kurze Frage zu den Bewerbungsschritten bei Bad und Energie in Wetzlar.';
  }
  return DEFAULT_WHATSAPP_MESSAGE;
}
