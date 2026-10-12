import { expect, test } from '@playwright/test';
import { THEMEN_PAGES, waitForSettled } from './support/site';

/**
 * Alle Themenseiten (E-028): Hub /arbeiten-bei-uns und die fünf Themen. Nur im Projekt mobile-light (die vier Projekte
 * laufen über die Stichproben in ROUTES, mit axe): Status 200, genau eine h1, Canonical auf sich selbst, bei 320 px der
 * kurze Pfad eine Stufe zurück, ab 40em der ganze Pfad mit der Seite als letzter Stufe, ein JSON-LD-Graph ohne
 * JobPosting und FAQPage, kein horizontaler Scroll bei 320 px.
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== 'mobile-light', 'Alle Themenseiten laufen einmal (mobile-light).');
});

test.use({ viewport: { width: 320, height: 700 } });

for (const thema of THEMEN_PAGES) {
  test(`Themenseite ${thema.path}`, async ({ page }) => {
    const response = await page.goto(thema.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe(thema.path);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const types = (JSON.parse(blocks[0])['@graph'] as { '@type': string }[]).map((node) => node['@type']);
    expect(types).toContain('BreadcrumbList');
    expect(types).not.toContain('JobPosting');
    expect(types).not.toContain('FAQPage');

    // Unter 40em nur der Weg eine Stufe zurück, ab 40em der ganze Pfad
    const pfad = page.getByRole('navigation', { name: 'Brotkrümelnavigation' });
    await expect(pfad).toHaveCount(1);
    await expect(pfad.getByRole('link')).toHaveCount(1);
    await page.setViewportSize({ width: 800, height: 700 });
    const crumbs = page.getByRole('navigation', { name: 'Brotkrümelnavigation' }).locator('li');
    await expect(crumbs.first()).toHaveText('Startseite');
    await expect(crumbs.last()).toHaveText(thema.name);
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1);
    await page.setViewportSize({ width: 320, height: 700 });

    await waitForSettled(page);
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const width = root.clientWidth;
      const wide = [...document.body.querySelectorAll<HTMLElement>('*')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.right > width + 1 && element.checkVisibility();
        })
        .slice(0, 5)
        .map((element) => `${element.tagName.toLowerCase()}.${String(element.className).split(' ').slice(0, 3).join('.')}`);
      return { scrollWidth: root.scrollWidth, width, wide };
    });
    expect(overflow.scrollWidth, `Zu breit: ${overflow.wide.join(', ')}`).toBeLessThanOrEqual(overflow.width);
  });
}
