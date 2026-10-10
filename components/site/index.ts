// Site shell (C3). SiteHeader, SiteFooter, StickyApplyBar and ContactOptions are server-safe;
// their client parts (HeaderBar, MobileNav, StickyApplyBarClient, FooterSwitch) receive plain
// props only (strings built on the server), so SITE_CONFIG and tailwind-merge stay out of them.
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
  SHORT_APPLY_LABEL,
  focusModeExitLabel,
  hasStickyApplyBar,
  isFocusMode,
  type NavItem,
} from './nav';
export { buildSiteNodes, FOUNDER_ID, LOCAL_BUSINESS_ID, ORGANIZATION_ID, WEBSITE_ID } from './site-jsonld';
