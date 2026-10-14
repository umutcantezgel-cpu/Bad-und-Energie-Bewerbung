import { expect, test } from '@playwright/test';
import { istOrtIndexierbar } from '../lib/places/indexierung';
import { OEPNV_QUELLE } from '../lib/places/oepnv';
import { getPublishedPlaces, placePath } from '../lib/places/registry';
import { LOCAL_PAGES, waitForSettled } from './support/site';

/**
 * Alle lokalen Seiten (E-028): Gebietsseite, Kreis-Hubs und jede veröffentlichte Ortsseite. Nur im Projekt
 * mobile-light (die vier Projekte laufen über die Stichproben in ROUTES, mit axe): Status 200, genau eine h1,
 * Canonical auf sich selbst, Robots wie das Gate (E-029: eine Ortsseite `index, follow`, wenn sie es besteht, sonst
 * `noindex, follow`; Gebietsseite und Kreis-Hubs immer `index, follow`), auf Ortsseiten die Abschnitte zu Bus und Bahn
 * und zur Berufsschule mit Link auf die Lizenz der Fahrplandaten, bei 320 px der kurze Pfad eine Stufe zurück, ab 40em
 * der ganze Pfad mit der Seite als letzter Stufe, kein horizontaler Scroll bei 320 px.
 */

const ORTE = new Map(getPublishedPlaces().map((place) => [placePath(place), place]));

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

    const ort = ORTE.get(local.path);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots, 'Robots wie das Gate').toBe(!ort || istOrtIndexierbar(ort, new Date()) ? 'index, follow' : 'noindex, follow');
    if (ort) {
      await expect(page.getByRole('heading', { level: 2, name: `Mit Bus und Bahn aus ${ort.name}` })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 2, name: `Zur Berufsschule aus ${ort.name}` })).toHaveCount(1);
      await expect(page.locator(`a[href="${OEPNV_QUELLE.lizenzUrl}"]`)).toHaveCount(1);
    }

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
