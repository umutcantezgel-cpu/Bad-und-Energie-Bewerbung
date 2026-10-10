import { expect, test } from '@playwright/test';
import { isTouch } from './support/site';

/**
 * Anker der Hauptnavigation auf der Startseite (/#vorteile, /#ablauf, /#faq): Ein Klick springt sofort zum
 * Abschnitt, auch solange die Inseln unter der Falz (HydrateNear, V6-A2) noch Server-HTML sind. Vorher wartete
 * der Router auf deren Hydrierung, und der Klick blieb wirkungslos, bis jemand das Einsatzgebiet erreichte.
 */
for (const ziel of [
  { label: 'Ablauf', id: 'ablauf' },
  { label: 'FAQ', id: 'faq' },
]) {
  test(`Kopf-Anker „${ziel.label}“ springt oben auf der Startseite ohne Scrollen zum Abschnitt`, async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (isTouch(testInfo)) {
      await page.getByRole('button', { name: 'Menü', exact: true }).click();
      await page.getByRole('dialog', { name: 'Menü' }).getByRole('link', { name: ziel.label, exact: true }).click();
    } else {
      await page.getByRole('banner').getByRole('link', { name: ziel.label, exact: true }).click();
    }

    await expect(page).toHaveURL(new RegExp(`/#${ziel.id}$`), { timeout: 3000 });
    await expect(page.locator(`#${ziel.id}`)).toBeInViewport();
  });
}
