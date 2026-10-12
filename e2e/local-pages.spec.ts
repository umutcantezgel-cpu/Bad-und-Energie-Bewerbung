import { expect, test } from '@playwright/test';
import { LOCAL_PAGES, waitForSettled } from './support/site';

/**
 * Alle lokalen Seiten (E-028): Gebietsseite, Kreis-Hubs und jede veröffentlichte Ortsseite. Nur im Projekt
 * mobile-light (die vier Projekte laufen über die Stichproben in ROUTES, mit axe): Status 200, genau eine h1,
 * Canonical auf sich selbst, bei 320 px der kurze Pfad eine Stufe zurück, ab 40em der ganze Pfad mit der Seite als
 * letzter Stufe, kein horizontaler Scroll bei 320 px.
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== 'mobile-light', 'Alle lokalen Seiten laufen einmal (mobile-light).');
});

test.use({ viewport: { width: 320, height: 700 } });

for (const local of LOCAL_PAGES) {
  test(`lokale Seite ${local.path}`, async ({ page }) => {
    const response = await page.goto(local.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(local.name.replace(/^Landkreis /, ''));

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe(local.path);

    // Unter 40em nur der Weg eine Stufe zurück („‹ Lahn-Dill-Kreis“), ab 40em der ganze Pfad (Review Phase 2, Punkt 26)
    const pfad = page.getByRole('navigation', { name: 'Brotkrümelnavigation' });
    await expect(pfad).toHaveCount(1);
    await expect(pfad.getByRole('link')).toHaveCount(1);
    await expect(pfad.getByRole('link')).toContainText(/\S/);
    await page.setViewportSize({ width: 800, height: 700 });
    const crumbs = page.getByRole('navigation', { name: 'Brotkrümelnavigation' }).locator('li');
    await expect(crumbs.first()).toHaveText('Startseite');
    await expect(crumbs.last()).toHaveText(local.name);
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
