import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { ALL_JOBS, getActiveJobs, getChannelJobs, isJobLive } from '../../lib/jobs/registry';
import { EINSATZGEBIET_PATH, getHubKreise, getPublishedPlaces, kreisPath, placePath } from '../../lib/places/registry';
import { ARBEITEN_NAME, ARBEITEN_PATH, getThemen, themaPath } from '../../lib/themen/registry';

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

/**
 * Lokale Seiten (E-028) aus dem Registry: Gebietsseite, Kreis-Hubs und alle veröffentlichten Orte. Alle laufen in
 * e2e/local-pages.spec.ts (nur mobile-light); ROUTES nimmt fünf Stichproben für axe in allen vier Projekten.
 */
export const LOCAL_PAGES: readonly { path: string; name: string }[] = [
  { path: EINSATZGEBIET_PATH, name: 'Einsatzgebiet' },
  ...getHubKreise().map((kreis) => ({ path: kreisPath(kreis), name: kreis.shortName })),
  ...getPublishedPlaces().map((place) => ({ path: placePath(place), name: place.name })),
];

/** Stichproben der lokalen Seiten: Gebietsseite, ein Kreis-Hub, ein Ort, ein Stadtteil, die Stadt Wetzlar. */
export const LOCAL_SAMPLES = [
  '/einsatzgebiet',
  '/einsatzgebiet/lahn-dill-kreis',
  '/einsatzgebiet/herborn',
  '/einsatzgebiet/hermannstein',
  '/einsatzgebiet/wetzlar',
] as const;

/**
 * Themenseiten (E-028) aus dem Registry: Hub und die fünf Themen; alle laufen in e2e/themen-pages.spec.ts (nur
 * mobile-light), ROUTES nimmt den Hub und die Gehaltsseite als Stichproben für axe in allen vier Projekten.
 */
export const THEMEN_PAGES: readonly { path: string; name: string }[] = [
  { path: ARBEITEN_PATH, name: ARBEITEN_NAME },
  ...getThemen().map((thema) => ({ path: themaPath(thema), name: thema.name })),
];

export const THEMEN_SAMPLES = [ARBEITEN_PATH, `${ARBEITEN_PATH}/gehalt`] as const;

/** Jede Route der Phase 1, dazu die Stichproben der lokalen Seiten und der Themenseiten und die 404-Seite. */
export const ROUTES: readonly SiteRoute[] = [
  { path: '/', status: 200 },
  { path: '/jobs', status: 200 },
  ...PUBLISHED_JOBS.map((job) => ({ path: `/jobs/${job.slug}`, status: 200 })),
  { path: '/bewerbung', status: 200 },
  ...LOCAL_SAMPLES.map((path) => ({ path, status: 200 })),
  ...THEMEN_SAMPLES.map((path) => ({ path, status: 200 })),
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

/** Mindestgröße sichtbarer Schrift (ROADMAP §14: Schrift ≥ 12 px). */
export const MIN_FONT_SIZE_PX = 12;

/**
 * Sichtbarer Text unter `min` px, so groß, wie er gezeichnet wird (Prüfung E-029, Befund 7): in HTML die berechnete
 * Schriftgröße, in SVG die Schriftgröße in Einheiten mal Maßstab der Zeichnung auf dem Bildschirm (getScreenCTM,
 * √(a² + b²), auch bei gedrehter Schrift). Die Einheiten allein sagen nichts: 34 Einheiten in einer 1200 breiten
 * Zeichnung sind auf 350 px nur 9,9 px.
 */
export async function findSmallText(page: Page, scope = 'main#main', min = MIN_FONT_SIZE_PX): Promise<string[]> {
  return page.locator(scope).evaluate((root, min) => {
    const findings: string[] = [];
    for (const element of root.querySelectorAll<Element>('*')) {
      const ownText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? '')
        .join(' ')
        .trim();
      if (!ownText) continue;
      if (!element.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;
      let size = parseFloat(getComputedStyle(element).fontSize);
      if (element instanceof SVGGraphicsElement) {
        const m = element.getScreenCTM();
        if (m) size *= Math.hypot(m.a, m.b);
      }
      if (size < min) {
        const zeichnung = element.closest('[data-zeichnung]')?.getAttribute('data-zeichnung');
        findings.push(`${element.tagName.toLowerCase()}${zeichnung ? ` in ${zeichnung}` : ''} ${size.toFixed(1)}px: „${ownText.slice(0, 40)}“`);
      }
    }
    return findings;
  }, min);
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
