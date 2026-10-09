'use client';

import { useEffect } from 'react';

/**
 * Old anchors of the previous career page (E-START-052, E-SEO-021): the in-page ones are plain
 * alias spans in app/page.tsx, so they work without JavaScript. Only `#express-funnel` pointed at
 * the inline application funnel that now lives on /bewerbung, so it needs a redirect.
 */
export const FUNNEL_ALIAS = '#express-funnel';
export const FUNNEL_TARGET = '/bewerbung';

export function redirectTargetFor(hash: string): string | null {
  return hash === FUNNEL_ALIAS ? FUNNEL_TARGET : null;
}

export function AnchorAliases() {
  useEffect(() => {
    const follow = () => {
      const target = redirectTargetFor(window.location.hash);
      if (target) window.location.replace(target);
    };
    follow();
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, []);
  return null;
}
