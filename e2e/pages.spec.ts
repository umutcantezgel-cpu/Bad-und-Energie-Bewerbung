import { expect, test } from '@playwright/test';
import { ROUTES, expectNoAxeViolations, findSmallTouchTargets, isTouch, waitForSettled } from './support/site';

/**
 * Jede Route (ROADMAP §9, §14): Status, genau eine h1, Landmark main#main, Schrift ≥ 12 px,
 * axe ohne Verstöße (WCAG 2.2 AA), Screenshot als Anhang. Auf Touch-Geräten: Trefferflächen ≥ 44 px.
 * Dazu: kein horizontaler Scroll bei 320 px.
 */

const MIN_FONT_SIZE_PX = 12;

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

      // Sichtbarer Text im Hauptbereich ist nie kleiner als 12 px.
      const tooSmall = await page.locator('main#main').evaluate((main, min) => {
        const findings: string[] = [];
        for (const element of main.querySelectorAll<HTMLElement>('*')) {
          const ownText = [...element.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() ?? '')
            .join(' ')
            .trim();
          if (!ownText) continue;
          if (!element.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;
          const size = parseFloat(getComputedStyle(element).fontSize);
          if (size < min) findings.push(`${element.tagName.toLowerCase()} ${size}px: „${ownText.slice(0, 40)}“`);
        }
        return findings;
      }, MIN_FONT_SIZE_PX);
      expect(tooSmall, 'Text kleiner als 12 px').toEqual([]);

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
