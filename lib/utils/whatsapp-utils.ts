import { SITE_CONFIG } from '@/lib/seo/site-config';

export function buildWhatsAppUrl(
  message: string = 'Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.',
  phone: string = SITE_CONFIG.contact.telephoneLink
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function whatsAppMessageFor(pathname: string): string {
  if (pathname.includes('/bewerbung')) {
    return 'Guten Tag Herr Demir, ich habe eine kurze Frage zu den Bewerbungsschritten bei Bad und Energie in Wetzlar.';
  }
  return 'Guten Tag Herr Demir, ich bin Anlagenmechaniker bzw. Kundendienstmonteur und möchte mich diskret über offene Stellen in Wetzlar informieren.';
}
