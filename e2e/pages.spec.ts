import { expect, test } from '@playwright/test';
import { ROUTES, expectNoAxeViolations, findSmallPlanText, findSmallText, findSmallTouchTargets, isTouch, waitForSettled } from './support/site';

/**
 * Jede Route (ROADMAP §9, §14): Status, genau eine h1, Landmark main#main, Schrift ≥ 12 px (in SVG gezeichnet),
 * axe ohne Verstöße (WCAG 2.2 AA), Screenshot als Anhang. Auf Touch-Geräten: Trefferflächen ≥ 44 px.
 * Dazu: kein horizontaler Scroll bei 320 px.
 */

for (const route of ROUTES) {
  test.describe(`Seite ${route.path}`, () => {
    test('Struktur, Schriftgröße und axe', async ({ page }, testInfo) => {
      const response = await page.goto(route.path);
      expect(response, 'Antwort der Seite').not.toBeNull();
      expect(response!.status()).toBe(route.status);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await waitForSettled(page);

      // Sichtbarer Text im Hauptbereich ist nie kleiner als 12 px, in Zeichnungen so groß, wie er gezeichnet wird.
      expect(await findSmallText(page), 'Text kleiner als 12 px').toEqual([]);

      await expectNoAxeViolations(page, testInfo);

      await testInfo.attach('screenshot', {
        body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
        contentType: 'image/png',
      });
    });

    test('Touch-Ziele ≥ 44 px', async ({ page }, testInfo) => {
      test.skip(!isTouch(testInfo), 'Nur auf Touch-Geräten.');
      await page.goto(route.path);
      await waitForSettled(page);
      expect(await findSmallTouchTargets(page), 'Trefferfläche kleiner als 44 × 44 px').toEqual([]);
    });
  });
}

test.describe('Schmale Bildschirme (320 px)', () => {
  test.use({ viewport: { width: 320, height: 700 } });

  for (const route of ROUTES) {
    test(`kein horizontaler Scroll auf ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
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
});

/**
 * Pläne des Einsatzgebiets (Prüfung E-029, Runde 2, Befund 7): Orts-, Ring- und Landschaftsnamen gezeichnet nie unter
 * 12 px, auf jeder Breite von 320 bis 1440 px in 16-px-Schritten und an den Stufen (randlos unter 22rem, Containerstufe
 * 21rem, Raster ab 64em). Gemessen wie findSmallText: Schriftgröße mal getScreenCTM. Die Breiten setzt der Test selbst,
 * darum läuft er einmal (mobile-light).
 */
const PLAN_SEITEN = ['/', '/einsatzgebiet', '/einsatzgebiet/lahn-dill-kreis', '/einsatzgebiet/herborn'] as const;
const PLAN_BREITEN = [
  ...new Set([...Array.from({ length: 71 }, (_, i) => 320 + i * 16), 335, 336, 351, 352, 360, 375, 1023, 1024, 1040]),
].sort((a, b) => a - b);

test.describe('Pläne: Schrift auf jeder Breite gezeichnet ≥ 12 px', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'mobile-light', 'Die Breiten setzt der Test selbst; ein Projekt genügt.');
  });

  for (const pfad of PLAN_SEITEN) {
    test(`Pläne auf ${pfad}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(pfad);
      await waitForSettled(page);
      const funde: string[] = [];
      for (const breite of PLAN_BREITEN) {
        await page.setViewportSize({ width: breite, height: 800 });
        const { gemessen, funde: klein } = await findSmallPlanText(page);
        expect(gemessen, `${breite} px: keine Namen gemessen`).toBeGreaterThan(0);
        funde.push(...klein.map((fund) => `${breite} px: ${fund}`));
      }
      expect(funde, 'Schrift im Plan kleiner als 12 px').toEqual([]);
    });
  }
});
