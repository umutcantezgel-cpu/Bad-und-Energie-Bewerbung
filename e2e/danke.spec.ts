import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './support/site';

/** Danke-Seite nach dem Absenden (Datensatz im sessionStorage, wie ihn der Flow nach HTTP 200 schreibt). */

const GESENDET = { reference: 'BE-26-K7M4QX', followUpToken: 'token.zum.test', firstName: 'Max', jobId: 'anlagenmechaniker-shk', submittedAt: new Date().toISOString() };
const INSTAGRAM_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.4.32.98 (iPhone15,2; iOS 17_5; de_DE; de; scale=3.00; 1179x2556; 609529009)';
const HINWEIS = 'Klappt das Speichern hier nicht? Die Nummern stehen direkt darüber.';

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-light', 'Ein Projekt genügt.');
  await page.addInitScript((wert) => sessionStorage.setItem('be:application:v1', wert), JSON.stringify(GESENDET));
});

test('„Nummern speichern“ lädt die Kontaktdatei; ohne App-Browser kein Hinweis', async ({ page }) => {
  await page.goto('/bewerbung/danke');
  const knopf = page.getByRole('link', { name: 'Nummern speichern' });
  await expect(knopf).toHaveAttribute('href', '/bad-und-energie.vcf');
  await expect(page.getByText(HINWEIS)).toHaveCount(0);
});

test.describe('im Instagram-Browser', () => {
  test.use({ userAgent: INSTAGRAM_UA });

  test('Hinweis unter „Nummern speichern“, axe ohne Verstöße', async ({ page }, testInfo) => {
    await page.goto('/bewerbung/danke');
    await expect(page.getByText(HINWEIS)).toBeVisible();
    await expectNoAxeViolations(page, testInfo);
  });
});
