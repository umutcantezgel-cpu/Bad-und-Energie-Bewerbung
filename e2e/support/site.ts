import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { ALL_JOBS, getActiveJobs, getChannelJobs, isJobLive } from '../../lib/jobs/registry';

/** WCAG 2.2 AA (ROADMAP §9): axe meldet 0 Verstöße. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

/** Veröffentlichte Stellen aus dem Registry (eigene Seite, Schema, Feed). */
export const PUBLISHED_JOBS = getActiveJobs().map((job) => ({ id: job.id, slug: job.slug, title: job.title }));
/** Veröffentlicht und heute nicht abgelaufen: stehen in Sitemap und Feeds. */
export const LIVE_JOB_SLUGS = getActiveJobs()
  .filter((job) => isJobLive(job, new Date()))
  .map((job) => job.slug);

/** Slugs, die ein Feed-Kanal heute enthalten muss (Flag gesetzt und live). */
export function channelJobSlugs(channel: 'indeedFeed' | 'genericFeed'): string[] {
  return getChannelJobs(ALL_JOBS, channel, new Date()).map((job) => job.slug);
}

export const MAIN_JOB_SLUG = 'anlagenmechaniker-shk-wetzlar';
export const NOT_FOUND_PATH = '/diese-seite-gibt-es-nicht';

export interface SiteRoute {
  path: string;
  status: number;
}

/** Jede Route der Phase 1, dazu die 404-Seite. */
export const ROUTES: readonly SiteRoute[] = [
  { path: '/', status: 200 },
  { path: '/jobs', status: 200 },
  ...PUBLISHED_JOBS.map((job) => ({ path: `/jobs/${job.slug}`, status: 200 })),
  { path: '/bewerbung', status: 200 },
  { path: `/bewerbung?stelle=${MAIN_JOB_SLUG}`, status: 200 },
  { path: '/bewerbung/danke', status: 200 },
  { path: '/bewerbung/mappe', status: 200 },
  { path: '/datenschutz', status: 200 },
  { path: '/impressum', status: 200 },
  { path: NOT_FOUND_PATH, status: 404 },
];

/** Wartet, bis Schriften geladen und alle Übergänge/Animationen beendet sind (stabile Messwerte für axe). */
export async function waitForSettled(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running' || animation.effect?.getTiming().iterations === Infinity),
  );
}

export async function expectNoAxeViolations(page: Page, testInfo: TestInfo, options: { include?: string } = {}): Promise<void> {
  await waitForSettled(page);
  let builder = new AxeBuilder({ page }).withTags([...AXE_TAGS]);
  if (options.include) builder = builder.include(options.include);
  const results = await builder.analyze();
  expect(results.passes.length, 'axe hat Regeln geprüft').toBeGreaterThan(0);
  if (results.violations.length > 0) {
    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  }
  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.slice(0, 5).map((node) => `${node.target.join(' ')} → ${node.failureSummary ?? ''}`),
  }));
  expect(summary, `axe-Verstöße auf ${page.url()}`).toEqual([]);
}

/** Mindestgröße der Trefferfläche (ROADMAP §4, §9: Touch-Ziele ≥ 44 px). */
export const MIN_TOUCH_TARGET_PX = 44;

/**
 * Bedienelemente, deren Trefferfläche kleiner als 44 × 44 px ist. Gemessen wird per
 * elementFromPoint rund um die Mitte, damit auch Pseudo-Elemente zählen, die die Fläche
 * vergrößern (Button sm, „Stretched Links“ in Karten). Ausgenommen sind Links im Fließtext
 * (WCAG 2.5.8, Ausnahme „inline“) und visuell versteckte Elemente.
 */
export async function findSmallTouchTargets(page: Page, scope = 'body'): Promise<string[]> {
  return page.locator(scope).evaluate(async (root, min) => {
    const selector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"]';
    const reach = min / 2 - 1;
    const findings: string[] = [];
    for (const element of root.querySelectorAll<HTMLElement>(selector)) {
      if (!element.checkVisibility({ visibilityProperty: true })) continue;
      if (element.closest('.sr-only, [aria-hidden="true"], [inert]')) continue;
      // Deaktiviert (z. B. „nach oben“ beim ersten Eintrag): kein Ziel, nimmt keine Taps an.
      if (element.matches(':disabled, [aria-disabled="true"]')) continue;
      // Link im Fließtext: Der nächste Block-Vorfahr enthält mehr Text als der Link selbst.
      const ownText = element.textContent?.trim() ?? '';
      if (getComputedStyle(element).display === 'inline') {
        let block = element.parentElement;
        while (block && getComputedStyle(block).display === 'inline') block = block.parentElement;
        if ((block?.textContent?.trim().length ?? 0) > ownText.length + 3) continue;
      }

      element.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const points: [number, number][] = [
        [cx - reach, cy],
        [cx + reach, cy],
        [cx, cy - reach],
        [cx, cy + reach],
      ];
      const misses = points.filter(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        return !hit || !(hit === element || element.contains(hit));
      });
      if (misses.length > 0) {
        const name = (element.getAttribute('aria-label') ?? ownText).replace(/\s+/g, ' ').slice(0, 40);
        findings.push(`${element.tagName.toLowerCase()} „${name}“ (${Math.round(rect.width)} × ${Math.round(rect.height)} px)`);
      }
    }
    window.scrollTo(0, 0);
    return findings;
  }, MIN_TOUCH_TARGET_PX);
}

/**
 * Eigene IP je Test (x-real-ip), damit das Rate-Limit von /api/bewerbung (5 pro 10 min je IP)
 * parallele Testläufe nicht gegenseitig blockiert. Jeder Test verhält sich wie ein eigener Besucher.
 */
export async function useOwnClientIp(page: Page): Promise<void> {
  const octet = () => 1 + Math.floor(Math.random() * 254);
  await page.setExtraHTTPHeaders({ 'x-real-ip': `10.${octet()}.${octet()}.${octet()}` });
}

/** Tippen auf Touch-Geräten, sonst Klicken. */
export function isTouch(testInfo: TestInfo): boolean {
  return Boolean(testInfo.project.use.hasTouch);
}

export function isDesktop(testInfo: TestInfo): boolean {
  return testInfo.project.name.startsWith('desktop');
}
