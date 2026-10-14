import { expect, test, type ElementHandle } from '@playwright/test';
import { JOB_PAGE_PATH, PAGE_FLOW_PATH, TapCounter, answerQuestions, fillContact, flowRoot, safeDecode, submitButton, waitForHydration } from './support/flow';
import { useOwnClientIp } from './support/site';

/**
 * Herkunft ohne Browser-Speicher (Plan §D, lib/attribution/link.ts und klick.ts): Der Link-Beobachter hängt den Kanal
 * an Bewerbungslinks und den sichtbaren Code an WhatsApp-Links, sobald jemand den Link benutzt; ein neuer Tab mit
 * `?herkunft=` trägt den Kanal bis in die Bewerbung. Im echten Browser, mit React und nachgeladenem Beobachter.
 */

test.beforeEach(async ({ page }) => {
  await useOwnClientIp(page);
});

/**
 * Löst das Kontextmenü aus (wie „In neuem Tab öffnen“), bis der nachgeladene Beobachter den Link geändert hat. Ein
 * fester Handle statt eines Locators: Der Locator mit dem alten href träfe nach der Änderung einen anderen Link.
 */
async function hrefNachKontextmenue(link: ElementHandle): Promise<string> {
  await link.dispatchEvent('contextmenu');
  return safeDecode((await link.getAttribute('href')) ?? '');
}

test('Einstieg über Indeed: Bewerbungslink und WhatsApp tragen den Kanal, ohne Cookie und ohne Speicher', async ({ page }) => {
  await page.goto(`${JOB_PAGE_PATH}?utm_source=indeed&utm_medium=jobboard&utm_campaign=test`);

  // „Jetzt bewerben“ im Kopf führt auf /bewerbung (der Knopf der Stelle springt zum eingebetteten Flow).
  const bewerben = await page.locator('a[href="/bewerbung"]').first().elementHandle();
  if (!bewerben) throw new Error('kein Link auf /bewerbung');
  await expect.poll(() => hrefNachKontextmenue(bewerben), { message: 'Bewerbungslink mit Herkunft' }).toBe('/bewerbung?herkunft=ind');
  // Nur der Kanal geht mit, nie die Kampagne
  expect(await bewerben.getAttribute('href')).not.toMatch(/utm_|test/);

  const whatsapp = await page.locator('a[href^="https://api.whatsapp.com/send"]').first().elementHandle();
  if (!whatsapp) throw new Error('kein WhatsApp-Link');
  await expect.poll(() => hrefNachKontextmenue(whatsapp), { message: 'WhatsApp mit Code' }).toMatch(/\n– W-IND$/);

  expect(await page.context().cookies()).toEqual([]);
  const gespeichert = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(gespeichert).not.toMatch(/indeed|herkunft|utm|attribution/i);
});

test('neuer Tab mit ?herkunft=ind: die Bewerbung trägt den Kanal Indeed', async ({ page }, testInfo) => {
  let attribution: unknown = null;
  await page.route('**/api/bewerbung', async (route) => {
    attribution = (route.request().postDataJSON() as { attribution?: unknown }).attribution ?? null;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'SERVICE_UNAVAILABLE' }) });
  });

  await page.goto(`${PAGE_FLOW_PATH}&herkunft=ind`);
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await fillContact(flow);
  await taps.tap(submitButton(flow));

  await expect.poll(() => attribution, { message: 'Bewerbung abgeschickt' }).not.toBeNull();
  expect(attribution).toMatchObject({ utmSource: 'indeed', landingPath: '/bewerbung' });
  expect(attribution).not.toHaveProperty('utmCampaign');
});
