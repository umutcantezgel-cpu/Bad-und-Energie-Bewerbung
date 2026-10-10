import { Logo } from '@/components/brand/Logo';
import { COMPANY } from '@/lib/content/company';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { HeaderBar } from './HeaderBar';
import { jubilaeumsMarke, kopfVertraulich, stellenZaehler } from './kopf/kopf-daten';

/**
 * Seitenkopf (R4-SHELL-01), Server-Hülle: liest Kontakt, Stellenzahl, Jubiläum und Zusage hier,
 * damit der Client-Teil nur Pfad, Scroll- und Menüzustand trägt und schlichte Zeichenketten bekommt.
 * Das Layout rendert stündlich neu (revalidate = 3600): Zähler und Marke folgen dem Stichtag ohne Deployment.
 */
export function SiteHeader() {
  const now = new Date();
  return (
    <HeaderBar
      // max-w-full + object-contain: die Wortmarke wird auf 320 px kleiner, statt überzulaufen.
      logo={<Logo priority className="h-8 min-w-0 max-w-full object-contain object-left lg:h-10" />}
      menuLogo={<Logo className="h-8 min-w-0 max-w-full object-contain object-left" />}
      phone={{ display: COMPANY.phone.display, href: COMPANY.phone.href }}
      // Text ohne Berufsangabe (E-SHELL-005); das Menü gibt es nur außerhalb des Bewerbungsflows.
      whatsappHref={buildWhatsAppUrl(whatsAppMessageFor('/'))}
      // Im Flow fragt WhatsApp nach den Bewerbungsschritten.
      whatsappFlowHref={buildWhatsAppUrl(whatsAppMessageFor('/bewerbung'))}
      offeneStellen={stellenZaehler(now)}
      marke={jubilaeumsMarke(now)}
      vertraulich={kopfVertraulich()}
    />
  );
}
