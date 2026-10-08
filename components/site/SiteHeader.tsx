import { Logo } from '@/components/brand/Logo';
import { COMPANY } from '@/lib/content/company';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { HeaderBar } from './HeaderBar';

/**
 * Sticky single-row header (56px mobile, 64px desktop). Server wrapper: resolves the contact
 * data, the WhatsApp link and the logo here, so the client part only carries pathname, scroll
 * and menu state plus plain strings.
 */
export function SiteHeader() {
  return (
    <HeaderBar
      // max-w-full + object-contain: the wordmark scales down instead of overflowing at 320px.
      logo={<Logo priority className="h-8 min-w-0 max-w-full object-contain object-left lg:h-10" />}
      phone={{ display: COMPANY.phone.display, href: COMPANY.phone.href }}
      // The menu only exists outside focus mode, so the general message always fits.
      whatsappHref={buildWhatsAppUrl(whatsAppMessageFor('/'))}
    />
  );
}
