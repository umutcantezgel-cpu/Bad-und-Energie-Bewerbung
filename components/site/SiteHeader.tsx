import { Logo } from '@/components/brand/Logo';
import { COMPANY } from '@/lib/content/company';
import { HeaderBar } from './HeaderBar';

/**
 * Sticky single-row header (56px mobile, 64px desktop). Server wrapper: resolves the contact
 * data and the logo here, so the client part only carries pathname, scroll and menu state.
 */
export function SiteHeader() {
  return (
    <HeaderBar
      logo={<Logo priority className="h-8 lg:h-10" />}
      phone={{ display: COMPANY.phone.display, href: COMPANY.phone.href }}
    />
  );
}
