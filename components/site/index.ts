// Site shell (C3). SiteHeader, SiteFooter, StickyApplyBar and ContactOptions are server-safe;
// their client parts (HeaderBar, MobileNav, StickyApplyBarClient) receive plain props only.
export * from './ContactOptions';
export * from './SiteFooter';
export * from './SiteHeader';
export * from './StickyApplyBar';
export { MobileNav, type MobileNavProps } from './MobileNav';
export {
  APPLY_PATH,
  FLOW_ANCHOR_ID,
  NAV_ITEMS,
  PRIMARY_CTA_ATTR,
  STICKY_BAR_HIDE_SELECTOR,
  applyLabelFor,
  focusModeExitLabel,
  isFocusMode,
  type NavItem,
} from './nav';
export { buildSiteJsonLd, LOCAL_BUSINESS_ID, ORGANIZATION_ID, WEBSITE_ID } from './site-jsonld';
